'use strict';

const assert = require('assert');
const { EventBus } = require('../bus');

const bus = new EventBus({ maxLogSize: 10 });
bus.emit({
  type: 'network_response',
  url: 'https://fixture.invalid/token',
  payload: JSON.stringify({
    token: 'synthetic-generic-token',
    credential: 'synthetic-credential',
    nested: {
      client_secret: 'synthetic-client-secret',
      access_token: 'synthetic-access-token',
    },
  }),
  headers: {
    authorization: 'Bearer synthetic-header-token',
    'set-cookie': 'session=synthetic-cookie',
  },
  meta: {
    headerPreview: 'synthetic-preview',
  },
});

assert.equal(bus.eventLog.length, 1);
const serialized = JSON.stringify(bus.eventLog[0]);
for (const secret of [
  'synthetic-generic-token',
  'synthetic-credential',
  'synthetic-client-secret',
  'synthetic-access-token',
  'synthetic-header-token',
  'synthetic-cookie',
  'synthetic-preview',
]) {
  assert.equal(serialized.includes(secret), false, 'plaintext secret leaked: ' + secret);
}
assert.match(serialized, /\[REDACTED\]/);

console.log('event evidence redaction contract: PASS');
