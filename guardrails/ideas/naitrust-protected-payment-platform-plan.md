# Naitrust Protected Payment Platform Plan

## Product architecture

The platform is organised around six connected capabilities:

1. Identity and business verification.
2. Protected Deal creation and invitations.
3. Regulated funding and settlement adapters.
4. Deal Room communication and evidence.
5. Approval, dispute and refund controls.
6. Ledger, reconciliation, audit and administration.

## Delivery phases

### Phase 1 — Product foundation

- Reposition public pages for individuals and businesses.
- Make Protect a Payment the primary action.
- Keep Protected Deals and Money prominent in authenticated navigation.
- Disable sourcing, marketplace and logistics features by default.
- Establish canonical payment terminology and provider boundary disclosures.

### Phase 2 — Safe sandbox

- Complete deal creation, invitation, acceptance and evidence flows.
- Model funding, release, refund and freeze states without implying real money movement.
- Add transaction-level permissions and account isolation tests.
- Validate receipts, timelines and notification behavior.

### Phase 3 — Provider integration

- Integrate one regulated Naira collection and settlement provider.
- Add authenticated webhooks, idempotency and reconciliation.
- Implement verified beneficiaries and provider-confirmed receipts.
- Complete operational dashboards and exception queues.

### Phase 4 — Controlled pilot

- Launch single-release deals to a limited verified cohort.
- Staff manual dispute and payment exception operations.
- Monitor loss, fraud, support volume, release time and reconciliation breaks.
- Hold formal go/no-go reviews before increasing limits or cohorts.

### Phase 5 — Business controls

- Add milestones, team roles, approval policies and commercial payment links.
- Add accounting exports and business reporting.
- Expand providers or corridors only after separate compliance approval.

## Technical priorities

- Server-derived ownership and authorisation.
- Immutable financial and decision audit logs.
- Double-entry ledger for internal accounting.
- Idempotent provider commands.
- Signed and replay-safe webhooks.
- Encrypted evidence with short-lived access.
- Observable state machines and exception queues.
- Automated account-isolation, release and reconciliation tests.

## Definition of done

A protected payment is complete only when the parties, agreement, beneficiary, funding source, provider status, evidence, approvals, fees and final settlement or refund can be reconstructed from the audit record without relying on mutable frontend state.

