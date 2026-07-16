# Frontend AI Intelligence Plan

The frontend should make Naitrust feel intelligent, but not magical or unsafe.

AI should help users make better transaction decisions and help admins review cases faster. It should not pretend to guarantee trust, decide disputes, approve verification, or control money movement.

Approved Phase 1 technical spec note:

> AI is not required to block the domestic MVP. Build the protected transaction workflow first; add AI UI after real transaction data and backend AI assessments exist.

## User-Facing AI Features

### 1. Safe Deal Assistant

Helps users create better transaction terms.

UI outputs:

- suggested milestones.
- release conditions.
- delivery evidence checklist.
- simple agreement summary.
- missing-risk warnings.

The user must review and accept all generated terms.

### 2. Evidence Assistant

Shows what evidence is missing for the current deal type.

Examples:

- invoice needed.
- waybill needed.
- inspection photo needed.
- delivery confirmation needed.
- signed scope needed.

### 3. Transaction Risk Explanation

Explains why a transaction needs extra verification or admin review.

Good wording:

- "This deal needs fresh liveness because your last transaction activity was more than 30 days ago."
- "This transaction amount is higher than your usual completed deals."
- "The seller has not completed business ownership verification yet."

Avoid fear-heavy language.

### 4. Dispute Preparation Assistant

Helps users organize their evidence before submitting a dispute.

It should:

- summarize what the user is claiming.
- list evidence already attached.
- list missing evidence.
- ask clear follow-up questions.

It should not say who will win.

### 5. Reputation Summary

Turns completed transaction history into a clear public trust summary.

Only use verified data from completed Naitrust transactions.

## Admin AI Features

Admin screens may show:

- risk summary.
- verification mismatch summary.
- dispute timeline.
- missing evidence list.
- suspected pattern links.
- drafted admin response.

Admin AI output must show:

- confidence.
- evidence references.
- generated-at time.
- model/prompt version if available.
- "AI suggestion, not final decision" label.

## UI Rules

- Label AI output clearly.
- Let users refresh or dismiss AI suggestions.
- Never hide the underlying evidence.
- Never let AI-only output unlock protected actions.
- Always show backend statuses as source of truth.
- For high-risk warnings, provide the next action, not just the problem.

## Frontend Data Expectations

The backend should return AI outputs as structured objects:

```ts
type AiAssessment = {
  id: string;
  type: 'risk_score' | 'evidence_checklist' | 'dispute_summary' | 'verification_summary' | 'reputation_summary';
  entityType: string;
  entityId: string;
  summary: string;
  riskLevel?: 'low' | 'medium' | 'high' | 'critical';
  confidence?: number;
  reasons?: string[];
  recommendations?: string[];
  evidenceRefs?: string[];
  createdAt: string;
};
```

## Important Screens

- Create safe deal: AI milestone and evidence suggestions.
- Transaction room: risk explanation and evidence checklist.
- Dispute screen: dispute preparation assistant.
- Verification screen: why fresh liveness or additional verification is required.
- Reputation profile: AI-assisted summary from completed deals.
- Admin case screen: AI case summary and risk flags.
