# Naitrust Protected Payment Guardrails

These guardrails are the current product and implementation source of truth for `naitrust-web`.

Read [product-guardrails.md](./product-guardrails.md) before changing authentication, Protected Deals, money movement, evidence, disputes, refunds or payment-release behaviour.

Read [seo/search-language-and-feature-claims.md](./seo/search-language-and-feature-claims.md) before adding SEO keywords, search landing pages, structured data, AI discovery content, or public feature claims.

When code and this document disagree, stop and resolve the conflict deliberately. Do not silently weaken a financial or identity control to make a flow easier to complete.

The current product direction is protected-payment fintech: Nigerian individuals and businesses can define terms, verify participants, protect funds through regulated partners and approve release through a shared Deal Room.

Authenticated mock data must be isolated by account. Global local-storage keys are prohibited for deals, invitations, balances, payment events, evidence, messages or any other private fixture.
