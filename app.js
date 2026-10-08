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
function recordsFromRows(rows,labels=[]){const isKey=c=>norm(c)==='clave inegi';let header=labels;let start=0;const h=rows.findIndex(r=>r.some(isKey));if(h>=0){header=rows[h];start=h+1;}if(!header.some(isKey))throw Error('No se encontró el encabezado Clave INEGI.');const key=header.findIndex(isKey);const out=rows.slice(start).filter(r=>/^11\d{7}$/.test(String(r[key]??'').trim().padStart(9,'0'))).map(r=>Object.fromEntries(header.map((k,i)=>[String(k).trim(),r[i]??null])));if(!out.length)throw Error('No se encontraron comunidades de Guanajuato.');return out;}
function canonical(records){return records.map(r=>Object.fromEntries(Object.entries(r).map(([k,v])=>[norm(k),v])));}
const get=(r,key)=>r[norm(key)];
function metric(label,value,digits=0,highlight=false){const text=display(value,digits);return `<div class="metric${highlight?' highlight':''}"><span>${esc(label)}</span><strong${number(value)===null?' class="unavailable"':''}>${esc(text)}</strong></div>`;}
function textMetric(label,value){return `<div class="metric"><span>${esc(label)}</span><strong${missing(value)?' class="unavailable"':''}>${esc(missing(value)?'Dato no disponible':value)}</strong></div>`;}
function bar(label,value){const p=percentage(value);return `<div class="bar"><span>${esc(label)}</span>${p===null?`<strong class="unavailable">${esc(percentText(value))}</strong>`:`<div class="track"><div class="fill" style="width:${p}%"></div></div><strong>${p.toFixed(1)}%</strong>`}</div>`;}
function ratio(numerator,denominator){const a=number(numerator),b=number(denominator);return a!==null&&b!==null&&a>=0&&b>0&&a<=b?a/b:null;}
function ratioMetric(label,numerator,denominator,digits=1){const value=ratio(numerator,denominator);return `<div class="metric"><span>${esc(label)}</span><strong${value===null?' class="unavailable"':''}>${value===null?'Dato no disponible':(value*100).toFixed(digits)+'%'}</strong></div>`;}
const reunion=window.SDH_REUNION||{iter:{},historia:{}};
function rawFor(r){return reunion.iter[`${get(r,'Clave INEGI')}|${get(r,'Comunidad / Localidad')}`]||{};}
function supplement(r){
 const raw=rawFor(r);
 for(const [label,field] of [['% Tinaco','VPH_TINACO'],['% Cisterna','VPH_CISTER'],['% Motocicleta','VPH_MOTO'],['% Bicicleta','VPH_BICI']]){
  if(missing(get(r,label)))r[norm(label)]=ratio(raw[field],raw.VIVPARH_CV);
 }
 return r;
}
function circular(items,total,label){
 const values=items.map(x=>number(x[1])),den=number(total);
 if(den===null||den<=0||values.some(x=>x===null||x<0)||values.reduce((a,b)=>a+b,0)>den)return '<div class="missing">Gráfica pendiente: conteos incompletos o inconsistentes.</div>';
 const sum=values.reduce((a,b)=>a+b,0),list=items.map((x,i)=>[x[0],values[i]]);
 if(sum<den)list.push(['Resto no clasificado',den-sum]);
 const colors=['#008E95','#84369B','#E66D42','#347D62'];let start=-Math.PI/2,svg='<svg viewBox="0 0 120 120" role="img" aria-label="'+esc(label)+'">',legend='';
 list.forEach(([name,n],i)=>{const angle=n/den*2*Math.PI,end=start+angle,c=colors[i%colors.length];if(n===den)svg+=`<circle cx="60" cy="60" r="55" fill="${c}"/>`;else if(n>0)svg+=`<path d="M60,60 L${60+55*Math.cos(start)},${60+55*Math.sin(start)} A55,55 0 ${angle>Math.PI?1:0},1 ${60+55*Math.cos(end)},${60+55*Math.sin(end)} Z" fill="${c}" stroke="white" stroke-width="1"/>`;legend+=`<div><i style="background:${c}"></i><span>${esc(name)}</span><strong>${(n/den*100).toFixed(1)}%</strong></div>`;start=end;});
 return `<div class="pie">${svg}</svg><div class="pie-legend">${legend}</div></div><p class="note">${esc(label)} · Base: ${display(den)} personas.</p>`;
}
function reunionRender(r){
 const raw=rawFor(r),key=`${get(r,'Clave INEGI')}|${get(r,'Comunidad / Localidad')}`;
 const h=reunion.historia[key];
 const isAlonso=String(get(r,'Clave INEGI'))==='110030008';
 const approvedHistory='Alonso Yáñez es una comunidad indígena del municipio de San Miguel de Allende, Guanajuato, fundada aproximadamente entre 1905 y 1921. Su nombre se atribuye a un hacendado que vivió antiguamente en el lugar. Desde 2012 forma parte del Padrón de Pueblos y Comunidades Indígenas y Afromexicanas del Estado de Guanajuato, mediante el cual se reconoce su identidad y se promueve su desarrollo conforme a sus tradiciones y cultura.';
 $('historia-texto').textContent=isAlonso?approvedHistory:(h?.texto||'Reseña histórica pendiente.');
 $('historia-fuente').textContent='';
 $('territorio').innerHTML=[textMetric('Municipio',get(r,'Municipio')),textMetric('Altitud',raw.ALTITUD===undefined?'Dato no disponible':`${display(raw.ALTITUD)} m`),textMetric('Latitud',raw.LATITUD),textMetric('Longitud',raw.LONGITUD) ].join('');
 $('conyugal').innerHTML=circular([['Soltera o nunca unida',raw.P12YM_SOLT],['Casada o unida',raw.P12YM_CASA],['Separada, divorciada o viuda',raw.P12YM_SEPA]],raw.P_12YMAS,'Población de 12 años y más');
 $('actividad').innerHTML=circular([['Económicamente activa',raw.PEA],['No económicamente activa',raw.PE_INAC]],raw.P_12YMAS,'Población de 12 años y más');
 $('ocupacion-grafica').innerHTML=circular([['Ocupada',raw.POCUPADA],['Desocupada',raw.PDESOCUP]],raw.PEA,'Población económicamente activa');
 $('economia-sexo').innerHTML='<h4>Composición por sexo · dentro de la PEA y de la población ocupada</h4>'+bar('PEA · Hombres',ratio(raw.PEA_M,raw.PEA))+bar('PEA · Mujeres',ratio(raw.PEA_F,raw.PEA))+bar('Población ocupada · Hombres',ratio(raw.POCUPADA_M,raw.POCUPADA))+bar('Población ocupada · Mujeres',ratio(raw.POCUPADA_F,raw.POCUPADA));
 $('migracion').innerHTML=ratioMetric('Nacida en otra entidad · población total',raw.PNACOE,raw.POBTOT)+ratioMetric('Residía en otra entidad en marzo de 2015 · población de 5 años y más',raw.PRESOE15,raw.P_5YMAS);
 $('instituciones').innerHTML=bar('IMSS',ratio(raw.PDER_IMSS,raw.PDER_SS))+bar('Secretaría de Salud (2020)',ratio(raw.PDER_SEGP,raw.PDER_SS))+bar('ISSSTE',ratio(raw.PDER_ISTE,raw.PDER_SS))+'<p class="note">Una persona puede estar afiliada a más de una institución.</p>';
 $('escolaridad').innerHTML=bar('Sin escolaridad (15+)',ratio(raw.P15YM_SE,raw.P_15YMAS))+bar('Primaria completa (15+)',ratio(raw.P15PRI_CO,raw.P_15YMAS))+bar('Secundaria completa (15+)',ratio(raw.P15SEC_CO,raw.P_15YMAS))+bar('Educación posbásica (18+)',ratio(raw.P18YM_PB,raw.P_18YMAS))+'<p class="note">Los grupos usan edades de referencia distintas y no forman una distribución completa.</p>';
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
function demographicCard(label,value,note){return `<div class="demographic-card"><b>${esc(label)}</b><strong>${esc(value)}</strong><small>${esc(note)}</small></div>`;}
function medianMetric(r,extra){
 const official=number(get(r,'Edad mediana'));
 if(official!==null)return demographicCard('Edad mediana',display(official,1),`La mitad de la población tiene ${display(official,1)} años o menos.`);
 const total=number(get(r,'Población Total')),hom=number(get(r,'Población Hombres')),muj=number(get(r,'Población Mujeres'));
 const bins=Array.isArray(extra?.edades)?[...extra.edades].sort((a,b)=>a.desde-b.desde):[];
 let expected=0,sum=0,sh=0,sm=0,valid=total>0&&bins.length>0&&!extra?.parcial;
 for(const b of bins){
  if(b.desde!==expected||!Number.isInteger(b.hombres)||b.hombres<0||!Number.isInteger(b.mujeres)||b.mujeres<0||(b.hasta!==null&&b.hasta-b.desde!==4))valid=false;
  expected=b.hasta===null?Infinity:b.hasta+1;sh+=b.hombres;sm+=b.mujeres;sum+=b.hombres+b.mujeres;
 }
 if(!valid||sum!==total||sh!==hom||sm!==muj||bins.at(-1)?.hasta!==null)return textMetric('Edad mediana','Pendiente de fuente');
 let previous=0;
 for(const b of bins){const count=b.hombres+b.mujeres;if(previous+count>=total/2&&count>0){
  if(b.hasta===null)return textMetric('Edad mediana','Pendiente de fuente');
  const estimate=b.desde+((total/2-previous)/count)*(b.hasta-b.desde+1);
  return demographicCard('Edad mediana estimada',display(estimate,1),`Según la estimación, la mitad de la población tiene ${display(estimate,1)} años o menos.`);
 }previous+=count;}
 return textMetric('Edad mediana','Pendiente de fuente');
}

function pyramid(r,extra){
  const total=number(get(r,'Población Total'));
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
    const hom=number(get(r,'Población Hombres')),muj=number(get(r,'Población Mujeres'));
    if(sumH+sumM>total||(hom!==null&&sumH>hom)||(muj!==null&&sumM>muj))throw Error('Suma mayor al total');
    const scale=Math.ceil(Math.max(1,...data.flatMap(b=>[b.h??0,b.m??0]).map(v=>v/total*100))/2)*2;
    const chartHeight=data.length*10+34;
    const center=190,bw=135;
    let svg=`<svg viewBox="0 0 340 ${chartHeight}" role="img" aria-label="Pirámide por edad y sexo; porcentajes sobre población total, edades a la izquierda.">`;
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
    $('piramide').innerHTML=`<div class="sex-callout men"><strong>${esc(percentText(get(r,'% Hombres')))}</strong><span>Hombres</span></div><div class="sex-callout women"><strong>${esc(percentText(get(r,'% Mujeres')))}</strong><span>Mujeres</span></div>`+svg+(partial?'<p class="note">Distribución parcial: faltan valores por edad o sexo.</p>':'');
  }catch{$('piramide').innerHTML='<div class="missing">Distribución por edad inconsistente: revisar intervalos y totales.</div>';}
}

