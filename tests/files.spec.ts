import {test,expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import {readFile} from 'node:fs/promises';
import {PDFDocument} from 'pdf-lib';
import {emptyDraft,authored} from '../app/resume/model';
import {parseDraft,serializeDraft} from '../app/resume/draft-file';

test('draft validates sparse, accented and hostile file cases',()=>{
 const d=emptyDraft();d.contact.displayName='Élodie Sample';d.skills=[authored('Room cleaning')];expect(parseDraft(serializeDraft(d))).toEqual({...d,introduction:undefined});
 for(const mutate of [(x:Record<string,unknown>)=>{x.schemaVersion=99;},(x:Record<string,unknown>)=>{x.extra='not allowed';}]){const x=JSON.parse(serializeDraft(d));mutate(x);expect(()=>parseDraft(JSON.stringify(x))).toThrow();}
 const duplicate={...d,skills:[d.skills[0],d.skills[0]]};expect(()=>parseDraft(serializeDraft(duplicate))).toThrow();expect(()=>parseDraft(' '.repeat(1048577))).toThrow();
 expect(()=>parseDraft(JSON.stringify({a:{a:{a:{a:{a:{a:{a:{a:{a:{a:1}}}}}}}}}}))).toThrow();
 const ai=JSON.parse(serializeDraft(d));ai.resume.skills[0].origin='ai';ai.resume.skills[0].review.state='accepted';expect(()=>parseDraft(JSON.stringify(ai))).toThrow();
 const withEvidence=emptyDraft();withEvidence.sourceFacts=[{id:'fact-1',revision:1,text:'I cleaned rooms.',topic:'experience',origin:'user_entered'}];withEvidence.skills=[{id:'skill-1',text:'Room cleaning',included:true,origin:'ai',sourceRefs:[{factId:'fact-1',factRevision:1}],review:{state:'accepted',reviewedContentRevision:1}}];expect(parseDraft(serializeDraft(withEvidence)).skills[0].review.state).toBe('needs_review');
 const forged=JSON.parse(serializeDraft(withEvidence));forged.resume.skills[0].sourceRefs[0].factId='missing';expect(()=>parseDraft(JSON.stringify(forged))).toThrow();
});

test('save, cancel replacement, clear and reopen without hidden storage',async({page})=>{
 await page.goto('/resume/edit');await page.getByLabel('Name',{exact:true}).fill('Élodie Sample');await page.getByText('Save or open a draft',{exact:true}).click();
 const event=page.waitForEvent('download');await page.getByRole('button',{name:'Save editable draft'}).click();const file=await event;const raw=await readFile((await file.path())!,'utf8');expect(parseDraft(raw).contact.displayName).toBe('Élodie Sample');
 const input=page.getByLabel('Open an editable draft');await input.setInputFiles({name:'invalid.json',mimeType:'application/json',buffer:Buffer.from('{}')});await expect(page.getByText('This file could not be opened.',{exact:false})).toBeVisible();
 await input.setInputFiles({name:'draft.json',mimeType:'application/json',buffer:Buffer.from(raw)});await page.getByRole('button',{name:'Cancel',exact:true}).click();await expect(page.getByLabel('Name',{exact:true})).toHaveValue('Élodie Sample');
 await page.getByRole('button',{name:'Clear this session'}).click();await page.getByRole('button',{name:'Clear my work'}).click();await expect(page.getByLabel('Name',{exact:true})).toHaveValue('');
 await input.setInputFiles({name:'draft.json',mimeType:'application/json',buffer:Buffer.from(raw)});await page.getByRole('button',{name:'Replace current work'}).click();await expect(page.getByLabel('Name',{exact:true})).toHaveValue('Élodie Sample');expect(await page.evaluate(()=>localStorage.length+sessionStorage.length)).toBe(0);
});

test('review has only Print and Download, with email only for download',async({page},info)=>{
 await page.goto('/resume/edit');await page.getByLabel('Name',{exact:true}).fill('Élodie Sample');await page.getByRole('button',{name:'Education',exact:true}).click();await page.getByRole('button',{name:'Add education'}).click();await page.getByLabel('Education or credential',{exact:true}).fill('GED');await page.getByRole('link',{name:'Review my résumé'}).click();
 await expect(page.getByRole('button',{name:'Prepare PDF'})).toHaveCount(0);await expect(page.getByRole('button',{name:'I have reviewed this résumé'})).toHaveCount(0);
 await page.evaluate(()=>{window.print=()=>{document.body.dataset.printRequested='yes';};});await page.getByRole('button',{name:'Print résumé'}).click();await expect(page.locator('body')).toHaveAttribute('data-print-requested','yes');await expect(page.getByRole('dialog')).not.toBeVisible();
 await page.getByRole('button',{name:'Download PDF'}).click();await expect(page.getByLabel('Email for this download')).toBeFocused({timeout:30000});await page.getByLabel('Email for this download').fill('sample@example.test');await page.getByRole('button',{name:'Cancel',exact:true}).click();await expect(page.getByRole('button',{name:'Download PDF'})).toBeFocused();
 await page.getByRole('button',{name:'Download PDF'}).click();await expect(page.getByLabel('Email for this download')).toHaveValue('');await page.getByLabel('Email for this download').fill('sample@example.test');const event=page.waitForEvent('download');await page.getByRole('button',{name:'Download my PDF'}).click();const file=await event;await file.saveAs(info.outputPath('resume.pdf'));expect((await PDFDocument.load(await readFile((await file.path())!))).getPageCount()).toBe(1);
 expect((await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa','wcag22aa']).analyze()).violations).toEqual([]);expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);await page.screenshot({path:info.outputPath('simple-review.png'),fullPage:true});
 await page.getByRole('link',{name:'Edit résumé'}).click();await page.getByLabel('Name',{exact:true}).fill('Changed Sample');await page.getByRole('link',{name:'Review my résumé'}).click();await expect(page.getByRole('complementary')).toContainText('Changed Sample');
});

test('long PDF and clean print keep all content',async({page},info)=>{
 const d=emptyDraft();d.contact.displayName='Élodie Sample';d.experiences=[{id:'job',included:true,isCurrent:false,title:'Housekeeping',startDate:{year:2020},sourceFactIds:[],bullets:Array.from({length:30},(_,i)=>authored(`Task ${i+1}: Cleaned rooms and changed linens. `.repeat(4)))}];
 await page.goto('/resume/edit');await page.getByText('Save or open a draft',{exact:true}).click();await page.getByLabel('Open an editable draft').setInputFiles({name:'draft.json',mimeType:'application/json',buffer:Buffer.from(serializeDraft(d))});await page.getByRole('button',{name:'Replace current work'}).click();await page.getByRole('link',{name:'Review my résumé'}).click();
 await page.getByRole('button',{name:'Download PDF'}).click();await page.getByLabel('Email for this download').fill('sample@example.test');const event=page.waitForEvent('download');await page.getByRole('button',{name:'Download my PDF'}).click();const file=await event;await file.saveAs(info.outputPath('long.pdf'));expect((await PDFDocument.load(await readFile((await file.path())!))).getPageCount()).toBeGreaterThan(1);
 await page.pdf({path:info.outputPath('print.pdf'),preferCSSPageSize:true});await page.getByRole('link',{name:'Edit résumé'}).click();await page.getByText('Save or open a draft',{exact:true}).click();await page.getByRole('button',{name:'Clear this session'}).click();await page.getByRole('button',{name:'Clear my work'}).click();await page.getByRole('link',{name:'Review my résumé'}).click();await expect(page.getByRole('complementary')).not.toContainText('Élodie Sample');
});

test('clearing during PDF preparation prevents a late download dialog',async({page})=>{
 await page.route('**/fonts/resume-regular.woff',async route=>{await new Promise(resolve=>setTimeout(resolve,800));await route.continue();});
 await page.goto('/resume/edit');await page.getByLabel('Name',{exact:true}).fill('Synthetic Sample');await page.getByRole('link',{name:'Review my résumé'}).click();
 const font=page.waitForRequest(r=>r.url().includes('/fonts/resume-regular.woff'));await page.getByRole('button',{name:'Download PDF'}).click();await font;
 await page.getByRole('link',{name:'Edit résumé'}).click();await page.getByText('Save or open a draft',{exact:true}).click();await page.getByRole('button',{name:'Clear this session'}).click();await page.getByRole('button',{name:'Clear my work'}).click();
 await expect(page.getByRole('dialog')).not.toBeVisible();await expect(page.getByLabel('Name',{exact:true})).toHaveValue('');
});
