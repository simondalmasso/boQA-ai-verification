'use strict';

const assert = require('assert');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const root = path.join(__dirname, '..');
const manifestPath = path.join(root, 'evidence', 'security-audit-v1.5.0', 'audited-scope-sha256.json');
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

assert.equal(manifest.schema_version, 1);
assert.match(manifest.audited_source_ref, /^[0-9a-f]{40}$/);
assert(manifest.files && typeof manifest.files === 'object');

function gitBlob(ref, rel) {
  return execFileSync('git', ['show', `${ref}:${rel}`], {
    cwd: root,
    encoding: null,
    maxBuffer: 32 * 1024 * 1024,
  });
}

function sha256(buffer) {
  return crypto.createHash('sha256').update(buffer).digest('hex');
}

for (const [rel, expected] of Object.entries(manifest.files)) {
  const atAuditRef = sha256(gitBlob(manifest.audited_source_ref, rel));
  const atHead = sha256(gitBlob('HEAD', rel));
  assert.equal(atAuditRef, expected, 'audit manifest does not match audited source ref: ' + rel);
  assert.equal(atHead, expected, 'audited scope changed without audit refresh: ' + rel);
}

console.log('security audit scope binding: PASS');
