import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';

const ROOT = 'c:/Proyectos/plataforma-sdh-ug';
const OUT = path.join(ROOT, 'Infografias_nuevas_2026-11-03');
const BRAIN = 'C:/Users/luisa/.gemini/antigravity/brain/c662a799-4137-4840-b03c-36a8c750a4af';
const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';

const sleep = ms => new Promise(r => setTimeout(r, ms));

async function capturePDF(pdfPath, outImagePath) {
  const profile = path.join(process.env.TEMP, 'sdh-shot-' + Date.now());
  const fileUrl = 'file:///' + pdfPath.replace(/\\/g, '/');
  const chrome = spawn(CHROME, [
    '--headless=new',
    '--disable-gpu',
    '--remote-debugging-port=9455',
    '--remote-allow-origins=*',
    `--user-data-dir=${profile}`,
    fileUrl
  ], { stdio: 'ignore' });

  let target;
  for (let i = 0; i < 40 && !target; i++) {
    await sleep(300);
    try {
      const list = await (await fetch('http://127.0.0.1:9455/json/list')).json();
      target = list.find(t => t.type === 'page');
    } catch {}
  }
  if (!target) {
    chrome.kill();
    throw new Error('No se pudo conectar a Chrome para ' + pdfPath);
  }

  const ws = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise(r => ws.addEventListener('open', r));
  let id = 0; const pending = new Map();
  ws.addEventListener('message', e => {
    const m = JSON.parse(e.data);
    if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); }
  });

  const send = (method, params = {}) => new Promise((resolve, reject) => {
    const myId = ++id;
    pending.set(myId, m => m.error ? reject(new Error(JSON.stringify(m.error))) : resolve(m.result));
    ws.send(JSON.stringify({ id: myId, method, params }));
  });

  await sleep(1500);
  await send('Emulation.setDeviceMetricsOverride', { width: 1782, height: 1260, deviceScaleFactor: 1, mobile: false });
  await sleep(500);
  const shot = await send('Page.captureScreenshot', { format: 'png' });

  fs.writeFileSync(outImagePath, Buffer.from(shot.data, 'base64'));
  console.log('Saved:', outImagePath);

  ws.close();
  chrome.kill();
  await sleep(500);
}

const mapPdf = path.join(OUT, 'SDH_000_Mapa_Global_A2.pdf');
const idxPdf = path.join(OUT, 'SDH_000_Indice_107_Comunidades_A2.pdf');

await capturePDF(mapPdf, path.join(BRAIN, 'final_preview_mapa_global.png'));
await capturePDF(idxPdf, path.join(BRAIN, 'final_preview_indice.png'));

process.exit(0);
