/**
 * NAITRUST — EXPECTED API CONTRACT
 * ================================================================
 * Documentation-only reference (not imported anywhere in the app).
 * Every endpoint the frontend expects, with a FULL example request body
 * and a FULL example response body — every field spelled out, nothing
 * abbreviated. Hand this straight to the backend engineer.
 *
 * Base URL:  {API_BASE_URL}/api
 * Auth:      Bearer <token> in the Authorization header (unless marked "public")
 * Envelope:  every response is { success, data, message, error } —
 *            success: boolean, data: the payload (or omitted on plain
 *            errors), message: optional human-readable string,
 *            error: present only when success is false.
 * Money:     amountMinor is always an integer in kobo (₦1 = 100).
 * Dates:     ISO 8601 strings, e.g. "2026-07-20T09:12:00.000Z".
 *
 * The examples below use one running set of sample data so the IDs are
 * consistent across sections:
 *   user:     usr_9f2c1a  — Ada Okafor (customer)
 *   business: biz_4471d2  — Lekki Gardens Development Co.
 *   deal:     txn_7ab120  — reference NT-2026-004821
 * ================================================================
 */


// ================================================================
// 1. AUTH
// ================================================================

/**
 * POST /auth/register (public)
 * Request body:
 * {
 *   "email": "ada.okafor@example.com",
 *   "password": "SecurePass123!",
 *   "firstName": "Ada",
 *   "lastName": "Okafor",
 *   "role": "customer",
 *   "phoneNumber": "+2348012345678"
 * }
 *
 * Response 200:
 * {
 *   "success": true,
 *   "data": {
 *     "user": {
 *       "id": "usr_9f2c1a",
 *       "email": "ada.okafor@example.com",
 *       "firstName": "Ada",
 *       "lastName": "Okafor",
 *       "name": "Ada Okafor",
 *       "role": "customer",
 *       "phone": "+2348012345678",
 *       "kycLevel": 0,
 *       "kycVerified": false,
 *       "isEmailVerified": false,
 *       "isPhoneVerified": false
 *     },
 *     "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c3JfOWYyYzFhIn0.4f3a9c"
 *   }
 * }
 *
 * Response 409 (email already registered):
 * {
 *   "success": false,
 *   "error": "An account with this email already exists"
 * }
 */

/**
 * POST /auth/login (public)
 * Request body:
 * { "email": "ada.okafor@example.com", "password": "SecurePass123!" }
 *
 * Response 200 (no 2FA on this account):
 * {
 *   "success": true,
 *   "data": {
 *     "user": {
 *       "id": "usr_9f2c1a", "email": "ada.okafor@example.com",
 *       "firstName": "Ada", "lastName": "Okafor", "name": "Ada Okafor",
 *       "role": "customer", "phone": "+2348012345678",
 *       "kycLevel": 1, "kycVerified": true,
 *       "isEmailVerified": true, "isPhoneVerified": true
 *     },
 *     "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c3JfOWYyYzFhIn0.4f3a9c"
 *   }
 * }
 *
 * Response 200 (2FA enabled — login incomplete, no token yet):
 * {
 *   "success": true,
 *   "data": {
 *     "user": { "id": "usr_9f2c1a", "email": "ada.okafor@example.com", "name": "Ada Okafor", "role": "customer" },
 *     "requires2FA": true
 *   }
 * }
 *
 * Response 401 (bad credentials):
 * { "success": false, "error": "Invalid email or password" }
 */

/**
 * POST /auth/login/verify-2fa (public)
 * Request body:
 * { "userId": "usr_9f2c1a", "token": "482913" }
 *
 * Response 200:
 * {
 *   "success": true,
 *   "data": {
 *     "user": { "id": "usr_9f2c1a", "email": "ada.okafor@example.com", "name": "Ada Okafor", "role": "customer" },
 *     "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c3JfOWYyYzFhIn0.4f3a9c"
 *   }
 * }
 *
 * Response 401 (wrong code):
 * { "success": false, "error": "Invalid code. Please try again." }
 */

/**
 * POST /auth/logout
 * Response 200: { "success": true }
 */

