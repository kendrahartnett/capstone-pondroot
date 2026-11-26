import {test,expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
test('optional follow-up starts off, sends only consented fields, and failure preserves PDF',async({page},info)=>{
 await page.route('**/api/impact',async route=>{if(route.request().method()==='GET')await route.fulfill({json:{enabled:true,privacyEmail:'privacy@example.test'}});else await route.fulfill({status:503,json:{error:'Unavailable'}});});
 await page.goto('/resume/edit');await page.getByLabel('Name',{exact:true}).fill('Synthetic Sample');await page.getByRole('link',{name:'Review my résumé'}).click();await page.getByRole('button',{name:'Download PDF',exact:true}).click();await expect(page.getByRole('dialog')).toBeVisible({timeout:30000});
  const choice=page.getByRole('checkbox');await expect(choice).not.toBeChecked();await page.getByLabel('Email for this download').fill('synthetic@example.test');await choice.check();const sent=page.waitForRequest(r=>r.url().endsWith('/api/impact')&&r.method()==='POST');await page.getByRole('button',{name:'Download my PDF'}).click();expect((await sent).postDataJSON()).toEqual({email:'synthetic@example.test',consent:true,version:'impact-v1'});await expect(page.getByRole('dialog').getByRole('alert')).toContainText('could not confirm');
 expect((await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa','wcag22aa']).analyze()).violations).toEqual([]);await page.screenshot({path:info.outputPath('impact-dialog.png')});
 await choice.uncheck();let posts=0;page.on('request',r=>{if(r.url().endsWith('/api/impact')&&r.method()==='POST')posts++;});const downloaded=page.waitForEvent('download');await page.getByRole('button',{name:'Download my PDF'}).click();await downloaded;expect(posts).toBe(0);await expect(page.getByRole('dialog')).not.toBeVisible();
});
test('impact endpoint rejects cross-origin and extra personal data',async({request,baseURL})=>{
 const foreign=await request.post('/api/impact',{headers:{origin:'https://example.test'},data:{email:'synthetic@example.test',consent:true,version:'impact-v1'}});expect(foreign.status()).toBe(403);
 const extra=await request.post('/api/impact',{headers:{origin:baseURL!},data:{email:'synthetic@example.test',consent:true,version:'impact-v1',resume:'Do not collect'}});expect([400,503]).toContain(extra.status());
});
