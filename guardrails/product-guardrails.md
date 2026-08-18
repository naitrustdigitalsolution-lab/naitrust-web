# Naitrust Product Guardrails

Last updated: 17 August 2026

## 1. Product Positioning and Language

Naitrust is a protected-commerce and sourcing platform for Nigerian individuals and businesses. China and Nigeria are the active launch markets. Naitrust is not presented as a bank, courier, insurer, customs authority, employer of independent agents, or guaranteed supplier marketplace.

### Product hierarchy

Naitrust must be presented in this order:

1. Discover products, services, sourcing agents, and verified suppliers in China or Nigeria.
2. Review translated listings, supplier showcases, verification facts, and Trust Profiles.
3. Request and approve a confirmed quote showing product cost, exchange rate, logistics, inspection, customs, handling, insurance, and delivery where applicable.
4. Pay through a protected order and track preparation, inspection, export, customs, delivery, evidence, messages, refunds, and release in one Order Room.

Payments, balances, Protected Deals, and withdrawals support this commerce journey. Legacy transfers, payment requests, bills, airtime, rewards, and virtual cards must not lead the homepage, onboarding, dashboard, or primary navigation.

- Keep secondary utilities accessible when they are operationally supported; do not describe them as Naitrust's main purpose.
- Do not promote bill payment or airtime in the homepage hero or primary feature story.
- The first dashboard actions must help an account discover products, build a cart, review quotes, track orders, or manage selling activity.
- Individual and business accounts may both source products from China and Nigeria. Business accounts additionally publish showcases, sell products, fulfil customer orders, and withdraw eligible earnings.
- “Verified” means the displayed checks were completed. It is not a guarantee, endorsement, insurance policy, or promise that a deal cannot go wrong.

### Account and mock-data isolation

- Every cart, quote, order, agent task, seller product, message, and account-specific fixture must be scoped by the authenticated user and, where applicable, the selected business.
- Never use a global browser-storage key for authenticated commerce data.
- A business action must never appear in another business or individual account unless an explicit shared-order relationship grants access.
- Public suppliers, catalogue listings, and public showcases may be shared fixtures; private commerce state may not.
- Frontend scoping is only a mock safeguard. Production APIs must derive ownership from authenticated server-side authorization and must never trust a client-supplied owner ID.

### Marketplace availability and claims

- China and Nigeria may be shown as active staged markets using curated fixtures and mock operations.
- Japan, Thailand, and the United States remain Coming soon until operational capability exists.
- Browsing can be public. Cart, quote, agent hiring, payment, messages, and order management require authentication.
- Catalogue prices are estimates. A customer pays only after Naitrust issues a time-limited confirmed quote.
- Do not imply live international fulfilment, customs brokerage, FX execution, or supplier integration until the necessary partners and operations are active.

### Sourcing agents and AI recommendations

- Naitrust may use AI-assisted rules to suggest an agent when product type, location, value, customization, inspection needs, or supplier gaps make local support useful.
- Suggestions are optional, explain why the agent may fit, and never add or hire an agent automatically.
- The customer or business chooses the agent, scope, deadline, evidence, and separate service fee.
- Agents never receive, control, redirect, approve, or release supplier purchase funds.
- Clearly disclose whether an agent is independent, how Naitrust verifies and monitors them, and whether Naitrust earns a fee.
- Recommendations must not rank agents only by commission. Suitability, availability, capability, conflicts, performance, language, and location are required factors.
- Preserve a complaint, replacement, suspension, and appeal process. Do not market an agent recommendation as a guarantee of product quality or delivery.

### Production workflows and partner access

- A production workflow may connect the main product, packaging, labels, inspection, consolidation, and shipping across different suppliers.
- Each stage must identify its responsible supplier, confirmed specification, quantity, deadline, evidence, quote, payment allocation, and current status before production begins.
- A missing supplier may become an agent sourcing request. The agent may recommend candidates and submit evidence but cannot select a supplier, amend an accepted quote, or move money without customer approval.
- Partner registration is separate from customer and business registration. Applications remain pending until an authorized Naitrust administrator reviews them.
- Approved agents and suppliers receive revocable, role-scoped access. Production credentials must be generated and stored by the backend, hashed at rest, rate-limited, auditable, and never embedded in frontend code.
- Supplier profiles should record operating history, product categories, customization capabilities, capacity, lead times, export experience, languages, locations, evidence, performance, complaints, and verification dates. Experience is context, not a guarantee.
- Partner workspaces expose only assigned enquiries, tasks, documents, and settlement records. A supplier or agent must never browse another partner's private work.
- The China partner experience launches in English and Simplified Chinese. Legal, payment, compliance, and agreement translations require controlled human review before production use.

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
- Naira is the default customer currency. Eligible business quotes may offer USD payment only when a contracted provider supports the collection method, customer type, corridor, purpose, limits, screening, refunds, and reconciliation.
- Do not present a stored USD balance, currency swap, or foreign-currency account until an approved licensed partner explicitly provides that product for Naitrust's customer and transaction model.
- Customer collection, supplier settlement, agent payout, logistics charges, and refunds are separate ledger obligations even when one provider processes several legs.
- China supplier and China agent settlement uses CNY or USD. CNY is Chinese yuan; JPY is Japanese yen and must never be used for a China payment merely because the currencies are confused in copy or configuration.
- Before confirmation, show the collection amount, collection currency, applied FX rate and expiry, provider fees, settlement currency, expected recipient amount, and refund treatment.
- Naitrust must never describe a frontend conversion estimate as an executed FX trade or guaranteed beneficiary amount.

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
