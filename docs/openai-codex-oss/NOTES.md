# BOQA — OpenAI Codex for Open Source Audit Notes

## 2026-09-28 — OSS READINESS

STATUS=NOT_READY

EVIDENCE=
- Repository is public and actively maintained.
- Current main: ff01c6d441ef60947e346ed0d65646fffd2f521b.
- Latest controlling authority: Issue #37 LOG67; no later LOG_SEQ observed.
- Accepted lean base: f734e229f442d83a873cd473a929883a846ec8c6, PR #49 open/draft/unmerged.
- Accepted CORE001: 0f756f682df915b8b97c84e38bcb8288b53d2009, PR #50 open/draft/unmerged.
- CORE001 Browser Smoke run 36092142129=SUCCESS.
- CORE001 Real Docker Qualification run 36092142090=SUCCESS.
- Accepted lean cleanup reports 127 dead/superseded/duplicate JS files removed, root runtime modules 87→8, dependencies 6→3.
- Current main still contains historical prediction/optimizer/campaign/allocator/engine modules.
- Current main has no root README, LICENSE, SECURITY.md, or CONTRIBUTING.md.
- package.json declares MIT, but GitHub reports no detected root license on main.
- Historical tag boqa-v1-quality-bounty-2026-07-13 points to historical commit 0ceaf69745862377afe658946c1222ccf40be1dc.
- No current GitHub Release represents lean+CORE001.
- OpenAI Codex for OSS application currently asks for public repo, maintainer role, eligibility text, OpenAI Organization ID, intended API-credit use, and optional context; relevant text fields are capped at 500 characters.
- OpenAI Organization ID resolved from the connected OpenAI Platform account: org-KdoYdnEmMXzusYpXDoqgJdbv.
- GitHub adoption counters observed at audit time: 0 stars, 0 forks.

MISSING=
- canonical lean+CORE main;
- exact-head CI for this hardening branch;
- current release/tag;
- verified public demo corresponding to canonical release;
- owner-reviewed final application texts;
- final application submission.

RISK=
- presenting historical main as current architecture;
- overstating adoption;
- reviving the old engine zoo while cleaning;
- changing authority boundaries to appear more autonomous;
- treating model output as proof or authorization;
- public demo drifting from canonical code.

NEXT=
- qualify this branch;
- audit it independently;
- canonicalize lean+CORE+hardening without historical resurrection;
- release;
- verify safe demo;
- re-run readiness;
- submit only after owner review.
