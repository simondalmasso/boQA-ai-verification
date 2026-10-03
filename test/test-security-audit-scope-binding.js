'use strict';

const assert = require('assert');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const manifestPath = path.join(root, 'evidence', 'security-audit-v1.5.0', 'audited-scope-sha256.json');
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

assert.equal(manifest.schema_version, 1);
assert.match(manifest.audited_source_ref, /^[0-9a-f]{40}$/);
assert(manifest.files && typeof manifest.files === 'object');

for (const [rel, expected] of Object.entries(manifest.files)) {
  const file = path.join(root, rel);
  assert(fs.existsSync(file), 'audited file missing: ' + rel);
  const actual = crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
  assert.equal(actual, expected, 'audited scope changed without audit refresh: ' + rel);
}

console.log('security audit scope binding: PASS');
