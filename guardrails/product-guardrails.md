# Naitrust Product Guardrails

Last updated: 10 August 2026

## 1. Product Positioning and Language

Naitrust is a payments and Protected Deal platform. It is not presented as a bank, marketplace, courier, insurer, or generic wallet.

### Product hierarchy

Naitrust must be presented in this order:

1. Find a registered business and review its Trust Profile.
2. Understand the available verification information before paying.
3. Pay the business normally or use a Protected Deal when more protection is needed.
4. Keep the agreement, payment status, messages, and evidence together in the Deal Room.

Send money, receive money, balances, payment requests, and payment history support this journey. Bills, airtime, rewards, and similar utilities are secondary conveniences; they must not lead the homepage, waitlist, onboarding, dashboard, or primary navigation hierarchy.

- Keep secondary utilities accessible when they are operationally supported; do not describe them as Naitrust's main purpose.
- Do not promote bill payment or airtime in the homepage hero or primary feature story.
- The first dashboard actions should help a customer find/check a business, pay a business, or protect a payment. Business accounts should lead with their Trust Profile, business discovery, and Protected Deals.
- “Verified” means the displayed checks were completed. It is not a guarantee, endorsement, insurance policy, or promise that a deal cannot go wrong.

Use these customer-facing terms consistently:

- **Protected Deal**: the core protected-payment product.
- **Deal Room**: the shared workspace for a Protected Deal.
- **Protect a Payment**: the primary creation action.
- **Money**: the customer-facing balance and activity area.
- **Available balance**: money available for permitted payments or withdrawal.
- **Money in Protected Deals**: money committed to active Protected Deals.
- **Release payment**: the final payment-release action.
- **Other party**: preferred customer-facing wording; reserve “counterparty” for internal, technical, or legal use.
- **Delivery review period**: the period controlling automatic payment release after receipt.
- **Report an issue**: the first customer action; use “dispute review” when a formal evidence review begins.

Do not alternate between Protected Deal, Protected Purchase, Protected Transaction, and escrow in ordinary product copy. “Transaction” may still describe a ledger record, receipt, transaction PIN, or legal/payment-partner event.

## 2. Payment and Partner Boundary

- Naitrust must not claim that it directly holds customer funds.
- Protected funds must move through an approved, appropriately licensed payment-partner structure.
- The payment integration must support protected-fund status, conditional release, release freezes, refunds, reconciliation, idempotency, authorization, and verified webhooks.
- Frontend status is never proof that money moved. Partner confirmation and reconciled ledger state are authoritative.
- No production balance, funding, payout, release, or refund may be simulated.
- Sandbox balances and test transactions must remain unmistakably labelled and isolated from production.

## 3. Deal-Specific Liveness

- Creating a Protected Deal requires a liveness capture for that specific deal or draft.
- Accepting an invitation requires a separate liveness capture for that acceptance.
- A general account liveness check must never silently satisfy a deal action.
- Each deal capture must have an immutable capture ID, actor user ID, captured timestamp, and secure backend evidence reference.
- A draft may reuse only its own liveness capture for up to 24 hours from capture.
- Editing or autosaving a draft must not extend the liveness expiry.
- When the 24-hour period expires, preserve the draft but require a new capture before creation.
- Validate liveness freshness again on the backend at submission time. A frontend gate alone is insufficient.
- Production images must be encrypted and access-controlled. The client should retain an opaque capture reference, not use browser storage as the system of record.
- Before capture, tell the actor that the other verified deal participant can view the deal-specific photo and require acknowledgement.
- Unauthenticated invitation previews may show only that liveness passed, the representative name, and capture time; they must never expose the image or a retrievable image URL.
- Authenticated intended recipients may view the creator capture, and accepted participants may view the other party's capture in the Deal Room through short-lived authorised access.
- Watermark every participant-visible image with the deal reference, representative name, and capture time, and log every view.
- Participant photo access ends 90 days after deal closure unless a dispute, investigation, regulatory requirement, or legal hold applies. Preserve only required verification and audit metadata afterward.
- Deal-specific captures are not profile photos and must never be reused across deals.

## 4. Authentication and Session Security

- Authenticated sessions expire after five minutes without genuine user activity.
- Refreshing the page, switching tabs, or reopening a background tab must not reset an already-expired session.
- Pointer, keyboard, touch, and intentional scrolling may count as activity. Background timers and passive application work must not.
- Sensitive actions still require their own controls even during an active session: transaction PIN, authorization, and action-specific liveness where required.
- Verification codes accept digits only, support paste and one-time-code autofill where appropriate, and must never be logged.
- Transaction PINs are masked, verified server-side, rate-limited, and never stored or compared as plaintext in production.

## 5. Deal Creation

