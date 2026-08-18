# Naitrust Wholesale Sourcing and Admin Operations Platform

## Summary

Transform Naitrust into the operating system for wholesale sourcing from China and Nigeria. Customers and businesses can find products, paste external marketplace links, request separate supplier quotes, hire vetted local agents, communicate through evidence-rich Order Rooms, pay through licensed financial partners, consolidate ready orders, and track delivery.

The existing partner approval page becomes a complete admin portal controlling suppliers, agents, sourcing requests, quotes, orders, shipments, money operations, moderation, rewards, waitlist leads, and platform configuration.

## Key Experience Changes

### Marketplace and smart sourcing

- Keep China and Nigeria as active wholesale markets for both customer and business accounts.
- Allow a shopping list to contain products from multiple suppliers, but create a separate quote and order for each supplier.
- Add “Find a product” using:
  - A Chinese marketplace link.
  - Product images or screenshots.
  - A written English description.
- AI extracts the product, seller, specifications, MOQ, pricing, location and available company identifiers.
- Show extracted fields with confidence and source evidence, then ask only for missing information.
- Offer a free basic company scan followed by buyer-approved paid verification or a physical agent visit.
- Never scrape login-protected or prohibited content; use contracted marketplace APIs where available.

### Sourcing agents

- Recommend active agents based on the supplier’s city, travel radius, category expertise, language, availability, rating, past performance and fee range.
- Assign agents per supplier order, with separate product-level inspection requirements inside the assignment.
- Show agent cards containing:
  - Approximate operating area.
  - Expertise such as automotive, clothing, electronics, printing or packaging.
  - Languages.
  - Services and evidence offered.
  - Starting price or price range.
  - Completed assignments, rating and verification details.
- AI produces a shortlist with reasons, but the buyer selects the agent.
- Buyers can favourite agents and invite them again, subject to current availability and a fresh quote.
- Public users see only city and service radius. Exact assignment locations and check-ins appear only after hiring and consent.

### Agent communication room

- Give each agent assignment a dedicated room for messages, translated summaries, bargaining updates, images, documents and videos.
- Store evidence separately for each inspected product, including quantity, specifications, sample, packaging, defects and agent recommendation.
- Support revision requests, additional evidence requests and final buyer acceptance.
- Record agent check-ins, timestamps and consented location evidence.
- Agents never control supplier funds and cannot approve their own fee or supplier settlement.

### Quotes, money and shipping

- Present payment as “Pay through Naitrust,” while funds enter a unique safeguarded collection account operated by a licensed financial partner.
- The licensed partner pays the verified supplier directly. Agent service fees remain separate.
- Support NGN and partner-hosted USD balances without implying that Naitrust directly holds deposits.
- Give every order a transparent money timeline showing:
  - Customer payment.
  - Product allocation.
  - Agent fee.
  - Verification and inspection fees.
  - Logistics allocation and committed costs.
  - FX quote and conversion.
  - Supplier settlement.
  - Refunds and remaining refundable amount.
- Never permit manual balance editing from the admin interface.
- Keep supplier orders independently ready or delayed.
- Recommend waiting for all orders before shipping, while allowing the buyer to create a shipment from selected ready orders.
- Generate a separate consolidated shipping quote covering pickup, warehouse consolidation, packing, insurance, freight, customs estimate and Nigerian delivery.

### Rewards

- Award points after eligible orders or agent tasks complete without unresolved disputes.
- Allow redemption only for Naitrust service credits covering verification, inspection, logistics or platform fees.
- Do not make points cash-withdrawable, transferable or dependent on positive reviews.

## Admin Portal

### Navigation and layout

Replace the single Partner Network page with a responsive `/app/admin` portal. Keep `/app/partner-admin` as a compatibility redirect.

Admin navigation:

- Overview
- Sourcing requests
- Suppliers
- Products and showcases
- Agents
- Agent assignments
- Quotes
- Orders
- Shipments
- Payments and reconciliation
- Rewards
- Messages and moderation
- Waitlist and leads
- Users and businesses
- Reports
- Audit log
- Settings