/**
 * GET /auth/profile
 * Response 200:
 * {
 *   "success": true,
 *   "data": {
 *     "user": {
 *       "id": "usr_9f2c1a", "email": "ada.okafor@example.com",
 *       "firstName": "Ada", "lastName": "Okafor", "name": "Ada Okafor",
 *       "role": "customer", "phone": "+2348012345678",
 *       "kycLevel": 1, "kycVerified": true,
 *       "isEmailVerified": true, "isPhoneVerified": true
 *     }
 *   }
 * }
 */

/**
 * PUT /auth/profile
 * Request body:
 * {
 *   "firstName": "Ada",
 *   "lastName": "Okafor-Bello",
 *   "phoneNumber": "+2348012345678",
 *   "bio": "Property buyer in Lagos",
 *   "address": "12 Admiralty Way",
 *   "city": "Lagos",
 *   "state": "Lagos",
 *   "country": "Nigeria"
 * }
 *
 * Response 200:
 * {
 *   "success": true,
 *   "data": {
 *     "user": {
 *       "id": "usr_9f2c1a", "email": "ada.okafor@example.com",
 *       "firstName": "Ada", "lastName": "Okafor-Bello", "name": "Ada Okafor-Bello",
 *       "role": "customer", "phone": "+2348012345678",
 *       "kycLevel": 1, "kycVerified": true,
 *       "isEmailVerified": true, "isPhoneVerified": true
 *     }
 *   }
 * }
 */

/**
 * POST /auth/change-password
 * Request body:
 * { "oldPassword": "SecurePass123!", "newPassword": "NewSecurePass456!" }
 *
 * Response 200: { "success": true, "message": "Password changed successfully" }
 * Response 401 (wrong old password): { "success": false, "error": "Current password is incorrect" }
 */

/**
 * POST /auth/forgot-password (public)
 * Request body: { "email": "ada.okafor@example.com" }
 * Response 200: { "success": true, "message": "A reset code has been sent to your email" }
 */

/**
 * POST /auth/verify-otp (public)
 * Request body: { "email": "ada.okafor@example.com", "otp": "482913" }
 * Response 200: { "success": true, "data": { "resetToken": "rst_7f3a9c2e1b" } }
 * Response 400 (wrong/expired code): { "success": false, "error": "Invalid or expired code" }
 */

/**
 * POST /auth/reset-password (public)
 * Request body:
 * { "email": "ada.okafor@example.com", "resetToken": "rst_7f3a9c2e1b", "newPassword": "NewSecurePass456!" }
 * Response 200: { "success": true, "message": "Password has been reset" }
 */

/**
 * POST /auth/verify-email (public)
 * Request body: { "email": "ada.okafor@example.com", "otp": "482913" }
 * Response 200:
 * {
 *   "success": true,
 *   "data": {
 *     "user": { "id": "usr_9f2c1a", "email": "ada.okafor@example.com", "name": "Ada Okafor", "role": "customer", "isEmailVerified": true },
 *     "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c3JfOWYyYzFhIn0.4f3a9c"
 *   }
 * }
 */

/**
 * POST /auth/resend-verification-otp (public)
 * Request body: { "email": "ada.okafor@example.com" }
 * Response 200: { "success": true, "message": "A new verification code has been sent to ada.okafor@example.com" }
 */


// ================================================================
// 2. SECURITY (OTP delivery, 2FA/TOTP enrolment, KYC, transaction PIN)
// ================================================================

/**
 * POST /security/email/send-otp
 * Request body: { "email": "ada.okafor@example.com" }
 * Response 200: { "success": true, "data": null, "message": "OTP sent to ada.okafor@example.com" }
 */

/**
 * POST /security/email/verify
 * Request body: { "code": "482913" }
 * Response 200: { "success": true, "data": { "verified": true } }
 */

/**
 * POST /security/phone/send-otp
 * Request body: { "phone": "+2348012345678" }
 * Response 200: { "success": true, "data": null, "message": "OTP sent to +2348012345678" }
 */

/**
 * POST /security/phone/verify
 * Request body: { "code": "482913" }
 * Response 200: { "success": true, "data": { "verified": true } }
 */

/**
 * POST /security/2fa/start
 * Request body: { "email": "ada.okafor@example.com" }
 * Response 200:
 * {
 *   "success": true,
 *   "data": {
 *     "secret": "JBSWY3DPEHPK3PXP",
 *     "otpauthUri": "otpauth://totp/Naitrust:ada.okafor@example.com?secret=JBSWY3DPEHPK3PXP&issuer=Naitrust"
 *   }
 * }
 */

