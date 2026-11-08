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
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.otf': 'font/otf',
  '.ttf': 'font/ttf',
  '.pdf': 'application/pdf'
};

const server = http.createServer((req, res) => {
  const urlPath = decodeURIComponent(req.url.split('?')[0]);
  let p = path.join(ROOT, urlPath === '/' ? '/portal/index.html' : urlPath);
  if (!fs.existsSync(p) || fs.statSync(p).isDirectory()) {
    res.writeHead(404);
    return res.end();
  }
  res.writeHead(200, { 'Content-Type': mime[path.extname(p).toLowerCase()] || 'application/octet-stream' });
  fs.createReadStream(p).pipe(res);
});

await new Promise(r => server.listen(8795, '127.0.0.1', r));

const profile = path.join(process.env.TEMP, 'sdh-chrome-portal-shot-v3');
const chrome = spawn(CHROME, [
  '--headless=new',
  '--disable-gpu',
  '--remote-debugging-port=9351',
  '--remote-allow-origins=*',
  `--user-data-dir=${profile}`,
  'http://127.0.0.1:8795/portal/index.html'
], { stdio: 'ignore' });

const sleep = ms => new Promise(r => setTimeout(r, ms));
let target;
for (let i = 0; i < 40 && !target; i++) {
  await sleep(300);
  try {
    const list = await (await fetch('http://127.0.0.1:9351/json/list')).json();
    target = list.find(t => t.type === 'page');
  } catch {}
}

if (!target) throw new Error('No se conectó Chrome');
const ws = new WebSocket(target.webSocketDebuggerUrl);
await new Promise(r => ws.addEventListener('open', r));

let id = 0;
const pending = new Map();
ws.addEventListener('message', e => {
  const m = JSON.parse(e.data);
  if (m.id && pending.has(m.id)) {
    pending.get(m.id)(m);
    pending.delete(m.id);
  }
});

const send = (method, params = {}) => new Promise((resolve, reject) => {
  const myId = ++id;
  pending.set(myId, m => m.error ? reject(new Error(JSON.stringify(m.error))) : resolve(m.result));
  ws.send(JSON.stringify({ id: myId, method, params }));
});

await sleep(1500);
await send('Emulation.setDeviceMetricsOverride', { width: 1600, height: 1000, deviceScaleFactor: 1, mobile: false });
await sleep(1000);

// Clip 1: Sidebar cards up-close
const clipSidebar = await send('Page.captureScreenshot', {
  format: 'png',
  clip: { x: 0, y: 150, width: 440, height: 500, scale: 1 }
});
fs.writeFileSync(path.join(BRAIN, 'portal_cards_detail.png'), Buffer.from(clipSidebar.data, 'base64'));
console.log('Saved portal_cards_detail.png!');

// Clip 2: Map area up-close showing letters and municipalities
const clipMap = await send('Page.captureScreenshot', {
  format: 'png',
  clip: { x: 500, y: 100, width: 1050, height: 850, scale: 1 }
});
fs.writeFileSync(path.join(BRAIN, 'portal_map_letters_detail.png'), Buffer.from(clipMap.data, 'base64'));
console.log('Saved portal_map_letters_detail.png!');

ws.close();
chrome.kill();
server.close();
process.exit(0);