The overview shows urgent queues, pending verification, agent evidence awaiting review, quote delays, orders ready for shipping, payment exceptions, refund requests, moderation alerts and operational SLA metrics.

### Supplier management

- Create suppliers directly from the back office or review supplier applications.
- Manage legal identity, marketplace identity, locations, categories, products, MOQ, customization capabilities, languages, fulfilment regions and showcase media.
- Record verification as separate dated checks:
  - Legal registration.
  - Representative and ownership.
  - Operating address.
  - Factory or warehouse.
  - Product capability.
  - sanctions/risk screening.
  - Sample or inspection evidence.
- Support approve, request information, reject, pause, suspend and schedule reverification.
- Display legal identity and verification facts publicly while hiding direct contact information.

For China, use provider adapters around the official [GSXT registry](https://bt.gsxt.gov.cn/), [Qichacha](https://openapi.qcc.com/services/aboutUs), and a KYB provider such as [Sumsub](https://docs.sumsub.com/docs/verify-businesses). For Nigeria, use [CAC company search](https://www.cac.gov.ng/services/company-search) or the [CAC VAS API](https://vas.cac.gov.ng/).

### Agent management

- Review applications, documents, identity, experience, references, languages, expertise and service areas.
- Add approved agents manually from the back office.
- Configure location coverage, travel radius, availability, services, pricing ranges, evidence requirements and payout currency.
- Show assignments, completion rate, evidence quality, complaints, cancellations, earnings and customer ratings.
- Support probation, approval, suspension, reactivation and reassignment.
- Use AMap/Gaode for China mapping and geocoding, subject to commercial authorization: [AMap JavaScript API](https://lbs.amap.com/api/JavaScript-api/summary).
- Require human approval before an agent is labelled vetted or trusted.

### Operational control

- Allow staff to turn a pasted link into a supplier candidate, request missing buyer information and begin verification.
- Let admins attach an agent, approve an assignment scope, review bargaining evidence and monitor product readiness.
- Track every supplier order separately even when the customer created them together.
- Build shipment batches only from eligible ready orders.
- Provide controlled refund, payout and FX workflows with permission checks, reason fields and dual approval for sensitive actions.
- Mask sensitive data by default and expose it only to authorised roles.
- Record all administrative reads and mutations in an immutable audit trail.

### Roles

Introduce:

- `super_admin`
- `sourcing_ops`
- `supplier_verification`
- `agent_ops`
- `logistics_ops`
- `finance_ops`
- `support`
- `content_admin`

The frontend may use mock permissions initially, but API authorization must enforce role and action permissions independently.

## Public Entry Points and Waitlist

### Waitlist redesign

Replace generic payment messaging with:

- Title: “Bring your next wholesale order into one clear journey.”
- Description: “Join early access to find verified suppliers, request landed-cost quotes, hire sourcing support and coordinate delivery from China or within Nigeria.”
- Benefits:
  - Find or submit a product.
  - Verify the supplier.
  - Follow sourcing and inspection evidence.
  - Know the confirmed cost before payment.
  - Coordinate delivery to Nigeria.

Capture:

- Buyer, Nigerian supplier, or both.
- China or Nigeria interest.
- Product categories.
- Typical order value and frequency.
- Whether they already buy from Chinese platforms.
- Need for verification, inspection, customization, packaging or shipping.
- Contact and consent.

Send waitlist submissions into the admin portal as filterable leads with status, notes, owner and follow-up history.

### Partner registration

Add separate footer links:

- “Become a sourcing agent”
- “Register as a supplier”

Each opens a focused bilingual application form. Submission never creates immediate access. Approved applicants receive a secure invitation to create credentials and MFA; production must not expose reusable plaintext access codes.

## Models and APIs

Add or extend:

- `SourcingRequest`
- `ExtractedProductField`
- `SourceEvidence`
- `SupplierCandidate`
- `SupplierVerificationCase`
- `VerificationCheck`
- `AgentCoverage`
- `AgentExpertise`
- `AgentFavourite`
- `AgentMatch`
- `AgentAssignment`
- `AssignmentEvidence`
- `QuoteRequestBatch`
- `SupplierQuoteRequest`
- `SupplierOrder`
- `OrderMoneyLedger`
- `ShipmentBatch`
- `ShippingQuote`
- `CurrencyAccount`
- `ProviderLedgerEntry`
- `RewardAccount`
- `RewardEntry`
- `RewardRedemption`
- `ModerationCase`
- `WaitlistLead`
- `AdminAuditEvent`

Important rules:

- Every record is account-scoped; one user’s quotes, orders, favourites or rewards must never appear for another account.
- One quote batch may contain many supplier quote requests.
- One agent assignment belongs to one supplier order and contains product-level scopes.
- Supplier settlement and agent fees use different ledger entries.
- Provider webhooks are idempotent, signed, reconciled and never trusted solely from the browser.
- AI may extract, translate, compare, summarize and recommend. It cannot verify a supplier, hire an agent, release money or approve a refund autonomously.

## Delivery Phases

### Focused MVP

- New admin shell and role-aware navigation.
- Functional mock CRUD for suppliers, products, agents and applications.
- Account-scoped mock stores.
- Multi-supplier quote grouping.
- Agent recommendations, favourites and assignment rooms.
- Link/image/text sourcing request prototype.
- Transparent order money ledger.
- Flexible shipment batches.
- Updated marketplace, dashboards, waitlist and footer forms.
- NGN and mocked partner-hosted USD account states.
- Service-credit rewards.

### Production integration

- Backend persistence and RBAC.
- Contracted China and Nigeria verification providers.
- AMap agent coverage and consented check-ins.
- Payment-provider collection accounts, FX, settlement and reconciliation.
- Secure media upload, OCR, malware scanning and moderation.
- Provider webhooks, dual approvals and immutable audit logs.
- Email/SMS invitation and notification services.

### Future additions

- Direct integrations with 1688 and other marketplaces where official commercial access is available.
- Nigerian sourcing-agent network.
- Additional sourcing countries and languages.
- Live freight-forwarder, customs and carrier integrations.
- Agent bidding for complex jobs.
- Multi-warehouse consolidation and AI shipment optimization.
- Supplier self-service catalogue and production portal.
- Automated video inspection assistance and duplicate-evidence detection.
- Trade insurance and licensed inventory finance.
- Team purchasing approvals and business spending limits.
- ERP, bookkeeping and inventory integrations.
- Advanced supplier performance scoring and predictive landed-cost estimates.
- Native mobile applications and offline agent evidence capture.
- Controlled trade-document sharing with automatic contact and QR-code redaction.

## Test Plan

- Verify admin RBAC, masked data, dual approval and complete audit history.
- Test supplier and agent application, manual creation, verification, suspension and reverification.
- Confirm agent recommendations respect location, expertise, availability and price.
- Test favourites and repeat hiring without bypassing new pricing or availability.
- Verify one supplier assignment can contain separate evidence requirements for multiple products.
- Test text, image, document and video communication plus contact-detail redaction.
- Confirm multi-supplier carts create isolated quotes, orders, agents, money records and readiness states.
- Verify customers never receive direct supplier payment instructions.
- Test NGN/USD partner states, FX expiry, webhook replay protection, settlement and refunds.
- Test shipment batching with all orders and selected ready subsets.
- Verify rewards are idempotent, non-cash and blocked while disputes remain open.
- Test external-link extraction for success, partial results, inaccessible pages and unsafe URLs.
- Verify account isolation between customers, businesses, suppliers, agents and admins.
- Test waitlist lead capture, footer applications, mobile layouts and bilingual partner forms.
- Run TypeScript, ESLint, production build and focused responsive interaction tests.

## Assumptions

- Supplier payments are executed by the licensed payment partner directly to verified suppliers.
- Agents receive only separately approved service fees.
- Agent assignments are created per supplier order, with product-level evidence scopes.
- Exact agent location is private until assignment consent is active.
- Naitrust can discourage circumvention but will not claim it is technically impossible.
- The first release remains a curated, operations-assisted marketplace and must not claim live verification, custody, FX or international fulfilment until the corresponding contracts and backend controls are active.
