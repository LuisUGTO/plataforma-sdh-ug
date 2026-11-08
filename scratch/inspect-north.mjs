import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';

const BRAIN = 'C:/Users/luisa/.gemini/antigravity/brain/c662a799-4137-4840-b03c-36a8c750a4af';
const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';

const server = http.createServer((req, res) => {
  const p = path.join(BRAIN, decodeURIComponent(req.url.split('?')[0]));
  if (!fs.existsSync(p)) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { 'Content-Type': 'image/jpeg' });
  fs.createReadStream(p).pipe(res);
});
await new Promise(r => server.listen(8788, '127.0.0.1', r));

const profile = path.join(process.env.TEMP, 'sdh-inspect-ref');
const chrome = spawn(CHROME, ['--headless=new', '--disable-gpu', '--remote-debugging-port=9344', '--remote-allow-origins=*', `--user-data-dir=${profile}`, 'about:blank'], { stdio: 'ignore' });
const sleep = ms => new Promise(r => setTimeout(r, ms));
let target;
for (let i = 0; i < 60 && !target; i++) {
  await sleep(400);
  try { const list = await (await fetch('http://127.0.0.1:9344/json/list')).json(); target = list.find(t => t.type === 'page'); } catch {}
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
  img.src = 'http://127.0.0.1:8788/.user_uploaded/media_1793929976759_031bdeac.jpg';
  await img.decode();
  // Crop top-left (e.g. x: 0 to 200, y: 0 to 200)
  const c = document.createElement('canvas');
  c.width = 300;
  c.height = 300;
  const ctx = c.getContext('2d');
  ctx.drawImage(img, 40, 60, 200, 200, 0, 0, 300, 300);
  const blob = await new Promise(r => c.toBlob(r, 'image/jpeg', 0.95));
  const ab = await blob.arrayBuffer();
  let bin = '';
  const u8 = new Uint8Array(ab);
  for(let k=0; k<u8.length; k+=32768) bin += String.fromCharCode.apply(null, u8.subarray(k, k+32768));
  window.__b64 = btoa(bin);
  return true;
})()`);

const b64 = await evalJS("window.__b64");
fs.writeFileSync(path.join(BRAIN, 'crop_north_inegi.jpg'), Buffer.from(b64, 'base64'));
console.log('Saved crop_north_inegi.jpg');
ws.close(); chrome.kill(); server.close(); process.exit(0);
