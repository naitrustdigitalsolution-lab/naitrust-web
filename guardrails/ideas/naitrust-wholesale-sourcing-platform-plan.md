# Naitrust Wholesale Sourcing Platform Plan

Status: Proposed product and implementation direction  
Prepared: 18 August 2026  
Markets at launch: China and Nigeria

> This document describes the intended next version of Naitrust. It is not permission to weaken the controls in `guardrails/product-guardrails.md`. Real verification, custody, FX, settlement, logistics, insurance, or customs capabilities must not be advertised until the required providers, contracts, backend controls, and operations are active.

## 1. Product Vision

Naitrust will become the organizing infrastructure for safely buying wholesale products from China and Nigeria.

The platform connects:

- Nigerian individuals and businesses buying wholesale products.
- Verified Chinese and Nigerian suppliers.
- Vetted sourcing and inspection agents near supplier locations.
- International and domestic logistics providers.
- Licensed payment partners responsible for collections, FX, custody, settlement, refunds, and reconciliation.
- Naitrust operations staff coordinating verification, evidence, quotes, exceptions, and disputes.

The defensible product is not only a product catalogue. It is the complete, auditable sourcing journey:

1. Discover a product or submit an external product link.
2. Identify and verify the supplier.
3. Clarify specifications, customization, quantity, and target price.
4. Hire a suitable local sourcing agent when useful.
5. Receive a separate quote for each supplier.
6. Fund the order through a licensed payment partner.
7. Follow production, bargaining, inspection, and custody evidence.
8. Approve supplier payment milestones only after the agreed checks.
9. Consolidate ready orders into flexible shipment batches.
10. Track export, customs, and delivery to Nigeria.

Naitrust should feel like a sourcing operating system rather than a generic payment application.

## 2. Positioning and Brand Direction

### Core positioning

**Wholesale sourcing, organized from supplier to delivery.**

Naitrust brings verified suppliers, local sourcing support, separate supplier orders, confirmed landed costs, payment visibility, inspection evidence, and consolidated delivery into one clear journey across China and Nigeria.

### Hero direction

- Eyebrow: `Wholesale sourcing · Verified suppliers · Confirmed landed cost`
- Headline: `Wholesale sourcing, organized from supplier to delivery.`
- Supporting copy: `Find products in China or Nigeria, verify the supplier, follow sourcing and inspection evidence, understand the full cost, and coordinate delivery in one place.`
- Primary action: `Explore wholesale products`
- Secondary action: `Find a product`

Use one short, muted cinematic hero loop showing:

1. A sourcing agent checking products or cartons in China.
2. Goods from multiple suppliers entering a consolidation workflow.
3. A truck, container, port, or vessel representing international transport.
4. A Nigerian business owner receiving the shipment.

Provide WebM and MP4 sources, a static poster, mobile-optimized media, an accessible description, and a static reduced-motion fallback. Do not use fake certificates, unsupported verification claims, or unrelated generic payment imagery.

### Active markets

- China: active for international sourcing.
- Nigeria: active for domestic wholesale buying and selling.
- Other countries remain future additions and should not distract from the two active markets.

Both individual and business accounts can source products. Business accounts can also publish products, manage a showcase, answer quote requests, fulfil orders, and withdraw eligible earnings.

## 3. Marketplace and Supplier Discovery

### Marketplace structure

- Public visitors can browse suppliers, products, showcases, verification facts, and Trust Profiles.
- Authentication is required for carts, quote requests, messages, favourites, agent hiring, payment, and order management.
- Search returns products, suppliers, and wholesale services.
- Filters cover country, category, supplier, MOQ, estimated price, customization, location, verification, rating, and delivery destination.
- The desktop filter panel uses a persistent sidebar. Mobile uses a compact filter sheet.
- Product and supplier imagery must be unique, contextually correct, and mapped through the central image manifest.

### Supplier destination

Each supplier has two distinct areas:

- **Showcase:** products, services, photos, videos, factory or shop information, customization, capacity, MOQs, fulfilment, previous work, and operational media.
- **Trust Profile:** legal identity, verification checks, operating location, transaction history, ratings, reviews, complaints, verification dates, and limitations.

The public profile may display the verified legal company name and verification facts. It must not expose private phone numbers, email addresses, social handles, messaging IDs, payment details, or other direct contact routes.

### Product pages

Display:

