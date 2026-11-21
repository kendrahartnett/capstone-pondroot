'use client';
import Link from 'next/link';
import {usePathname} from 'next/navigation';
import {useLanguage} from './language';
export function Navigation(){
 const path=usePathname(); const {es}=useLanguage();
 const links=[['/',es?'Inicio':'Home'],['/resume/start',es?'Mi currículum':'My résumé'],['/#rooted-network','Rooted Network'],['/documents',es?'Documentos':'Documents'],['/learn',es?'Contratación':'Hiring information']];
 return <nav lang={es?'es':'en'} aria-label={es?'Navegación principal':'Main navigation'}>{links.map(([href,label])=><Link key={href} href={href} aria-current={!href.includes('#')&&(href==='/'?path==='/':path.startsWith(href.split('/').slice(0,2).join('/')))?'page':undefined}>{label}</Link>)}</nav>;
}
