/**
 * BOQA Cloudflare Worker — static dashboard and fail-closed API proxy.
 * No demo data is generated at the edge.
 */

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

const PUBLIC_SECURITY_HEADERS = Object.freeze({
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  'Content-Security-Policy': PUBLIC_CSP,
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Referrer-Policy': 'no-referrer',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=(), usb=()',
});

function applyPublicSecurityHeaders(headers = new Headers(), overrides = {}) {
  const secured = headers instanceof Headers ? headers : new Headers(headers);
  for (const [name, value] of Object.entries(PUBLIC_SECURITY_HEADERS)) {
    secured.set(name, value);
  }
  const overrideHeaders = overrides instanceof Headers ? overrides : new Headers(overrides);
  for (const [name, value] of overrideHeaders.entries()) {
    secured.set(name, value);
  }
  return secured;
}

async function computeHmacSignature(secret, method, path, ts, bodyStr) {
  const payload = method.toUpperCase() + path + String(ts) + bodyStr;
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(payload));
  return Array.from(new Uint8Array(signature), (byte) => byte.toString(16).padStart(2, '0')).join('');
}

function jsonResponse(payload, status = 200, headers = {}) {
  const responseHeaders = applyPublicSecurityHeaders(new Headers({
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store, max-age=0',
  }), headers);
  return new Response(JSON.stringify(payload), {
    status,
    headers: responseHeaders,
  });
}

function failClosedApi(pathname) {
  return jsonResponse({
    error: 'backend_unavailable',
    source: pathname,
    timestamp: new Date().toISOString(),
  }, 503);
}

function normalizePathname(pathname) {
  let decoded = String(pathname || '/');
  for (let pass = 0; pass < 8; pass += 1) {
    let next;
    try {
      next = decodeURIComponent(decoded);
    } catch (_) {
      // Malformed encodings remain untrusted and are compared in their raw form.
      break;
    }
    if (next === decoded) break;
    decoded = next;
  }
  try {
    const furtherDecoded = decodeURIComponent(decoded);
    if (furtherDecoded !== decoded) return '/__boqa_excessive_encoding__';
  } catch (_) {
    // Malformed percent encoding cannot be decoded further.
  }
  return decoded
    .replace(/\\/g, '/')
    .replace(/\/{2,}/g, '/')
    .toLowerCase();
}

function isPrivateSurface(pathname) {
  // This normalized classifier supersedes legacy literal checks such as
  // pathname === '/cobros.html' while preserving a fail-closed boundary.
  const normalized = normalizePathname(pathname);
  if (normalized === '/__boqa_excessive_encoding__') return true;
  return normalized === '/cobros' ||
    normalized === '/cobros/' ||
    normalized.endsWith('/cobros.html') ||
    normalized.endsWith('/cobros.js') ||
    normalized.endsWith('/private.css') ||
    normalized === '/api/private/billing' ||
    normalized.startsWith('/api/private/billing/');
}

function hiddenPrivateResponse(pathname) {
  const normalized = normalizePathname(pathname);
  const headers = applyPublicSecurityHeaders(new Headers({
    'Cache-Control': 'no-store, max-age=0',
    'Pragma': 'no-cache',
    'Expires': '0',
    'X-Robots-Tag': 'noindex, nofollow, noarchive',
    'Cross-Origin-Resource-Policy': 'same-origin',
  }), {
    'Content-Security-Policy': "default-src 'none'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'",
  });
  if (normalized.startsWith('/api/')) {
    return jsonResponse({ error: 'not_found' }, 404, headers);
  }
  return new Response('Not Found', { status: 404, headers });
}

function isAllowedApiRequest(request, pathname) {
  // The public dashboard consumes only these two minimal, read-only contracts.
  // Every other backend API remains undiscoverable at the public edge.
  const publicReadPaths = new Set([
    '/api/health',
    '/api/hunter/status',
  ]);
  return request.method === 'GET' && publicReadPaths.has(pathname);
}

