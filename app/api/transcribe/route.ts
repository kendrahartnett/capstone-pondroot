import 'server-only';
import {neon} from '@neondatabase/serverless';
export const runtime='nodejs';
const reply=(body:unknown,status=200)=>Response.json(body,{status,headers:{'Cache-Control':'no-store'}});
const available=()=>process.env.PONDROOT_VOICE_ENABLED==='true'&&!!process.env.DEEPGRAM_API_KEY&&!!process.env.AI_DATABASE_URL;
export function GET(){return reply({available:available()});}
export async function POST(request:Request){
 if(!available())return reply({error:'unavailable'},503);
 if(request.headers.get('origin')!==(process.env.PONDROOT_VOICE_APP_ORIGIN||new URL(request.url).origin))return reply({error:'origin'},403);
 const id=request.headers.get('x-request-id'),language=new URL(request.url).searchParams.get('language');
 if(!id||! /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)||!['en','es'].includes(language||''))return reply({error:'request'},400);
 if(request.headers.get('content-type')!=='audio/wav')return reply({error:'format'},415);
 try{
  const reader=request.body?.getReader();if(!reader)return reply({error:'audio'},400);
  const parts:Uint8Array[]=[];let size=0;
  while(true){const {done,value}=await reader.read();if(done)break;size+=value.length;if(size>960044){await reader.cancel();return reply({error:'length'},413);}parts.push(value);}
  const bytes=Buffer.concat(parts);if(bytes.length<44)return reply({error:'audio'},400);
  // Canonical PCM16 mono 16kHz WAV only: server verifies actual duration before paying.
  if(bytes.toString('ascii',0,4)!=='RIFF'||bytes.readUInt32LE(4)!==size-8||bytes.toString('ascii',8,16)!=='WAVEfmt '||bytes.readUInt32LE(16)!==16||bytes.readUInt16LE(20)!==1||bytes.readUInt16LE(22)!==1||bytes.readUInt32LE(24)!==16000||bytes.readUInt32LE(28)!==32000||bytes.readUInt16LE(32)!==2||bytes.readUInt16LE(34)!==16||bytes.toString('ascii',36,40)!=='data'||bytes.readUInt32LE(40)!==size-44||(size-44)%2||size<16044)return reply({error:'audio'},400);
  let peak=0;for(let i=44;i<size;i+=2)peak=Math.max(peak,Math.abs(bytes.readInt16LE(i)));
  if(peak<100)return reply({transcript:''});
  const sql=neon(process.env.AI_DATABASE_URL!);
  const rows=await sql`SELECT pondroot_ai.reserve(${id}::uuid) AS allowed`;
  if(rows[0]?.allowed!==true)return reply({error:'limit'},429);
  const result=await fetch(`https://api.deepgram.com/v1/listen?model=nova-3&language=${language}&smart_format=true&mip_opt_out=true`,{method:'POST',headers:{Authorization:`Token ${process.env.DEEPGRAM_API_KEY}`,'Content-Type':'audio/wav'},body:bytes,cache:'no-store',signal:AbortSignal.any([request.signal,AbortSignal.timeout(25000)])});
  if(!result.ok)return reply({error:'unavailable'},503);
  const data=await result.json();const transcript=data?.results?.channels?.[0]?.alternatives?.[0]?.transcript;
  if(typeof transcript!=='string'||transcript.length>2000)return reply({error:'unavailable'},503);
  return reply({transcript});
 }catch{return reply({error:'unavailable'},503);}
}
