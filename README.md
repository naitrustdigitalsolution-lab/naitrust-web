# Naitrust Web

Frontend for Naitrust as a trusted transaction platform.

This app should help Nigerian businesses and informal sellers create safe transaction rooms, invite counterparties, agree terms, track evidence, and complete protected payments through regulated financial partners.

The default first screen is the new Naitrust product home screen. The coming-soon and be-back screens still exist and are controlled by environment.

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

## Source of Truth

Read these files before building:

1. `../futureidea.md`
2. `../TECHNICAL_BUILD_ROADMAP.md`
3. `../Naitrust Technical Spec v2.docx`
4. `guardrails/README.md`
5. `guardrails/pre-build-checklist.md`
6. `guardrails/plan.md`
7. `guardrails/skill.md`
8. `guardrails/architecture.md`
9. `guardrails/workflow.md`
10. `guardrails/ui.md`
11. `guardrails/tool.md`
12. `guardrails/api-contract.md`
13. `guardrails/verification-flow.md`
14. `guardrails/ai-intelligence-plan.md`

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

Do not blindly copy old feature flows if they conflict with the new trusted-transaction product direction.
# naitrust-web
