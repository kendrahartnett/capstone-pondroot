'use client';
import {useEffect,useRef,useState} from 'react';
import Link from 'next/link';
import {useResume} from './provider';
import {resumeBlocks,type ResumeBlock} from './export-model';
import {DownloadDialog} from './download-dialog';
import {useLanguage,useText} from '../language';

export function ResumePaper({blocks}:{blocks:ResumeBlock[]}){return <div className="resume-paper output-paper">{blocks.map((b,i)=>b.kind==='name'?<h2 key={i}>{b.text}</h2>:b.kind==='heading'?<h3 key={i}>{b.text}</h3>:<p key={i}>{b.kind==='bullet'?'• ':''}{b.text}</p>)}</div>;}

export function FileActions(){
 const {draft,generation,isCurrent}=useResume();const {es}=useLanguage();const t=useText();
 const [pdf,setPdf]=useState<{blob:Blob;revision:number;language:'en'|'es'}|null>(null),[busy,setBusy]=useState(false),[message,setMessage]=useState('');
 const dialog=useRef<HTMLDialogElement>(null),trigger=useRef<HTMLButtonElement>(null),operation=useRef(0);
 useEffect(()=>()=>{operation.current++;},[]);
 const language=es?'es':'en',blocks=resumeBlocks(draft,es),currentPdf=pdf?.revision===draft.contentRevision&&pdf.language===language?pdf:null;
 async function downloadPdf(){
  if(busy)return;
  if(currentPdf){dialog.current?.showModal();return;}
  const token=++operation.current;setBusy(true);setMessage(t('Preparing your PDF…','Preparando tu PDF…'));
  try{const {makePdf}=await import('./pdf');const blob=await makePdf(blocks);
   if(token!==operation.current||!isCurrent(draft,generation))return;
   setPdf({blob,revision:draft.contentRevision,language});setMessage('');
   setTimeout(()=>{if(token===operation.current&&isCurrent(draft,generation))dialog.current?.showModal();},0);
  }catch(error){if(token===operation.current&&isCurrent(draft,generation))setMessage(es?'No se pudo preparar el PDF. Tu trabajo sigue aquí.':error instanceof Error?error.message:'PDF could not be prepared. Your work is still here.');}
  finally{if(token===operation.current)setBusy(false);}
 }
 return <section id="resume-files" className="file-actions" aria-label={t('Résumé files','Archivos del currículum')}>
  <h2>{t('Ready to use your résumé?','¿Quieres usar tu currículum?')}</h2>
  <p>{t('Check the résumé above. Print needs no email. Download asks for an email.','Revisa el currículum de arriba. Imprimir no requiere correo. Descargar pide un correo.')}</p>
  <div className="file-buttons"><button ref={trigger} type="button" disabled={busy} onClick={downloadPdf}>{busy?t('Preparing PDF…','Preparando PDF…'):t('Download PDF','Descargar PDF')}</button><button type="button" onClick={()=>{setMessage(t('Print window requested. You can cancel and keep working.','Se abrió la ventana de impresión. Puedes cancelar y seguir trabajando.'));window.print();}}>{t('Print résumé','Imprimir currículum')}</button></div>
  <p role="status">{message}</p>
  <details><summary>{t('Where will my file go?','¿Dónde estará mi archivo?')}</summary><p>{t('Look in Downloads or Files on your device. Attach the PDF where the employer asks. Attaching a file does not submit your application.','Busca en Descargas o Archivos en tu dispositivo. Adjunta el PDF donde lo pida el empleador. Adjuntar un archivo no envía la solicitud.')}</p><p>{t('Your print window may offer Save as PDF. Turn off browser headers and footers for a clean résumé.','La ventana de impresión puede ofrecer Guardar como PDF. Desactiva los encabezados y pies de página del navegador.')}</p></details>
  <DownloadDialog dialog={dialog} trigger={trigger} blob={currentPdf?.blob??null} isCurrent={()=>!!currentPdf&&isCurrent(draft,generation)} onMessage={setMessage}/>
  <details><summary>{t('What comes next?','¿Qué sigue?')}</summary><p><Link href="/learn">{t('Help with applying','Ayuda para solicitar empleo')}</Link> · <Link href="/#rooted-network">{t('Explore Rooted Network','Explorar Rooted Network')}</Link></p></details>
  <div className="print-only"><ResumePaper blocks={blocks}/></div>
 </section>;
}
