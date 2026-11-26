'use client';
import {useRef,useState} from 'react';
import {useLanguage} from '../language';
import {useResume} from './provider';
import type {ReviewedText} from './model';

type Candidate={id:string;text:string;destination:'introduction'|'skill'|'experience_bullet';sourceRefs:{factId:string;factRevision:number}[]};
export function Suggestions(){
 const {draft,generation,isCurrent,update}=useResume();const {es}=useLanguage();const t=(en:string,sp:string)=>es?sp:en;
 const [selected,setSelected]=useState<string[]>([]),[open,setOpen]=useState(false),[available,setAvailable]=useState(false),[busy,setBusy]=useState(false);
 const [error,setError]=useState(''),[items,setItems]=useState<Candidate[]>([]),[chosen,setChosen]=useState<string[]>([]),[edits,setEdits]=useState<Record<string,string>>({}),[notice,setNotice]=useState('');const pending=useRef(0);
 const facts=draft.sourceFacts.filter(f=>selected.includes(f.id));const total=facts.reduce((n,f)=>n+f.text.length,0);
 const hasContact=facts.some(f=>/[^\s@]+@[^\s@]+\.[^\s@]+|\+?\d[\d\s().-]{7,}\d/.test(f.text));
 const selectedItems=items.filter(item=>chosen.includes(item.id));
 const itemCount=(draft.introduction?1:0)+draft.skills.length+draft.experiences.reduce((n,x)=>n+x.bullets.length,0)+draft.education.reduce((n,x)=>n+(x.credential?1:0)+x.details.length,0)+draft.training.reduce((n,x)=>n+(x.name?1:0)+x.details.length,0)+draft.additionalSections.reduce((n,x)=>n+x.entries.length,0);
 const overLimit=selectedItems.filter(item=>item.destination==='skill').length>30-draft.skills.length||selectedItems.filter(item=>item.destination==='introduction').length>1||itemCount+selectedItems.length>200;
 const current=(item:Candidate)=>item.sourceRefs.length>0&&item.sourceRefs.every(ref=>draft.sourceFacts.some(f=>f.id===ref.factId&&f.revision===ref.factRevision));
 const room=(item:Candidate)=>item.destination==='introduction'?!draft.introduction:item.destination==='skill'?draft.skills.length<30:draft.experiences.length<20;
 async function prepare(){setOpen(true);setSelected(draft.sourceFacts.slice(0,20).map(f=>f.id));setItems([]);setError('');setNotice('');try{const response=await fetch('/api/discover-skills',{cache:'no-store'});setAvailable((await response.json()).available===true);}catch{setAvailable(false);}}
 async function send(){
  if(!available||!facts.length||facts.length>20||total>12000||hasContact)return;
  const serial=++pending.current,source=draft,sourceGeneration=generation;setBusy(true);setError('');
  try{const response=await fetch('/api/discover-skills',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({schemaVersion:1,requestId:crypto.randomUUID(),task:'skills_and_wording',selectedFacts:facts.map(f=>({factId:f.id,factRevision:f.revision,text:f.text})),sourceContentRevision:draft.contentRevision})});
   if(!response.ok)throw Error('unavailable');const result:unknown=await response.json();if(serial!==pending.current||!isCurrent(source,sourceGeneration))return;
   if(!result||typeof result!=='object'||!('suggestions' in result)||!Array.isArray(result.suggestions))throw Error('invalid');
   const valid=(result.suggestions as unknown[]).slice(0,12).filter((value):value is Candidate=>{if(!value||typeof value!=='object')return false;const item=value as Partial<Candidate>;return typeof item.id==='string'&&typeof item.text==='string'&&!!item.text.trim()&&item.text.length<=2000&&['introduction','skill','experience_bullet'].includes(item.destination??'')&&Array.isArray(item.sourceRefs)&&item.sourceRefs.length>0&&item.sourceRefs.length<=20&&item.sourceRefs.every(ref=>ref&&typeof ref==='object'&&typeof ref.factId==='string'&&Number.isSafeInteger(ref.factRevision)&&facts.some(f=>f.id===ref.factId&&f.revision===ref.factRevision));});
   setItems(valid);setChosen([]);setEdits({});setOpen(false);if(!valid.length)setError(t('No supported wording came back. You can keep writing by hand.','No llegaron palabras con respaldo. Puedes seguir escribiendo por tu cuenta.'));
  }catch{if(serial===pending.current)setError(t('Writing help is unavailable. Your examples are still here.','La ayuda para escribir no está disponible. Tus ejemplos siguen aquí.'));}finally{if(serial===pending.current)setBusy(false);}
 }
 function useChosen(){
  const usable=items.filter(item=>chosen.includes(item.id)&&current(item)&&room(item)&&(edits[item.id]??item.text).trim());if(!usable.length||overLimit)return;
  update(d=>{
   const make=(item:Candidate):ReviewedText=>({id:crypto.randomUUID(),text:(edits[item.id]??item.text).trim(),included:true,origin:edits[item.id]===undefined||edits[item.id]===item.text?'ai':'ai_edited',sourceRefs:item.sourceRefs,review:{state:'accepted',reviewedContentRevision:d.contentRevision+1}});
   const intro=usable.find(item=>item.destination==='introduction');const skills=usable.filter(item=>item.destination==='skill').slice(0,Math.max(0,30-d.skills.length));const bullets=usable.filter(item=>item.destination==='experience_bullet');
   const experience=bullets.length?{id:crypto.randomUUID(),included:true,isCurrent:false,bullets:bullets.map(make),sourceFactIds:[...new Set(bullets.flatMap(item=>item.sourceRefs.map(ref=>ref.factId)))]}:null;
   return {...d,introduction:intro&&!d.introduction?make(intro):d.introduction,skills:[...d.skills,...skills.map(make)],experiences:experience?[...d.experiences,experience]:d.experiences};
  });setItems([]);setChosen([]);setNotice(t('Your chosen wording is in your résumé. Review it before you use it.','Las palabras que elegiste están en tu currículum. Revísalas antes de usarlo.'));
 }
 const label=(kind:Candidate['destination'])=>({introduction:t('About me','Sobre mí'),skill:t('Skill','Habilidad'),experience_bullet:t('What I did','Lo que hice')})[kind];
 return <section className="discovery-examples" aria-labelledby="writing-help-title"><h2 id="writing-help-title">{t('Ready for a draft?','¿Listo para un borrador?')}</h2>
  <p>{t('AI can help write it. You choose what to use.','La IA puede ayudarte a escribirlo. Tú eliges qué usar.')}</p>
  <button type="button" disabled={!draft.sourceFacts.length} onClick={prepare}>{t('Build my résumé with AI','Crear mi currículum con IA')}</button>
  {open&&<div className="tool-panel"><h3>{t('Check your words','Revisa tus palabras')}</h3><p>{t('Only checked words go to AI. Your contact details stay here.','Solo las palabras marcadas se envían a la IA. Tus datos de contacto se quedan aquí.')}</p>
   {draft.sourceFacts.map((fact,index)=><label key={fact.id} className="discovery-select"><input type="checkbox" checked={selected.includes(fact.id)} onChange={e=>setSelected(ids=>e.target.checked?[...ids,fact.id]:ids.filter(id=>id!==fact.id))}/> {t('Example','Ejemplo')} {index+1}: {fact.text}</label>)}
   {(facts.length>20||total>12000)&&<p role="alert">{t('Choose fewer examples.','Elige menos ejemplos.')}</p>}
   {hasContact&&<p role="alert">{t('Remove email addresses and phone numbers from your story before sending it to AI.','Quita los correos y números de teléfono de tu historia antes de enviarla a la IA.')}</p>}
   {!available&&<p role="status">{t('AI writing is not available yet. You can still write your résumé yourself.','La ayuda de IA aún no está disponible. Puedes escribir tu currículum por tu cuenta.')}</p>}
   <div className="discovery-actions"><button type="button" disabled={!available||!facts.length||facts.length>20||total>12000||hasContact||busy} onClick={send}>{busy?t('Writing…','Escribiendo…'):t('Continue with these words','Continuar con estas palabras')}</button><button type="button" onClick={()=>{pending.current++;setOpen(false);setBusy(false);}}>{t('Cancel','Cancelar')}</button></div></div>}
  {error&&<p role="alert">{error}</p>}{notice&&<p role="status">{notice}</p>}
  {!!items.length&&<div className="draft-suggestions"><h3>{t('Here is a draft','Aquí tienes un borrador')}</h3><p>{t('Check each part that matches what you really did. You can change the words. Leave anything uncertain unchecked.','Marca cada parte que refleje lo que hiciste. Puedes cambiar las palabras. Deja sin marcar lo que no sepas.')}</p>
   {items.map(item=><article className="tool-panel" key={item.id}><h4>{label(item.destination)}</h4><label className="discovery-select"><input type="checkbox" checked={chosen.includes(item.id)} disabled={!current(item)||!room(item)} onChange={e=>setChosen(ids=>e.target.checked?[...ids,item.id]:ids.filter(id=>id!==item.id))}/> {t('Use this in my résumé','Usar esto en mi currículum')}</label><p>{t('From your words:','De tus palabras:')} {item.sourceRefs.map(ref=>draft.sourceFacts.find(f=>f.id===ref.factId)?.text).filter(Boolean).join(' · ')}</p><label className="resume-field"><span>{t('Draft wording','Palabras del borrador')}</span><textarea rows={3} maxLength={2000} value={edits[item.id]??item.text} onChange={e=>setEdits(all=>({...all,[item.id]:e.target.value}))}/></label>{!current(item)&&<p role="alert">{t('Your example changed. This part cannot be used.','Cambió tu ejemplo. Esta parte no se puede usar.')}</p>}{!room(item)&&<p>{t('This section is already full. Edit your résumé to make room.','Esta sección ya está llena. Edita tu currículum para hacer espacio.')}</p>}</article>)}
   {overLimit&&<p role="alert">{t('Choose fewer parts for this section.','Elige menos partes para esta sección.')}</p>}
   <div className="discovery-actions"><button type="button" disabled={overLimit||!items.some(item=>chosen.includes(item.id)&&current(item)&&room(item)&&(edits[item.id]??item.text).trim())} onClick={useChosen}>{t('Use checked parts','Usar partes marcadas')}</button><button type="button" onClick={()=>{setItems([]);setChosen([]);}}>{t('Leave all out','No incluir ninguna')}</button></div></div>}
 </section>;
}
