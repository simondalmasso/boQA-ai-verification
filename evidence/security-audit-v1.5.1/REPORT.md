# BOQA v1.5.1 — AUD NV001/NV004 origin-boundary remediation

AUDITED_SOURCE_REF=df643a84f16f571e840928002c577e1fc0909e54
PR=71
ORDER=AUD_BOQA_NV_REVIEW
APPLICATION_STATUS=HOLD

## Root causes
The route GET /api/defensive/status was INTERNAL according to api-route-inventory.json yet registered before authentication. It now applies requireStrongProxyAuth (API key plus HMAC), with rate limiting, and is removed from public-read bypass. lib/middleware.js no longer allows protected routes to continue when BOQA_API_KEY or BOQA_HMAC_SECRET is unset: 503 fail-closed.

compose.yaml previously published "80:7070" to all host interfaces. The revised Compose topology has zero published host ports, only expose 7070 within one internal:true Docker network. GitHub Real Docker qualification resolves the real Compose JSON and rejects any host port, non-internal network or network_mode. An adversarial model fixture rejects misconfiguration.

The direct-origin test binds only temporary 127.0.0.1, sends real HTTP calls to Express, and requires 503 for missing auth, 401 for invalid key/HMAC, and 200 for an authenticated internal-status read. No external target is scanned. This is a source plus isolated test contract, NOT a deployed-host isolation claim.

## Evidence manifest
Exactly 54 paths are SHA-256 bound to this source commit, including lib/middleware.js, compose.yaml, Dockerfile, wrangler.toml, scripts/check-origin-compose-isolation.js, test/test-origin-direct-auth-boundary.js, the Docker qualification workflow, and the audit verifier. All hashes must be verified by fresh exact-head CI.

## AUD adjudications
NV001=PENDING_LIVE_AUTH_TRANSPORT: live Worker-to-origin ingress/authentication and deployed secret configuration unverified.
NV002=PREVIEW_PASS_PRODUCTION_PENDING: source and preview gates do not constitute MAIN=TAG=PRODUCTION; that future action is denied.
NV003=PASS_INDEPENDENTLY_VERIFIED_BY_AUD: independent AUD disposition; rejected as an outstanding finding.
NV004=SOURCE_AUTH_BOUNDARY_REMEDIATED_LIVE_ISOLATION_PENDING: source port/auth defects fixed; actual host/Northflank/firewall ingress/direct-origin bypass unverified.

## LIMITATIONS
Source/Compose evidence is insufficient to prove a running production origin is inaccessible; Cloudflare Worker alone is not an origin firewall. Do not invent origin hostname/IP, probe unknown targets, or expose secrets in evidence. A separately authorized operator must inspect the deployed origin configuration and execute an authorized direct-origin check before NV001/NV004 close. Exact-head Browser/Docker/Security/Publication/Preview/TesterArmy must all pass after this seal. MERGE=NO; DEPLOY=NO; RELEASE=NO; OSS_SUBMIT=NO; APPLICATION_STATUS=HOLD.

## OSS STATIC DOCUMENTATION RECONCILIATION — 2026-10-09
READINESS.md updated from CI_TESTS=NOT_YET_QUALIFIED to candidate exact-head qualification with explicit prior SHA and rerun requirement on every HEAD change. This audited source commit df643a84f16f571e840928002c577e1fc0909e54 binds all 46 unchanged/updated paths; the seal commit changes only evidence files. PR #71 metadata will be reconciled separately after exact-head CI is observed. Cloudflare effective deployment bindings/secret presence, active tunnel/VPC, and existence or reachability of a production origin are NOT verified by repository CI and MUST be independently attested before STATIC-only NV001/NV004 N/A adjudication. No automatic N/A classification; NV001 and NV004 remain needs_validation. NV002 remains post-deploy. LIVE is out of scope. MERGE=NO; PROD_DEPLOY=NO; RELEASE=NO; OSS_SUBMISSION=HOLD.

## MONOCHROME PHAGE DESIGN — BOUNDED EDITORIAL UPDATE
Audited source ref df643a84f16f571e840928002c577e1fc0909e54 adds a monochrome bacteriophage SVG visual reference (artwork, not therapeutic/scientific product evidence); new source-bound scope = 54 SHA-256 paths. Added to scope: dashboard/landing.css, dashboard/favicon.svg, dashboard/phage-engraving.svg, scripts/browser-smoke-v1.js; updated bound HTML, Cloudflare browser check and production-byte asset check. All factual product copy remains BOQA verification/evidence infrastructure. Unsupported fictitious biotechnology therapies, effect sizes and adoption or revenue statistics are absent. This design source commit requires six exact-head CI gates and external TesterArmy against the evidence-only final commit; previous CI remains specific to its earlier HEAD. Operator Cloudflare-origin attestation for STATIC OSS NV001/NV004 remains UNKNOWN. No merge, deploy, release or OSS submission without verified promotion authority.\n
## RELEASE-LINK PUBLICATION GATE RECONCILIATION
Replaced seven stale v1.5.0 landing references with v1.5.1 release-candidate links and labels at source commit df643a84f16f571e840928002c577e1fc0909e54. This is a candidate link until future authorized release; no production promotion is implied. Revalidate full 6-gate CI and external E2E on the new sealed HEAD. MERGE=NO; PROD_DEPLOY=NO; APPLICATION_STATUS=HOLD.

## UNIT-CONTRACT RECONCILIATION
The source UI contract was updated to assert the owner-approved B&W landing truthfully, rather than asserting obsolete AI-oriented titles and descriptions. New source ref df643a84f16f571e840928002c577e1fc0909e54; test/test-oss-landing.js joins the SHA-256 audited coverage (51 paths). Cloudflare build executes npm test; all independent gates must pass on the next sealed HEAD. Scope remains design/UI test/static asset, not backend/runtime changes. APPLICATION_STATUS=HOLD.

## EXTERNAL TESTERARMY CONTRACT RECONCILIATION
At audited source df643a84f16f571e840928002c577e1fc0909e54 the previously scoped TesterArmy fixture now verifies the exact new visible headline and the presence of the bacteriophage illustration; other functional, negative and 360px responsive checks remain unchanged. Previously 2/10 failed only due obsolete text assertion. Exactly 54 reviewed SHA256-bound source/assets paths. Rerun six exact-head workflows. APPLICATION_STATUS=HOLD.

## OSS README / SEO / RELEASE STATUS — 2026-10-09
At source ref df643a84f16f571e840928002c577e1fc0909e54, README presents fixture-only reproduction before architecture; public HTML labels v1.5.1 as CANDIDATE, with verified PR #72 evidence rather than asserting a published v1.5.1 release. The README notes v1.5.0 as the latest actually published GitHub release. Canonical homepage, robots.txt and sitemap.xml are local static assets; production exact-byte comparison includes them. SHA-256 manifest binds 54 paths. Repository metadata, account-level social preview, deployed Cloudflare environment and SEO indexing are not asserted. All six exact-head CI gates must be repeated on the seal-only HEAD. MERGE=NO; DEPLOY=NO; RELEASE=NO; APPLICATION_STATUS=HOLD pending operator evidence and independent promotion review.\n