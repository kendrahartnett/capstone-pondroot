// Local operator tool. Never expose the admin connection through a web route.
import {neon} from '@neondatabase/serverless';
import {createInterface} from 'node:readline/promises';
import {stdin,stdout} from 'node:process';
try{process.loadEnvFile('.env.local');}catch{}
const url=process.env.IMPACT_ADMIN_DATABASE_URL;if(!url)throw new Error('Configure the operator database connection locally.');
const sql=neon(url);const prompt=createInterface({input:stdin,output:stdout});
try{
 const action=process.argv[2];
 if(action==='health'){const rows=await sql`SELECT last_success FROM pondroot_impact.cleanup_health`;console.log(rows);}
 else if(action==='list'){console.log(await sql`SELECT id,consented_at,delete_after FROM pondroot_impact.contacts WHERE delete_after>now() ORDER BY consented_at`);}
 else if(action==='delete'){const email=await prompt.question('Email from the deletion request: ');const confirmation=await prompt.question('Delete this address from impact follow-up? Type DELETE: ');if(confirmation==='DELETE'){await sql`SELECT pondroot_impact.remove_contact(${email})`;console.log('Request processed. No email address printed or retained by this tool.');}}
 else if(action==='take'){const id=await prompt.question('Contact ID from list: ');const confirmation=await prompt.question('Take this contact for ONE manual follow-up and remove it now? Type TAKE: ');if(confirmation==='TAKE'){const rows=await sql`SELECT * FROM pondroot_impact.take_for_followup(${id}::uuid)`;if(rows.length)console.log('Send at most once, then clear this terminal:',rows[0].email);else console.log('No active contact. Do not send or retry from an old copy.');}}
 else console.log('Use: node scripts/impact-admin.mjs health | list | delete | take');
}catch{console.error('Operation could not be confirmed. Check the database before retrying.');process.exitCode=1;}finally{prompt.close();}
