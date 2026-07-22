# Frontend Architecture

> Updated to match the actual, shipped directory structure (verified against `src/` directly) —
> the original "Recommended Directory Structure" below described a from-scratch proposal
> (`src/app/`, `src/features/`, singular `src/lib/`) that isn't what was actually built.

## App Type

Single-page React app built with Vite and TypeScript.

## Actual Directory Structure

```text
src/
  assets/            naitrust-logo/, partners/, socials/, fonts/
  components/
    pages/           full page components (HomePage, AboutPage, DashboardPage, TransactionRoomPage, ...)
    pieces/          grouped by domain: auth/, business/, chat/, dashboard/, general/,
                     invitations/, registration/, security/, settings/, transaction/,
                     verification/, agreement/
    modals/          e.g. WaitlistModal.tsx
    ui/              shadcn/Radix-based primitives
    utility/         SEOHead, NaitrustLogo, etc.
  configs/
  hooks/             useTransactions, useDealDetail, useReputation, useTermination, useSecurity, ...
  interfaces/
  libs/
    api/             client.ts (fetch wrapper), config.ts, endpoints.ts, types.ts, and one
                     `<domain>.api.ts` per domain (auth, business, transactions, deal-detail,
                     deal-messages, agreements, negotiation, dispute, termination, invitations,
                     notifications, reputation, security, home)
    store/           Zustand stores (auth.store.ts, security.store.ts, business.store.ts)
    utils/           secure-storage.ts (Secure-cookie adapter), account.ts, safe-deal-presentation.ts, ...
    features/
    agent/
  mocks/
    apis/            JSON fixtures used when VITE_APP_MODE=mock
    screens/         per-page mock content
  pages/             thin route wrappers (SignupPage, DashboardPage, TransactionRoomPage, etc.)
                     that compose the real implementation from components/pages/
  services/          e.g. publicService.ts (waitlist/contact/subscribe/feedback/report-concern)
  styles/
  types/             global.ts and friends
```

Routing itself lives in `src/App.tsx` (not a separate `app/router.tsx`), including the page-name →
path map and the standalone-layout (no header/footer) route list.

## State Boundaries

- Server state: `@tanstack/react-query`.
- Client state: Zustand, persisted via a Secure-cookie adapter (`libs/utils/secure-storage.ts`) —
  never `localStorage` for sensitive data (tokens, user data).
- Form state: plain `useState` in practice (React Hook Form is a dependency but only wired into the
  base `ui/form.tsx` primitive, not used in real forms).
- URL state: route params and query params.
- Payment, verification, dispute, and transaction statuses: server only.

## Route Groups (see `src/App.tsx` for the authoritative list)

- Public marketing: `/`, `/about`, `/how-it-works`, `/use-cases(/:slug)`, `/blog(/:slug)`, `/help`,
  `/faqs`, `/contact`, `/report-concern`, `/feedback`, `/terms`, `/privacy`,
  `/verification-policy`, `/compliance`, `/business`, `/resources`. `/pricing` currently redirects
  to `/` — no dedicated pricing page exists yet.
- Auth (standalone layout, no header/footer): `/login`, `/register`, `/register-business`,
  `/register-customer`, `/forgot-password`, `/verify-code`, `/verify-email`.
- Authenticated app (behind `RequireAuth`, standalone layout): `/app`, `/app/deals`,
  `/app/deals/new`, `/app/drafts`, `/app/deals/:id` (transaction room), `/app/invitations(/:id)`,
  `/app/notifications`, `/app/profile`, `/app/settings`, `/app/security`.

No `/admin` routes exist in this frontend.

## API Client Pattern

Centralized in `src/libs/api/`: a single fetch-based `httpClient` (`client.ts`, not Axios) with
`get/post/put/patch/delete/upload`, shared `endpoints.ts`, shared `types.ts`, and one
`<domain>.api.ts` module per domain that wraps `httpClient` with typed inputs/outputs (see
`deal-messages.api.ts` as the reference pattern other modules follow). Errors are normalized via an
`apiError()` helper that always throws real `Error` instances (so `error instanceof Error` checks
across the app work), and 401s are handled centrally (clear Secure-cookie auth state, redirect to
`/login`).

## Component Boundaries

Domain-relevant components actually in use (non-exhaustive):

- Transaction Room pieces under `components/pieces/transaction/`, `agreement/`, `chat/`.
- `DashboardLayout`, `StatTiles`, `ActivityChart`, `DealBreakdown`, `PendingActions`,
  `TransactionList` under `components/pieces/dashboard/`.
- Verification/security pieces under `components/pieces/verification/`, `components/pieces/security/`.
- `WaitlistModal` / `openWaitlistModal()` under `components/modals/`.

UI primitives (shadcn/Radix) live in `components/ui/` — buttons, dialogs, popovers, dropdowns,
tabs, checkboxes, selects, forms, toasts (`sonner`), tooltips, etc.

`naitrust-web-old` is historical reference only, not an active source to copy from — the current
`components/ui/` is already the built-out primitive set.
