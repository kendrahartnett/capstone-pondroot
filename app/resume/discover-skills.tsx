'use client';

import Link from 'next/link';
import {useState} from 'react';
import {useLanguage} from '../language';
import {useResume} from './provider';
import './resume.css';

export function DiscoverSkills() {
  const {draft, update} = useResume();
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
    setNotice(t('Your example was added. It is not in your résumé yet.', 'Se agregó tu ejemplo. Todavía no está en tu currículum.'));
  }

  function saveEdit(id: string) {
    const text = editText.trim();
    if (!text) return;
    update(current => ({
      ...current,
      sourceFacts: current.sourceFacts.map(fact => fact.id === id ? {...fact, text, revision: fact.revision + 1} : fact)
    }));
    setEditing(null);
    setNotice(t('Your example was updated.', 'Se actualizó tu ejemplo.'));
  }

  return <main id="main" tabIndex={-1} className="tool-page discovery-page">
    <p className="eyebrow">DiscoverSkills</p>
    <h1>{t('Tell us about something you did', 'Cuéntanos algo que hiciste')}</h1>
    <p>{t('Work, school, helping someone, or caring for others can count. What did you do?', 'Puede ser del trabajo, la escuela, algo que hiciste para ayudar o cuidar a alguien. ¿Qué hiciste?')}</p>
    <p>{t('Use your own words. Leave out any detail you do not want to share.', 'Usa tus propias palabras. No incluyas detalles que no quieras compartir.')}</p>
    <label className="resume-field" htmlFor="discovery-answer">
      <span>{t('Something I did', 'Algo que hice')}</span>
      <textarea id="discovery-answer" rows={5} maxLength={2000} value={answer} onChange={event => setAnswer(event.target.value)} />
    </label>
    <button type="button" disabled={!answer.trim() || facts.length >= 100} onClick={confirm}>
      {t('Confirm this example', 'Confirmar este ejemplo')}
    </button>
    <p className="preview-note">{t('You can add another example or continue at any time.', 'Puedes agregar otro ejemplo o continuar cuando quieras.')}</p>
    {notice && <p role="status">{notice}</p>}

    {facts.length > 0 && <section aria-labelledby="confirmed-examples" className="discovery-examples">
      <h2 id="confirmed-examples">{t('My confirmed examples', 'Mis ejemplos confirmados')}</h2>
      <p>{t('These notes stay separate from your résumé. You choose what to include.', 'Estas notas no aparecen en tu currículum. Tú decides qué incluir.')}</p>
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
              update(current => ({...current, sourceFacts: current.sourceFacts.filter(item => item.id !== fact.id)}));
              setNotice(t('Example removed.', 'Se eliminó el ejemplo.'));
            }}>{t('Remove', 'Eliminar')} {index + 1}</button>
          </div>
        </>}
      </li>)}</ol>
    </section>}

    <div className="start-actions">
      <Link className="button primary" href="/resume/edit">{t('Continue to my résumé', 'Continuar a mi currículum')}</Link>
      <Link href="/resume/edit">{t('Skip for now', 'Omitir por ahora')}</Link>
    </div>
  </main>;
}
