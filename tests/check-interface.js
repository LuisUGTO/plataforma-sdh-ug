const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path'),assert=require('node:assert/strict');
const dir=path.resolve(__dirname,'..'),html=fs.readFileSync(path.join(dir,'index.html'),'utf8');
class Element{
 constructor(){this.children=[];this.value='';this.handlers={};this.textContent='';this.innerHTML='';this.hidden=false;this.disabled=false;this.classList={add(){},remove(){}};}
 get options(){return this.children;}
 append(e){this.children.push(e);if(this.children.length===1&&this.value==='')this.value=e.value;}
 replaceChildren(){this.children=[];}
 addEventListener(name,f){this.handlers[name]=f;}
 querySelector(){return new Element();}
 click(){this.handlers.click?.();}
 remove(){}
}
const nodes=new Map([...html.matchAll(/id="([^"]+)"/g)].map(m=>[m[1],new Element()]));
const read=name=>JSON.parse(fs.readFileSync(path.join(dir,name),'utf8'));
const context={console,TextEncoder,Uint8Array,Blob,AbortController,setTimeout,clearTimeout,fetch:async()=>{throw Error('offline test');},document:{getElementById:id=>{assert(nodes.has(id),'Missing DOM id '+id);return nodes.get(id);},createElement:()=>new Element(),body:new Element()},URL:{createObjectURL:()=>'',revokeObjectURL(){}},SDH_RESPALDO:read('datos-respaldo.json'),SDH_EDADES_RESPALDO:read('edades-respaldo.json'),SDH_REUNION:read('insumos-reunion.json'),SDH_GEOMETRY:read('guanajuato-municipios.geojson')};
context.window=context;context.globalThis=context;vm.createContext(context);
for(const match of html.matchAll(/<script([^>]*)>([\s\S]*?)<\/script>/g)){
 const src=match[1].match(/src="([^"]+)"/);
 const name=src?src[1].split('?')[0]:'embedded';
 let source=src?fs.readFileSync(path.join(dir,name),'utf8'):match[2];if(name==='app.js')source=source.replace("if(typeof module!=='undefined')module.exports=",'globalThis.testApp=');vm.runInContext(source,context,{filename:name});
}
const catalog=nodes.get('comunidad');assert.equal(catalog.options.length,107);assert.equal(catalog.disabled,false);
for(const term of ['Alonso','San Miguel de Allende','110030008']){nodes.get('buscar').value=term;nodes.get('buscar').handlers.input();assert(nodes.get('resultados').children.length>0);assert.equal(catalog.options.length,107);}
nodes.get('buscar').value='110030008';nodes.get('buscar').handlers.input();nodes.get('resultados').children[0].click();
assert.equal(nodes.get('nombre').textContent,'Alonso Yáñez');assert(nodes.get('vivienda').innerHTML.includes('195'));assert(!nodes.get('vivienda').innerHTML.includes('225'));
assert(nodes.get('etnicidad').innerHTML.includes('Otomí'));assert(nodes.get('etnicidad').innerHTML.includes('100.0%'));
assert(nodes.get('instituciones').innerHTML.includes('0.0%'));assert(nodes.get('asistencia').innerHTML.includes('62.5%'));assert(nodes.get('asistencia').innerHTML.includes('5.3%'));
assert(!html.includes('id="actividad"'));assert(nodes.get('piramide').innerHTML.includes('Años'));assert(nodes.get('piramide').innerHTML.includes('rotate(-90'));assert(nodes.get('etnicidad').innerHTML.includes('Población de 3 años y más que<br>habla alguna lengua indígena<br>y habla español'));assert(!nodes.get('demografia').innerHTML.includes('estimada'));
nodes.get('buscar').value='';nodes.get('buscar').handlers.input();assert.equal(nodes.get('resultados').hidden,true);assert.equal(catalog.options.length,107);
const api=context.SDH_HISTORIAS_API;const keys=context.SDH_RESPALDO.records.map(r=>String(r['Clave INEGI']));
assert.equal(Object.keys(context.SDH_HISTORIAS.comunidades).length,9);
const newText='Reseña de prueba con comas, "comillas" y\nsegunda línea.';
const csv=api.csv(context.SDH_RESPALDO.records,{...context.SDH_HISTORIAS.comunidades,'110030008':{texto:newText}});
// Exercise the real change handler, which uses the application's CSV parser.
const historyRows=context.testApp.parseCSV(csv);assert.equal(historyRows.length,108);assert.equal(Object.keys(api.fromRows(historyRows,keys)).length,9);
const readHistory=fs.readFileSync(path.join(dir,'historias.json'),'utf8');assert(JSON.parse(readHistory).comunidades['110030008'].texto.includes('Desde 2012'));
assert.throws(()=>api.fromRows([['Clave INEGI','Breve historia'],['110030008','A'],['110030008','B']],keys),/repite/);
assert.throws(()=>api.fromRows([['Clave INEGI','Breve historia'],['110999999','A']],keys),/no reconocida/);
assert.throws(()=>api.fromRows([['Clave INEGI','Breve historia'],['110030008','']],keys),/no contiene/);
assert.equal(context.testApp.importHistories(csv),9);assert.equal(context.testApp.historyFor({'clave inegi':'110030008'}),newText);assert.equal(nodes.get('historia-estado').textContent.startsWith('9 historias'),true);
let called=false;context.SDH_PDF.download=async model=>{called=true;assert.equal(model.raw.TVIVPARHAB,195);assert.equal(model.record['clave inegi'],'110030008');assert.equal(model.history,newText);};
(async()=>{await nodes.get('exportar').handlers.click();assert(called);assert(nodes.get('estado').textContent.includes('PDF A2 descargado'));console.log('Interface flow passed: 107 options, independent searches, Alonso values, PDF action, offline backup.');})();
