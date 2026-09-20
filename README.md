# Naitrust Web

Naitrust is building protected payments for Nigerian individuals and businesses. Buyers and sellers agree on terms, verify the required details, fund a deal through a payment partner, and review evidence before payment is released under the agreed conditions.

This repository contains the public website and React dashboard. **The dashboard currently supports a mock preview; the new backend and the Better Auth, Kora, and QoreID integrations are not implemented here.** Existing API clients describe integration points, not proof that those services are live.

## Product and scope

The core product is the **Protected Deal**, with a shared **Deal Room** for the buyer and seller.

1. Create a deal with the amount, deliverables, deadline, and release conditions.
2. Invite the other party to review and accept the agreement or request changes.
3. Complete the required identity or business checks.
4. Fund through the payment partner and wait for confirmed payment status.
5. Share messages, evidence, and activity updates; review delivery or completed work.
6. Approve release, request changes, or report an issue for dispute review.

The interface supports individual and business accounts, including purchases, services, and deposits. Business accounts can set their website in Settings and open it through **Visit website**. The dashboard identifies the account type and keeps the main navigation to **Overview**, **My deals**, and **Invitations**, with Settings and Help available separately.

The standalone sourcing, wholesale marketplace, wallet, rewards, and payment-hub screens have been retired. Legacy routes redirect where configured; some shared data helpers remain for existing dependencies. These older modules do not define the current product scope.

Naitrust provides the agreement, evidence, approval, and resolution workflow. The planned payment arrangement uses Kora for financial rails. Fund holding, conditional release, refunds, and settlement must follow the arrangement confirmed with Kora; a collection API alone does not establish those capabilities. Naitrust must not claim to be a bank, insurer, guarantor, or direct custodian of customer funds.

## Current implementation status

| Area | Status |
| --- | --- |
| Public website | Homepage, individual/business pages, journal, help, early-access waitlist, and policy pages |
| Dashboard | Individual/business workspaces and mock buyer/seller deal flows |
| Deal Room | Agreement details, messages, evidence, activity, payment state, delivery/service review, and dispute controls |
| Current authentication | Existing frontend auth screens, mock accounts, and legacy API clients; Better Auth migration is pending |
| Public forms | Call the configured API, including in mock mode; require a working backend |
| Financial backend | ASP.NET Core backend selected, not built yet |
| Better Auth / Kora / QoreID | Selected for the backend build; not connected by this repository |

Mock funding moves no money. Some preview state persists in browser storage, including deal activity and evidence. This is development data, not a production ledger, secure document store, or completed identity check. Switching to `dev` or `prod` mode does not implement missing backend services.

## Frontend stack

- React 19 and TypeScript, built with Vite 6.
- React Router for navigation.
- Tailwind CSS 4 and Radix UI primitives.
- TanStack Query for API data and Zustand for frontend state.
- React Hook Form and Zod for forms and validation.
- Playwright for the local protected-deal workflow check.

## Planned backend and authentication

| Component | Selected technology and responsibility |
| --- | --- |
| Application API | ASP.NET Core / C#: users, businesses, deal permissions, approvals, disputes, and financial records |
| Database | PostgreSQL; Entity Framework Core with Npgsql for the .NET application |
| Authentication | Better Auth in a small, separate Node.js/TypeScript service |
| Payment rails | Kora, integrated server-side through a payment adapter |
| Identity verification | QoreID, integrated server-side through a verification adapter |
| Background jobs | Hangfire for durable processing, notifications, retries, and reconciliation |
| Evidence storage | Private object storage with authorized access; storage provider to be selected |

Better Auth will own sign-up, sign-in, email verification, password recovery, two-factor authentication, and sessions. The plan includes recovery codes, session revocation, and optional passkeys. Its React client will replace the current frontend authentication integration.

The browser will use a Secure, HttpOnly session cookie with Better Auth and short-lived API JWTs held in memory for the .NET API. The API will validate those tokens using the auth service's public signing keys and enforce its own account, business, and deal permissions. Better Auth owns its database schema and migrations; EF Core owns the application schema.

Signing in does not establish QoreID verification or authorize a payment. Sensitive actions will require current session checks and recent authentication bound to the action. The application backend must maintain the financial ledger, prevent duplicate processing, verify provider notifications, and reconcile payment records even though the customer interface has no standalone wallet.

The detailed decision lives in `../roadmap/naitrust-authentication.md` in the parent workspace. The root `../TECHNICAL_BUILD_ROADMAP.md` records the backend build plan. These files are outside this standalone web repository. Older property-only, marketplace, and custom-auth specifications need to be reconciled with the current protected-deal scope before implementation.

## Run locally

Use Node.js compatible with the pinned Vite version and npm. From this directory:

```bash
npm ci
cp .env.example .env
npm run dev
```

If `.env` already exists, keep it and update only the values needed. Configure the local demo password and codes from `.env.example` before using mock sign-in. Mock account identities are listed in [src/mocks/apis/auth-users.json](src/mocks/apis/auth-users.json).

The key settings are:

```dotenv
VITE_APP_MODE=mock
VITE_PAGE_PHASE=app
VITE_API_BASE_URL=http://localhost:5000
```

