'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const http = require('node:http');
const crypto = require('node:crypto');
const path = require('node:path');
const { check } = require('../scripts/check-origin-compose-isolation');

const root = path.join(__dirname, '..');
const compose = fs.readFileSync(path.join(root, 'compose.yaml'), 'utf8');
const serverSource = fs.readFileSync(path.join(root, 'server.js'), 'utf8');
const middlewareSource = fs.readFileSync(path.join(root, 'lib/middleware.js'), 'utf8');
const workflow = fs.readFileSync(path.join(root, '.github/workflows/boqa-real-docker-qualification-v1.yml'), 'utf8');
const inventory = JSON.parse(fs.readFileSync(path.join(root, 'api-route-inventory.json'), 'utf8'));
assert(inventory.routes.some(x => x.path === '/api/defensive/status' && x.scope === 'INTERNAL'));
assert(serverSource.includes("app.get('/api/defensive/status', requireStrongProxyAuth, rateLimiter"));
assert(!serverSource.includes("'/defensive/status', '/hunter/status'"));
assert(!/^\s*ports:\s*$/m.test(compose), 'no public Compose origin host ports');
assert.match(compose, /internal:\s*true/);
assert(workflow.includes('check-origin-compose-isolation.js'));
assert(workflow.includes('steps.origin_isolation.outcome'));
assert(!middlewareSource.includes('open for backward compatibility'));

const fixture = {
  services: { boqa: { networks: { private: null }, expose: ['7070'] } },
  networks: { private: { internal: true } },
};
assert.equal(check(fixture).status, 'PASS');
assert.throws(() => check({ ...fixture, services: { boqa: { ...fixture.services.boqa, ports: [{ published: '80', target: 7070 }] } } }), /HOST_PORT_PUBLISHED/);
assert.throws(() => check({ ...fixture, networks: { private: { internal: false } } }), /NETWORK_NOT_INTERNAL/);
assert.throws(() => check({ ...fixture, services: { boqa: { ...fixture.services.boqa, networks: { private: null, public: null } } } }), /SINGLE_PRIVATE_NETWORK/);

async function run() {
  const prior = Object.fromEntries(['BOQA_API_KEY','BOQA_HMAC_SECRET','BOQA_HMAC_LOG_FAILURES'].map(k=>[k,process.env[k]]));
  const { server } = require('../server');
  process.env.BOQA_HMAC_LOG_FAILURES = 'false';
  let started = false;
  try {
    const port = await new Promise((resolve, reject) => server.listen(0, '127.0.0.1', err => err ? reject(err) : resolve(server.address().port)));
    started = true;
    const send = (url, method = 'GET', headers = {}) => new Promise((resolve, reject) => {
      const req = http.request({ hostname: '127.0.0.1', port, path: url, method, headers, timeout: 5000 }, res => {
        let body = '';
        res.on('data', chunk => { body += chunk; });
        res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, body }));
      });
      req.on('error', reject);
      req.on('timeout', () => req.destroy(new Error('DIRECT_ORIGIN_FIXTURE_TIMEOUT')));
      req.end();
    });
    delete process.env.BOQA_API_KEY;
    delete process.env.BOQA_HMAC_SECRET;
    for (const url of ['/api/defensive/status','/api/private/human-gates']) {
      const response = await send(url);
      assert.equal(response.status, 503, url + ' must fail closed if secrets are missing');
      assert.equal(response.headers['cache-control'], 'no-store, max-age=0');
    }
    assert.equal((await send('/api/hunter/cycle','POST')).status, 503);
    process.env.BOQA_API_KEY = 'fixture-private-key';
    assert.equal((await send('/api/hunter/cycle','POST')).status, 503, 'HMAC missing with API key cannot permit manual control');
    delete process.env.BOQA_API_KEY;
    process.env.BOQA_HMAC_SECRET = 'fixture-hmac-secret';
    const ts = String(Math.floor(Date.now()/1000));
    const sig = (method,url) => crypto.createHmac('sha256', process.env.BOQA_HMAC_SECRET).update(method+url+ts).digest('hex');
    assert.equal((await send('/api/hunter/cycle','POST',{ 'X-BOQA-Ts':ts,'X-BOQA-Sig':sig('POST','/api/hunter/cycle') })).status,503,'valid HMAC cannot override missing API key');
    process.env.BOQA_API_KEY = 'fixture-private-key';
    assert.equal((await send('/api/defensive/status')).status,401,'internal route cannot be read anonymously');
    const headers={'X-BOQA-Ts':ts,'X-BOQA-Sig':sig('GET','/api/defensive/status')};
    assert.equal((await send('/api/defensive/status','GET',{...headers,'X-API-Key':'wrong'})).status,401);
    assert.equal((await send('/api/defensive/status','GET',{...headers,'X-BOQA-Sig':'invalid','X-API-Key':'fixture-private-key'})).status,401);
    const accepted = await send('/api/defensive/status','GET',{...headers,'X-API-Key':'fixture-private-key'});
    assert.equal(accepted.status,200,accepted.body);
    assert.equal(accepted.headers['cache-control'],'no-store');
    assert('state' in JSON.parse(accepted.body));
    console.log('DIRECT_ORIGIN_AUTH_BOUNDARY=PASS');
    console.log('DIRECT_ORIGIN_FIXTURE=LOOPBACK_EPHEMERAL_NO_EXTERNAL_HOST');
  } finally {
    if (started) await new Promise((resolve,reject) => server.close(err=>err?reject(err):resolve()));
    for (const [k,value] of Object.entries(prior)) { if (value===undefined) delete process.env[k]; else process.env[k]=value; }
  }
}
run().catch(e=>{console.error(e);process.exitCode=1;});
