import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';

const ROOT = 'c:/Proyectos/plataforma-sdh-ug';
const OUT = path.join(ROOT, 'Infografias_nuevas_2026-11-03');
const BRAIN = 'C:/Users/luisa/.gemini/antigravity/brain/c662a799-4137-4840-b03c-36a8c750a4af';
const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';

const mime = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.otf': 'font/otf',
  '.ttf': 'font/ttf',
  '.geojson': 'application/json'
};

const server = http.createServer((req, res) => {
  const p = path.join(ROOT, decodeURIComponent(req.url.split('?')[0]));
  if (!fs.existsSync(p) || fs.statSync(p).isDirectory()) { res.writeHead(404); return res.end(); }
  res.writeHead(200, {
    'Content-Type': mime[path.extname(p).toLowerCase()] || 'application/octet-stream',
    'Cache-Control': 'no-store, no-cache, must-revalidate'
  });
  fs.createReadStream(p).pipe(res);
});
await new Promise(r => server.listen(8793, '127.0.0.1', r));

const profile = path.join(process.env.TEMP, 'sdh-chrome-regen-' + Date.now());
const chrome = spawn(CHROME, ['--headless=new', '--disable-gpu', '--remote-debugging-port=9349', '--remote-allow-origins=*', `--user-data-dir=${profile}`, 'http://127.0.0.1:8793/index.html'], { stdio: 'ignore' });
const sleep = ms => new Promise(r => setTimeout(r, ms));
let target;
for (let i = 0; i < 60 && !target; i++) {
  await sleep(400);
  try { const list = await (await fetch('http://127.0.0.1:9349/json/list')).json(); target = list.find(t => t.type === 'page'); } catch {}
}
if (!target) throw new Error('No se pudo conectar con Chrome');
const ws = new WebSocket(target.webSocketDebuggerUrl);
await new Promise(r => ws.addEventListener('open', r));
let id = 0; const pending = new Map();
ws.addEventListener('message', e => { const m = JSON.parse(e.data); if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); } });

const sendCDP = (method, params = {}) => new Promise((resolve, reject) => {
  const myId = ++id;
  pending.set(myId, m => m.error ? reject(new Error(JSON.stringify(m.error))) : resolve(m.result));
  ws.send(JSON.stringify({ id: myId, method, params }));
});

await sendCDP('Network.enable');
await sendCDP('Network.setCacheDisabled', { cacheDisabled: true });

const evalJS = (expression) => new Promise((resolve, reject) => {
  const myId = ++id; pending.set(myId, m => m.error ? reject(new Error(JSON.stringify(m.error))) : m.result?.exceptionDetails ? reject(new Error(JSON.stringify(m.result.exceptionDetails))) : resolve(m.result.result.value));
  ws.send(JSON.stringify({ id: myId, method: 'Runtime.evaluate', params: { expression, awaitPromise: true, returnByValue: true } }));
});

for (let i = 0; i < 60; i++) {
  if (await evalJS("!!(window.SDH_PDF && window.SDH_RESPALDO && window.SDH_REUNION && document.readyState === 'complete')")) break;
  await sleep(400);
}

console.log('Regenerating Sheet 1 (Mapa Global) and Sheet 2 (Índice / Padrón)...');

const res = await evalJS(`(async () => {
  async function imageBytes(src){
    const image = new Image();
    image.src = src + '?v=' + Date.now();
    await image.decode();
    const c = document.createElement('canvas');
    c.width = image.naturalWidth;
    c.height = image.naturalHeight;
    const x = c.getContext('2d');
    x.fillStyle = '#FFFFFF';
    x.fillRect(0, 0, c.width, c.height);
    x.drawImage(image, 0, 0);
    const blob = await new Promise(r => c.toBlob(r, 'image/jpeg', 0.98));
    return { bytes: new Uint8Array(await blob.arrayBuffer()), pxWidth: c.width, pxHeight: c.height };
  }

  const logo = await imageBytes('assets/logo-sdh-descriptivo-horizontal.png');

  // Sheet 1: Global Map (Original uncut Guanajuato map with legend)
  const originalMap = await imageBytes('assets/New_mapas/Mapa global de las comunidades indígenas.png');
  const mapRes = window.SDH_PDF.renderGlobalMapSheet({ mapImage: originalMap }, logo);

  let mapBin = '';
  for(let k = 0; k < mapRes.bytes.length; k += 32768) {
    mapBin += String.fromCharCode.apply(null, mapRes.bytes.subarray(k, k + 32768));
  }

  // Sheet 2: Index / Padrón
  const idxRes = window.SDH_PDF.renderIndexSheet(window.SDH_RESPALDO.records, logo);

  let idxBin = '';
  for(let k = 0; k < idxRes.bytes.length; k += 32768) {
    idxBin += String.fromCharCode.apply(null, idxRes.bytes.subarray(k, k + 32768));
  }

  return {
    mapB64: btoa(mapBin),
    idxB64: btoa(idxBin),
    recordsCount: window.SDH_RESPALDO.records.length
  };
})()`);

console.log('Records count for Index:', res.recordsCount);

const pathMapPdf = path.join(OUT, 'SDH_000_Mapa_Global_A2.pdf');
const pathIdxPdf = path.join(OUT, 'SDH_000_Indice_107_Comunidades_A2.pdf');

fs.writeFileSync(pathMapPdf, Buffer.from(res.mapB64, 'base64'));
fs.writeFileSync(pathIdxPdf, Buffer.from(res.idxB64, 'base64'));

console.log('Saved:', pathMapPdf);
console.log('Saved:', pathIdxPdf);

ws.close(); chrome.kill(); server.close(); process.exit(0);
