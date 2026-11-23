import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
import {neon} from '@neondatabase/serverless';
process.loadEnvFile('.env.local');
const admin=neon(process.env.IMPACT_ADMIN_DATABASE_URL);const app=neon(process.env.IMPACT_DATABASE_URL);
const email=`rn2-${randomUUID()}@example.test`;let passed=0;
try{
 await app`SELECT pondroot_impact.collect(${email},'impact-v1')`;
 const initial=await admin`SELECT id,email,consent_version,consented_at,delete_after FROM pondroot_impact.contacts WHERE email=${email}`;assert.equal(initial.length,1);assert.equal(initial[0].consent_version,'impact-v1');assert.equal(new Date(initial[0].delete_after)-new Date(initial[0].consented_at),89*86400000);passed++;
 await app`SELECT pondroot_impact.collect(${email},'impact-v1')`;const duplicate=await admin`SELECT consented_at,delete_after FROM pondroot_impact.contacts WHERE email=${email}`;assert.equal(duplicate.length,1);assert.equal(new Date(duplicate[0].delete_after).getTime(),new Date(initial[0].delete_after).getTime());passed++;
 await assert.rejects(app`SELECT email FROM pondroot_impact.contacts`);await assert.rejects(app`SELECT pondroot_impact.remove_contact(${email})`);passed++;
 await assert.rejects(app`SELECT pondroot_impact.collect(${email},'wrong-version')`);passed++;
 assert.equal((await admin`SELECT * FROM pondroot_impact.take_for_followup(${initial[0].id}::uuid)`).length,1);assert.equal((await admin`SELECT * FROM pondroot_impact.take_for_followup(${initial[0].id}::uuid)`).length,0);passed++;
 await app`SELECT pondroot_impact.collect(${email},'impact-v1')`;await admin`SELECT pondroot_impact.remove_contact(${email})`;assert.equal((await admin`SELECT id FROM pondroot_impact.contacts WHERE email=${email}`).length,0);passed++;
 await admin`INSERT INTO pondroot_impact.contacts(email,consent_version,consented_at,delete_after) VALUES(${email},'impact-v1',now()-interval '90 days',now()-interval '1 day')`;
 const deadline=Date.now()+75000;let remaining=1;
 while(remaining&&Date.now()<deadline){await new Promise(r=>setTimeout(r,2000));remaining=(await admin`SELECT id FROM pondroot_impact.contacts WHERE email=${email}`).length;}
 assert.equal(remaining,0,'Scheduled cleanup must remove the expired synthetic row');passed++;
 const origin=process.env.PLAYWRIGHT_BASE_URL||'http://127.0.0.1:3002';
 const result=await fetch(`${origin}/api/impact`,{method:'POST',headers:{origin,'Content-Type':'application/json'},body:JSON.stringify({email,consent:true,version:'impact-v1'})});
 assert.equal(result.status,200);assert.equal((await admin`SELECT id FROM pondroot_impact.contacts WHERE email=${email}`).length,1);passed++;
 console.log(`${passed}/8 live Neon checks passed: consent, idempotency, restricted privileges, validation, single claim, early deletion, scheduled expiry, real HTTP consent.`);
}finally{await admin`SELECT pondroot_impact.remove_contact(${email})`;}
