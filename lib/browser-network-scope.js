'use strict';

function normalizeAllowedOrigin(raw) {
  let url;
  try {
    url = new URL(String(raw || ''));
  } catch (_) {
    return null;
  }
  if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password) return null;
  return url.origin;
}

function networkOrigin(rawUrl) {
  let url;
  try {
    url = new URL(String(rawUrl || ''));
  } catch (_) {
    return null;
  }

  if (url.protocol === 'data:' || url.protocol === 'about:') return 'local-non-network';
  if (url.protocol === 'blob:') return url.origin && url.origin !== 'null' ? url.origin : null;

  if (url.protocol === 'ws:' || url.protocol === 'wss:') {
    const mapped = new URL(url.href);
    mapped.protocol = url.protocol === 'ws:' ? 'http:' : 'https:';
    return mapped.origin;
  }

  if (url.protocol === 'http:' || url.protocol === 'https:') return url.origin;
  return null;
}

function isNetworkUrlAllowed(rawUrl, allowedOrigins) {
  const origin = networkOrigin(rawUrl);
  if (origin === 'local-non-network') return true;
  if (!origin) return false;
  const allowed = new Set(
    (Array.isArray(allowedOrigins) ? allowedOrigins : [])
      .map(normalizeAllowedOrigin)
      .filter(Boolean)
  );
  return allowed.has(origin);
}

module.exports = {
  normalizeAllowedOrigin,
  networkOrigin,
  isNetworkUrlAllowed,
};
