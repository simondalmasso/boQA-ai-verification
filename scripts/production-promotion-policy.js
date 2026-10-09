'use strict';

// The production selector calls this validator before any Cloudflare API
// snapshot or mutation. Fixture tests exercise the exact same entrypoint.
const fs = require('node:fs');

function validatePromotion(candidate, evidence, expectedSha) {
  const errors = [];
  const requireField = (ok, label) => { if (!ok) errors.push(label); };
  requireField(typeof expectedSha === 'string' && /^[0-9a-f]{40}$/.test(expectedSha), 'EXPECTED_SHA_INVALID');
  requireField(candidate && candidate.head_sha === expectedSha, 'CANDIDATE_HEAD_MISMATCH');
  requireField(candidate && typeof candidate.version_id === 'string' &&
    /^[0-9a-fA-F-]{36}$/.test(candidate.version_id), 'PREVIEW_VERSION_ID_INVALID');
  requireField(candidate && typeof candidate.preview_url === 'string' &&
    /^https:\/\/[a-z0-9.-]+\.workers\.dev\/?$/i.test(candidate.preview_url), 'PREVIEW_URL_INVALID');
  requireField(candidate && candidate.production_changed === false && candidate.deploy_performed === false, 'PREVIEW_ALREADY_MUTATED');
  requireField(evidence && evidence.gate_status === 'PASS' &&
    evidence.static_publication_valid === true &&
    evidence.production_changed === false &&
    evidence.deploy_performed === false, 'PREVIEW_EVIDENCE_INVALID');
  const allowed =
    evidence && evidence.classification === 'PROMOTION_READY' &&
       evidence.runtime_operational === true &&
       evidence.production_promotion_allowed === true ||
    evidence && evidence.classification === 'STATIC_PUBLICATION_READY_RUNTIME_DEGRADED' &&
       evidence.runtime_operational === false &&
       evidence.production_promotion_allowed === true &&
       ['BACKEND_UNAVAILABLE', 'BACKEND_NOT_CONFIGURED'].includes(evidence.blocker);
  requireField(Boolean(allowed), 'PROMOTION_AUTHORITY_DENIED');
  return { allowed: errors.length === 0, errors };
}

if (require.main === module) {
  try {
    const [candidatePath, evidencePath, expectedSha] = process.argv.slice(2);
    if (!candidatePath || !evidencePath || !expectedSha) throw new Error('USAGE: candidate evidence expectedSha');
    const result = validatePromotion(JSON.parse(fs.readFileSync(candidatePath, 'utf8')),
      JSON.parse(fs.readFileSync(evidencePath, 'utf8')), expectedSha);
    if (!result.allowed) throw new Error(result.errors.join(','));
    process.stdout.write('PRODUCTION_PROMOTION_AUTHORIZED=YES\n');
  } catch (error) {
    console.error('PRODUCTION_PROMOTION_AUTHORIZED=NO:' + error.message);
    process.exitCode = 1;
  }
}

module.exports = { validatePromotion };