| Setting | Behavior |
| --- | --- |
| `VITE_APP_MODE=mock` | Uses fixtures for supported app flows; public forms still make API requests |
| `VITE_APP_MODE=dev` | Uses configured API endpoints for integration work |
| `VITE_APP_MODE=prod` | Uses configured API endpoints for production builds |
| `VITE_PAGE_PHASE=app` | Shows the product homepage |
| `VITE_PAGE_PHASE=coming-soon` | Shows the coming-soon page |
| `VITE_PAGE_PHASE=be-back` | Shows the temporary status page |
| `VITE_API_BASE_URL` | API origin, without a trailing `/api`; the shared client appends `/api` |

Mode and page-phase defaults are defined in [src/configs/env.ts](src/configs/env.ts). The shared API configuration currently falls back to `http://localhost:5000` when the API origin is empty; an empty value does **not** enable same-origin routing for that client.

Vite exposes `VITE_*` values to the browser. Keep Kora and QoreID credentials, Better Auth secrets, database credentials, and private signing keys on their respective servers. Restart the dev server after changing environment values; deployed frontend values require a rebuild.

## Public forms and support

Waitlist, contact, newsletter subscription, feedback, and report-concern submissions use [src/services/publicService.ts](src/services/publicService.ts) and [src/libs/api/home.api.ts](src/libs/api/home.api.ts). Routes are defined in [src/libs/api/endpoints.ts](src/libs/api/endpoints.ts) under `/api/Public/*`.

These requests need a reachable backend with the appropriate frontend origins allowed. Mock mode does not store waitlist submissions locally. The dashboard support form also uses the contact endpoint; successful email delivery must be verified when the backend is integrated.

Vercel and Netlify currently serve the static frontend. Neither deployment configuration provides a backend or Better Auth proxy. The planned `/api/auth/*` routing must be added when the auth service is deployed, ahead of the SPA fallback.

## Build and checks

```bash
npm run build
npm run preview
```

`build` runs the TypeScript check and Vite build, producing `dist/`. `preview` serves that built output locally. Available additional commands include `npm run lint`, `npm run verify:images`, and `npm run build:seo` for a build followed by public-page prerendering. The prerender step requires Playwright Chromium (`npx playwright install chromium`).

To check the protected-deal preview, start a mock Vite server:

```bash
npm run dev -- --port 5178
```

Then, in another terminal:

```bash
npm run verify:deals
```

This check requires Chrome by default, uses isolated browser data, and covers draft recovery, agreement acceptance, demo funding, evidence persistence, requested changes, PIN-protected release, and disputes. It seeds mock authentication directly, so it does not validate real sign-in, KYC, or provider payments. Set `NAITRUST_TEST_URL` for a different localhost port or `PLAYWRIGHT_CHANNEL` for another installed compatible browser channel.

## Deployment

- [vercel.json](vercel.json) and [netlify.toml](netlify.toml) define frontend hosting with `dist/` as the output directory.
- Both hosting builds attempt public-page prerendering and currently allow deployment to continue if that step fails.
- Configure frontend environment variables in the hosting project before building. Backend and auth services need separate deployment and configuration.
- Preserve SPA deep links and static asset handling. In particular, Vercel's SPA rewrite excludes `/assets/`; missing JavaScript assets must not return the HTML entry page.
- Verify the custom domain, deep links, API connectivity, and public submissions after deployment. A successful frontend deployment does not verify payment or identity integrations.

## Source layout and design

| Location | Purpose |
| --- | --- |
| `src/App.tsx` | Application routes and public page-phase handling |
| `src/pages/`, `src/components/pages/` | Public and authenticated screens |
| `src/components/pieces/` | Shared dashboard and deal components |
| `src/libs/api/` | API clients and mock adapters |
| `src/libs/store/` | Frontend state |
| `src/mocks/` | Development fixtures and screen content |
| `src/styles/rebrand.css` | Public Naitrust brand styles |
| `src/styles/dashboard.css` | Shared dashboard typography and layout |
| `scripts/` | Prerendering and verification tools |

Keep the dashboard minimal, with consistent fonts, spacing, and a light theme. Use Naitrust's brand colors, readable button contrast, and responsive layouts. Put detailed agreement information and secondary actions behind the relevant panels instead of crowding the Deal Room.

Read [guardrails/README.md](guardrails/README.md), [product guardrails](guardrails/product-guardrails.md), [protected-payment positioning](guardrails/marketing/naitrust-protected-payments-positioning.md), and [feature-claim guidance](guardrails/seo/search-language-and-feature-claims.md) before changing product behavior or public claims. Some older guardrail sections still describe retired marketplace features; they are historical context, not instructions to restore those features.

## Legal review and administration preview

The main app includes optional legal review with one joint approval for current and future room documents, a terms modal, joint deactivation, a restricted lawyer workspace, and protected-deal administration. Configure the legal percentage in `/app/admin/settings` as `admin@naitrust.test`; it is initially unset. The fictional law-firm owner signs in as `legal.firm@naitrust.test` using the existing configured demo password.

See [legal review implementation and backend contracts](guardrails/implementation/legal-review-preview.md) for the workflow, permissions, fee behavior, sample accounts, evidence-size limits and production requirements. Run `npm run verify:legal` and `npm run verify:deals` against a local mock server. Insurance and real legal-service payments are not included.
