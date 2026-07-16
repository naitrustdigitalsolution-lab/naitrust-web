# Frontend Pre-Build Checklist

Before writing app code, confirm these decisions.

## Product Scope

- First screen is the usable Naitrust product experience, not a marketing-only landing page.
- MVP starts with safe deals, transaction rooms, verification, evidence, protected payment status, disputes, and reputation.
- MVP supports B2B and selected B2C protected transaction flows.
- B2C means individual customer to business/vendor/service provider; it does not mean broad consumer payments.
- Do not build broad financial-app features first: wallet, savings, cards, loans, investments, crypto, or generic consumer payments.

## User Roles

- buyer.
- customer.
- seller/service provider.
- vendor.
- business owner.
- business team member.
- informal seller.
- admin.
- super admin.

## Required Frontend Foundations

- React/Vite/TypeScript app scaffold.
- Tailwind and Radix UI primitives.
- Router groups for public, auth, app, business, and admin.
- Typed API client.
- React Query provider.
- Zustand store only for client state.
- Auth/session handling.
- Toasts and error boundary.
- SignalR client for live updates.
- Form validation with Zod and React Hook Form.

## Product Flows To Scaffold First

- registration/login.
- business onboarding.
- reusable verification status.
- fresh liveness flow.
- create safe deal.
- accept invitation.
- transaction room.
- evidence upload.
- payment partner status.
- dispute open/respond.
- reputation profile.
- admin review screens.

## UI Acceptance Rules

- Every screen has loading, empty, error, and success states.
- Every major action is disabled while submitting.
- The UI never claims Naitrust holds money directly.
- The UI explains when fresh liveness is required without making the user redo full verification.
- AI outputs are labeled as suggestions and never hide source evidence.