function polygonContains(point,ring){let inside=false;for(let i=0,j=ring.length-1;i<ring.length;j=i++){const [xi,yi]=ring[i],[xj,yj]=ring[j];if((yi>point[1])!==(yj>point[1])&&point[0]<(xj-xi)*(point[1]-yi)/(yj-yi)+xi)inside=!inside;}return inside;}
function polygons(feature){if(feature.geometry?.type==='Polygon')return [feature.geometry.coordinates];if(feature.geometry?.type==='MultiPolygon')return feature.geometry.coordinates;return [];}
function contains(point,feature){return polygons(feature).some(p=>polygonContains(point,p[0])&&!p.slice(1).some(hole=>polygonContains(point,hole)));}
function validGeometry(g){if(g.type!=='FeatureCollection'||!Array.isArray(g.features)||!g.features.length)throw Error('Se requiere un FeatureCollection municipal.');g.features.forEach(f=>{if(!String(f.properties?.cvegeo??'').match(/^11\d{3}$/)||!polygons(f).length)throw Error('Municipios sin clave INEGI de Guanajuato.');for(const p of polygons(f))for(const ring of p){if(ring.length<4||ring.some(pt=>!Array.isArray(pt)||pt.length<2||!Number.isFinite(pt[0])||!Number.isFinite(pt[1])||pt[0]<-180||pt[0]>180||pt[1]<-90||pt[1]>90))throw Error('Coordenadas GeoJSON inválidas.');}});if(new Set(g.features.map(f=>f.properties.cvegeo)).size!==46)throw Error('Se requieren los 46 municipios para mostrar Guanajuato completo.');return g;}
function drawMap(r,point=null,pointSource=''){if(!geometry){$('mapa').innerHTML='<div class="missing">Mapa de Guanajuato pendiente<small>No se pudo cargar la cartografía. Puedes incorporar el GeoJSON oficial.</small></div>';$('map-note').textContent='No se representa una ubicación aproximada o aleatoria.';return;}const features=geometry.features;const coords=features.flatMap(f=>polygons(f).flat(2));const xs=coords.map(p=>p[0]),ys=coords.map(p=>p[1]);const xmin=xs.reduce((a,b)=>Math.min(a,b),Infinity),xmax=xs.reduce((a,b)=>Math.max(a,b),-Infinity),ymin=ys.reduce((a,b)=>Math.min(a,b),Infinity),ymax=ys.reduce((a,b)=>Math.max(a,b),-Infinity);const cos=Math.cos((ymin+ymax)/2*Math.PI/180);const scale=Math.min(250/((xmax-xmin)*cos),115/(ymax-ymin));const dx=(300-(xmax-xmin)*cos*scale)/2,dy=(130-(ymax-ymin)*scale)/2;const project=p=>[dx+(p[0]-xmin)*cos*scale,dy+(ymax-p[1])*scale];const mun=String(get(r,'Clave INEGI')).slice(0,5);let svg='<svg viewBox="0 0 300 150" role="img" aria-label="Mapa completo de Guanajuato con límites municipales">';for(const f of features){const code=String(f.properties.cvegeo??'');const path=polygons(f).map(p=>p.map(ring=>ring.map((pt,i)=>{const [x,y]=project(pt);return `${i?'L':'M'}${x.toFixed(2)},${y.toFixed(2)}`;}).join('')+'Z').join('')).join('');svg+=`<path d="${path}" fill="${code===mun?'#69B3E7':'#C8D8EB'}" stroke="#fff" stroke-width=".55" fill-rule="evenodd"><title>${esc(f.properties.nomgeo??code)}</title></path>`;}const matching=features.find(f=>String(f.properties.cvegeo)===mun);if(point&&matching&&contains(point,matching)){const [x,y]=project(point);svg+=`<circle cx="${x}" cy="${y}" r="3" fill="#004B87" stroke="white" stroke-width="1.2"/><path d="M${x},${y}L${x},138L150,138" stroke="#004B87" fill="none"/><text x="150" y="149" text-anchor="middle" font-size="9" fill="#004B87">${esc(get(r,'Comunidad / Localidad'))}</text>`;$('map-note').textContent='Municipio resaltado · Punto de localidad: '+pointSource;}else{$('map-note').textContent='Municipio resaltado. Ubicación de la comunidad pendiente de validación.';}svg+='</svg>';$('mapa').innerHTML=svg;}
async function loadCommunityLocation(r,extra,token){if(String(get(r,'Clave INEGI'))==='110030008'){$('mapa').innerHTML='<img src="assets/mapa-alonso-yanez.jpeg" alt="Mapa del equipo: Alonso Yáñez, red vial y ubicación en Guanajuato">';$('mapa').classList.add('team-map');$('map-note').textContent='';return;}$('mapa').classList.remove('team-map');drawMap(r);const raw=rawFor(r),latRaw=dms(raw.LATITUD),lonRaw=dms(raw.LONGITUD);if(latRaw!==null&&lonRaw!==null){drawMap(r,[lonRaw,latRaw],"ITER 2020 de la matriz; coordenadas de localidad");return;}if(extra?.ubicacion?.validada===true){const lat=extra.ubicacion.latitud,lon=extra.ubicacion.longitud;if(typeof lat==='number'&&typeof lon==='number'&&Number.isFinite(lat)&&Number.isFinite(lon))drawMap(r,[lon,lat],extra.ubicacion.fuente||'Fuente pendiente');return;}if(norm(get(r,'Comunidad / Localidad'))==='san agustin')return;try{const response=await json(`https://gaia.inegi.org.mx/wscatgeo/v2/localidades/${get(r,'Clave INEGI')}`);if(token!==generation)return;const list=Array.isArray(response.datos)?response.datos:[response.datos];const item=list.find(x=>x&&norm(x.nomgeo)===norm(get(r,'Comunidad / Localidad')));if(item){const lat=number(item.latitud),lon=number(item.longitud);if(lat!==null&&lon!==null)drawMap(r,[lon,lat],'Catálogo INEGI; coincidencia de clave y nombre');}}catch{/* Se conserva el mapa estatal y la nota de ubicación pendiente. */}}
function render(){
 if(!$('comunidad').options.length)return;
 const r=records[Number($('comunidad').value)];if(!r)return;
 selected=r;const token=++generation;const v=k=>get(r,k);const ex=extraFor(r);const raw=rawFor(r);
 $('infografia').hidden=false;$('exportar').disabled=false;
 $('nombre').textContent=v('Comunidad / Localidad');
 $('identificacion').textContent=`${v('Municipio')}, Guanajuato · Clave INEGI: ${v('Clave INEGI')}`;
 $('poblacion').textContent=display(v('Población Total'));
 $('sex').innerHTML=`Hombres ${esc(percentText(v('% Hombres')))}<br>Mujeres ${esc(percentText(v('% Mujeres')))}`;
 pyramid(r,ex);
 $('demografia').innerHTML=demographicCard('Relación hombres-mujeres',display(v('Relación Hombres-Mujeres'),1),number(v('Relación Hombres-Mujeres'))===null?'Dato pendiente.':`Existen aproximadamente ${Math.round(number(v('Relación Hombres-Mujeres')))} hombres por cada 100 mujeres.`)+medianMetric(r,ex);
 $('etnicidad').innerHTML=textMetric('Pueblo indígena de autoadscripción',v('Pueblo Originario'))+ratioMetric('Población en hogares indígenas',raw.PHOG_IND,raw.POBTOT)+ratioMetric('Población de 3 años y más hablante de lengua indígena',raw.P3YM_HLI,raw.P_3YMAS)+ratioMetric('Hablantes de lengua indígena (3+) que no hablan español',raw.P3HLINHE,raw.P3YM_HLI)+ratioMetric('Población que se considera afromexicana o afrodescendiente',raw.POB_AFRO,raw.POBTOT);
 $('fecundidad').innerHTML=metric('Promedio de hijas e hijos nacidos vivos por mujer (12 años y más)',v('Promedio Hijas(os) Nacidas(os) Vivas(os)'),2);
 $('vivienda').innerHTML=metric('Ocupantes por vivienda',v('Promedio Ocupantes por Vivienda'),2,true)+metric('Ocupantes por cuarto',v('Promedio Ocupantes por Cuarto'),2)+textMetric('Ocupantes por dormitorio','Dato no disponible');
 $('servicios').innerHTML=[['Electricidad','% Electricidad'],['Agua entubada','% Agua Entubada'],['Drenaje','% Drenaje'],['Servicio sanitario','% Servicio Sanitario'],['Tinaco','% Tinaco'],['Cisterna o aljibe','% Cisterna']].map(([a,b])=>bar(a,v(b))).join('');
 $('bienes').innerHTML=[['Refrigerador','% Refrigerador'],['Lavadora','% Lavadora'],['Automóvil','% Automóvil'],['Motocicleta','% Motocicleta'],['Bicicleta','% Bicicleta']].map(([a,b])=>bar(a,v(b))).join('');
 $('tic').innerHTML=[['Televisor','% TV'],['Teléfono celular','% Teléfono Celular'],['Internet','% Internet'],['Computadora / laptop','% Computadora / Laptop']].map(([a,b])=>bar(a,v(b))).join('');
 $('condiciones').innerHTML=textMetric('Grado de marginación',v('Grado Marginación (CONAPO)'))+textMetric('Grado de rezago social',v('Grado Rezago Social (CONEVAL)'));
 $('referencia').textContent='';
 $('discapacidad').innerHTML=ratioMetric('Población con discapacidad',raw.PCON_DISC,raw.POBTOT)+ratioMetric('Población con limitación',raw.PCON_LIMI,raw.POBTOT)+ratioMetric('Personas con problema o condición mental',raw.PCLIM_PMEN,raw.POBTOT);
 $('salud').innerHTML=ratioMetric('Población afiliada a servicios de salud',v('% Afiliación Salud'),1,1);
 $('economia').innerHTML='';
 $('educacion').innerHTML=metric('Grado promedio de escolaridad (años) · población de 15 años y más',v('Grado Promedio Escolaridad (15+)'),2)+ratioMetric('Tasa de analfabetismo · población de 15 años y más',v('% Analfabetismo'),1)+ratioMetric('Población de 6 a 11 años que asiste a la escuela',v('Asistencia Escolar (6 a 11)'),1);
 $('fuentes').textContent=`INEGI, Censo de Población y Vivienda 2020 (ITER); ${String(v('Clave INEGI'))==='110030008'?'mapa local proporcionado por el equipo, fuente y fecha por documentar':'Marco Geoestadístico de INEGI, diciembre de 2025'}; catálogo estatal de pueblos y comunidades indígenas y afromexicanas; CONAPO 2020; CONEVAL 2020; reseña histórica proporcionada por el equipo. Base: ${source}.`;
 $('alcance').textContent='Las cifras corresponden a la fuente indicada y pueden tener universos distintos. Dato no disponible no equivale a cero; * indica dato reservado. La edad mediana es una estimación agrupada, no un dato oficial.';
 $('referencias').innerHTML=(window.SDH_PDF?.refs||[]).map(([label,url,type])=>`<a href="${esc(url)}" target="_blank" rel="noopener">${esc(label)}</a>`).join('');
 $('revision').textContent=`${records.length} comunidades en catálogo · Vista previa para revisión · ${source}`;
 reunionRender(r);loadCommunityLocation(r,ex,token);
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
  Promise.allSettled([json('complementos.json').then(x=>{extras={...extras,...(x.comunidades??{})};}),json('guanajuato-municipios.geojson').then(x=>{geometry=validGeometry(x);}).catch(()=>json(CONFIG.geoUrl).then(x=>{geometry=validGeometry(x);})).catch(()=>{})]).then(()=>{if(selected)render();});if(typeof SDH_RESPALDO!=='undefined'&&Array.isArray(SDH_RESPALDO.records)){useRecords(SDH_RESPALDO.records,`Copia de consulta del ${SDH_RESPALDO.fechaConsulta} · pendiente de actualización en línea`);}load();
}
if(typeof module!=='undefined')module.exports={number,percentage,parseCSV,recordsFromRows,canonical,ratio,contains,validGeometry};

})();
