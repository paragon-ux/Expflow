import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, normalize, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createGuiBridge } from '../../dist/index.js';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const appRoot = resolve(__dirname);
const bridge = createGuiBridge();
const port = Number(process.env.EXPFLOW_GUI_PORT ?? '4173');

const contentTypes = new Map([
  ['.css', 'text/css; charset=utf-8'],
  ['.html', 'text/html; charset=utf-8'],
  ['.js', 'text/javascript; charset=utf-8'],
]);

function json(response, status, body) {
  response.writeHead(status, { 'content-type': 'application/json; charset=utf-8' });
  response.end(JSON.stringify(body));
}

async function readBody(request) {
  const chunks = [];
  let size = 0;
  for await (const chunk of request) {
    size += chunk.byteLength;
    if (size > 1_000_000) {
      throw new Error('Request body is too large.');
    }
    chunks.push(chunk);
  }
  if (chunks.length === 0) {
    return {};
  }
  return JSON.parse(Buffer.concat(chunks).toString('utf8'));
}

function isWithin(root, candidate) {
  const relative = normalize(candidate).slice(root.length);
  return candidate === root || (candidate.startsWith(root) && relative.startsWith(sep));
}

async function serveStatic(request, response) {
  const url = new URL(request.url ?? '/', `http://${request.headers.host ?? 'localhost'}`);
  const pathname = url.pathname === '/' ? '/index.html' : decodeURIComponent(url.pathname);
  const target = resolve(appRoot, `.${pathname}`);
  if (!isWithin(appRoot, target)) {
    response.writeHead(403);
    response.end('Forbidden');
    return;
  }
  try {
    const bytes = await readFile(target);
    response.writeHead(200, {
      'content-type': contentTypes.get(extname(target)) ?? 'application/octet-stream',
    });
    response.end(bytes);
  } catch {
    response.writeHead(404);
    response.end('Not found');
  }
}

async function handleApi(request, response) {
  const body = await readBody(request);
  const url = new URL(request.url ?? '/', `http://${request.headers.host ?? 'localhost'}`);
  const routes = {
    '/api/history': () => bridge.getHistory(body),
    '/api/init': () => bridge.initializeProject(body),
    '/api/node-history': () => bridge.getNodeHistory(body),
    '/api/receipt': () => bridge.readReceipt(body),
    '/api/recover': () => bridge.recover(body),
    '/api/restore': () => bridge.executeRestore(body),
    '/api/restore/plan': () => bridge.planRestore(body),
    '/api/status': () => bridge.inspectProject(body),
    '/api/sync': () => bridge.executeSync(body),
    '/api/sync/plan': () => bridge.planSync(body),
    '/api/verify': () => bridge.verify(body),
  };
  const route = routes[url.pathname];
  if (route === undefined) {
    json(response, 404, { error: 'unknown_endpoint' });
    return;
  }
  json(response, 200, await route());
}

const server = createServer((request, response) => {
  void (async () => {
    if (request.url?.startsWith('/api/')) {
      await handleApi(request, response);
      return;
    }
    if (request.method !== 'GET' && request.method !== 'HEAD') {
      response.writeHead(405);
      response.end('Method not allowed');
      return;
    }
    await serveStatic(request, response);
  })().catch((error) => {
    json(response, 500, {
      error: {
        code: 'gui_server_error',
        message: error instanceof Error ? error.message : String(error),
      },
    });
  });
});

server.listen(port, '127.0.0.1', () => {
  console.log(`Expflow GUI listening at http://127.0.0.1:${String(port)}`);
  console.log(`Static root: ${join(appRoot, 'index.html')}`);
});
