(function(root){
'use strict';
const norm=s=>String(s??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
function fromRows(rows,keys){
 if(!Array.isArray(rows)||!rows.length)throw Error('El archivo de historias está vacío.');
 const header=rows[0].map(norm),keyColumn=header.indexOf('clave inegi'),textColumn=header.findIndex(h=>['breve historia','breve historia de la comunidad','historia'].includes(h));
 if(keyColumn<0||textColumn<0)throw Error('Se requieren las columnas Clave INEGI y Breve historia.');
 const known=new Set(keys.map(String)),seen=new Set(),out={};
 for(let i=1;i<rows.length;i++){
  const row=rows[i];if(!row.some(v=>String(v??'').trim()))continue;
  const key=String(row[keyColumn]??'').trim(),text=String(row[textColumn]??'').trim();
  if(!/^11\d{7}$/.test(key)||!known.has(key))throw Error(`Clave INEGI no reconocida en la fila ${i+1}: ${key||'(vacía)'}.`);
  if(seen.has(key))throw Error(`La clave ${key} se repite en la fila ${i+1}.`);
  seen.add(key);if(text)out[key]={texto:text,fuente:'Archivo de historias proporcionado por el equipo'};
 }
 if(!Object.keys(out).length)throw Error('El archivo no contiene historias escritas.');
 return out;
}
function fromJSON(data){
 const entries=data?.comunidades;
 if(!entries||Array.isArray(entries)||typeof entries!=='object')throw Error('El archivo de historias requiere el objeto comunidades.');
 const out={};for(const [key,value] of Object.entries(entries)){
  if(!/^11\d{7}$/.test(key)||!value||typeof value.texto!=='string')throw Error('Historia inválida para la clave '+key+'.');
  if(value.texto.trim())out[key]={...value,texto:value.texto.trim()};
 }return out;
}
function csv(records,histories){
 const quote=value=>'"'+String(value??'').replace(/"/g,'""')+'"';
 return '\ufeff'+[['Clave INEGI','Breve historia'],...records.map(r=>{const key=String(r[norm('Clave INEGI')]??r['Clave INEGI']);return [key,histories[key]?.texto||''];})].map(row=>row.map(quote).join(',')).join('\r\n');
}
const api={fromRows,fromJSON,csv};root.SDH_HISTORIAS_API=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
