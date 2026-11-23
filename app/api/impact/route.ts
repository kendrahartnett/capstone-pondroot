import 'server-only';
import {neon} from '@neondatabase/serverless';
import {z} from 'zod';

export const runtime='nodejs';
const consent=z.strictObject({email:z.email().max(254),consent:z.literal(true),version:z.literal('impact-v1')});
const response=(body:unknown,status=200)=>Response.json(body,{status,headers:{'Cache-Control':'no-store'}});
export function GET(){return response({enabled:process.env.IMPACT_ENABLED==='true'&&Boolean(process.env.IMPACT_DATABASE_URL)&&Boolean(process.env.IMPACT_PRIVACY_EMAIL),privacyEmail:process.env.IMPACT_PRIVACY_EMAIL||null});}
export async function POST(request:Request){
 const expectedOrigin=process.env.IMPACT_APP_ORIGIN||`${new URL(request.url).protocol}//${request.headers.get('host')}`;
 if(request.headers.get('origin')!==expectedOrigin)return response({error:'Request not allowed.'},403);
 if(!request.headers.get('content-type')?.startsWith('application/json'))return response({error:'Use JSON.'},415);
 if(process.env.IMPACT_ENABLED!=='true'||!process.env.IMPACT_DATABASE_URL||!process.env.IMPACT_PRIVACY_EMAIL)return response({error:'Follow-up is unavailable. You can download without it.'},503);
 try{
  const reader=request.body?.getReader();if(!reader)return response({error:'Missing choice.'},400);
  const chunks:Uint8Array[]=[];let size=0;
  while(true){const {value,done}=await reader.read();if(done)break;size+=value.length;if(size>2048){await reader.cancel();return response({error:'Request too large.'},413);}chunks.push(value);}
  const bytes=new Uint8Array(size);let offset=0;for(const chunk of chunks){bytes.set(chunk,offset);offset+=chunk.length;}
  const parsed=consent.safeParse(JSON.parse(new TextDecoder().decode(bytes)));if(!parsed.success)return response({error:'Check your email and permission.'},400);
  const sql=neon(process.env.IMPACT_DATABASE_URL);await sql`SELECT pondroot_impact.collect(${parsed.data.email}, ${parsed.data.version})`;
  return response({saved:true});
 }catch{return response({error:'We could not confirm saving your choice. Retry or download without follow-up.'},503);}
}
