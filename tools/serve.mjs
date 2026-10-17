import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
const root = fileURLToPath(new URL('../docs/', import.meta.url));
const base = '/pentagrama/';
const mime = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.txt': 'text/plain; charset=utf-8', '.woff2': 'font/woff2' };
const server = http.createServer(async (request, response) => {
  try {
    const url = new URL(request.url, 'http://localhost');
    if (url.pathname === '/' || url.pathname === '/pentagrama') {
      response.writeHead(302, { Location: base }).end();
      return;
    }
    if (!url.pathname.startsWith(base)) { response.writeHead(404).end(); return; }
    const relative = url.pathname.slice(base.length);
    const name = decodeURIComponent(relative ? `/${relative}` : '/index.html');
    const target = path.resolve(root, `.${name}`);
    if (!target.startsWith(root)) { response.writeHead(403).end(); return; }
    const data = await readFile(target);
    response.writeHead(200, { 'Content-Type': mime[path.extname(target)] || 'application/octet-stream', 'Cache-Control': 'no-store' }).end(data);
  } catch { response.writeHead(404).end('No s’ha trobat la pàgina.'); }
});
server.listen(4173, '127.0.0.1', () => console.log(`Local: http://127.0.0.1:4173${base}`));
