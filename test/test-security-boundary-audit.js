'use strict';

const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');

const { EventBus } = require('../bus');
const { HumanGateBus } = require('../cuore/human-gate');
const { isNetworkUrlAllowed } = require('../lib/browser-network-scope');

const bus = new EventBus();
bus.emit({
  type: 'network_request',
  url: 'https://fixture.invalid/login',
  method: 'POST',
  headers: {
    Authorization: 'Bearer fixture-secret-token',
    Cookie: 'session=fixture-cookie',
    'X-API-Key': 'fixture-api-key',
    Accept: 'application/json',
  },
  payload: JSON.stringify({
    username: 'fixture-user',
    password: 'fixture-password',
    token: 'fixture-token',
  }),
  meta: {
    headerPreview: 'Bearer fixture-secret-token',
    safeField: 'ok',
  },
});

const event = bus.exportSession().events[0];
assert.equal(event.headers.Authorization, '[REDACTED]');
assert.equal(event.headers.Cookie, '[REDACTED]');
assert.equal(event.headers['X-API-Key'], '[REDACTED]');
assert.equal(event.headers.Accept, 'application/json');
const redactedPayload = JSON.parse(event.payload);
assert.equal(redactedPayload.password, '[REDACTED]');
assert.equal(redactedPayload.token, '[REDACTED]');
assert.equal(event.meta.headerPreview, '[REDACTED]');
assert.equal(event.meta.safeField, 'ok');
assert.doesNotMatch(JSON.stringify(event), /fixture-secret-token|fixture-cookie|fixture-api-key|fixture-password|fixture-token/);

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'boqa-human-gate-audit-'));
try {
  const gates = new HumanGateBus({ filePath: path.join(tmp, 'human-gates.jsonl') });
  const base = {
    operation_id: 'op_fixture',
    reason_code: 'SCOPE_AMBIGUOUS',
    human_question: 'Review controlled action?',
    evidence_refs: ['ev:fixture'],
    risk_class: 'A3',
    deadline: '2099-01-01T00:00:00.000Z',
    now: () => '2026-10-03T12:00:00.000Z',
  };
  const readGate = gates.request({ ...base, proposed_action: 'read_fixture' });
  const writeGate = gates.request({ ...base, proposed_action: 'write_fixture' });
  assert.notEqual(readGate.gate_id, writeGate.gate_id);
  assert.notEqual(readGate.resume_token, writeGate.resume_token);
  gates.resolve(readGate.gate_id, 'APPROVED', { now: () => '2026-10-03T12:01:00.000Z' });
  const queue = gates.readQueue();
  assert.equal(queue.find((g) => g.gate_id === readGate.gate_id).status, 'APPROVED');
  assert.equal(queue.find((g) => g.gate_id === writeGate.gate_id).status, 'PENDING');
} finally {
  fs.rmSync(tmp, { recursive: true, force: true });
}

assert.equal(isNetworkUrlAllowed('https://fixture.invalid/path', ['https://fixture.invalid']), true);
assert.equal(isNetworkUrlAllowed('wss://fixture.invalid/ws', ['https://fixture.invalid']), true);
assert.equal(isNetworkUrlAllowed('https://outside.invalid/path', ['https://fixture.invalid']), false);
assert.equal(isNetworkUrlAllowed('file:///etc/passwd', ['https://fixture.invalid']), false);

console.log('security boundary audit verifier: PASS');
