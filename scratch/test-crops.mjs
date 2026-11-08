import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';

const ROOT = 'c:/Proyectos/plataforma-sdh-ug';
const BRAIN = 'C:/Users/luisa/.gemini/antigravity/brain/c662a799-4137-4840-b03c-36a8c750a4af';
const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const mime = { '.html': 'text/html', '.js': 'application/javascript', '.png': 'image/png', '.jpg': 'image/jpeg' };

const server = http.createServer((req, res) => {
  const p = path.join(ROOT, decodeURIComponent(req.url.split('?')[0]));
  if (!fs.existsSync(p) || fs.statSync(p).isDirectory()) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { 'Content-Type': mime[path.extname(p).toLowerCase()] || 'application/octet-stream' });
  fs.createReadStream(p).pipe(res);
});
await new Promise(r => server.listen(8789, '127.0.0.1', r));

const profile = path.join(process.env.TEMP, 'sdh-inspect-crops');
const chrome = spawn(CHROME, ['--headless=new', '--disable-gpu', '--remote-debugging-port=9345', '--remote-allow-origins=*', `--user-data-dir=${profile}`, 'http://127.0.0.1:8789/index.html'], { stdio: 'ignore' });
const sleep = ms => new Promise(r => setTimeout(r, ms));
let target;
for (let i = 0; i < 60 && !target; i++) {
  await sleep(400);
  try { const list = await (await fetch('http://127.0.0.1:9345/json/list')).json(); target = list.find(t => t.type === 'page'); } catch {}
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

  // Test crop 1: Noreste
  // Let's test two candidate boxes for Noreste:
  // Candidate A: x: 1600, y: 400, w: 850, h: 750 (covers F, K, M, B, H, I - the whole Sierra Gorda!)
  // Candidate B: x: 1650, y: 550, w: 650, h: 600 (focused on Victoria, Tierra Blanca, Santa Catarina)
  async function saveCrop(sx, sy, sw, sh, name) {
    const c = document.createElement('canvas');
    c.width = sw; c.height = sh;
    const ctx = c.getContext('2d');
    ctx.drawImage(img, sx, sy, sw, sh, 0, 0, sw, sh);
    const blob = await new Promise(r => c.toBlob(r, 'image/jpeg', 0.9));
    const ab = await blob.arrayBuffer();
    let bin = '';
    const u8 = new Uint8Array(ab);
    for(let k=0; k<u8.length; k+=32768) bin += String.fromCharCode.apply(null, u8.subarray(k, k+32768));
    window['__crop_' + name] = btoa(bin);
  }

  await saveCrop(1600, 400, 850, 750, 'noreste_wide');
  await saveCrop(1700, 520, 600, 650, 'noreste_focus');
  await saveCrop(1050, 850, 650, 580, 'centro_sma');
  return true;
})()`);

for (const name of ['noreste_wide', 'noreste_focus', 'centro_sma']) {
  const b64 = await evalJS(`window['__crop_${name}']`);
  fs.writeFileSync(path.join(BRAIN, `crop_${name}.jpg`), Buffer.from(b64, 'base64'));
  console.log('Saved crop_' + name);
}

ws.close(); chrome.kill(); server.close(); process.exit(0);
