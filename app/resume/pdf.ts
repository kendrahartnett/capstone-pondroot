import {PDFDocument,rgb,type PDFFont} from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';
import type {ResumeBlock} from './export-model';
export async function makePdf(blocks:ResumeBlock[]){
 const response=await fetch('/fonts/resume-regular.woff');if(!response.ok)throw new Error('The résumé font could not load. Try again.');
 const doc=await PDFDocument.create();doc.registerFontkit(fontkit);const font=await doc.embedFont(await response.arrayBuffer(),{subset:true});
 const supported=new Set(font.getCharacterSet());for(const b of blocks)for(const char of b.text){if(!/[\n\r\t]/.test(char)&&!supported.has(char.codePointAt(0)!))throw new Error('This PDF font cannot display a character in your résumé. Your text is unchanged. Use Print résumé, or edit the character.');}
 let page=doc.addPage([612,792]);let y=738;
 for(const b of blocks){const size=b.kind==='name'?22:b.kind==='heading'?13:11;const lineHeight=size*1.4;const gap=b.kind==='heading'?12:5;const lines=wrap((b.kind==='bullet'?'• ':'')+b.text,font,size,504);if(y-gap-lineHeight*(b.kind==='heading'?2:1)<54){page=doc.addPage([612,792]);y=738;}y-=gap;
 for(const line of lines){if(y-lineHeight<54){page=doc.addPage([612,792]);y=738;}page.drawText(line,{x:54,y:y-size,size,font,color:rgb(.08,.1,.09)});y-=lineHeight;}}
 doc.setTitle('Résumé');doc.setCreator('Pondroot');return new Blob([new Uint8Array(await doc.save())],{type:'application/pdf'});
}
function wrap(text:string,font:PDFFont,size:number,width:number){const result:string[]=[];for(const paragraph of text.replace(/\r\n?/g,'\n').replace(/\t/g,'    ').split('\n')){let line='';for(const char of paragraph){if(line&&font.widthOfTextAtSize(line+char,size)>width){const space=line.lastIndexOf(' ');if(space>line.length/2){result.push(line.slice(0,space));line=line.slice(space+1)+char;}else{result.push(line);line=char;}}else line+=char;}result.push(line);}return result;}
