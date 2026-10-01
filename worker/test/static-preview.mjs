import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, resolve, sep } from 'node:path';

const port = 8767;
const root = resolve(process.cwd());
const mimeTypes = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.svg': 'image/svg+xml'
};

const server = createServer(async (request, response) => {
  try {
    const url = new URL(request.url || '/', 'http://127.0.0.1:' + port);
    const relativePath = decodeURIComponent(url.pathname === '/' ? '/index.html' : url.pathname);
    const filePath = resolve(root, '.' + relativePath);
    if (filePath !== root && !filePath.startsWith(root + sep)) throw new Error('outside preview root');
    const fileStat = await stat(filePath);
    if (!fileStat.isFile()) throw new Error('not a file');
    const contents = await readFile(filePath);
    response.writeHead(200, {
      'content-type': mimeTypes[extname(filePath).toLowerCase()] || 'application/octet-stream',
      'cache-control': 'no-store'
    });
    response.end(contents);
  } catch {
    response.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' });
    response.end('Not found');
  }
});

server.listen(port, '127.0.0.1', () => {
  console.log('OrbitPath static preview: http://127.0.0.1:' + port);
});