/**
 * POST /security/2fa/verify
 * Request body: { "code": "482913" }
 * Response 200: { "success": true, "data": { "enabled": true } }
 */

/**
 * POST /security/kyc
 * Request body (individual):
 * { "kind": "individual", "firstName": "Ada", "lastName": "Okafor", "nin": "12345678901", "dob": "1994-03-22" }
 *
 * Request body (business):
 * {
 *   "kind": "business",
 *   "businessName": "Lekki Gardens Development Co.",
 *   "rcNumber": "RC1234567",
 *   "directorFirstName": "Chidi",
 *   "directorLastName": "Eze",
 *   "directorNin": "23456789012",
 *   "ownerEmail": "director@lekkigardens.example",
 *   "documents": "cac-certificate.pdf, proof-of-address.pdf"
 * }
 *
 * Response 200: { "success": true, "data": { "status": "verified" } }
 * Response 200 (pending manual review): { "success": true, "data": { "status": "pending" } }
 */

/**
 * POST /security/pin/set
 * Request body: { "pin": "4821" }
 * Response 200: { "success": true, "data": { "set": true } }
 */

/**
 * POST /security/pin/verify
 * Request body: { "pin": "4821" }
 * Response 200: { "success": true, "data": { "valid": true } }
 * Response 200 (wrong pin): { "success": true, "data": { "valid": false } }
 */


// ================================================================
// 3. BUSINESSES
// ================================================================

/**
 * POST /businesses
 * Request body:
 * {
 *   "name": "Lekki Gardens Development Co.",
 *   "description": "Off-plan and instalment property developer in Lagos.",
 *   "category": "Real Estate Developer",
 *   "email": "contact@lekkigardens.example",
 *   "phoneNumber": "+2348098765432",
 *   "website": "https://lekkigardens.example",
 *   "address": "12 Admiralty Way",
 *   "city": "Lagos",
 *   "state": "Lagos",
 *   "country": "Nigeria",
 *   "socialHandles": [ { "platform": "instagram", "value": "@lekkigardens" } ]
 * }
 *
 * Response 200:
 * {
 *   "success": true,
 *   "data": {
 *     "id": "biz_4471d2",
 *     "ownerUserId": "usr_9f2c1a",
 *     "name": "Lekki Gardens Development Co.",
 *     "rcNumber": "RC1234567",
 *     "category": "Real Estate Developer",
 *     "description": "Off-plan and instalment property developer in Lagos.",
 *     "email": "contact@lekkigardens.example",
 *     "phone": "+2348098765432",
 *     "website": "https://lekkigardens.example",
 *     "address": "12 Admiralty Way",
 *     "city": "Lagos",
 *     "state": "Lagos",
 *     "country": "Nigeria",
 *     "socialHandles": [ { "platform": "instagram", "value": "@lekkigardens" } ],
 *     "verified": false,
 *     "createdAt": "2026-02-14T10:03:00.000Z"
 *   }
 * }
 */

/**
 * GET /businesses/my/businesses
 * Response 200:
 * {
 *   "success": true,
 *   "data": [
 *     {
 *       "id": "biz_4471d2",
 *       "ownerUserId": "usr_9f2c1a",
 *       "name": "Lekki Gardens Development Co.",
 *       "rcNumber": "RC1234567",
 *       "category": "Real Estate Developer",
 *       "email": "contact@lekkigardens.example",
 *       "phone": "+2348098765432",
 *       "address": "12 Admiralty Way",
 *       "city": "Lagos",
 *       "state": "Lagos",
 *       "country": "Nigeria",
 *       "verified": true,
 *       "createdAt": "2026-02-14T10:03:00.000Z"
 *     }
 *   ]
 * }
 */

/**
 * PUT /businesses/:id
 * Request body:
 * { "description": "Off-plan, instalment, and rent-to-own property developer in Lagos.", "phone": "+2348098765433" }
 *
 * Response 200:
 * {
 *   "success": true,
 *   "data": {
 *     "id": "biz_4471d2",
 *     "ownerUserId": "usr_9f2c1a",
 *     "name": "Lekki Gardens Development Co.",
 *     "rcNumber": "RC1234567",
 *     "category": "Real Estate Developer",
 *     "description": "Off-plan, instalment, and rent-to-own property developer in Lagos.",
 *     "phone": "+2348098765433",
 *     "verified": true,
 *     "createdAt": "2026-02-14T10:03:00.000Z"
 *   }
 * }
 */


