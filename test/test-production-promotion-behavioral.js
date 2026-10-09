'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const { validatePromotion } = require('../scripts/production-promotion-policy');

const sha = 'a'.repeat(40);
const candidate = { head_sha: sha, version_id: '11111111-2222-4333-8444-555555555555',
  preview_url: 'https://boqa-preview.workers.dev', production_changed: false, deploy_performed: false };
const basis = { gate_status: 'PASS', static_publication_valid: true,
  production_changed: false, deploy_performed: false };
const degraded = { ...basis, classification: 'STATIC_PUBLICATION_READY_RUNTIME_DEGRADED',
  runtime_operational: false, production_promotion_allowed: true, blocker: 'BACKEND_UNAVAILABLE' };
const missing = { ...basis, classification: 'BLOCKED_BACKEND_CONTRACT',
  runtime_operational: false, production_promotion_allowed: false, blocker: 'BACKEND_HUNTER_CONTRACT_MISSING' };
const ready = { ...basis, classification: 'PROMOTION_READY', runtime_operational: true,
  production_promotion_allowed: true };

assert.equal(validatePromotion(candidate, degraded, sha).allowed, true);
assert.equal(validatePromotion(candidate, { ...degraded, blocker: 'BACKEND_NOT_CONFIGURED' }, sha).allowed, true);
assert.equal(validatePromotion(candidate, ready, sha).allowed, true);
assert.equal(validatePromotion(candidate, missing, sha).allowed, false);
assert.equal(validatePromotion(candidate, { ...missing, production_promotion_allowed: true }, sha).allowed, false);
assert.equal(validatePromotion(candidate, { ...degraded, gate_status: 'FAIL' }, sha).allowed, false);
assert.equal(validatePromotion({ ...candidate, head_sha: 'b'.repeat(40) }, ready, sha).allowed, false);
assert.equal(validatePromotion({ ...candidate, production_changed: true }, ready, sha).allowed, false);

const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'boqa-promotion-'));
try {
  const cp = path.join(dir, 'candidate.json'), ep = path.join(dir, 'evidence.json');
  fs.writeFileSync(cp, JSON.stringify(candidate));
  for (const [scenario, evidence, allowed] of [
    ['blocked-contract', missing, false],
    ['degraded-static', degraded, true],
    ['healthy', ready, true]
  ]) {
    fs.writeFileSync(ep, JSON.stringify(evidence));
    const result = spawnSync(process.execPath,
      [path.join(__dirname, '../scripts/production-promotion-policy.js'), cp, ep, sha],
      { encoding: 'utf8' });
    assert.equal(result.status === 0, allowed, scenario + ': ' + result.stderr);
  }
} finally {
  fs.rmSync(dir, { recursive: true, force: true });
}

const workflow = fs.readFileSync(path.join(__dirname, '../.github/workflows/boqa-production-deploy-v1.yml'), 'utf8');
const gate = workflow.indexOf('node scripts/production-promotion-policy.js');
const snapshot = workflow.indexOf('name: Snapshot deployment before');
const deployment = workflow.indexOf('wrangler@');
assert(gate > 0 && gate < snapshot && snapshot < deployment,
  'behavioral selector must execute before snapshot and deploy');
console.log('production promotion behavioral fixtures: PASS');
