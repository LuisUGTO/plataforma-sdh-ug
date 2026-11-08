import fs from 'node:fs';
import path from 'node:path';

const file = 'c:/Proyectos/plataforma-sdh-ug/Infografias_nuevas_2026-11-03/SDH_000_Mapa_Global_A2.pdf';
const buf = fs.readFileSync(file);
const str = buf.toString('latin1');

console.log('File size:', buf.length);
console.log('Has NaN:', str.includes('NaN'));
console.log('Has Infinity:', str.includes('Infinity'));
console.log('Has null in ops:', /\bnull\s+[a-zA-Z]/.test(str));

// Check streams and objects
const objects = (str.match(/obj\b/g) || []).length;
const endobjs = (str.match(/endobj\b/g) || []).length;
console.log(`Objects: ${objects}, Endobjs: ${endobjs}`);
console.log('Trailer present:', str.includes('trailer'));
console.log('%%EOF present:', str.includes('%%EOF'));
