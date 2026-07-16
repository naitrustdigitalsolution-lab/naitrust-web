# Frontend Tools and Services

## Core Stack

- React.
- Vite.
- TypeScript.
- Tailwind CSS.
- Radix UI primitives.
- lucide-react icons.
- React Router.
- React Query.
- Zustand.
- React Hook Form.
- Zod.
- Axios or Fetch wrapper.
- SignalR client for real-time updates from the ASP.NET Core API.

## Old Code References

Use `../../naitrust-web-old/package.json` as the dependency starting point.

Important old folders:

- `../../naitrust-web-old/src/assets`
- `../../naitrust-web-old/src/components/ui`
- `../../naitrust-web-old/src/components/pages`
- `../../naitrust-web-old/src/lib/api`
- `../../naitrust-web-old/src/lib/store`
- `../../naitrust-web-old/src/lib/socket.ts` as behavior reference only; implement the new client with SignalR.
- `../../naitrust-web-old/src/lib/auth-context.tsx`

## External Services Used Through Backend

The frontend should not call regulated financial, KYC, storage, or AI services directly unless the backend explicitly exposes a safe client-side flow.

Backend-mediated services may include:

- QoreID or Prembly for identity and business checks.
- QoreID for CAC, BVN, and face verification where available.
- Korapay for Phase 1 development virtual accounts/collection accounts, funding confirmation, transfers, and webhooks.
- Providus Bank, Wema Bank, and Anchor as future backend adapter placeholders.
- ImageKit or object storage for evidence uploads.
- Termii or email provider for OTP and notifications.
- OpenAI for AI-assisted risk summaries, only through backend.

## Environment Variables

Expected frontend variables:

- `VITE_API_BASE_URL`
- `VITE_SIGNALR_URL`
- `VITE_APP_ENV`

Do not put provider secrets in frontend env variables.
