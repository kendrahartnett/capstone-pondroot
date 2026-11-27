'use client';
import {useEffect,useRef,useState} from 'react';

function wav(chunks:Float32Array[]){
 const length=chunks.reduce((n,c)=>n+c.length,0),buffer=new ArrayBuffer(44+length*2),v=new DataView(buffer);
 const text=(offset:number,s:string)=>{for(let i=0;i<s.length;i++)v.setUint8(offset+i,s.charCodeAt(i));};
 text(0,'RIFF');v.setUint32(4,36+length*2,true);text(8,'WAVEfmt ');v.setUint32(16,16,true);v.setUint16(20,1,true);v.setUint16(22,1,true);v.setUint32(24,16000,true);v.setUint32(28,32000,true);v.setUint16(32,2,true);v.setUint16(34,16,true);text(36,'data');v.setUint32(40,length*2,true);
 let offset=44;for(const c of chunks)for(const sample of c){v.setInt16(offset,Math.max(-1,Math.min(1,sample))*32767,true);offset+=2;}
 return buffer;
}
type Session={abort:AbortController;stream?:MediaStream;context?:AudioContext;node?:AudioWorkletNode;timer?:ReturnType<typeof setTimeout>;chunks:Float32Array[]};
function release(s:Session){clearTimeout(s.timer);s.node?.disconnect();s.stream?.getTracks().forEach(t=>t.stop());void s.context?.close().catch(()=>{});}
export function VoiceInput({es,onTranscript}:{es:boolean;onTranscript:(text:string)=>void}){
 const [ready,setReady]=useState(false),[state,setState]=useState<'idle'|'starting'|'recording'|'sending'>('idle'),[notice,setNotice]=useState('');
 const active=useRef<Session|null>(null),receive=useRef(onTranscript);
 const t=(en:string,sp:string)=>es?sp:en;
 useEffect(()=>{receive.current=onTranscript;},[onTranscript]);
 useEffect(()=>{const abort=new AbortController();fetch('/api/transcribe',{signal:abort.signal}).then(r=>r.json()).then(d=>setReady(d.available===true&&!!navigator.mediaDevices?.getUserMedia&&!!window.AudioContext)).catch(()=>{});return()=>{abort.abort();const s=active.current;active.current=null;if(s){s.abort.abort();release(s);}};},[]);
 function cancel(){const s=active.current;active.current=null;if(s){s.abort.abort();release(s);}setState('idle');setNotice(t('Recording canceled.','Grabación cancelada.'));}
 async function finish(s:Session){
  if(active.current!==s)return;release(s);setState('sending');
  try{
   const result=await fetch(`/api/transcribe?language=${es?'es':'en'}`,{method:'POST',headers:{'Content-Type':'audio/wav','X-Request-Id':crypto.randomUUID()},body:wav(s.chunks),signal:s.abort.signal});s.chunks=[];
   if(!result.ok)throw new Error(result.status===429?'limit':'service');
   const data=await result.json();if(active.current!==s)return;
   if(data.transcript){receive.current(data.transcript);setNotice(t('Check the words, then add them to your story.','Revisa las palabras y agrégalas a tu historia.'));}else setNotice(t('No words were heard. Try again or type.','No se escucharon palabras. Inténtalo otra vez o escribe.'));
  }catch(error){if(active.current!==s)return;setNotice(error instanceof Error&&error.message==='limit'?t('Voice has reached its limit. You can type.','La voz llegó a su límite. Puedes escribir.'):t('Could not turn audio into words. Try again or type.','No se pudo convertir el audio en palabras. Inténtalo otra vez o escribe.'));}
  if(active.current===s){active.current=null;setState('idle');}
 }
 async function start(){
  if(active.current)return;const s:Session={abort:new AbortController(),chunks:[]};active.current=s;setState('starting');setNotice('');
  try{
   const stream=await navigator.mediaDevices.getUserMedia({audio:{channelCount:1,echoCancellation:true},video:false});
   if(active.current!==s){stream.getTracks().forEach(t=>t.stop());return;}s.stream=stream;
   s.context=new AudioContext({sampleRate:16000});await s.context.audioWorklet.addModule('/audio/recorder.js');
   if(active.current!==s)return;
   s.node=new AudioWorkletNode(s.context,'pondroot-recorder');s.node.port.onmessage=e=>{if(active.current===s)s.chunks.push(e.data);};
   s.context.createMediaStreamSource(stream).connect(s.node);s.node.connect(s.context.destination);await s.context.resume();
   if(active.current!==s)return;setState('recording');s.timer=setTimeout(()=>void finish(s),30000);
  }catch{if(active.current!==s)return;release(s);active.current=null;setState('idle');setNotice(t('Microphone could not start. Allow microphone access, then try again. You can type.','No se pudo iniciar el micrófono. Permite su uso e inténtalo otra vez. Puedes escribir.'));}
 }
 return <div className="voice-input">
  {ready?<><p>{t('Speak sends audio to Deepgram to make text. No audio is saved by Pondroot. Up to 30 seconds.','Hablar envía audio a Deepgram para crear texto. Pondroot no guarda el audio. Hasta 30 segundos.')}</p>
   <button type="button" disabled={state==='starting'||state==='sending'} onClick={()=>state==='recording'?void finish(active.current!):void start()}>{state==='recording'?t('Stop and use words','Parar y usar palabras'):t('Speak','Hablar')}</button>
   {state!=='idle'&&<button type="button" onClick={cancel}>{t('Cancel','Cancelar')}</button>}
  </>:<p>{t('Voice is unavailable right now. You can type.','La voz no está disponible ahora. Puedes escribir.')}</p>}
  <p role="status">{state==='recording'?t('Listening… Stop when you are done.','Escuchando… Para cuando termines.'):state==='starting'?t('Allow your microphone…','Permite el micrófono…'):state==='sending'?t('Turning your voice into words…','Convirtiendo tu voz en palabras…'):notice}</p>
 </div>;
}
