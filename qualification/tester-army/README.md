# TesterArmy external E2E — exact Cloudflare preview only

This isolated test project uses the open-source external [tester-army/e2e](https://github.com/tester-army/e2e) harness. Neither `e2e` nor `@e2e-dev/web` is a BOQA runtime dependency. Version pins: `e2e@0.15.2`, `@e2e-dev/web@0.11.1`, `typescript@7.0.2`. The CI artifact includes the fully resolved package-lock, source SHA-256 and the upstream Cloudflare preview evidence.

The PR workflow requires a **successful exact-SHA Cloudflare preview run** and extracts the versioned 0%-traffic Worker preview URL from its checked artifact. It aborts on a failed/missing preview. It runs five deterministic, no-AI cases on **desktop 1440×900** and **mobile 390×844** (exactly 10 test-target results). The fifth mobile case also tests **360×800** after resizing. Coverage: landing/invariants; safe local fixture demo; real degraded status grid concealment; navigation; HTTP security headers/private-route concealment and overflow. No target scans, production writes or provider inference.

The `npx e2e run` exit code and `.e2e/report.json` must both show 10/10. Green of this suite is bounded to the tested preview and does not approve source promotion or certify backend health. Independent NV-001..NV-004 review, production provenance and AUD authority gates remain separate.
