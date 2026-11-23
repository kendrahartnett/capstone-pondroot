import {z} from 'zod';
import type {Draft} from './model';

const id=z.string().regex(/^[A-Za-z0-9_-]{1,64}$/);
const revision=z.number().int().nonnegative().safe();
const date=z.strictObject({year:z.number().int().min(1900).max(2100),month:z.number().int().min(1).max(12).optional()});
const text=z.strictObject({id,text:z.string().max(2000),included:z.boolean(),origin:z.literal('user'),sourceRefs:z.array(z.strictObject({factId:id,factRevision:revision.min(1)})).max(20),review:z.strictObject({state:z.literal('authored'),reviewedContentRevision:z.null()})});
const short=z.string().max(200).optional();
const base={id,included:z.boolean(),sourceFactIds:z.array(id).max(100)};
const schema=z.strictObject({
 kind:z.literal('pondroot.editable-draft'),schemaVersion:z.literal(1),contentRevision:revision,
 resume:z.strictObject({
 contact:z.strictObject({displayName:short,email:z.string().max(254).optional(),phone:z.string().max(80).optional(),cityRegion:short,professionalLink:z.string().max(2048).optional()}),
 introduction:text.optional(),skills:z.array(text).max(30),
 experiences:z.array(z.strictObject({...base,title:short,organization:short,location:short,startDate:date.optional(),endDate:date.optional(),isCurrent:z.boolean(),bullets:z.array(text).max(30)})).max(20),
 education:z.array(z.strictObject({...base,credential:text.optional(),institution:short,completionDate:date.optional(),details:z.array(text).max(30)})).max(20),
 training:z.array(z.strictObject({...base,kind:z.enum(['training','certification']),name:text.optional(),issuer:short,completionDate:date.optional(),expiryDate:date.optional(),details:z.array(text).max(30)})).max(20),
 additionalSections:z.array(z.strictObject({id,included:z.boolean(),heading:z.string().max(120),entries:z.array(text).max(30)})).max(5),
 sectionOrder:z.array(z.enum(['contact','introduction','skills','experience','education','training','additional'])).max(7)
 }),
 sourceFacts:z.array(z.strictObject({id,revision:revision.min(1),text:z.string().max(2000),topic:z.enum(['experience','education','training','skill','other']),origin:z.literal('user_entered')})).max(100),
 review:z.strictObject({reviewedContentRevision:revision.nullable()})
});
export function serializeDraft(draft:Draft){
 const {contentRevision,sourceFacts,...resume}=draft;
 return JSON.stringify({kind:'pondroot.editable-draft',schemaVersion:1,contentRevision,resume,sourceFacts,review:{reviewedContentRevision:null}},null,2);
}
export function parseDraft(raw:string):Draft{
 if(new TextEncoder().encode(raw).length>1048576)throw new Error('Choose a draft smaller than 1 MB.');
 const value:unknown=JSON.parse(raw);
 const depth=(v:unknown,n=0):void=>{if(n>8)throw new Error('This file is too complex.');if(v&&typeof v==='object')Object.values(v).forEach(x=>depth(x,n+1));};depth(value);
 const file=schema.parse(value);const ids=new Set<string>();let count=0;
 const walk=(v:unknown):void=>{if(!v||typeof v!=='object')return;if('id' in v){const key=(v as {id:string}).id;if(ids.has(key))throw new Error('This draft has duplicate items.');ids.add(key);}if('review' in v)count++;Object.values(v).forEach(x=>Array.isArray(x)?x.forEach(walk):walk(x));};walk(file.resume);walk(file.sourceFacts);
 if(count>200||new Set(file.resume.sectionOrder).size!==file.resume.sectionOrder.length)throw new Error('This draft exceeds its limits.');
 const facts=new Map(file.sourceFacts.map(f=>[f.id,f.revision]));
 const refs=(v:unknown):void=>{if(!v||typeof v!=='object')return;const obj=v as Record<string,unknown>;if(Array.isArray(obj.sourceFactIds)&&obj.sourceFactIds.some(x=>!facts.has(x)))throw new Error('Missing source facts.');if(Array.isArray(obj.sourceRefs)&&obj.sourceRefs.some(x=>facts.get(x.factId)!==x.factRevision))throw new Error('Outdated source facts.');Object.values(obj).forEach(x=>Array.isArray(x)?x.forEach(refs):refs(x));};refs(file.resume);
 return {...file.resume,sourceFacts:file.sourceFacts,contentRevision:file.contentRevision};
}
