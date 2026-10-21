(function(){
'use strict';
const CONFIG = {sheetId:'1qy6A46hMpRNKSIyIJ0H9vNv4T-KBngCQ', sheet:'Base 107', geoUrl:'https://gaia.inegi.org.mx/wscatgeo/v2/geo/mgem/11'};
const $ = id => document.getElementById(id);
const esc = v => String(v ?? '').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const norm = v => String(v??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
const missing = v => v == null || String(v).trim()==='' || /^(nd|n\/d|sd|s\/d|na|n\/a|null)$/i.test(String(v).trim());
function number(v){if(missing(v)||String(v).includes('*'))return null;let s=String(v).trim().replace(/,/g,'');return /^[-+]?\d+(\.\d+)?$/.test(s)&&Number.isFinite(Number(s))?Number(s):null;}
function percentage(v){if(missing(v)||String(v).includes('*'))return null;const literal=String(v).trim();const n=number(literal.replace(/%$/,''));if(n===null)return null;const p=literal.endsWith('%')?n:n*100;return p>=0&&p<=100?p:null;}
function display(v,digits=0){if(String(v).includes('*'))return 'Dato reservado';const n=number(v);return n===null?'Dato no disponible':n.toLocaleString('es-MX',{minimumFractionDigits:digits,maximumFractionDigits:digits});}
function percentText(v){const p=percentage(v);return p===null?(String(v).includes('*')?'Dato reservado':'Dato no disponible'):p.toFixed(1)+'%';}
function parseCSV(text){let rows=[],row=[],v='',quote=false;const separator=text.split(/\r?\n/)[0].includes(';')?';':',';for(let i=0;i<text.length;i++){const c=text[i];if(c==='"'){if(quote&&text[i+1]==='"'){v+='"';i++;}else quote=!quote;}else if(c===separator&&!quote){row.push(v);v='';}else if((c==='\n'||c==='\r')&&!quote){if(c==='\r'&&text[i+1]==='\n')i++;row.push(v);if(row.some(Boolean))rows.push(row);row=[];v='';}else v+=c;}if(quote)throw Error('El CSV tiene comillas sin cerrar.');if(v||row.length){row.push(v);rows.push(row);}return rows;}
function recordsFromRows(rows,labels=[]){const isKey=c=>norm(c)==='clave inegi'||norm(c).endsWith(' clave inegi');let header=labels;let start=0;const h=rows.findIndex(r=>r.some(isKey));if(h>=0){header=rows[h];start=h+1;}if(!header.some(isKey))throw Error('No se encontró el encabezado Clave INEGI.');const key=header.findIndex(isKey);const out=rows.slice(start).filter(r=>/^11\d{7}$/.test(String(r[key]??'').trim().padStart(9,'0'))).map(r=>Object.fromEntries(header.map((k,i)=>[i===key?'Clave INEGI':String(k).trim(),r[i]??null])));if(!out.length)throw Error('No se encontraron comunidades de Guanajuato.');return out;}
function canonical(records){return records.map(r=>Object.fromEntries(Object.entries(r).map(([k,v])=>[norm(k),v])));}
const get=(r,key)=>r[norm(key)];
function metric(label,value,digits=0,highlight=false){const text=display(value,digits);return `<div class="metric${highlight?' highlight':''}"><span>${esc(label)}</span><strong${number(value)===null?' class="unavailable"':''}>${esc(text)}</strong></div>`;}
function textMetric(label,value){return `<div class="metric"><span>${labelHTML(label)}</span><strong${missing(value)?' class="unavailable"':''}>${esc(missing(value)?'Dato no disponible':value)}</strong></div>`;}
function bar(label,value,index=0){const p=percentage(value);return `<div class="bar"><span>${esc(label)}</span>${p===null?`<strong class="unavailable">${esc(percentText(value))}</strong>`:`<div class="track"><div class="fill" style="width:${p}%;background:${['#008E95','#004B87','#84369B','#E66D42','#319356'][index%5]}"></div><strong class="bar-value" style="left:${p}%">${p.toFixed(1)}%</strong></div>`}</div>`;}
function ratio(numerator,denominator){const a=number(numerator),b=number(denominator);return a!==null&&b!==null&&a>=0&&b>0&&a<=b?a/b:null;}
function ratioMetric(label,numerator,denominator,digits=1){const value=ratio(numerator,denominator);return `<div class="metric"><span>${esc(label)}</span><strong${value===null?' class="unavailable"':''}>${value===null?'Dato no disponible':(value*100).toFixed(digits)+'%'}</strong></div>`;}
const reunion=window.SDH_REUNION||{iter:{},historia:{}};
const H=window.SDH_HISTORIAS_API||(typeof require==='function'?require('./historias.js'):null);
if(typeof document!=='undefined'&&(!H||!window.SDH_INDICADORES||!window.SDH_ICONOGRAFIA||!window.SDH_PDF||!window.SDH_MAPAS)){$('estado').textContent='Faltan archivos del generador. Sube el paquete completo, incluidos historias.js, indicadores.js, iconografia.js y mapas.js, y recarga con Ctrl+F5.';$('comunidad').innerHTML='<option>Archivos del generador incompletos</option>';return;}
let histories=H.fromJSON(window.SDH_HISTORIAS||{comunidades:{}}),historyImported=false;
const historyFor=r=>histories[String(get(r,'Clave INEGI'))]?.texto||'Rese\u00f1a hist\u00f3rica pendiente.';
function rawFor(r){return reunion.iter[`${get(r,'Clave INEGI')}|${get(r,'Comunidad / Localidad')}`]||{};}
function supplement(r){
 const raw=rawFor(r);
 for(const [label,field] of [['% Tinaco','VPH_TINACO'],['% Cisterna','VPH_CISTER'],['% Motocicleta','VPH_MOTO'],['% Bicicleta','VPH_BICI']]){
  if(missing(get(r,label)))r[norm(label)]=ratio(raw[field],raw.VIVPARH_CV);
 }
 return r;
}
function circular(items,total,label,language=false){
 const values=items.map(x=>number(x[1])),den=number(total);
 if(den===null||den<=0||values.some(x=>x===null||x<0)||values.reduce((a,b)=>a+b,0)>den)return '<div class="missing">Gráfica pendiente: conteos incompletos o inconsistentes.</div>';
 const sum=values.reduce((a,b)=>a+b,0),list=items.map((x,i)=>[x[0],values[i]]);
 if(sum<den)list.push(['Resto no clasificado',den-sum]);
 const colors=['#008E95','#84369B','#E66D42','#347D62'];let start=-Math.PI/2,svg='<svg viewBox="0 0 120 120" role="img" aria-label="'+esc(label)+'">',legend='';
 list.forEach(([name,n],i)=>{const angle=n/den*2*Math.PI,end=start+angle,c=colors[i%colors.length];if(n===den)svg+=`<circle cx="60" cy="60" r="55" fill="${c}"/>`;else if(n>0)svg+=`<path d="M60,60 L${60+55*Math.cos(start)},${60+55*Math.sin(start)} A55,55 0 ${angle>Math.PI?1:0},1 ${60+55*Math.cos(end)},${60+55*Math.sin(end)} Z" fill="${c}" stroke="white" stroke-width="1"/>`;legend+=`<div style="--chart-color:${c}"><i style="background:${c}"></i><strong>${(n/den*100).toFixed(1)}%</strong><span>${language?esc(name).replace('Habla lengua indígena y','Habla lengua indígena<br>y'):esc(name)}</span></div>`;start=end;});
 return `<div class="pie">${svg}</svg><div class="pie-legend">${legend}</div></div><p class="note">${esc(label)} · Base: ${display(den)} personas.</p>`;
}
function languagePie(model){
 if(model.status==='ready')return circular(model.items,model.total,'Población de 3 años y más hablante de lengua indígena según condición de habla española',true).replace(/<p class="note">[\s\S]*?<\/p>$/,'');
 if(model.status==='empty')return `<div class="language-empty">${esc(model.emptyMessage)}</div>`;
 const legend=model.items.map(([label,n],i)=>{const value=n===null||!(model.total>0)?'N/D':percentText(ratio(n,model.total));return `<div><i style="background:${['#008E95','#84369B'][i]}"></i><strong>${esc(value)}</strong><span>${esc(label).replace('Habla lengua indígena y','Habla lengua indígena<br>y')}</span></div>`;}).join('');
 return `<div class="pie"><div class="language-placeholder">Datos pendientes</div><div class="pie-legend">${legend}</div></div>`;
}
function verticalChart(items,title,opts={}){
 const base=opts.economy?134:105,plot=opts.economy?114:85,slot=320/items.length,colors=opts.colors||['#008E95','#004B87','#84369B','#E66D42'],scale=opts.adaptive?Math.max(.1,Math.ceil(Math.max(0,...items.map(a=>number(a[1])||0))*10)/10):1;
 let svg=`<svg class="vertical-chart" viewBox="0 0 340 160" role="img" aria-label="${esc(title)}"><line x1="10" y1="${base}" x2="330" y2="${base}" stroke="#CED9E3"/>`;
 items.forEach(([label,v],i)=>{const value=number(v),center=10+(i+.5)*slot,bw=slot*.42,h=value===null?0:value/scale*plot,top=base-h;
  svg+=value===null?`<text x="${center}" y="35" text-anchor="middle" font-size="11">N/D</text>`:`<rect x="${center-bw/2}" y="${top}" width="${bw}" height="${h}" fill="${colors[i%colors.length]}"/><text class="vertical-value" x="${center}" y="${top-6}" text-anchor="middle" font-size="11" font-weight="bold" fill="#54585A">${(value*100).toFixed(1)}%</text>`;
  label.split('|').forEach((line,k)=>{svg+=`<text x="${center}" y="${base+14+k*11}" text-anchor="middle" font-size="${opts.small?8:9.5}" fill="#54585A">${esc(line)}</text>`;});
 });return svg+'</svg>';
}
function labelHTML(label){return window.SDH_PDF.labelLines(label).map(esc).join('<br>');}
function valueCard(label,value,highlight=false,note=''){return `<div class="metric${highlight?' highlight':''}"><span>${labelHTML(label)}${note?'<small>'+esc(note)+'</small>':''}</span><strong${value==='Dato no disponible'?' class="unavailable"':''}>${esc(value)}</strong></div>`;}
function renderBars(items){return items.map(([label,value],index)=>bar(label,value,index)).join('');}
function reunionRender(r){
 const raw=rawFor(r),m=window.SDH_INDICADORES.build(r,raw,extraFor(r));
 $('historia-texto').textContent=historyFor(r);$('historia-fuente').textContent='';
 $('territorio').innerHTML=[textMetric('Municipio',get(r,'Municipio')),textMetric('Altitud',number(raw.ALTITUD)===null?'Dato no disponible':`${display(raw.ALTITUD)} m`),textMetric('Latitud',raw.LATITUD),textMetric('Longitud',raw.LONGITUD)].join('');
 $('poblacion').textContent=display(m.total);pyramid(r,extraFor(r));
 $('demografia').innerHTML=demographicCard('Relación hombres-mujeres',display(m.relation,1),number(m.relation)===null?'Dato pendiente.':`Existen ${Math.round(number(m.relation))} hombres por cada 100 mujeres`)+demographicCard('Edad mediana',display(m.age,1),m.age===null?'Dato pendiente.':`La mitad de la población tiene ${display(m.age,1)} años o menos`);
 $('fecundidad').innerHTML=valueCard(...m.fertility);
 $('conyugal').innerHTML='<h4>Población de 12 años y más según situación conyugal</h4>'+circular(m.marital,raw.P_12YMAS,'Situación conyugal').replace(/<p class="note">[\s\S]*?<\/p>$/,'');
 $('vivienda').innerHTML=m.housing.map(([a,b,c])=>valueCard(a,b,c)).join('');
 ['servicios','bienes','tic'].forEach((id,i)=>$(id).innerHTML=renderBars(m.housingGroups[i][1]));
 $('etnicidad').innerHTML='<div class="ethnicity-left">'+[0,2,3].map(i=>valueCard(...m.ethnicity[i])).join('')+'</div><div class="ethnicity-right">'+valueCard(...m.ethnicity[1])+'<h4>Población de 3 años y más hablante de lengua indígena según condición de habla española</h4>'+languagePie(m.language)+'</div>';$('condiciones').innerHTML=m.social.map(([a,b])=>valueCard(a,b)).join('');
 $('religion').innerHTML='<h4>Población total por grupo religioso</h4>'+renderBars(m.religion);$('migracion').innerHTML=m.migration.map(([a,b])=>valueCard(a,b)).join('');
 $('discapacidad').innerHTML=m.disability.map(([a,b])=>valueCard(a,b)).join('');$('discapacidad-grafica').innerHTML='<h4>Población con discapacidad por actividad con dificultad</h4>'+renderBars(m.disabilityActivities);
 $('salud').innerHTML=m.health.map(([a,b,n])=>valueCard(a,b,false,n)).join('');$('instituciones').innerHTML=verticalChart(m.institutions,'Afiliación por institución',{small:true});
 $('economia').innerHTML=m.economy.map(([a,b])=>valueCard(a,b)).join('');$('economia-sexo').innerHTML='<div><h4>PEA según sexo</h4>'+verticalChart(m.sexPEA,'PEA según sexo',{colors:['#84369B','#319356'],economy:true})+'</div><div><h4>Población de 12 años y más ocupada según sexo</h4>'+verticalChart(m.sexOccupied,'Población ocupada según sexo',{colors:['#84369B','#319356'],economy:true})+'</div>';
 $('educacion').innerHTML=m.education.map(([a,b])=>valueCard(a,b)).join('');
 $('escolaridad').innerHTML='<h4>Población según nivel de escolaridad, por grupo de edad de referencia</h4>'+verticalChart(m.schooling,'Escolaridad por grupo de edad',{adaptive:true})+'<p class="note"><b>Nota:</b> Los porcentajes no suman 100% porque corresponden a grupos de edad distintos y no incluyen todas las categorías.</p>';
 $('asistencia').innerHTML='<h4>Asistencia escolar</h4>'+verticalChart(m.attendance,'Asistencia escolar',{colors:['#008E95']});
 $('referencias').innerHTML=(window.SDH_PDF?.refs||[]).map(([author,title,tail,url])=>`<p>${esc(author)} <em>${esc(title)}</em> ${esc(tail)} <a href="${esc(url)}" target="_blank" rel="noopener">${esc(url)}</a></p>`).join('');
}
function historyStatus(){if($('historia-estado'))$('historia-estado').textContent=`${Object.keys(histories).length} historias disponibles; las demás conservan su espacio pendiente.`;}
function importHistories(text){const added=H.fromRows(parseCSV(text),records.map(r=>String(get(r,'Clave INEGI'))));histories={...histories,...added};historyImported=true;historyStatus();if(selected)render();return Object.keys(added).length;}
function downloadHistoryTemplate(){const blob=new Blob([H.csv(records,histories)],{type:'text/csv;charset=utf-8'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='Historias_comunidades_SDH.csv';document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),10000);}
async function loadHistories(){
 try{const data=H.fromJSON(await json('historias.json?v='+Date.now()));if(!historyImported)histories=data;}catch{/* Se conserva el respaldo del paquete. */}
 if(historyImported)return;
 const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),12000);let foundCSV=false;
 try{const response=await fetch('historias.csv?v='+Date.now(),{signal:controller.signal});if(response.ok){foundCSV=true;const text=await response.text(),data=H.fromRows(parseCSV(text),records.map(r=>String(get(r,'Clave INEGI'))));if(!historyImported)histories={...histories,...data};}}
 catch(error){if(foundCSV)status('No se cargó el CSV de historias: '+error.message);}
 finally{clearTimeout(timer);historyStatus();if(selected)render();}
}
function dms(value){const m=String(value||'').match(/(\d+)[°º]\s*(\d+)'\s*([\d.]+)"\s*([NSEW])/);return m?(Number(m[1])+Number(m[2])/60+Number(m[3])/3600)*(/[SW]/.test(m[4])?-1:1):null;}

let records=[], source='', geometry=window.SDH_GEOMETRY||null, extras=typeof SDH_EDADES_RESPALDO!=='undefined'?SDH_EDADES_RESPALDO.comunidades:{}, selected=null, generation=0, busy=false;
function status(s){$('estado').textContent=s;}
async function json(url){const controller=new AbortController();const timer=setTimeout(()=>controller.abort(),12000);try{const r=await fetch(url,{signal:controller.signal});if(!r.ok)throw Error('HTTP '+r.status);return await r.json();}finally{clearTimeout(timer);}}
function useRecords(input,label){records=canonical(input).map(supplement);source=label;const previous=selected?`${get(selected,'Clave INEGI')}|${get(selected,'Comunidad / Localidad')}`:null;fillSelector();if(previous){const i=records.findIndex(r=>`${get(r,'Clave INEGI')}|${get(r,'Comunidad / Localidad')}`===previous);if(i>=0)$('comunidad').value=String(i);}$('comunidad').disabled=false;render();status('Base cargada. Selecciona una comunidad para revisar o guardar su PDF.');}
function fillSelector(){
  const previous=$('comunidad').value;
  $('comunidad').replaceChildren();
  records.forEach((r,i)=>{const o=document.createElement('option');o.value=String(i);o.textContent=`${get(r,'Comunidad / Localidad')} · ${get(r,'Municipio')} · ${get(r,'Clave INEGI')}`;$('comunidad').append(o);});
  if([...$('comunidad').options].some(o=>o.value===previous))$('comunidad').value=previous;
  $('comunidad').disabled=records.length===0;
  searchCommunities();
}
function searchCommunities(){
  const term=norm($('buscar').value);
  $('resultados').replaceChildren();
  $('resultados').hidden=!term;
  if(!term){$('busqueda-estado').textContent='';return;}
  let count=0;
  records.forEach((r,i)=>{
    const label=`${get(r,'Comunidad / Localidad')} · ${get(r,'Municipio')} · ${get(r,'Clave INEGI')}`;
    if(!norm(label).includes(term))return;
    count++;
    const button=document.createElement('button');button.type='button';button.textContent=label;
    button.addEventListener('click',()=>{$('comunidad').value=String(i);render();$('busqueda-estado').textContent=`Comunidad seleccionada: ${get(r,'Comunidad / Localidad')}`;});
    $('resultados').append(button);
  });
  $('busqueda-estado').textContent=count?`${count} coincidencia${count===1?'':'s'}. Selecciona un resultado. El catálogo conserva todas las comunidades.`:'Sin coincidencias. El catálogo completo sigue disponible.';
}
async function load(){if(busy)return;busy=true;$('actualizar').disabled=true;status('Consultando la base compartida…');try{const url=`https://docs.google.com/spreadsheets/d/${CONFIG.sheetId}/gviz/tq?tqx=out:json&sheet=${encodeURIComponent(CONFIG.sheet)}`;const controller=new AbortController();const timer=setTimeout(()=>controller.abort(),15000);let text;try{const r=await fetch(url,{signal:controller.signal});if(!r.ok)throw Error('No se pudo consultar Sheets');text=await r.text();}finally{clearTimeout(timer);}const match=text.match(/setResponse\(([\s\S]*)\);?\s*$/);if(!match)throw Error('La fuente no devolvió una tabla.');const data=JSON.parse(match[1]);if(data.status==='error'||!data.table)throw Error('La pestaña no está disponible.');useRecords(recordsFromRows(data.table.rows.map(r=>r.c.map(c=>c?.v??null)),data.table.cols.map(c=>c.label)),`Base compartida · consulta ${new Date().toLocaleString('es-MX')}`);}catch(error){if(records.length){status('No se pudo actualizar. Se conserva la última base cargada: '+source);}else{try{const backup=await json('datos-respaldo.json');useRecords(backup.records,`Copia de consulta del ${backup.fechaConsulta} · sin actualización en línea`);}catch{status('No se pudo leer la base. Importa un CSV o abre el proyecto mediante un servidor web.');}}}finally{busy=false;$('actualizar').disabled=false;}}
function extraFor(r){return extras[`${get(r,'Clave INEGI')}|${get(r,'Comunidad / Localidad')}`]??null;}
function demographicCard(label,value,note){return `<div class="demographic-card"><div class="demographic-label"><b>${labelHTML(label)}</b><small>${esc(note)}</small></div><strong>${esc(value)}</strong></div>`;}
function pyramid(r,extra){
  const raw=rawFor(r),total=number(raw.POBTOT??get(r,'Población Total'));
  const bins=extra?.edades;
  if(!Array.isArray(bins)||!bins.length||total===null||total<=0){
    $('piramide').innerHTML='<div class="missing">Pirámide poblacional pendiente<small>Se necesitan conteos por edad y sexo; los porcentajes totales no permiten calcularlos.</small></div>';return;
  }
  try{
    const rows=[...bins].sort((a,b)=>a.desde-b.desde);
    let previous=-1,sumH=0,sumM=0,unknown=0;
    const read=v=>missing(v)||v==='*'?null:(Number.isInteger(v)&&v>=0?v:(()=>{throw Error('Conteo inválido');})());
    const data=rows.map(b=>{
      if(!Number.isInteger(b.desde)||b.desde<0||b.desde<=previous||!(b.hasta===null||(Number.isInteger(b.hasta)&&b.hasta>=b.desde)))throw Error('Intervalos inválidos');
      previous=b.hasta===null?Infinity:b.hasta;
      const h=read(b.hombres),m=read(b.mujeres);
      if(h===null)unknown++;else sumH+=h;
      if(m===null)unknown++;else sumM+=m;
      return {...b,h,m};
    });
    const hom=number(raw.POBMAS??get(r,'Población Hombres')),muj=number(raw.POBFEM??get(r,'Población Mujeres'));
    if(sumH+sumM>total||(hom!==null&&sumH>hom)||(muj!==null&&sumM>muj))throw Error('Suma mayor al total');
    const scale=Math.ceil(Math.max(1,...data.flatMap(b=>[b.h??0,b.m??0]).map(v=>v/total*100))/2)*2;
    const chartHeight=data.length*10+34;
    const center=190,bw=135;
    let svg=`<svg viewBox="0 0 340 ${chartHeight}" role="img" aria-label="Pirámide por edad y sexo; porcentajes sobre población total, edades a la izquierda.">`;
    svg+=`<text x="8" y="${15+data.length*10/2}" transform="rotate(-90 8 ${15+data.length*10/2})" text-anchor="middle" font-size="9" font-weight="bold" fill="#54585A">Años</text>`;
    [...data].reverse().forEach((b,i)=>{
      const y=15+i*10;const label=`${b.desde}${b.hasta===null?'+':'–'+b.hasta}`;
      svg+=`<text x="43" y="${y+7}" text-anchor="end" font-size="8.5" fill="#63666A">${label}</text>`;
      if(b.h!==null){const w=b.h/total*100/scale*bw;svg+=`<rect x="${center-w}" y="${y}" width="${w}" height="7" fill="#319356"><title>${label}, hombres: ${b.h}</title></rect>`;}
      if(b.m!==null){const w=b.m/total*100/scale*bw;svg+=`<rect x="${center}" y="${y}" width="${w}" height="7" fill="#84369B"><title>${label}, mujeres: ${b.m}</title></rect>`;}
    });
    const ay=chartHeight-15;svg+=`<line x1="${center-bw}" y1="${ay}" x2="${center+bw}" y2="${ay}" stroke="#C8C9C7"/>`;
    for(let tick=-scale;tick<=scale;tick+=2){const tx=center+bw*tick/scale;svg+=`<line x1="${tx}" y1="${ay}" x2="${tx}" y2="${ay+3}" stroke="#C8C9C7"/><text x="${tx}" y="${ay+12}" text-anchor="middle" font-size="9">${Math.abs(tick)}</text>`;}
    svg+=`<text x="334" y="${ay+12}" font-size="9">%</text></svg>`;
    const partial=unknown>0||extra.parcial||sumH+sumM<total;
    $('piramide').innerHTML=`<div class="sex-callout men"><strong>${esc(percentText(ratio(raw.POBMAS??get(r,'Población Hombres'),total)))}</strong><span>Hombres</span></div><div class="sex-callout women"><strong>${esc(percentText(ratio(raw.POBFEM??get(r,'Población Mujeres'),total)))}</strong><span>Mujeres</span></div>`+svg+(partial?'<p class="note">Distribución parcial: faltan valores por edad o sexo.</p>':'');
  }catch{$('piramide').innerHTML='<div class="missing">Distribución por edad inconsistente: revisar intervalos y totales.</div>';}
}

function polygonContains(point,ring){let inside=false;for(let i=0,j=ring.length-1;i<ring.length;j=i++){const [xi,yi]=ring[i],[xj,yj]=ring[j];if((yi>point[1])!==(yj>point[1])&&point[0]<(xj-xi)*(point[1]-yi)/(yj-yi)+xi)inside=!inside;}return inside;}
function polygons(feature){if(feature.geometry?.type==='Polygon')return [feature.geometry.coordinates];if(feature.geometry?.type==='MultiPolygon')return feature.geometry.coordinates;return [];}
function contains(point,feature){return polygons(feature).some(p=>polygonContains(point,p[0])&&!p.slice(1).some(hole=>polygonContains(point,hole)));}
function validGeometry(g){if(g.type!=='FeatureCollection'||!Array.isArray(g.features)||!g.features.length)throw Error('Se requiere un FeatureCollection municipal.');g.features.forEach(f=>{if(!String(f.properties?.cvegeo??'').match(/^11\d{3}$/)||!polygons(f).length)throw Error('Municipios sin clave INEGI de Guanajuato.');for(const p of polygons(f))for(const ring of p){if(ring.length<4||ring.some(pt=>!Array.isArray(pt)||pt.length<2||!Number.isFinite(pt[0])||!Number.isFinite(pt[1])||pt[0]<-180||pt[0]>180||pt[1]<-90||pt[1]>90))throw Error('Coordenadas GeoJSON inválidas.');}});if(new Set(g.features.map(f=>f.properties.cvegeo)).size!==46)throw Error('Se requieren los 46 municipios para mostrar Guanajuato completo.');return g;}
function drawMap(r,point=null,pointSource=''){if(!geometry){$('mapa').innerHTML='<div class="missing">Mapa de Guanajuato pendiente<small>No se pudo cargar la cartografía. Puedes incorporar el GeoJSON oficial.</small></div>';$('map-note').textContent='No se representa una ubicación aproximada o aleatoria.';return;}const features=geometry.features;const coords=features.flatMap(f=>polygons(f).flat(2));const xs=coords.map(p=>p[0]),ys=coords.map(p=>p[1]);const xmin=xs.reduce((a,b)=>Math.min(a,b),Infinity),xmax=xs.reduce((a,b)=>Math.max(a,b),-Infinity),ymin=ys.reduce((a,b)=>Math.min(a,b),Infinity),ymax=ys.reduce((a,b)=>Math.max(a,b),-Infinity);const cos=Math.cos((ymin+ymax)/2*Math.PI/180);const scale=Math.min(250/((xmax-xmin)*cos),115/(ymax-ymin));const dx=(300-(xmax-xmin)*cos*scale)/2,dy=(130-(ymax-ymin)*scale)/2;const project=p=>[dx+(p[0]-xmin)*cos*scale,dy+(ymax-p[1])*scale];const mun=String(get(r,'Clave INEGI')).slice(0,5);let svg='<svg viewBox="0 0 300 150" role="img" aria-label="Mapa completo de Guanajuato con límites municipales">';for(const f of features){const code=String(f.properties.cvegeo??'');const path=polygons(f).map(p=>p.map(ring=>ring.map((pt,i)=>{const [x,y]=project(pt);return `${i?'L':'M'}${x.toFixed(2)},${y.toFixed(2)}`;}).join('')+'Z').join('')).join('');svg+=`<path d="${path}" fill="${code===mun?'#69B3E7':'#C8D8EB'}" stroke="#fff" stroke-width=".55" fill-rule="evenodd"><title>${esc(f.properties.nomgeo??code)}</title></path>`;}const matching=features.find(f=>String(f.properties.cvegeo)===mun);if(point&&matching&&contains(point,matching)){const [x,y]=project(point);svg+=`<circle cx="${x}" cy="${y}" r="3" fill="#004B87" stroke="white" stroke-width="1.2"/><path d="M${x},${y}L${x},138L150,138" stroke="#004B87" fill="none"/><text x="150" y="149" text-anchor="middle" font-size="9" fill="#004B87">${esc(get(r,'Comunidad / Localidad'))}</text>`;$('map-note').textContent='Municipio resaltado · Punto de localidad: '+pointSource;}else{$('map-note').textContent='Municipio resaltado. Ubicación de la comunidad pendiente de validación.';}svg+='</svg>';$('mapa').innerHTML=svg;}
async function loadCommunityLocation(r,extra,token){
 const key=String(get(r,'Clave INEGI')),mapPath=window.SDH_MAPAS.pathFor(key);
 $('mapa').classList.remove('team-map','community-map');
 if(mapPath){
  const image=new Image();image.alt='Mapa del equipo: '+get(r,'Comunidad / Localidad')+', red vial y ubicación en Guanajuato';
  $('mapa').replaceChildren(image);$('mapa').classList.add(key==='110030008'?'team-map':'community-map');$('map-note').textContent='';
  image.onerror=()=>{if(token!==generation)return;$('mapa').classList.remove('team-map','community-map');drawMap(r);$('map-note').textContent='No se pudo cargar el mapa de esta comunidad. Se conserva el mapa municipal; revisa el archivo '+mapPath+'.';};
  image.src=mapPath;return;
 }
 drawMap(r);const raw=rawFor(r),latRaw=dms(raw.LATITUD),lonRaw=dms(raw.LONGITUD);if(latRaw!==null&&lonRaw!==null){drawMap(r,[lonRaw,latRaw],"ITER 2020 de la matriz; coordenadas de localidad");return;}if(extra?.ubicacion?.validada===true){const lat=extra.ubicacion.latitud,lon=extra.ubicacion.longitud;if(typeof lat==='number'&&typeof lon==='number'&&Number.isFinite(lat)&&Number.isFinite(lon))drawMap(r,[lon,lat],extra.ubicacion.fuente||'Fuente pendiente');return;}if(norm(get(r,'Comunidad / Localidad'))==='san agustin')return;try{const response=await json(`https://gaia.inegi.org.mx/wscatgeo/v2/localidades/${get(r,'Clave INEGI')}`);if(token!==generation)return;const list=Array.isArray(response.datos)?response.datos:[response.datos];const item=list.find(x=>x&&norm(x.nomgeo)===norm(get(r,'Comunidad / Localidad')));if(item){const lat=number(item.latitud),lon=number(item.longitud);if(lat!==null&&lon!==null)drawMap(r,[lon,lat],'Catálogo INEGI; coincidencia de clave y nombre');}}catch{/* Se conserva el mapa estatal y la nota de ubicación pendiente. */}}
function render(){
 if(!$('comunidad').options.length)return;const r=records[Number($('comunidad').value)];if(!r)return;
 selected=r;const token=++generation;$('infografia').hidden=false;$('exportar').disabled=false;
 $('nombre').textContent=get(r,'Comunidad / Localidad');$('identificacion').textContent=`${get(r,'Municipio')}, Guanajuato · Clave INEGI: ${get(r,'Clave INEGI')}`;const header=window.SDH_PDF.headerLayout($('nombre').textContent,$('identificacion').textContent,'B');$('nombre').style.fontSize=header.name.pt+'pt';
 $('revision').textContent=`${records.length} comunidades en catálogo · Vista previa para revisión · ${source}`;
 reunionRender(r);loadCommunityLocation(r,extraFor(r),token);
}
let printing=false;
async function exportPDF(){
 if(!selected||printing)return;
 printing=true;$('exportar').disabled=true;status('Generando PDF A2…');
 try{
  if(!window.SDH_PDF)throw Error('No se cargó el exportador PDF. Recarga la página.');
  await window.SDH_PDF.download({record:selected,raw:rawFor(selected),extra:extraFor(selected),geometry,history:$('historia-texto').textContent});
  status('PDF A2 descargado: una página de 59.4 × 42 cm.');
 }catch(e){status('No se pudo generar el PDF: '+e.message);}
 finally{printing=false;$('exportar').disabled=false;}
}

if(typeof document!=='undefined'){
  $('buscar').addEventListener('input',searchCommunities);$('comunidad').addEventListener('change',render);$('actualizar').addEventListener('click',load);
  $('csv').addEventListener('change',()=>importFile('csv',t=>useRecords(recordsFromRows(parseCSV(t)),'CSV importado en esta sesión')));
  $('extra').addEventListener('change',()=>importFile('extra',t=>{const x=JSON.parse(t);if(!x.comunidades||Array.isArray(x.comunidades)||typeof x.comunidades!=='object')throw Error('Falta el objeto comunidades.');extras={...extras,...x.comunidades};render();}));
  $('geo').addEventListener('change',()=>importFile('geo',t=>{geometry=validGeometry(JSON.parse(t));render();}));
  $('exportar').addEventListener('click',exportPDF);
  $('historias-csv').addEventListener('change',()=>importFile('historias-csv',t=>{const count=importHistories(t);status(`${count} historias incorporadas para esta sesión.`);}));
  $('historias-plantilla').addEventListener('click',downloadHistoryTemplate);historyStatus();
  Promise.allSettled([json('complementos.json').then(x=>{extras={...extras,...(x.comunidades??{})};}),json('guanajuato-municipios.geojson').then(x=>{geometry=validGeometry(x);}).catch(()=>json(CONFIG.geoUrl).then(x=>{geometry=validGeometry(x);})).catch(()=>{})]).then(()=>{if(selected)render();});if(typeof SDH_RESPALDO!=='undefined'&&Array.isArray(SDH_RESPALDO.records)){useRecords(SDH_RESPALDO.records,`Copia de consulta del ${SDH_RESPALDO.fechaConsulta} · pendiente de actualización en línea`);}load();loadHistories();
}
if(typeof module!=='undefined')module.exports={number,percentage,parseCSV,recordsFromRows,canonical,ratio,contains,validGeometry,historyFor,importHistories};

})();
