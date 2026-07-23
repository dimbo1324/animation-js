/**
 * Zero-dependency static dev server with live reload.
 *
 * ES modules cannot be loaded over `file://`, so the project needs a
 * server even though it has no build step. This one serves the repository
 * root, redirects `/` to `public/index.html`, and pushes a reload over
 * Server-Sent Events whenever a watched file changes.
 *
 * Deliberately dependency-free: the project's runtime has no dependencies,
 * and its tooling should not quietly acquire any either.
 */

import { createReadStream, existsSync, statSync, watch } from 'node:fs';
import { createServer } from 'node:http';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const ROOT = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '..',
);
const ENTRY = '/public/index.html';
const PORT = Number(process.env.PORT ?? 5173);
const HOST = process.env.HOST ?? 'localhost';
const WATCHED = ['src', 'public'];
const RELOAD_DEBOUNCE_MS = 60;

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
};

const LIVE_RELOAD_SNIPPET = `
<script>
  (() => {
    const source = new EventSource('/__dev/reload');
    source.addEventListener('reload', () => location.reload());
    source.addEventListener('error', () => source.close());
  })();
</script>
`;

/** @type {Set<import('node:http').ServerResponse>} */
const clients = new Set();

const server = createServer((request, response) => {
  const url = new URL(request.url, `http://${request.headers.host}`);

  if (url.pathname === '/__dev/reload') {
    openReloadStream(response);

    return;
  }

  const pathname = url.pathname === '/' ? ENTRY : url.pathname;
  const filePath = resolveWithinRoot(pathname);

  if (filePath === null) {
    send(response, 403, 'Forbidden');

    return;
  }

  if (!existsSync(filePath) || !statSync(filePath).isFile()) {
    send(response, 404, `Not found: ${pathname}`);

    return;
  }

  serveFile(response, filePath);
});

function resolveWithinRoot(pathname) {
  const decoded = decodeURIComponent(pathname);
  const resolved = path.resolve(ROOT, `.${decoded}`);

  return resolved.startsWith(ROOT) ? resolved : null;
}

function serveFile(response, filePath) {
  const extension = path.extname(filePath).toLowerCase();
  const contentType =
    MIME_TYPES[extension] ?? 'application/octet-stream';

  response.setHeader('Content-Type', contentType);
  response.setHeader('Cache-Control', 'no-store');

  if (extension !== '.html') {
    createReadStream(filePath).pipe(response);

    return;
  }

  // HTML is read into memory so the live-reload client can be appended.
  let html = '';
  const stream = createReadStream(filePath, 'utf8');

  stream.on('data', (chunk) => {
    html += chunk;
  });

  stream.on('end', () => {
    response.end(
      html.replace('</body>', `${LIVE_RELOAD_SNIPPET}</body>`),
    );
  });

  stream.on('error', () => send(response, 500, 'Read error'));
}

function openReloadStream(response) {
  response.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-store',
    'Connection': 'keep-alive',
  });
  response.write('retry: 500\n\n');

  clients.add(response);
  response.on('close', () => clients.delete(response));
}

function send(response, status, body) {
  response.writeHead(status, {
    'Content-Type': 'text/plain; charset=utf-8',
  });
  response.end(body);
}

function notifyClients(changedPath) {
  console.log(`  reload  ${changedPath}`);

  for (const client of clients) {
    client.write('event: reload\ndata: {}\n\n');
  }
}

function startWatching() {
  let timer = null;

  for (const directory of WATCHED) {
    const absolute = path.join(ROOT, directory);

    if (!existsSync(absolute)) {
      continue;
    }

    watch(absolute, { recursive: true }, (_event, filename) => {
      if (filename === null) {
        return;
      }

      clearTimeout(timer);
      timer = setTimeout(
        () => notifyClients(path.join(directory, filename)),
        RELOAD_DEBOUNCE_MS,
      );
    });
  }
}

server.listen(PORT, HOST, () => {
  startWatching();
  console.log('');
  console.log(`  animation-js  http://${HOST}:${PORT}`);
  console.log(`  watching      ${WATCHED.join(', ')}`);
  console.log('');
});
