#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const EXPECTED_VERSION = '1.5.1';
const EXPECTED_TAG = 'v1.5.1';

function argValue(name, fallback = null) {
  const at = process.argv.indexOf(name);
  return at >= 0 && process.argv[at + 1] ? process.argv[at + 1] : fallback;
}

const customRootProvided = process.argv.includes('--root');
const root = path.resolve(argValue('--root', process.cwd()));
const expectedReadinessDate = argValue(
  '--readiness-date',
  process.env.BOQA_READINESS_DATE || null
);

const failures = [];

function fail(code, detail) {
  failures.push({ code, detail });
}

function read(rel, required = true) {
  const file = path.join(root, rel);
  if (!fs.existsSync(file)) {
    if (required) fail('missing_file', rel);
    return '';
  }
  return fs.readFileSync(file, 'utf8');
}

function parseJson(rel) {
  const raw = read(rel);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch (error) {
    fail('invalid_json', rel + ': ' + error.message);
    return null;
  }
}

const pkg = parseJson('package.json');
const lock = parseJson('package-lock.json');
const landing = read('dashboard/index.html');
const readme = read('README.md');
const readiness = read('docs/openai-codex-oss/READINESS.md');

if (pkg && pkg.version !== EXPECTED_VERSION) {
  fail('package_version_mismatch', `package.json=${pkg.version || 'missing'} expected=${EXPECTED_VERSION}`);
}
if (lock) {
  if (lock.version !== EXPECTED_VERSION) {
    fail('lock_version_mismatch', `package-lock.json=${lock.version || 'missing'} expected=${EXPECTED_VERSION}`);
  }
  if (lock.packages && lock.packages[''] && lock.packages[''].version !== EXPECTED_VERSION) {
    fail('lock_root_version_mismatch', `package-lock root=${lock.packages[''].version || 'missing'} expected=${EXPECTED_VERSION}`);
  }
}

if (!landing.includes(`/releases/tag/${EXPECTED_TAG}`) || !landing.includes(EXPECTED_TAG)) {
  fail('stale_release_link', `landing must link and label ${EXPECTED_TAG}`);
}

for (const [label, text] of [
  ['landing', landing],
  ['README', readme],
]) {
  if (!text.includes('MODEL_OUTPUT != AUTHORIZATION')) {
    fail('missing_authority_invariant', label);
  }
  if (!text.includes('Codex proposes.') || !text.includes('BOQA verifies.')) {
    fail('missing_product_tagline', label);
  }
}

const readinessDateMatch = readiness.match(/^LAST_CHECK=(\d{4}-\d{2}-\d{2})$/m);
if (!readinessDateMatch) {
  fail('missing_readiness_date', 'LAST_CHECK');
} else {
  const observed = readinessDateMatch[1];
  const current = new Date().toISOString().slice(0, 10);
  if (Number.isNaN(Date.parse(observed)) || observed > current ||
      (expectedReadinessDate && observed !== expectedReadinessDate)) {
    fail('readiness_date_invalid', `actual=${observed} expected=${expectedReadinessDate || 'not-in-future'}`);
  }
}

if (!/^APPLICATION_STATUS=HOLD$/m.test(readiness)) {
  fail('premature_readiness_claim', 'APPLICATION_STATUS must remain HOLD until independent terminal seal');
}
if (!new RegExp(`^RELEASE_TAG=${EXPECTED_TAG}\\b`, 'm').test(readiness)) {
  fail('readiness_release_tag_mismatch', `RELEASE_TAG must be ${EXPECTED_TAG}`);
}

const currentReleaseSurfaces = [
  'dashboard/index.html',
  'dashboard/og-boqa-source.svg',
  '.env.example',
  'Dockerfile',
  'compose.yaml',
  'scripts/run-all-tests.js',
  'docs/openai-codex-oss/READINESS.md',
];
for (const rel of currentReleaseSurfaces) {
  const text = read(rel, false);
  if (text && /v1\.4\.0|v1\.5\.0|boqa:1\.4\.0|boqa:1\.5\.0/i.test(text)) {
    fail('stale_prior_release_current_surface', rel);
  }
}

const unsupportedClaimPatterns = [
  /\b\d[\d,._]*\s+users\s+(?:served|using|adopted)/i,
  /\b\d+(?:\.\d+)?%\s+uptime\b/i,
  /\b(?:thousands|millions)\s+of\s+users\b/i,
  /\b(?:industry-leading|best-in-class)\s+(?:accuracy|performance|detection)\b/i,
];
for (const [label, text] of [
  ['landing', landing],
  ['README', readme],
  ['READINESS', readiness],
]) {
  for (const pattern of unsupportedClaimPatterns) {
    if (pattern.test(text)) fail('unsupported_public_claim', label + ': ' + pattern.source);
  }
}

const canonicalSha = String(process.env.BOQA_CANONICAL_SHA || '').trim();
const releaseTagSha = String(process.env.BOQA_RELEASE_TAG_SHA || '').trim();
if (canonicalSha || releaseTagSha) {
  if (!canonicalSha || !releaseTagSha) {
    fail('release_sha_comparison_incomplete', 'both BOQA_CANONICAL_SHA and BOQA_RELEASE_TAG_SHA are required');
  } else if (canonicalSha !== releaseTagSha) {
    fail('release_tag_sha_mismatch', `canonical=${canonicalSha} tag=${releaseTagSha}`);
  }
}

if (!customRootProvided) {
  try {
    const { verifyAudit } = require('./check-security-audit-evidence');
    verifyAudit(root);
  } catch (error) {
    fail('security_audit_evidence_invalid', error.message);
  }
}

if (failures.length > 0) {
  console.error('PUBLICATION_INTEGRITY=FAIL');
  for (const item of failures) console.error(`${item.code}: ${item.detail}`);
  process.exit(1);
}

console.log('PUBLICATION_INTEGRITY=PASS');
console.log(`VERSION=${EXPECTED_VERSION}`);
console.log(`RELEASE_TAG=${EXPECTED_TAG}`);
console.log(`READINESS_DATE=${expectedReadinessDate}`);
