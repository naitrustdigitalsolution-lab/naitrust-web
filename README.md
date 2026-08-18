# Naitrust Web

Frontend for Naitrust as a protected-commerce and sourcing platform.

This app helps Nigerian individuals and businesses discover verified suppliers in China and Nigeria, browse products in English, request a confirmed landed-cost quote, pay through a protected order, and track delivery. Business accounts use the same sourcing journey and can additionally publish a Showcase, sell products, fulfil customer orders, and receive earnings.

The default first screen is the China-sourcing and protected-commerce home. The coming-soon and be-back screens still exist and are controlled by environment.

## Product model

- Public browsing: markets, products, suppliers, Showcases, and Trust Profiles.
- Authenticated buying: Cart, Buying Quotes, Buying Orders, Agents, Messages, and Wallet.
- Business selling: Showcase, Products, customers, fulfilment, and earnings.
- Protected commerce: supplier product funds and logistics charges are recorded separately.
- Optional agents: AI may suggest a suitable agent, but the user decides whether to hire under a separate service scope and fee.
- Production workflows: business buyers can connect a main product, packaging, labels, inspection, consolidation, and shipping across several suppliers. A missing stage can become an agent sourcing request.
- Payment choice: confirmed quotes are Naira-first, with optional USD checkout for eligible business orders. Chinese supplier settlement is modelled separately in CNY or USD through a regulated provider.
- Partner network: China-based agents and suppliers apply through a separate reviewed onboarding flow and receive revocable partner access only after admin approval.
- Localisation: the partner experience starts with English and Simplified Chinese, defaulting from the partner locale. The typed locale boundary can be extended as new markets launch.
- Account isolation: authenticated mock carts, quotes, orders, agent tasks, and seller products are namespaced by account. Production APIs must enforce ownership server-side.

## Stack

- Vite
- React
- TypeScript
- Tailwind CSS
- Vercel and Netlify hosting

## App Modes

The frontend supports three environment-controlled modes:

- `mock`: frontend-only development. Waitlist submissions are saved in local storage.
- `dev`: calls configured API endpoints for integration testing.
- `prod`: calls production API endpoints.

Set the mode and page phase in `.env`:

```bash
# Data mode: mock, dev, prod
VITE_APP_MODE=mock

# Page phase: app, coming-soon, be-back
VITE_PAGE_PHASE=app

VITE_API_BASE_URL=
VITE_SPLINE_SCENE_URL=
```

The waitlist route is defined in `src/api/routes.ts`, not `.env`.

## Styling

Use Tailwind utilities for layout and day-to-day styling. Custom CSS belongs in `src/styles/index.css` only for branded visuals, complex product mockups, and shared component classes.

The app supports live dark mode by toggling the `dark` class on the document. Public screens should include `dark:` Tailwind variants where possible.

Mock screen copy/data belongs under:

```text
src/mocks/screens
```

## Run Locally

```bash
npm install
npm run dev
```

For Vercel API route testing:

```bash
npm run dev:vercel
```

## Build

```bash
npm run build
```

The build output directory is `dist/`, matching `vercel.json`'s `outputDirectory` and the Netlify publish directory in `netlify.toml`.

## Deploy

Two hosting targets are supported: **Vercel** and **Netlify**.

### Vercel

Configured entirely by `vercel.json`: build command (includes the SEO prerender step), `outputDirectory: "dist"`, SPA rewrite (`/(.*) → /index.html`), and response headers. No dashboard configuration needed beyond connecting the repo.

### Netlify

Configured entirely by `netlify.toml`: build command (same SEO prerender step as Vercel), `publish = "dist"`, SPA redirect (`/* → /index.html`), and the same response headers as Vercel (translated to Netlify's `[[headers]]` syntax). No dashboard configuration needed beyond connecting the repo.

## Public Form Submissions

The waitlist, contact, subscribe, feedback, and report-concern forms all call the backend directly via `POST {VITE_API_BASE_URL}/api/Public/*` (see `src/libs/api/home.api.ts`). There is no serverless proxy function on either host — both Vercel and Netlify just serve the static frontend, and the frontend talks to the real backend API over `VITE_API_BASE_URL`.

## Source of truth

Read these files before building:

1. `guardrails/README.md`
2. `guardrails/product-guardrails.md`
3. `guardrails/seo/search-language-and-feature-claims.md`
4. `guardrails/marketing/naitrust-problem-statement-and-social-copy.md`
5. `src/libs/marketplace/types.ts`
6. `src/libs/marketplace/marketplace.api.ts`

## Old Code Reuse

Reuse useful frontend design, components, assets, and patterns from `../naitrust-web-old`.

Prefer reusing:

- logo and brand assets from `../naitrust-web-old/src/assets`
- shared UI primitives from `../naitrust-web-old/src/components/ui`
- auth patterns from old login/registration pages
- verification patterns from old CAC verification page and API client
- dashboard layout ideas from old business/customer/admin dashboards
- API client patterns from `../naitrust-web-old/src/lib/api`
- store patterns from `../naitrust-web-old/src/lib/store`

Do not copy old payment-first flows when they conflict with the protected-commerce direction.
# naitrust-web