- Supplier and source country.
- Original source price and currency.
- Estimated NGN price.
- MOQ and unit.
- Variants and specifications.
- Customization and private-label options.
- Production lead time.
- Seller-paid or buyer-paid logistics responsibility.
- Relevant inspection suggestions.
- Add to shopping list and request clarification actions.

Catalogue prices remain estimates until Naitrust issues a time-limited confirmed quote.

## 4. Smart Product Sourcing

### Find a product

Customers can begin with:

- A public product or supplier URL from a Chinese marketplace.
- Product images or screenshots.
- An English written brief.
- A combination of link, images, and text.

AI should extract and normalize:

- Source platform and URL.
- Product title and images.
- Seller or store identity.
- Marketplace seller identifier.
- Listed location.
- Price range and currency.
- MOQ.
- Variants, specifications, and customization.
- Available business identifiers.
- Extraction confidence and source evidence.

The user reviews the extracted brief before submission. If the link provides insufficient information, ask only for missing facts such as screenshots, store name, city, desired quantity, dimensions, material, branding, packaging, target price, or deadline.

### Safe ingestion

- Accept only approved URL protocols and domains.
- Add SSRF protection, response size limits, timeouts, sanitization, and malware checks.
- Do not scrape login-protected pages or bypass CAPTCHAs.
- Respect platform terms and use official commercial APIs where available.
- Store field-level provenance so staff and users can distinguish extracted facts from assumptions.

### Verification offer

- Provide a free basic AI and registry scan.
- Show what was found, what remains uncertain, and the date checked.
- Offer buyer-approved deeper verification or a physical agent visit.
- Do not enable supplier payment until the minimum verification policy for that order is satisfied.
- AI can assist, but only authorized humans or verified providers can approve a supplier verification status.

## 5. Multi-Supplier Shopping, Quotes, and Orders

### Shopping list

A shopping list may contain products from multiple suppliers. Submission creates:

- One parent quote-request batch for the buyer.
- One supplier quote request per supplier.
- Independent specifications, agent assignment, verification, price, readiness, payment, and dispute state for each supplier.

Orders from different suppliers must never share product-fund balances or readiness state.

### Confirmed quote

Each supplier quote includes:

- Product subtotal.
- Original supplier price and source currency.
- Confirmed NGN total.
- Eligible USD payment amount where a contracted provider supports it.
- FX rate and expiry.
- Verification and inspection costs.
- Agent fee where applicable.
- Packaging, handling, insurance, customs, and logistics estimates.
- Production and delivery window.
- Cancellation, refund, and committed-cost rules.
- One-off or milestone payment schedule.

The customer accepts or rejects each supplier quote independently.

### Product customization

Every quote request supports a plain-English customization field. AI may turn the buyer's request into a structured supplier brief covering materials, dimensions, colours, branding, packaging, sample requirements, quantity tolerances, quality checks, and target date. The buyer approves the structured brief before it is sent.

## 6. Sourcing Agent Network

### Agent discovery and recommendation

Recommend active agents using:

- Supplier city and service radius.
- Product category and technical expertise.
- Required service type.
- Languages.
- Availability and travel time.
- Price or price range.
- Completed tasks and evidence quality.
- Ratings, complaints, and cancellation rate.
- Conflicts of interest.

AI presents a shortlist with clear reasons. The buyer always chooses the agent; no agent is hired automatically.

Pre-hire profiles show approximate city and coverage radius. Exact assignment locations or live check-ins appear only after hiring, task-specific consent, and only for the assignment duration.

### Agent cards

Show:

- Name and verified profile photo.
- City and approximate coverage.
- Expertise such as automotive, clothing, electronics, printing, packaging, machinery, beauty, furniture, or food.
- Languages.
- Sourcing, factory-visit, bargaining, inspection, evidence, consolidation, and logistics capabilities.
- Starting fee or price range.
- Rating, completed assignments, response time, and verification summary.

### Favourites and reuse

- Customer and business accounts can favourite an agent.
- Favourites are private and account-scoped.
- A previous agent can be invited to a new order, subject to fresh availability, scope, conflicts, and pricing.
- Reuse never silently assigns the agent or reuses an old price.

### Assignment scope

Create one agent assignment per supplier order. If that order contains several products, each product receives a separate inspection scope and evidence checklist inside the assignment.

An agent may be assigned to:

