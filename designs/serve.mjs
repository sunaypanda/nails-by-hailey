// Local preview of the same static files published to Netlify.
import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

if (process.argv.includes('--generate')) await import('./build-selected.mjs');
const root = fileURLToPath(new URL('../dist/',import.meta.url));
const port = Number(process.env.PORT || 3000);
const types = {'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.webp':'image/webp'};
try { await fs.access(path.join(root,'index.html')); }
catch { console.error('Generate the website first: npm run build'); process.exit(1); }

const server = http.createServer(async (request,response) => {
  if (!['GET','HEAD'].includes(request.method)) {
    response.writeHead(405,{'Allow':'GET, HEAD'}).end(); return;
  }
  try {
    const url = new URL(request.url,'http://localhost');
    const pathname = decodeURIComponent(url.pathname);
    const filename = path.resolve(root,'.'+(pathname === '/' ? '/index.html' : pathname));
    if (!filename.startsWith(root)) { response.writeHead(403).end(); return; }
    const body = await fs.readFile(filename);
    response.writeHead(200,{'Content-Type':types[path.extname(filename)] || 'application/octet-stream','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'});
    response.end(request.method === 'HEAD' ? undefined : body);
  } catch { response.writeHead(404,{'Content-Type':'text/plain; charset=utf-8'}).end('Not found'); }
});
server.on('error',error => { console.error(error.message); process.exit(1); });
server.listen(port,'127.0.0.1',() => console.log(`Nails by Hailey is running at http://localhost:${port}`));