// ================================================================
// 4. TRANSACTIONS (SAFE DEAL) — core resource
// ================================================================

/**
 * GET /transactions/my
 * Response 200:
 * {
 *   "success": true,
 *   "data": [
 *     {
 *       "id": "txn_7ab120",
 *       "reference": "NT-2026-004821",
 *       "title": "Lekki off-plan unit deposit",
 *       "counterpartyName": "Lekki Gardens Development Co.",
 *       "amountMinor": 35000000,
 *       "currency": "NGN",
 *       "status": "funded",
 *       "createdAt": "2026-05-01T09:12:00.000Z"
 *     }
 *   ]
 * }
 * (status is one of: draft, pending_counterparty, terms_negotiation, terms_agreed,
 *  awaiting_funding, funded, in_progress, evidence_submitted, buyer_review,
 *  release_approved, disputed, paid_out, refunded, cancelled, completed)
 */

/**
 * POST /transactions
 * Request body:
 * {
 *   "useCase": "developer-instalments",
 *   "dealType": "milestone",
 *   "partyMode": "b2b",
 *   "role": "buyer",
 *   "participants": [ { "name": "Lekki Gardens Development Co.", "email": "contact@lekkigardens.example", "allocationMinor": 35000000 } ],
 *   "title": "Lekki off-plan unit deposit",
 *   "description": "Deposit for a 2-bedroom off-plan unit, Phase 2.",
 *   "amountMinor": 35000000,
 *   "currency": "NGN",
 *   "deliveryDueDate": "2026-06-15",
 *   "releaseConditions": "Allocation letter and inspection evidence confirmed by the buyer.",
 *   "expiresInDays": 14,
 *   "agreement": {
 *     "version": 1,
 *     "generatedByAi": true,
 *     "sections": [ { "heading": "Parties and purpose", "body": "This safe deal agreement is between..." } ]
 *   }
 * }
 *
 * Response 200:
 * {
 *   "success": true,
 *   "message": "Safe deal created",
 *   "data": {
 *     "id": "txn_7ab120",
 *     "reference": "NT-2026-004821",
 *     "title": "Lekki off-plan unit deposit",
 *     "counterpartyName": "Lekki Gardens Development Co.",
 *     "amountMinor": 35000000,
 *     "currency": "NGN",
 *     "status": "pending_counterparty",
 *     "createdAt": "2026-05-01T09:12:00.000Z"
 *   }
 * }
 */

