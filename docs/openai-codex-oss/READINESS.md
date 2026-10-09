# BOQA — OpenAI Codex for Open Source Readiness

LAST_CHECK=2026-10-09
APPLICATION_STATUS=HOLD

MAIN_CANONICAL=YES — GitHub main is the lean BOQA canon: lean kernel + CORE001 + OSS hardening + public landing. Historical engine-zoo modules are not part of the canonical tree.
LICENSE=PRESENT_ROOT_MIT
README=PRESENT_ROOT
SECURITY_MD=PRESENT_ROOT
CONTRIBUTING_MD=PRESENT_ROOT
RELEASE_TAG=v1.5.1 — target canonical remediation release; a published tag is valid only when it resolves to the exact canonical main SHA.
PUBLIC_DEMO=STATIC_SOURCE_PASS_RUNTIME_NOT_VERIFIED — the release process requires the OSS landing at / and the preserved operational dashboard at /status/ to be verified from the same exact Cloudflare Worker version. The public landing is intentionally usable when the hunter backend is unavailable; /status/ must expose degradation rather than invent health.
CI_TESTS=QUALIFIED_CANDIDATE_EXACT_HEAD — all six independent workflows passed at prior exact-head 0b08b160b2e1db2a5b81e05c33b37997bf697d26 (Browser Smoke, Real Docker, Security Audit, Publication Integrity, Cloudflare Exact Preview, TesterArmy 10/10); a newer source/evidence/documentation HEAD MUST rerun all six exact-head gates before any promotion review. CI success does not authorize release.
DETERMINISTIC_REPLAY=PASS
HUMAN_GATE=PASS
ACTIVE_MAINTENANCE=YES
REPO_HYGIENE=P1_DEBT_NON_BLOCKING — canonical main is lean, but historical branches/PR cleanup remains a post-release governance task. External-tool triage remains documentation-only with zero admitted runtime frameworks.
SECURITY_ADVISORIES=PASS — qs is pinned to 6.16.0 and proxy-addr to 2.0.8; release qualification requires npm audit to report zero known vulnerabilities.
FORM_TEXTS=DRAFT_HOLD_OWNER_SUBMISSION
STATIC_OSS=RECOMMENDED_CONDITIONAL_HOLD — static/publication-only candidate, with intentionally degraded backend; LIVE_BACKEND=OUT_OF_SCOPE. No operational origin is claimed.
CLOUDFLARE_EFFECTIVE_BINDINGS=NOT_VERIFIED_OPERATOR_ATTESTATION_REQUIRED — account-level deployed bindings/secrets and active Worker version cannot be inferred from checked-in wrangler.toml or exact preview. Do not expose secret values.
ORIGIN_PRODUCTION_REACHABILITY=NOT_VERIFIED_OPERATOR_ATTESTATION_REQUIRED — checked-in Compose has no host-published ports and an internal network, but external ingress, alternative hosting and tunnel configuration remain unknown.
NV001_STATIC_DISPOSITION=CONDITIONAL_NA_ONLY_AFTER_OPERATOR_ATTESTATION; NV001_LIVE=PENDING
NV004_STATIC_DISPOSITION=CONDITIONAL_NA_ONLY_AFTER_OPERATOR_ATTESTATION; NV004_LIVE=PENDING
NV002=POST_AUTHORIZED_PRODUCTION_DEPLOY_EXACT_IDENTITY_GATE
NV003=PASS_INDEPENDENTLY_VERIFIED_BY_AUD
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

SOURCE_BLOCKERS=NO_CONFIRMED_BOUNDED_SOURCE_BLOCKER_AT_LAST_QUALIFIED_HEAD
STATIC_RELEASE_BLOCKERS=EFFECTIVE_CLOUDFLARE_BINDINGS_ATTESTATION_PENDING; LIVE_ORIGIN_ABSENCE_ATTESTATION_PENDING; NEW_HEAD_EXACT_CI_REQUIRED; INDEPENDENT_AUD_PROMOTION_APPROVAL_PENDING
RELEASE_SEAL_REQUIREMENT=MAIN=TAG=PROD

The OpenAI application itself remains an explicit owner submission. `HOLD` must remain until the independent terminal MAIN=TAG=PROD verification. Release qualification does not authorize self-declared readiness.

## NEXT_MINIMAL_ACTIONS

1. Obtain sanitized authorized Cloudflare/operator attestation of currently deployed Worker version, effective presence/absence of BOQA_BACKEND_URL, BOQA_API_KEY and BOQA_HMAC_SECRET (names and boolean presence only), service bindings, active tunnels/VPC connectors, and whether any BOQA origin/ingress remains accessible; include timestamp, operator role and evidence reference, not secret values or unredacted addresses.
2. For STATIC OSS only, if authoritative evidence proves no backend connected and no reachable production origin, allow independent AUD to adjudicate NV001/NV004 NOT_APPLICABLE_STATIC_RELEASE while retaining LIVE_PENDING. If the evidence does not exist, remain HOLD; static preview cannot substitute for control-plane proof.
3. After this documentation/evidence update, rerun all six exact-head gates; update PR #71 with the actual new SHA and immutable run/artifact links. Never reuse the previous SHA's GREEN for a new HEAD.
4. Request independent AUD STATIC promotion review after operator attestation, documentation and CI are complete. Only a later explicit owner approval may authorize merge, controlled production deployment, tag/release and OSS submission in that order, with MAIN=TAG=PROD verification.
5. Preserve `MODEL_OUTPUT != AUTHORIZATION` and keep model output advisory.

## FORM_TEXTS

### Why is this repository eligible?

BOQA is an actively maintained open-source verification project focused on a hard problem in AI-assisted engineering: separating model suggestions from authorization and proof. It combines deterministic policy gates, HumanGate escalation, isolated browser/Docker qualification, replayable evidence, and exact-head CI. It is early-stage, so we do not claim broad adoption; the value is its reproducible verification architecture.

### How will API credits be used?

Use Codex for OSS maintenance work: PR review, CI-failure triage, diff/log analysis, test generation, reproduction hypotheses, regression candidates, evidence drafting, documentation, and release verification. Codex remains advisory: it can propose changes and tests, while BOQA's deterministic gates, HumanGate, exact-head CI, and independent evidence decide what is accepted.

### Anything else?

BOQA intentionally limits autonomy. Discovery is not authorization, model output cannot expand scope, and ambiguous or sensitive actions fail closed to HumanGate. The canonical repository is a lean, auditable verification kernel rather than the larger historical architecture. We would use Codex to reduce maintainer load without changing those boundaries.
