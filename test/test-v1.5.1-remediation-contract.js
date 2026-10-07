'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const previewSmoke = fs.readFileSync(path.join(root, 'scripts', 'cloudflare-preview-smoke-v6.js'), 'utf8');
const previewWorkflow = fs.readFileSync(path.join(root, '.github', 'workflows', 'boqa-cloudflare-preview-v6.yml'), 'utf8');
const production = fs.readFileSync(path.join(root, '.github', 'workflows', 'boqa-production-deploy-v1.yml'), 'utf8');
const wrangler = fs.readFileSync(path.join(root, 'wrangler.toml'), 'utf8');
const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
const lock = JSON.parse(fs.readFileSync(path.join(root, 'package-lock.json'), 'utf8'));

assert.match(previewSmoke, /static_publication_valid/);
assert.match(previewSmoke, /runtime_operational/);
assert.match(previewSmoke, /production_promotion_allowed/);
assert.match(previewSmoke, /STATIC_PUBLICATION_READY_RUNTIME_DEGRADED/);
assert.match(previewWorkflow, /production_promotion_allowed/);
assert.match(previewWorkflow, /static_publication_valid/);
assert.match(production, /\.production_promotion_allowed == true/);
assert.match(production, /\.static_publication_valid == true/);
assert.doesNotMatch(production, /\.promotion_ready == true/);

const backend = wrangler.match(/^BOQA_BACKEND_URL\s*=\s*"([^"]*)"$/m);
assert(backend, 'wrangler must declare BOQA_BACKEND_URL explicitly');
assert(
  backend[1] === '' || /^https:\/\//i.test(backend[1]),
  'production backend URL must be empty/fail-closed or verified HTTPS, never public plaintext HTTP'
);

assert.equal(pkg.overrides?.['proxy-addr'], '2.0.8', 'proxy-addr advisory must be pinned to fixed version');
assert.equal(lock.packages?.['node_modules/proxy-addr']?.version, '2.0.8', 'lockfile must resolve proxy-addr 2.0.8');

console.log('v1.5.1 promotion/transport/advisory contract: PASS');
