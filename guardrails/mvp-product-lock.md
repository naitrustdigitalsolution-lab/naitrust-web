# Naitrust MVP Product Lock

## Decision

The frontend feature scope is locked for backend implementation after the flows listed here are verified. Do not add another product category until the backend supports the core transaction loops and real users have tested them.

## Product promise

Naitrust helps a person or business verify who they are dealing with, move everyday money, and use a shared Protected Deal when payment depends on delivery or completed work.

## Locked customer loops

1. Register, verify identity, set a transaction PIN, and access an individual or business account.
2. Find a verified business, view its public Trust Profile, and start a payment or Protected Deal.
3. Send or receive an everyday payment using an account number, payment link, QR code, email, SMS, or WhatsApp sharing.
4. Create, accept, fund, follow, complete, dispute, or release a Protected Deal.
5. Confirm physical delivery using the seller delivery card, buyer QR/OTP receipt, ten-minute handover review, and default or extended funding-review period.
6. Save and resume incomplete deals from Drafts.

## Locked business-retention features

- Business Trust Profile and verified directory presence.
- Payment requests and shareable Trust Checkout links.
- Customer and supplier relationship workspaces with contact history and reports.
- Transaction history, notifications, and support conversation.

The frontend Bills prototype remains in the repository but is dormant and excluded from navigation. Do not re-enable or extend it without an explicit product instruction.

## Explicitly outside this MVP

- Rider accounts, logistics integrations, or courier tracking.
- Full bookkeeping, stock management, payroll, tax filing, lending, cards, POS hardware, or multi-user approval workflows.
- Utility-provider catalogues, airtime/data purchases, or automatic bill payment.
- AI decisions, automated dispute rulings, or AI-generated production agreements.
- Native mobile implementation.

## Backend handoff priorities

Build backend capability in this order:

1. Authentication, sessions, account roles, business ownership, verification, and transaction-PIN enforcement.
2. Business accounts, partner-issued payment accounts, transfers, webhooks, idempotency, reconciliation, and immutable ledger records.
3. Protected Deal creation, invitations, agreements, funding, evidence, delivery-card lifecycle, countdown deadlines, disputes, and release.
4. Durable drafts with agreement-version recovery.
5. Notifications and invitation delivery across email and SMS, plus WhatsApp-ready share links.
6. Public Trust Profiles, review eligibility, directory search, filtering, sorting, and pagination.
7. Customer and supplier records, relationship activity, and downloadable reports.
8. Audit logs, rate limits, observability, support tooling, data retention, and operational reconciliation.

## Backend contract gaps represented by frontend mocks

- Deal drafts: list, create/update, read, and delete.
- Customer and supplier records: list, create, detail, favourite/block state, completed activity, and report data.
- Business directory: `q`, `category`, `state`, `minimumRating`, `sort`, and cursor pagination.
- Trust Checkout and payment requests.
- Delivery card, receipt confirmation, handover review, and funding-review timestamps.

Browser storage and mock fixtures demonstrate expected behavior only. They are not authoritative records and must not be treated as production enforcement.

## Launch gate

The MVP is not market-ready merely because these screens exist. Before public financial use, the backend must prove payment reconciliation, authorization, idempotency, access control, dispute freezes, countdown recovery, notification delivery, auditability, and failure handling. After that, test the four core activation events with pilot businesses: receive a payment, share a Trust Profile, complete a Protected Deal, and return to manage a customer or supplier.
