# External Tool / Research Triage — 2026-09-28

Purpose: evaluate owner-supplied links against BOQA's lean-kernel direction without reviving overengineering.

Decision vocabulary:

- `DISTILL_NOW` — copy a narrow method/pattern into BOQA documentation/process; do not add runtime dependency.
- `BENCHMARK_LATER` — potentially useful challenger/evaluation target; isolate and measure before any admission.
- `WATCH_READ_ONLY` — useful as ecosystem/radar/reference input only.
- `ADOPT_POST_RELEASE_OPTIONAL_EXECUTION_BACKEND` — strategically strong but explicitly deferred until after the current canonical release; optional backend only, never an authority source.
- `REJECT` — irrelevant, duplicates accepted architecture, expands authority, introduces avoidable risk, or conflicts with BOQA scope.

Non-negotiable:

```text
MODEL_OUTPUT != AUTHORIZATION
CUORE = deterministic authority
BRAIN/model = advisory
HumanGate = human authority
EVIDENCE = proof
```

No item below is authorized for production integration merely because it appears here.

## Strongest fits

| Source | Decision | BOQA use |
|---|---|---|
| cloudflare/security-audit-skill | DISTILL_NOW | Adopt source-first trust-boundary mapping, coverage ledger, fresh independent verifier, confirmed/needs_validation/rejected separation, and sandbox-before-target-code principles. Do not vendor its full orchestration. |
| NVIDIA/OpenShell | ADOPT_POST_RELEASE_OPTIONAL_EXECUTION_BACKEND | Strategic fit is very high for execution isolation, but v1.5.0 keeps current Docker qualification canonical. After v1.5.0 is sealed, evaluate only as an optional backend behind CUORE-authorized normalized actions; `OPENSHELL_ADVISOR_OUTPUT != AUTHORIZATION`. |
| obra/superpowers | DISTILL_NOW | Keep TDD, systematic debugging, planning, and verification-before-completion methods. Already aligned with BOQA engineering discipline; do not add as runtime. |
| Graphify-Labs/graphify | DISTILL_NOW | Use deterministic AST/reachability/impact ideas for dead-code classification and cleanup evidence. Prefer local deterministic graph extraction over a new persistent knowledge layer. |
| addyosmani/agent-skills | DISTILL_NOW | Curate only engineering/review patterns that improve tests, review, performance, accessibility, or maintenance. Do not vendor a catalog. |
| browser-use/jev-ultrafast | BENCHMARK_LATER | Useful ideas: constrained action space, typed compatible targets, independent DONE verification, structured DOM state, latency/protocol-call measurement. Challenger only; no browser-runtime replacement now. |
| browserbase/stagehand | BENCHMARK_LATER | Useful hybrid deterministic/AI browser API and domain allowlist ideas. BOQA already has Playwright; adding Stagehand now would duplicate the browser layer. |
| trycua/cua | BENCHMARK_LATER | Strong sandbox/desktop/evaluation infrastructure candidate if BOQA later needs cross-OS isolated computer-use qualification. Too large for current lean core. |
| Tencent/AI-Infra-Guard | BENCHMARK_LATER | Potentially useful external evaluator for agent/skill/MCP security. Do not integrate its full red-team platform into BOQA runtime. |
| KeygraphHQ/shannon | BENCHMARK_LATER | “prove before report” and source+execution validation are relevant; autonomous exploit execution conflicts with current BOQA authority model. Use only in owned isolated labs if ever evaluated. |
| Caido | BENCHMARK_LATER | Useful authorized manual/headless web-security proxy for controlled lab comparison; not a BOQA dependency or authority source. |

## Ecosystem / radar / reference only

