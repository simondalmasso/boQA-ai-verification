#!/usr/bin/env node
'use strict';
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');

// Must be independently reviewed: exact files needed to bind the security
// findings to promotion, trust boundaries, release and executable validators.
const REQUIRED_FILES = [
  'worker.js', 'server.js', 'lib/middleware.js', 'compose.yaml',
  'Dockerfile', 'wrangler.toml', 'package-lock.json', 'api-route-inventory.json',
  '.github/workflows/boqa-real-docker-qualification-v1.yml',
  'scripts/check-origin-compose-isolation.js', 'test/test-origin-direct-auth-boundary.js',
  'scripts/check-security-audit-evidence.js', 'scripts/check-publication.js',
  'scripts/production-promotion-policy.js', 'scripts/cloudflare-preview-smoke-v6.js',
  '.github/workflows/boqa-cloudflare-preview-v6.yml',
  '.github/workflows/boqa-production-deploy-v1.yml',
  '.github/workflows/boqa-release-v1.5.1.yml',
  '.github/workflows/boqa-security-audit-v1.yml',
  '.github/workflows/boqa-publication-integrity-v1.yml'
];

function verifyAudit(rootDir) {
  const root = path.resolve(rootDir);
  const dir = path.join(root, 'evidence', 'security-audit-v1.5.1');
  const read = name => JSON.parse(fs.readFileSync(path.join(dir, name), 'utf8'));
  const hash = buf => crypto.createHash('sha256').update(buf).digest('hex');
  const blob = (ref, rel) => {
    try {
      return execFileSync('git', ['show', `${ref}:${rel}`], {
        cwd: root, encoding: null, maxBuffer: 32 * 1024 * 1024,
        stdio: ['ignore', 'pipe', 'pipe']
      });
    } catch (_) {
      throw new Error('AUDITED_GIT_BLOB_MISSING:' + ref + ':' + rel);
    }
  };
  const findings = read('findings.json');
  const coverage = read('coverage-ledger.json');
  const scope = read('audited-scope-sha256.json');
  if (![findings, coverage, scope].every(x => x && x.schema_version === 1)) {
    throw new Error('AUDIT_SCHEMA_INVALID');
  }
  if (!/^[0-9a-f]{40}$/.test(scope.audited_source_ref) ||
      findings.audited_source_ref !== scope.audited_source_ref ||
      coverage.audited_source_ref !== scope.audited_source_ref) {
    throw new Error('AUDIT_SOURCE_REF_MISMATCH');
  }
  if (!Array.isArray(findings.candidates) ||
      !Array.isArray(coverage.reviewed_surfaces) ||
      coverage.reviewed_surfaces.length === 0 ||
      !Array.isArray(coverage.coverage_limitations) ||
      !coverage.independent_verifier ||
      typeof coverage.independent_verifier !== 'string') {
    throw new Error('AUDIT_COVERAGE_OR_VERIFIER_MISSING');
  }
  for (const candidate of findings.candidates) {
    if (!candidate || !candidate.id ||
        !['confirmed', 'needs_validation', 'rejected'].includes(candidate.classification) ||
        typeof candidate.independent_verifier !== 'string' ||
        candidate.independent_verifier.trim().length === 0) {
      throw new Error('AUDIT_CANDIDATE_INVALID');
    }
  }
  for (const [classification, field] of [
    ['confirmed', 'confirmed_count'],
    ['needs_validation', 'needs_validation_count'],
    ['rejected', 'rejected_count']
  ]) {
    const count = findings.candidates.filter(c => c.classification === classification).length;
    if (findings[field] !== count) throw new Error('AUDIT_COUNT_MISMATCH:' + field);
  }
  if (findings.confirmed_release_blockers !== 0 || findings.confirmed_count !== 0) {
    throw new Error('CONFIRMED_SECURITY_RELEASE_BLOCKER');
  }
  if (!scope.files || typeof scope.files !== 'object' ||
      Array.isArray(scope.files) || Object.keys(scope.files).length < REQUIRED_FILES.length) {
    throw new Error('AUDIT_SCOPE_INSUFFICIENT');
  }
  for (const rel of REQUIRED_FILES) {
    if (!(rel in scope.files) || !coverage.reviewed_surfaces.includes(rel)) {
      throw new Error('MANDATORY_SECURITY_SCOPE_MISSING:' + rel);
    }
  }
  for (const [rel, expected] of Object.entries(scope.files)) {
    if (!/^[a-f0-9]{64}$/.test(expected)) throw new Error('AUDIT_MANIFEST_HASH_INVALID:' + rel);
    const recorded = hash(blob(scope.audited_source_ref, rel));
    const actual = hash(blob('HEAD', rel));
    if (recorded !== expected) throw new Error('AUDIT_MANIFEST_SOURCE_MISMATCH:' + rel);
    if (actual !== expected) throw new Error('AUDITED_SCOPE_CHANGED:' + rel);
  }
  const report = fs.readFileSync(path.join(dir, 'REPORT.md'), 'utf8');
  if (!report.includes(scope.audited_source_ref) || !report.includes('LIMITATIONS')) {
    throw new Error('AUDIT_REPORT_INCOMPLETE');
  }
  console.log('SECURITY_AUDIT=NO_CONFIRMED_RELEASE_BLOCKER');
  console.log('CONFIRMED=0');
  console.log('NEEDS_VALIDATION=' + findings.needs_validation_count);
  console.log('AUDITED_SOURCE_REF=' + scope.audited_source_ref);
  return { findings, coverage, scope };
}
if (require.main === module) verifyAudit(path.resolve(__dirname, '..'));
module.exports = { verifyAudit, REQUIRED_FILES };
