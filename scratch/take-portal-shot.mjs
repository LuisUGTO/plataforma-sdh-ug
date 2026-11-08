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

await new Promise(r => server.listen(8793, '127.0.0.1', r));

const profile = path.join(process.env.TEMP, 'sdh-chrome-portal-shot');
const chrome = spawn(CHROME, [
  '--headless=new',
  '--disable-gpu',
  '--remote-debugging-port=9349',
  '--remote-allow-origins=*',
  `--user-data-dir=${profile}`,
  'http://127.0.0.1:8793/portal/index.html'
], { stdio: 'ignore' });

const sleep = ms => new Promise(r => setTimeout(r, ms));
let target;
for (let i = 0; i < 40 && !target; i++) {
  await sleep(300);
  try {
    const list = await (await fetch('http://127.0.0.1:9349/json/list')).json();
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

// Capture full view
const shot = await send('Page.captureScreenshot', { format: 'png' });
const outShot = path.join(BRAIN, 'portal_desktop_preview.png');
fs.writeFileSync(outShot, Buffer.from(shot.data, 'base64'));
console.log('Saved portal_desktop_preview.png successfully!');

// Also test clicking first community card to capture modal with official icons
await send('Runtime.evaluate', {
  expression: `document.querySelector('.community-card').click();`
});
await sleep(800);
const modalShot = await send('Page.captureScreenshot', { format: 'png' });
const outModalShot = path.join(BRAIN, 'portal_modal_preview.png');
fs.writeFileSync(outModalShot, Buffer.from(modalShot.data, 'base64'));
console.log('Saved portal_modal_preview.png successfully!');

ws.close();
chrome.kill();
server.close();
process.exit(0);
