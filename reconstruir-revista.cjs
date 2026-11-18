'use strict';
const fs=require('fs'),path=require('path');
const C=require('./consolidado-pdf.js'),maps=require('./mapas.js');
const html=fs.readFileSync('index.html','utf8');
function embedded(n){return JSON.parse(html.match(new RegExp('window\\.'+n+'\\s*=\\s*(\\{[\\s\\S]*?\\});'))[1]);}
const base=embedded('SDH_RESPALDO'),ages=embedded('SDH_EDADES_RESPALDO'),reunion=embedded('SDH_REUNION'),history=embedded('SDH_HISTORIAS'),geo=embedded('SDH_GEOMETRY');
const norm=s=>String(s??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
const manifest=JSON.parse(fs.readFileSync('tmp/pdfs/images.json','utf8'));
function image(rel){const m=manifest[rel];if(!m)throw Error('Imagen no convertida: '+rel);return {...m,bytes:new Uint8Array(fs.readFileSync(m.file))};}
const result=C.renderConsolidatedDigitalPdf({records:base.records,logo:image('assets/logo-sdh-descriptivo-horizontal.png'),mapGlobalImage:image(maps.pathFor('GLOBAL')),buildCommunityModel(r,pageNumber){
 const key=String(r['Clave INEGI']),join=key+'|'+r['Comunidad / Localidad'];
 const raw=reunion.iter[join];if(!raw)throw Error('ITER faltante: '+join);
 const extra=ages.comunidades[join];if(!extra)throw Error('Edades faltantes: '+join);
 const record=Object.fromEntries(Object.entries(r).map(([k,v])=>[norm(k),v]));
 for(const [label,field] of [['% Tinaco','VPH_TINACO'],['% Cisterna','VPH_CISTER'],['% Motocicleta','VPH_MOTO'],['% Bicicleta','VPH_BICI']])if(record[norm(label)]==null||record[norm(label)]===''){const a=Number(raw[field]),b=Number(raw.VIVPARH_CV);record[norm(label)]=Number.isFinite(a)&&b>0?a/b:null;}
 return {record,raw,extra,geometry:geo,history:history.comunidades[key]?.texto,mapImage:image(maps.pathFor(key)),pageNumber};
}});
fs.writeFileSync('tmp/pdfs/interior.pdf',result.bytes);console.log('Páginas interiores:',result.pageCount);
