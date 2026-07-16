# Frontend AI Build Skill

This file tells AI agents how to build the Naitrust frontend without drifting from the product, code quality, or design direction.

## Required Approach

1. Read `../../futureidea.md`, `../../TECHNICAL_BUILD_ROADMAP.md`, and `../../Naitrust Technical Spec v2.docx` before making product decisions.
2. Read this folder's `plan.md`, `architecture.md`, `workflow.md`, `ui.md`, `tool.md`, and `api-contract.md` before implementing screens.
3. If confused, convert the Word spec with `textutil -convert txt -stdout "../../Naitrust Technical Spec v2.docx"` and read the relevant section before implementing.
4. Check `../../naitrust-web-old` before creating new primitives, layouts, auth flows, API clients, stores, or brand assets.
5. Reuse proven old patterns when they still fit the new product.
6. Build the new app around safe transactions, not around verification alone.
7. Build verification as a risk-control layer with individual, business, facial, ownership, and manual-review paths.

## Engineering Patterns

- Use TypeScript strictly.
- Keep screens thin and move reusable behavior into hooks, services, schemas, or stores.
- Use React Query for server state.
- Use Zustand only for client UI/session state that is not better handled by the URL or React Query.
- Validate forms with Zod and React Hook Form.
- Define route-level boundaries for public, authenticated, business, and admin sections.
- Use typed API request/response models.
- Avoid duplicating API endpoint strings throughout the app; centralize them.
- Keep reusable components small, composable, and domain-aware.

## UI Development Rules

- Build the actual app experience first, not a marketing-only landing page.
- Use lucide-react icons for buttons and common actions.
- Use clear transaction statuses, progress indicators, and activity timelines.
- Every form must have loading, error, success, disabled, and validation states.
- Every data screen must have loading, empty, error, and populated states.
- Verification screens must have resume, retry, manual fallback, and status states.
- AI output must be labeled, dismissible, and backed by visible evidence or clear next actions.
- Avoid decorative UI that makes the app feel like a generic fintech landing page.
- Optimize for repeat business workflows: scan, compare, review, approve, dispute.

## Safety and Compliance Language

Use:

- "Protected payment"
- "Protected funding"
- "Partner-issued virtual account"
- "Regulated financial partner"
- "Payment status"
- "Release request"
- "Deal terms"
- "Evidence"

Avoid unless legally approved:

- "Naitrust holds your money"
- "Naitrust bank account"
- "Naitrust wallet"
- "Guaranteed funds"
- "Escrow account owned by Naitrust"

## Old Code Reuse Rules

Safe to reuse:

- Brand assets.
- UI primitives.
- auth UI patterns.
- dashboard shells.
- API client structure.
- socket notification patterns.
- responsive layout patterns.

Review carefully before reuse:

- old payment flows.
- old transaction model assumptions.
- old pricing language.
- old verification-only positioning.

Do not reuse:

- code that exposes secrets.
- code that makes unsupported regulatory claims.
- stale mock data that conflicts with the new product.
