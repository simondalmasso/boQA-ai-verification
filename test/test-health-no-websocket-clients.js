'use strict';

const assert = require('node:assert/strict');
const { EventBus } = require('../bus');
const { createHealthHandler } = require('../lib/health');

const bus = new EventBus();
assert.equal('clients' in bus, false, 'WebSocket client registry must remain removed');
const ctx = {
  agent: null,
  agentInitError: 'browser_executor_requires_explicit_scope',
  hunterRuntime: {
    internalStatus: () => ({ state: 'ACTIVE', reason: 'recent_cycle_verified',
      scheduler_status: 'ACTIVE' }),
  },
  bus,
  serverStartTime: Date.now() - 100,
  defensiveValidation: {},
};
const response = {
  statusCode: 0,
  payload: null,
  set() { return this; },
  status(code) { this.statusCode = code; return this; },
  json(obj) { this.payload = obj; return this; },
};
createHealthHandler(ctx)({}, response);
assert.equal(response.statusCode, 200);
assert.equal(response.payload.status, 'ok');
assert.equal(response.payload.hunter.state, 'ACTIVE');
assert.equal(response.payload.bus_clients, 0);
assert.equal(response.payload.bus_events, 0);
console.log('health without WebSocket clients: PASS');
