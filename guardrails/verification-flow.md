# Frontend Verification Flow

Verification is a first-class Naitrust product area. It supports safe transactions by proving who the parties are, what business they represent, and whether the right person controls the account.

Use the old frontend as reference:

- `../../naitrust-web-old/src/components/pages/CACVerificationPage.tsx`
- `../../naitrust-web-old/src/lib/api/verification.api.ts`
- `../../naitrust-web-old/src/components/pages/VerificationAuditTrailPage.tsx`
- `../../naitrust-web-old/src/components/pages/CompliancePage.tsx`

## Verification Types

### 1. Individual Verification

Used for buyers, sellers, freelancers, agents, and business owners.

Frontend should support:

- email verification.
- phone verification.
- NIN, BVN, passport, or driver's license number collection where required.
- selfie capture.
- facial/liveness verification where required.
- identity document upload for manual fallback.
- status tracking.

Do not expose sensitive raw provider responses to users.

### 2. Facial Verification

Used to prove the person submitting the account or business verification is present and matches the claimed identity.

Frontend should support:

- camera permission request.
- live selfie capture.
- basic quality guidance: face visible, good lighting, no blur.
- selfie with ID capture for manual review.
- retry state.
- secure upload through backend.

The frontend must not make final face-match decisions. It only captures and submits evidence.

### 3. Business Verification

Used for companies, business names, NGOs, partnerships, suppliers, contractors, vendors, and high-value transaction counterparties.

Frontend should support:

- CAC registration type: RC, BN, IT, LLP.
- CAC registration number.
- business legal name.
- TIN where available.
- owner/director identity details.
- business address.
- CAC certificate upload for manual fallback.
- tax certificate or proof of address where required.
- ownership proof method.
- verification tier selection if pricing remains in the product.

### 4. Ownership Verification

Business verification alone does not prove that the current Naitrust user controls the business.

Supported ownership methods:

- identity match between user ID and CAC director/proprietor records.
- CAC email or phone OTP where provider data supports it.
- manual admin review with documents.
- bank account ownership check if a regulated partner supports it.

## Suggested Frontend Steps

### Individual KYC

1. Basic profile.
2. Email/phone confirmation.
3. ID document type and number.
4. Selfie/facial verification.
5. Review and submit.
6. Status screen.

### Business Verification

1. Disclaimer and consent.
2. Business information.
3. CAC registration details.
4. Owner/director identity.
5. Facial verification.
6. Ownership method.
7. Document upload fallback if needed.
8. Review.
9. Payment if verification is paid.
10. Processing/status.
11. Complete, rejected, or manual review.

## Risk-Based Verification

The transaction flow should request verification based on risk.

Low-risk informal deal:

- email or phone verification.
- basic user profile.

Medium-risk transaction:

- individual ID verification.
- business verification for sellers or suppliers.

High-value or high-risk transaction:

- business verification.
- director/owner identity verification.
- facial/liveness check.
- proof of address or CAC certificate.
- manual review if signals conflict.

## Verification Reuse and Freshness

Users and businesses should not repeat full verification every time they create or join a transaction if they already have a valid completed verification.

Reusable verification:

- verified email.
- verified phone.
- completed individual ID verification.
- completed business/CAC verification.
- completed ownership proof for the same business.
- approved manual verification documents.

Recheck or refresh may be required when:

- the previous verification is expired.
- the user changes legal name, phone, email, business registration number, directors, or ownership details.
- the transaction is much higher risk than previous transactions.
- provider data conflicts with stored data.
- fraud, dispute, or admin flags exist.

### Liveness Freshness Rule

Facial/liveness verification is different from identity verification. Identity can be reusable, but liveness proves the person is currently present.

Default rule:

> If a verified user has not completed any deal or transaction activity for more than 30 days, require fresh liveness before starting or accepting a protected transaction.

Also require fresh liveness when:

- account recovery happened recently.
- login device or location risk is high.
- transaction value is high.
- the user is opening or responding to a dispute on a high-risk transaction.
- admin or risk engine requires it.

Frontend behavior:

- explain that previous identity verification is still valid.
- ask only for fresh liveness where possible, not full verification.
- show the last verified date and last liveness date.
- let users complete fresh liveness quickly from the transaction room.

## UX Requirements

- Show why verification is being requested.
- Show current verification status clearly.
- Preserve form progress locally when safe.
- Let users resume pending verification.
- Use simple status labels: pending, processing, verified, needs more info, rejected.
- Provide manual fallback when instant verification fails.
- Never imply verification guarantees a transaction outcome.

## API Expectations

The frontend expects backend endpoints for:

- starting individual verification.
- starting business verification.
- uploading verification documents.
- submitting selfie/facial verification.
- checking verification status.
- resuming a verification request.
- submitting OTP/email/phone code.
- manual review status.