- Locate a missing supplier.
- Confirm a supplier location.
- Conduct a factory or market visit.
- Verify product availability.
- Clarify specifications.
- Bargain on price or MOQ.
- Review samples.
- Inspect production.
- Confirm final quantity and quality.
- Confirm custody or warehouse handover.
- Coordinate pickup or logistics when separately approved.

### Agent communication room

Each assignment gets a dedicated room containing:

- Messages and translated summaries.
- Bargaining notes and supplier responses.
- Images, video, audio, and documents.
- Product-specific inspection checklists.
- Revision and additional-evidence requests.
- Agent check-ins, timestamps, and consented location evidence.
- Decisions and activity history.

Uploads alone never authorize payment.

## 7. Agent-Certified Supplier Payment

### Principle

The customer experiences the action as **Pay through Naitrust**, but money enters a unique safeguarded or collection account supplied by a licensed financial partner and mapped to the order. Naitrust must not claim that it directly holds deposits.

The licensed partner pays the verified supplier directly. Sourcing agents do not receive, redirect, release, or control supplier purchase funds.

### Release workflow

1. Buyer approves the confirmed quote and funds the order.
2. Product funds remain assigned to that supplier order.
3. Agent performs the agreed checks and uploads evidence.
4. Agent selects **Certify products & request supplier payment**.
5. The system validates that the required evidence is present.
6. Buyer reviews the evidence and selects **Approve payment**, **Request changes**, or **Report an issue**.
7. Buyer approval requires a transaction PIN and any risk-based control.
8. The licensed payment partner executes supplier settlement.
9. Provider confirmation and reconciled ledger state update the order.

The product should call the agent action a **readiness certification** or **release recommendation**, not a guarantee. A guarantee could imply financial liability or insurance that may not exist.

### Readiness certifications

An agent may certify that:

- Supplier identity and operating location were checked.
- Product specifications matched the agreed brief.
- Quantity was confirmed.
- Customization or sample was approved.
- Production reached the required milestone.
- Final inspection passed.
- Products entered the agent's or approved warehouse's custody.
- Products were handed to the approved logistics provider.

### Milestone payments

Support:

- One payment after final inspection.
- Deposit and balance.
- Multiple production milestones.

Example:

- 20% after supplier verification and sample approval.
- 30% after production evidence.
- 50% after final inspection and confirmed custody.

Each milestone has its own amount, evidence requirements, agent recommendation, buyer approval, settlement record, and dispute state.

If the buyer does not approve, funds remain pending. There is no automatic supplier release based solely on an agent recommendation. Stale requests escalate to Naitrust operations rather than silently releasing.

High-value or high-risk orders may require admin review, independent inspection, or warehouse confirmation before buyer approval becomes available.

## 8. Chain of Custody and Inspection

### Chain of custody

When goods enter an agent's, warehouse's, or logistics provider's control, record:

- Releasing and receiving parties.
- Date, time, and consented location.
- Package count, weight, and dimensions.
- Carton, batch, and seal identifiers.
- Photos and video.
- Condition at handover.
- Warehouse or pickup receipt.
- The next responsible party.

Only verified custody evidence can satisfy a custody-based release condition.

### Category-specific inspection templates

Maintain reusable templates for:

- Clothing and footwear.
- Electronics and phone accessories.
- Automotive products.
- Machinery and tools.
- Printing, labels, and packaging.
- Beauty and personal care.
- Food and agricultural products.
- Furniture and construction materials.

AI may draft a checklist from the accepted product brief, but the buyer or operations team approves it before inspection.

## 9. Logistics Partner Network

### Partner role

Add `logistics_provider` alongside `sourcing_agent` and `supplier`.

Footer links:

- Become a sourcing agent.
- Register as a supplier.
- Become a logistics partner.

Each link opens a focused application form. Submission does not create immediate platform access. Approved partners receive a secure invitation to create credentials and MFA; production must not expose reusable plaintext access codes.

### Logistics application

Collect:

- Legal company name, registration, and representative.
- Countries, cities, ports, and routes covered.
- China pickup and warehouse locations.
- Nigerian delivery coverage.
- Air, sea, road, consolidation, customs, or last-mile services.
- Cargo categories and restricted products.
- Weight and volume capacity.
- Typical departure and delivery schedules.
- Pricing model and supported currencies.
- Freight-forwarding, customs, and warehouse licences.
- Insurance and claims information.
- Carrier relationships and operational history.
- Facility and equipment media.
- Payout account details.

