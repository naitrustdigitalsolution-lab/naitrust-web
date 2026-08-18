# Naitrust Web Guardrails

These guardrails are the current product and implementation source of truth for `naitrust-web`.

Read [product-guardrails.md](./product-guardrails.md) before changing marketplace discovery, carts, quotes, orders, agents, authentication, Protected Deals, money movement, delivery, evidence, disputes, or payment-release behaviour.

Read [seo/search-language-and-feature-claims.md](./seo/search-language-and-feature-claims.md) before adding SEO keywords, search landing pages, structured data, AI discovery content, or public feature claims.

When code and this document disagree, stop and resolve the conflict deliberately. Do not silently weaken a financial or identity control to make a flow easier to complete.

The current product direction is protected commerce: Nigerian individuals and businesses can source from China or Nigeria, receive a confirmed landed-cost quote, pay through a protected order, and track delivery. Business accounts can use the complete buying journey and can also publish a showcase and sell.

Authenticated mock data must be isolated by account. Global local-storage keys are prohibited for carts, quotes, orders, agent tasks, seller products, messages, or any other private fixture.
