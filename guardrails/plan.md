# Frontend Plan

> Status: the app described below is largely already built (see `src/App.tsx` for the real route
> list). This doc originally described a from-scratch build plan for a generic SME B2B/B2C
> transaction platform; it's been reconciled here with the current, shipped real-estate-only
> product. Treat "Build Order" as historical/reference, not a to-do list.

## Product Goal

Build the customer-facing web app for Naitrust: trust infrastructure for Nigerian property
transactions, helping property buyers, sellers, agents, developers, and companies complete
domestic high-value real estate deals safely (see `futureidea.md` for full positioning).

The frontend supports both individual and business counterparties on each side of a property
transaction (not generic B2B/B2C — every transaction has a property at its center):

- Buying side: individual buyers, tenants/renters, diaspora buyers.
- Selling/facilitating side: individual sellers/landlords, real estate agents, property developers,
  property contractors.

This must not turn the product into a broad wallet, generic payment app, or marketplace/listings
site. The flow remains a protected property transaction: agree terms, fund through Anchor (the
regulated payment partner), track evidence, confirm delivery/milestone, and resolve disputes.

Core promise (as shipped on the homepage):

> "Naitrust doesn't just record the deal — it protects your payment and sees it through to
> completion."

## Current Screens (as shipped)

### Public (see `src/App.tsx` for the authoritative route list)

- Home, About, How It Works, Real Estate/Use Cases (+ per-use-case slug pages), Blog (+ slug pages).
- Help Center, FAQs, Contact Us, Report a Concern, Give Feedback.
- Legal: Terms, Privacy, Verification Policy, NDPR Compliance.
- Login, Registration (chooser → business/customer forms; gated behind the waitlist while
  pre-launch — see below), Forgot Password, Verify Code, Verify Email.
- `/business`, `/resources` (simple content routes). `/pricing` currently redirects home — there is
  no dedicated pricing page yet.

### Authenticated (`/app/*`, behind `RequireAuth`)

- Dashboard (`/app`) — greeting, security reminders, stat tiles, activity chart, deal breakdown,
  pending actions, recent property transactions.
- Deals list (`/app/deals`), create deal (`/app/deals/new`), drafts (`/app/drafts`).
- Transaction Room (`/app/deals/:id`) — Overview, Negotiations, Tracking, Evidence, Chat, Activity,
  Dispute, Termination tabs.
- Invitations (`/app/invitations`, `/app/invitations/:id`), Notifications, Profile, Settings,
  Security Center.

### Pre-launch state

Registration currently does not complete — the `RegistrationPage` form renders normally so people
can see what's needed, but its Continue/submit action opens the waitlist modal instead
(`REGISTRATION_OPEN` flag in `RegistrationPage.tsx`). Every "early access" CTA site-wide should call
`openWaitlistModal()` (from `src/components/modals/WaitlistModal.tsx`), not navigate to a live
signup flow.

### Not yet built

- No admin app/dashboard exists in this frontend.
- No public reputation profile page yet.
- No dedicated pricing page yet.

## User Stories (still accurate)

- As a buyer/tenant, I can create a property transaction with amount, counterparty, deliverables,
  and release conditions.
- As a seller/agent/developer, I can accept a transaction invitation and confirm the terms.
- As either party, I can upload evidence such as agreements, receipts, property documents,
  inspection photos, or milestone proof.
- As either party, I can see the payment status without Naitrust claiming to hold funds directly.
- As a buyer/tenant, I can approve delivery/milestones and trigger release through Anchor.
- As either party, I can raise a dispute and attach evidence.
- As a user or business, I can build a reputation from completed property transactions.
- As an individual, I can verify my identity with email/phone, ID details, and facial verification
  where risk requires it.
- As a business owner, I can verify a business with CAC details, owner/director identity, ownership
  proof, and document fallback.

## Non-Negotiables

- Do not market Naitrust as a bank, wallet, or escrow provider — "escrow" may appear only as an SEO
  tag ("escrow alternative"), never as a description of what Naitrust is (it does not custody
  funds).
- Use "protected payments through a regulated partner (Anchor)" language, not "Naitrust holds funds."
- Naitrust is real-estate-only today (see `futureidea.md`) — do not add non-property verticals or a
  general marketplace/listings feature.
- Keep informal-agent/landlord flows Phase 3, still property-scoped, not a generic "sell anything"
  link.
- Make transaction status clear at all times; use server-provided status as source of truth for
  payments, verification, and disputes.
- Registration stays waitlist-gated until the product is actually live — see "Pre-launch state"
  above.
