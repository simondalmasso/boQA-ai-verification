'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const root = path.join(__dirname, '..');
const manifestPath = path.join(root, 'evidence', 'security-audit-v1.5.0', 'audited-scope-git-blobs.json');
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

assert.equal(manifest.schema_version, 1);
assert.equal(manifest.identity, 'git-blob-oid');
assert.match(manifest.audited_source_ref, /^[0-9a-f]{40}$/);
assert(manifest.files && typeof manifest.files === 'object');

function blobOid(ref, rel) {
  return execFileSync('git', ['rev-parse', `${ref}:${rel}`], {
    cwd: root,
    encoding: 'utf8',
  }).trim();
}

for (const [rel, expected] of Object.entries(manifest.files)) {
  assert.match(expected, /^[0-9a-f]{40}$/, 'invalid blob oid: ' + rel);
  assert.equal(blobOid(manifest.audited_source_ref, rel), expected, 'audit manifest does not match audited source ref: ' + rel);
  assert.equal(blobOid('HEAD', rel), expected, 'audited scope changed without audit refresh: ' + rel);
}

console.log('security audit scope binding: PASS');
