# BOQA v1.5.1 — Direct-origin isolation and authentication evidence

SCOPE=PR_71_ONLY
RUNTIME_STATUS=SOURCE_AND_ISOLATED_CI_ONLY
PRODUCTION_DIRECT_ORIGIN_ATTESTATION=PENDING
MERGE=NO
PRODUCTION_DEPLOY=NO
RELEASE=NO
APPLICATION_STATUS=HOLD

## Source policy after AUD NV-004

The route `GET /api/defensive/status` remains `INTERNAL` in `api-route-inventory.json`; `server.js` now applies `requireStrongProxyAuth` and the rate limiter before that handler, and removes it from the public API bypass. The direct-origin test opens an ephemeral **127.0.0.1** listener only, sends requests to the real Express application, and requires absent credentials to return 503, invalid HMAC/API key to return 401 and a valid signed/keyed request to pass.

The global protected `/api` middleware fails closed when `BOQA_API_KEY` or `BOQA_HMAC_SECRET` is unset; manual control has additional strong-auth checks. Public health/status endpoints retain their explicitly documented public-read status.

`compose.yaml` no longer publishes host ports. The service is attached exclusively to an `internal: true` Docker network and declares container port 7070 with `expose`, which does **not** publish to the host. CI parses the *resolved Compose JSON* using `scripts/check-origin-compose-isolation.js` and rejects any published host port, default/external network, unsafe network_mode, or unexpected second network. Tests include adversarial Compose models.

## Independent operator verification — still required for NV-001 and NV-004

Do **not** equate a passing source/Compose check with isolation of a running public backend. The production host, any Northflank ingress, load balancer, host-level firewall, independently configured Docker stacks, or DNS records are outside this repository. A Cloudflare Worker does not provide an origin firewall. The checked-in `wrangler.toml` has `BOQA_BACKEND_URL = ""`; this is a default, **not** verification of deployed Worker environment bindings or secrets.

Before claiming live isolation, an authorized operator must provide **sanitized** evidence of: actual production origin and ingress inventory (no exposed `80:7070` or equivalent), real container port bindings and network memberships, host-firewall/ingress policy, direct external unauthorized probe showing non-reachability or enforced authentication, HTTPS/authenticated Worker-to-origin transport and key rotation, and deployed Worker bindings/version from Cloudflare control plane. Never disclose addresses, credentials, tokens or signed authorization headers in public artifacts. If no origin exists and the Worker is intentionally unconfigured, record that fact using control-plane evidence; do not infer direct-origin isolation from preview behavior.

## Verification commands on a fully authorized local fixture

Use disposable fixture credentials, never production secrets:

```bash
node test/test-origin-direct-auth-boundary.js
BOQA_API_KEY=fixture-only-key BOQA_HMAC_SECRET=fixture-only-hmac \
  docker compose -f compose.yaml config --format json | node scripts/check-origin-compose-isolation.js
```

These checks do not scan targets or access production. NV-002 remains gated on an independently authorized future main/tag/production exact-identity seal. NV-003 is independently PASS per AUD; this document does not alter that adjudication.
