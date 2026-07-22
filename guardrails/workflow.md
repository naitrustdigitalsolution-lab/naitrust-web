# Frontend Workflow

## Core User Flow

1. User signs up or logs in.
2. User completes basic identity or business onboarding.
3. User completes the verification required by the transaction's risk level.
4. User chooses individual or business account type.
5. User creates a property transaction (on-app: "New property transaction").
6. User invites the counterparty by email, phone, or shareable link.
7. Counterparty accepts the invitation and completes required verification.
8. Both parties review and agree terms (Transaction Room → Negotiations).
9. Agreement is frozen.
10. Backend issues an Anchor virtual account for the transaction.
11. Buyer/tenant funds the partner-issued virtual account.
12. Transaction room (Tracking tab) shows partner funding status.
13. Seller/agent/developer/contractor uploads required delivery/milestone evidence.
14. Buyer/tenant reviews evidence and confirms completion, or the auto-confirm window elapses.
15. Release is requested through backend/partner.
16. Both parties receive a completion record and reputation update.

## Party Mode UX

The create-transaction flow must support both individual and business counterparties on each side
(see `futureidea.md` — "Approved Platform Focus"):

- Buying side: individual buyers, tenants/renters, diaspora buyers.
- Selling/facilitating side: individual sellers/landlords, real estate agents, property developers,
  property contractors.

Every flow — whether the counterparty is an individual or a business — must still feel like a
protected property-transaction room, not a wallet or checkout button. It must include terms,
evidence, payment status, delivery/milestone confirmation, dispute action, and reputation.

## Transaction Room UX

The transaction room is the heart of the product. The current implementation
(`src/components/pages/TransactionRoomPage.tsx`) organizes it into tabs:

- **Overview** — transaction title, parties, party mode, amount/currency, current status.
- **Negotiations** — terms discussion and agreement.
- **Tracking** — virtual account funding status and payment progress.
- **Evidence** — required and submitted evidence files.
- **Chat** — messages between parties.
- **Activity** — activity timeline.
- **Dispute** — dispute action and case detail.
- **Termination** — ending a transaction outside the normal completion flow.

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

## Informal Agent/Landlord Flow (Phase 3, still property-scoped)

Naitrust is real-estate-only (see `futureidea.md` — "Approved Platform Focus"). There is no
general-item or non-property "safe deal" flow. The lighter-weight flow for Phase 3 (informal
agents, small landlords) is the same property-transaction flow above, simplified:

1. Agent/landlord taps "Create property transaction."
2. Agent/landlord enters the property, amount, timeline, and buyer/tenant contact.
3. Naitrust creates a shareable transaction link.
4. Buyer/tenant opens the link and sees simple terms.
5. Buyer/tenant pays through the partner (Anchor).
6. Agent/landlord confirms handover/viewing and uploads proof.
7. Buyer/tenant confirms.
8. Payment release is requested.

Keep this version very simple. Avoid legal-heavy labels in the UI, but never drop the property
context — every transaction still has a named property at its center.
