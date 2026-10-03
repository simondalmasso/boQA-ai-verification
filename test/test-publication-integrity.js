'use strict';

const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');

const projectRoot = path.join(__dirname, '..');
const checker = path.join(projectRoot, 'scripts', 'check-publication.js');

function write(root, rel, value) {
  const file = path.join(root, rel);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, value);
}

function fixture(overrides = {}) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'boqa-publication-'));
  const files = {
    'package.json': JSON.stringify({ name: 'boqa', version: '1.5.0' }),
    'package-lock.json': JSON.stringify({ name: 'boqa', version: '1.5.0', packages: { '': { name: 'boqa', version: '1.5.0' } } }),
    'dashboard/index.html': '<a href="https://github.com/simondalmasso/boqa/releases/tag/v1.5.0">v1.5.0</a> MODEL_OUTPUT != AUTHORIZATION Codex proposes. BOQA verifies.',
    'README.md': 'MODEL_OUTPUT != AUTHORIZATION\nCodex proposes.\nBOQA verifies.\nNo broad adoption claim.',
    'docs/openai-codex-oss/READINESS.md': 'LAST_CHECK=2026-10-03\nAPPLICATION_STATUS=READY\nRELEASE_TAG=v1.5.0 — canonical release line; a published tag is valid only when it equals exact canonical main.\n',
  };
  Object.assign(files, overrides);
  for (const [rel, value] of Object.entries(files)) write(root, rel, value);
  return root;
}

function check(root, env = {}) {
  return spawnSync(process.execPath, [checker, '--root', root], {
    cwd: projectRoot,
    encoding: 'utf8',
    env: { ...process.env, BOQA_READINESS_DATE: '2026-10-03', ...env },
  });
}

function expectFailure(overrides, label, env = {}) {
  const root = fixture(overrides);
  try {
    const result = check(root, env);
    assert.notEqual(result.status, 0, label + ' must fail');
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
}

assert(fs.existsSync(checker), 'publication checker must exist');

{
  const root = fixture();
  const result = check(root);
  fs.rmSync(root, { recursive: true, force: true });
  assert.equal(result.status, 0, result.stderr || result.stdout);
}

expectFailure({ 'package.json': JSON.stringify({ name: 'boqa', version: '1.4.0' }) }, 'stale package version');
expectFailure({ 'dashboard/index.html': '<a href="/releases/tag/v1.4.0">v1.4.0</a> MODEL_OUTPUT != AUTHORIZATION Codex proposes. BOQA verifies.' }, 'stale release link');
expectFailure({ 'docs/openai-codex-oss/READINESS.md': 'LAST_CHECK=2026-09-29\nAPPLICATION_STATUS=READY\nRELEASE_TAG=v1.5.0\n' }, 'stale readiness date');
expectFailure({ 'dashboard/index.html': '<a href="/releases/tag/v1.5.0">v1.5.0</a> Codex proposes. BOQA verifies.' }, 'missing invariant');
expectFailure({ 'README.md': 'MODEL_OUTPUT != AUTHORIZATION\nCodex proposes.\nBOQA verifies.\n10,000 users served.' }, 'unsupported adoption claim');

{
  const root = fixture();
  const result = check(root, {
    BOQA_CANONICAL_SHA: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
    BOQA_RELEASE_TAG_SHA: 'bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',
  });
  fs.rmSync(root, { recursive: true, force: true });
  assert.notEqual(result.status, 0, 'release tag SHA mismatch must fail');
}

const workflowPath = path.join(projectRoot, '.github', 'workflows', 'boqa-publication-integrity-v1.yml');
assert.equal(fs.existsSync(workflowPath), true, 'publication-integrity CI workflow must exist');
const workflow = fs.readFileSync(workflowPath, 'utf8');
assert.match(workflow, /pull_request:/);
assert.match(workflow, /contents:\s*read/);
assert.doesNotMatch(workflow, /contents:\s*write/);
assert.match(workflow, /npm ci/);
assert.match(workflow, /npm audit/);
assert.match(workflow, /npm run check:publication/);
assert.match(workflow, /npm run demo:cuore/);
assert.match(workflow, /target_asset_network_requests=0/);
assert.match(workflow, /findings\.json/);
assert.match(workflow, /confirmed_release_blockers/);
assert.match(workflow, /coverage-ledger\.json/);

console.log('publication integrity contract: PASS');
