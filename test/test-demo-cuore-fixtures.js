'use strict';

const assert = require('assert');
const path = require('path');
const { spawnSync } = require('child_process');

const projectRoot = path.resolve(__dirname, '..');
const demo = spawnSync('node', ['scripts/demo-cuore-fixtures.js'], {
  cwd: projectRoot,
  encoding: 'utf8',
  timeout: 30000,
});

assert.equal(demo.status, 0, demo.stderr || demo.stdout);
const result = JSON.parse(demo.stdout);

assert.equal(result.mode, 'FIXTURE_ONLY');
assert.equal(result.authority, 'CUORE_DETERMINISTIC');
assert.equal(result.model_authority, false);
assert(result.raw_opportunities > 0);
assert(result.unique_opportunities > 0);
assert(result.decisions.length > 0);
assert.equal(result.target_asset_network_requests, 0);

const allowed = new Set(['WATCH', 'RESEARCH', 'SKIP', 'HUMAN_AUTHORIZE']);
for (const decision of result.decisions) {
  assert(allowed.has(decision.decision));
  assert.equal(decision.target_asset_network_requests, 0);
}

console.log('CUORE fixture-only demo contract: PASS');
