'use strict';
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { execFileSync } = require('node:child_process');
const { verifyAudit, REQUIRED_FILES } = require('../scripts/check-security-audit-evidence');

const root = fs.mkdtempSync(path.join(os.tmpdir(), 'boqa-security-seal-'));
const dir = path.join(root, 'evidence', 'security-audit-v1.5.1');
const git = (...args) => execFileSync('git', args, { cwd: root, encoding: 'utf8' }).trim();
const put = (rel, data) => {
  const p = path.join(root, rel);
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, data);
};
const hash = data => crypto.createHash('sha256').update(data).digest('hex');
const json = (name, data) => put(path.join('evidence/security-audit-v1.5.1', name), JSON.stringify(data, null, 2));
try {
  git('init', '-q');
  for (const rel of REQUIRED_FILES) put(rel, 'audited fixture: ' + rel + '\n');
  git('add', '-A');
  git('-c', 'user.name=BOQA Fixture', '-c', 'user.email=fixture@example.invalid', 'commit', '-qm', 'fixture');
  const source = git('rev-parse', 'HEAD');
  const files = Object.fromEntries(REQUIRED_FILES.map(rel => [rel,
    hash(fs.readFileSync(path.join(root, rel)))]));
  const findings = { schema_version: 1, audited_source_ref: source, confirmed_release_blockers: 0,
    confirmed_count: 0, needs_validation_count: 0, rejected_count: 0, candidates: [] };
  const coverage = { schema_version: 1, audited_source_ref: source,
    independent_verifier: 'separate source/test gate', reviewed_surfaces: REQUIRED_FILES,
    coverage_limitations: ['external production not tested'] };
  const scope = { schema_version: 1, audited_source_ref: source, files };
  json('findings.json', findings);
  json('coverage-ledger.json', coverage);
  json('audited-scope-sha256.json', scope);
  put('evidence/security-audit-v1.5.1/REPORT.md', '# Audit\n' + source + '\nLIMITATIONS: no production validation\n');
  assert.equal(verifyAudit(root).scope.audited_source_ref, source, 'valid complete fixture');

  json('audited-scope-sha256.json', { ...scope, files: {} });
  assert.throws(() => verifyAudit(root), /AUDIT_SCOPE_INSUFFICIENT/, 'empty audit cannot pass');
  json('audited-scope-sha256.json', scope);

  json('coverage-ledger.json', { ...coverage, reviewed_surfaces: [REQUIRED_FILES[0]] });
  assert.throws(() => verifyAudit(root), /MANDATORY_SECURITY_SCOPE_MISSING/, 'partial coverage cannot pass');
  json('coverage-ledger.json', coverage);

  json('findings.json', { ...findings,
    candidates: [{ id: 'C1', classification: 'confirmed', independent_verifier: 'test gate' }] });
  assert.throws(() => verifyAudit(root), /AUDIT_COUNT_MISMATCH/, 'misreported confirmed finding cannot pass');
  json('findings.json', findings);

  put(REQUIRED_FILES[0], 'unaudited mutation\n');
  git('add', REQUIRED_FILES[0]);
  git('-c', 'user.name=BOQA Fixture', '-c', 'user.email=fixture@example.invalid', 'commit', '-qm', 'drift');
  assert.throws(() => verifyAudit(root), /AUDITED_SCOPE_CHANGED/, 'source drift cannot pass');

  console.log('security verifier negative fixtures: PASS');
} finally {
  fs.rmSync(root, { recursive: true, force: true });
}
