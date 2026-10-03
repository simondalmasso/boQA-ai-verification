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

console.log('v1.5.0 release contract: PASS');
