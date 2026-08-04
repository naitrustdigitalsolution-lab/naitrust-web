# Delivery Card and Two-Stage Review for Existing Protected Deals

## Scope guardrail

This phase is frontend-only. It uses mock data and browser-persisted state. It must not add backend endpoints, API integrations, courier integrations, rider accounts, mobile implementation, or AI behavior.

The feature extends the existing Protected Deal flow and Transaction Room; it must not create a separate logistics product.

## Engineering and security guardrails

- Keep business rules and lifecycle transitions outside React components.
- Keep mock fixtures and structured sample data under the mock/data layer, not inline in page components.
- Split delivery-card, countdown, handover, and funding-review presentation into focused components rather than adding a large block to `TransactionRoomPage`.
- Treat the limited QR route as an untrusted entry point: expose only the minimum safe preview, require the authenticated buyer before mutation, and validate deal state, role, expiry, and one-time use in the domain/API layer.
- Generate opaque tokens with the browser cryptography API and never derive them from a deal ID, reference, OTP, email, phone number, or account data.
- Do not place protected amount, account information, contact details, full agreement, or sensitive state in QR URLs or delivery-card markup.
- Persist frontend mock lifecycle state under one versioned, namespaced browser-storage key and parse it defensively. Do not use browser state as proof of backend-grade security; production enforcement belongs on the future backend.
- Keep functions small and cohesive, reuse existing query invalidation and modal patterns, and avoid duplicating lifecycle decisions across screens.

## Approved flow

1. After a Protected Deal is funded and the seller has supplied the required product evidence, the seller may generate a delivery card.
2. The delivery card contains Naitrust branding, the product/deal title and reference, an opaque one-time QR link, a six-digit handover OTP, an expiry, and buyer instructions.
3. The card must not contain the protected amount, account information, contact details, or the complete agreement.
4. Regenerating an unused card invalidates its previous QR and OTP. A card is permanently invalid after receipt confirmation, deal cancellation, or expiry.
5. A buyer scans the QR at `/delivery/:token` or enters the OTP in the existing Transaction Room.
6. Receipt confirmation is allowed only for the signed-in buyer when the deal is active and funded and the token/code is valid and unused.
7. Confirming receipt starts a live ten-minute handover review. It does not release funds or waive defect, statutory, manufacturer, or seller-warranty rights.
8. During handover, the buyer may confirm the correct product early, report an immediate problem, and upload package, seal, product, serial/IMEI, and contents evidence.
9. An immediate problem opens the existing dispute flow and blocks countdown-based release.
10. If the buyer completes the handover early, the funding-review period starts immediately. Otherwise it starts when ten minutes expires, provided no dispute exists.
11. The funding-review period is 24 hours by default. A mutually accepted **Extended product testing period** of 3, 7, or 14 days replaces the 24-hour period; it is not added to it and must not be called a warranty.
12. During the funding-review period, the buyer may approve early payment release with their transaction PIN. A dispute freezes release. If the deadline passes without a dispute, the existing release flow advances through `release_approved` and `paid_out`.
13. Both parties see synchronized deadlines and lifecycle notices in their existing Transaction Room. The rider has no account and takes no action.

## Seller-protection evidence

Before generating a delivery card, the seller evidence record should include the product model, serial/IMEI where applicable, packaging condition, and tamper-seal evidence. This creates a condition trail that can be compared with buyer evidence if a wrong, substituted, damaged, or tampered product is reported.

## Required reuse

- `TransactionRoomPage`
- `UploadEvidenceModal`
- `PinPromptModal`
- `RaiseDisputeModal`
- `DisputePanel`
- Existing notification hooks
- Existing QR, PDF, and image-download utilities
- Existing Protected Deal statuses and release/dispute behavior

## Verification checklist

- Delivery-card generation, regeneration, expiry, invalidation, and one-time use.
- QR and OTP receipt confirmation.
- Seller, rider, and unrelated-account receipt confirmation prevention.
- Buyer and seller countdown synchronization and refresh recovery.
- Early handover completion and automatic completion at ten minutes.
- Wrong-item reporting during handover and during the following review period.
- Default 24-hour and optional 3/7/14-day deadlines.
- Early PIN release, dispute blocking, duplicate-action prevention, and automatic release.
- Lint, TypeScript, and production build.

## Consumer-rights note

The 24-hour or extended period controls only Naitrust's partner-funding release deadline. It does not remove consumer rights or statutory, manufacturer, or seller warranty rights. Reference: [FCCPC consumer rights and responsibilities](https://fccpc.gov.ng/consumers/consumer-rights-responsibilities/rights-responsibilities/).
