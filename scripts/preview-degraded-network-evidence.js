'use strict';

const assert = require('node:assert/strict');
const BACKEND_PATHS = new Set(['/api/health', '/api/hunter/status']);

function verifyDegradedNetworkEvidence(result, backendStatus) {
  assert(Number.isInteger(backendStatus) && backendStatus >= 400,
    'DEGRADED_EXPECTED_HTTP_STATUS_INVALID');
  assert(Array.isArray(result.failed_requests) && Array.isArray(result.backend_responses),
    'DEGRADED_NETWORK_EVIDENCE_MISSING');

  const aborted = result.failed_requests.filter((item) =>
    BACKEND_PATHS.has(item.path) && /ERR_ABORTED/.test(item.error));
  result.failed_requests = result.failed_requests.filter((item) =>
    !(BACKEND_PATHS.has(item.path) && /ERR_ABORTED/.test(item.error)));
  const httpFailures = result.backend_responses.filter((item) =>
    BACKEND_PATHS.has(item.path) && item.status === backendStatus);
  const unexpectedBackend = result.backend_responses.filter((item) =>
    BACKEND_PATHS.has(item.path) && item.status !== backendStatus);

  assert.equal(unexpectedBackend.length, 0,
    'UNEXPECTED_DEGRADED_BACKEND_RESPONSE:' + JSON.stringify(unexpectedBackend));
  assert(aborted.length + httpFailures.length >= 1, 'DEGRADED_BACKEND_FAILURE_NOT_OBSERVED');
  result.expected_failed_requests = aborted;
  result.expected_backend_responses = httpFailures;
  return result;
}

module.exports = { verifyDegradedNetworkEvidence };
