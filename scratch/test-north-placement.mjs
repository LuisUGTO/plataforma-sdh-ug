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
await new Promise(r => server.listen(8783, '127.0.0.1', r));

const profile = path.join(process.env.TEMP, 'sdh-chrome-test-new-north');
const chrome = spawn(CHROME, ['--headless=new', '--disable-gpu', '--remote-debugging-port=9359', '--remote-allow-origins=*', `--user-data-dir=${profile}`, 'http://127.0.0.1:8783/index.html'], { stdio: 'ignore' });
const sleep = ms => new Promise(r => setTimeout(r, ms));
let target;
for (let i = 0; i < 40 && !target; i++) {
  await sleep(300);
  try { const list = await (await fetch('http://127.0.0.1:9359/json/list')).json(); target = list.find(t => t.type === 'page'); } catch {}
}
const ws = new WebSocket(target.webSocketDebuggerUrl);
await new Promise(r => ws.addEventListener('open', r));
let id = 0; const pending = new Map();
ws.addEventListener('message', e => { const m = JSON.parse(e.data); if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); } });
const evalJS = (expression) => new Promise((resolve, reject) => {
  const myId = ++id; pending.set(myId, m => m.error ? reject(new Error(JSON.stringify(m.error))) : m.result.exceptionDetails ? reject(new Error(JSON.stringify(m.result.exceptionDetails))) : resolve(m.result.result.value));
  ws.send(JSON.stringify({ id: myId, method: 'Runtime.evaluate', params: { expression, awaitPromise: true, returnByValue: true } }));
});

const b64 = await evalJS(`(async () => {
  const rawMap = new Image();
  rawMap.src = 'assets/New_mapas/Mapa global de las comunidades indígenas.png';
  await rawMap.decode();

  const c = document.createElement('canvas');
  c.width = 4000;
  c.height = 2213;
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, c.width, c.height);

  const mapW = 2213, mapH = 2213;
  ctx.drawImage(rawMap, 0, 0, 2488, 2480, 0, 0, mapW, mapH);

  // 1. Cover the old compass completely:
  // It is located at x >= 2260 in source (>= 2010 px in canvas) and y >= 2090 in source (>= 1865 px in canvas)
  const compassCoverX = 2260 * (mapW / 2488);
  const compassCoverY = 2080 * (mapH / 2480);
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(compassCoverX, compassCoverY, mapW - compassCoverX, mapH - compassCoverY);

  // Redraw the neighboring state label 'México' cleanly in the official font and gray:
  ctx.fillStyle = '#717579';
  ctx.font = 'italic 19px "Museo Sans", Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('México', 1945, 2015);

  // 2. New North arrow - placed exactly BELOW Aguascalientes and ABOVE Jalisco:
  // Aguascalientes label ends at y ~ 180 px; Jalisco label starts at y ~ 320 px.
  // Center at x = 110, y = 255
  ctx.save();
  ctx.translate(110, 255);

  // Subtle cardinal circle in institutional line color
  ctx.beginPath();
  ctx.arc(0, 0, 32, 0, Math.PI * 2);
  ctx.strokeStyle = '#CED9E3';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Cardinal tick marks (E, S, W)
  ctx.strokeStyle = '#004B87';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(32, 0); ctx.lineTo(39, 0);
  ctx.moveTo(0, 32); ctx.lineTo(0, 39);
  ctx.moveTo(-32, 0); ctx.lineTo(-39, 0);
  ctx.stroke();

  // Navigational Needle (Length: North 44px, South 20px, Width 11px)
  // North-West facet (Deep Blue #004B87)
  ctx.beginPath();
  ctx.moveTo(0, -44); ctx.lineTo(0, 0); ctx.lineTo(-11, 0); ctx.closePath();
  ctx.fillStyle = '#004B87'; ctx.fill();

  // North-East facet (Sky Blue #69B3E7)
  ctx.beginPath();
  ctx.moveTo(0, -44); ctx.lineTo(11, 0); ctx.lineTo(0, 0); ctx.closePath();
  ctx.fillStyle = '#69B3E7'; ctx.fill();

  // South-West facet (Light Gray #E6E7E8)
  ctx.beginPath();
  ctx.moveTo(0, 0); ctx.lineTo(0, 20); ctx.lineTo(-11, 0); ctx.closePath();
  ctx.fillStyle = '#E6E7E8'; ctx.fill();

  // South-East facet (White #FFFFFF with subtle outline #CED9E3)
  ctx.beginPath();
  ctx.moveTo(0, 0); ctx.lineTo(11, 0); ctx.lineTo(0, 20); ctx.closePath();
  ctx.fillStyle = '#FFFFFF'; ctx.fill();
  ctx.strokeStyle = '#CED9E3'; ctx.lineWidth = 1; ctx.stroke();

  // Center pivot
  ctx.beginPath(); ctx.arc(0, 0, 3.5, 0, Math.PI * 2); ctx.fillStyle = '#004B87'; ctx.fill();

  // Letter 'N'
  ctx.fillStyle = '#004B87';
  ctx.font = 'bold 30px "Segoe UI", Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'bottom';
  ctx.fillText('N', 0, -48);

  ctx.restore();

  // Save preview
  const blob = await new Promise(r => c.toBlob(r, 'image/jpeg', 0.95));
  const ab = await blob.arrayBuffer();
  let s = ''; const u8 = new Uint8Array(ab);
  for (let k = 0; k < u8.length; k += 32768) s += String.fromCharCode.apply(null, u8.subarray(k, k + 32768));
  return btoa(s);
})()`);

fs.writeFileSync(path.join(BRAIN, 'test_new_north_placement.jpg'), Buffer.from(b64, 'base64'));
console.log('Saved test_new_north_placement.jpg');

ws.close(); chrome.kill(); server.close(); process.exit(0);
