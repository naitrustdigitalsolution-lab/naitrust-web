# Frontend Workflow

## Core User Flow

1. User signs up or logs in.
2. User completes basic identity or business onboarding.
3. User completes the verification required by the deal risk level.
4. User chooses B2B or B2C party mode.
5. User creates a safe deal.
6. User invites counterparty by email, phone, or shareable link.
7. Counterparty accepts invitation and completes required verification.
8. Both parties review and agree terms.
9. Agreement is frozen.
10. Backend issues a Korapay virtual account or collection account for the transaction.
11. Buyer/customer funds the partner-issued virtual account.
12. Transaction room shows partner funding status.
13. Seller/vendor/service provider uploads required delivery evidence.
14. Buyer/customer reviews evidence and confirms completion, or the auto-confirm window elapses.
15. Release is requested through backend/partner.
16. Both parties receive completion record and reputation update.

## Party Mode UX

The create-deal flow must support:

- B2B: business buyer to supplier, contractor, wholesaler, vendor, agent, or service provider.
- B2C: individual customer to business/vendor/service provider.

B2C must still feel like a protected transaction room, not a wallet or checkout button. It must include terms, evidence, payment status, delivery confirmation, dispute action, and reputation.

## Transaction Room UX

The transaction room is the heart of the product.

It must show:

- transaction title and parties.
- party mode: B2B or B2C.
- amount and currency.
- current status.
- virtual account funding status.
- evidence requirements.
- evidence files.
- chat or comments if enabled.
- dispute action.
- activity timeline.
- final approval/release action.

## Main Statuses

Transaction status:

- draft
- pending_counterparty
- terms_negotiation
- terms_agreed
- awaiting_funding
- funded
- in_progress
- evidence_submitted
- buyer_review
- release_approved
- paid_out
- completed
- disputed
- refunded
- cancelled

Payment status:

- not_started
- virtual_account_issued
- awaiting_funding
- payment_confirmed_by_partner
- release_requested
- released
- refunded
- failed

Verification status:

- not_started
- pending
- verified
- rejected
- needs_more_info

Dispute status:

- none
- opened
- evidence_requested
- under_review
- resolved_release
- resolved_refund
- resolved_split
- closed

## Informal User Flow

For Instagram, WhatsApp, and market sellers:

1. Seller taps "Create safe deal."
2. Seller enters item/service, amount, delivery date, and buyer contact.
3. Naitrust creates a shareable deal link.
4. Buyer opens link and sees simple terms.
5. Buyer pays through partner.
6. Seller delivers and uploads proof.
7. Buyer confirms.
8. Payment release is requested.

Keep this version very simple. Avoid legal-heavy labels in the UI.
