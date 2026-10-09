'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const mustNotExist = [
  'dashboard/cobros.html',
  'dashboard/cobros.js',
  'dashboard/private.css',
  'lib/billing-auth.js',
];
for (const rel of mustNotExist) {
  assert.equal(fs.existsSync(path.join(root, rel)), false, rel + ' must be removed');
}

const server = fs.readFileSync(path.join(root, 'server.js'), 'utf8');
const worker = fs.readFileSync(path.join(root, 'worker.js'), 'utf8');
const compose = fs.readFileSync(path.join(root, 'compose.yaml'), 'utf8');
const env = fs.readFileSync(path.join(root, '.env.example'), 'utf8');
const browser = fs.readFileSync(path.join(root, 'scripts', 'browser-smoke-v1.js'), 'utf8');
const style = fs.readFileSync(path.join(root, 'dashboard', 'style.css'), 'utf8');
const inventory = JSON.parse(fs.readFileSync(path.join(root, 'api-route-inventory.json'), 'utf8'));

for (const source of [server, compose, env, browser]) {
  assert.doesNotMatch(source, /BOQA_BILLING_PIN|billing-auth|boqa_billing_session/i);
}
assert.doesNotMatch(server, /WebSocketServer|\/ws|wsServer/);
assert.doesNotMatch(worker, /websocket_not_supported_via_worker|pathname === '\/ws'/);
assert.match(style, /\[hidden\]\s*\{[^}]*display\s*:\s*none\s*!important/i);

const routes = new Set((inventory.routes || []).map((r) => r.method + ' ' + r.path + ' ' + r.scope));
assert(routes.has('GET /health PUBLIC_READ'));
assert(routes.has('GET /api/health PUBLIC_READ'));
assert(routes.has('GET /api/hunter/status PUBLIC_READ'));
assert(routes.has('GET /api/private/human-gates MANUAL_CONTROL'));
assert(![...routes].some((v) => /billing|cobros/.test(v) && !v.endsWith(' REMOVED')));

for (const legacy of [
  'GET /cobros REMOVED',
  'GET /cobros.html REMOVED',
  'GET /cobros.js REMOVED',
  'GET /private.css REMOVED',
  'POST /api/private/billing/auth REMOVED',
  'GET /api/private/billing/session REMOVED',
  'GET /api/private/billing/data REMOVED',
  'POST /api/private/billing/logout REMOVED',
  'WS /ws REMOVED',
]) {
  assert(routes.has(legacy), 'missing removed legacy inventory entry: ' + legacy);
}

console.log('v1.5.1 removed-surface/UI/route contract: PASS');
