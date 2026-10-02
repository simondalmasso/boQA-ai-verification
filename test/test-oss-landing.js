'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const landing = fs.readFileSync(path.join(root, 'dashboard', 'index.html'), 'utf8');
const status = fs.readFileSync(path.join(root, 'dashboard', 'status', 'index.html'), 'utf8');
const css = fs.readFileSync(path.join(root, 'dashboard', 'landing.css'), 'utf8');
const smoke = fs.readFileSync(path.join(root, 'scripts', 'browser-smoke-v1.js'), 'utf8');
const favicon = fs.readFileSync(path.join(root, 'dashboard', 'favicon.svg'), 'utf8');
const og = fs.readFileSync(path.join(root, 'dashboard', 'og-boqa.png'));

assert.match(landing, /<html\s+lang=["']en["']/i);
assert.match(landing, /<title>BOQA — Verification infrastructure with bounded authority<\/title>/);
assert.match(landing, /name=["']description["'][^>]+content=["']BOQA is open-source software verification infrastructure with bounded authority, HumanGate, exact-head checks, and reproducible evidence\.["']/i);
assert.match(landing, /rel=["']icon["'][^>]+href=["']\/favicon\.svg["']/i);
assert.match(landing, /property=["']og:image["'][^>]+content=["']https:\/\/boqa\.simondalmasso44\.workers\.dev\/og-boqa\.png["']/i);
assert.match(landing, /property=["']og:image:width["'][^>]+content=["']1200["']/i);
assert.match(landing, /property=["']og:image:height["'][^>]+content=["']630["']/i);
assert.match(landing, /name=["']twitter:card["'][^>]+content=["']summary_large_image["']/i);

assert.match(landing, />BOQA<\/span>/);
assert.match(landing, /Verification infrastructure with bounded authority\./);
assert.match(landing, /Codex proposes\.\s*BOQA verifies\./);
assert.match(landing, /MODEL_OUTPUT\s*!=\s*AUTHORIZATION/);

for (const [label, href] of [
  ['View GitHub', 'https://github.com/simondalmasso/boqa'],
  ['Run safe demo', '#safe-demo'],
  ['System status', '/status/'],
  ['v1.4.0', 'https://github.com/simondalmasso/boqa/releases/tag/v1.4.0'],
]) {
  assert(landing.includes(`>${label}<`), 'missing visible link label: ' + label);
  assert(landing.includes(`href="${href}"`), 'missing href: ' + href);
}

const traceStart = landing.indexOf('class="verification-trace"');
const traceEnd = landing.indexOf('</aside>', traceStart);
assert(traceStart >= 0 && traceEnd > traceStart, 'verification trace must exist above the fold');
const trace = landing.slice(traceStart, traceEnd);
for (const label of ['MODEL', 'CUORE', 'POLICY', 'HUMANGATE', 'VERIFY', 'EVIDENCE']) {
  assert(trace.includes(label), 'missing trace stage: ' + label);
}
for (const evidence of ['v1.4.0', 'exact-head', 'Browser PASS', 'Docker PASS', 'target_asset_network_requests=0']) {
  assert(trace.includes(evidence), 'missing verified evidence: ' + evidence);
}

assert.match(landing, /npm ci/);
assert.match(landing, /npm run demo:cuore/);
assert.match(landing, /fixture-only/i);
assert.match(landing, /no external targets/i);
assert.match(landing, /target_asset_network_requests=0/);

for (const boundary of [
  'expand its own scope',
  'scan unauthorized targets',
  'treat model output as proof',
  'auto-submit sensitive findings',
  'sign or spend without explicit authority',
]) {
  assert(landing.toLowerCase().includes(boundary), 'missing safety boundary: ' + boundary);
}

for (const href of [
  'https://github.com/simondalmasso/boqa',
  'https://github.com/simondalmasso/boqa/blob/main/README.md',
  'https://github.com/simondalmasso/boqa/blob/main/SECURITY.md',
  'https://github.com/simondalmasso/boqa/blob/main/CONTRIBUTING.md',
  'https://github.com/simondalmasso/boqa/releases/tag/v1.4.0',
  '/status/',
]) {
  assert(landing.includes(`href="${href}"`), 'missing project link: ' + href);
}

assert.doesNotMatch(landing, /<script\b/i, 'landing must not require client JavaScript');
assert.doesNotMatch(landing, /bounty hunter|money-making|autonomous pentester|trading\/payment|users served|uptime percentage/i);
assert.match(landing, /href=["']\/landing\.css["']/);

assert.match(status, /id=["']overall-state["']/);
assert.match(status, /id=["']hunter-state["']/);
assert.match(status, /<script\s+src=["']\/dashboard-state\.js["']\s+defer><\/script>/);
assert.match(status, /<script\s+src=["']\/app\.js["']\s+defer><\/script>/);

assert.doesNotMatch(css, /@import|https?:\/\//i, 'landing must not load remote visual dependencies');
assert.match(css, /prefers-reduced-motion:\s*reduce/i);
assert.match(css, /:focus-visible/);
assert.match(css, /overflow-wrap:\s*anywhere|word-break:\s*break-word/i);
assert.match(css, /@media\s*\(max-width:\s*640px\)/i);
assert.match(css, /\.verification-trace/);

assert.match(favicon, /<svg[^>]+viewBox=["']0 0 32 32["']/);
assert.doesNotMatch(favicon, /(?:href|src)=["']https?:\/\//i, 'favicon must not load remote resources');

assert.equal(og[0], 0x89);
assert.equal(og.toString('ascii', 1, 4), 'PNG');
assert.equal(og.readUInt32BE(16), 1200, 'OG image width must be 1200');
assert.equal(og.readUInt32BE(20), 630, 'OG image height must be 630');

assert.match(smoke, /\['\/status',\s*'dashboard\/status\/index\.html'\]/);
assert.match(smoke, /\['\/status\/',\s*'dashboard\/status\/index\.html'\]/);
assert.match(smoke, /async function landingSmoke\(/);
assert.match(smoke, /async function statusSmoke\(/);

console.log('OSS landing polish contract: PASS');
