import { randomBytes } from 'node:crypto';
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, normalize, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createGuiBridge } from '../../dist/index.js';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const appRoot = resolve(__dirname);
const bridge = createGuiBridge();
const port = Number(process.env.EXPFLOW_GUI_PORT ?? '4173');

// Per-launch request token
const requestToken = randomBytes(32).toString('hex');

const contentTypes = new Map([
  ['.css', 'text/css; charset=utf-8'],
  ['.html', 'text/html; charset=utf-8'],
  ['.js', 'text/javascript; charset=utf-8'],
]);

// Routes that may mutate state (require POST + token)
const mutationRoutes = new Set(['/api/init', '/api/sync', '/api/restore', '/api/recover']);

// Read-only routes (require token, allow POST but also allow read-only inspection)
const readRoutes = new Set([
  '/api/status',
  '/api/sync/plan',
  '/api/restore/plan',
  '/api/history',
  '/api/node-history',
  '/api/verify',
  '/api/read-models/list',
  '/api/receipt',
]);

const validHosts = new Set(['127.0.0.1', 'localhost']);
const validHostPattern = /^(127\.0\.0\.1|localhost)(:\d+)?$/;

function isOriginAllowed(origin) {
  try {
    const url = new URL(origin);
    return (url.protocol === 'http:' || url.protocol === 'https:') && validHosts.has(url.hostname);
  } catch {
    return false;
  }
}

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
    let bytes = await readFile(target);

    // Inject request token into index.html so the client can read it
    if (target.endsWith('.html')) {
      let html = bytes.toString('utf8');
      html = html.replace(
        '<head>',
        `<head>\n  <meta name="request-token" content="${requestToken}">`,
      );
      bytes = Buffer.from(html, 'utf8');
    }

    response.writeHead(200, {
      'content-type': contentTypes.get(extname(target)) ?? 'application/octet-stream',
    });
    response.end(bytes);
  } catch {
    response.writeHead(404);
    response.end('Not found');
  }
}

function validateRequest(request) {
  // 1. Host validation
  const host = request.headers.host ?? '';
  if (!validHostPattern.test(host)) {
    return { valid: false, status: 400, code: 'invalid_host', message: 'Unexpected Host header.' };
  }

  // 2. Origin validation (when present — compare scheme+hostname, tolerate any port)
  const origin = request.headers.origin ?? null;
  if (origin !== null && !isOriginAllowed(origin)) {
    return { valid: false, status: 403, code: 'invalid_origin', message: 'Unexpected Origin.' };
  }

  // 3. Token validation
  const token = request.headers['x-request-token'] ?? '';
  if (token !== requestToken) {
    return {
      valid: false,
      status: 401,
      code: 'invalid_token',
      message: 'Missing or invalid request token.',
    };
  }

  return { valid: true, status: 200, code: null, message: null };
}

async function handleApi(request, response) {
  const url = new URL(request.url ?? '/', `http://${request.headers.host ?? 'localhost'}`);
  const pathname = url.pathname;

  // Determine if this is a known route
  const isMutation = mutationRoutes.has(pathname);
  const isRead = readRoutes.has(pathname);

  if (!isMutation && !isRead) {
    json(response, 404, { error: { code: 'unknown_endpoint', message: 'Unknown API endpoint.' } });
    return;
  }

  // Method enforcement: mutations require POST
  if (isMutation && request.method !== 'POST') {
    response.writeHead(405, { Allow: 'POST' });
    response.end(
      JSON.stringify({
        error: { code: 'method_not_allowed', message: 'Only POST is allowed for this endpoint.' },
      }),
    );
    return;
  }

  // Read routes accept POST
  if (isRead && request.method !== 'POST' && request.method !== 'GET') {
    response.writeHead(405, { Allow: 'POST, GET' });
    response.end(
      JSON.stringify({
        error: {
          code: 'method_not_allowed',
          message: 'Only POST and GET are allowed for this endpoint.',
        },
      }),
    );
    return;
  }

  // Request validation (Host, Origin, token)
  const validation = validateRequest(request);
  if (!validation.valid) {
    json(response, validation.status, {
      error: { code: validation.code, message: validation.message },
    });
    return;
  }

  // Read body for POST requests
  let body = {};
  if (request.method === 'POST') {
    try {
      body = await readBody(request);
    } catch {
      json(response, 400, {
        error: { code: 'invalid_body', message: 'Request body must be valid JSON.' },
      });
      return;
    }
  }

  // Root validation: reject blank/whitespace-only roots for all operations
  const rawRoot = body && typeof body === 'object' && 'root' in body ? body.root : undefined;
  if (
    rawRoot !== undefined &&
    rawRoot !== null &&
    typeof rawRoot === 'string' &&
    rawRoot.trim().length === 0
  ) {
    json(response, 400, {
      data: null,
      error: {
        code: 'root_required',
        message:
          'A non-empty project root path is required. The GUI must provide an explicit project directory.',
        recoverable: true,
        recommended_action:
          'Enter a project root path in the GUI input field, then inspect or initialize.',
      },
      root: '',
      state: 'error',
      technical_details: {
        native_authority: 'Expflow',
        operation: pathname.slice(5),
        raw_storage_access: false,
        surface: 'Expflow GUI bridge',
      },
    });
    return;
  }

  const routes = {
    '/api/history': () => bridge.getHistory(body),
    '/api/init': () => bridge.initializeProject(body),
    '/api/node-history': () => bridge.getNodeHistory(body),
    '/api/receipt': () => bridge.readReceipt(body),
    '/api/recover': () => bridge.recover(body),
    '/api/read-models/list': () => bridge.listReadModelRecords(body),
    '/api/restore': () => bridge.executeRestore(body),
    '/api/restore/plan': () => bridge.planRestore(body),
    '/api/status': () => bridge.inspectProject(body),
    '/api/sync': () => bridge.executeSync(body),
    '/api/sync/plan': () => bridge.planSync(body),
    '/api/verify': () => bridge.verify(body),
  };

  const route = routes[pathname];
  if (route === undefined) {
    json(response, 404, { error: { code: 'unknown_endpoint', message: 'Unknown API endpoint.' } });
    return;
  }

  const result = await route();
  json(response, 200, result);
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
