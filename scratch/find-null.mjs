import fs from 'node:fs';

const buf = fs.readFileSync('c:/Proyectos/plataforma-sdh-ug/Infografias_nuevas_2026-11-03/SDH_000_Mapa_Global_A2.pdf');
const str = buf.toString('latin1');
const matches = [...str.matchAll(/([^\n\r]{0,40}null[^\n\r]{0,40})/g)];
for (const m of matches) {
  console.log('Match:', JSON.stringify(m[0]));
}
