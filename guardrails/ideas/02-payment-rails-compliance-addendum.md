# Payment Rails, Risk and Compliance Addendum

This addendum defines the regulated boundary beneath the Naitrust Protected Deal experience.

## Provider architecture

- Customer funds move only through contracted, appropriately licensed providers.
- Naitrust maintains an internal transaction ledger for product state; provider records and reconciled bank or wallet events remain authoritative for money movement.
- Every funding, release, refund and reversal request requires an idempotency key and an immutable audit event.
- Webhooks must be authenticated, replay-resistant, durable and reconciled.
- Provider degradation must stop new funding or release instructions safely without fabricating success.

## Funds states

Canonical states are: awaiting funding, funding pending, protected, release requested, release pending, released, refund pending, refunded, frozen, under review and failed.

UI language must distinguish a requested action from provider-confirmed completion.

## Verification and screening

- Apply identity or business verification proportionate to role, value and risk.
- Screen beneficiaries before funding and again when risk rules require it.
- Deal-specific liveness, transaction PIN and step-up authentication are separate controls.
- Store only the minimum verification evidence required and protect it with strict access controls and retention rules.

## Release authority

- The agreement determines who may approve release.
- Business accounts may require role-based or multi-person approval after MVP.
- A dispute freeze, sanctions alert, provider restriction or legal hold overrides ordinary release timing.
- Support personnel cannot move money outside their authorised role and logged workflow.

## Disputes and refunds

- Both parties can submit evidence.
- A reviewer must record the decision, reason, evidence considered and authorised financial instruction.
- Available outcomes include full release, full refund, partial settlement, replacement agreement or continued freeze where legally required.
- Product language must preserve statutory and consumer rights.

## Operational readiness gates

Real-money launch requires approved legal analysis, provider contracts, production KYC/KYB, AML and sanctions controls, reconciled ledgers, incident response, access reviews, penetration testing, customer support procedures, dispute operations and tested business continuity.

