import http from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
const root = fileURLToPath(new URL('../docs/', import.meta.url));
const base = '/pentagrama/';
const mime = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.txt': 'text/plain; charset=utf-8', '.xml': 'application/xml; charset=utf-8', '.png': 'image/png', '.woff2': 'font/woff2', '.mp3': 'audio/mpeg' };
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
    let target = path.resolve(root, `.${name}`);
    if (target !== root && !target.startsWith(root + path.sep)) { response.writeHead(403).end(); return; }
    if ((await stat(target)).isDirectory()) {
      if (!url.pathname.endsWith('/')) { response.writeHead(302, { Location: `${url.pathname}/${url.search}` }).end(); return; }
      target = path.join(target, 'index.html');
    }
    const data = await readFile(target);
    response.writeHead(200, { 'Content-Type': mime[path.extname(target)] || 'application/octet-stream', 'Cache-Control': 'no-store' }).end(data);
  } catch { response.writeHead(404).end('No s’ha trobat la pàgina.'); }
});
const port = Number(process.env.PORT) || 4173;
server.listen(port, '127.0.0.1', () => console.log(`Local: http://127.0.0.1:${port}${base}`));