| Source | Decision | BOQA use |
|---|---|---|
| Virtuals ACP offerings | WATCH_READ_ONLY | Future agent-market metadata radar/provider research. Discovery never equals authorization; no autonomous acceptance/submission from listing data. |
| Cloudflare Dashboard | WATCH_READ_ONLY | Existing control plane only. Do not turn Cloudflare Worker into a heavy browser/Docker executor. |
| mvanhorn/last30days-skill | WATCH_READ_ONLY | Maintainer research methodology only. BOQA radar should use narrow authoritative sources rather than importing a broad social/web research pipeline. |
| K-Dense-AI/scientific-agent-skills | WATCH_READ_ONLY | Skill packaging/provenance/test conventions are useful; scientific catalog is out of BOQA scope. Do not vendor. |
| trimstray/the-book-of-secret-knowledge | WATCH_READ_ONLY | Reference catalog only; too broad and heterogeneous for runtime or skill-registry admission. |
| WaterCrawl | WATCH_READ_ONLY | Could inform future public-metadata ingestion, but BOQA already has narrower radar requirements; no crawler dependency now. |
| skydive-project/skydive | WATCH_READ_ONLY | Network topology/observability reference; unrelated to current browser-QA kernel. |
| TencentDB-Agent-Memory | WATCH_READ_ONLY | Team memory concepts only. BOQA already has bounded OutcomeMemory/canon; adding a general agent-memory platform would duplicate state and create a second memory plane. |
| akitaonrails/ai-memory | WATCH_READ_ONLY | Handoff/provenance ideas may be useful for maintainer workflow, but do not add another persistent memory authority to BOQA. |
| ryancodrai/turbovec | WATCH_READ_ONLY | Vector indexing is not a demonstrated BOQA requirement. No vector store until measured need exists. |
| eneskirca/nodeterm | WATCH_READ_ONLY | Developer UX for parallel agent terminals; useful outside BOQA runtime, not a product dependency. |
| XiaoDuoYa/codex-with-chatgpt | WATCH_READ_ONLY | Planning/execution separation resembles AUD/ARQ discipline, but BOQA should not depend on a workspace bridge. |
| cbrock84/headcount | WATCH_READ_ONLY | Modular skill organization is interesting; “agent organization” would recreate orchestration breadth BOQA is removing. |
| Nanako0129/sepia | WATCH_READ_ONLY | Writing/review style skill; no runtime relevance. |
| ading2210/linuxpdf | WATCH_READ_ONLY | Interesting sandbox/emulation artifact, no current BOQA requirement. |
| Dream-RSI | WATCH_READ_ONLY | Replay-simulator/self-improvement research is conceptually relevant to evidence-driven policy evaluation, but self-improving policy must never gain authority automatically. Research only. |
| Google GlucoFM | REJECT | Health/CGM foundation-model research is unrelated to BOQA verification architecture. |
| Stagehand website | BENCHMARK_LATER | Same disposition as browserbase/stagehand; documentation/reference only. |
| Mindgard AI pentesting comparison | WATCH_READ_ONLY | Market/research reference for AI-specific red-team categories; vendor comparisons are not BOQA architecture authority. |
| EC-Council pentesting/AI-tools article | WATCH_READ_ONLY | High-level methodology/reference only; no direct integration. |


## Explicitly deferred or rejected before v1.5.0

| Source | Decision | Reason |
|---|---|---|
| Agent-Reach | REJECT_AS_RUNTIME | Generalized scraping, shell, cookie/login, and network capabilities expand BOQA execution authority and target surface before the release boundary is sealed. |
| InsForge | REJECT_AS_RUNTIME | No database, auth, storage, or backend replacement is required for v1.5.0; adding one would introduce architecture for no current problem. |
| Decision 2.0 | REJECT_AS_AUTHORITY | Probabilistic decision models must not enter CUORE or deterministic authorization. A future advisory-only comparison could emit proposals that BOQA independently verifies. |
| Agent Beacon | WATCH_READ_ONLY | Potential post-release session observability reference; do not add telemetry, privacy, or storage surface before v1.5.0. |
| Prism Legal OS | DISTILL_NOW | Publication-discipline idea only. BOQA independently implements its own zero-dependency publication check; no Prism code or dependency is copied. |

## Security/autonomous-pentest projects — do not integrate into current runtime

| Source | Decision | Reason |
|---|---|---|
| Armur-Ai/Pentest-Swarm-AI | REJECT | Multi-agent recon/exploitation swarm duplicates orchestration and expands autonomous offensive authority; AGPL also complicates reuse. |
| FrancescoStabile/numasec | REJECT | General AI cyber-security agent is broader than BOQA's narrow verification kernel. |
| usestrix/strix | REJECT | Autonomous AI pentesting would duplicate/expand execution authority; isolated comparative lab only if separately authorized. |
| ultrasecurity/Storm-Breaker | REJECT | Social-engineering/camera/microphone/location collection is outside BOQA scope and high-risk. |
| chrisk44/Hijacker | REJECT | Wireless attack GUI/tooling is outside BOQA's browser/web verification target class. |
| LeakIX | REJECT_AS_DEFAULT_INPUT | Internet-wide exposure/search data can create target/scope ambiguity. No automatic target discovery or scanning from it. |
| HackerAI / HackerGPT / DeepHat | REJECT_AS_RUNTIME | General hacking assistants do not provide deterministic authority or independent proof. At most external research references. |
| network-recon-hub preview | REJECT | Untrusted external recon app; no need to import or rely on it. |

