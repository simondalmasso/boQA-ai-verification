'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const workerSource = fs.readFileSync(path.join(root, 'worker.js'), 'utf8');
const statusHtml = fs.readFileSync(path.join(root, 'dashboard', 'status', 'index.html'), 'utf8');

const PUBLIC_CSP = [
  "default-src 'self'",
  "script-src 'self'",
  "style-src 'self'",
  "img-src 'self' data:",
  "connect-src 'self'",
  "object-src 'none'",
  "base-uri 'none'",
  "frame-ancestors 'none'",
  "form-action 'none'",
  "upgrade-insecure-requests",
].join('; ');

function assertCommonHeaders(response, label) {
  assert.equal(response.headers.get('strict-transport-security'), 'max-age=31536000; includeSubDomains', label + ': HSTS');
  assert.equal(response.headers.get('content-security-policy'), PUBLIC_CSP, label + ': CSP');
  assert.equal(response.headers.get('x-content-type-options'), 'nosniff', label + ': nosniff');
  assert.equal(response.headers.get('x-frame-options'), 'DENY', label + ': frame protection');
  assert.equal(response.headers.get('referrer-policy'), 'no-referrer', label + ': referrer');
  assert.equal(
    response.headers.get('permissions-policy'),
    'camera=(), microphone=(), geolocation=(), payment=(), usb=()',
    label + ': permissions'
  );
}

async function run() {
  assert.doesNotMatch(statusHtml, /\sstyle=["']/i, 'public status HTML must not require inline style under CSP');

  const moduleUrl = `data:text/javascript;base64,${Buffer.from(workerSource, 'utf8').toString('base64')}`;
  const worker = (await import(moduleUrl)).default;

  const assetEnv = {
    ASSETS: {
      async fetch(request) {
        const pathname = new URL(request.url).pathname;
        const type = pathname.endsWith('.css') ? 'text/css' : 'text/html; charset=utf-8';
        return new Response('fixture', { status: 200, headers: { 'Content-Type': type } });
      },
    },
  };

  for (const pathname of ['/', '/status/', '/landing.css', '/favicon.svg']) {
    const response = await worker.fetch(new Request('https://public.invalid' + pathname), assetEnv);
    assert.equal(response.status, 200, pathname);
    assertCommonHeaders(response, pathname);
  }

  const health = await worker.fetch(new Request('https://public.invalid/health'), {});
  assert.equal(health.status, 200);
  assertCommonHeaders(health, '/health');

  const apiUnavailable = await worker.fetch(new Request('https://public.invalid/api/health'), {});
  assert.equal(apiUnavailable.status, 503);
  assertCommonHeaders(apiUnavailable, '/api/health');

  const originalFetch = global.fetch;
  try {
    global.fetch = async () => new Response('<html>upstream timeout</html>', {
      status: 522,
      headers: {
        'Content-Type': 'text/html; charset=UTF-8',
        'Retry-After': '120',
      },
    });
    const upstreamUnavailable = await worker.fetch(
      new Request('https://public.invalid/api/health'),
      {
        BOQA_BACKEND_URL: 'https://backend.invalid',
        BOQA_API_KEY: 'fixture-api-key',
        BOQA_HMAC_SECRET: 'fixture-hmac-secret',
      }
    );
    assert.equal(upstreamUnavailable.status, 504, 'non-JSON upstream 5xx must be normalized');
    assert.match(upstreamUnavailable.headers.get('content-type') || '', /^application\/json/i);
    assert.equal(upstreamUnavailable.headers.get('retry-after'), '120');
    assert.deepEqual(await upstreamUnavailable.json(), { error: 'backend_unreachable' });
    assertCommonHeaders(upstreamUnavailable, '/api/health upstream 522');
  } finally {
    global.fetch = originalFetch;
  }

  let insecureFetchCalled = false;
  const originalFetchForTransport = global.fetch;
  try {
    global.fetch = async () => {
      insecureFetchCalled = true;
      return new Response('{}', { status: 200, headers: { 'Content-Type': 'application/json' } });
    };
    const insecureBackend = await worker.fetch(
      new Request('https://public.invalid/api/health'),
      {
        BOQA_BACKEND_URL: 'http://backend.invalid',
        BOQA_API_KEY: 'fixture-api-key',
        BOQA_HMAC_SECRET: 'fixture-hmac-secret',
      }
    );
    assert.equal(insecureBackend.status, 502, 'public plaintext backend transport must be rejected');
    assert.deepEqual(await insecureBackend.json(), { error: 'insecure_backend_transport' });
    assert.equal(insecureFetchCalled, false, 'insecure backend transport must fail before fetch');
  } finally {
    global.fetch = originalFetchForTransport;
  }

  const concealed = await worker.fetch(new Request('https://public.invalid/%2563obros.html'), assetEnv);
  assert.equal(concealed.status, 404);
  assert.equal(concealed.headers.get('strict-transport-security'), 'max-age=31536000; includeSubDomains');
  assert.equal(concealed.headers.get('x-frame-options'), 'DENY');
  assert.equal(
    concealed.headers.get('content-security-policy'),
    "default-src 'none'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'",
    'private surface must preserve stricter CSP'
  );

  console.log('public security headers: PASS');
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
