'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const helperPath = path.join(root, 'lib', 'browser-network-scope.js');
assert.equal(fs.existsSync(helperPath), true, 'browser network-scope helper must exist');

const { isNetworkUrlAllowed } = require(helperPath);
const allowed = ['https://owned.invalid', 'http://127.0.0.1:43117'];

assert.equal(isNetworkUrlAllowed('https://owned.invalid/path', allowed), true);
assert.equal(isNetworkUrlAllowed('https://outside.invalid/path', allowed), false);
assert.equal(isNetworkUrlAllowed('http://127.0.0.1:43117/api', allowed), true);
assert.equal(isNetworkUrlAllowed('http://127.0.0.1:43118/api', allowed), false);
assert.equal(isNetworkUrlAllowed('wss://owned.invalid/socket', allowed), true);
assert.equal(isNetworkUrlAllowed('ws://127.0.0.1:43117/socket', allowed), true);
assert.equal(isNetworkUrlAllowed('wss://outside.invalid/socket', allowed), false);
assert.equal(isNetworkUrlAllowed('data:text/plain,ok', allowed), true);
assert.equal(isNetworkUrlAllowed('about:blank', allowed), true);
assert.equal(isNetworkUrlAllowed('file:///etc/passwd', allowed), false);

const runner = fs.readFileSync(path.join(root, 'agent', 'playwright-runner.js'), 'utf8');
assert.match(runner, /serviceWorkers:\s*'block'/);
assert.match(runner, /context\.route\(['"]\*\*\/\*['"]/);
assert.match(runner, /routeWebSocket/);
assert.match(runner, /BROWSER_NETWORK_SCOPE_BLOCKED/);

console.log('browser network scope contract: PASS');