## Browser/session sharing

| Source | Decision | Reason |
|---|---|---|
| citrolabs/ego-lite | REJECT_FOR_BOQA_RUNTIME | Its value proposition includes sharing logged-in browser state with agents. BOQA deliberately rejects inherited user-session/CDP authority for target execution; this conflicts with the accepted isolation boundary. |
| h4ckf0r0day/obscura | BENCHMARK_LATER | Headless browser engineering may be useful for controlled performance/isolation benchmarks, but Playwright is already accepted and no replacement need is demonstrated. |
| TheoLeeCJ/SemIf-OpenJev | BENCHMARK_LATER | Keep as challenger only, consistent with existing LOG65/ARQ2 disposition. No dual-stack runtime. |

## Irrelevant or unsafe-to-adopt links

| Source | Decision | Reason |
|---|---|---|
| Hao-Zou-lab/DECEPTICON | REJECT | This DECEPTICON is a bioinformatics cell-proportion deconvolution package, not an agent/security system. Name collision only. |
| medicalcertificategenerator.com | REJECT | Unrelated sample-document generator; no BOQA need. |
| neapay credit-card generator/validator | REJECT | Unrelated to BOQA and unnecessary financial/fraud-adjacent surface. |
| pornorama video | REJECT | No engineering relevance. |
| OnWorks | REJECT | Generic online OS hosting; use controlled pinned Docker/runner environments instead. |
| DistroSea | REJECT | Generic online distro sessions are not reproducible BOQA runners. |
| Facebook post | REJECT | Social post is not a technical authority or dependency source. |
| ChatGPT shared ChaosGPT conversation | REJECT | Conversation content is not a reproducible technical dependency or authority. |
| HackerAI shared conversation | REJECT | Same: non-canonical conversation, not evidence for runtime admission. |
| t.co/MjGVuGX615 | UNKNOWN_REJECT_UNTIL_RESOLVED | Redirect could not be resolved during audit. Unknown inputs do not enter BOQA. |

## Current admission result

```text
NEW_RUNTIME_DEPENDENCIES=0
NEW_AGENT_ORCHESTRATORS=0
NEW_MEMORY_SYSTEMS=0
NEW_BROWSER_FRAMEWORKS=0
NEW_PENTEST_SWARMS=0
NEW_TARGET_DISCOVERY_SOURCES=0
```

Methods worth incorporating into BOQA's own process:

1. independent verifier must be distinct from finder;
2. coverage/reachability ledgers should be machine-readable;
3. browser action candidates should be constrained by observed state and operation compatibility;
4. DONE/success must be independently verified;
5. benchmark candidates on exact tasks with latency/cost/protocol-call/evidence boundaries;
6. retain one deterministic authority plane and one canonical memory/evidence story.

## OpenShell post-release spike contract

Only after `v1.5.0` is sealed with `MAIN=TAG=PROD` and `BLOCKERS=NONE`, open a separate bounded spike:

`spike/openshell-execution-backend-v1`

Target architecture:

`CUORE → normalized authorized action → execution backend interface → DockerBackend | OpenShellBackend → evidence → BOQA verifier`

Hard invariants:

- `CUORE_AUTHORITY_UNCHANGED=YES`
- `HUMANGATE_UNCHANGED=YES`
- `CURRENT_DOCKER_BACKEND_UNCHANGED=YES`
- `OPENSHELL_OPTIONAL=YES`
- `NEW_DEFAULT_NETWORK_ACCESS=0`
- `RAW_CREDENTIAL_EXPOSURE=0`
- `POLICY_EXPANSION_REQUIRES_BOQA_AUTHORITY=YES`
- `OPENSHELL_ADVISOR_OUTPUT != AUTHORIZATION`

Any policy expansion must follow: denial/proposal → normalized capability delta → CUORE validation → HumanGate when authority expands → OpenShell policy prover → activation → evidence. The spike may compare filesystem surface, network surface, process privileges, credential exposure, reproducibility, evidence quality, and operational complexity on one identical controlled fixture. OpenShell events may supplement BOQA evidence but cannot serve as sole proof.

This triage is intentionally conservative. A future tool can move from WATCH/BENCHMARK to admission only when a concrete BOQA requirement cannot be satisfied simply by the existing lean kernel.
