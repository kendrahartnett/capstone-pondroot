export type ReviewedText = {id:string;text:string;included:boolean;origin:'user'|'ai'|'ai_edited';sourceRefs:{factId:string;factRevision:number}[];review:{state:'authored'|'accepted'|'needs_review';reviewedContentRevision:number|null}};
export type PartialDate = {year:number;month?:number};
export type Entry = {id:string;included:boolean;title?:string;organization?:string;location?:string;startDate?:PartialDate;endDate?:PartialDate;isCurrent:boolean;bullets:ReviewedText[];sourceFactIds:string[]};
export type Education = {id:string;included:boolean;credential?:ReviewedText;institution?:string;completionDate?:PartialDate;details:ReviewedText[];sourceFactIds:string[]};
export type Training = {id:string;included:boolean;kind:'training'|'certification';name?:ReviewedText;issuer?:string;completionDate?:PartialDate;expiryDate?:PartialDate;details:ReviewedText[];sourceFactIds:string[]};
export type Additional = {id:string;included:boolean;heading:string;entries:ReviewedText[]};
export type Draft = {contentRevision:number;contact:{displayName?:string;email?:string;phone?:string;cityRegion?:string;professionalLink?:string};introduction?:ReviewedText;skills:ReviewedText[];experiences:Entry[];education:Education[];training:Training[];additionalSections:Additional[];sourceFacts:{id:string;revision:number;text:string;topic:'experience'|'education'|'training'|'skill'|'other';origin:'user_entered'}[];sectionOrder:string[]};
export const emptyDraft = ():Draft => ({contentRevision:0,contact:{},skills:[],experiences:[],education:[],training:[],additionalSections:[],sourceFacts:[],sectionOrder:['contact','introduction','skills','experience','education','training','additional']});
export const authored = (text:string,existing?:ReviewedText):ReviewedText => existing&&existing.origin!=='user'
 ? {...existing,text,origin:'ai_edited',review:{state:'needs_review',reviewedContentRevision:null}}
 : {id:existing?.id??crypto.randomUUID(),text,included:existing?.included??true,origin:'user',sourceRefs:[],review:{state:'authored',reviewedContentRevision:null}};
export const supported = (item:ReviewedText,draft:Draft) => item.origin==='user' || (item.review.state==='accepted' && item.sourceRefs.length>0 && item.sourceRefs.every(ref=>draft.sourceFacts.some(fact=>fact.id===ref.factId&&fact.revision===ref.factRevision)));
export const acceptWording = (item:ReviewedText,draft:Draft):ReviewedText => ({...item,review:{state:'accepted',reviewedContentRevision:draft.contentRevision+1}});
export function removeBasedOnFact(draft:Draft,factId:string):Draft{
 const keep=(item:ReviewedText)=>!item.sourceRefs.some(ref=>ref.factId===factId);
 const experiences=draft.experiences.map(entry=>({...entry,sourceFactIds:entry.sourceFactIds.filter(id=>id!==factId),bullets:entry.bullets.filter(keep)})).filter(entry=>entry.title||entry.organization||entry.location||entry.startDate||entry.endDate||entry.bullets.length||entry.sourceFactIds.length);
 return {...draft,introduction:draft.introduction&&keep(draft.introduction)?draft.introduction:undefined,skills:draft.skills.filter(keep),experiences,
  education:draft.education.map(entry=>({...entry,sourceFactIds:entry.sourceFactIds.filter(id=>id!==factId),credential:entry.credential&&keep(entry.credential)?entry.credential:undefined,details:entry.details.filter(keep)})),
  training:draft.training.map(entry=>({...entry,sourceFactIds:entry.sourceFactIds.filter(id=>id!==factId),name:entry.name&&keep(entry.name)?entry.name:undefined,details:entry.details.filter(keep)})),
  additionalSections:draft.additionalSections.map(section=>({...section,entries:section.entries.filter(keep)}))};
}
export const dateText = (date?:PartialDate) => date ? `${date.month ? `${date.month}/` : ''}${date.year}` : '';
export const visible = (items:ReviewedText[]) => items.filter(item=>item.included&&item.text.trim());
