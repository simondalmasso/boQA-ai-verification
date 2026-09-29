#!/usr/bin/env node
'use strict';

const fs = require('fs');
const os = require('os');
const path = require('path');
const { ALLOWED_DECISIONS, DecisionKernel, RadarEngine, RadarState } = require('../cuore');

function readFixture(name) {
  return JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'cuore', 'fixtures', name), 'utf8'));
}

function main() {
  const scratch = fs.mkdtempSync(path.join(os.tmpdir(), 'boqa-cuore-demo-'));
  try {
    const radar = new RadarEngine({
      state: new RadarState({ filePath: path.join(scratch, 'radar.json') }),
      kernel: new DecisionKernel({
        minimumExpectedNet: 0,
        now: () => Date.parse('2026-09-25T01:00:00.000Z'),
      }),
    });

    const result = radar.scanFixtures(
      [
        { kind: 'agent_market', data: readFixture('agent-market.json') },
        { kind: 'conventional_bounty', data: readFixture('conventional-bounty.json') },
        { kind: 'web3_bounty', data: readFixture('web3-bounty.json') },
      ],
      {
        now: Date.parse('2026-09-25T01:00:00.000Z'),
        capabilitySnapshot: {
          ready_capabilities: [
            'browser-reproduction',
            'evidence-verification',
            'scope-authorization',
            'deterministic-replay',
          ],
          region: 'GLOBAL',
          payout_ready: true,
          authorized_policy_digest: null,
        },
        economicInputs: {
          payout_probability: 0.5,
          expected_payout: 100,
          compute_cost: 0,
          paid_tool_cost: 0,
          chain_fee: 0,
          expected_human_cost: 0,
          dispute_risk_reserve: 0,
          minimum_expected_net: 0,
        },
      }
    );

    if (result.target_asset_network_requests !== 0) {
      throw new Error('FIXTURE_DEMO_MUST_NOT_CONTACT_TARGET_ASSETS');
    }

    const decisions = result.decisions.map((decision) => ({
      decision: decision.decision,
      blockers: decision.blockers,
      next_safe_step: decision.next_safe_step,
      target_asset_network_requests: decision.target_asset_network_requests,
    }));

    for (const decision of decisions) {
      if (!ALLOWED_DECISIONS.includes(decision.decision)) throw new Error('UNEXPECTED_DECISION_CLASS');
      if (decision.target_asset_network_requests !== 0) throw new Error('DECISION_ATTEMPTED_TARGET_NETWORK');
    }

    process.stdout.write(JSON.stringify({
      mode: 'FIXTURE_ONLY',
      authority: 'CUORE_DETERMINISTIC',
      model_authority: false,
      source_kinds: ['agent_market', 'conventional_bounty', 'web3_bounty'],
      raw_opportunities: result.raw_opportunities,
      unique_opportunities: result.unique_opportunities,
      decisions,
      target_asset_network_requests: result.target_asset_network_requests,
    }, null, 2) + '\n');
  } finally {
    fs.rmSync(scratch, { recursive: true, force: true });
  }
}

main();
