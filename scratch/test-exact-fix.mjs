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
await new Promise(r => server.listen(8822, '127.0.0.1', r));

const profile = path.join(process.env.TEMP, 'sdh-chrome-test-' + Date.now());
const chrome = spawn(CHROME, ['--headless=new', '--disable-gpu', '--remote-debugging-port=9422', '--remote-allow-origins=*', `--user-data-dir=${profile}`, 'about:blank'], { stdio: 'pipe' });
chrome.stderr.on('data', d => console.error('Chrome stderr:', d.toString()));
chrome.stdout.on('data', d => console.log('Chrome stdout:', d.toString()));
const sleep = ms => new Promise(r => setTimeout(r, ms));
let target;
for (let i = 0; i < 40 && !target; i++) {
  await sleep(300);
  try {
    const list = await (await fetch('http://127.0.0.1:9422/json/list')).json();
    target = list.find(t => t.type === 'page');
  } catch {}
}
if (!target) throw new Error('No se pudo conectar con Chrome');
const ws = new WebSocket(target.webSocketDebuggerUrl);
await new Promise(r => ws.addEventListener('open', r));

let id = 0; const pending = new Map();
ws.addEventListener('message', e => {
  const m = JSON.parse(e.data);
  if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); }
});
const evalJS = (expression) => new Promise((resolve, reject) => {
  const myId = ++id;
  pending.set(myId, m => m.error ? reject(new Error(JSON.stringify(m.error))) : m.result?.exceptionDetails ? reject(new Error(JSON.stringify(m.result.exceptionDetails))) : resolve(m.result.result.value));
  ws.send(JSON.stringify({ id: myId, method: 'Runtime.evaluate', params: { expression, awaitPromise: true, returnByValue: true } }));
});

console.log('Testing canvas composition in browser...');

const crops = await evalJS(`(async () => {
  const rawMap = new Image();
  rawMap.src = 'assets/New_mapas/Mapa global de las comunidades indígenas.png?v=' + Date.now();
  await rawMap.decode();

  const c = document.createElement('canvas');
  c.width = 4000; c.height = 2213;
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, c.width, c.height);

  const mapW = 2213, mapH = 2213;
  ctx.drawImage(rawMap, 0, 0, 2488, 2480, 0, 0, mapW, mapH);

  // Exact cover of old compass in bottom right
  const scX = mapW / 2488, scY = mapH / 2480;
  const coverX = 2272 * scX;
  const coverY = 2080 * scY;
  const coverW = (2480 - 2272) * scX;
  const coverH = (2402 - 2080) * scY; // Stops at 2402 in source, preserving black baseline at 2410
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(coverX, coverY, coverW, coverH);

  // New North arrow positioned cleanly between Aguascalientes and Jalisco
  ctx.save();
  ctx.translate(160, 430);
  ctx.beginPath(); ctx.arc(0, 0, 56, 0, Math.PI * 2); ctx.strokeStyle = '#CED9E3'; ctx.lineWidth = 2.5; ctx.stroke();
  ctx.strokeStyle = '#004B87'; ctx.lineWidth = 2.5; ctx.beginPath();
  ctx.moveTo(56, 0); ctx.lineTo(68, 0);
  ctx.moveTo(0, 56); ctx.lineTo(0, 68);
  ctx.moveTo(-56, 0); ctx.lineTo(-68, 0);
  ctx.stroke();
  ctx.beginPath(); ctx.moveTo(0, -85); ctx.lineTo(0, 0); ctx.lineTo(-22, 0); ctx.closePath(); ctx.fillStyle = '#004B87'; ctx.fill();
  ctx.beginPath(); ctx.moveTo(0, -85); ctx.lineTo(22, 0); ctx.lineTo(0, 0); ctx.closePath(); ctx.fillStyle = '#69B3E7'; ctx.fill();
  ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, 36); ctx.lineTo(-22, 0); ctx.closePath(); ctx.fillStyle = '#E6E7E8'; ctx.fill();
  ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(22, 0); ctx.lineTo(0, 36); ctx.closePath(); ctx.fillStyle = '#FFFFFF'; ctx.fill();
  ctx.strokeStyle = '#CED9E3'; ctx.lineWidth = 1; ctx.stroke();
  ctx.beginPath(); ctx.arc(0, 0, 6, 0, Math.PI * 2); ctx.fillStyle = '#004B87'; ctx.fill();
  ctx.beginPath(); ctx.arc(0, 0, 2.5, 0, Math.PI * 2); ctx.fillStyle = '#FFFFFF'; ctx.fill();
  ctx.fillStyle = '#004B87'; ctx.font = 'bold 54px "Segoe UI", Arial, sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'bottom';
  ctx.fillText('N', 0, -96);
  ctx.restore();

  // Outer border
  ctx.strokeStyle = '#CED9E3'; ctx.lineWidth = 2.5; ctx.strokeRect(0, 0, mapW, mapH);

  // Take crop of Top-Left (Aguascalientes + North + Jalisco): x: 0..400, y: 0..800
  const cTL = document.createElement('canvas');
  cTL.width = 400; cTL.height = 800;
  cTL.getContext('2d').drawImage(c, 0, 0, 400, 800, 0, 0, 400, 800);

  // Take crop of Bottom-Right (México + old compass + baseline): x: 1800..2213, y: 1800..2213
  const cBR = document.createElement('canvas');
  cBR.width = 413; cBR.height = 413;
  cBR.getContext('2d').drawImage(c, 1800, 1800, 413, 413, 0, 0, 413, 413);

  return {
    tl: cTL.toDataURL('image/png').split(',')[1],
    br: cBR.toDataURL('image/png').split(',')[1]
  };
})()`);

fs.writeFileSync(path.join(BRAIN, 'test_crop_top_left.png'), Buffer.from(crops.tl, 'base64'));
fs.writeFileSync(path.join(BRAIN, 'test_crop_bottom_right.png'), Buffer.from(crops.br, 'base64'));
console.log('Saved test crops to brain directory successfully!');

ws.close();
chrome.kill();
server.close();
process.exit(0);