Nigerian freight-forwarding and customs credentials must be checked with the relevant authorities where applicable.

### Agents offering logistics

A sourcing agent may add logistics as a service, but Naitrust verifies that capability separately. The partner may display multiple approved badges, such as sourcing, inspection, consolidation, or logistics.

If an assigned agent is approved for the relevant route, the platform may recommend requesting a logistics quote from them. The buyer can accept or compare other providers. Sourcing, inspection, custody, and logistics remain separate scopes, quotes, fees, evidence, and performance records even when one partner performs several services.

### Shipment batching

- Supplier orders become ready independently.
- Default recommendation: wait for all selected orders before shipping.
- Buyer may create a shipment from a ready subset when delays justify it.
- A shipment batch never changes the underlying supplier orders or product-fund ledgers.

The shipping quote includes supplier pickup, warehouse consolidation, export packing, insurance, freight, customs estimate, and local Nigerian delivery.

### Logistics Room

Each shipment has a room containing:

- Included supplier orders.
- Pickup and warehouse schedules.
- Consolidation updates.
- Package count, weight, volume, cartons, and seals.
- Packing list and commercial invoice.
- Freight and insurance quote.
- Payment and committed-cost record.
- Booking and tracking events.
- Export, customs, and delivery documents.
- Photos, video, and handover evidence.
- Damage, loss, claims, refunds, and activity history.

## 10. Money Transparency

### Customer view

Every order shows:

- Amount funded and currency.
- Licensed provider handling the collection.
- Product funds assigned to the supplier order.
- Agent service fee.
- Verification and inspection fees.
- Logistics allocation.
- Costs already committed.
- Amount still refundable.
- FX rate, expiry, and conversion status.
- Supplier milestone payments.
- Agent and logistics payouts.
- Refunds, reversals, and receipts.

### Currency accounts

- NGN is the default.
- Eligible accounts may receive a partner-hosted USD account only when contractually supported.
- Never simulate a production USD balance or currency swap.
- A conversion becomes final only after the provider supplies a live quote, the user accepts before expiry, and the provider confirms execution.
- Supplier and China-partner settlements may use CNY or USD according to the contracted corridor.

### Financial controls

- Customer collections, supplier payments, agent fees, logistics charges, FX, and refunds are separate ledger legs.
- Frontend status is never proof of money movement.
- Webhooks must be signed, replay-resistant, idempotent, and reconciled.
- Admins cannot type or directly mutate balances.
- Sensitive payouts and refunds require role permission, a reason, and dual approval above configured thresholds.

## 11. Flexible Shipping and Import Compliance

The sourcing journey should capture or guide:

- Incoterms such as EXW, FOB, CIF, and DDP.
- HS-code suggestions with human confirmation.
- Restricted and prohibited product warnings.
- Importer identity and TIN where required.
- Form M, PAAR, and other applicable documentation.
- Customs duty, levy, and tax estimates.
- Product-specific approvals such as SON or NAFDAC where applicable.
- Insurance selection and exclusions.

Naitrust may organize and explain these requirements, but must not describe itself as the customs authority, licensed customs broker, insurer, or legal adviser.

## 12. Rewards

- Maintain a ledger-based reward account.
- Award points only after eligible orders or agent tasks complete without an unresolved issue.
- Rewards are idempotent and cannot be created twice from one event.
- Points are not cash, cannot be transferred, and are not awarded for positive reviews.
- Redeem points as service credits for verification, inspection, logistics, or Naitrust platform fees.
- Admin can configure earning rules, expiry, redemption limits, and campaigns with an audit trail.

## 13. Anti-Circumvention and Platform Safety

Naitrust cannot truthfully guarantee that a publicly identified legal company will never be found elsewhere. The product should make circumvention difficult and unattractive through safety, convenience, evidence, reputation, and contractual controls.

Controls include:

- Hide phone numbers, email addresses, social handles, QR contact codes, payment links, and direct payment details.
- Redact prohibited contact details in messages.
- OCR images and documents for phone numbers, social handles, QR codes, and off-platform payment instructions.
- Transcribe and moderate audio where consent and policy allow.
- Keep legally required trade documents in a controlled document channel with role-based access and redaction.
- Watermark evidence and preserve an immutable audit trail.
- Warn, block, review, suspend, or remove accounts for repeated circumvention attempts.
- Use partner contracts, non-solicitation terms where counsel approves, and transparent sanctions.
- Preserve the platform benefits users lose when leaving: verified records, payment controls, agent reputation, inspection evidence, disputes, refunds, consolidation, and logistics coordination.

