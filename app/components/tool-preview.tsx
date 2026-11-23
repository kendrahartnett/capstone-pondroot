'use client';
import Link from 'next/link';
import {useLanguage,useText} from '../language';
export function ToolPreview({title,titleEs,children,childrenEs}:{title:string;titleEs:string;children:React.ReactNode;childrenEs:React.ReactNode}) {
 const {es}=useLanguage();const t=useText();
 return <main id="main" tabIndex={-1} className="tool-page"><Link className="back" href="/">← {t('Back to my next steps','Volver a mis próximos pasos')}</Link><div className="tool-panel"><p className="eyebrow">{t('Foundation preview','Vista previa')}</p><h1>{t(title,titleEs)}</h1>{es?childrenEs:children}<p className="availability">{t('This tool is not available yet. This page lets you explore the navigation while Pondroot is being built.','Esta herramienta aún no está disponible. Esta página te permite explorar Pondroot mientras seguimos construyéndolo.')}</p><Link className="button secondary" href="/">{t('Return to my next steps','Volver a mis próximos pasos')}</Link></div></main>;
}
