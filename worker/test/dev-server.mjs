import { createServer } from 'node:http';
import worker from '../src/index.mjs';

const port = 8787;
const environment = {
  DEMO_MODE: 'true',
  ALLOWED_ORIGINS: 'http://127.0.0.1:8766,http://localhost:8766,http://127.0.0.1:8767,http://localhost:8767',
  DRAFT_QUEST_LIMITER: { limit: async () => ({ success: true }) }
};

const server = createServer(async (incoming, outgoing) => {
  try {
    const chunks = [];
    for await (const chunk of incoming) chunks.push(chunk);
    const body = Buffer.concat(chunks);
    const init = { method: incoming.method, headers: incoming.headers };
    if (!['GET', 'HEAD'].includes(incoming.method || 'GET')) {
      init.body = body;
      init.duplex = 'half';
    }

    const request = new Request('http://127.0.0.1:' + port + (incoming.url || '/'), init);
    const response = await worker.fetch(request, environment);
    response.headers.forEach((value, key) => outgoing.setHeader(key, value));
    outgoing.writeHead(response.status);
    outgoing.end(Buffer.from(await response.arrayBuffer()));
  } catch {
    outgoing.writeHead(500, { 'content-type': 'application/json; charset=utf-8' });
    outgoing.end(JSON.stringify({ error: 'Local demo server error.' }));
  }
});

server.listen(port, '127.0.0.1', () => {
  console.log('OrbitPath local Worker demo: http://127.0.0.1:' + port);
});

