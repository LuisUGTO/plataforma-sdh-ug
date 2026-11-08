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
await new Promise(r => server.listen(8798, '127.0.0.1', r));

const profile = path.join(process.env.TEMP, 'sdh-chrome-inspect-corners-visual');
const chrome = spawn(CHROME, ['--headless=new', '--disable-gpu', '--remote-debugging-port=9354', '--remote-allow-origins=*', `--user-data-dir=${profile}`, 'http://127.0.0.1:8798/index.html'], { stdio: 'ignore' });
const sleep = ms => new Promise(r => setTimeout(r, ms));
let target;
for (let i = 0; i < 40 && !target; i++) {
  await sleep(300);
  try { const list = await (await fetch('http://127.0.0.1:9354/json/list')).json(); target = list.find(t => t.type === 'page'); } catch {}
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

  // Crop from source: x: 2000 to 2488, y: 2000 to 2480
  const c = document.createElement('canvas');
  c.width = 488; c.height = 480;
  const ctx = c.getContext('2d');
  ctx.drawImage(img, 2000, 2000, 488, 480, 0, 0, 488, 480);

  // Draw grid lines every 50 px with labels
  ctx.strokeStyle = 'rgba(255, 0, 0, 0.4)';
  ctx.lineWidth = 1;
  ctx.fillStyle = 'red';
  ctx.font = '12px monospace';
  for (let x = 0; x < 488; x += 50) {
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, 480); ctx.stroke();
    ctx.fillText(String(2000 + x), x + 2, 15);
  }
  for (let y = 0; y < 480; y += 50) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(488, y); ctx.stroke();
    ctx.fillText(String(2000 + y), 2, y + 12);
  }

  const blob = await new Promise(r => c.toBlob(r, 'image/png'));
  const ab = await blob.arrayBuffer();
  let s = ''; const u8 = new Uint8Array(ab);
  for (let k = 0; k < u8.length; k += 32768) s += String.fromCharCode.apply(null, u8.subarray(k, k + 32768));
  window.__b64_cornerGrid = btoa(s);

  // Top-left crop from source: x: 0 to 600, y: 0 to 800
  const cTL = document.createElement('canvas');
  cTL.width = 600; cTL.height = 800;
  const ctxTL = cTL.getContext('2d');
  ctxTL.drawImage(img, 0, 0, 600, 800, 0, 0, 600, 800);
  ctxTL.strokeStyle = 'rgba(0, 0, 255, 0.4)';
  ctxTL.fillStyle = 'blue';
  ctxTL.font = '12px monospace';
  for (let x = 0; x < 600; x += 50) {
    ctxTL.beginPath(); ctxTL.moveTo(x, 0); ctxTL.lineTo(x, 800); ctxTL.stroke();
    ctxTL.fillText(String(x), x + 2, 15);
  }
  for (let y = 0; y < 800; y += 50) {
    ctxTL.beginPath(); ctxTL.moveTo(0, y); ctxTL.lineTo(600, y); ctxTL.stroke();
    ctxTL.fillText(String(y), 2, y + 12);
  }
  const blobTL = await new Promise(r => cTL.toBlob(r, 'image/png'));
  const abTL = await blobTL.arrayBuffer();
  let sTL = ''; const u8TL = new Uint8Array(abTL);
  for (let k = 0; k < u8TL.length; k += 32768) sTL += String.fromCharCode.apply(null, u8TL.subarray(k, k + 32768));
  window.__b64_tlGrid = btoa(sTL);

  return true;
})()`);

const b64_cg = await evalJS("window.__b64_cornerGrid");
const b64_tg = await evalJS("window.__b64_tlGrid");

fs.writeFileSync(path.join(BRAIN, 'corner_bottom_right_grid.png'), Buffer.from(b64_cg, 'base64'));
fs.writeFileSync(path.join(BRAIN, 'corner_top_left_grid.png'), Buffer.from(b64_tg, 'base64'));
console.log('Saved grid inspection images!');

ws.close(); chrome.kill(); server.close(); process.exit(0);
