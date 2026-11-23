'use client';
import {createContext,useContext,useState,useEffect,useRef, type ReactNode} from 'react';
import {emptyDraft,type Draft} from './model';
type Session={draft:Draft;generation:number;replace:(draft:Draft)=>void;clear:()=>void;isCurrent:(draft:Draft,generation:number)=>boolean;update:(change:(draft:Draft)=>Draft)=>void;reviewed:number|null;review:()=>void;undo:()=>void;canUndo:boolean;error:string};
const Context=createContext<Session|null>(null);
export function ResumeProvider({children}:{children:ReactNode}){
 const [draft,setDraft]=useState<Draft>(emptyDraft);const [reviewed,setReviewed]=useState<number|null>(null);const [history,setHistory]=useState<Draft[]>([]);const [error,setError]=useState('');
 const [generation,setGeneration]=useState(0);const live=useRef<{draft:Draft|null;generation:number}>({draft:null,generation:0});
 useEffect(()=>{live.current={draft,generation};},[draft,generation]);
 function replace(value:Draft){const next={...value,contentRevision:draft.contentRevision+1};live.current={draft:next,generation:generation+1};setGeneration(generation+1);setDraft(next);setHistory([]);setReviewed(null);setError('');}
 useEffect(()=>{if(!draft.contentRevision)return;const warn=(event:BeforeUnloadEvent)=>{event.preventDefault();event.returnValue='';};window.addEventListener('beforeunload',warn);return()=>window.removeEventListener('beforeunload',warn);},[draft.contentRevision]);
 return <Context.Provider value={{draft,generation,replace,clear:()=>replace(emptyDraft()),isCurrent:(value,gen)=>live.current.draft===value&&live.current.generation===gen,reviewed,error,canUndo:history.length>0,undo:()=>{const previous=history.at(-1);if(previous){const value={...previous,contentRevision:draft.contentRevision+1};live.current={draft:value,generation};setDraft(value);setHistory(history.slice(0,-1));setReviewed(null);setError('');}},review:()=>setReviewed(draft.contentRevision),update:change=>{const next=change(draft);const count=(next.introduction?1:0)+next.skills.length+next.experiences.reduce((n,x)=>n+x.bullets.length,0)+next.education.reduce((n,x)=>n+(x.credential?1:0)+x.details.length,0)+next.training.reduce((n,x)=>n+(x.name?1:0)+x.details.length,0)+next.additionalSections.reduce((n,x)=>n+x.entries.length,0);if(count>200){setError('This draft has reached its 200-item limit. Remove an unused item before adding another. Your existing work is unchanged.');return;}setHistory([...history.slice(-19),draft]);const value={...next,contentRevision:draft.contentRevision+1};live.current={draft:value,generation};setDraft(value);setReviewed(null);setError('');}}}>{children}</Context.Provider>;
}
export function useResume(){const session=useContext(Context);if(!session)throw new Error('Missing résumé provider');return session;}
