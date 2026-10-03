#!/usr/bin/env node
'use strict';

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

function verifyAudit(rootDir) {
  const root = path.resolve(rootDir);
  const auditDir = path.join(root, 'evidence', 'security-audit-v1.5.0');

  function readJson(name) {
    const file = path.join(auditDir, name);
    if (!fs.existsSync(file)) throw new Error('AUDIT_FILE_MISSING:' + name);
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  }

  function gitBlob(ref, rel) {
    try {
      return execFileSync('git', ['show', `${ref}:${rel}`], {
        cwd: root,
        encoding: null,
        maxBuffer: 32 * 1024 * 1024,
        stdio: ['ignore', 'pipe', 'pipe'],
      });
    } catch (_) {
      throw new Error(`AUDITED_GIT_BLOB_MISSING:${ref}:${rel}`);
    }
  }

  function sha256(buffer) {
    return crypto.createHash('sha256').update(buffer).digest('hex');
  }

  const findings = readJson('findings.json');
  const coverage = readJson('coverage-ledger.json');
  const scope = readJson('audited-scope-sha256.json');

  if (findings.schema_version !== 1) throw new Error('AUDIT_FINDINGS_SCHEMA');
  if (coverage.schema_version !== 1) throw new Error('AUDIT_COVERAGE_SCHEMA');
  if (scope.schema_version !== 1) throw new Error('AUDIT_SCOPE_SCHEMA');
  if (findings.confirmed_release_blockers !== 0) throw new Error('CONFIRMED_SECURITY_RELEASE_BLOCKER');
  if (findings.confirmed_count !== 0) throw new Error('CONFIRMED_SECURITY_FINDING');
  if (!Array.isArray(findings.candidates)) throw new Error('AUDIT_CANDIDATES_MISSING');
  if (!Array.isArray(coverage.coverage_limitations)) throw new Error('AUDIT_LIMITATIONS_MISSING');
  if (findings.audited_source_ref !== coverage.audited_source_ref || findings.audited_source_ref !== scope.audited_source_ref) {
    throw new Error('AUDIT_SOURCE_REF_MISMATCH');
  }

  for (const candidate of findings.candidates) {
    if (!['confirmed', 'needs_validation', 'rejected'].includes(candidate.classification)) {
      throw new Error('AUDIT_CLASSIFICATION_INVALID:' + candidate.id);
    }
    if (typeof candidate.independent_verifier !== 'string' || !candidate.independent_verifier.trim()) {
      throw new Error('AUDIT_VERIFIER_MISSING:' + candidate.id);
    }
  }

  for (const [rel, expected] of Object.entries(scope.files || {})) {
    const auditHash = sha256(gitBlob(scope.audited_source_ref, rel));
    const headHash = sha256(gitBlob('HEAD', rel));
    if (auditHash !== expected) throw new Error('AUDIT_MANIFEST_SOURCE_MISMATCH:' + rel);
    if (headHash !== expected) throw new Error('AUDITED_SCOPE_CHANGED:' + rel);
  }

  console.log('SECURITY_AUDIT=NO_CONFIRMED_RELEASE_BLOCKER');
  console.log('CONFIRMED=0');
  console.log('NEEDS_VALIDATION=' + findings.needs_validation_count);
  console.log('AUDITED_SOURCE_REF=' + findings.audited_source_ref);
  return { findings, coverage, scope };
}

if (require.main === module) {
  verifyAudit(path.resolve(__dirname, '..'));
}

module.exports = { verifyAudit };
