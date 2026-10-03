# BOQA v1.5.0 — Scoped Security Audit Report

**Profile:** scoped quick  
**Audited source:** `0886d86defa054477425d482714e02dbf9c7a1c2`  
**Result:** `NO_CONFIRMED_RELEASE_BLOCKER`

This report applies only to the v1.5.0 security/release scope. It is not an exhaustive security-audit claim.

## Result

- confirmed findings: **0**
- confirmed release blockers: **0**
- needs validation: **0**
- rejected candidates after independent verification: **8**
- hardening-only notes: **4**

The audit preserves the distinction `candidate != finding`. Each candidate was checked by a separate source contract, route/call-site review, or regression verifier before classification.

## BOQA invariants reviewed

| Invariant | Result |
|---|---|
| Model output cannot grant authority | PASS in current canonical path |
| Advisory/tool metadata cannot create a runtime capability path | PASS in current canonical path |
| HumanGate identity binds the proposed action | PASS |
| Browser execution requires explicit scoped authority | PASS |
| Private surfaces resist path/encoding variants | PASS |
| Public edge is read-only for exposed API contracts | PASS |
| Release tag equality replaces ancestry-only evidence | PASS |
| Exact preview Worker version is the production promotion unit | PASS in source contract; runtime proof remains a production gate |
| Fail-closed states remain fail-closed | PASS in reviewed source/contracts |

## Release-integrity repair

The old v1.4.0 workflow could prove only that the immutable v1.4.0 tag was an ancestor of current main. That is not exact-head release evidence.

The v1.5.0 workflow is deliberately invoked, verifies exact canonical main, requires exact-head Browser/Docker/Cloudflare qualification plus production evidence, and requires:

`RELEASE_TAG_SHA == FINAL_MAIN_SHA`

The production workflow promotes the already-qualified Cloudflare preview version at 100%, avoiding a second Worker build during promotion.

## Hardening-only notes

1. Future mutable routes must not rely solely on the compatibility authorization fallback.
2. Unused in-page auth-preview instrumentation should be removed or redesigned before any future bridge consumes it.
3. The GitLab mirror checkout should eventually be SHA-pinned.
4. Wrangler is exact-versioned; Worker version identity is the release artifact-integrity control.

These notes do not demonstrate a current trust-boundary violation and do not block v1.5.0 under the requested policy.

## Coverage limitations

- No production probing occurred during the security audit.
- No external targets or production identities were used.
- A stricter local Docker audit verifier was unavailable in the execution environment; no weaker network-enabled substitute was used.
- Live Cloudflare account policy, token scope and control-plane drift are outside repository-source visibility.
- Production headers, private-route behavior and active-version equality are deliberately verified later by the explicit production deployment gate.
- This was a scoped quick audit, not an exhaustive review of historical/non-canonical modules.

## External methodology

Cloudflare security-audit-skill and selected cc-thinking-skills were used externally as audit methodology only. No runtime dependency or vendored audit framework was added. InsForge and the other explicitly rejected integrations remain outside v1.5.0. NVIDIA/OpenShell remains a post-release optional-backend spike only, with `OPENSHELL_ADVISOR_OUTPUT != AUTHORIZATION`.
