'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const landing = fs.readFileSync(path.join(root, 'dashboard', 'index.html'), 'utf8');
const status = fs.readFileSync(path.join(root, 'dashboard', 'status', 'index.html'), 'utf8');
const css = fs.readFileSync(path.join(root, 'dashboard', 'landing.css'), 'utf8');
const smoke = fs.readFileSync(path.join(root, 'scripts', 'browser-smoke-v1.js'), 'utf8');

assert.match(landing, /<html\s+lang=["']en["']/i, 'OSS landing must use English for public OSS review');
assert.match(landing, /Open-source software verification infrastructure/i);
assert.match(landing, /bounded authority and reproducible evidence/i);
assert.match(landing, /Codex proposes\.\s*BOQA verifies\./i);
assert.match(landing, /MODEL_OUTPUT\s*!=\s*AUTHORIZATION/);

assert.match(landing, /href=["']https:\/\/github\.com\/simondalmasso\/boqa["']/);
assert.match(landing, /href=["']#safe-demo["']/);
assert.match(landing, /href=["']\/status\/["']/);

for (const phrase of [
  'Deterministic CUORE',
  'HumanGate',
  'Exact-head verification',
  'Reproducible evidence',
]) {
  assert(landing.includes(phrase), 'missing principle: ' + phrase);
}

const architecture = ['Codex / Model', 'CUORE', 'Policy + Scope', 'HumanGate', 'Execute', 'Verify', 'Evidence'];
let previous = -1;
for (const label of architecture) {
  const current = landing.indexOf(label);
  assert(current > previous, 'architecture order invalid at: ' + label);
  previous = current;
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
  'https://github.com/simondalmasso/boqa/blob/main/LICENSE',
  '/status/',
]) {
  assert(landing.includes(`href="${href}"`), 'missing footer/source link: ' + href);
}

assert.doesNotMatch(landing, /<script\b/i, 'landing must not require client JavaScript');
assert.doesNotMatch(landing, /bounty hunter|money-making|autonomous pentester|trading\/payment/i);
assert.match(landing, /href=["']\/landing\.css["']/);

assert.match(status, /id=["']overall-state["']/);
assert.match(status, /id=["']hunter-state["']/);
assert.match(status, /<script\s+src=["']\/dashboard-state\.js["']\s+defer><\/script>/);
assert.match(status, /<script\s+src=["']\/app\.js["']\s+defer><\/script>/);
assert.match(status, /<link\s+rel=["']stylesheet["']\s+href=["']\/style\.css["']>/);
assert.match(status, /<link\s+rel=["']stylesheet["']\s+href=["']\/mobile\.css["']>/);

assert.doesNotMatch(css, /@import|https?:\/\//i, 'landing must not load remote visual dependencies');
assert.match(css, /prefers-reduced-motion:\s*reduce/i);
assert.match(css, /:focus-visible/);
assert.match(css, /overflow-wrap:\s*anywhere|word-break:\s*break-word/i);
assert.match(css, /@media\s*\(max-width:\s*640px\)/i);

assert.match(smoke, /\['\/status',\s*'dashboard\/status\/index\.html'\]/);
assert.match(smoke, /\['\/status\/',\s*'dashboard\/status\/index\.html'\]/);
assert.match(smoke, /\['\/landing\.css',\s*'dashboard\/landing\.css'\]/);
assert.match(smoke, /async function landingSmoke\(/);
assert.match(smoke, /async function statusSmoke\(/);

console.log('OSS landing contract: PASS');
