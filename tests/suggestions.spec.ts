import {test,expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('professional reframing enters the résumé only after individual confirmation',async({page})=>{
 const wording='Reliable worker with experience maintaining clean, orderly spaces.';
 await page.route('**/api/discover-skills',route=>{
  if(route.request().method()==='GET')return route.fulfill({json:{available:true}});
  const fact=route.request().postDataJSON().selectedFacts[0];
  return route.fulfill({json:{suggestions:[{id:'professional',destination:'introduction',text:wording,sourceRefs:[{factId:fact.factId,factRevision:fact.factRevision}]}]}});
 });
 await page.goto('/resume/experience');await page.getByLabel('Something I did').fill('I cleaned rooms and changed linens.');await page.getByRole('button',{name:'Add to my story'}).click();
 await page.getByRole('button',{name:'Build my résumé with AI'}).click();await page.getByRole('checkbox',{name:/Example 1/}).check();await page.getByRole('button',{name:'Continue with these words'}).click();
 await expect(page.getByRole('button',{name:'Use checked parts'})).toBeDisabled();await expect(page.getByLabel('Draft wording')).toHaveValue(wording);
 await page.getByRole('checkbox',{name:'Use this in my résumé'}).check();await page.getByRole('button',{name:'Use checked parts'}).click();
 await page.getByRole('link',{name:'Continue to my résumé'}).click();await page.getByRole('link',{name:'Review my résumé'}).click();await expect(page.getByRole('complementary')).toContainText(wording);
});

test('one AI draft accepts only checked, supported parts and excludes contact',async({page},info)=>{
 const sent:unknown[]=[];
 await page.route('**/api/discover-skills',async route=>{
  if(route.request().method()==='GET')return route.fulfill({json:{available:true}});
  const body=route.request().postDataJSON();sent.push(body);const sourceRefs=[{factId:body.selectedFacts[0].factId,factRevision:1}];
  return route.fulfill({json:{suggestions:[
   {id:'intro',destination:'introduction',text:'Reliable worker with experience maintaining clean, orderly spaces.',sourceRefs},
   {id:'skill',destination:'skill',text:'Room cleaning',sourceRefs},
   {id:'task',destination:'experience_bullet',text:'Cleaned rooms and changed linens.',sourceRefs},
   {id:'bad',destination:'skill',text:'Certified cleaning expert',sourceRefs:[{factId:'missing',factRevision:1}]}
  ]}});
 });
 await page.goto('/resume/edit');await page.getByLabel('Name',{exact:true}).fill('Synthetic Person');await page.getByLabel('Email',{exact:true}).fill('private@example.test');await page.getByRole('navigation',{name:'Main navigation'}).getByRole('link',{name:'My résumé'}).click();await page.getByRole('link',{name:'Tell me about yourself'}).click();
 await page.getByLabel('Something I did').fill('I cleaned rooms and changed linens.');await page.getByRole('button',{name:'Add to my story'}).click();
 await page.getByRole('button',{name:'Build my résumé with AI'}).click();expect(sent).toHaveLength(0);await page.screenshot({path:info.outputPath('consent.png'),fullPage:true});
 await expect(page.getByRole('button',{name:'Continue with these words'})).toBeDisabled();
 await page.getByRole('checkbox',{name:/Example 1/}).check();
 await expect(page.getByRole('button',{name:'Continue with these words'})).toBeEnabled();await page.getByRole('button',{name:'Continue with these words'}).click();
 expect(sent).toHaveLength(1);expect(Object.keys(sent[0] as object).sort()).toEqual(['requestId','schemaVersion','selectedFacts','sourceContentRevision','task']);
 expect((sent[0] as {selectedFacts:{text:string}[]}).selectedFacts.map(f=>f.text)).toEqual(['I cleaned rooms and changed linens.']);
 expect(JSON.stringify(sent[0])).not.toContain('private@example.test');expect(JSON.stringify(sent[0])).not.toContain('Synthetic Person');
 await expect(page.getByText('Certified cleaning expert')).toHaveCount(0);
 await expect(page.getByRole('heading',{name:'Here is a draft'})).toBeVisible();
 await page.getByRole('article').filter({has:page.getByRole('heading',{name:'Skill',exact:true})}).getByRole('checkbox').check();
 await page.getByRole('article').filter({has:page.getByRole('heading',{name:'What I did'})}).getByRole('checkbox').check();
 await page.getByRole('button',{name:'Use checked parts'}).click();await page.getByRole('link',{name:'Continue to my résumé'}).click();
 await page.getByRole('link',{name:'Review my résumé'}).click();const preview=page.getByRole('complementary',{name:'Résumé preview'});
 await expect(preview).toContainText('Room cleaning');await expect(preview).toContainText('Cleaned rooms and changed linens.');await expect(preview).not.toContainText('Reliable worker with experience maintaining clean, orderly spaces.');
 expect((await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa','wcag22aa']).analyze()).violations).toEqual([]);
 await page.getByRole('link',{name:'Edit résumé'}).click();await page.getByRole('button',{name:'Skills',exact:true}).click();await page.getByLabel('Skill 1').fill('Cleaning rooms and linens');
 await page.getByRole('link',{name:'Review my résumé'}).click();await expect(page.getByRole('complementary')).not.toContainText('Cleaning rooms and linens');
 await page.getByRole('link',{name:'Edit résumé'}).click();await page.getByRole('button',{name:'Skills',exact:true}).click();await page.getByRole('button',{name:'Use this wording'}).click();await page.getByRole('link',{name:'Review my résumé'}).click();await expect(page.getByRole('complementary')).toContainText('Cleaning rooms and linens');
 await page.getByRole('navigation',{name:'Main navigation'}).getByRole('link',{name:'My résumé'}).click();await page.getByRole('link',{name:'Tell me about yourself'}).click();
 await page.getByRole('button',{name:'Edit 1'}).click();await page.getByLabel('Edit example 1').fill('I changed linens.');await page.getByRole('button',{name:'Save change'}).click();
 await page.getByRole('link',{name:'Continue to my résumé'}).click();await page.getByRole('link',{name:'Review my résumé'}).click();await expect(page.getByRole('complementary')).not.toContainText('Cleaning rooms and linens');await expect(page.getByRole('complementary')).not.toContainText('Cleaned rooms and changed linens.');
});

test('disabled AI service never receives story text',async({page})=>{
 const requests:string[]=[];page.on('request',r=>{if(r.url().includes('/api/discover-skills')&&r.method()==='POST')requests.push(r.url());});
 await page.goto('/resume/experience');await page.getByLabel('Something I did').fill('I helped set up a room.');await page.getByRole('button',{name:'Add to my story'}).click();
 await page.getByRole('button',{name:'Build my résumé with AI'}).click();await expect(page.getByRole('button',{name:'Continue with these words'})).toBeDisabled();
 await expect(page.getByText('AI writing is not available yet.')).toBeVisible();await page.getByRole('button',{name:'Cancel'}).click();expect(requests).toHaveLength(0);
});

test('contact information inside a story blocks AI send',async({page})=>{
 let posts=0;await page.route('**/api/discover-skills',route=>{if(route.request().method()==='POST')posts++;return route.fulfill({json:{available:true}});});
 await page.goto('/resume/experience');await page.getByLabel('Something I did').fill('I cleaned rooms. Reach me at private@example.test.');await page.getByRole('button',{name:'Add to my story'}).click();await page.getByRole('button',{name:'Build my résumé with AI'}).click();await page.getByRole('checkbox',{name:/Example 1/}).check();
 await expect(page.getByRole('button',{name:'Continue with these words'})).toBeDisabled();await expect(page.getByText('Remove email addresses and phone numbers',{exact:false})).toBeVisible();expect(posts).toBe(0);
});
