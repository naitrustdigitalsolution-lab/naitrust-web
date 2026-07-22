# Frontend Tools and Services

## Core Stack (current, verified against `package.json` and actual usage)

- React, Vite, TypeScript.
- Tailwind CSS (v4, via `@tailwindcss/vite`).
- Radix UI primitives (accordion, dialog, popover, select, checkbox, dropdown-menu, tabs, etc. — see `src/components/ui/`).
- lucide-react icons.
- React Router (`react-router-dom`).
- `@tanstack/react-query` — used for server-state hooks (`src/hooks/useTransactions.ts`, `useDealDetail.ts`, `useReputation.ts`, `useTermination.ts`).
- Zustand with a custom `cookieStorage` persist adapter (`src/libs/utils/secure-storage.ts`) — used by `src/libs/store/auth.store.ts`, `security.store.ts`, `business.store.ts`. Sensitive data (tokens, user data) is never persisted to `localStorage`, only Secure cookies.
- HTTP: a custom fetch wrapper at `src/libs/api/client.ts` (`httpClient.get/post/put/patch/delete/upload`), not Axios. `axios` is present in `package.json` but unused — candidate for removal.
- `react-hook-form` is a dependency but is only wired into the base shadcn `src/components/ui/form.tsx` primitive; real forms in the app (e.g. `WaitlistModal.tsx`, `RegistrationPage.tsx`) use plain `useState`, not RHF.
- `zod` is a dependency but has no actual usage in `src/` — not currently used for validation anywhere.
- No SignalR (or any realtime/WebSocket client) is wired up anywhere in `src/`. `socket.io-client` is a dependency but unused. Real-time updates are not yet implemented — data refresh currently relies on React Query refetching, not push updates.

## App Data Modes

Controlled by env vars actually read at runtime (`.env.example`):

- `VITE_APP_MODE`: `mock` (frontend-only, reads `src/mocks/`) / `dev` (integration environment) / `prod` (production environment).
- `VITE_PAGE_PHASE`: `app` (default product) / `coming-soon` (waitlist screen) / `be-back` (temporary status screen).
- `VITE_API_BASE_URL`: base URL of the Naitrust .NET backend; public form submissions and all app data go through it.

Mock data for `mock` mode lives in `src/mocks/apis/` (JSON fixtures: businesses, auth-users, deal-drafts, invitations, notifications, reputation, transactions) and `src/mocks/screens/` (per-page mock content, e.g. `blog.ts`).

## External Services Used Through Backend

The frontend never calls regulated financial, KYC, storage, or AI services directly — everything routes through the .NET backend. Live/named partners (also stated directly on the public site's Partners section, "Regulated Fintech Behind Every Property Transaction"):

- **QoreID** — identity and business verification (CAC, BVN, liveness, document checks).
- **Anchor** (getanchor.co) — payment infrastructure: per-transaction virtual accounts, funding confirmation, transfers. Naitrust itself never custodies funds; this is a hard positioning rule (see `futureidea.md` and `public/llms.txt`).
- ImageKit or object storage for evidence uploads.
- Termii or an email provider for OTP and notifications.
- OpenAI for AI-assisted risk summaries, only through backend.

Korapay and Providus/Wema Bank are no longer part of the current live-partner story — Anchor is the payment partner in production today; other banks remain possible future adapters, not current placeholders.

## Environment Variables

See `.env.example` for the authoritative list. Frontend variables currently in use:

- `VITE_API_BASE_URL`
- `VITE_APP_MODE`
- `VITE_PAGE_PHASE`
- `VITE_MOCK_PASSWORD`, `VITE_MOCK_OTP`, `VITE_MOCK_2FA_CODE`, `VITE_MOCK_TOTP_SECRET` (local demo credentials only)

Do not put provider secrets in frontend env variables — `VITE_*` values are public in the browser bundle.

## Old Code (historical reference only)

`naitrust-web-old/` was the original bootstrap reference when this app was first being built and is largely superseded now that the app is fully built out. Treat it as historical/legacy reference only, not an active dependency source — the current `src/` structure (components, api client, stores) is the source of truth.
