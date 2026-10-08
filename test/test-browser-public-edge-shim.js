'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.join(__dirname, '..');
const base = fs.readFileSync(path.join(root, 'scripts/browser-smoke-v1.js'), 'utf8');
const shim = fs.readFileSync(path.join(root, 'scripts/browser-smoke-public-edge-v2.js'), 'utf8');
assert(!base.includes('async function privateSmoke('), 'BASE_PRIVATE_SMOKE_SHOULD_BE_ABSENT');
assert(shim.includes("const mainAnchor = '\\nasync function main()';"), 'SHIM_MAIN_ANCHOR_MISSING');
assert(shim.includes('evidence.private = await privateSmoke(browser)'), 'CONCEALMENT_NOT_INJECTED');
assert(shim.includes('EXPECTED_CONCEALMENT_CONSOLE_EVENT_MISSING'), 'NEGATIVE_CONCEALMENT_ASSERT_REMOVED');
assert(!shim.includes('PRIVATE_SMOKE_BOUNDARY_NOT_FOUND'), 'OBSOLETE_BOUNDARY_PRESENT');
console.log('browser public edge shim contract: PASS');
