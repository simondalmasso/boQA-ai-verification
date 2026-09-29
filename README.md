# BOQA

BOQA is a bounded autonomous QA and software-verification kernel for work that must be authorized, reproducible, and evidence-backed.

Its operating rule is simple:

```text
MODEL_OUTPUT != AUTHORIZATION
```

BOQA keeps deterministic authority separate from probabilistic assistance:

```text
DISCOVER
→ QUALIFY
→ AUTHORIZE
→ EXECUTE
→ VERIFY
→ PACKAGE EVIDENCE
→ HUMAN / PROGRAM SUBMIT
```

- **CUORE** — deterministic authority and policy gates.
- **BRAIN / model** — advisory classification, ranking, hypotheses, and drafting.
- **HumanGate** — explicit human authority when policy, scope, risk, KYC, submission, signing, or spend requires it.
- **Evidence / semantic verification** — independent proof of what actually happened.

## Why BOQA exists

AI can propose tests, interpret logs, triage CI, and suggest reproductions. Those suggestions are not proof and must not silently become permission.

BOQA is designed around four properties:

1. **bounded authority** — no self-expanding scope;
2. **deterministic verification** — critical decisions are machine-checkable;
3. **HumanGate** — ambiguous or sensitive actions fail closed;
4. **reproducible evidence** — claims are tied to replayable evidence and exact revisions.

## Safe local demo

The default demo is fixture-only. It does not scan or contact third-party targets.

```bash
npm ci
npm run demo:cuore
```

Expected properties:

- local fixture inputs only;
- deterministic CUORE decisions;
- `target_asset_network_requests = 0`;
- decisions limited to `WATCH | RESEARCH | SKIP | HUMAN_AUTHORIZE`;
- no submit, wallet, signing, spend, or external target action.

## Verification

Primary gate:

```bash
npm test
```

Focused gates:

```bash
npm run test:browser-scope
npm run test:replay
npm run test:v4
npm run test:verified-regression
npm run test:lab
```

The canonical release line is promoted only after Browser Smoke and Real Docker Qualification pass on the exact candidate head. Release/readiness evidence is kept in GitHub Actions and `docs/openai-codex-oss/`.

## Architecture

The supported implementation is intentionally lean. Historical generations and generic orchestration layers are not the product contract.

Key surfaces:

- `cuore/` — deterministic decision kernel, radar fixture adapters, and HumanGate.
- `kernel/verified-regression/` — verified-regression evidence flow.
- `spike/boundary-proof/` — boundary proof and regression compilation.
- `agent/playwright-runner.js` — scoped browser adapter requiring explicit target/origin authorization.
- replay helpers — deterministic replay.
- `server.js` — local API/dashboard surface; browser execution remains disabled until explicitly scoped.
- `worker.js` — thin edge/control-plane boundary.

The accepted lean cleanup removed 127 dead, superseded, or duplicate JavaScript files from the historical implementation path and reduced runtime dependencies from six to three. See `docs/BOQA_HANDOFF.md` and `evidence/restore001/`.

## Security and authorization

Discovery is not authorization.

Before BOQA interacts with third-party software, current machine-verifiable evidence must establish:

- authorization;
- scope;
- allowed test classes;
- rate limits;
- data-handling rules;
- disclosure rules.

If that evidence is missing or ambiguous, the safe result is `HUMAN_AUTHORIZE` or `SKIP`.

Do not use BOQA to scan targets you do not own or lack explicit authorization to test.

See [SECURITY.md](SECURITY.md).

## Contributing

Contributions should preserve deterministic authority, fail-closed behavior, exact-head verification, and the lean architecture.

See [CONTRIBUTING.md](CONTRIBUTING.md) and [AGENTS.md](AGENTS.md).

## Open-source readiness

Application/readiness tracking for OpenAI Codex for Open Source lives in:

- `docs/openai-codex-oss/READINESS.md`
- `docs/openai-codex-oss/NOTES.md`

The application narrative must remain truthful:

```text
Codex proposes.
BOQA verifies.
```

## License

MIT. See [LICENSE](LICENSE).
