import fs from 'node:fs';

const file = 'c:/Proyectos/plataforma-sdh-ug/Infografias_nuevas_2026-11-03/SDH_000_Indice_107_Comunidades_A2.pdf';
const buf = fs.readFileSync(file);
const str = buf.toString('latin1');

console.log('Indice File size:', buf.length);
console.log('Has NaN:', str.includes('NaN'));
console.log('Has Infinity:', str.includes('Infinity'));
