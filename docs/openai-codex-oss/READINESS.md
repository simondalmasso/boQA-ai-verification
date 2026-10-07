# BOQA — OpenAI Codex for Open Source Readiness

LAST_CHECK=2026-10-07
APPLICATION_STATUS=HOLD

MAIN_CANONICAL=YES — GitHub main is the lean BOQA canon: lean kernel + CORE001 + OSS hardening + public landing. Historical engine-zoo modules are not part of the canonical tree.
LICENSE=PRESENT_ROOT_MIT
README=PRESENT_ROOT
SECURITY_MD=PRESENT_ROOT
CONTRIBUTING_MD=PRESENT_ROOT
RELEASE_TAG=v1.5.1 — target canonical remediation release; a published tag is valid only when it resolves to the exact canonical main SHA.
PUBLIC_DEMO=STATIC_SOURCE_PASS_RUNTIME_NOT_VERIFIED — the release process requires the OSS landing at / and the preserved operational dashboard at /status/ to be verified from the same exact Cloudflare Worker version. The public landing is intentionally usable when the hunter backend is unavailable; /status/ must expose degradation rather than invent health.
CI_TESTS=NOT_YET_QUALIFIED — promotion requires full regression, publication integrity, Browser Smoke, Real Docker Qualification, Cloudflare exact-preview evidence, and bounded security-audit evidence on the exact release head.
DETERMINISTIC_REPLAY=PASS
HUMAN_GATE=PASS
ACTIVE_MAINTENANCE=YES
REPO_HYGIENE=P1_DEBT_NON_BLOCKING — canonical main is lean, but historical branches/PR cleanup remains a post-release governance task. External-tool triage remains documentation-only with zero admitted runtime frameworks.
SECURITY_ADVISORIES=PASS — qs is pinned to 6.16.0 and proxy-addr to 2.0.8; release qualification requires npm audit to report zero known vulnerabilities.
OPENAI_ORG_ID=org-KdoYdnEmMXzusYpXDoqgJdbv
FORM_TEXTS=DRAFT_HOLD_OWNER_SUBMISSION
BACKEND_TRANSPORT=SOURCE_PASS_PRODUCTION_PENDING — production defaults fail closed with no plaintext public origin; Worker rejects public HTTP upstreams.
COBROS_REMOVED=SOURCE_PASS — billing implementation, frontend, PIN configuration and private billing API are removed; only negative legacy-route regressions remain.
WEBSOCKET_REMOVED=SOURCE_PASS — BOQA no longer exposes or proxies a WebSocket endpoint.
ROUTE_INVENTORY=SOURCE_PASS — active and removed network surfaces are explicitly classified.
RELEASE_EVIDENCE=DURABLE_SANITIZED_ASSET_REQUIRED — v1.5.1 publication uploads a sanitized evidence JSON and checksum to the GitHub Release.

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

Backend availability is a separate operational signal. v1.5.1 ships with no insecure public backend origin configured; the public Worker rejects non-loopback plaintext HTTP upstreams. Until a verified HTTPS/private origin is configured, `/status/` must show the runtime unavailable/degraded while static publication remains valid.

## BLOCKERS

SOURCE_BLOCKERS=PENDING_VERIFICATION
RELEASE_SEAL_REQUIREMENT=MAIN=TAG=PROD

The OpenAI application itself remains an explicit owner submission. `HOLD` must remain until the independent terminal MAIN=TAG=PROD verification. Release qualification does not authorize self-declared readiness.

## NEXT_MINIMAL_ACTIONS

1. For v1.5.1, execute exact-head Browser/Docker/preview/publication/security gates and exact production evidence before tag publication.
2. Treat the release as sealed only when the tag SHA equals canonical main and production source, and the sanitized durable release-evidence assets are attached.
3. Preserve `MODEL_OUTPUT != AUTHORIZATION` and keep model output advisory.

## FORM_TEXTS

### Why is this repository eligible?

BOQA is an actively maintained open-source verification project focused on a hard problem in AI-assisted engineering: separating model suggestions from authorization and proof. It combines deterministic policy gates, HumanGate escalation, isolated browser/Docker qualification, replayable evidence, and exact-head CI. It is early-stage, so we do not claim broad adoption; the value is its reproducible verification architecture.

### How will API credits be used?

Use Codex for OSS maintenance work: PR review, CI-failure triage, diff/log analysis, test generation, reproduction hypotheses, regression candidates, evidence drafting, documentation, and release verification. Codex remains advisory: it can propose changes and tests, while BOQA's deterministic gates, HumanGate, exact-head CI, and independent evidence decide what is accepted.

### Anything else?

BOQA intentionally limits autonomy. Discovery is not authorization, model output cannot expand scope, and ambiguous or sensitive actions fail closed to HumanGate. The canonical repository is a lean, auditable verification kernel rather than the larger historical architecture. We would use Codex to reduce maintainer load without changing those boundaries.
