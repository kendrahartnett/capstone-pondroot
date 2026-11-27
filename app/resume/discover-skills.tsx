'use client';

import Link from 'next/link';
import {useState} from 'react';
import {useLanguage} from '../language';
import {useResume} from './provider';
import {removeBasedOnFact} from './model';
import {Suggestions} from './suggestions';
import {VoiceInput} from './voice-input';
import './resume.css';

export function DiscoverSkills() {
  const {draft, update, generation} = useResume();
  const {es} = useLanguage();
  const [answer, setAnswer] = useState('');
  const [editing, setEditing] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [notice, setNotice] = useState('');
  const t = (en: string, spanish: string) => es ? spanish : en;
  const facts = draft.sourceFacts;

  function confirm() {
    const text = answer.trim();
    if (!text || facts.length >= 100) return;
    update(current => ({
      ...current,
      sourceFacts: [...current.sourceFacts, {
        id: crypto.randomUUID(), revision: 1, text, topic: 'experience', origin: 'user_entered'
      }]
    }));
    setAnswer('');
    setNotice(t('Added to your story.', 'Se agregó a tu historia.'));
  }

  function saveEdit(id: string) {
    const text = editText.trim();
    if (!text) return;
    update(current => ({...removeBasedOnFact(current,id),sourceFacts:current.sourceFacts.map(fact=>fact.id===id?{...fact,text,revision:fact.revision+1}:fact)}));
    setEditing(null);
    setNotice(t('Your example was updated. Wording based on its old version was removed from the résumé.', 'Se actualizó tu ejemplo. Se quitaron del currículum las palabras basadas en la versión anterior.'));
  }

  return <main id="main" tabIndex={-1} className="tool-page discovery-page">
    <p className="eyebrow">DiscoverSkills</p>
    <h1>{t('Tell me what you have done', 'Cuéntame qué has hecho')}</h1>
    <p>{t('Tell me about work, school, or helping others. What did you do? Leave out private details.', 'Cuéntame del trabajo, la escuela o cómo ayudaste a otros. ¿Qué hiciste? Omite los datos privados.')}</p>
    <details><summary>{t('Need an idea?','¿Necesitas una idea?')}</summary><p>{t('You could start with a task: “I cleaned rooms and changed linens.” Write only what you really did.','Puedes empezar con una tarea: «Limpié habitaciones y cambié las sábanas». Escribe solo lo que realmente hiciste.')}</p></details>
    <label className="resume-field" htmlFor="discovery-answer">
      <span>{t('Something I did', 'Algo que hice')}</span>
      <textarea id="discovery-answer" rows={5} maxLength={2000} value={answer} onChange={event => setAnswer(event.target.value)} />
    </label>
    <VoiceInput key={`${es?'es':'en'}-${generation}`} es={es} onTranscript={text=>setAnswer(current=>((current?current+' ':'')+text).slice(0,2000))}/>
    <button type="button" disabled={!answer.trim() || facts.length >= 100} onClick={confirm}>
      {t('Add to my story', 'Agregar a mi historia')}
    </button>
    {notice && <p role="status">{notice}</p>}

    {facts.length > 0 && <section aria-labelledby="confirmed-examples" className="discovery-examples">
      <h2 id="confirmed-examples">{t('Your story so far', 'Tu historia hasta ahora')}</h2>
      <ol>{facts.map((fact, index) => <li key={fact.id}>
        {editing === fact.id ? <>
          <label className="resume-field" htmlFor={`edit-fact-${fact.id}`}>
            <span>{t('Edit example', 'Editar ejemplo')} {index + 1}</span>
            <textarea id={`edit-fact-${fact.id}`} rows={4} maxLength={2000} value={editText} onChange={event => setEditText(event.target.value)} />
          </label>
          <div className="discovery-actions">
            <button type="button" disabled={!editText.trim()} onClick={() => saveEdit(fact.id)}>{t('Save change', 'Guardar cambio')}</button>
            <button type="button" onClick={() => setEditing(null)}>{t('Cancel', 'Cancelar')}</button>
          </div>
        </> : <>
          <p>{fact.text}</p>
          <div className="discovery-actions">
            <button type="button" onClick={() => {setEditing(fact.id); setEditText(fact.text); setNotice('');}}>{t('Edit', 'Editar')} {index + 1}</button>
            <button type="button" onClick={() => {
              update(current => ({...removeBasedOnFact(current,fact.id),sourceFacts:current.sourceFacts.filter(item=>item.id!==fact.id)}));
              setNotice(t('Example and wording based on it were removed.', 'Se eliminaron el ejemplo y las palabras basadas en él.'));
            }}>{t('Remove', 'Eliminar')} {index + 1}</button>
          </div>
        </>}
      </li>)}</ol>
    </section>}

    <Suggestions/>
    <div className="start-actions">
      <Link className="button primary" href="/resume/edit">{t('Continue to my résumé', 'Continuar a mi currículum')}</Link>
    </div>
  </main>;
}
