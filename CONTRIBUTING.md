# Contributing to BOQA

BOQA welcomes changes that make verification more deterministic, reproducible, understandable, and safe.

Read `README.md`, `AGENTS.md`, `docs/BOQA_HANDOFF.md`, and the relevant tests/evidence before changing code.

## Rules

- Prefer the smallest change that solves a demonstrated problem.
- Preserve `MODEL_OUTPUT != AUTHORIZATION`.
- Do not add a generic agent orchestrator, duplicated scheduler, optimizer layer, or second authority plane without a measured requirement.
- Do not add external target defaults.
- Do not weaken scope, policy, HumanGate, replay, or evidence gates.
- Keep secrets outside the repository.
- New network behavior must be explicit, scoped, and testable.

## Verification

```bash
npm ci
npm test
npm run demo:cuore
```

Browser/Docker changes require exact-head CI evidence.

## Dead code

Do not delete code because it looks old. Classify candidates using entrypoint reachability, imports, tests, runtime path, and compatibility requirements as ACTIVE, LEGACY_BUT_REQUIRED, DEAD, EXPERIMENTAL, or UNKNOWN.

## Pull requests

State exact base/head SHA, problem solved, authority/runtime boundaries touched, tests run, network behavior changes, evidence paths, and what is explicitly unchanged.