/**
 * GET /transactions/:id
 * Response 200:
 * {
 *   "success": true,
 *   "data": {
 *     "id": "txn_7ab120",
 *     "reference": "NT-2026-004821",
 *     "title": "Lekki off-plan unit deposit",
 *     "counterpartyName": "Lekki Gardens Development Co.",
 *     "amountMinor": 35000000,
 *     "currency": "NGN",
 *     "status": "funded",
 *     "createdAt": "2026-05-01T09:12:00.000Z",
 *     "description": "Off-plan unit deposit, held until allocation documents and inspection evidence are confirmed.",
 *     "useCase": "developer-instalments",
 *     "dealType": "milestone",
 *     "partyMode": "b2b",
 *     "deliveryDueDate": "2026-06-15",
 *     "releaseConditions": "Allocation letter and supporting documents confirmed by the buyer, with inspection evidence uploaded.",
 *     "expiresAt": "2026-05-15T09:12:00.000Z",
 *     "recurring": false,
 *     "parties": [
 *       { "id": "party_you", "name": "You", "role": "buyer", "status": "creator", "isYou": true },
 *       { "id": "party_cp", "name": "Lekki Gardens Development Co.", "role": "seller", "status": "accepted", "isYou": false, "allocationMinor": 35000000 }
 *     ],
 *     "agreement": {
 *       "version": 1,
 *       "generatedByAi": true,
 *       "sections": [
 *         { "heading": "Parties and purpose", "body": "This safe deal agreement is between you (the Buyer) and Lekki Gardens Development Co. (the Seller)." },
 *         { "heading": "Protected payment", "body": "The Buyer funds ₦350,000.00 into a partner-issued virtual account. Naitrust never holds the funds directly." },
 *         { "heading": "Release conditions", "body": "Allocation letter and supporting documents confirmed by the buyer, with inspection evidence uploaded." }
 *       ]
 *     },
 *     "funding": {
 *       "partner": "Anchor",
 *       "accountNumber": "7012345678",
 *       "accountName": "NAITRUST / SAFE DEAL",
 *       "bankName": "Anchor (partner bank)",
 *       "amountExpectedMinor": 35000000,
 *       "amountReceivedMinor": 35000000,
 *       "currency": "NGN",
 *       "status": "funded"
 *     },
 *     "evidence": [
 *       { "id": "ev_1", "fileName": "allocation-letter.pdf", "kind": "Allocation letter", "fileUrl": "https://cdn.naitrust.com/evidence/ev_1.pdf", "uploadedByName": "Lekki Gardens Development Co.", "note": "Signed allocation letter for Unit 14B.", "createdAt": "2026-05-03T12:00:00.000Z" }
 *     ],
 *     "activity": [
 *       { "id": "a0", "kind": "created", "message": "Safe deal created and counterparty invited.", "createdAt": "2026-05-01T09:12:00.000Z" },
 *       { "id": "a1", "kind": "accepted", "message": "Lekki Gardens Development Co. accepted the invitation and agreement.", "createdAt": "2026-05-01T15:40:00.000Z" },
 *       { "id": "a2", "kind": "funded", "message": "Buyer funded the partner virtual account (₦350,000.00).", "createdAt": "2026-05-02T08:00:00.000Z" }
 *     ],
 *     "milestones": [
 *       { "id": "ms_0", "title": "Order confirmed", "description": "Both parties agreed the terms and the deal is funded.", "status": "done", "updatedByName": "Lekki Gardens Development Co.", "at": "2026-05-02T09:00:00.000Z" },
 *       { "id": "ms_1", "title": "Dispatched", "description": "The seller picked up and dispatched the goods.", "status": "current" },
 *       { "id": "ms_2", "title": "In transit", "status": "pending" },
 *       { "id": "ms_3", "title": "Arrived", "status": "pending" },
 *       { "id": "ms_4", "title": "Delivered & confirmed", "status": "pending" }
 *     ]
 *   }
 * }
 */

/**
 * --- Deal messages (chat inside the transaction room) ---
 *
 * GET /transactions/:id/messages
 * Response 200:
 * {
 *   "success": true,
 *   "data": [
 *     { "id": "txn_7ab120_m1", "dealId": "txn_7ab120", "senderId": "party_cp", "senderName": "Lekki Gardens Development Co.", "isYou": false, "body": "Thanks for setting up the deal — funding confirmed on our end.", "createdAt": "2026-05-02T08:10:00.000Z" },
 *     { "id": "txn_7ab120_m2", "dealId": "txn_7ab120", "senderId": "party_you", "senderName": "You", "isYou": true, "body": "Great, please share the allocation letter when ready.", "createdAt": "2026-05-02T08:15:00.000Z" }
 *   ]
 * }
 *
 * POST /transactions/:id/messages
 * Request body: { "body": "Any update on the allocation letter?" }
 * Response 200:
 * {
 *   "success": true,
 *   "data": { "id": "txn_7ab120_m3", "dealId": "txn_7ab120", "senderId": "party_you", "senderName": "You", "isYou": true, "body": "Any update on the allocation letter?", "createdAt": "2026-05-03T10:00:00.000Z" }
 * }
 */

