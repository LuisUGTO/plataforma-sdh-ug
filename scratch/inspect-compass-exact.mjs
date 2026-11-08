import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';

const ROOT = 'c:/Proyectos/plataforma-sdh-ug';
const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';

const server = http.createServer((req, res) => {
  const p = path.join(ROOT, decodeURIComponent(req.url.split('?')[0]));
  if (!fs.existsSync(p) || fs.statSync(p).isDirectory()) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { 'Content-Type': 'image/png' });
  fs.createReadStream(p).pipe(res);
});
await new Promise(r => server.listen(8782, '127.0.0.1', r));

const profile = path.join(process.env.TEMP, 'sdh-chrome-inspect-mexico-2');
const chrome = spawn(CHROME, ['--headless=new', '--disable-gpu', '--remote-debugging-port=9358', '--remote-allow-origins=*', `--user-data-dir=${profile}`, 'http://127.0.0.1:8782/index.html'], { stdio: 'ignore' });
const sleep = ms => new Promise(r => setTimeout(r, ms));
let target;
for (let i = 0; i < 40 && !target; i++) {
  await sleep(300);
  try { const list = await (await fetch('http://127.0.0.1:9358/json/list')).json(); target = list.find(t => t.type === 'page'); } catch {}
}
const ws = new WebSocket(target.webSocketDebuggerUrl);
await new Promise(r => ws.addEventListener('open', r));
let id = 0; const pending = new Map();
ws.addEventListener('message', e => { const m = JSON.parse(e.data); if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); } });
const evalJS = (expression) => new Promise((resolve, reject) => {
  const myId = ++id; pending.set(myId, m => m.error ? reject(new Error(JSON.stringify(m.error))) : m.result.exceptionDetails ? reject(new Error(JSON.stringify(m.result.exceptionDetails))) : resolve(m.result.result.value));
  ws.send(JSON.stringify({ id: myId, method: 'Runtime.evaluate', params: { expression, awaitPromise: true, returnByValue: true } }));
});

const res = await evalJS(`(async () => {
  const img = new Image();
  img.src = 'assets/New_mapas/Mapa global de las comunidades indígenas.png';
  await img.decode();

  const c = document.createElement('canvas');
  c.width = 2488; c.height = 2480;
  const ctx = c.getContext('2d');
  ctx.drawImage(img, 0, 0);

  // Scan row by row around y: 2200..2450 for the compass and Mexico
  // In source coords:
  // Let's test a clean white cover for the compass:
  // If we cover x: 2280 to 2488, y: 2050 to 2480:
  // Does x = 2280 touch "México"?
  const idata = ctx.getImageData(1950, 2100, 538, 380);
  const data = idata.data;
  
  // Find rightmost pixel of "México" text:
  // "México" is around y: 2200..2350
  let maxX_Mexico = 0, minY_Mexico = 9999, maxY_Mexico = 0;
  let minX_Compass = 9999, maxX_Compass = 0, minY_Compass = 9999, maxY_Compass = 0;

  for (let y = 0; y < 380; y++) {
    for (let x = 0; x < 538; x++) {
      const idx = (y * 538 + x) * 4;
      const r = data[idx], g = data[idx+1], b = data[idx+2];
      const absX = 1950 + x, absY = 2100 + y;
      
      // Black compass (r,g,b < 40)
      if (r < 40 && g < 40 && b < 40) {
        if (absX < minX_Compass) minX_Compass = absX;
        if (absX > maxX_Compass) maxX_Compass = absX;
        if (absY < minY_Compass) minY_Compass = absY;
        if (absY > maxY_Compass) maxY_Compass = absY;
      }
      
      // Text "México" (gray letters, r,g,b around 120..150, near absY: 2220..2280)
      if (absY >= 2200 && absY <= 2280 && absX < 2250) {
        if (r > 100 && r < 160 && Math.abs(r-g) < 10) {
          if (absX > maxX_Mexico) maxX_Mexico = absX;
          if (absY < minY_Mexico) minY_Mexico = absY;
          if (absY > maxY_Mexico) maxY_Mexico = absY;
        }
      }
    }
  }

  return { minX_Compass, maxX_Compass, minY_Compass, maxY_Compass, maxX_Mexico, minY_Mexico, maxY_Mexico };
})()`);

console.log('Result:', JSON.stringify(res, null, 2));

ws.close(); chrome.kill(); server.close(); process.exit(0);
