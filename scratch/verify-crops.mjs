import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';

const BRAIN = 'C:/Users/luisa/.gemini/antigravity/brain/c662a799-4137-4840-b03c-36a8c750a4af';
const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';

const server = http.createServer((req, res) => {
  const p = path.join(BRAIN, decodeURIComponent(req.url.split('?')[0]));
  if (!fs.existsSync(p)) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { 'Content-Type': 'image/png' });
  fs.createReadStream(p).pipe(res);
});
await new Promise(r => server.listen(8786, '127.0.0.1', r));

const profile = path.join(process.env.TEMP, 'sdh-chrome-crop-verify');
const chrome = spawn(CHROME, ['--headless=new', '--disable-gpu', '--remote-debugging-port=9362', '--remote-allow-origins=*', `--user-data-dir=${profile}`, 'about:blank'], { stdio: 'ignore' });
const sleep = ms => new Promise(r => setTimeout(r, ms));
let target;
for (let i = 0; i < 40 && !target; i++) {
  await sleep(300);
  try { const list = await (await fetch('http://127.0.0.1:9362/json/list')).json(); target = list.find(t => t.type === 'page'); } catch {}
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
  img.src = 'http://127.0.0.1:8786/preview_mapa_inegi_a2.png';
  await img.decode();

  // 1. Crop North area (top-left of map):
  // The map starts around x=33, y=142
  const c1 = document.createElement('canvas');
  c1.width = 400; c1.height = 450;
  const ctx1 = c1.getContext('2d');
  ctx1.drawImage(img, 33, 142, 400, 450, 0, 0, 400, 450);

  // 2. Crop bottom-right of state map:
  // State map width is ~950px in preview (x from 33 to 983)
  // Bottom is around y = 142 + 950 = 1092
  const c2 = document.createElement('canvas');
  c2.width = 400; c2.height = 300;
  const ctx2 = c2.getContext('2d');
  ctx2.drawImage(img, 650, 850, 400, 300, 0, 0, 400, 300);

  function toB64(c) {
    const dataUrl = c.toDataURL('image/png');
    return dataUrl.split(',')[1];
  }

  window.__b64_north = toB64(c1);
  window.__b64_mexico = toB64(c2);
  return true;
})()`);

const b64_n = await evalJS("window.__b64_north");
const b64_m = await evalJS("window.__b64_mexico");

fs.writeFileSync(path.join(BRAIN, 'verify_north_crop.png'), Buffer.from(b64_n, 'base64'));
fs.writeFileSync(path.join(BRAIN, 'verify_mexico_crop.png'), Buffer.from(b64_m, 'base64'));
console.log('Saved verification crops!');

ws.close(); chrome.kill(); server.close(); process.exit(0);
