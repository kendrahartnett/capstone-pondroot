import {chromium,devices} from '@playwright/test';
const browser=await chromium.launch();
try{
 for(const [name,options] of [['desktop',{viewport:{width:1280,height:900}}],['mobile',devices['iPhone 13']]]){
  const context=await browser.newContext(options);const page=await context.newPage();
  await page.route('**/api/impact',route=>route.fulfill({json:{enabled:true,privacyEmail:'privacy@example.test'}}));
  await page.goto('http://127.0.0.1:3002/resume/edit');
  await page.getByLabel('Name',{exact:true}).fill('Élodie Sample');
  await page.getByRole('link',{name:'Review my résumé'}).click();
  await page.getByRole('button',{name:'I have reviewed this résumé'}).click();
  await page.getByRole('button',{name:'Prepare PDF',exact:true}).click();
  await page.getByRole('button',{name:'Download PDF',exact:true}).waitFor({state:'visible'});
  await page.screenshot({path:`test-results/rn2-${name}.png`,fullPage:true});
  await page.getByRole('button',{name:'Download PDF',exact:true}).click();
  await page.getByRole('dialog').evaluate(el=>{el.scrollTop=0;});
  await page.screenshot({path:`test-results/rn2-${name}-download.png`});
  await context.close();
 }
}finally{await browser.close();}
