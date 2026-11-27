import {expect,test} from '@playwright/test';

test('AI route stays unavailable until the activation gate is enabled',async({request})=>{
 const readiness=await request.get('/api/discover-skills');
 expect(readiness.status()).toBe(200);
 expect(await readiness.json()).toEqual({available:false});
 expect(readiness.headers()['cache-control']).toBe('no-store');

 const response=await request.post('/api/discover-skills',{
  headers:{Origin:'http://127.0.0.1:3102'},
  data:{schemaVersion:1,requestId:'a22475d6-cbda-4f7c-a3a3-556ac1bc8054',task:'skills_and_wording',selectedFacts:[{factId:'one',factRevision:1,text:'I cleaned rooms.'}],sourceContentRevision:1},
 });
 expect(response.status()).toBe(503);
 expect(await response.json()).toEqual({error:'Writing help is unavailable.'});
});
