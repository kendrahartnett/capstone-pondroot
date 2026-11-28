/* eslint-disable @typescript-eslint/no-require-imports -- facilitated local study launcher */
const {chromium}=require('@playwright/test');

async function main(){
 const base=process.env.PONDROOT_STUDY_URL||'http://127.0.0.1:3002';
 const selfTest=process.argv.includes('--self-test');
 const url=new URL(base);
 if(!['127.0.0.1','localhost'].includes(url.hostname))throw Error('Study preview must use a local server');
 const browser=await chromium.launch({headless:selfTest});
 const context=await browser.newContext({viewport:{width:390,height:844},locale:'en-US'});
 await context.addInitScript(()=>{
  window.addEventListener('DOMContentLoaded',()=>{
   if(document.getElementById('study-notice'))return;
   const note=document.createElement('div');note.id='study-notice';note.setAttribute('role','note');
   note.textContent='TEST SESSION — synthetic AI suggestions; no live AI call';
   note.style.cssText='position:fixed;bottom:0;left:0;right:0;z-index:99999;padding:8px;background:#d6fa2d;color:#07170f;font:600 14px sans-serif;text-align:center';
   document.body.append(note);
  });
 });
 await context.route('**/api/discover-skills',async route=>{
  if(route.request().method()==='GET')return route.fulfill({json:{available:true}});
  const facts=route.request().postDataJSON()?.selectedFacts||[];
  const fact=facts[0];
  if(!fact)return route.fulfill({status:400,json:{error:'Choose an example.'}});
  const sourceRefs=[{factId:fact.factId,factRevision:fact.factRevision}];
  return route.fulfill({json:{suggestions:[
   {id:'study-supported-intro',destination:'introduction',text:'Reliable worker with experience maintaining clean, orderly spaces.',sourceRefs},
   {id:'study-supported-skill',destination:'skill',text:'Room cleaning and linen changing',sourceRefs},
   {id:'study-false-claim',destination:'experience_bullet',text:'Certified housekeeping supervisor with five years of management experience.',sourceRefs}
  ]}});
 });
 const page=await context.newPage();
 await page.goto(new URL('/resume/experience',url).toString());
 if(selfTest){
  await page.getByLabel('Something I did').fill('I cleaned rooms and changed linens.');
  await page.getByRole('button',{name:'Add to my story'}).click();
  await page.getByRole('button',{name:'Build my résumé with AI'}).click();
  await page.getByRole('checkbox',{name:/Example 1/}).check();
  await page.getByRole('button',{name:'Continue with these words'}).click();
  await page.getByText('Certified housekeeping supervisor with five years of management experience.').waitFor();
  await browser.close();console.log('Synthetic study preview self-test passed; no live AI call.');return;
 }
 console.log('Local synthetic study preview opened. Close the browser window to finish.');
 await new Promise(resolve=>browser.on('disconnected',resolve));
}
main().catch(error=>{console.error('Study preview failed: '+error.message);process.exitCode=1;});
