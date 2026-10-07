'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const oldWorkflow = path.join(root, '.github', 'workflows', 'boqa-release-v1.5.0.yml');
const workflowPath = path.join(root, '.github', 'workflows', 'boqa-release-v1.5.1.yml');

assert.equal(fs.existsSync(oldWorkflow), false, 'v1.5.0 publication workflow must be retired');
assert.equal(fs.existsSync(workflowPath), true, 'v1.5.1 release workflow must exist');

const workflow = fs.readFileSync(workflowPath, 'utf8');
assert.match(workflow, /workflow_dispatch:/);
assert.doesNotMatch(workflow, /push:\s*[\s\S]*branches:\s*[\s\S]*main/);
assert.match(workflow, /expected_sha:/);
assert.match(workflow, /v1\.5\.1/);
assert.doesNotMatch(workflow, /immutable/i, 'release workflow must not claim immutability without repository enforcement');
assert.match(workflow, /permissions:\s*\n\s*contents:\s*read/);
assert.match(workflow, /publication:[\s\S]*permissions:[\s\S]*contents:\s*write/);
assert.match(workflow, /test "\$remote_main" = "\$EXPECTED_SHA"/);
assert.match(workflow, /test "\$remote_tag_sha" = "\$EXPECTED_SHA"/);
assert.doesNotMatch(workflow, /merge-base --is-ancestor/);
assert.match(workflow, /npm audit --audit-level=low/);
assert.match(workflow, /npm run check:publication/);
assert.match(workflow, /npm run check:security-audit/);
assert.match(workflow, /npm run demo:cuore/);
assert.match(workflow, /boqa-browser-smoke-v1\.yml/);
assert.match(workflow, /boqa-real-docker-qualification-v1\.yml/);
assert.match(workflow, /boqa-cloudflare-preview-v6\.yml/);
assert.match(workflow, /boqa-publication-integrity-v1\.yml/);
assert.match(workflow, /boqa-security-audit-v1\.yml/);
assert.match(workflow, /boqa-production-deploy-v1\.yml/);
assert.match(workflow, /gh release upload v1\.5\.1/);
assert.match(workflow, /boqa-v1\.5\.1-evidence\.json/);
for (const field of [
  'contract_version',
  'timestamp',
  'canonical_main_sha',
  'release_tag_sha',
  'production_source_sha',
  'production_worker_version_id',
  'source_preview_run_id',
  'production_run_id',
  'preview_evidence_sha256',
  'production_evidence_sha256',
  'runtime_state_classification',
]) {
  assert(workflow.includes(field), 'durable release evidence missing field: ' + field);
}

const production = fs.readFileSync(path.join(root, '.github', 'workflows', 'boqa-production-deploy-v1.yml'), 'utf8');
assert.match(production, /\.production_promotion_allowed == true/);
assert.match(production, /\.static_publication_valid == true/);
assert.match(production, /grep -F 'v1\.5\.1'/);

console.log('v1.5.1 release contract: PASS');