/**
 * --- Deal tracking (milestone deals; seller advances/edits/reverts stages) ---
 *
 * POST /transactions/:id/tracking/advance
 * Response 200:
 * {
 *   "success": true,
 *   "data": [
 *     { "id": "ms_0", "title": "Order confirmed", "status": "done", "updatedByName": "Lekki Gardens Development Co.", "at": "2026-05-02T09:00:00.000Z" },
 *     { "id": "ms_1", "title": "Dispatched", "status": "done", "updatedByName": "Lekki Gardens Development Co.", "at": "2026-05-04T09:00:00.000Z" },
 *     { "id": "ms_2", "title": "In transit", "status": "current" },
 *     { "id": "ms_3", "title": "Arrived", "status": "pending" },
 *     { "id": "ms_4", "title": "Delivered & confirmed", "status": "pending" }
 *   ]
 * }
 *
 * POST /transactions/:id/tracking
 * Request body: { "title": "Cleared customs", "description": "Item cleared customs at Lagos port.", "afterStepId": "ms_1" }
 * Response 200: same shape as advance, with the new step inserted.
 *
 * PATCH /transactions/:id/tracking/:stepId
 * Request body: { "title": "Dispatched via courier", "description": "Updated courier details." }
 * Response 200: same shape as advance, with that one step's title/description updated.
 *
 * POST /transactions/:id/tracking/revert
 * Response 200: same shape as advance, with the last completed step re-opened as current.
 */

/**
 * --- Termination (either party ends a deal early) ---
 *
 * GET /transactions/:id/termination
 * Response 200 (none yet): { "success": true, "data": null }
 * Response 200 (exists):
 * {
 *   "success": true,
 *   "data": {
 *     "dealId": "txn_7ab120",
 *     "status": "requested",
 *     "reason": "Buyer no longer needs the unit.",
 *     "requestedByName": "You",
 *     "requestedByYou": true,
 *     "createdAt": "2026-05-10T09:00:00.000Z"
 *   }
 * }
 *
 * POST /transactions/:id/termination
 * Request body: { "reason": "Buyer no longer needs the unit." }
 * Response 200: same shape as GET above.
 *
 * POST /transactions/:id/termination/respond
 * Request body: { "accept": false, "reason": "Deposit already committed to construction costs." }
 * Response 200:
 * {
 *   "success": true,
 *   "data": {
 *     "dealId": "txn_7ab120",
 *     "status": "rejected",
 *     "reason": "Buyer no longer needs the unit.",
 *     "requestedByName": "You",
 *     "requestedByYou": true,
 *     "createdAt": "2026-05-10T09:00:00.000Z",
 *     "respondedByName": "Lekki Gardens Development Co.",
 *     "respondedAt": "2026-05-11T09:00:00.000Z",
 *     "responseReason": "Deposit already committed to construction costs."
 *   }
 * }
 */


// ================================================================
// 5. AGREEMENTS (AI-assisted drafting — advisory only)
// ================================================================

/**
 * POST /agreements/draft
 * Request body:
 * {
 *   "useCaseTitle": "Developer instalment plans",
 *   "partyModeLabel": "Business to Business",
 *   "buyerName": "Ada Okafor",
 *   "sellerName": "Lekki Gardens Development Co.",
 *   "title": "Lekki off-plan unit deposit",
 *   "description": "Deposit for a 2-bedroom off-plan unit, Phase 2.",
 *   "amountMinor": 35000000,
 *   "currency": "NGN",
 *   "deliveryDueDate": "2026-06-15",
 *   "releaseConditions": "Allocation letter and inspection evidence confirmed by the buyer."
 * }
 *
 * Response 200:
 * {
 *   "success": true,
 *   "data": {
 *     "version": 1,
 *     "generatedByAi": true,
 *     "sections": [
 *       { "heading": "Parties and purpose", "body": "This safe deal agreement is between Ada Okafor (the Buyer) and Lekki Gardens Development Co. (the Seller) for \"Lekki off-plan unit deposit\"." },
 *       { "heading": "Protected payment", "body": "The Buyer will fund ₦350,000.00 into a partner-issued virtual account operated by a regulated payment partner." },
 *       { "heading": "Delivery obligations", "body": "The Seller must deliver as agreed on or before 2026-06-15." },
 *       { "heading": "Release conditions", "body": "Funds are released to the Seller only when: allocation letter and inspection evidence confirmed by the buyer." },
 *       { "heading": "Disputes", "body": "Either party may open a dispute in the transaction room before release." },
 *       { "heading": "Acceptance", "body": "By accepting this agreement, both parties confirm the terms above reflect their understanding." }
 *     ]
 *   }
 * }
 */


// ================================================================
// 6. DISPUTES
// ================================================================

