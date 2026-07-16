# Frontend UI Direction

## Design Goal

Naitrust should feel trustworthy, practical, and transaction-focused. It should not feel like a generic crypto, wallet, or flashy fintech app.

The UI must support both B2B and selected B2C protected transaction flows:

- B2B: business to business.
- B2C: individual customer to business/vendor/service provider.

B2C screens must still feel like protected transaction rooms with terms, evidence, funding status, release conditions, and dispute handling. Do not design B2C as a generic checkout, wallet, or marketplace purchase flow.

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
- Mock screen data belongs in `../src/mocks/screens/`, for example `../src/mocks/screens/homepage.ts`.
- Avoid one-color monotony.
- Avoid exaggerated gradients and decorative blobs.
- Use existing Naitrust logo assets from `../../naitrust-web-old/src/assets` as the source of truth.
- The current app copies the active brand assets into `../src/assets/`:
  - `../src/assets/naitrust-icon.png`
  - `../src/assets/naitrust-logo.png`
- Public pages must use the real Naitrust logo through `../src/components/PublicHeader.tsx`; do not replace it with a text-only placeholder or a generated mark.
- The home screen should feel like a funded product experience: strong navigation, real brand signal, transaction-room preview, proof points, trust workflow, use cases, and clear calls to action.

## Key UI Objects

- Safe deal card.
- Party mode selector: B2B or B2C.
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

First viewport should clearly say Naitrust is for safe high-value transactions, not only business verification.

Suggested headline:

> When the transaction matters, use Naitrust.

Suggested supporting copy:

> Create safe deals, agree terms, protect payments through regulated partners, and keep evidence in one transaction room.

### Dashboard

Prioritize:

- active transactions.
- pending actions.
- payment statuses.
- disputes needing response.
- verification progress.
- reputation score.

### Transaction Room

This is the most important screen.

Required panels:

- overview.
- parties.
- party mode and roles.
- terms.
- virtual account funding status.
- evidence requirements.
- evidence.
- activity.
- dispute controls.

### Informal Safe Deal Link

Must be lightweight and mobile-first.

Use simple language:

- Create safe deal.
- Buyer pays.
- Seller delivers.
- Confirm delivery.
- Release payment.
- Report issue.

## Accessibility

- All interactive controls must be keyboard accessible.
- Use semantic buttons and links.
- Use visible focus states.
- Use accessible labels for icon-only buttons.
- Do not rely on color alone for status.