## 14. Customer and Business Experience

### Customer navigation

- Market
- Find a product
- Quotes
- Orders
- Agents
- Shipments
- Messages
- Money
- Rewards
- Account

Keep the cart in the application header rather than the sidebar.

### Business navigation

- Business home
- Buy
- Sell
- Market
- Find a product
- Cart
- Quotes
- Orders
- Agents
- Shipments
- Showcase
- Products
- Customers
- Earnings and Money
- Messages
- Rewards
- Account

Business accounts must have the complete China and Nigeria buying experience, not only seller tools.

### Dashboard

Use a sourcing command centre rather than generic money cards:

- Paste a link, upload an image, or describe a product.
- Active supplier requests.
- Quotes awaiting action.
- Agent updates and evidence.
- Supplier readiness.
- Orders ready for shipment.
- Shipment and customs updates.
- NGN and eligible USD account status.
- Service-credit rewards.

All private mock and production data must be account-scoped.

### Protected Deals

Marketplace purchasing uses a simplified **Sourcing Order** flow:

1. Product and customization.
2. Supplier or supplier search.
3. Verification and optional agent.
4. Confirmed quote and payment schedule.
5. Funding and Order Room.

Generic Protected Deals remain available as a secondary tool for non-market services, custom agreements, and historical compatibility.

## 15. Waitlist and Partner Entry

### Early-access copy

- Title: `Bring your next wholesale order into one clear journey.`
- Description: `Join early access to find verified suppliers, request landed-cost quotes, hire sourcing support, and coordinate delivery from China or within Nigeria.`

Show benefits:

- Find or submit a product.
- Verify the supplier.
- Follow sourcing and inspection evidence.
- Know the confirmed cost before payment.
- Coordinate delivery to Nigeria.

Capture:

- Buyer, Nigerian supplier, or both.
- China or Nigeria interest.
- Product categories.
- Typical order size and frequency.
- Existing use of Chinese marketplaces.
- Need for sourcing, verification, customization, inspection, packaging, or shipping.
- Contact and consent.

Waitlist submissions become filterable admin leads with status, owner, notes, tags, and follow-up history.

### Partner applications

Sourcing agents, suppliers, and logistics providers use separate bilingual forms. Registration remains pending until Naitrust completes the relevant checks. The China partner experience launches in English and Simplified Chinese.

## 16. Admin Portal

Replace the narrow Partner Network approval screen with a complete responsive `/app/admin` operations portal. Keep `/app/partner-admin` as a compatibility redirect.

### Navigation

- Overview
- Sourcing requests
- Suppliers
- Products and showcases
- Agents
- Agent assignments
- Logistics applications
- Logistics providers
- Quotes
- Orders
- Supplier payment requests
- Shipment batches
- Customs and delivery
- Payments and reconciliation
- Rewards
- Messages and moderation
- Waitlist and leads
- Users and businesses
- Reports
- Audit log
- Settings

### Overview

Show operational queues rather than decorative metrics:

- New sourcing requests.
- Missing product information.
- Supplier checks awaiting review.
- Partner applications.
- Agent evidence awaiting review.
- Release recommendations awaiting buyer or admin action.
- Supplier quote delays.
- Orders ready for shipment.
- Logistics exceptions.
- Payment and reconciliation exceptions.
- Refund and dispute queues.
- Moderation alerts.
- SLA and performance indicators.

### Supplier management

- Create suppliers directly or review applications.
- Manage legal identity, locations, categories, capabilities, capacity, products, MOQs, customization, languages, fulfilment, and media.
- Record verification as dated, expiring, evidence-backed checks rather than one universal badge.
- Approve, request information, reject, pause, suspend, and schedule reverification.
- Preserve internal contacts while hiding them from public and customer-facing channels.

### Agent management

- Review identity, documents, experience, references, expertise, languages, locations, service radius, availability, fees, evidence standards, and payout corridor.
- Add vetted agents from the back office.
- Manage sourcing, inspection, consolidation, and separately verified logistics capabilities.
- Review assignments, earnings, evidence quality, complaints, cancellations, response time, and completion performance.
- Support probation, approval, suspension, reactivation, reassignment, and appeal.

### Logistics management

