# Frontend API Contract Expectations

> Rewritten to match the real backend contract already implemented in the frontend
> (`src/libs/api/endpoints.ts`, `src/libs/api/backend-api.ts`, `src/libs/api/client.ts`) — the
> previous version of this doc described an aspirational `{success,data,error}` REST contract that
> does not match the actual .NET backend. `backend-api.ts` is the authoritative, fully-worked-out
> reference (full request/response examples); this file is a short index into it.

## Response Envelope (confirmed against the live staging API)

Every endpoint — public and authenticated alike — returns the backend's `NaitrustResponse<T>` shape:

```ts
type NaitrustResponse<T> = {
  statusCode: number;   // HTTP status echoed in the body
  message: string;      // human-readable message
  data: T | null;
  isSuccessful: boolean; // mirrors 2xx vs 4xx/5xx
};
```

This replaces the old assumed `{success, data, error}` shape everywhere in the app —
`src/libs/api/client.ts` throws real `Error` instances built from `message` on failure
(`apiError()` helper), so `error instanceof Error ? error.message : fallback` checks across the
app surface the backend's actual message text.

## Endpoint Groups (see `src/libs/api/endpoints.ts` for the exact paths, `backend-api.ts` for full examples)

Auth (`/auth/*`): register, login, login/verify-2fa, logout, profile (get/update),
verify-email, resend-verification-otp, forgot-password, verify-otp, reset-password,
change-password.

Security (`/security/*`): email/phone OTP send+verify, 2FA start/verify, KYC submission,
transaction PIN set/verify.

Businesses (`/businesses*`): create, update (`PUT /businesses/:id`), list mine
(`GET /businesses/my/businesses`).

Transactions (`/transactions*`) — the core resource, called "property transaction" / "safe deal"
in the UI: create, list mine, get one, chat messages, tracking (advance/insert/edit/revert),
termination (request/respond).

Agreements: `POST /agreements/draft` — AI-assisted agreement drafting, advisory only.

Disputes: `GET/POST /transactions/:id/dispute`, `POST /transactions/:id/dispute/messages`.

Negotiations: `GET /transactions/:id/negotiation`, propose/respond/withdraw.

Invitations (`/invitations*`): list, get one, accept, decline.

Notifications (`/notifications*`): list, mark one read, mark all read.

Reputation: `GET /reputation/me`.

Upload: `POST /upload/verification-document`.

Public (no auth, `/Public/*`, PascalCase to match the .NET controller — confirmed live):
`joinWaitlist`, `contactUs`, `subscribe`, `submitFeedback`, `reportConcern`.

## Not implemented / not confirmed

- **Admin endpoints** — no admin app exists in this frontend; there is no confirmed `/admin/*`
  contract.
- **AI intelligence endpoints** (risk-assessment, evidence-checklist, dispute/verification/
  reputation summaries, admin copilot) — aspirational, not wired into any current UI. Treat as
  future work, not a current contract.
- **Milestone-specific endpoints** — the shipped model uses transaction "tracking" steps
  (`/transactions/:id/tracking*`), not a separate milestones resource.
