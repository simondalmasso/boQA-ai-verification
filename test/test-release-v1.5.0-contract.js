'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const oldPath = path.join(root, '.github', 'workflows', 'boqa-release-v1.4.0.yml');
const workflowPath = path.join(root, '.github', 'workflows', 'boqa-release-v1.5.0.yml');

assert.equal(fs.existsSync(oldPath), false, 'automatic v1.4.0 main-push release workflow must be retired');
assert.equal(fs.existsSync(workflowPath), true, 'v1.5.0 release workflow must exist');

const workflow = fs.readFileSync(workflowPath, 'utf8');
assert.match(workflow, /workflow_dispatch:/);
assert.doesNotMatch(workflow, /push:\s*[\s\S]*branches:\s*[\s\S]*main/, 'release mutation must not run on every main push');
assert.match(workflow, /expected_sha:/);
assert.match(workflow, /v1\.5\.0/);
assert.match(workflow, /permissions:\s*\n\s*contents:\s*read/);
assert.match(workflow, /publication:[\s\S]*permissions:[\s\S]*contents:\s*write/);
assert.match(workflow, /test "\$remote_main" = "\$EXPECTED_SHA"/);
assert.match(workflow, /test "\$remote_tag_sha" = "\$EXPECTED_SHA"/);
assert.doesNotMatch(workflow, /merge-base --is-ancestor/);
assert.match(workflow, /npm run check:publication/);
assert.match(workflow, /npm run demo:cuore/);
assert.match(workflow, /target_asset_network_requests=0/);
assert.match(workflow, /boqa-publication-integrity-v1\.yml/);
assert.match(workflow, /boqa-security-audit-v1\.yml/);
assert.match(workflow, /npm run check:security-audit/);

const securityWorkflowPath = path.join(root, '.github', 'workflows', 'boqa-security-audit-v1.yml');
assert.equal(fs.existsSync(securityWorkflowPath), true, 'dedicated security audit gate must exist');
const securityWorkflow = fs.readFileSync(securityWorkflowPath, 'utf8');
assert.match(securityWorkflow, /permissions:\s*\n\s*contents:\s*read/);
assert.match(securityWorkflow, /npm run check:security-audit/);
assert.match(securityWorkflow, /test\/test-security-boundary-audit\.js/);

const production = fs.readFileSync(path.join(root, '.github', 'workflows', 'boqa-production-deploy-v1.yml'), 'utf8');
assert.match(production, /versions deploy/);
assert.match(production, /PREVIEW_VERSION_ID/);
assert.match(production, /100%/);
assert.doesNotMatch(production, /wrangler@[^\s]+ deploy --config/);
assert.match(production, /deployed_version[\s\S]*PREVIEW_VERSION_ID/);
for (const surface of ['/health', '/api/health', '/api/hunter/status', '/og-boqa.png', '/favicon.svg']) {
  assert(production.includes(surface), 'missing production verification surface: ' + surface);
}
const productionLower = production.toLowerCase();
for (const header of ['Strict-Transport-Security', 'Content-Security-Policy', 'X-Frame-Options', 'Permissions-Policy']) {
  assert(productionLower.includes(header.toLowerCase()), 'missing production header verification: ' + header);
}
assert(production.includes('/api/private/billing'), 'hidden private surface must be verified');

console.log('v1.5.0 release contract: PASS');