- Review applications, licences, insurance, routes, capacity, warehouses, carriers, pricing, and operational evidence.
- Manage provider service areas and availability.
- Review and compare shipping quotes.
- Build and monitor shipment batches.
- Track customs documentation and delivery exceptions.
- Manage loss, damage, insurance, and refund cases.

### Payment operations

- Review order funding, allocations, FX, supplier milestone requests, agent fees, logistics charges, settlements, refunds, and reconciliation.
- Require evidence and reason codes for financial actions.
- Apply dual approval above risk thresholds.
- Never allow direct balance editing.
- Record every read, export, approval, rejection, and change.

### Admin roles

- `super_admin`
- `sourcing_ops`
- `supplier_verification`
- `agent_ops`
- `logistics_ops`
- `finance_ops`
- `support`
- `content_admin`

Production APIs enforce permissions independently of the frontend. Sensitive information is masked by default and exposed only to authorized roles.

## 17. Verification and Infrastructure Providers

Use provider adapters so vendors can be replaced without changing product contracts.

### China supplier verification

- GSXT official enterprise registry: <https://bt.gsxt.gov.cn/>
- Qichacha business and operating-risk data: <https://openapi.qcc.com/services/aboutUs>
- Sumsub KYB, ownership, and AML checks: <https://docs.sumsub.com/docs/verify-businesses>
- Trulioo may be evaluated as a KYB alternative: <https://developer.trulioo.com/reference/guide-business-verification>
- D&B or Creditsafe may support enhanced credit and export-risk checks for high-value orders.

No API alone verifies product quality. Registry checks must be combined with operational documents, sample checks, inspection, and physical evidence when required.

### Nigeria supplier verification

- CAC company search: <https://www.cac.gov.ng/services/company-search>
- CAC VAS APIs: <https://vas.cac.gov.ng/>
- QoreID or Dojah may be evaluated as provider adapters if necessary.

### Maps

- Use AMap/Gaode for China maps, geocoding, service areas, routes, and approximate agent discovery, subject to commercial authorization: <https://lbs.amap.com/api/JavaScript-api/summary>

### Payments

- Validate the proposed collection, safeguarded-fund, subledger, FX, supplier-settlement, refund, and marketplace structure with a licensed provider before launch.
- Fincra may be evaluated for NGN/USD collection and payout rails: <https://docs.fincra.com/di/docs/fincra-virtual-accounts>
- Verto may be evaluated for multi-currency wallets, FX, and cross-border settlement: <https://www.vertofx.com/core-api>
- Provider branding, licence role, limits, fees, screening, settlement timing, and refund treatment must be disclosed accurately.

### Freight and customs

- CRFFN corporate registration: <https://crffn.gov.ng/corporate-application>
- Nigeria Customs licences and permits: <https://licences.customs.gov.ng/>
- Nigeria Customs import procedures: <https://customs.gov.ng/wp-content/uploads/2025/06/Import-and-Export-Procedure-Corrected_Final.pdf>
- Nigeria Customs tariff tools: <https://cet.customs.gov.ng/>

## 18. Core Models and APIs

### Marketplace and sourcing

- `SourcingRequest`
- `ExtractedProductField`
- `SourceEvidence`
- `SupplierCandidate`
- `Supplier`
- `ProductListing`
- `QuoteRequestBatch`
- `SupplierQuoteRequest`
- `LandedCostQuote`
- `SupplierOrder`

### Verification

- `SupplierVerificationCase`
- `VerificationCheck`
- `VerificationEvidence`
- `VerificationDecision`

### Agents

- `SourcingAgent`
- `AgentCoverage`
- `AgentExpertise`
- `AgentFavourite`
- `AgentMatch`
- `AgentAssignment`
- `AssignmentProductScope`
- `AssignmentEvidence`
- `ReadinessCertification`

### Logistics

- `LogisticsProvider`
- `LogisticsCapability`
- `LogisticsApplication`
- `Warehouse`
- `ShipmentBatch`
- `ShippingQuote`
- `ShipmentPackage`
- `CustodyEvent`
- `ShipmentEvent`
- `LogisticsClaim`

### Money and rewards

- `CurrencyAccount`
- `OrderMoneyLedger`
- `ProviderLedgerEntry`
- `PaymentMilestone`
- `ReleaseRecommendation`
- `SettlementInstruction`
- `RewardAccount`
- `RewardEntry`
- `RewardRedemption`

