# BOQA v1.5.1 bounded security source review

AUDITED_SOURCE_REF=0693ad2d471a1a1dc71e85eefc05e6e7587e55c4

## Source and scope
Exactly 38 source paths are cryptographically bound to this audited source ref and checked against final PR HEAD. This is a bounded source and regression review, not exhaustive security certification.

## Root causes and bounded remediations
1. Original Browser Smoke at 39c524b: PRIVATE_SMOKE_BOUNDARY_NOT_FOUND (shim expected a removed function). Remediated by injecting the privacy smoke into the current test lifecycle.
2. Original Cloudflare Exact Preview at 39c524b: EXPECTED_BACKEND_ABORT_MISSING (HTTP 503 is a completed response, not a requestfailed event). Remediated by asserting actual backend HTTP error or expected abort while rejecting other failures.
3. Browser Smoke at ceda922d: BACKEND_NOT_HEALTHY:500 (stale bus.clients.size after WebSocket removal). Health now reports zero WebSocket clients without restoring that runtime.
4. TesterArmy installer failures before tests: ambiguous npm executable and missing e2e-web binary in @e2e-dev/web@0.11.1. Isolated harness now uses pinned playwright@1.63.0 and its actual CLI.
5. TesterArmy at d730ea54: GitHub Actions and test report checks showed 10/10 PASS, but the uploaded artifact omitted the hidden .e2e/report.json. This source change copies the canonical TesterArmy report and JUnit to output/tester-army-e2e/ with SHA-256 checksums for independent inspection. The new exact-head CI run and artifact verification are still required.

## Open security validation
CONFIRMED_RELEASE_BLOCKERS=0 in this bounded static source review only.
NEEDS_VALIDATION=4 (NV-001 Worker-to-origin transport and auth, NV-002 release/version/prod provenance, NV-003 preview degraded UI, NV-004 direct-origin and removed surfaces). An independent verifier must classify all four with evidence. Tests do not automatically close them.

## Limitations
No exhaustive human security audit or production identity assurance. No independent direct-origin bypass test. Do not claim READY solely from green CI. The five exact-head workflows, independently inspectable external TesterArmy report, four NV determinations, and authority review must all be satisfied separately. MERGE=NO; DEPLOY=NO; RELEASE=NO; OSS_FORM_SUBMIT=NO; APPLICATION_STATUS=HOLD.
