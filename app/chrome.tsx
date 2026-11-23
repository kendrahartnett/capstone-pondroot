'use client';
import {useEffect} from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {LanguageSwitch,useLanguage,useText} from './language';
import {Navigation} from './navigation';
import {usePathname} from 'next/navigation';
export function SiteChrome({children}:{children:React.ReactNode}){
 const {es}=useLanguage();const t=useText();const path=usePathname();
 const titles:Record<string,[string,string]>={'/':['Pondroot — A stronger start. A clearer path.','Pondroot — Un comienzo más fuerte. Un camino más claro.'],'/resume/start':['Start your résumé | Pondroot','Comienza tu currículum | Pondroot'],'/resume/experience':['Your experience | Pondroot','Tu experiencia | Pondroot'],'/resume/edit':['Write your résumé | Pondroot','Crea tu currículum | Pondroot'],'/resume/preview':['Review your résumé | Pondroot','Revisa tu currículum | Pondroot'],'/documents':['Check my documents | Pondroot','Revisa tus documentos | Pondroot'],'/learn':['Transparent Hiring Information | Pondroot','Información clara sobre contratación | Pondroot']};const title=(titles[path]??['Page not found | Pondroot','Página no encontrada | Pondroot'])[es?1:0];
 useEffect(()=>{
  const applyTitle=()=>{if(document.title!==title)document.title=title;};
  applyTitle();
  const observer=new MutationObserver(applyTitle);
  observer.observe(document.head,{childList:true,subtree:true,characterData:true});
  return()=>observer.disconnect();
 },[title]);
 return <><a className="skip" href="#main">{t('Skip to main content','Saltar al contenido principal')}</a><header className="header"><div className="brand-row"><Link href="/" aria-label={t('Pondroot home','Inicio de Pondroot')}><Image src="/brand/pondroot-wordmark.png" width={2172} height={724} alt="Pondroot" className="wordmark" priority /></Link><LanguageSwitch /></div><Navigation /></header><div lang={es?'es':'en'}>{children}</div><footer><Link href="/" aria-label={t('Pondroot home','Inicio de Pondroot')}><Image src="/brand/pondroot-wordmark.png" width={2172} height={724} alt="Pondroot" className="wordmark" /></Link><p>Rooted Network</p></footer></>;
}
