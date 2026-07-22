# Frontend Pre-Build Checklist

> Status: historical. Written before the app existed; the frontend is now built (see `src/App.tsx`
> for real routes, `plan.md` for current screens). Kept as reference for the original decisions,
> corrected below where reality diverged.

## Product Scope

- The public site is currently a **pre-launch marketing site funneling to a waitlist**, not the
  usable product experience — registration doesn't complete yet (`REGISTRATION_OPEN = false` in
  `RegistrationPage.tsx`). This is a deliberate current-stage decision, not the original plan.
- The product itself covers property transactions, transaction rooms, verification, evidence,
  protected payment status, disputes, and reputation.
- The product supports individual and business counterparties on each side of a property
  transaction (real-estate-only — see `futureidea.md`), not generic B2B/B2C vendor commerce.
- No broad financial-app features exist: no wallet, savings, cards, loans, investments, or crypto.

## User Roles (as implemented)

- individual buyer/tenant/diaspora buyer.
- individual seller/landlord.
- real estate agent.
- property developer.
- property contractor.
- business account (any of the above operating as a registered business).
- business team member.

No admin/super-admin role exists in this frontend yet.

## Frontend Foundations (as implemented)

- React/Vite/TypeScript app.
- Tailwind CSS v4 and Radix UI primitives.
- Router groups: public, auth (`/login`, `/register*`, etc.), authenticated app (`/app/*`).
- Typed fetch-based API client (`src/libs/api/client.ts`), not Axios.
- `@tanstack/react-query` for server state.
- Zustand (with a Secure-cookie persist adapter) for client state — never `localStorage` for
  sensitive data.
- Auth/session handling via `RequireAuth` + cookie-backed auth store.
- Toasts (`sonner`).
- No SignalR/realtime client — data refresh currently relies on React Query refetching.
- No Zod/React Hook Form in real forms — plain `useState` is the actual pattern used
  (see `WaitlistModal.tsx`, `RegistrationPage.tsx`).

## UI Acceptance Rules

- Every screen has loading, empty, error, and success states.
- Every major action is disabled while submitting.
- The UI never claims Naitrust holds money directly — payments run through Anchor.
- The UI explains when fresh liveness is required without making the user redo full verification.
- AI outputs are labeled as suggestions and never hide source evidence.
