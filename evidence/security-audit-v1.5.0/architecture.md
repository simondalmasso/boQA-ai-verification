# BOQA v1.5.0 — Bounded Security Audit Architecture

Audit profile: scoped / quick
Audited source ref: `d0b7a823b580dca5be2575fefdf5cb574b752e5d`
Methodology reference: Cloudflare security-audit-skill (external methodology only; not vendored, not a runtime dependency)
Thinking aids: scientific-method, red-team, pre-mortem, via-negativa, map-territory, reversibility (external AUD tooling only)
Scope binding: `evidence/security-audit-v1.5.0/audited-scope-sha256.json` + `test/test-security-audit-scope-binding.js`

## Scope

- `worker.js`
- `server.js`
- `lib/middleware.js`
- `lib/billing-auth.js`
- `agent/playwright-runner.js`
- `bus.js`
- `cuore/`
- `kernel/verified-regression/`
- `.github/workflows/`
- release and production promotion path
- `scripts/check-publication.js`
- `scripts/check-security-audit-evidence.js`
- public landing/status boundary

Companion domains used:

- AI-AND-LLM
- SUPPLY-CHAIN-AND-RELEASE
- WEB-PROTOCOL-AND-AUTH
- CLIENT-SIDE
- CLOUD-AND-DEPLOYMENT

## Trust boundaries

1. **Model/tool output → CUORE**: advisory inputs may influence proposals but cannot directly authorize execution.
2. **CUORE → HumanGate**: ambiguous or authority-expanding decisions pause; HumanGate identity is derived from the exact proposed action basis.
3. **Authorized scope → browser executor**: browser target and all HTTP/WebSocket network requests are constrained to explicit allowed origins.
4. **Public edge → backend**: only `GET /api/health` and `GET /api/hunter/status` are proxied publicly; Worker credentials/HMAC are injected at the trusted edge.
5. **Public edge → private surfaces**: private billing/UI paths are normalized across encoding/case/slash variants and concealed before assets/API routing.
6. **Browser observations → evidence**: request headers/payloads flow through `EventBus._normalize`, which redacts sensitive structured fields and common secret-bearing payload formats before NDJSON/broadcast.
7. **PR head → preview → production → release**: exact-head qualification produces a verified Cloudflare version ID; production promotes that exact version at 100%; release publication is manually authorized and requires tag SHA equality with canonical main and exact production evidence.

## Authority invariants checked

- `MODEL_OUTPUT != AUTHORIZATION`
- model/tool metadata cannot create a new runtime capability path in the current canonical product
- HumanGate approval identifies the exact gate derived from proposed action; approval has no direct execution/resume consumer
- browser execution requires explicit target/scope and denies cross-origin HTTP/WebSocket egress
- public API cannot invoke private mutation through the Worker allowlist
- release tag equality is required; ancestry is insufficient
- exact preview Worker version, not a rebuilt artifact, is the production promotion unit
- fail-closed states remain visible as unavailable/blocked rather than fabricated healthy state

## Execution safety

No production probing was performed as part of this audit. No external targets were used. A local attempt to provision a stricter target-controlled Docker verifier was blocked by the execution environment; it was not replaced with a weaker network-enabled target execution. Dynamic verification is therefore delegated only to the repository's existing isolated qualification/preview gates and, after promotion, the explicit production verification workflow.

## Post-release OpenShell triage

NVIDIA/OpenShell is recorded as `ADOPT_POST_RELEASE_OPTIONAL_EXECUTION_BACKEND` only. It is not part of v1.5.0, does not replace Real Docker Qualification, and cannot decide authorization. The separate future spike must preserve `OPENSHELL_ADVISOR_OUTPUT != AUTHORIZATION`.
