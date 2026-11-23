import {dateText,visible,type Draft,type ReviewedText} from './model';
export type ResumeBlock={kind:'name'|'heading'|'body'|'bullet';text:string;edit:string};
export function resumeBlocks(d:Draft,es=false):ResumeBlock[]{
 const groups:Record<string,ResumeBlock[]>={};
 const text=(x?:ReviewedText)=>x?.included&&x.origin==='user'&&x.review.state==='authored'?x.text:'';
 const block=(kind:ResumeBlock['kind'],value:string|undefined,edit:string):ResumeBlock[]=>value?.trim()?[{kind,text:value,edit}]:[];
 const lines=(items:ReviewedText[],edit:string)=>visible(items).flatMap(x=>block('bullet',text(x),edit));
 const group=(key:string,title:string,edit:string,items:ResumeBlock[])=>{groups[key]=items.length?[...block('heading',title,edit),...items]:[];};
 groups.contact=[...block('name',d.contact.displayName,'Contact'),...block('body',[d.contact.email,d.contact.phone,d.contact.cityRegion].filter(Boolean).join(' · '),'Contact'),...block('body',/^https?:\/\/\S+$/i.test(d.contact.professionalLink??'')?d.contact.professionalLink:'','Contact')];
 group('introduction',es?'Perfil':'Introduction','Introduction',block('body',text(d.introduction),'Introduction'));
 group('skills',es?'Habilidades':'Skills','Skills',lines(d.skills,'Skills'));
 group('experience',es?'Experiencia':'Experience','Experience',d.experiences.filter(x=>x.included).flatMap(x=>[...block('body',x.title,'Experience'),...block('body',[x.organization,x.location].filter(Boolean).join(' · '),'Experience'),...block('body',[dateText(x.startDate),x.isCurrent?(es?'Actualidad':'Present'):dateText(x.endDate)].filter(Boolean).join(' – '),'Experience'),...lines(x.bullets,'Experience')]));
 group('education',es?'Educación':'Education','Education',d.education.filter(x=>x.included).flatMap(x=>[...block('body',text(x.credential),'Education'),...block('body',[x.institution,dateText(x.completionDate)].filter(Boolean).join(' · '),'Education'),...lines(x.details,'Education')]));
 group('training',es?'Capacitación y certificaciones':'Training and certifications','More',d.training.filter(x=>x.included).flatMap(x=>{const body=[...block('body',text(x.name),'More'),...block('body',x.issuer,'More'),...block('body',[dateText(x.completionDate),x.expiryDate?`${es?'Vence':'Expires'} ${dateText(x.expiryDate)}`:''].filter(Boolean).join(' · '),'More'),...lines(x.details,'More')];return body.length?[...block('body',x.kind==='certification'?(es?'Certificación':'Certification'):(es?'Capacitación':'Training'),'More'),...body]:[];}));
 groups.additional=d.additionalSections.filter(x=>x.included).flatMap(x=>{const body=lines(x.entries,'More');return body.length?[...block('heading',x.heading,'More'),...body]:[];});
 return d.sectionOrder.flatMap(key=>groups[key]??[]);
}
