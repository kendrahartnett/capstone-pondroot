'use client';
import {useRef,useState} from 'react';
import {useResume} from './provider';
export function ClearSession(){const {clear}=useResume();const [open,setOpen]=useState(false);const trigger=useRef<HTMLButtonElement>(null);return <><button ref={trigger} onClick={()=>setOpen(true)}>Clear this session</button>{open&&<div className="file-confirm"><p>Clear your work from this tab? Save an editable draft first if you need it. Downloaded files remain on your device.</p><div className="file-buttons"><button onClick={()=>{clear();setOpen(false);trigger.current?.focus();}}>Clear my work</button><button onClick={()=>{setOpen(false);trigger.current?.focus();}}>Keep working</button></div></div>}</>;}
