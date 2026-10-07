'use strict';

const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { DefensiveValidationService } = require('../lib/defensive-validation');

async function run() {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'boqa-defensive-'));
  try {
    const allowlist = path.join(tmp, 'assets.json');
    fs.writeFileSync(allowlist, JSON.stringify({
      validation_mode: 'DEFENSIVE_VALIDATION',
      assets: [{
        id: 'lab',
        type: 'fixture_local',
        ownership_status: 'verified',
        authorization_status: 'verified',
        scope_status: 'in_scope',
        environment_type: 'owned_or_lab',
        validation_mode: 'non_destructive',
        checks: ['availability', 'schema'],
      }],
    }));
    const engine = new DefensiveValidationService({
      allowlistPath: allowlist,
      statePath: path.join(tmp, 'state.json'),
      intervalMs: 999999,
    });
    const status = await engine.runCycle();
    assert.equal(status.scheduler_status, 'ACTIVE');
    assert.equal(status.controls_completed, 2);
    assert.equal(status.activity[0].asset, 'Laboratorio controlado');
    assert.equal(status.evidence[0].integrity, 'valid');
    assert.equal(engine.authorize({ type: 'owned_service' }).allowed, false);
    assert.equal(engine.authorize({
      type: 'owned_service',
      ownership_status: 'verified',
      authorization_status: 'verified',
      scope_status: 'in_scope',
      environment_type: 'owned_or_lab',
      validation_mode: 'non_destructive',
      authorization_evidence: 'doc',
    }).allowed, true);
    const owned = {
      type: 'owned_service',
      ownership_status: 'verified',
      authorization_status: 'verified',
      scope_status: 'in_scope',
      environment_type: 'owned_or_lab',
      validation_mode: 'non_destructive',
      authorization_evidence: 'doc',
      allowed_origins: ['https://owned.invalid'],
    };
    assert.equal(engine.authorizeRedirect(owned, 'https://outside.invalid/path').reason, 'REDIRECT_OUT_OF_SCOPE');
    engine.running.add('lab');
    const duplicate = await engine.validate({
      id: 'lab',
      type: 'fixture_local',
      ownership_status: 'verified',
      authorization_status: 'verified',
      scope_status: 'in_scope',
      environment_type: 'owned_or_lab',
      validation_mode: 'non_destructive',
    });
    assert.equal(duplicate.reason, 'DUPLICATE_EXECUTION');
    engine.running.delete('lab');
    const recovered = new DefensiveValidationService({
      allowlistPath: allowlist,
      statePath: path.join(tmp, 'state.json'),
    });
    assert.equal(recovered.state.recovered_after_restart, true);
    console.log('defensive validation: PASS');
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true });
  }
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
