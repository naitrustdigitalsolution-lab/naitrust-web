# Frontend UI Direction

## Design Goal

Naitrust should feel trustworthy, practical, and transaction-focused. It should not feel like a generic crypto, wallet, or flashy fintech app.

The UI must support both individual and business counterparties on each side of a property
transaction (see `futureidea.md` — "Approved Platform Focus"): individual buyers/tenants/diaspora
buyers on one side; individual sellers/landlords, agents, developers, or contractors on the other.

Individual-counterparty screens must still feel like protected property-transaction rooms with
terms, evidence, funding status, release conditions, and dispute handling — never a generic
checkout, wallet, or marketplace purchase flow.

The interface should help users answer:

- Who am I dealing with?
- What did we agree?
- Where is the payment?
- What evidence has been submitted?
- What happens next?
- What do I do if there is a problem?

## Visual Style

- Clean, modern, business-focused.
- Clear hierarchy and dense but readable dashboards.
- Strong status signals.
- Use the Naitrust brand palette from the old codebase:
  - Primary blue: `#1e90ff`.
  - Secondary/navy: `#0b2b45`.
  - Muted surface: `#f4f7fb`.
  - Border tint: `#1e90ff33`.
- Calm color use with purposeful accents.
- Do not make the app green-led. Green may appear only as a small success/status accent when needed.
- Tailwind CSS is the required styling system for the frontend.
- Use Tailwind utility classes directly in page/components for layout, spacing, typography, colors, and dark-mode variants.
- Keep custom CSS in `../src/styles/index.css` only for complex branded visuals, product mockups, and reusable shared component styles.
- Dark theme must be supported with the document-level `dark` class and should change on the fly from the public header.
- Mock screen data belongs in `../src/mocks/screens/` (e.g. `blog.ts`) and mock API fixtures in `../src/mocks/apis/` (businesses, transactions, invitations, notifications, reputation, deal-drafts) — used when `VITE_APP_MODE=mock`.
- Avoid one-color monotony.
- Avoid exaggerated gradients and decorative blobs.
- Naitrust logo assets live in `../src/assets/` (multiple variants: `naitrust-logo.png`, `naitrust-logo-white.png`, `naitrust-logo-dark.png`, `naitrust-icon.png`, etc., also duplicated under `../src/assets/naitrust-logo/`) — these are the current source of truth, not `naitrust-web-old`.
- Public pages must use the real Naitrust logo (`NaitrustLogo` component, `../src/components/utility/NaitrustLogo.tsx`) through the public header (`../src/components/pieces/general/Header.tsx`); do not replace it with a text-only placeholder or a generated mark.
- The home screen should feel like a funded product experience: strong navigation, real brand signal, transaction-room preview, proof points, trust workflow, use cases, and clear calls to action.

## Key UI Objects

- Safe deal (property transaction) card.
- Individual/business account type selector.
- Transaction room.
- Counterparty trust panel.
- Virtual account funding panel.
- Evidence requirements timeline.
- Evidence gallery.
- Activity log.
- Dispute case panel.
- Reputation summary.
- Verification checklist.

## Important Screens

### Home

First viewport should clearly say Naitrust is for safe property transactions, not only business
verification, while staying marketable to real estate specifically at a glance.

Current headline (`src/components/pages/HomePage.tsx` / `AnimatedHeroText.tsx`):

> Hero badge: "The Trust Layer for Nigerian Property Transactions"

Current supporting copy:

> "Property transactions involve large payments, multiple parties, scattered documents, and too
> much uncertainty. Naitrust doesn't just record the deal — it protects your payment and sees it
> through to completion."

### Dashboard

Current implementation (`src/components/pages/DashboardPage.tsx`) shows, in order: greeting with
account-type/verified/liveness badges, security reminders, stat tiles (deal counts + reputation),
an activity chart and deal breakdown, pending actions needing response, and the recent property
transaction list. Conceptually still matches:

- active transactions.
- pending actions.
- payment/verification status signals.
- reputation score.

Disputes are surfaced through pending actions / the transaction list rather than a dedicated
dashboard-level dispute panel.

### Transaction Room

This is the most important screen (`src/components/pages/TransactionRoomPage.tsx`). Current tabs:

- Overview — parties, party mode/roles, amount, status.
- Negotiations — terms discussion and agreement.
- Tracking — virtual account funding status.
- Evidence — evidence requirements and uploads.
- Chat — messages between parties.
- Activity — activity log.
- Dispute — dispute controls.
- Termination — ending a transaction outside the normal completion flow.

### Informal Agent/Landlord Flow (Phase 3)

Still property-only (see `futureidea.md`) — this is a lighter-weight version of the same
transaction flow for informal agents and small landlords, not a general-purpose "sell anything"
link. Must be lightweight and mobile-first.

Use simple language:

- Create property transaction.
- Buyer/tenant pays.
- Agent/landlord confirms handover or viewing.
- Confirm delivery.
- Release payment.
- Report issue.

## Accessibility

- All interactive controls must be keyboard accessible.
- Use semantic buttons and links.
- Use visible focus states.
- Use accessible labels for icon-only buttons.
- Do not rely on color alone for status.
