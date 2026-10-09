# BOQA v1.5.1 — AUD NV001/NV004 origin-boundary remediation

AUDITED_SOURCE_REF=c5a41b0e19514444ff63705274757266000f5ff1
PR=71
ORDER=AUD_BOQA_NV_REVIEW
APPLICATION_STATUS=HOLD

## Root causes
The route GET /api/defensive/status was INTERNAL according to api-route-inventory.json yet registered before authentication. It now applies requireStrongProxyAuth (API key plus HMAC), with rate limiting, and is removed from public-read bypass. lib/middleware.js no longer allows protected routes to continue when BOQA_API_KEY or BOQA_HMAC_SECRET is unset: 503 fail-closed.

compose.yaml previously published "80:7070" to all host interfaces. The revised Compose topology has zero published host ports, only expose 7070 within one internal:true Docker network. GitHub Real Docker qualification resolves the real Compose JSON and rejects any host port, non-internal network or network_mode. An adversarial model fixture rejects misconfiguration.

The direct-origin test binds only temporary 127.0.0.1, sends real HTTP calls to Express, and requires 503 for missing auth, 401 for invalid key/HMAC, and 200 for an authenticated internal-status read. No external target is scanned. This is a source plus isolated test contract, NOT a deployed-host isolation claim.

## Evidence manifest
Exactly 51 paths are SHA-256 bound to this source commit, including lib/middleware.js, compose.yaml, Dockerfile, wrangler.toml, scripts/check-origin-compose-isolation.js, test/test-origin-direct-auth-boundary.js, the Docker qualification workflow, and the audit verifier. All hashes must be verified by fresh exact-head CI.

## AUD adjudications
NV001=PENDING_LIVE_AUTH_TRANSPORT: live Worker-to-origin ingress/authentication and deployed secret configuration unverified.
NV002=PREVIEW_PASS_PRODUCTION_PENDING: source and preview gates do not constitute MAIN=TAG=PRODUCTION; that future action is denied.
NV003=PASS_INDEPENDENTLY_VERIFIED_BY_AUD: independent AUD disposition; rejected as an outstanding finding.
NV004=SOURCE_AUTH_BOUNDARY_REMEDIATED_LIVE_ISOLATION_PENDING: source port/auth defects fixed; actual host/Northflank/firewall ingress/direct-origin bypass unverified.

## LIMITATIONS
Source/Compose evidence is insufficient to prove a running production origin is inaccessible; Cloudflare Worker alone is not an origin firewall. Do not invent origin hostname/IP, probe unknown targets, or expose secrets in evidence. A separately authorized operator must inspect the deployed origin configuration and execute an authorized direct-origin check before NV001/NV004 close. Exact-head Browser/Docker/Security/Publication/Preview/TesterArmy must all pass after this seal. MERGE=NO; DEPLOY=NO; RELEASE=NO; OSS_SUBMIT=NO; APPLICATION_STATUS=HOLD.

## OSS STATIC DOCUMENTATION RECONCILIATION — 2026-10-09
READINESS.md updated from CI_TESTS=NOT_YET_QUALIFIED to candidate exact-head qualification with explicit prior SHA and rerun requirement on every HEAD change. This audited source commit c5a41b0e19514444ff63705274757266000f5ff1 binds all 46 unchanged/updated paths; the seal commit changes only evidence files. PR #71 metadata will be reconciled separately after exact-head CI is observed. Cloudflare effective deployment bindings/secret presence, active tunnel/VPC, and existence or reachability of a production origin are NOT verified by repository CI and MUST be independently attested before STATIC-only NV001/NV004 N/A adjudication. No automatic N/A classification; NV001 and NV004 remain needs_validation. NV002 remains post-deploy. LIVE is out of scope. MERGE=NO; PROD_DEPLOY=NO; RELEASE=NO; OSS_SUBMISSION=HOLD.

## MONOCHROME PHAGE DESIGN — BOUNDED EDITORIAL UPDATE
Audited source ref c5a41b0e19514444ff63705274757266000f5ff1 adds a monochrome bacteriophage SVG visual reference (artwork, not therapeutic/scientific product evidence); new source-bound scope = 51 SHA-256 paths. Added to scope: dashboard/landing.css, dashboard/favicon.svg, dashboard/phage-engraving.svg, scripts/browser-smoke-v1.js; updated bound HTML, Cloudflare browser check and production-byte asset check. All factual product copy remains BOQA verification/evidence infrastructure. Unsupported fictitious biotechnology therapies, effect sizes and adoption or revenue statistics are absent. This design source commit requires six exact-head CI gates and external TesterArmy against the evidence-only final commit; previous CI remains specific to its earlier HEAD. Operator Cloudflare-origin attestation for STATIC OSS NV001/NV004 remains UNKNOWN. No merge, deploy, release or OSS submission without verified promotion authority.\n
## RELEASE-LINK PUBLICATION GATE RECONCILIATION
Replaced seven stale v1.5.0 landing references with v1.5.1 release-candidate links and labels at source commit c5a41b0e19514444ff63705274757266000f5ff1. This is a candidate link until future authorized release; no production promotion is implied. Revalidate full 6-gate CI and external E2E on the new sealed HEAD. MERGE=NO; PROD_DEPLOY=NO; APPLICATION_STATUS=HOLD.

## UNIT-CONTRACT RECONCILIATION
The source UI contract was updated to assert the owner-approved B&W landing truthfully, rather than asserting obsolete AI-oriented titles and descriptions. New source ref c5a41b0e19514444ff63705274757266000f5ff1; test/test-oss-landing.js joins the SHA-256 audited coverage (51 paths). Cloudflare build executes npm test; all independent gates must pass on the next sealed HEAD. Scope remains design/UI test/static asset, not backend/runtime changes. APPLICATION_STATUS=HOLD.
