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
await new Promise(r => server.listen(8799, '127.0.0.1', r));

const profile = path.join(process.env.TEMP, 'sdh-chrome-inspect-coords-precise');
const chrome = spawn(CHROME, ['--headless=new', '--disable-gpu', '--remote-debugging-port=9355', '--remote-allow-origins=*', `--user-data-dir=${profile}`, 'http://127.0.0.1:8799/index.html'], { stdio: 'ignore' });
const sleep = ms => new Promise(r => setTimeout(r, ms));
let target;
for (let i = 0; i < 40 && !target; i++) {
  await sleep(300);
  try { const list = await (await fetch('http://127.0.0.1:9355/json/list')).json(); target = list.find(t => t.type === 'page'); } catch {}
}
const ws = new WebSocket(target.webSocketDebuggerUrl);
await new Promise(r => ws.addEventListener('open', r));
let id = 0; const pending = new Map();
ws.addEventListener('message', e => { const m = JSON.parse(e.data); if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); } });
const evalJS = (expression) => new Promise((resolve, reject) => {
  const myId = ++id; pending.set(myId, m => m.error ? reject(new Error(JSON.stringify(m.error))) : m.result.exceptionDetails ? reject(new Error(JSON.stringify(m.result.exceptionDetails))) : resolve(m.result.result.value));
  ws.send(JSON.stringify({ id: myId, method: 'Runtime.evaluate', params: { expression, awaitPromise: true, returnByValue: true } }));
});

const report = await evalJS(`(async () => {
  const img = new Image();
  img.src = 'assets/New_mapas/Mapa global de las comunidades indígenas.png';
  await img.decode();

  const c = document.createElement('canvas');
  c.width = 2488; c.height = 2480;
  const ctx = c.getContext('2d');
  ctx.drawImage(img, 0, 0, 2488, 2480, 0, 0, 2488, 2480);

  // Bottom right analysis:
  // Find where "México" is:
  // "México" is written in gray italic font, let's scan y from 2000 to 2480 and x from 2000 to 2488
  // Also scan for pure black compass pixels:
  const compassRect = { x1: 9999, y1: 9999, x2: 0, y2: 0 };
  const dBR = ctx.getImageData(2200, 2050, 288, 430).data;
  for (let y = 0; y < 430; y++) {
    for (let x = 0; x < 288; x++) {
      const idx = (y * 288 + x) * 4;
      const r = dBR[idx], g = dBR[idx+1], b = dBR[idx+2];
      // Pure black or near black (compass)
      if (r < 40 && g < 40 && b < 40) {
        const absX = 2200 + x, absY = 2050 + y;
        if (absX < compassRect.x1) compassRect.x1 = absX;
        if (absX > compassRect.x2) compassRect.x2 = absX;
        if (absY < compassRect.y1) compassRect.y1 = absY;
        if (absY > compassRect.y2) compassRect.y2 = absY;
      }
    }
  }

  // Scan for "México" text in x: 2000..2280, y: 2050..2450
  // and "Hidalgo" text
  const dLabels = ctx.getImageData(2000, 2050, 280, 430).data;
  const labelPoints = [];
  for (let y = 0; y < 430; y++) {
    for (let x = 0; x < 280; x++) {
      const idx = (y * 280 + x) * 4;
      const r = dLabels[idx], g = dLabels[idx+1], b = dLabels[idx+2];
      // Gray text is around 110..160
      if (r > 90 && r < 170 && Math.abs(r-g) < 15 && Math.abs(r-b) < 15) {
        labelPoints.push({ x: 2000 + x, y: 2050 + y });
      }
    }
  }

  // Top-left analysis:
  // Find Aguascalientes (near top left) and Jalisco (below it)
  // Scan x: 0..400, y: 0..800
  const dTL = ctx.getImageData(0, 0, 400, 800).data;
  const tlLabels = [];
  for (let y = 0; y < 800; y++) {
    for (let x = 0; x < 400; x++) {
      const idx = (y * 400 + x) * 4;
      const r = dTL[idx], g = dTL[idx+1], b = dTL[idx+2];
      if (r > 90 && r < 170 && Math.abs(r-g) < 15 && Math.abs(r-b) < 15) {
        tlLabels.push({ x, y });
      }
    }
  }

  // Group top-left label points into clusters
  // Aguascalientes vs Jalisco
  const aguas = tlLabels.filter(p => p.y < 350);
  const jalisco = tlLabels.filter(p => p.y >= 350 && p.y < 700);

  let agBox = { minX: 9999, maxX: 0, minY: 9999, maxY: 0 };
  for (const p of aguas) {
    if (p.x < agBox.minX) agBox.minX = p.x;
    if (p.x > agBox.maxX) agBox.maxX = p.x;
    if (p.y < agBox.minY) agBox.minY = p.y;
    if (p.y > agBox.maxY) agBox.maxY = p.y;
  }

  let jalBox = { minX: 9999, maxX: 0, minY: 9999, maxY: 0 };
  for (const p of jalisco) {
    if (p.x < jalBox.minX) jalBox.minX = p.x;
    if (p.x > jalBox.maxX) jalBox.maxX = p.x;
    if (p.y < jalBox.minY) jalBox.minY = p.y;
    if (p.y > jalBox.maxY) jalBox.maxY = p.y;
  }

  return { compassRect, agBox, jalBox };
})()`);

console.log('Precise report:', JSON.stringify(report, null, 2));

ws.close(); chrome.kill(); server.close(); process.exit(0);
