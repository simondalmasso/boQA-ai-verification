# BOQA v1.5.1 — AUD NV001/NV004 origin-boundary remediation

AUDITED_SOURCE_REF=7921e19dbdbe8404333170a4689100931e7e479f
PR=71
ORDER=AUD_BOQA_NV_REVIEW
APPLICATION_STATUS=HOLD

## Root causes
The route GET /api/defensive/status was INTERNAL according to api-route-inventory.json yet registered before authentication. It now applies requireStrongProxyAuth (API key plus HMAC), with rate limiting, and is removed from public-read bypass. lib/middleware.js no longer allows protected routes to continue when BOQA_API_KEY or BOQA_HMAC_SECRET is unset: 503 fail-closed.

compose.yaml previously published "80:7070" to all host interfaces. The revised Compose topology has zero published host ports, only expose 7070 within one internal:true Docker network. GitHub Real Docker qualification resolves the real Compose JSON and rejects any host port, non-internal network or network_mode. An adversarial model fixture rejects misconfiguration.

The direct-origin test binds only temporary 127.0.0.1, sends real HTTP calls to Express, and requires 503 for missing auth, 401 for invalid key/HMAC, and 200 for an authenticated internal-status read. No external target is scanned. This is a source plus isolated test contract, NOT a deployed-host isolation claim.

## Evidence manifest
Exactly 46 paths are SHA-256 bound to this source commit, including lib/middleware.js, compose.yaml, Dockerfile, wrangler.toml, scripts/check-origin-compose-isolation.js, test/test-origin-direct-auth-boundary.js, the Docker qualification workflow, and the audit verifier. All hashes must be verified by fresh exact-head CI.

## AUD adjudications
NV001=PENDING_LIVE_AUTH_TRANSPORT: live Worker-to-origin ingress/authentication and deployed secret configuration unverified.
NV002=PREVIEW_PASS_PRODUCTION_PENDING: source and preview gates do not constitute MAIN=TAG=PRODUCTION; that future action is denied.
NV003=PASS_INDEPENDENTLY_VERIFIED_BY_AUD: independent AUD disposition; rejected as an outstanding finding.
NV004=SOURCE_AUTH_BOUNDARY_REMEDIATED_LIVE_ISOLATION_PENDING: source port/auth defects fixed; actual host/Northflank/firewall ingress/direct-origin bypass unverified.

## LIMITATIONS
Source/Compose evidence is insufficient to prove a running production origin is inaccessible; Cloudflare Worker alone is not an origin firewall. Do not invent origin hostname/IP, probe unknown targets, or expose secrets in evidence. A separately authorized operator must inspect the deployed origin configuration and execute an authorized direct-origin check before NV001/NV004 close. Exact-head Browser/Docker/Security/Publication/Preview/TesterArmy must all pass after this seal. MERGE=NO; DEPLOY=NO; RELEASE=NO; OSS_SUBMIT=NO; APPLICATION_STATUS=HOLD.
