import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';

const ROOT = 'c:/Proyectos/plataforma-sdh-ug';
const BRAIN = 'C:/Users/luisa/.gemini/antigravity/brain/c662a799-4137-4840-b03c-36a8c750a4af';
const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const mime = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css',
  '.js': 'application/javascript',
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
await new Promise(r => server.listen(8794, '127.0.0.1', r));

const profile = path.join(process.env.TEMP, 'sdh-chrome-indice-shot');
const chrome = spawn(CHROME, ['--headless=new', '--disable-gpu', '--remote-debugging-port=9350', '--remote-allow-origins=*', `--user-data-dir=${profile}`, 'http://127.0.0.1:8794/scratch/preview_sheet2_indice.html'], { stdio: 'ignore' });
const sleep = ms => new Promise(r => setTimeout(r, ms));
let target;
for (let i = 0; i < 40 && !target; i++) {
  await sleep(300);
  try { const list = await (await fetch('http://127.0.0.1:9350/json/list')).json(); target = list.find(t => t.type === 'page'); } catch {}
}
if (!target) throw new Error('No se conectó Chrome');
const ws = new WebSocket(target.webSocketDebuggerUrl);
await new Promise(r => ws.addEventListener('open', r));
let id = 0; const pending = new Map();
ws.addEventListener('message', e => { const m = JSON.parse(e.data); if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); } });
const send = (method, params = {}) => new Promise((resolve, reject) => {
  const myId = ++id; pending.set(myId, m => m.error ? reject(new Error(JSON.stringify(m.error))) : resolve(m.result));
  ws.send(JSON.stringify({ id: myId, method, params }));
});

await sleep(2000);
await send('Emulation.setDeviceMetricsOverride', { width: 1850, height: 1320, deviceScaleFactor: 1, mobile: false });
const shot = await send('Page.captureScreenshot', { format: 'png' });
const outShot = path.join(BRAIN, 'preview_indice_a2.png');
fs.writeFileSync(outShot, Buffer.from(shot.data, 'base64'));
console.log('Saved preview_indice_a2.png successfully!');

ws.close(); chrome.kill(); server.close(); process.exit(0);
