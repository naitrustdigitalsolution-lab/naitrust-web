# Frontend Plan

## Product Goal

Build the customer-facing web app for Naitrust: a trusted transaction platform for Nigerian SMEs and selected customer-to-business use cases completing domestic high-value transactions safely.

The frontend must support both:

- B2B protected transactions: business to business, such as SME to supplier, contractor, distributor, wholesaler, vendor, or agent.
- B2C protected transactions: individual customer to business/vendor/service provider, such as customer to event vendor, renter to agent, or buyer to verified high-value seller.

B2C support must not turn the product into a broad wallet, generic payment app, or marketplace. The flow remains a safe deal: agree terms, fund through a regulated partner, track evidence, confirm delivery, and resolve disputes.

The frontend should make the core promise obvious:

> Create a safe deal, agree terms, protect payment through a regulated partner, track evidence, and complete the transaction.

## MVP Screens

### Public

- Home page focused on "When the transaction matters, use Naitrust."
- How it works.
- Pricing.
- Login.
- Registration.
- Accept transaction invitation.
- Public reputation profile.
- Legal pages: terms, privacy, protected payment disclaimer.

### Authenticated User

- User dashboard.
- Create safe deal.
- Transaction room.
- Deal invitations.
- Required evidence upload.
- Virtual account funding details.
- Payment status view.
- Dispute view.
- Notifications.
- Profile and verification status.

### Business User

- Business onboarding.
- Business verification with CAC, ownership proof, documents, and facial verification where required.
- Business dashboard.
- Team members.
- Transaction history.
- Reputation profile.
- Customer/supplier directory.

### Admin

- Admin dashboard.
- User and business review.
- Transaction monitoring.
- Dispute case management.
- Verification queue.
- Support inbox.
- Risk and fraud signals.

## MVP User Stories

- As a buyer, I can create a transaction with amount, counterparty, deliverables, and release conditions.
- As a seller, I can accept a transaction invitation and confirm the terms.
- As an individual customer, I can create or join a B2C safe deal with a verified vendor or service provider.
- As a vendor or service provider, I can complete B2C safe deals and build reputation from successful delivery.
- As either party, I can upload evidence such as invoice, photos, waybill, inspection report, or delivery proof.
- As either party, I can see the payment status without Naitrust claiming to hold funds directly.
- As a buyer, I can approve delivery and trigger release through the regulated partner.
- As either party, I can raise a dispute and attach evidence.
- As a business, I can build a reputation from completed safe deals.
- As an individual, I can verify my identity with email/phone, ID details, and facial verification where risk requires it.
- As a business owner, I can verify a business with CAC details, owner/director identity, ownership proof, and document fallback.
- As an admin, I can review risky users, transactions, disputes, and verification requests.

## Build Order

1. Scaffold the frontend using React, Vite, TypeScript, Tailwind, Radix UI, lucide-react, React Router, React Query, Zustand, and Zod.
2. Copy only required brand assets and base UI primitives from `../../naitrust-web-old`.
3. Create app shell: auth layout, public layout, dashboard layout, admin layout.
4. Implement route structure and placeholder screens.
5. Implement typed API client and shared response/error handling.
6. Build domestic single-release transaction creation flow for B2B and selected B2C party modes.
7. Build transaction room with frozen agreement, virtual account funding status, evidence requirements, and auto-confirm window.
8. Build verification and onboarding flows.
9. Build individual, business, facial, and manual-review verification screens.
10. Build payment partner status screens.
11. Build evidence and dispute flows.
12. Build reputation profile.
13. Add responsive polish, empty states, loading states, and error states.
14. Add tests for critical form logic and route guards.
15. Add AI-assisted deal drafting, evidence checklist, risk explanation, and admin summary UI after backend AI assessments exist.

## Non-Negotiables

- Do not market Naitrust as a bank or wallet.
- Do not say Naitrust holds user funds unless backend/legal docs prove that licensed approval exists.
- Use "protected funding through regulated partners" and "partner-issued virtual account" language.
- Keep informal-user flows out of Phase 1 unless explicitly approved.
- Do not treat B2C as broad consumer payments; only build B2C as protected transaction rooms with terms, evidence, and release conditions.
- Make transaction status clear at all times.
- Use server-provided status as source of truth for payments, verification, and disputes.
