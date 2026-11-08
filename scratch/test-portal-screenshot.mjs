import http from 'http';
import fs from 'fs';
import path from 'path';
import { execSync, spawn } from 'child_process';

const PORT = 8091;
const ROOT = path.resolve('.');

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.otf': 'font/otf',
  '.ttf': 'font/ttf',
  '.pdf': 'application/pdf',
};

const server = http.createServer((req, res) => {
  try {
    let reqUrl = decodeURI(req.url.split('?')[0]);
    if (reqUrl === '/') reqUrl = '/portal/index.html';
    const filePath = path.join(ROOT, reqUrl);
    if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Not found');
      return;
    }
    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': contentType });
    fs.createReadStream(filePath).pipe(res);
  } catch (err) {
    res.writeHead(500, { 'Content-Type': 'text/plain' });
    res.end(err.message);
  }
});

server.listen(PORT, async () => {
  console.log(`Server listening at http://127.0.0.1:${PORT}`);
  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const outPath = path.resolve('scratch/portal_preview_desktop.png');

  try {
    const cmd = `"${chromePath}" --headless=new --disable-gpu --window-size=1600,1050 --virtual-time-budget=3000 --screenshot="${outPath}" "http://127.0.0.1:${PORT}/portal/index.html"`;
    console.log('Running chrome screenshot...');
    execSync(cmd, { stdio: 'inherit' });
    console.log(`Screenshot saved to ${outPath}`);
  } catch (err) {
    console.error('Error running chrome:', err.message);
  } finally {
    server.close();
    process.exit(0);
  }
});
