const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const dir = path.resolve(__dirname, '..');
const read = name => JSON.parse(fs.readFileSync(path.join(dir, name), 'utf8'));
const pdf = require(path.join(dir, 'pdf-export.js'));
const records = read('datos-respaldo.json').records;
const reunion = read('insumos-reunion.json');
const extras = read('edades-respaldo.json').comunidades;
const geometry = read('guanajuato-municipios.geojson');
const appText = fs.readFileSync(path.join(dir, 'app.js'), 'utf8');
const histories = read('historias.json').comunidades;
const history = histories['110030008'].texto;
const failures = [];
for (const record of records) {
  const id = record['Clave INEGI'] + '|' + record['Comunidad / Localidad'];
  const model = { record, raw: reunion.iter[id], extra: extras[id], geometry,
    history: histories[String(record['Clave INEGI'])]?.texto };
  try {
    const out = pdf.render(model);
    assert(out.bounds.every(b => b.bottom <= 364));
    assert(Buffer.from(out.bytes).subarray(0, 8).toString().startsWith('%PDF-1.4'));
  } catch (e) { failures.push({ id, error: e.message }); }
}
const id = Object.keys(extras).find(k => k.startsWith('110030008|'));
assert(Math.abs(pdf.median(extras[id], 904) - 21.139240506329113) < 1e-9);
assert.equal(pdf.median(extras[id], 903), null);
assert.equal(pdf.median({ ...extras[id], parcial: true }, 904), null);
assert.equal(pdf.median(null, 904), null);
global.window = { SDH_REUNION: reunion };
const app = require(path.join(dir, 'app.js'));
const record = records.find(r => String(r['Clave INEGI']) === '110030008');
const raw = reunion.iter[id];
assert.equal((app.ratio(raw.PCON_DISC, raw.POBTOT) * 100).toFixed(1), '1.4');
assert.equal((app.ratio(raw.PEA_M, raw.PEA) * 100).toFixed(1), '61.0');
assert.equal((app.ratio(raw.POCUPADA_F, raw.POCUPADA) * 100).toFixed(1), '39.6');
assert.equal(app.ratio(undefined, 904), null);
assert.equal(app.ratio(0, 0), null);
assert.equal(app.ratio(raw.P3HLINHE, raw.P3YM_HLI), 0);
assert.equal(pdf.refs.length, 6);
const html = fs.readFileSync(path.join(dir, 'index.html'), 'utf8');
assert(html.indexOf('src="pdf-export.js?') < html.indexOf('src="app.js?'));
assert(!appText.includes('window.print('));
console.log(JSON.stringify({ catalog: records.length, success: records.length - failures.length, failures,
  median: pdf.median(extras[id], 904), key: record['Clave INEGI'] }, null, 2));
if (failures.length) process.exitCode = 1;

const indicators=require(path.join(dir,'indicadores.js'));
const m=indicators.build(record,raw,extras[id]);
assert.equal(m.housing[0][1],'195');
assert.equal(raw.TVIVPAR,raw.TVIVPARHAB+raw.VIVPAR_DES+raw.VIVPAR_UT);
assert.deepEqual(m.attendance.map(a=>(a[1]*100).toFixed(1)),['62.5','82.8','66.7','32.3','5.3']);
assert.equal(m.ethnicity[2][1],'100.0%');
assert.equal(m.disabilityActivities[0][1],7/13);
assert.equal(m.institutions[2][1],0);
const missingModel=indicators.build(record,{...raw,PDER_IMSSB:'*',P3A5_NOA:null,PCON_DISC:0},extras[id]);
assert.equal(missingModel.institutions[3][1],null);
assert.equal(missingModel.attendance[0][1],null);
assert.equal(missingModel.disabilityActivities[0][1],null);
assert.equal(indicators.ratio(0,13),0);
assert.equal(indicators.ratio(0,0),null);
assert.equal(indicators.build(record,{...raw,POBMAS:417},extras[id]).age,null);
console.log('New indicators and denominator checks passed.');

assert.deepEqual(pdf.labelLines('Población de 3 años y más que habla alguna lengua indígena y habla español'),['Población de 3 años y más que','habla alguna lengua indígena','y habla español']);
assert.deepEqual(pdf.labelLines('Pueblo indígena por autoadscripción'),['Pueblo indígena por','autoadscripción']);
for(const rec of records){const rid=rec['Clave INEGI']+'|'+rec['Comunidad / Localidad'];const model=indicators.build(rec,reunion.iter[rid],extras[rid]);for(const [label,value] of model.ethnicity){const layout=pdf.cardLayout(label,value,85.5,21);assert(layout.labelWidth<=pdf.labelLimit());assert(layout.h<=21,'Ethnicity row overlap: '+rid+' '+label);}}
console.log('Common label width and ethnicity row spacing checks passed.');

const finalModel={record,raw,extra:extras[id],geometry,history};const finalPDF=pdf.render(finalModel);
assert(Math.abs(finalPDF.alignment.migrationBottom-finalPDF.alignment.noteBottom)<1e-8);
assert(finalPDF.alignment.educationHeight>37);
assert(!appText.includes('const approvedHistory='));
console.log('Final layout alignment and external history source checks passed.');
