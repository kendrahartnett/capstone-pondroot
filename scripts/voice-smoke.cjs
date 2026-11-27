/* eslint-disable @typescript-eslint/no-require-imports */
// Manual synthetic-audio check; at most three provider calls, never run by CI.
const {chromium}=require('@playwright/test');
const fs=require('node:fs');
const path=require('node:path');
(async()=>{
 const dir=path.resolve('docs/planning/voice-evaluation');fs.mkdirSync(dir,{recursive:true});
 const ledger=path.join(dir,'calls.json');const calls=fs.existsSync(ledger)?JSON.parse(fs.readFileSync(ledger)).calls:0;
 if(calls>=3)throw Error('Three-call voice test cap reached');
 const browser=await chromium.launch({args:['--use-fake-ui-for-media-stream','--use-fake-device-for-media-stream',`--use-file-for-fake-audio-capture=${path.join(dir,'english.wav')}`]});
 try{
  const page=await browser.newPage();await page.goto('http://127.0.0.1:3003/resume/experience');
  await page.getByRole('button',{name:'Speak',exact:true}).click();
  await page.getByRole('button',{name:'Stop and use words'}).waitFor();await page.waitForTimeout(7000);
  const response=page.waitForResponse(r=>r.url().includes('/api/transcribe?'));
  fs.writeFileSync(ledger,JSON.stringify({calls:calls+1,maxCalls:3,reservedDollars:(calls+1)*.05}));
  await page.getByRole('button',{name:'Stop and use words'}).click();
  const result=await response,data=await result.json();
  if(result.status()!==200||!/cleaned rooms/i.test(data.transcript))throw Error(`Transcription failed: ${result.status()} ${JSON.stringify(data)}`);
  await page.getByRole('status').filter({hasText:'Check the words'}).waitFor();
  const answer=await page.getByLabel('Something I did').inputValue();
  if(!answer.includes(data.transcript))throw Error('Transcript did not reach editable answer');
  if(await page.getByRole('heading',{name:'Your story so far'}).count())throw Error('Unconfirmed words entered story');
  await page.screenshot({path:path.join(dir,'desktop.png'),fullPage:true});
  await page.setViewportSize({width:390,height:844});await page.screenshot({path:path.join(dir,'mobile.png'),fullPage:true});
  fs.writeFileSync(path.join(dir,'result.json'),JSON.stringify({status:result.status(),transcript:data.transcript,editable:true,unconfirmed:true},null,2));
  console.log('Live transcription succeeded:',data.transcript);
 }finally{await browser.close();}
})().catch(e=>{console.error(e.message);process.exitCode=1;});