/**
 * GET /transactions/:id/dispute
 * Response 200 (none): { "success": true, "data": null }
 * Response 200 (open):
 * {
 *   "success": true,
 *   "data": {
 *     "dealId": "txn_7ab120",
 *     "status": "under_review",
 *     "reason": "Item not as described",
 *     "description": "The allocation letter lists a different unit number than agreed.",
 *     "openedByName": "You",
 *     "createdAt": "2026-05-06T09:00:00.000Z",
 *     "messages": [
 *       { "id": "txn_7ab120_dm1", "byName": "Naitrust Support", "byYou": false, "body": "Thanks for the details — please upload the allocation letter and your original offer for comparison.", "createdAt": "2026-05-06T09:30:00.000Z" }
 *     ]
 *   }
 * }
 */

/**
 * POST /transactions/:id/dispute
 * Request body: { "reason": "Item not as described", "description": "The allocation letter lists a different unit number than agreed." }
 * Response 200: same shape as GET above (status starts at "under_review").
 */

/**
 * POST /transactions/:id/dispute/messages
 * Request body: { "body": "Attached: original offer (offer.pdf) and the allocation letter received (allocation.pdf)." }
 * Response 200: full dispute object (as in GET above) with the new message appended to "messages".
 */


// ================================================================
// 7. NEGOTIATIONS (proposed changes to terms before the deal freezes)
// ================================================================

/**
 * GET /transactions/:id/negotiation
 * Response 200 (none): { "success": true, "data": null }
 * Response 200 (open):
 * {
 *   "success": true,
 *   "data": {
 *     "dealId": "txn_7ab120",
 *     "status": "open",
 *     "proposals": [
 *       {
 *         "id": "txn_7ab120_p1",
 *         "byName": "Lekki Gardens Development Co.",
 *         "byYou": false,
 *         "message": "Can we extend the delivery date by two weeks due to construction delays?",
 *         "changes": { "deliveryDueDate": "2026-06-29" },
 *         "status": "proposed",
 *         "createdAt": "2026-05-05T09:00:00.000Z"
 *       }
 *     ]
 *   }
 * }
 */

/**
 * POST /transactions/:id/negotiation/propose
 * Request body:
 * { "message": "Two weeks is fine, but please confirm in writing.", "changes": { "deliveryDueDate": "2026-06-29", "agreementNote": "Add a note confirming the revised delivery date." } }
 * Response 200: full negotiation object with the new proposal appended.
 */

/**
 * POST /transactions/:id/negotiation/proposals/:proposalId
 * Request body: { "action": "accepted" }
 * Response 200: full negotiation object with that proposal's status set to "accepted" and the negotiation status set to "accepted".
 */

/**
 * POST /transactions/:id/negotiation/withdraw
 * Response 200:
 * {
 *   "success": true,
 *   "data": {
 *     "dealId": "txn_7ab120",
 *     "status": "withdrawn",
 *     "proposals": [
 *       {
 *         "id": "txn_7ab120_p1",
 *         "byName": "Lekki Gardens Development Co.",
 *         "byYou": false,
 *         "message": "Can we extend the delivery date by two weeks due to construction delays?",
 *         "changes": { "deliveryDueDate": "2026-06-29" },
 *         "status": "proposed",
 *         "createdAt": "2026-05-05T09:00:00.000Z"
 *       }
 *     ]
 *   }
 * }
 */


// ================================================================
// 8. INVITATIONS
// ================================================================

/**
 * GET /invitations
 * Response 200:
 * {
 *   "success": true,
 *   "data": [
 *     {
 *       "id": "inv_5c81f0",
 *       "reference": "NT-2026-004900",
 *       "fromName": "Bright Homes Realty Ltd",
 *       "fromRole": "seller",
 *       "yourRole": "buyer",
 *       "partyMode": "b2c",
 *       "title": "Magodo duplex sale",
 *       "amountMinor": 4500000000,
 *       "currency": "NGN",
 *       "message": "Please review and accept to begin the deal.",
 *       "agreement": { "version": 1, "generatedByAi": true, "sections": [ { "heading": "Parties and purpose", "body": "This safe deal agreement is between..." } ] },
 *       "createdAt": "2026-05-08T09:00:00.000Z",
 *       "expiresAt": "2026-05-22T09:00:00.000Z",
 *       "status": "pending"
 *     }
 *   ]
 * }
 */

/**
 * GET /invitations/:id
 * Response 200: same single-object shape as one item of the array above.
 */

