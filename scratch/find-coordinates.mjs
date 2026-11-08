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
await new Promise(r => server.listen(8797, '127.0.0.1', r));

const profile = path.join(process.env.TEMP, 'sdh-chrome-coord-analysis');
const chrome = spawn(CHROME, ['--headless=new', '--disable-gpu', '--remote-debugging-port=9353', '--remote-allow-origins=*', `--user-data-dir=${profile}`, 'http://127.0.0.1:8797/index.html'], { stdio: 'ignore' });
const sleep = ms => new Promise(r => setTimeout(r, ms));
let target;
for (let i = 0; i < 40 && !target; i++) {
  await sleep(300);
  try { const list = await (await fetch('http://127.0.0.1:9353/json/list')).json(); target = list.find(t => t.type === 'page'); } catch {}
}
const ws = new WebSocket(target.webSocketDebuggerUrl);
await new Promise(r => ws.addEventListener('open', r));
let id = 0; const pending = new Map();
ws.addEventListener('message', e => { const m = JSON.parse(e.data); if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); } });
const evalJS = (expression) => new Promise((resolve, reject) => {
  const myId = ++id; pending.set(myId, m => m.error ? reject(new Error(JSON.stringify(m.error))) : m.result.exceptionDetails ? reject(new Error(JSON.stringify(m.result.exceptionDetails))) : resolve(m.result.result.value));
  ws.send(JSON.stringify({ id: myId, method: 'Runtime.evaluate', params: { expression, awaitPromise: true, returnByValue: true } }));
});

const analysis = await evalJS(`(async () => {
  const img = new Image();
  img.src = 'assets/New_mapas/Mapa global de las comunidades indígenas.png';
  await img.decode();

  // Create canvas for source map (2488 x 2480)
  const c = document.createElement('canvas');
  c.width = 2488; c.height = 2480;
  const ctx = c.getContext('2d');
  ctx.drawImage(img, 0, 0, 2488, 2480, 0, 0, 2488, 2480);

  // 1. Let's analyze bottom right (x: 2100 to 2488, y: 2000 to 2480):
  // Let's find dark pixels (< 80 brightness) in this region
  const idata = ctx.getImageData(2100, 2000, 388, 480);
  const data = idata.data;
  const darkPoints = [];
  for (let y = 0; y < 480; y++) {
    for (let x = 0; x < 388; x++) {
      const idx = (y * 388 + x) * 4;
      const r = data[idx], g = data[idx+1], b = data[idx+2];
      // black compass pixels are pure black or very dark
      if (r < 50 && g < 50 && b < 50) {
        darkPoints.push({ x: 2100 + x, y: 2000 + y });
      }
    }
  }

  // Find bounding box of dark pixels around the compass (which is near x: 2300..2450, y: 2050..2400)
  const compassPixels = darkPoints.filter(p => p.x > 2250 && p.y > 2080);
  let minX = 9999, maxX = 0, minY = 9999, maxY = 0;
  for (const p of compassPixels) {
    if (p.x < minX) minX = p.x;
    if (p.x > maxX) maxX = p.x;
    if (p.y < minY) minY = p.y;
    if (p.y > maxY) maxY = p.y;
  }

  // Also let's find dark pixels near "México" (around x: 2150..2300, y: 2150..2300)
  const mexicoPixels = darkPoints.filter(p => p.x < 2250 && p.y > 2100);
  let mMinX = 9999, mMaxX = 0, mMinY = 9999, mMaxY = 0;
  for (const p of mexicoPixels) {
    if (p.x < mMinX) mMinX = p.x;
    if (p.x > mMaxX) mMaxX = p.x;
    if (p.y < mMinY) mMinY = p.y;
    if (p.y > mMaxY) mMaxY = p.y;
  }

  // 2. Let's analyze top-left region (x: 0..600, y: 0..1000):
  // Find where "Aguascalientes" and "Jalisco" are
  const idataTL = ctx.getImageData(0, 0, 500, 1000);
  const dataTL = idataTL.data;
  const darkTL = [];
  for (let y = 0; y < 1000; y++) {
    for (let x = 0; x < 500; x++) {
      const idx = (y * 500 + x) * 4;
      const r = dataTL[idx], g = dataTL[idx+1], b = dataTL[idx+2];
      // gray labels in map (like "Aguascalientes", "Jalisco") typically have gray text: r,g,b in 100..180
      if (r > 80 && r < 180 && Math.abs(r - g) < 20 && Math.abs(r - b) < 20) {
        darkTL.push({ x, y });
      }
    }
  }

  return {
    compassBox: { minX, maxX, minY, maxY, count: compassPixels.length },
    mexicoBox: { minX: mMinX, maxX: mMaxX, minY: mMinY, maxY: mMaxY, count: mexicoPixels.length }
  };
})()`);

console.log('Analysis result:', JSON.stringify(analysis, null, 2));

ws.close(); chrome.kill(); server.close(); process.exit(0);
