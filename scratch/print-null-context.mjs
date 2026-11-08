import fs from 'node:fs';

const buf = fs.readFileSync('c:/Proyectos/plataforma-sdh-ug/Infografias_nuevas_2026-11-03/SDH_000_Mapa_Global_A2.pdf');
const str = buf.toString('latin1');
let idx = 0;
while ((idx = str.indexOf('null', idx)) !== -1) {
  const start = Math.max(0, idx - 60);
  const end = Math.min(str.length, idx + 60);
  console.log('--- Context at offset', idx, '---');
  console.log(str.slice(start, end));
  idx += 4;
}
