'use client';
import {useResume} from './resume/provider';
import {useLanguage} from './language';
import Link from 'next/link';
export default function Home() {
 const {draft}=useResume(); const {es}=useLanguage();
 const t=(en:string,sp:string)=>es?sp:en;
 return <main id="main" tabIndex={-1}>
 <section className="hero rooted-hero" aria-labelledby="welcome"><div className="hero-copy">
 <p className="eyebrow" lang="en">Rooted Network</p>
 <h1 id="welcome">{t('Your experience matters.','Tu experiencia cuenta.')}</h1>
 <p className="intro">{t('Show employers what you can do.','Muestra lo que sabes hacer.')}</p>
 <Link className="button primary" href="/resume/start">{draft.contentRevision?t('Continue my résumé','Seguir con mi currículum'):t('Find my strengths','Descubrir mis habilidades')}</Link>
 <Link className="direct" href="/resume/edit">{t('Write my résumé','Crear mi currículum')}</Link>
 <p className="preview-note">{t('No account needed.','No necesitas una cuenta.')}</p>
 {es && <p className="language-note">Las herramientas aún están en inglés.</p>}
 </div></section>
 <section className="network-section" id="rooted-network"><p className="eyebrow" lang="en">Rooted Network</p><h2>{t('A path to work.','Un camino al empleo.')}</h2><p>{t('Employer connections are coming. Start with your résumé today.','Pronto podrás conectar con empleadores. Hoy puedes preparar tu currículum.')}</p></section>
 <section className="next-steps" aria-labelledby="steps"><h2 id="steps">{t('Need help?','¿Necesitas ayuda?')}</h2><div className="cards">
 <article className="card"><h3>{t('Documents','Documentos')}</h3><p>{t('Learn what you may need for work.','Conoce qué documentos podrías necesitar.')}</p><Link className="button secondary" href="/documents">{t('See document help','Ver ayuda con documentos')}</Link></article>
 <article className="card"><h3>{t('Hiring information','Información de contratación')}</h3><p>{t('Learn about ATS and applying online.','Conoce los sistemas ATS y cómo solicitar empleo en línea.')}</p><Link className="button secondary" href="/learn">{t('Explore hiring','Conocer el proceso')}</Link></article></div>
 <details className="help"><summary>{t('Will my work be saved?','¿Se guarda mi trabajo?')}</summary><p>{t('Your work stays in this tab. Closing or refreshing it can lose your work. Use Save editable draft in the résumé tools.','Tu trabajo permanece en esta pestaña. Si la cierras o actualizas, puedes perderlo. Usa la opción para guardar un borrador en las herramientas del currículum.')}</p></details>
 </section></main>;
}