### Operations

- `ModerationCase`
- `DisputeCase`
- `WaitlistLead`
- `AdminRole`
- `AdminAuditEvent`

### Required API groups

- Product-link and image extraction.
- Missing-information follow-up.
- Supplier candidate creation and verification.
- Marketplace discovery and supplier profiles.
- Multi-supplier shopping-list submission.
- Supplier quote creation, expiry, acceptance, and rejection.
- Agent search, matching, favourites, hiring, messaging, and evidence.
- Readiness certification, buyer approval, change request, and dispute.
- Order funding, milestones, settlement, FX, refunds, and reconciliation.
- Logistics applications, discovery, quotes, shipment batches, tracking, and claims.
- Rewards earning and redemption.
- Admin CRUD, review queues, permissions, reports, and audit history.

All private APIs derive ownership from authenticated server-side authorization. Client-supplied owner IDs are never trusted.

## 19. AI Responsibilities and Guardrails

AI may:

- Extract product and supplier information.
- Translate Chinese and English content.
- Normalize specifications and customization briefs.
- Ask concise follow-up questions.
- Suggest verification depth.
- Recommend agents and explain the match.
- Generate inspection checklists.
- Compare quotes and landed costs.
- Summarize bargaining, messages, documents, and evidence.
- Detect missing, duplicate, inconsistent, or suspicious evidence.
- Recommend shipment batching.

AI must not:

- Award a verified badge.
- Hire an agent automatically.
- Accept a supplier quote.
- Approve a milestone.
- Move or release money.
- Reject a partner solely through an automated decision.
- Present estimates as confirmed facts.

Every AI output that affects a decision shows its source, confidence, uncertainty, and required human approval.

## 20. Disputes, Claims, and Responsibility

Create separate case types for:

- Supplier non-performance.
- Wrong specifications or customization.
- Quantity shortage.
- Product defects.
- Agent negligence or misconduct.
- Conflicting inspection evidence.
- Logistics loss or damage.
- Incorrect customs documentation.
- Buyer cancellation.
- Refund or settlement error.

Opening an eligible dispute freezes only the affected unreleased funds. The system records evidence from all parties, responsible role, refundability, insurance involvement, decision, reason, and appeal history.

## 21. Commercial Model

Potential Naitrust revenue is disclosed clearly and may include:

- Supplier verification fees.
- Agent-service commission.
- Inspection coordination fees.
- Logistics coordination and consolidation fees.
- Marketplace supplier subscriptions.
- Platform service fees.
- Payment or FX fees permitted by the licensed partner.
- Optional insurance or enhanced support commissions where lawful and disclosed.

Do not hide fees inside product prices. The confirmed quote and money ledger should make Naitrust's role and charges understandable.

## 22. Delivery Plan

### Phase 1: Focused product MVP

- New marketplace positioning and hero.
- Buyer and business sourcing dashboards.
- Multi-supplier shopping list and separate mock quotes.
- Find-a-product link, image, and text prototype.
- Agent cards, recommendations, favourites, and assignment rooms.
- Product-level inspection scopes.
- Readiness certification and buyer-controlled mock milestone approval.
- Logistics partner applications and managed directory.
- Flexible mock shipment batches.
- Transparent mock order money ledger.
- Service-credit rewards.
- New admin shell with account-scoped persistent mock stores.
- Updated waitlist and partner footer links.

### Phase 2: Production foundation

- Backend database and server authorization.
- Admin RBAC and immutable audit events.
- Secure media, OCR, malware scanning, and moderation.
- Contracted supplier verification adapters.
- AMap integration and consented agent check-ins.
- Licensed payment-provider collection, FX, settlement, refund, and reconciliation.
- Secure partner invitations and MFA.
- Email, SMS, and in-app notifications.
- Production dispute, claims, and escalation queues.

### Phase 3: Controlled operations pilot

- Curated suppliers, agents, and logistics providers.
- Manual operational review at important checkpoints.
- High-value dual verification.
- Real quote preparation and shipment coordination.
- Provider reconciliation and exception drills.
- Buyer comprehension and service-quality monitoring.

### Future additions

