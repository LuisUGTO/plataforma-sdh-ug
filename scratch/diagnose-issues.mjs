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
  '.png': 'image/png'
};

const server = http.createServer((req, res) => {
  const p = path.join(ROOT, decodeURIComponent(req.url.split('?')[0]));
  if (!fs.existsSync(p) || fs.statSync(p).isDirectory()) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { 'Content-Type': mime[path.extname(p).toLowerCase()] || 'application/octet-stream' });
  fs.createReadStream(p).pipe(res);
});
await new Promise(r => server.listen(8784, '127.0.0.1', r));

const profile = path.join(process.env.TEMP, 'sdh-chrome-diag');
const chrome = spawn(CHROME, ['--headless=new', '--disable-gpu', '--remote-debugging-port=9360', '--remote-allow-origins=*', `--user-data-dir=${profile}`, 'http://127.0.0.1:8784/index.html'], { stdio: 'ignore' });
const sleep = ms => new Promise(r => setTimeout(r, ms));
let target;
for (let i = 0; i < 40 && !target; i++) {
  await sleep(300);
  try { const list = await (await fetch('http://127.0.0.1:9360/json/list')).json(); target = list.find(t => t.type === 'page'); } catch {}
}
const ws = new WebSocket(target.webSocketDebuggerUrl);
await new Promise(r => ws.addEventListener('open', r));
let id = 0; const pending = new Map();
ws.addEventListener('message', e => { const m = JSON.parse(e.data); if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); } });
const evalJS = (expression) => new Promise((resolve, reject) => {
  const myId = ++id; pending.set(myId, m => m.error ? reject(new Error(JSON.stringify(m.error))) : m.result.exceptionDetails ? reject(new Error(JSON.stringify(m.result.exceptionDetails))) : resolve(m.result.result.value));
  ws.send(JSON.stringify({ id: myId, method: 'Runtime.evaluate', params: { expression, awaitPromise: true, returnByValue: true } }));
});

for (let i = 0; i < 60; i++) {
  if (await evalJS("!!(window.SDH_PDF && window.SDH_RESPALDO && window.SDH_REUNION && document.readyState === 'complete')")) break;
  await sleep(400);
}

const diag = await evalJS(`(async () => {
  const rawMap = new Image();
  rawMap.src = 'assets/New_mapas/Mapa global de las comunidades indígenas.png';
  await rawMap.decode();

  const c = document.createElement('canvas');
  c.width = 2488; c.height = 2480;
  const ctx = c.getContext('2d');
  ctx.drawImage(rawMap, 0, 0);

  // 1. Where is "México" in the original map?
  // Let's sample colors in rows 2100 to 2350, cols 2000 to 2350
  const br = ctx.getImageData(2000, 2100, 488, 350).data;
  let mexMinX = 9999, mexMaxX = 0, mexMinY = 9999, mexMaxY = 0;
  let compMinX = 9999, compMaxX = 0, compMinY = 9999, compMaxY = 0;

  for (let y = 0; y < 350; y++) {
    for (let x = 0; x < 488; x++) {
      const idx = (y * 488 + x) * 4;
      const r = br[idx], g = br[idx+1], b = br[idx+2];
      const absX = 2000 + x, absY = 2100 + y;

      // Compass is black (r,g,b < 35) and located to the right
      if (r < 35 && g < 35 && b < 35 && absX >= 2260) {
        if (absX < compMinX) compMinX = absX;
        if (absX > compMaxX) compMaxX = absX;
        if (absY < compMinY) compMinY = absY;
        if (absY > compMaxY) compMaxY = absY;
      }

      // "México" is gray text (r,g,b in 100..160) around absY 2180..2260 and absX 2050..2220
      if (r > 100 && r < 165 && Math.abs(r-g) < 10 && Math.abs(r-b) < 10 && absX < 2250 && absY < 2280) {
        if (absX < mexMinX) mexMinX = absX;
        if (absX > mexMaxX) mexMaxX = absX;
        if (absY < mexMinY) mexMinY = absY;
        if (absY > mexMaxY) mexMaxY = absY;
      }
    }
  }

  // 2. Where is Jalisco and Aguascalientes?
  const tl = ctx.getImageData(0, 0, 500, 1000).data;
  let agMaxY = 0, jalMinY = 9999;
  for (let y = 0; y < 1000; y++) {
    for (let x = 0; x < 300; x++) {
      const idx = (y * 300 + x) * 4;
      const r = tl[idx], g = tl[idx+1], b = tl[idx+2];
      if (r > 90 && r < 165 && Math.abs(r-g) < 10 && Math.abs(r-b) < 10) {
        if (y < 250 && y > agMaxY) agMaxY = y;
        if (y > 450 && y < 850 && y < jalMinY) jalMinY = y;
      }
    }
  }

  return {
    mexico: { mexMinX, mexMaxX, mexMinY, mexMaxY },
    compass: { compMinX, compMaxX, compMinY, compMaxY },
    verticalGapTL: { agMaxY, jalMinY, availableHeightInSource: jalMinY - agMaxY }
  };
})()`);

console.log('Diagnosis:', JSON.stringify(diag, null, 2));

ws.close(); chrome.kill(); server.close(); process.exit(0);
