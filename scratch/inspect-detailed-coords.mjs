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
await new Promise(r => server.listen(8780, '127.0.0.1', r));

const profile = path.join(process.env.TEMP, 'sdh-chrome-inspect-labels');
const chrome = spawn(CHROME, ['--headless=new', '--disable-gpu', '--remote-debugging-port=9356', '--remote-allow-origins=*', `--user-data-dir=${profile}`, 'http://127.0.0.1:8780/index.html'], { stdio: 'ignore' });
const sleep = ms => new Promise(r => setTimeout(r, ms));
let target;
for (let i = 0; i < 40 && !target; i++) {
  await sleep(300);
  try { const list = await (await fetch('http://127.0.0.1:9356/json/list')).json(); target = list.find(t => t.type === 'page'); } catch {}
}
const ws = new WebSocket(target.webSocketDebuggerUrl);
await new Promise(r => ws.addEventListener('open', r));
let id = 0; const pending = new Map();
ws.addEventListener('message', e => { const m = JSON.parse(e.data); if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); } });
const evalJS = (expression) => new Promise((resolve, reject) => {
  const myId = ++id; pending.set(myId, m => m.error ? reject(new Error(JSON.stringify(m.error))) : m.result.exceptionDetails ? reject(new Error(JSON.stringify(m.result.exceptionDetails))) : resolve(m.result.result.value));
  ws.send(JSON.stringify({ id: myId, method: 'Runtime.evaluate', params: { expression, awaitPromise: true, returnByValue: true } }));
});

const details = await evalJS(`(async () => {
  const img = new Image();
  img.src = 'assets/New_mapas/Mapa global de las comunidades indígenas.png';
  await img.decode();

  const c = document.createElement('canvas');
  c.width = 2488; c.height = 2480;
  const ctx = c.getContext('2d');
  ctx.drawImage(img, 0, 0);

  // 1. Analyze bottom right (source coords)
  // Let's find every dark pixel in x: 2000..2488, y: 2000..2480
  const brData = ctx.getImageData(2000, 2000, 488, 480).data;
  // Let's find columns that contain black compass pixels (r < 30, g < 30, b < 30)
  const compassXs = [], compassYs = [];
  const mexicoXs = [], mexicoYs = [];

  for (let y = 0; y < 480; y++) {
    for (let x = 0; x < 488; x++) {
      const idx = (y * 488 + x) * 4;
      const r = brData[idx], g = brData[idx+1], b = brData[idx+2];
      const absX = 2000 + x, absY = 2000 + y;
      // Black compass pixels
      if (r < 35 && g < 35 && b < 35) {
        if (absX >= 2250) {
          compassXs.push(absX);
          compassYs.push(absY);
        }
      }
      // Gray text pixels (around "México")
      if (r > 100 && r < 160 && Math.abs(r-g) < 10 && Math.abs(r-b) < 10) {
        if (absX < 2280 && absY > 2100) {
          mexicoXs.push(absX);
          mexicoYs.push(absY);
        }
      }
    }
  }

  // 2. Analyze top-left (source coords)
  // Find "Aguascalientes" and "Jalisco"
  const tlData = ctx.getImageData(0, 0, 400, 700).data;
  const aguasYs = [], jaliscoYs = [];
  const aguasXs = [], jaliscoXs = [];
  for (let y = 0; y < 700; y++) {
    for (let x = 0; x < 400; x++) {
      const idx = (y * 400 + x) * 4;
      const r = tlData[idx], g = tlData[idx+1], b = tlData[idx+2];
      // gray text
      if (r > 100 && r < 160 && Math.abs(r-g) < 10 && Math.abs(r-b) < 10) {
        if (y < 250) { aguasYs.push(y); aguasXs.push(x); }
        else if (y > 350 && y < 550) { jaliscoYs.push(y); jaliscoXs.push(x); }
      }
    }
  }

  return {
    compass: {
      minX: Math.min(...compassXs), maxX: Math.max(...compassXs),
      minY: Math.min(...compassYs), maxY: Math.max(...compassYs)
    },
    mexico: {
      minX: Math.min(...mexicoXs), maxX: Math.max(...mexicoXs),
      minY: Math.min(...mexicoYs), maxY: Math.max(...mexicoYs)
    },
    aguascalientes: {
      minX: Math.min(...aguasXs), maxX: Math.max(...aguasXs),
      minY: Math.min(...aguasYs), maxY: Math.max(...aguasYs)
    },
    jalisco: {
      minX: Math.min(...jaliscoXs), maxX: Math.max(...jaliscoXs),
      minY: Math.min(...jaliscoYs), maxY: Math.max(...jaliscoYs)
    }
  };
})()`);

console.log('Detailed coordinates:', JSON.stringify(details, null, 2));

ws.close(); chrome.kill(); server.close(); process.exit(0);
