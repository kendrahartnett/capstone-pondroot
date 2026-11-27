// These checks contain obvious overstatements; they do not prove semantic truth.
export function passesObviousClaimCheck(text:string,evidence:string){
 const source=evidence.toLowerCase();
 const guarded=/\b(certified|certification|licensed|license|degree|diploma|ged|manager|supervisor|full.time|part.time|currently|completed|fluent|expert|advanced|certificado|certificación|licencia|gerente)\b/gi;
 if([...text.matchAll(guarded)].some(match=>!source.includes(match[0].toLowerCase())))return false;
 for(const term of ['volunteer','employee','contractor','unpaid','paid']){
  if(new RegExp('\\b'+term+'\\w*','i').test(text)&&!new RegExp('\\b'+term+'\\w*','i').test(evidence))return false;
 }
 for(const term of ['certified','licensed','fluent','supervisor','manager']){
  if(new RegExp('\\b'+term+'\\b','i').test(text)&&new RegExp('\\b(?:not|never) (?:\\w+ ){0,2}'+term+'\\b','i').test(evidence))return false;
 }
 if(/\b(?:setup|set up)\b/i.test(text)&&!/\b(?:setup|set up)\b/i.test(evidence))return false;
 return (text.match(/\d+(?:[.,]\d+)?%?/g)??[]).every(number=>source.includes(number));
}