/**
 * POST /invitations/:id/accept
 * POST /invitations/:id/decline
 * Response 200: { "success": true, "data": { "id": "inv_5c81f0", "status": "accepted" } }
 * (or "status": "declined" for the decline endpoint)
 */


// ================================================================
// 9. NOTIFICATIONS
// ================================================================

/**
 * GET /notifications
 * Response 200:
 * {
 *   "success": true,
 *   "data": [
 *     { "id": "ntf_1", "type": "funding", "title": "Deal funded", "message": "Your deposit for the Lekki off-plan unit has been confirmed.", "read": false, "createdAt": "2026-05-02T08:00:00.000Z", "link": "/deals/txn_7ab120" },
 *     { "id": "ntf_2", "type": "evidence", "title": "New evidence uploaded", "message": "Lekki Gardens Development Co. uploaded an allocation letter.", "read": true, "createdAt": "2026-05-03T12:00:00.000Z", "link": "/deals/txn_7ab120" }
 *   ]
 * }
 * (type is one of: deal, funding, evidence, dispute, verification, system)
 */

/**
 * PATCH /notifications/:id/read
 * Response 200: { "success": true, "data": { "id": "ntf_1" } }
 */

/**
 * PATCH /notifications/read-all
 * Response 200: { "success": true, "data": null }
 */


// ================================================================
// 10. REPUTATION
// ================================================================

/**
 * GET /reputation/me
 * Response 200:
 * { "success": true, "data": { "completedTransactionsCount": 7, "ratingAverage": 4.8, "ratingCount": 5 } }
 *
 * (a user/business with no completed deals yet):
 * { "success": true, "data": { "completedTransactionsCount": 0, "ratingAverage": null, "ratingCount": 0 } }
 */


// ================================================================
// 11. UPLOAD / EVIDENCE
// ================================================================

/**
 * POST /upload/verification-document
 * Request body:
 * {
 *   "dealId": "txn_7ab120",
 *   "items": [
 *     { "fileName": "allocation-letter.pdf", "kind": "Allocation letter", "note": "Signed allocation letter for Unit 14B.", "mimeType": "application/pdf" }
 *   ]
 * }
 *
 * Response 200:
 * {
 *   "success": true,
 *   "data": [
 *     {
 *       "id": "ev_2",
 *       "fileName": "allocation-letter.pdf",
 *       "kind": "Allocation letter",
 *       "fileUrl": "https://cdn.naitrust.com/evidence/ev_2.pdf",
 *       "mimeType": "application/pdf",
 *       "uploadedByName": "You",
 *       "note": "Signed allocation letter for Unit 14B.",
 *       "createdAt": "2026-05-09T10:00:00.000Z"
 *     }
 *   ]
 * }
 */


// ================================================================
// 12. PUBLIC SUBMISSIONS (marketing site: waitlist, contact, newsletter, feedback, concern)
// ================================================================

/**
 * POST /public-submissions (public — no auth)
 *
 * Request body (waitlist):
 * { "type": "waitlist", "name": "Ada Okafor", "email": "ada.okafor@example.com", "phone": "+2348012345678", "consent": true, "source": "waitlist_modal" }
 *
 * Request body (contact):
 * { "type": "contact", "name": "Ada Okafor", "email": "ada.okafor@example.com", "subject": "Question about verification", "message": "How long does business verification usually take?", "source": "contact_page" }
 *
 * Request body (newsletter subscription):
 * { "type": "subscription", "email": "ada.okafor@example.com", "consent": true, "source": "footer_newsletter" }
 *
 * Request body (feedback):
 * { "type": "feedback", "name": "Ada Okafor", "email": "ada.okafor@example.com", "rating": 5, "message": "Really clear transaction room, made the deposit process easy to follow.", "source": "feedback_page" }
 *
 * Request body (report a concern):
 * { "type": "concern", "name": "Ada Okafor", "email": "ada.okafor@example.com", "category": "suspicious_business", "message": "This profile is using another company's CAC number.", "source": "report_page" }
 *
 * Response 200 (all types):
 * { "message": "Thanks — you're on the list.", "reference": "SUB-2026-00123" }
 * (Note: this endpoint's response is NOT wrapped in { success, data } like the
 * others above — it returns the bare { message, reference } object.)
 *
 * Response 400 (validation failure):
 * { "message": "Please provide a valid email address." }
 */
