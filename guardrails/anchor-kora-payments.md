# Anchor + Kora Frontend Payment Guardrail

The canonical dual-provider and settlement rules are in `../../naitrust-api/guardrails/anchor-kora-payments.md`.

Frontend requirements:

- Anchor supports the enabled banking-as-a-service account, transfer, and verification experience.
- Kora is future-only. Do not render debit-card checkout or describe Kora as an active partner until commercial and production approval is recorded.
- Launch payment links offer Anchor-backed bank transfer only.
- Never collect or store PAN, CVV, PIN, OTP, or provider secret keys in web/mobile code.
- Payment links render server-backed recipient, amount, purpose, and expiry; URL parameters alone are not authoritative.
- Browser checkout completion is only `processing`; only the backend may mark a charge paid after verified webhook and provider query.
- Show `paid`, `settlement pending`, `available`, and `paid out` as different states.
- Never show a Kora collection as Anchor account balance before a confirmed and reconciled payout to Anchor.
- Protected Deal card proceeds are not released merely because checkout succeeds.

Official references:

- https://docs.getanchor.co/docs/developer-onboarding-to-anchor-api
- https://docs.getanchor.co/docs/card-payments
- https://developers.korapay.com/docs/checkout-standard
- https://developers.korapay.com/docs/get-settled
- https://developers.korapay.com/docs/webhooks
