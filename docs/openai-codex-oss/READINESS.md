# BOQA — OpenAI Codex for Open Source Readiness

LAST_CHECK=2026-09-28
APPLICATION_STATUS=NOT_READY

MAIN_CANONICAL=NO — current GitHub main is historical; accepted lean+CORE001 implementation is 0f756f682df915b8b97c84e38bcb8288b53d2009 and remains unmerged.
LICENSE=PREPARED_ON_HARDENING_BRANCH; absent from current main.
README=PREPARED_ON_HARDENING_BRANCH; absent from current main.
SECURITY_MD=PREPARED_ON_HARDENING_BRANCH; absent from current main.
CONTRIBUTING_MD=PREPARED_ON_HARDENING_BRANCH; absent from current main.
RELEASE_TAG=LEGACY_ONLY — boqa-v1-quality-bounty-2026-07-13 points to historical commit 0ceaf69745862377afe658946c1222ccf40be1dc; no current GitHub Release represents lean+CORE001.
PUBLIC_DEMO=NOT_READY — live site is historical; hardening branch will expose a safe fixture-only local CUORE demo, but no verified public demo maps to the accepted implementation.
CI_TESTS=CORE001 exact-head Browser Smoke run 36092142129 SUCCESS; Real Docker Qualification run 36092142090 SUCCESS. Hardening branch still requires exact-head CI.
DETERMINISTIC_REPLAY=PASS_ON_ACCEPTED_CORE001_EVIDENCE.
HUMAN_GATE=PASS_ON_ACCEPTED_CORE001_EVIDENCE.
ACTIVE_MAINTENANCE=YES — active issues/PRs and commits through 2026-09-28; latest controlling log remains LOG67.
REPO_HYGIENE=PARTIAL — accepted lean cleanup removed 127 dead/superseded/duplicate JS files, but public main still exposes the historical engine-heavy tree.
OPENAI_ORG_ID=org-KdoYdnEmMXzusYpXDoqgJdbv
FORM_TEXTS=DRAFTED_BELOW; not submitted.

## Official program fit

OpenAI currently states that maintainers of active open-source projects can apply and that review considers repository usage, ecosystem importance, and evidence of active maintenance. The application asks for the public GitHub repository, maintainer role, why the repository is eligible, OpenAI Organization ID, intended API-credit use, and optional additional context. Relevant free-text fields are limited to 500 characters.

Current GitHub adoption signal is weak: 0 stars and 0 forks at this audit. Do not hide or inflate this. The application case should focus on truthful technical importance and active maintenance after the public repository surface is coherent.

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

## BLOCKERS

1. Canonical public main does not yet contain the accepted lean+CORE implementation.
2. README/LICENSE/SECURITY/CONTRIBUTING are not yet on main.
3. No current release/tag represents the accepted lean+CORE implementation.
4. No verified public demo corresponds to the accepted implementation.
5. This hardening branch needs exact-head CI.
6. Repository adoption is currently minimal; application language must not imply broad adoption.
7. Final form texts are not owner-reviewed or submitted.

## NEXT_MINIMAL_ACTIONS

1. Run exact-head deterministic/browser/Docker qualification on this hardening branch.
2. Independently audit that the branch changes docs/demo/metadata only and does not alter authority behavior.
3. Decide a canonicalization path that brings accepted lean+CORE plus this hardening slice to main without resurrecting historical code.
4. Create a traceable release/tag from the eventual canonical head.
5. Verify one safe public demo against that release.
6. Re-run readiness, owner-review final <=500-character form texts, then submit manually.

## FORM_TEXTS

### Why is this repository eligible? — draft

BOQA is an actively maintained open-source verification project focused on a hard problem in AI-assisted engineering: separating model suggestions from authorization and proof. It combines deterministic policy gates, HumanGate escalation, isolated browser/Docker qualification, replayable evidence, and exact-head CI. It is early-stage, so we are not claiming broad adoption; the value is its reproducible verification architecture.

### How will API credits be used? — draft

Use Codex for OSS maintenance work: PR review, CI-failure triage, diff/log analysis, test generation, reproduction hypotheses, regression candidates, evidence drafting, documentation, and release verification. Codex remains advisory: it can propose changes and tests, while BOQA's deterministic gates, HumanGate, exact-head CI, and independent evidence decide what is accepted.

### Anything else? — draft

BOQA intentionally limits autonomy. Discovery is not authorization, model output cannot expand scope, and ambiguous or sensitive actions fail closed to HumanGate. The project is being simplified from a larger historical architecture into a lean, auditable verification kernel. We would use Codex to reduce maintainer load without changing those boundaries.
