# BOQA — OpenAI Codex for Open Source Audit Notes

## 2026-09-29 — CANONICAL OSS RELEASE READINESS

STATUS=READY

EVIDENCE=
- GitHub main is the lean canonical line: lean kernel + CORE001 + OSS hardening + public landing.
- Canonical tree includes README, root MIT LICENSE, SECURITY.md, CONTRIBUTING.md, AGENTS.md, deterministic CUORE, HumanGate, replay/evidence, and the fixture-only CUORE demo.
- Historical prediction/campaign/optimizer/allocator/duplicated-scheduler modules were removed from the canonical tree rather than merged back.
- Public surface contract: `/` is the static OSS landing; `/status/` is the prior operational dashboard preserved byte-for-byte from the accepted landing baseline.
- Landing acceptance covers desktop 1440, mobile 390/360, keyboard navigation, reduced motion, first viewport, and no horizontal overflow at 200% text scaling.
- Safe demo contract remains fixture-only with `target_asset_network_requests=0`.
- The inherited npm audit result of 3 moderate findings was classified before release: `qs` was TRANSITIVE + RUNTIME + REACHABLE; `body-parser` was TRANSITIVE + RUNTIME and affected via `qs`; `express` was DIRECT + RUNTIME and affected via `qs`. Because Express uses extended query parsing and BOQA reads `req.query`, the chain was release-blocking.
- The minimal remediation pins `qs=6.16.0` through npm overrides. Fresh audit after the patch reports zero known vulnerabilities without a new framework, backend, agent, or runtime feature.
- Release promotion is bound to exact-head Browser Smoke, Real Docker Qualification, Cloudflare exact preview, production-surface verification, and a tag resolving to the same canonical SHA.
- The configured hunter backend can be unavailable independently of the public static surface. BOQA must surface that as degraded/unavailable on `/status/`; it must not fabricate health. The OSS landing intentionally does not depend on backend availability.
- `MODEL_OUTPUT != AUTHORIZATION` remains the authority invariant.
- `Codex proposes. BOQA verifies.` remains the integration message.

MISSING=
- OpenAI Codex for OSS form submission by the owner. This is an explicit human action, not an automated BOQA action.

RISK=
- backend operational availability may degrade `/status/`;
- future dependency drift can reintroduce advisories;
- future architecture changes could reintroduce the historical engine zoo if exact-tree review is skipped;
- application language must not overstate adoption, sponsorship, selection, or autonomy.

NEXT=
- owner review/submit the Codex for OSS application;
- keep every future release bound to exact-head reproducible evidence.

## 2026-09-28 — OSS READINESS

STATUS=NOT_READY

EVIDENCE=
- Repository was public and actively maintained.
- Historical public main still exposed the engine-heavy architecture.
- Accepted lean base and CORE001 existed on unmerged branches with exact-head Browser Smoke and Real Docker Qualification evidence.
- Root README/LICENSE/SECURITY/CONTRIBUTING and the current release/public-demo line were not yet canonical.

MISSING=
- canonical lean+CORE main;
- current release/tag;
- verified public demo corresponding to canonical release;
- final application readiness.

RISK=
- presenting historical main as current architecture;
- overstating adoption;
- reviving the old engine zoo while cleaning;
- changing authority boundaries to appear more autonomous;
- treating model output as proof or authorization;
- public demo drifting from canonical code.

NEXT=
- canonicalize lean+CORE+OSS hardening without historical resurrection;
- qualify exact head;
- release;
- verify safe public surface;
- re-run readiness.
