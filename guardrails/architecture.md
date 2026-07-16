# Frontend Architecture

## App Type

Single-page React app built with Vite and TypeScript.

## Recommended Directory Structure

```text
src/
  app/
    router.tsx
    providers.tsx
    layouts/
  assets/
  components/
    ui/
    domain/
    forms/
    layout/
  features/
    auth/
    onboarding/
    transactions/
    verification/
    payments/
    evidence/
    disputes/
    reputation/
    admin/
  hooks/
  lib/
    api/
    schemas/
    store/
    utils/
  pages/
  styles/
  types/
```

## State Boundaries

- Server state: React Query.
- Client state: Zustand.
- Form state: React Hook Form.
- URL state: route params and query params.
- Payment, verification, dispute, and transaction statuses: server only.

## Route Groups

- `/` public landing.
- `/how-it-works` public education.
- `/pricing` public pricing.
- `/login` auth.
- `/register` auth.
- `/invite/:token` accept safe-deal invitation.
- `/app` authenticated user dashboard.
- `/app/transactions` transaction list.
- `/app/transactions/new` create safe deal.
- `/app/transactions/:id` transaction room.
- `/app/verification` user/business verification.
- `/app/reputation/:profileId` reputation profile.
- `/admin` admin dashboard.
- `/admin/disputes` dispute queue.
- `/admin/verifications` verification queue.
- `/admin/transactions` transaction monitoring.

## API Client Pattern

Centralize API access in `src/lib/api`.

Every API module should:

- import from one shared HTTP client.
- export typed methods.
- accept typed inputs.
- return typed outputs.
- normalize backend errors.

Example modules:

- `auth.api.ts`
- `transactions.api.ts`
- `evidence.api.ts`
- `payments.api.ts`
- `verification.api.ts`
- `disputes.api.ts`
- `reputation.api.ts`
- `admin.api.ts`

## Component Boundaries

Domain components:

- `TransactionStatusBadge`
- `PaymentPartnerBadge`
- `EvidenceRequirementsTimeline`
- `EvidenceUploader`
- `DisputePanel`
- `VerificationLevelBadge`
- `ReputationSummary`
- `SafeDealProgress`

UI primitives:

- buttons
- dialogs
- dropdowns
- tabs
- tables
- forms
- toasts
- tooltips

Reuse UI primitives from `../../naitrust-web-old/src/components/ui` when compatible.
