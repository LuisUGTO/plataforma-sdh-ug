(function(root){
'use strict';
// A vector PDF with an explicit physical page. It never rescales browser print output.
const MM=72/25.4,W=594,H=420;
const C={blue:'#004B87',sky:'#69B3E7',text:'#54585A',line:'#CED9E3',teal:'#008E95',purple:'#84369B',orange:'#E66D42',green:'#319356'};
const norm=s=>String(s??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
const num=v=>v!==null&&v!==undefined&&String(v).trim()!==''&&!String(v).includes('*')&&Number.isFinite(Number(v))?Number(v):null;
const div=(a,b)=>{a=num(a);b=num(b);return a!==null&&b>0&&a>=0&&a<=b?a/b:null;};
const fmt=(v,d=0)=>num(v)===null?'Dato no disponible':Number(v).toLocaleString('es-MX',{minimumFractionDigits:d,maximumFractionDigits:d});
const pct=v=>v===null||v===undefined?'Dato no disponible':(v*100).toFixed(1)+'%';
const I=root.SDH_INDICADORES||(typeof require==='function'?require('./indicadores.js'):null);
const ICONS=root.SDH_ICONOGRAFIA||(typeof require==='function'?require('./iconografia.js'):null);
const FONTS=root.SDH_TIPOGRAFIA||(typeof require==='function'?require('./tipografia.js'):null);
const refs=[
 ['Consejo Nacional de Evaluación de la Política de Desarrollo Social. (2021).','Índice de Rezago Social 2020: Anexos','[Conjunto de datos].','https://www.coneval.org.mx/Medicion/IRS/Paginas/Indice_de_Rezago_Social_2020_anexos.aspx'],
 ['Consejo Nacional de Población. (2021).','Índices de marginación 2020','[Conjunto de datos]. Gobierno de México.','https://www.gob.mx/conapo/documentos/indices-de-marginacion-2020-284372'],
 ['Instituto Nacional de Estadística y Geografía. (2021a).','Censo de Población y Vivienda 2020: Principales resultados por localidad (ITER)','[Conjunto de datos].','https://www.inegi.org.mx/programas/ccpv/2020/#datos_abiertos'],
 ['Instituto Nacional de Estadística y Geografía. (2021b).','Marco geoestadístico. Censo de Población y Vivienda 2020','[Conjunto de datos].','https://www.inegi.org.mx/app/biblioteca/ficha.html?upc=889463807469'],
 ['Instituto Nacional de los Pueblos Indígenas. (s.f.).','Catálogo Nacional de Pueblos y Comunidades Indígenas y Afromexicanas.','','https://catalogo.inpi.gob.mx/cedulas/'],
 ['Secretaría del Nuevo Comienzo. (s.f.).','Monografías de las comunidades indígenas del estado de Guanajuato.','Gobierno del Estado de Guanajuato.','https://portalsocial.guanajuato.gob.mx/alcance/localidad']
];
// All measurements use the same institutional font files embedded in the PDF.
function charWidth(c,style){const role=style===true?'bold':style||'normal',metrics=FONTS?.[role]?.widths;if(!metrics)throw Error('Falta la tipografía institucional '+role+'. Revisa tipografia.js.');return metrics[winCode(c)]??metrics[63];}
function winCode(c){const special={'–':150,'—':151,'’':146,'‘':145,'“':147,'”':148,'…':133,'•':149,'€':128};return special[c]??(c.charCodeAt(0)<=255?c.charCodeAt(0):63);}
function hex(s){return Array.from(String(s)).map(c=>winCode(c).toString(16).padStart(2,'0')).join('');}
function tw(s,pt,bold=false){return Array.from(String(s)).reduce((a,c)=>a+charWidth(c,bold),0)*pt/1000/MM;}
function wrap(s,width,pt,bold=false){const out=[];for(const paragraph of String(s).split(/\r?\n/)){let line='';for(const word of paragraph.split(/\s+/)){const candidate=line?line+' '+word:word;if(tw(candidate,pt,bold)>width&&line){out.push(line);line=word;}else line=candidate;}if(line)out.push(line);}return out.length?out:[''];}
const LABEL_REFERENCE='Población de 3 años y más que',LABEL_PT=9.5;
function labelLimit(){return tw(LABEL_REFERENCE,LABEL_PT,true)+.001;}
function labelText(label){const stem='Población de 3 años y más que habla alguna lengua indígena';if(label.startsWith(stem)){const rest=label.slice(stem.length).trim();return LABEL_REFERENCE+'\nhabla alguna lengua indígena'+(rest?'\n'+rest:'');}if(label==='Pueblo indígena por autoadscripción')return 'Pueblo indígena por\nautoadscripción';return label;}
function labelLines(label,width=labelLimit()){return wrap(labelText(label),Math.min(width,labelLimit()),LABEL_PT,true);}
function cardLayout(label,value,w,minHeight=8,note='',small=false,singleLine=false){
 const valuePt=value==='Dato no disponible'?9.5:small?12:18;
 const minLabelWidth=Math.max(15,...labelText(label).split(/\s+/).map(word=>Math.min(labelLimit(),tw(word,LABEL_PT,true))));
 const naturalValueWidth=small||singleLine?tw(value,valuePt,true):Math.max(...String(value).split(/\s+/).map(word=>tw(word,valuePt,true)));
 const valueWidth=Math.min(Math.max(26,w-7-minLabelWidth),Math.max(26,naturalValueWidth)),labelWidth=Math.max(minLabelWidth,Math.min(labelLimit(),w-7-valueWidth));
 const lines=labelLines(label,labelWidth),noteLines=note?wrap(note,labelWidth,9):[],valueLines=wrap(value,valueWidth,valuePt,true),labelHeight=lines.length*LABEL_PT*1.2/MM,noteHeight=noteLines.length*9*1.2/MM,h=Math.max(minHeight,labelHeight+(note?noteHeight+2:0)+3,valueLines.length*valuePt*1.2/MM+3);
 return {valuePt,valueWidth,labelWidth,lines,labelHeight,noteLines,noteHeight,valueLines,h};
}
const ETHNIC_CARD_HEIGHT=18.5,ETHNIC_GAP=2,LANGUAGE_HEIGHT=28,CONTENT_BOTTOM=362;

function rgb(color){return color.replace('#','').match(/../g).map(c=>(parseInt(c,16)/255).toFixed(4)).join(' ');}
class PDF{
 constructor(){this.cmd=[];this.links=[];this.bounds=[];this.images=[];}
 image(data,x,y,w,h){const name="Picture"+this.images.length;this.images.push({...data,name});this.cmd.push(`q ${w*MM} 0 0 ${h*MM} ${x*MM} ${(H-y-h)*MM} cm /${name} Do Q`);}
 text(s,x,y,pt=11,bold=false,color=C.text,width=1000,align='left'){
  const lines=wrap(s,width,pt,bold),step=pt*1.2/MM;
  for(let i=0;i<lines.length;i++){let dx=align==='right'?width-tw(lines[i],pt,bold):align==='center'?(width-tw(lines[i],pt,bold))/2:0;this.cmd.push(`BT /${bold==='headline'?'F4':bold==='support'?'F5':bold==='identity'?'F6':bold==='italic'?'F3':bold?'F2':'F1'} ${pt} Tf ${rgb(color)} rg 1 0 0 1 ${((x+dx)*MM).toFixed(3)} ${((H-y-i*step)-pt/MM)*MM} Tm <${hex(lines[i])}> Tj ET`);}
  return lines.length*step;
 }
 rotatedText(s,x,y,pt=8.5){this.cmd.push(`BT /F2 ${pt} Tf ${rgb(C.text)} rg 0 1 -1 0 ${x*MM} ${(H-y)*MM} Tm <${hex(s)}> Tj ET`);}
 justified(s,x,y,pt,width){const lines=wrap(s,width,pt),step=pt*1.35/MM;lines.forEach((line,i)=>{const spaces=(line.match(/ /g)||[]).length,wordSpace=i<lines.length-1&&spaces?(width-tw(line,pt))*MM/spaces:0;this.cmd.push(`BT /F1 ${pt} Tf ${rgb(C.text)} rg ${wordSpace.toFixed(3)} Tw 1 0 0 1 ${x*MM} ${(H-y-i*step)*MM-pt} Tm <${hex(line)}> Tj 0 Tw ET`);});return lines.length*step;}
 rect(x,y,w,h,fill=null,stroke=null,lw=.25){this.cmd.push(`q ${fill?rgb(fill)+' rg ':''}${stroke?rgb(stroke)+' RG '+(lw*MM)+' w ':''}${x*MM} ${(H-y-h)*MM} ${w*MM} ${h*MM} re ${fill&&stroke?'B':fill?'f':'S'} Q`);}
 line(x1,y1,x2,y2,color=C.line,lw=.25){this.cmd.push(`q ${rgb(color)} RG ${lw*MM} w ${x1*MM} ${(H-y1)*MM} m ${x2*MM} ${(H-y2)*MM} l S Q`);}
 path(points,fill,stroke='#FFFFFF',lw=.2){if(!points.length)return;const p=points.map((pt,i)=>`${pt[0]*MM} ${(H-pt[1])*MM} ${i?'l':'m'}`).join(' ');this.cmd.push(`q ${rgb(fill)} rg ${rgb(stroke)} RG ${lw*MM} w ${p} h B Q`);}
 circle(x,y,r,fill,stroke=null){const k=.5522847498*r,px=x*MM,py=(H-y)*MM;const q=(a,b)=>`${(px+a*MM).toFixed(3)} ${(py+b*MM).toFixed(3)}`;this.cmd.push(`q ${rgb(fill)} rg ${stroke?rgb(stroke)+' RG ':''}${q(r,0)} m ${q(r,k)} ${q(k,r)} ${q(0,r)} c ${q(-k,r)} ${q(-r,k)} ${q(-r,0)} c ${q(-r,-k)} ${q(-k,-r)} ${q(0,-r)} c ${q(k,-r)} ${q(r,-k)} ${q(r,0)} c ${stroke?'B':'f'} Q`);}
 icon(name,x,y){
  const icon=ICONS?.icons[name];if(!icon)throw Error('Falta el ícono '+name+'. Revisa iconografia.js.');
  const size=8.4,top=y-.7,scale=size/ICONS.size;
  this.rect(x,top,size,size,C.blue);
  this.cmd.push(`q ${scale*MM} 0 0 ${-scale*MM} ${x*MM} ${(H-top)*MM} cm 1 1 1 rg 1 1 1 RG`);
  icon.paths.forEach(path=>{
   const commands=path.commands.map(([op,...values])=>op==='Z'?'h':values.join(' ')+' '+({M:'m',L:'l',C:'c'}[op])).join(' ');
   const paint=path.fill?(path.stroke?'B':'f')+(path.rule==='evenodd'?'*':''):path.stroke?'S':'n';
   this.cmd.push(`q ${path.width} w ${path.cap==='round'?1:0} J ${path.join==='round'?1:0} j ${commands} ${paint} Q`);
  });this.cmd.push('Q');
 }
 title(label,x,y,w,kind='person'){
  this.icon(ICONS.sectionIcons[label]||kind,x,y);
  const h=this.text(label,x+10,y+.3,15,true,C.blue,w-10),bottom=y+Math.max(7,h)+1.5;
  this.line(x,bottom,x+w,bottom,C.blue,.65);return bottom+2.3;
 }
 gradient(x,y,w,h){
  const a=[255,255,255],b=[233,244,251],steps=128;
  for(let i=0;i<steps;i++){const t=i/(steps-1),color='#'+a.map((v,k)=>Math.round(v+(b[k]-v)*t).toString(16).padStart(2,'0')).join('');this.rect(x,y+h*i/steps,w,h/steps+.015,color);}
 }
 card(label,value,x,y,w,opts={}){const l=cardLayout(label,value,w,opts.minHeight||8,'',opts.small),color=opts.highlight?'#FFFFFF':C.text;this.rect(x,y,w,l.h,opts.highlight?C.blue:'#FFFFFF',C.line,.2);this.text(l.lines.join('\n'),x+2,y+1.5,LABEL_PT,true,color,l.labelWidth);this.text(value,x+w-2-l.valueWidth,y+(l.h-l.valueLines.length*l.valuePt*1.2/MM)/2,l.valuePt,true,opts.highlight?'#FFFFFF':C.blue,l.valueWidth,'right');return y+l.h+1.5;}
 // Chart values use one baseline and an exact Helvetica anchor; they never wrap.
 chartValue(s,x,baseline,pt=9.3,align='left'){
  const dx=align==='center'?-tw(s,pt,true)/2:align==='right'?-tw(s,pt,true):0;
  this.cmd.push(`BT /F2 ${pt} Tf ${rgb(C.text)} rg 1 0 0 1 ${((x+dx)*MM).toFixed(3)} ${((H-baseline)*MM).toFixed(3)} Tm <${hex(s)}> Tj ET`);
 }
 bars(items,x,y,w,opts={}){
  const colors=[C.teal,C.blue,C.purple,C.orange,C.green],fraction=opts.labelFraction??.46,pt=opts.pt??9.5,step=opts.step??4.5,valuePt=9.3,thickness=opts.thickness||2.7;
  items.forEach(([label,value],i)=>{
   const lh=this.text(label,x,y+.6,pt,false,C.text,w*fraction-2),h=Math.max(step,lh+.3),barY=y+2,baseline=barY+thickness/2+.718*valuePt/MM/2;
   if(value!==null){const start=x+w*fraction,barWidth=w*(1-fraction)-15,barEnd=start+barWidth*value;this.rect(start,barY,barWidth*value,thickness,colors[i%colors.length]);this.chartValue(pct(value),barEnd+1.3,baseline,valuePt);}
   else this.chartValue('N/D',x+w,baseline,9,'right');
   y+=h;
  });return y;
 }
 verticalBars(items,x,y,w,h=36,opts={}){
  const scale=opts.adaptive?Math.max(.1,Math.ceil(Math.max(0,...items.map(a=>num(a[1])||0))*10)/10):1,colors=opts.colors||[C.teal,C.blue,C.purple,C.orange],valuePt=opts.valuePt||9.3,gap=1.6,head=valuePt/MM+gap,plot=h-(opts.labelsHeight||15)-head,base=y+head+plot,slot=w/items.length;
  this.line(x,base,x+w,base,C.line,.2);
  items.forEach(([label,v],i)=>{
   const center=x+(i+.5)*slot,bw=slot*.42;
   if(v!==null){const bh=plot*v/scale,top=base-bh;this.rect(center-bw/2,top,bw,bh,colors[i%colors.length]);this.chartValue(pct(v),center,top-gap,valuePt,'center');}
   else this.chartValue('N/D',center,y+head,8.5,'center');
   label.split('|').forEach((part,j)=>this.text(part,center-slot/2+.4,base+1.3+j*(opts.labelPt||8.2)*1.15/MM,opts.labelPt||8.2,false,C.text,slot-.8,'center'));
  });return y+h;
 }
 sideCard(label,value,x,y,w,note='',minHeight=18){const l=cardLayout(label,value,w,minHeight,note);this.rect(x,y,w,l.h,'#FFFFFF',C.line,.2);this.text(l.lines.join('\n'),x+2,y+1.5,LABEL_PT,true,C.text,l.labelWidth);this.text(value,x+w-2-l.valueWidth,y+(l.h-l.valueLines.length*l.valuePt*1.2/MM)/2,l.valuePt,true,C.blue,l.valueWidth,'right');if(note)this.text(l.noteLines.join('\n'),x+2,y+l.labelHeight+3.5,9,false,C.text,l.labelWidth);return y+l.h+2;}
 pieLegend(items,x,y,w,opts={}){
  const valueWidth=opts.valueWidth||12,labelX=x+4.5+valueWidth,labelWidth=w-4.5-valueWidth,gap=3;
  const rows=items.map(([label,value,color])=>{const text=opts.language?label.replace('Habla lengua indígena y','Habla lengua indígena\ny'):label,vh=wrap(value,valueWidth,9.3,true).length*9.3*1.2/MM,lh=wrap(text,labelWidth,9.2,false).length*9.2*1.2/MM;return {text,value,color,h:Math.max(lh,vh)};});
  const totalH=rows.reduce((s,r)=>s+r.h,0)+Math.max(0,rows.length-1)*gap;
  let ly=opts.language?y+Math.max(0,(LANGUAGE_HEIGHT-totalH)/2):y,bottom=y;
  rows.forEach(r=>{this.circle(x+.8,ly+1.8,1,r.color);const vh=this.text(r.value,x+3,ly,9.3,true,C.text,valueWidth,'right');const lh=this.text(r.text,labelX,ly,9.2,false,C.text,labelWidth);bottom=Math.max(bottom,ly+lh,ly+vh);ly+=r.h+gap;});return bottom;
 }
 pie(items,total,x,y,w,opts={}){
  const vals=items.map(a=>num(a[1]));total=num(total);if(!total||vals.some(v=>v===null)||vals.reduce((a,b)=>a+b,0)>total)return this.card('Distribución','Datos pendientes',x,y,w,{small:true});
  const list=items.slice(),sum=vals.reduce((a,b)=>a+b,0);if(sum<total)list.push(['No especificada',total-sum]);
  const r=w<130?12:15,height=opts.language?LANGUAGE_HEIGHT:2*r,cx=x+r,cy=y+height/2,colors=[C.teal,C.purple,C.orange];let a=-Math.PI/2;
  list.forEach(([label,n],i)=>{const next=a+Number(n)/total*2*Math.PI,pts=[[cx,cy]];for(let t=a;t<=next;t+=.03)pts.push([cx+r*Math.cos(t),cy+r*Math.sin(t)]);pts.push([cx+r*Math.cos(next),cy+r*Math.sin(next)]);if(n===total)this.circle(cx,cy,r,colors[i%3]);else if(n>0)this.path(pts,colors[i%3],'#FFFFFF',.2);a=next;});
  const lx=x+2*r+(opts.legendGap??8),entries=list.map(([label,n],i)=>[label,pct(div(n,total)),colors[i%3]]);const bottom=this.pieLegend(entries,lx,y,w-(lx-x),opts);return Math.max(y+height,bottom);
 }
 languagePie(model,x,y,w){
  if(model.status==='ready')return this.pie(model.items,model.total,x,y,w,{legendGap:4,language:true});
  if(model.status==='empty'){const pt=9.2,lines=wrap(model.emptyMessage,w-4,pt),height=lines.length*pt*1.2/MM;this.text(lines.join('\n'),x+2,y+Math.max(0,(LANGUAGE_HEIGHT-height)/2),pt,false,C.text,w-4,'center');return y+LANGUAGE_HEIGHT;}
  this.circle(x+12,y+LANGUAGE_HEIGHT/2,11.8,'#F2F4F7',C.line);this.text('Datos pendientes',x+1,y+LANGUAGE_HEIGHT/2-3.5,8,false,C.text,22,'center');
  const entries=model.items.map(([label,n],i)=>[label,n===null||!(model.total>0)?'N/D':pct(div(n,model.total)),[C.teal,C.purple][i]]);
  const bottom=this.pieLegend(entries,x+28,y,w-28,{language:true,valueWidth:12});return Math.max(y+LANGUAGE_HEIGHT,bottom);
 }
 tile(label,value,x,y,w,h=21,singleLine=false){const l=cardLayout(label,value,w,h,'',false,singleLine);this.rect(x,y,w,l.h,'#FFFFFF',C.line,.2);this.text(l.lines.join('\n'),x+2,y+1.5,LABEL_PT,true,C.text,l.labelWidth);this.text(value,x+w-2-l.valueWidth,y+(l.h-l.valueLines.length*l.valuePt*1.2/MM)/2,l.valuePt,true,C.blue,l.valueWidth,'right');return y+l.h;}
 reference(ref,x,y,w){const pt=9.7,step=pt*1.2/MM,indent=12.7;const [author,title,tail,url]=ref;const tokens=[...author.split(/\s+/).map(t=>[t,false]),...title.split(/\s+/).map(t=>[t,'italic']),...tail.split(/\s+/).filter(Boolean).map(t=>[t,false])];let line=[],lineWidth=0,yy=y,first=true;const flush=()=>{let xx=x+(first?0:indent);for(const [word,style]of line){this.text(word,xx,yy,pt,style,C.text);xx+=tw(word+' ',pt,style);}yy+=step;first=false;line=[];lineWidth=0;};for(const token of tokens){const width=tw(token[0]+' ',pt,token[1]);if(line.length&&lineWidth+width>w-(first?0:indent))flush();line.push(token);lineWidth+=width;}if(line.length)flush();this.text(url,x+indent,yy,8.7,false,C.text,w-indent);const uh=wrap(url,w-indent,8.7).length*8.7*1.2/MM;this.links.push({x:x+indent,y:yy,w:w-indent,h:uh,url});return yy+uh+2;}
 link(label,url,x,y,w){const h=this.text(label,x,y,8.2,false,C.blue,w);this.links.push({x,y,w,h,url});return h;}
 finish(logo){
  let content=this.cmd.join('\n');if(logo)content+=`\nq ${logo.w*MM} 0 0 ${logo.h*MM} ${logo.x*MM} ${(H-logo.y-logo.h)*MM} cm /Logo Do Q`;
  const encoder=new TextEncoder(),objects=[];
  objects.push(encoder.encode('<< /Type /Catalog /Pages 2 0 R >>'));
  objects.push(encoder.encode('<< /Type /Pages /Kids [3 0 R] /Count 1 >>'));
  const images=[...this.images,...(logo?[{...logo,name:"Logo"}]:[])],linkStart=8+images.length;
  const faces=[['F1','normal'],['F2','bold'],['F3','italic'],['F4','headline'],['F5','support'],['F6','identity']].filter(([id,role])=>FONTS?.[role]&&content.includes('/'+id+' ')),fontStart=linkStart+this.links.length;
  for(const role of ['normal','bold','italic'])if(!FONTS?.[role])throw Error('Falta la tipografía institucional '+role+'. Revisa tipografia.js.');
  objects.push(encoder.encode(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${W*MM} ${H*MM}] /Resources << /Font << ${faces.map(([id],i)=>'/'+id+' '+(fontStart+i*3)+' 0 R').join(' ')} >> ${images.length?'/XObject << '+images.map((im,i)=>'/'+im.name+' '+(8+i)+' 0 R').join(' ')+' >>':''} >> /Contents 6 0 R /Annots [${this.links.map((l,i)=>(linkStart+i)+' 0 R').join(' ')}] >>`));
  objects.push(encoder.encode('null'));
  objects.push(encoder.encode('null'));
  const stream=data=>join([encoder.encode(`<< /Length ${data.length} >>\nstream\n`),data,encoder.encode('\nendstream')]);objects.push(stream(encoder.encode(content)));
  objects.push(encoder.encode('null'));
  images.forEach(im=>objects.push(join([encoder.encode(`<< /Type /XObject /Subtype /Image /Width ${im.pxWidth} /Height ${im.pxHeight} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${im.bytes.length} >>\nstream\n`),im.bytes,encoder.encode('\nendstream')])));
  this.links.forEach(l=>objects.push(encoder.encode(`<< /Type /Annot /Subtype /Link /Rect [${l.x*MM} ${(H-l.y-l.h)*MM} ${(l.x+l.w)*MM} ${(H-l.y)*MM}] /Border [0 0 0] /A << /S /URI /URI (${l.url.replace(/[()\\]/g,'\\$&')}) >> >>`)));
  faces.forEach(([,role],i)=>{
   const f=FONTS[role],first=fontStart+i*3,data=Uint8Array.from(atob(f.data),c=>c.charCodeAt(0)),cff=f.kind==='Type1C';
   objects.push(encoder.encode(`<< /Type /Font /Subtype /${cff?'Type1':'TrueType'} /BaseFont /${f.name} /Encoding /WinAnsiEncoding /FirstChar 0 /LastChar 255 /Widths [${f.widths.join(' ')}] /FontDescriptor ${first+1} 0 R >>`));
   objects.push(encoder.encode(`<< /Type /FontDescriptor /FontName /${f.name} /Flags ${(role==='headline'?34:32)+(f.italicAngle?64:0)} /FontBBox [${f.bbox.join(' ')}] /ItalicAngle ${f.italicAngle} /Ascent ${f.ascent} /Descent ${f.descent} /CapHeight ${f.capHeight} /StemV 100 /FontFile${cff?'3':'2'} ${first+2} 0 R >>`));
   objects.push(join([encoder.encode(`<< /Length ${data.length} ${cff?'/Subtype /Type1C':'/Length1 '+data.length} >>\nstream\n`),data,encoder.encode('\nendstream')]));
  });
  let parts=[encoder.encode('%PDF-1.4\n')],offsets=[0],size=parts[0].length;objects.forEach((o,i)=>{offsets.push(size);const part=join([encoder.encode(`${i+1} 0 obj\n`),o,encoder.encode('\nendobj\n')]);parts.push(part);size+=part.length;});const xref=size;parts.push(encoder.encode(`xref\n0 ${objects.length+1}\n0000000000 65535 f \n${offsets.slice(1).map(o=>String(o).padStart(10,'0')+' 00000 n ').join('\n')}\ntrailer\n<< /Size ${objects.length+1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`));return join(parts);
 }
}
function join(arr){const out=new Uint8Array(arr.reduce((s,a)=>s+a.length,0));let at=0;for(const a of arr){out.set(a,at);at+=a.length;}return out;}
function polygons(f){return f.geometry.type==='Polygon'?[f.geometry.coordinates]:f.geometry.type==='MultiPolygon'?f.geometry.coordinates:[];}
function dms(s){const m=String(s??'').match(/(\d+)[°º]\s*(\d+)'\s*([\d.]+)"\s*([NSEW])/);return m?(+m[1]+m[2]/60+m[3]/3600)*(/[SW]/.test(m[4])?-1:1):null;}
function drawMap(p,g,raw,key,name,x,y,w,h){
 if(!g?.features?.length){p.card('Mapa estatal','Cartografía pendiente',x,y,w,{small:true});return;}
 const coords=g.features.flatMap(f=>polygons(f).flat(2));const xs=coords.map(a=>a[0]),ys=coords.map(a=>a[1]);const xmin=Math.min(...xs),xmax=Math.max(...xs),ymin=Math.min(...ys),ymax=Math.max(...ys),cos=Math.cos((ymin+ymax)/2*Math.PI/180);const scale=Math.min((w-12)/((xmax-xmin)*cos),(h-12)/(ymax-ymin));const dx=x+(w-(xmax-xmin)*cos*scale)/2,dy=y+3+(h-12-(ymax-ymin)*scale)/2;const project=a=>[dx+(a[0]-xmin)*cos*scale,dy+(ymax-a[1])*scale];
 p.rect(x,y,w,h,'#F5F8FC',C.line,.2);
 for(const f of g.features)for(const rings of polygons(f))for(const ring of rings)p.path(ring.map(project),String(f.properties.cvegeo)===String(key).slice(0,5)?C.sky:'#C8D8EB','#FFFFFF',.35);
 const lat=dms(raw.LATITUD),lon=dms(raw.LONGITUD);if(lat!==null&&lon!==null){const pt=project([lon,lat]);p.circle(pt[0],pt[1],1.5,C.orange,'#FFFFFF');p.line(pt[0],pt[1]+2,pt[0],y+h-7,C.blue,.3);p.line(pt[0],y+h-7,x+w/2,y+h-7,C.blue,.3);p.text(name,x+4,y+h-6,11,true,C.blue,w-8,'center');}
}
function median(extra,total){return I.median(extra,total);}
function pyramid(p,extra,total,men,women,x,y,w){
 const bins=extra?.edades;if(!bins?.length||!num(total)){p.card('Pirámide poblacional','Datos pendientes',x,y,w,{small:true});return y+17;}
 p.text(pct(div(men,total)),x+13,y+2,17,true,C.green,32,'center');p.text('Hombres',x+13,y+9,9,true,C.green,32,'center');p.text(pct(div(women,total)),x+w-32,y+2,17,true,C.purple,32,'center');p.text('Mujeres',x+w-32,y+9,9,true,C.purple,32,'center');
 if(extra?.pendienteValidacion){p.text('Pirámide poblacional pendiente de validación',x+3,y+20,11,true,C.text,w-6,'center');p.text('Se esperan los cuatro grupos de edad y sus conteos por sexo.',x+3,y+33,9.5,false,C.text,w-6,'center');return y+46;}
 const broad=extra.gruposAmplios===true,plotTop=broad?18:0,step=broad?10:3.4,barHeight=broad?6.5:2.6;
 p.rotatedText('Años',x+.4,y+plotTop+bins.length*step/2+tw('Años',8.5,true)/2,8.5);
 const labelWidth=11,center=x+labelWidth+(w-labelWidth)/2,bw=(w-labelWidth-4)/2,max=Math.max(1,...bins.flatMap(b=>[num(b.hombres)||0,num(b.mujeres)||0]).map(n=>n/total*100)),tickStep=broad?Math.max(2,Math.ceil(max/16)*2):2,scale=Math.ceil(max/tickStep)*tickStep;
 [...bins].reverse().forEach((b,i)=>{const yy=y+plotTop+i*step;const a=div(b.hombres,total),z=div(b.mujeres,total);if(a!==null)p.rect(center-bw*(a*100/scale),yy,bw*(a*100/scale),barHeight,C.green);if(z!==null)p.rect(center,yy,bw*(z*100/scale),barHeight,C.purple);p.text(b.hasta===null?b.desde+'+':b.desde+'-'+b.hasta,x,yy,7.5,false,C.text,labelWidth-1,'right');});
 const end=y+plotTop+bins.length*step;p.line(center-bw,end,center+bw,end,C.line,.2);
 for(let tick=-scale;tick<=scale;tick+=tickStep){const tx=center+bw*tick/scale;p.line(tx,end,tx,end+1.2,C.line,.2);p.text(String(Math.abs(tick)),tx-3,end+1.5,8,false,C.text,6,'center');}
 p.text('%',x+w-5,end+5,7,false,C.text,5,'right');return end+9;
}

// Proportions measured from Carlos's proposal, within the existing A2 header.
const panoramaLines=['PANORAMA SOCIODEMOGRÁFICO','DE LOS PUEBLOS Y COMUNIDADES INDÍGENAS Y','AFROMEXICANAS DEL ESTADO DE GUANAJUATO'];
function headerLayout(name,identification,variant='Carlos',logoRatio=1375/1465){
 if(!FONTS?.headline||!FONTS?.support||!FONTS?.identity)throw Error('Faltan las tipografías oficiales del encabezado. Revisa tipografia.js y assets/fuentes.');
 const identityWidth=235,identPt=14,identLines=wrap(identification,identityWidth,identPt,'identity');
 let namePt=34;
 while(namePt>24&&wrap(name,identityWidth,namePt,'headline').length>1)namePt-=.5;
 const nameLines=wrap(name,identityWidth,namePt,'headline'),nameH=nameLines.length*namePt*1.2/MM,identH=identLines.length*identPt*1.2/MM;
 const identityY=(40.2-nameH-2-identH)/2-1;
 if(identityY<2)throw Error('El nombre excede el espacio del encabezado: '+name);
 const titlePt=190/tw(panoramaLines[0],1,'headline'),supportPt=192.5/tw(panoramaLines[2],1,'support');
 const logoH=35.5,logoW=logoH/logoRatio;
 return {variant:'Carlos',panel:{w:268,h:43},name:{x:11.5,y:identityY,w:identityWidth,pt:namePt,lines:nameLines},identification:{x:11.5,y:identityY+nameH+2,w:identityWidth,pt:identPt,lines:identLines},panorama:{x:302.5,y:3.5,w:232,pt:titlePt,supportPt,supportY:16.65,supportStep:9.65,lines:panoramaLines},logo:{x:566-logoW/2,y:2.35,w:logoW,h:logoH}};
}

function render(model,logo=null){
 const measured=compose(model,logo,{measureOnly:true});
 const gaps=measured.bounds.map(({column,bottom})=>{const space=CONTENT_BOTTOM-(bottom-2);if(space<-.001)throw Error('La columna '+column+' supera el espacio de composición.');return Math.max(0,space)/3;});
 return compose(model,logo,{gaps});
}
function compose(model,logo=null,options={}){
 if(!I||!ICONS)throw Error('Faltan indicadores.js o iconografia.js. Sube el generador completo.');
 const p=new PDF(),r=model.record||{},raw=model.raw||{},m=I.build(r,raw,model.extra),get=k=>r[norm(k)]??r[k],name=get('Comunidad / Localidad')||raw.NOM_LOC||'Comunidad',key=get('Clave INEGI')||raw['Clave INEGI'];
 const identification=`${get('Municipio')||raw.NOM_MUN}, Guanajuato · Clave INEGI: ${key}`;
 const header=headerLayout(name,identification,'Carlos',logo?logo.pxHeight/logo.pxWidth:1375/1465);
 p.rect(0,0,246.5,43,C.blue);p.circle(246.5,21.5,21.5,C.blue);p.rect(0,40,W,3.5,C.blue);
 p.text(name,header.name.x,header.name.y,header.name.pt,'headline','#FFFFFF',header.name.w);
 p.text(identification,header.identification.x,header.identification.y,header.identification.pt,'identity','#C8D8EB',header.identification.w);
 p.text(header.panorama.lines[0],header.panorama.x,header.panorama.y,header.panorama.pt,'headline',C.blue,header.panorama.w);
 header.panorama.lines.slice(1).forEach((line,i)=>p.text(line,header.panorama.x,header.panorama.supportY+i*header.panorama.supportStep,header.panorama.supportPt,'support',C.blue,header.panorama.w));
 if(logo)logo={...logo,...header.logo};
 const gaps=options.gaps||[0,0,0];let x=11,w=202,y=52;
 y=p.title('Introducción',x,y,w,'historia');y+=p.justified(model.history||'Introducci\u00f3n pendiente.',x+2,y+1,11,w-4)+5+gaps[0];
 y=p.title('Territorio y ubicación geográfica',x,y,w,'map');const teamMap=model.mapImage,mapHeight=String(key)==='110030008'&&teamMap?92:72;
 if(teamMap){const iw=Math.min(w,mapHeight*model.mapImage.pxWidth/model.mapImage.pxHeight);p.image(model.mapImage,x+(w-iw)/2,y,iw,iw*model.mapImage.pxHeight/model.mapImage.pxWidth);}else drawMap(p,model.geometry,raw,key,name,x,y,w,mapHeight);y+=mapHeight+3;
 const gw=(w-3)/2,geo=[['Municipio',get('Municipio')||raw.NOM_MUN||'Dato no disponible'],['Altitud',num(raw.ALTITUD)===null?'Dato no disponible':fmt(raw.ALTITUD)+' m'],['Latitud',raw.LATITUD||'Dato no disponible'],['Longitud',raw.LONGITUD||'Dato no disponible']];
 for(let row=0;row<2;row++){const rowHeight=Math.max(...geo.slice(row*2,row*2+2).map(([label,value])=>cardLayout(label,value,gw,9,'',true).h));let bottom=y;for(let i=0;i<2;i++){const [label,value]=geo[row*2+i];bottom=Math.max(bottom,p.card(label,value,x+i*(gw+3),y,gw,{small:true,labelFraction:.32,minHeight:rowHeight}));}y=bottom;}
 y+=2+gaps[0];y=p.title('Composición por edad y sexo',x,y,w);const top=y,cardWidth=96;
 p.rect(x,y,cardWidth,18,C.blue);p.text('Población total',x+3,y+5.5,12,true,'#FFFFFF',cardWidth-35);p.text(fmt(m.total),x+cardWidth-32,y+4,24,true,'#FFFFFF',29,'right');
 const explanatory=(label,value,note,yy)=>p.sideCard(label,value,x,yy,cardWidth,note,22);
 explanatory('Relación hombres-mujeres',fmt(m.relation,1),num(m.relation)===null?'Dato pendiente.':`Existen ${Math.round(+m.relation)} hombres por cada 100 mujeres`,y+23);
 explanatory('Edad mediana',fmt(m.age,m.ageDigits??1),m.age===null?'Dato pendiente.':`La mitad de la población tiene ${fmt(m.age,m.ageDigits??1)} años o menos`,y+49);
 y=Math.max(top+73,pyramid(p,model.extra,m.total,m.men,m.women,x+102,top+2,w-102))+3;
 if(m.notes.composition)y+=p.text(m.notes.composition,x,y,8.5,true,C.text,w)+2;
 y+=gaps[0];
 const half=(w-5)/2,fy=p.title('Fecundidad',x,y,half,'family'),cy=p.title('Situación conyugal',x+half+5,y,half,'rings');
 // Preserve the original layout footprint so only the fertility card changes.
 const fertilityFootprint=fy+cardLayout(...m.fertility,half,29).h+2;p.sideCard(...m.fertility,x,fy,half,'',18);const ch=p.text('Población de 12 años y más según situación conyugal',x+half+5,cy,9.5,true,C.text,half);const cb=p.pie(m.marital,raw.P_12YMAS,x+half+5,cy+ch+2,half),maritalReady=num(raw.P_12YMAS)>0&&m.marital.every(a=>num(a[1])!==null)&&m.marital.reduce((sum,a)=>sum+Number(a[1]),0)<=Number(raw.P_12YMAS);p.bounds.push({column:1,bottom:Math.max(fertilityFootprint-2,cb-(maritalReady?0:1.5))+2});
 x=220;w=175;y=52;const ew=(w-4)/2;
 y=p.title('Vivienda',x,y,w,'housing');for(let row=0;row<2;row++){let bottom=y;for(let i=0;i<2;i++){const [label,value,highlight]=m.housing[row*2+i];bottom=Math.max(bottom,p.card(label,value,x+i*(ew+4),y,ew,{highlight,minHeight:row===0?17:12,labelFraction:.72}));}y=bottom;}
 m.housingGroups.forEach(([label,items],i)=>{if(i){p.line(x,y+1,x+w,y+1,C.line,.25);y+=3;}y+=1;y+=p.text(label,x,y,10.5,true,C.text,w)+1.5;y=p.bars(items,x,y,w,{step:4.32});});
 y+=2+gaps[1];y=p.title('Etnicidad',x,y,w);const ethnicTop=y;let ethnicLeft=y;
 for(const i of [0,2,3]){const [label,value]=m.ethnicity[i];ethnicLeft=p.tile(label,value,x,ethnicLeft,ew,ETHNIC_CARD_HEIGHT)+ETHNIC_GAP;}
 const [languageLabel,languageValue]=m.ethnicity[1],languageCardBottom=p.tile(languageLabel,languageValue,x+ew+4,ethnicTop,ew,ETHNIC_CARD_HEIGHT);
 const languageCaption=p.text('Población de 3 años y más hablante de lengua indígena según condición de habla española',x+ew+4,languageCardBottom+3,8.5,true,C.text,ew);
 const ethnicRight=p.languagePie(m.language,x+ew+4,languageCardBottom+3+languageCaption+2,ew);y=Math.max(ethnicLeft,ethnicRight,ethnicTop+60);

 y+=1+gaps[1];y=p.title('Desarrollo social',x,y,w,'social');const socialHeight=Math.max(...m.social.map(([label,value])=>cardLayout(label,value,ew,13,'',false,true).h));let socialBottom=y;m.social.forEach(([label,value],i)=>{socialBottom=Math.max(socialBottom,p.tile(label,value,x+i*(ew+4),y,ew,socialHeight,true));});y=socialBottom+4+gaps[1];
 const ry=p.title('Religión',x,y,ew,'book'),my=p.title('Migración',x+ew+4,y,ew,'map');const rh=p.text('Población total por grupo religioso',x,ry,9.3,true,C.text,ew);const rb=p.bars(m.religion,x,ry+rh+2,ew,{labelFraction:.62,pt:8.9,step:6});let mb=my;m.migration.forEach(([label,value])=>{mb=p.sideCard(label,value,x+ew+4,mb,ew,'',17);});const migrationBottom=mb-2;p.bounds.push({column:2,bottom:Math.max(rb,migrationBottom)+2});
 x=402;w=181;y=52;const left=78,right=w-left-5,rx=x+left+5,cw=(w-4)/2;
 y=p.title('Discapacidad',x,y,w,'disability');let dy=y;m.disability.forEach(([label,value])=>{dy=p.sideCard(label,value,x,dy,left,'',15);});const dh=p.text('Población con discapacidad por actividad con dificultad',rx,y,9.5,true,C.text,right);const db=p.bars(m.disabilityActivities,rx,y+dh+2,right,{labelFraction:.62,pt:9,step:7,thickness:3.3});y=Math.max(dy,db)+3+gaps[2];
 y=p.title('Afiliación a servicios de salud',x,y,w,'health');let hy=y;m.health.forEach(([label,value,note])=>{hy=p.sideCard(label,value,x,hy,left,note||'',16);});const hb=p.verticalBars(m.institutions,rx,y+2,right,36,{labelPt:7.2,valuePt:8.2,labelsHeight:11});y=Math.max(hy,hb)+3+gaps[2];
 y=p.title('Características económicas',x,y,w,'economy');for(let row=0;row<2;row++){let bottom=y;for(let i=0;i<2;i++){const [label,value]=m.economy[row*2+i];bottom=Math.max(bottom,p.sideCard(label,value,x+i*(cw+4),y,cw,'',16));}y=bottom;}
 if(m.notes.activity){y+=1;const noteHeight=Math.max(p.text(m.notes.activity,x,y,8.5,false,C.text,cw),p.text(m.notes.occupation,x+cw+4,y,8.5,false,C.text,cw));y+=noteHeight+1;}
 const sh=p.text('PEA según sexo',x,y+1,9.5,true,C.text,cw),oh=p.text('Población de 12 años y más ocupada según sexo',x+cw+4,y+1,9.5,true,C.text,cw),chartY=y+Math.max(sh,oh)+3;
 p.verticalBars(m.sexPEA,x,chartY,cw,29,{colors:[C.purple,C.green],labelsHeight:6});p.verticalBars(m.sexOccupied,x+cw+4,chartY,cw,29,{colors:[C.purple,C.green],labelsHeight:6});y=chartY+32;
 y+=gaps[2];y=p.title('Características educativas',x,y,w,'book');let bottom=y;m.education.forEach(([label,value],i)=>{bottom=Math.max(bottom,p.sideCard(label,value,x+i*(cw+4),y,cw,'',18));});y=bottom;
 const eh=p.text('Población según nivel de escolaridad, por grupo de edad de referencia',x,y,9.5,true,C.text,cw),ah=p.text('Asistencia escolar',x+cw+4,y,9.5,true,C.text,cw),edY=y+Math.max(eh,ah)+2;
 const educationHeight=43.5;
 const ed=p.verticalBars(m.schooling,x,edY,cw,educationHeight,{adaptive:true,labelsHeight:17,labelPt:8.5});p.verticalBars(m.attendance,x+cw+4,edY,cw,educationHeight,{colors:[C.teal],labelsHeight:17,labelPt:8.5});
 p.text('Nota:',x,ed+1,8.5,true,C.text,10);const nh=p.text('Los porcentajes no suman 100% porque corresponden a grupos de edad distintos y no incluyen todas las categorías.',x+9,ed+1,8.5,false,C.text,cw-9);p.bounds.push({column:3,bottom:ed+nh+3});
 const footer=367;if(p.bounds.some(b=>b.bottom>footer-3+.001))throw Error('El contenido supera el área reservada. Revisar distribución: '+JSON.stringify(p.bounds));
 // El pie conserva el fondo blanco de la página, sin modificar su distribución.
 const refTop=p.title('Fuentes y referencias',11,footer,572,'book');let refBottom=refTop;
 // Two columns in bibliographic order, with APA hanging indent and italic titles.
 for(let col=0;col<2;col++){let yy=refTop+1;for(let row=0;row<3;row++)yy=p.reference(refs[col*3+row],11+col*289,yy,283);refBottom=Math.max(refBottom,yy);}
 if(model.extra?.notaRevision)refBottom+=1+p.text(model.extra.notaRevision,11,refBottom+1,9,false,C.blue,572);
 if(refBottom>417)throw Error('Las referencias exceden el margen inferior.');
 return {bytes:options.measureOnly?null:p.finish(logo),header,bounds:p.bounds,referenceBottom:refBottom,alignment:{migrationBottom,noteBottom:ed+nh+1,educationHeight,columnBottoms:p.bounds.map(b=>b.bottom-2),closingTarget:CONTENT_BOTTOM}};
}
async function imageBytes(src){const image=new Image();image.src=src+(src.includes('?')?'&':'?')+'v='+Date.now();try{await image.decode();}catch{throw Error('No se pudo leer '+src+'. Revisa la carpeta assets, el nombre completo y que el archivo sea una imagen válida.');}const canvas=document.createElement('canvas');canvas.width=image.naturalWidth;canvas.height=image.naturalHeight;const ctx=canvas.getContext('2d');ctx.fillStyle='#FFFFFF';ctx.fillRect(0,0,canvas.width,canvas.height);ctx.drawImage(image,0,0);const blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/jpeg',.98));if(!blob)throw Error('No se pudo preparar la imagen '+src+' para el PDF.');return {bytes:new Uint8Array(await blob.arrayBuffer()),pxWidth:canvas.width,pxHeight:canvas.height};}
async function download(model){const logo=await imageBytes('assets/logotipo Gto descriptivo vertical (2).png');const maps=root.SDH_MAPAS||(typeof require==='function'?require('./mapas.js'):null);if(!maps)throw Error('Falta mapas.js. Sube el generador completo y recarga la página.');const mapPath=maps.pathFor(model.record[norm('Clave INEGI')]??model.record['Clave INEGI']);if(mapPath)model={...model,mapImage:await imageBytes(mapPath)};const result=render(model,logo),blob=new Blob([result.bytes],{type:'application/pdf'}),url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=`SDH_${model.raw?.['Clave INEGI']||model.record[norm('Clave INEGI')]}_${String(model.record[norm('Comunidad / Localidad')]||'Comunidad').replace(/[^\p{L}\p{N}]+/gu,'_')}_A2.pdf`;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),10000);return result.bounds;}
const api={render,download,headerLayout,refs,median,labelLines,labelLimit,cardLayout};
root.SDH_PDF=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
