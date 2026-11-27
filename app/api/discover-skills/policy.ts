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
 // These are concrete extensions observed in live outputs, not professional tone.
 const extensions:[RegExp,RegExp][]=[
  [/\binventory|tracking\b/i,/\binventory|track(?:ed|ing)?\b/i],
  [/\bdistribution\b/i,/\bdistribut(?:e|ed|ion|ing)\b/i],
  [/\bdaily\b/i,/\bdaily|every day\b/i],
  [/\bregular(?:ly)?\b/i,/\bregular(?:ly)?\b/i],
  [/\btend(?:ed|ing)?\b/i,/\btend(?:ed|ing)?\b/i],
  [/\bother supplies\b/i,/\bother supplies\b/i],
  [/\bsafety basics\b/i,/\bsafety\b/i],
  [/\bongoing (?:learning|education)\b/i,/\bongoing\b/i],
  [/\bconversational\b/i,/\bconversational\b/i],
  [/\borganizing\b/i,/\borganiz(?:e|ed|ing|ation)\b/i],
 ];
 if(extensions.some(([claim,sourceTerm])=>claim.test(text)&&!sourceTerm.test(evidence)))return false;
 // A suggestion in the other language is confusing in a one-language draft.
 const spanishWords=/\b(?:experiencia|trabajador(?:a)?|persona|hablo|bilingüe|conocimientos|limpié|cuidado|recibiendo|atención|confiable|jardinería|diarias|básicos)\b/i;
 const englishSource=/\b(?:i|my|helped|worked|cleaned|speak|organized|attended|packed|cared|washed|folded|greeted)\b/i;
 if(englishSource.test(evidence)&&!spanishWords.test(evidence)&&spanishWords.test(text))return false;
 return (text.match(/\d+(?:[.,]\d+)?%?/g)??[]).every(number=>source.includes(number));
}

export function isAnchoredSuggestion(text:string,quote:string,source:string){
 return source.includes(quote)&&passesObviousClaimCheck(text,quote);
}
