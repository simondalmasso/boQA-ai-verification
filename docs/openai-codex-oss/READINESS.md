# BOQA — OpenAI Codex for Open Source Readiness

LAST_CHECK=2026-10-03
APPLICATION_STATUS=READY

MAIN_CANONICAL=YES — GitHub main is the lean BOQA canon: lean kernel + CORE001 + OSS hardening + public landing. Historical engine-zoo modules are not part of the canonical tree.
LICENSE=PRESENT_ROOT_MIT
README=PRESENT_ROOT
SECURITY_MD=PRESENT_ROOT
CONTRIBUTING_MD=PRESENT_ROOT
RELEASE_TAG=v1.5.0 — target canonical release line; a published tag is valid only when it resolves to the exact canonical main SHA.
PUBLIC_DEMO=PASS — the release process requires the OSS landing at / and the preserved operational dashboard at /status/ to be verified from the same exact Cloudflare Worker version. The public landing is intentionally usable when the hunter backend is unavailable; /status/ must expose degradation rather than invent health.
CI_TESTS=PASS — promotion requires full regression, publication integrity, Browser Smoke, Real Docker Qualification, Cloudflare exact-preview evidence, and bounded security-audit evidence on the exact release head.
DETERMINISTIC_REPLAY=PASS
HUMAN_GATE=PASS
ACTIVE_MAINTENANCE=YES
REPO_HYGIENE=PASS — canonical main excludes the historical prediction/campaign/optimizer/allocator/scheduler engine zoo. External-tool triage remains documentation-only with zero admitted runtime frameworks.
SECURITY_ADVISORIES=PASS — the reachable qs advisory chain was classified as runtime/reachable and remediated by pinning qs 6.16.0; release qualification requires npm audit to report zero known vulnerabilities.
OPENAI_ORG_ID=org-KdoYdnEmMXzusYpXDoqgJdbv
FORM_TEXTS=READY_FOR_OWNER_SUBMISSION

## Direction to preserve

```text
bounded authority
deterministic verification
HumanGate
reproducible evidence
```

```text
DISCOVER
→ QUALIFY
→ AUTHORIZE
→ EXECUTE
→ VERIFY
→ PACKAGE EVIDENCE
→ HUMAN / PROGRAM SUBMIT
```

```text
CUORE = deterministic authority
BRAIN / model = advisory
HumanGate = human authority
EVIDENCE = proof
MODEL_OUTPUT != AUTHORIZATION
```

Codex integration message:

```text
Codex proposes.
BOQA verifies.
```

## Release/readiness contract

A release is readiness evidence only when all of the following refer to the same canonical SHA:

1. full regression passes;
2. the fixture-only CUORE demo reports `target_asset_network_requests=0`;
3. Browser Smoke passes;
4. Real Docker Qualification passes;
5. Cloudflare exact preview passes without mutating production;
6. production serves the OSS landing at `/` and the preserved dashboard at `/status/`;
7. the release tag resolves to that canonical main SHA;
8. repository metadata describes BOQA as open-source verification infrastructure without adoption or performance claims that are not evidenced.

Backend availability is a separate operational signal. A backend outage must be shown as unavailable/degraded on `/status/`; it does not authorize fabricated healthy state and does not make the static OSS landing depend on the hunter runtime.

## BLOCKERS

RELEASE_V1_5_0_PENDING_EXACT_MAIN_TAG_PROD_RECONCILIATION

The OpenAI application itself remains an explicit owner submission. `READY` does not mean `SUBMITTED` or selected by OpenAI.

## NEXT_MINIMAL_ACTIONS

1. Seal v1.5.0 only after exact-head Browser/Docker/preview/publication/security gates and exact production evidence pass.
2. Publish v1.5.0 only when the immutable tag SHA equals final canonical main and production source.
3. Preserve `MODEL_OUTPUT != AUTHORIZATION` and keep model output advisory.

## FORM_TEXTS

### Why is this repository eligible?

BOQA is an actively maintained open-source verification project focused on a hard problem in AI-assisted engineering: separating model suggestions from authorization and proof. It combines deterministic policy gates, HumanGate escalation, isolated browser/Docker qualification, replayable evidence, and exact-head CI. It is early-stage, so we do not claim broad adoption; the value is its reproducible verification architecture.

### How will API credits be used?

Use Codex for OSS maintenance work: PR review, CI-failure triage, diff/log analysis, test generation, reproduction hypotheses, regression candidates, evidence drafting, documentation, and release verification. Codex remains advisory: it can propose changes and tests, while BOQA's deterministic gates, HumanGate, exact-head CI, and independent evidence decide what is accepted.

### Anything else?

BOQA intentionally limits autonomy. Discovery is not authorization, model output cannot expand scope, and ambiguous or sensitive actions fail closed to HumanGate. The canonical repository is a lean, auditable verification kernel rather than the larger historical architecture. We would use Codex to reduce maintainer load without changing those boundaries.