- Official 1688 and other marketplace integrations where commercially permitted.
- Nigerian sourcing-agent network.
- More sourcing countries and languages.
- Competitive agent and logistics bidding.
- Live carrier, freight, warehouse, and customs integrations.
- Automated shipment-consolidation optimization.
- Warehouse inventory and barcode scanning.
- Cargo-insurance integration.
- Supplier self-service catalogue and production portal.
- AI-assisted video inspection and duplicate-evidence detection.
- Predictive landed-cost estimates.
- Advanced supplier performance and risk scoring.
- Buyer teams, budgets, spending rules, and approval chains.
- ERP, bookkeeping, and inventory integrations.
- Trade finance through appropriately licensed partners.
- Native mobile applications and offline agent evidence capture.

## 23. Test and Acceptance Plan

### Marketplace and account isolation

- Public visitors can browse but cannot perform authenticated actions.
- China and Nigeria discovery works for both customer and business accounts.
- Business accounts can buy and sell.
- One account never sees another account's carts, quotes, orders, favourites, tasks, messages, money, or rewards.

### Multi-supplier orders

- A mixed shopping list creates one supplier quote request per supplier.
- Supplier readiness, agents, payment milestones, and disputes remain isolated.
- Declining or delaying one supplier does not alter another supplier's order.

### Smart sourcing

- Test successful, partial, inaccessible, malformed, prohibited, and unsafe links.
- Test image-only and text-only sourcing requests.
- Verify extracted-field provenance, confidence, user correction, and missing-information prompts.

### Agents

- Matching respects location, expertise, availability, price, performance, and conflicts.
- Favourites are account-scoped.
- Reusing an agent requires new availability and pricing.
- One supplier assignment supports separate product scopes.
- Evidence upload cannot request or release money by itself.

### Release and money

- Agent recommendation never directly moves funds.
- Buyer approval requires the correct evidence and PIN.
- Each milestone changes only its allocated amount.
- Disputes block affected unreleased funds.
- Provider events are idempotent and reconciled.
- NGN and USD remain separate.
- Admin cannot edit balances.
- Refundable and committed logistics costs remain itemized.

### Logistics

- Verify logistics application, capability review, suspension, and route matching.
- A sourcing agent offering logistics requires separate approval.
- Shipment batches contain only eligible ready orders.
- Buyers can wait for all or ship a ready subset.
- Chain-of-custody records preserve every handover.
- Test loss, damage, delay, customs, cancellation, and partial-refund paths.

### Safety and admin

- Test phone, email, social-handle, URL, QR, image, document, and permitted-audio moderation.
- Test false positives and authorized override.
- Verify least-privilege admin roles, masked PII, dual approvals, and audit history.
- Test supplier, agent, and logistics approval, rejection, suspension, reactivation, and appeal.

### Quality

- Run TypeScript, ESLint, production build, unit tests, state-transition tests, and responsive interaction tests.
- Verify mobile primary actions remain visible and no drawer, table, modal, map, chat, or payment view overflows.
- Test reduced motion, keyboard navigation, alt text, lazy images, video poster fallback, dark theme, and layout stability.

## 24. Success Metrics

Track:

- Sourcing requests that become confirmed quotes.
- Quote acceptance rate and preparation time.
- Supplier verification completion time.
- Agent match, hire, response, and completion rates.
- Evidence revision rate and inspection pass rate.
- Orders reaching ready-for-shipping status.
- Consolidation savings versus separate shipping.
- Landed-cost variance between quote and final total.
- On-time delivery and claim rates.
- Supplier, agent, and logistics dispute rates.
- Repeat buyers and favourite-agent reuse.
- Service-credit earning and redemption.
- Payment reconciliation exceptions.
- Attempts to move communication or payment off-platform.

## 25. Launch Assumptions and Non-Negotiables

- China and Nigeria are the only active launch markets.
- The first release is curated and operations-assisted.
- The buyer chooses the agent from an AI-assisted shortlist.
- One agent assignment covers one supplier order with product-level scopes.
- Agents certify readiness and recommend release; buyers authorize payment.
- Licensed financial partners hold and move funds and pay verified suppliers directly.
- Agent fees, supplier funds, logistics charges, and refunds remain separate.
- Exact agent location is private until consented assignment activity requires it.
- A public legal supplier identity makes absolute circumvention prevention impossible; Naitrust must not claim otherwise.
- No live verification, USD wallet, FX, settlement, customs, insurance, or logistics claim is enabled before the relevant provider, contract, backend control, and operational process exists.
- When evidence conflicts or a dispute is unresolved, preserve funds, evidence, and the audit trail and escalate for human review.

