'use strict';

const assert = require('node:assert/strict');
const { verifyDegradedNetworkEvidence } = require('../scripts/preview-degraded-network-evidence');

function evidence(responses, failures = []) {
  return { backend_responses: responses, failed_requests: failures };
}
// Red in the previous implementation: a completed HTTP 503 is not requestfailed.
let r = verifyDegradedNetworkEvidence(evidence([
  { path: '/api/health', status: 503 },
  { path: '/api/hunter/status', status: 503 },
]), 503);
assert.equal(r.expected_backend_responses.length, 2);
assert.equal(r.expected_failed_requests.length, 0);
r = verifyDegradedNetworkEvidence(evidence([], [
  { path: '/api/health', error: 'net::ERR_ABORTED' },
]), 503);
assert.equal(r.expected_failed_requests.length, 1);
assert.throws(() => verifyDegradedNetworkEvidence(evidence([]), 503),
  /DEGRADED_BACKEND_FAILURE_NOT_OBSERVED/);
assert.throws(() => verifyDegradedNetworkEvidence(evidence([
  { path: '/api/health', status: 200 }
]), 503), /UNEXPECTED_DEGRADED_BACKEND_RESPONSE/);
assert.throws(() => verifyDegradedNetworkEvidence(evidence([], [
  { path: '/api/health', error: 'net::ERR_CONNECTION_REFUSED' }
]), 503), /DEGRADED_BACKEND_FAILURE_NOT_OBSERVED/);
r = verifyDegradedNetworkEvidence(evidence([
  { path: '/api/hunter/status', status: 504 },
], [
  { path: '/other', error: 'net::ERR_CONNECTION_REFUSED' },
]), 504);
assert.equal(r.failed_requests.length, 1);
console.log('preview degraded network evidence: PASS');
