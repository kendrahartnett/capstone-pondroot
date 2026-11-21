'use client';
import {createContext, useContext, useState, useEffect} from 'react';
import {usePathname} from 'next/navigation';
const LanguageContext = createContext<{es:boolean;setEs:(value:boolean)=>void}>({es:false, setEs:()=>{}});
export function LanguageProvider({children}:{children:React.ReactNode}) {
 const [es,setEs]=useState(false);
 const path=usePathname();
 useEffect(()=>{document.documentElement.lang=es && path==='/' ? 'es' : 'en';},[es,path]);
 return <LanguageContext.Provider value={{es,setEs}}>{children}</LanguageContext.Provider>;
}
export const useLanguage=()=>useContext(LanguageContext);
export function LanguageSwitch(){const {es,setEs}=useLanguage();return <div className="language-switch" role="group" aria-label="Language / Idioma"><button type="button" lang="en" aria-pressed={!es} onClick={()=>setEs(false)}>English</button><button type="button" lang="es" aria-pressed={es} onClick={()=>setEs(true)}>Español</button></div>;}
