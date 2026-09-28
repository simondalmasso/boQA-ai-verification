# AGENTS.md — BOQA repository operating rules

```text
MODEL_OUTPUT != AUTHORIZATION
```

BOQA is a specialized verification/evidence system, not a general-purpose autonomous-agent framework.

Authority:

```text
CUORE = deterministic authority
BRAIN / model = advisory
HumanGate = human authority
EVIDENCE = proof
```

## Required behavior

- Verify current remote state before relying on historical handoffs.
- Prefer preserve > rebuild, evidence > claim, root-cause > patch.
- Keep critical decisions deterministic and fail closed.
- Preserve policy/scope checks and HumanGate boundaries.
- Bind verification claims to exact revisions and reproducible evidence.
- Use owned, fixture, isolated-lab, or explicitly authorized targets only.
- Keep secrets out of code, logs, tests, fixtures, evidence, and prompts.
- A finder must not be the sole verifier of its own security or correctness claim.
- Keep candidate outcomes distinct: `confirmed`, `needs_validation`, and `rejected`. Do not assign confirmed status or severity when an essential fact is unresolved.

## Avoid without measured need

Do not add generic orchestrators, prediction/campaign engines, optimizer/capital-allocation layers, multiple authority brains, duplicated schedulers, or additional agent frameworks.

Do not resurrect historical modules merely to regain a feature name.

## Dead-code discipline

Do not delete by intuition. Establish entrypoint reachability, imports, tests, runtime path, and persisted compatibility requirements. Prefer a machine-readable ledger/graph when the cleanup is non-trivial. Unknown code remains `UNKNOWN` until evidence supports another classification.

## Verification

```bash
npm ci
npm test
npm run demo:cuore
```

Browser/Docker changes require exact-head evidence.

```text
Codex proposes.
BOQA verifies.
```
