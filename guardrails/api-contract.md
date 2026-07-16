# Frontend API Contract Expectations

The frontend expects the backend to expose stable, typed REST endpoints with predictable response envelopes.

## Response Envelope

```ts
type ApiSuccess<T> = {
  success: true;
  data: T;
  message?: string;
};

type ApiError = {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
};
```

## Required Endpoint Groups

Auth:

- `POST /auth/register`
- `POST /auth/login`
- `POST /auth/logout`
- `GET /auth/me`
- `POST /auth/verify-email`
- `POST /auth/forgot-password`
- `POST /auth/reset-password`

Users and businesses:

- `GET /users/me`
- `PATCH /users/me`
- `POST /businesses`
- `GET /businesses/me`
- `PATCH /businesses/:id`

Transactions:

- `POST /transactions`
- `GET /transactions`
- `GET /transactions/:id`
- `PATCH /transactions/:id`
- `GET /transaction-types`
- `POST /transactions/:id/invite`
- `POST /transactions/:id/accept`
- `POST /transactions/:id/approve-terms`
- `POST /transactions/:id/fund`
- `POST /transactions/:id/deliver`
- `POST /transactions/:id/confirm`
- `POST /transactions/:id/cancel`

Milestones and evidence:

Milestone endpoints are Phase 2. Phase 1 uses required evidence for domestic single-release transactions.

- `POST /transactions/:id/milestones`
- `PATCH /transactions/:id/milestones/:milestoneId`
- `POST /transactions/:id/evidence`
- `GET /transactions/:id/evidence`

Payments:

- `POST /transactions/:id/virtual-account`
- `GET /transactions/:id/payment-status`
- `POST /transactions/:id/request-release`
- `GET /transactions/:id/reconciliation-status`
- `POST /payments/webhook` style routes are backend-only and never called by frontend.

Disputes:

- `POST /transactions/:id/disputes`
- `GET /transactions/:id/disputes`
- `POST /disputes/:id/evidence`

Verification:

- `POST /verification/start`
- `GET /verification/status`
- `POST /verification/business`
- `POST /verification/individual`
- `POST /verification/:requestId/facial`
- `POST /verification/:requestId/documents`
- `POST /verification/:requestId/ownership`
- `POST /verification/:requestId/verify-code`
- `GET /verification/requests/:requestId`

Reputation:

- `GET /reputation/:profileId`
- `GET /reputation/me`

Admin:

- `GET /admin/transactions`
- `GET /admin/disputes`
- `PATCH /admin/disputes/:id`
- `GET /admin/verifications`
- `PATCH /admin/verifications/:id`

AI intelligence:

- `POST /ai/transactions/:id/risk-assessment`
- `POST /ai/transactions/:id/evidence-checklist`
- `POST /ai/disputes/:id/summary`
- `POST /ai/verifications/:id/summary`
- `POST /ai/reputation/:profileId/summary`
- `POST /ai/admin/cases/:id/copilot`
- `POST /ai/feedback`
