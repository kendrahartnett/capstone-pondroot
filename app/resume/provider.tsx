'use client';
import {createContext,useContext,useState,useEffect, type ReactNode} from 'react';
import {emptyDraft,type Draft} from './model';
type Session={draft:Draft;update:(change:(draft:Draft)=>Draft)=>void;reviewed:number|null;review:()=>void;undo:()=>void;canUndo:boolean;error:string};
const Context=createContext<Session|null>(null);
export function ResumeProvider({children}:{children:ReactNode}){
 const [draft,setDraft]=useState<Draft>(emptyDraft);const [reviewed,setReviewed]=useState<number|null>(null);const [history,setHistory]=useState<Draft[]>([]);const [error,setError]=useState('');
 useEffect(()=>{if(!draft.contentRevision)return;const warn=(event:BeforeUnloadEvent)=>{event.preventDefault();event.returnValue='';};window.addEventListener('beforeunload',warn);return()=>window.removeEventListener('beforeunload',warn);},[draft.contentRevision]);
 return <Context.Provider value={{draft,reviewed,error,canUndo:history.length>0,undo:()=>{const previous=history.at(-1);if(previous){setDraft({...previous,contentRevision:draft.contentRevision+1});setHistory(history.slice(0,-1));setReviewed(null);setError('');}},review:()=>setReviewed(draft.contentRevision),update:change=>{const next=change(draft);const count=(next.introduction?1:0)+next.skills.length+next.experiences.reduce((n,x)=>n+x.bullets.length,0)+next.education.reduce((n,x)=>n+(x.credential?1:0)+x.details.length,0)+next.training.reduce((n,x)=>n+(x.name?1:0)+x.details.length,0)+next.additionalSections.reduce((n,x)=>n+x.entries.length,0);if(count>200){setError('This draft has reached its 200-item limit. Remove an unused item before adding another. Your existing work is unchanged.');return;}setHistory([...history.slice(-19),draft]);setDraft({...next,contentRevision:draft.contentRevision+1});setReviewed(null);setError('');}}}>{children}</Context.Provider>;
}
export function useResume(){const session=useContext(Context);if(!session)throw new Error('Missing résumé provider');return session;}
