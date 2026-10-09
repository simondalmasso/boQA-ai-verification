'use strict';

const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { EventBus } = require('../bus');

async function run() {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'boqa-secret-redaction-'));
  const ndjson = path.join(tmp, 'events.ndjson');
  const bus = new EventBus({ ndjsonPath: ndjson });

  bus.emit({
    type: 'network_request',
    url: 'https://fixture.invalid/auth/login',
    method: 'POST',
    headers: {
      authorization: 'Bearer super-secret-token',
      cookie: 'sessionid=super-secret-cookie',
      'x-api-key': 'super-secret-api-key',
      'x-csrftoken': 'super-secret-csrf',
      accept: 'application/json',
    },
    payload: JSON.stringify({
      username: 'fixture-user',
      password: 'super-secret-password',
      access_token: 'super-secret-access',
    }),
    meta: {
      headerPreview: 'Bearer super-secret-token...',
      valuePrefix: 'super-secret-access',
      safe: 'kept',
    },
  });

  bus.emit({
    type: 'network_response',
    url: 'https://fixture.invalid/auth/login',
    status: 200,
    headers: {
      'set-cookie': 'sessionid=super-secret-set-cookie; HttpOnly; Secure',
      'content-type': 'application/json',
    },
    payload: 'refresh_token=super-secret-refresh&safe=kept',
  });

  await bus.flush();

  const inMemory = JSON.stringify(bus.eventLog);
  const persisted = fs.readFileSync(ndjson, 'utf8');
  const combined = inMemory + persisted;

  for (const secret of [
    'super-secret-token',
    'super-secret-cookie',
    'super-secret-api-key',
    'super-secret-csrf',
    'super-secret-password',
    'super-secret-access',
    'super-secret-set-cookie',
    'super-secret-refresh',
  ]) {
    assert(!combined.includes(secret), 'evidence must not retain raw secret: ' + secret);
  }

  assert(combined.includes('[REDACTED]'), 'evidence should show deterministic redaction markers');
  assert(combined.includes('application/json'), 'non-sensitive headers must remain useful');
  assert(combined.includes('fixture-user'), 'non-sensitive structured payload fields should remain useful');
  assert(combined.includes('safe'), 'non-sensitive metadata must remain useful');

  fs.rmSync(tmp, { recursive: true, force: true });
  console.log('evidence secret redaction: PASS');
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
