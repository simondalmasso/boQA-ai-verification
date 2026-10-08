# BOQA v1.5.1 bounded security source review

AUDITED_SOURCE_REF=935cb00b29d72ec82eda13eb626d1703bdfe9205

## Scope and evidence
Source manifest binds 38 committed paths by SHA-256. Includes Worker/backend transport and auth, Cloudflare preview/production/release workflows, test harness, WebSocket removal health response, and isolated TesterArmy E2E.

Observed CI red-to-green history:
- 39c524b Browser failed `PRIVATE_SMOKE_BOUNDARY_NOT_FOUND`; shim now injects private-route concealment into current Browser Smoke main lifecycle.
- 39c524b Cloudflare Preview failed `EXPECTED_BACKEND_ABORT_MISSING` on completed HTTP 503; validator now requires HTTP error response or expected abort and rejects missing, unexpected outcomes.
- ceda922d Browser failed `BACKEND_NOT_HEALTHY:500` due to stale WebSocket bus.clients.size; health now reports zero removed clients without reopening WebSockets.
- On 639dce4, all five original exact-head CI workflows PASS and Cloudflare exact-preview produces 0%-traffic version, but TesterArmy E2E fails BEFORE its tests during installer setup: upstream `@e2e-dev/web` has named `e2e-web` binary; this source ref changes installer to explicit `./node_modules/.bin/e2e-web install chromium --with-deps`. The runner selector now consumes canonical report-1 `.run.results` instead of nonexistent root-level `.results`. The first exact-head E2E on f3397a2 failed BEFORE tests because legacy web@0.11.1 provides no e2e-web binary; this source pins peer Playwright@1.63.0 and uses the installed playwright browser CLI. Fresh same-head CI and actual E2E 10/10 remain REQUIRED and UNPROVEN for this commit.

## Findings
CONFIRMED_RELEASE_BLOCKERS=0 in this bounded source review, not a release certification.
NEEDS_VALIDATION=4: independent assessment of NV-001 Worker→origin, NV-002 release→Worker→production, NV-003 preview degraded UI and NV-004 direct-origin bypass still required. Passing automated source tests alone does not close them.

## LIMITATIONS
Bounded static/fixture review, not exhaustive security certification. No live direct-origin bypass or production identity verification; no human independent approval. Merge, production deploy, release/tag and OSS submission denied, APPLICATION_STATUS=HOLD. Same-SHA qualification gates, real external tester-army report and reviewer decisions must be rechecked after this commit.
