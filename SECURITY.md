# Security Policy

BOQA is a verification project with deliberately bounded authority.

## Reporting

Use GitHub private security reporting / Security Advisories when available. Do not publish exploitable details in a public issue before maintainer review.

Include the affected SHA, minimal reproduction, expected/observed behavior, impact, authorization context for external systems, and redacted evidence.

## Boundaries

- Discovery is not authorization.
- Model output does not grant authority.
- Ambiguous scope or policy fails closed.
- Network tests must use owned, fixture, isolated-lab, or explicitly authorized targets.
- Reproduction claims require independent evidence.
- HumanGate remains mandatory where policy or risk requires human authority.

## Secrets

Never commit API keys, tokens, cookies, session credentials, private keys, seed phrases, wallet/exchange credentials, production secrets, or private target/customer data.

If a secret is committed, rotate or revoke it; history rewriting alone is not remediation.
