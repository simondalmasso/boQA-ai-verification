#!/usr/bin/env node
'use strict';
const assert = require('node:assert/strict');
function check(model) {
  assert(model && model.services && model.services.boqa, 'BOQA_ORIGIN_SERVICE_MISSING');
  const origin = model.services.boqa;
  assert(!origin.ports || origin.ports.length === 0, 'BOQA_ORIGIN_HOST_PORT_PUBLISHED');
  assert(!origin.network_mode, 'BOQA_ORIGIN_UNSCOPED_NETWORK_MODE');
  assert(Array.isArray(origin.expose) && origin.expose.some(x => String(x) === '7070'), 'BOQA_ORIGIN_INTERNAL_PORT_MISSING');
  const refs = origin.networks || {};
  const names = Array.isArray(refs) ? refs : Object.keys(refs);
  assert(names.length === 1, 'BOQA_ORIGIN_SINGLE_PRIVATE_NETWORK_REQUIRED');
  for (const name of names) {
    assert(model.networks?.[name]?.internal === true, 'BOQA_ORIGIN_NETWORK_NOT_INTERNAL');
  }
  return { status: 'PASS', published_ports: 0, internal_network_count: names.length };
}
if (require.main === module) {
  let content = '';
  process.stdin.setEncoding('utf8');
  process.stdin.on('data', chunk => { content += chunk; });
  process.stdin.on('end', () => {
    try {
      const result = check(JSON.parse(content));
      console.log('ORIGIN_ISOLATION=' + result.status);
      console.log('PUBLISHED_PORTS=' + result.published_ports);
    } catch (e) {
      console.error('ORIGIN_ISOLATION=FAIL:' + e.message);
      process.exitCode = 1;
    }
  });
}
module.exports = { check };