- Under **Payment release setup**, show Single release as selected and **Recommended**.
- Keep milestone tracking and recurring deal visible but disabled and labelled **Coming soon** during the pilot.
- Frontend and backend must reject new milestone, recurring, split-release, or extended-testing deal payloads during the pilot.
- During the single-release pilot, the payment review is one hour and extended testing periods are unavailable.
- The review period controls Naitrust’s release workflow; it does not remove statutory, warranty, return, or consumer rights.
- Deal categories must be understandable and realistic. Default examples include product purchase, supplier stock, wholesale order, service or repair, contractor/project, vehicle, property payment, and something else.
- Do not classify every ordinary product purchase as high-risk merely because it is a product.

## 6. Seller Evidence and Dispatch

- Before dispatch or delivery-code creation, the seller records evidence reasonably relevant to the deal.
- Accepted evidence can include a photo, video, document, receipt, model, serial/IMEI, working-condition proof, packaging, seal, courier, pickup evidence, or insurance evidence.
- Do not require irrelevant evidence. A seller may choose **Not applicable** with a reason.
- Evidence requirements must be proportionate. Food may not have an IMEI; a package may not use a numbered seal.
- Future AI may assess whether uploaded evidence relates to the deal and reject obviously irrelevant material, but human review and an appeal path remain necessary.
- High-value or fragile pilot deals may display tracked-delivery and insurance recommendations. Missing insurance alone must not block a deal unless an approved pilot policy explicitly requires it.

## 7. Delivery Card and Receipt

- A buyer must not confirm receipt without the delivery card, QR code, or PIN physically accompanying the parcel or delivery person.
- The seller cannot generate a delivery card until the required seller-evidence checklist is complete.
- Entering the delivery code means the item was physically received. It does not mean the item was accepted as fault-free.
- The ten-minute handover check and delivery review period control payment release only.
- The one-hour payment review starts when the buyer confirms the handover early or when the issue-free ten-minute handover check expires.
- At the review deadline, the backend may authorize automatic release only when no evidence-backed issue, dispute freeze, or approved risk control blocks it.
- After payment release, disable Naitrust payment-dispute creation for that payment while preserving statutory, warranty, fraud-reporting, and other legal rights.

## 8. Buyer Evidence and Issues

- Buyer evidence during normal receipt is optional.
- The buyer may report an issue without evidence, but Naitrust must warn that insufficient evidence may affect the decision.
- Opening an evidence-free issue does not by itself freeze release.
- Automatic release is frozen when the buyer supplies relevant evidence or another approved fraud/risk control requires a freeze.
- The system must record exactly when evidence was submitted and why a freeze began.
- Supported issue categories include damaged in transit, wrong item, defective item, missing contents, tampered packaging, and non-delivery.

## 9. Disputes and Release Decisions

- Seller-arranged delivery: the seller remains responsible until the buyer receives the goods in the agreed condition, subject to applicable law and the final approved policy.
- Buyer-arranged independent delivery: risk may transfer after documented courier handover, subject to the parties’ agreement and applicable law.
- Wrong, defective, incomplete, damaged, tampered, or undelivered goods must be reviewable before payment release.
- When seller responsibility is established, resolve through refund after return, replacement, partial settlement, or another documented agreement.
- When evidence is inconclusive, do not release automatically; keep the payment frozen for manual review.
- Manual reviewers must collect evidence from both parties, record the decision and reason, and preserve an immutable audit trail.
- Naitrust may state that it does not transport or insure goods, but it must not imply that this automatically removes seller, courier, negligence, warranty, or statutory liability.

## 10. Backend Enforcement and Auditability

Before enabling real protected payments, backend enforcement must include:

- authenticated authorization and role checks;
- action-specific liveness validation;
- double-entry or equivalently auditable ledger reconciliation;
- release freezes enforced server-side;
- idempotent money-moving commands and webhook processing;
- verified, replay-resistant partner webhooks;
- durable deadlines and background jobs;
- encrypted evidence retention with access logs;
- immutable event and decision audit records;
- safe retry, refund, and partial-settlement handling;
- monitoring and operational escalation.

Client state, local storage, mock runtime state, timers, or disabled buttons are never sufficient enforcement for production money movement.

## 11. Launch Gates

Do not enable real funds until:

- the payment partner approves the protected-fund and release structure;
- Nigerian legal counsel approves the consumer, delivery-risk, dispute, privacy, liveness, and liability wording;
- damaged, wrong, missing, tampered, late, and never-delivered scenarios pass end-to-end tests;
- release freezes, refunds, reconciliation, authorization, deadlines, evidence retention, idempotency, and audit logs are verified;
- moderated pilot deals confirm that buyers and sellers understand receipt, inspection, evidence, release, and dispute outcomes.

## 12. Change Control

Any change that weakens identity verification, shortens evidence retention, bypasses a freeze, releases money automatically during an unresolved review, changes payment custody wording, or broadens production money movement requires explicit product, compliance, engineering, payment-partner, and where applicable legal approval.

When uncertain, preserve funds, preserve evidence, preserve the audit trail, and escalate for review.