async function proxyToBackend(request, env) {
  const backendUrl = env.BOQA_BACKEND_URL;
  const workerApiKey = env.BOQA_API_KEY;
  const hmacSecret = env.BOQA_HMAC_SECRET;
  if (!backendUrl || !workerApiKey || !hmacSecret) {
    return jsonResponse({ error: 'worker_auth_not_configured' }, 503);
  }

  let parsedBackend;
  try {
    parsedBackend = new URL(backendUrl);
  } catch (_) {
    return jsonResponse({ error: 'invalid_backend_configuration' }, 502);
  }

  const incomingUrl = new URL(request.url);
  const targetUrl = new URL(incomingUrl.pathname + incomingUrl.search, parsedBackend);
  const proxyHeaders = new Headers(request.headers);
  proxyHeaders.set('Host', parsedBackend.host);
  proxyHeaders.set('X-API-Key', workerApiKey);
  proxyHeaders.delete('CF-Connecting-IP');
  proxyHeaders.delete('X-Forwarded-For');

  let bodyForProxy;
  let bodyString = '';
  if (!['GET', 'HEAD'].includes(request.method)) {
    const bodyBuffer = await request.arrayBuffer();
    bodyForProxy = bodyBuffer;
    bodyString = new TextDecoder().decode(bodyBuffer);
  }

  const timestamp = Math.floor(Date.now() / 1000);
  const pathWithQuery = incomingUrl.pathname + incomingUrl.search;
  const signature = await computeHmacSignature(hmacSecret, request.method, pathWithQuery, timestamp, bodyString);
  proxyHeaders.set('X-BOQA-Sig', signature);
  proxyHeaders.set('X-BOQA-Ts', String(timestamp));

  try {
    const backendResponse = await fetch(new Request(targetUrl.toString(), {
      method: request.method,
      headers: proxyHeaders,
      body: bodyForProxy,
      redirect: 'manual',
    }));

    const websocketUpgrade = backendResponse.status === 101 ||
      (backendResponse.headers.get('upgrade') || '').toLowerCase() === 'websocket';
    if (websocketUpgrade) {
      return jsonResponse({ error: 'websocket_not_supported_via_worker', fallback: 'http_polling' }, 426);
    }

    const headers = applyPublicSecurityHeaders(new Headers(backendResponse.headers));
    headers.delete('Transfer-Encoding');
    headers.set('Cache-Control', 'no-store, max-age=0');
    headers.set('Pragma', 'no-cache');
    return new Response(backendResponse.body, {
      status: backendResponse.status,
      statusText: backendResponse.statusText,
      headers,
    });
  } catch (_) {
    return jsonResponse({ error: 'backend_unreachable' }, 504);
  }
}

function secureAssetResponse(assetResponse, pathname) {
  const headers = new Headers(assetResponse.headers);
  const isMutableAsset = pathname === '/' || pathname.endsWith('.html') || pathname.endsWith('.js') || pathname.endsWith('.css');
  if (isMutableAsset) {
    headers.set('Cache-Control', 'no-store, max-age=0');
    headers.set('Pragma', 'no-cache');
    headers.set('Expires', '0');
  }
  applyPublicSecurityHeaders(headers);
  return new Response(assetResponse.body, {
    status: assetResponse.status,
    statusText: assetResponse.statusText,
    headers,
  });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const backendConfigured = Boolean(env && env.BOQA_BACKEND_URL);

    if (isPrivateSurface(url.pathname)) {
      return hiddenPrivateResponse(url.pathname);
    }

    if (url.pathname.startsWith('/api/')) {
      const allowed = isAllowedApiRequest(request, url.pathname);
      if (!allowed) return jsonResponse({ error: 'not_found' }, 404);
      if (!backendConfigured) return failClosedApi(url.pathname);
      return proxyToBackend(request, env);
    }

    if (url.pathname === '/ws') {
      if (!backendConfigured) return jsonResponse({ error: 'websocket_unavailable', fallback: 'http_polling' }, 426);
      return proxyToBackend(request, env);
    }

    if (url.pathname === '/health') {
      return jsonResponse({
        status: 'ok',
        worker: 'boqa',
        mode: backendConfigured ? 'production' : 'backend_unavailable',
        backend_configured: backendConfigured,
        timestamp: new Date().toISOString(),
      });
    }

    if (env && env.ASSETS) {
      return secureAssetResponse(await env.ASSETS.fetch(request), url.pathname);
    }

    return new Response('BOQA Worker — no assets bound', {
      status: 404,
      headers: applyPublicSecurityHeaders(new Headers({ 'Cache-Control': 'no-store, max-age=0' })),
    });
  },
};
