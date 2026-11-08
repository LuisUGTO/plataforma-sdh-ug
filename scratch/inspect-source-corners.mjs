import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';

const ROOT = 'c:/Proyectos/plataforma-sdh-ug';
const BRAIN = 'C:/Users/luisa/.gemini/antigravity/brain/c662a799-4137-4840-b03c-36a8c750a4af';
const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';

const mime = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.otf': 'font/otf'
};

const server = http.createServer((req, res) => {
  const p = path.join(ROOT, decodeURIComponent(req.url.split('?')[0]));
  if (!fs.existsSync(p) || fs.statSync(p).isDirectory()) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { 'Content-Type': mime[path.extname(p).toLowerCase()] || 'application/octet-stream' });
  fs.createReadStream(p).pipe(res);
});
await new Promise(r => server.listen(8796, '127.0.0.1', r));

const profile = path.join(process.env.TEMP, 'sdh-chrome-inspect-coords-2');
const chrome = spawn(CHROME, ['--headless=new', '--disable-gpu', '--remote-debugging-port=9352', '--remote-allow-origins=*', `--user-data-dir=${profile}`, 'http://127.0.0.1:8796/index.html'], { stdio: 'ignore' });
const sleep = ms => new Promise(r => setTimeout(r, ms));
let target;
for (let i = 0; i < 40 && !target; i++) {
  await sleep(300);
  try { const list = await (await fetch('http://127.0.0.1:9352/json/list')).json(); target = list.find(t => t.type === 'page'); } catch {}
}
const ws = new WebSocket(target.webSocketDebuggerUrl);
await new Promise(r => ws.addEventListener('open', r));
let id = 0; const pending = new Map();
ws.addEventListener('message', e => { const m = JSON.parse(e.data); if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); } });
const evalJS = (expression) => new Promise((resolve, reject) => {
  const myId = ++id; pending.set(myId, m => m.error ? reject(new Error(JSON.stringify(m.error))) : m.result.exceptionDetails ? reject(new Error(JSON.stringify(m.result.exceptionDetails))) : resolve(m.result.result.value));
  ws.send(JSON.stringify({ id: myId, method: 'Runtime.evaluate', params: { expression, awaitPromise: true, returnByValue: true } }));
});

await evalJS(`(async () => {
  const img = new Image();
  img.src = 'assets/New_mapas/Mapa global de las comunidades indígenas.png';
  await img.decode();

  // 1. Crop bottom-right region in source coords:
  // x: 2100 to 2488, y: 1950 to 2480
  const c1 = document.createElement('canvas');
  c1.width = 388; c1.height = 450;
  const x1 = c1.getContext('2d');
  x1.drawImage(img, 2100, 2030, 388, 450, 0, 0, 388, 450);
  const blob1 = await new Promise(r => c1.toBlob(r, 'image/png'));
  const ab1 = await blob1.arrayBuffer();

  // 2. Crop top-left region: Aguascalientes to Jalisco
  // x: 0 to 600, y: 0 to 900
  const c2 = document.createElement('canvas');
  c2.width = 600; c2.height = 900;
  const x2 = c2.getContext('2d');
  x2.drawImage(img, 0, 0, 600, 900, 0, 0, 600, 900);
  const blob2 = await new Promise(r => c2.toBlob(r, 'image/png'));
  const ab2 = await blob2.arrayBuffer();

  function toB64(buf) {
    let s = ''; const u8 = new Uint8Array(buf);
    for (let k = 0; k < u8.length; k += 32768) s += String.fromCharCode.apply(null, u8.subarray(k, k + 32768));
    return btoa(s);
  }

  window.__b64_bottomRight = toB64(ab1);
  window.__b64_topLeft = toB64(ab2);
  return true;
})()`);

const b64_br = await evalJS("window.__b64_bottomRight");
const b64_tl = await evalJS("window.__b64_topLeft");

fs.writeFileSync(path.join(BRAIN, 'crop_source_bottom_right.png'), Buffer.from(b64_br, 'base64'));
fs.writeFileSync(path.join(BRAIN, 'crop_source_top_left.png'), Buffer.from(b64_tl, 'base64'));
console.log('Saved inspection crops!');

ws.close(); chrome.kill(); server.close(); process.exit(0);
