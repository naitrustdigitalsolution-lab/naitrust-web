# Frontend Data Model Notes

The frontend does not own the database. The backend schema in `../../naitrust-api/guardrails/database-design.md` is the source of truth.

This file explains the domain objects the frontend should expect from the API and how screens should think about data.

## Core Frontend Models

### User

- id
- email
- phone
- firstName
- lastName
- role
- status
- emailVerifiedAt
- phoneVerifiedAt
- identityVerifiedAt
- lastLivenessVerifiedAt
- lastTransactionActivityAt

### Business

- id
- ownerUserId
- name
- type
- registrationNumber
- verificationStatus
- businessVerifiedAt
- ownershipVerifiedAt
- verificationExpiresAt
- riskLevel
- address

### Verification Request

- id
- subjectType
- subjectId
- transactionId
- provider
- verificationType
- verificationLevel
- status
- paymentStatus
- resultSummary
- riskFlags
- steps
- documents
- ownershipCheck
- faceMatchResult

### Verification Step

- id
- verificationRequestId
- step
- provider
- status
- message
- startedAt
- completedAt

### Face Match Result

- id
- verificationRequestId
- match
- matchScore
- confidence
- livenessPassed
- createdAt

### Ownership Check

- id
- verificationRequestId
- method
- status
- evidenceSummary

### Transaction

- id
- reference
- transactionType
- title
- description
- partyMode: b2b, b2c
- category
- amountMinor
- feeMinor
- currency
- status
- paymentStatus
- riskLevel
- createdBy
- parties
- terms
- evidenceRequirements
- evidence
- dispute
- activity

### TransactionType

- id
- key
- name
- requiredVerificationLevel
- evidenceRequirements
- releaseMode
- disputeRules
- feeModel
- autoConfirmWindowHours

### Transaction Party

- id
- transactionId
- userId
- businessId
- partyType
- partyMode
- displayName
- email
- phone
- status

### Agreement

- id
- transactionId
- version
- summary
- description
- deliveryConditions
- releaseConditions
- proofRequirements
- disputeRules
- autoConfirmWindowHours
- deliveryDueAt
- buyerAcceptedAt
- sellerAcceptedAt
- frozenAt

### Milestone

Phase 2 model. Phase 1 domestic single-release transactions use evidence requirements instead of milestones.

- id
- transactionId
- title
- description
- amount
- dueAt
- status

### Evidence

- id
- transactionId
- milestoneId
- uploadedByUserId
- type
- fileUrl
- fileName
- description
- createdAt

### Virtual Account Funding

- id
- transactionId
- partner
- providerReference
- accountNumber
- accountName
- bankName
- amountExpectedMinor
- amountReceivedMinor
- currency
- status
- expiresAt
- fundedAt

### Dispute

- id
- transactionId
- openedByUserId
- status
- reason
- description
- resolution

### Reputation Profile

- id
- subjectType
- subjectId
- completedTransactionsCount
- disputedTransactionsCount
- totalCompletedValue
- ratingAverage
- ratingCount

### AI Assessment

- id
- type
- entityType
- entityId
- summary
- riskLevel
- confidence
- reasons
- recommendations
- evidenceRefs
- createdAt

## Frontend Rules

- Do not invent fields that are not in the backend contract.
- Do not infer payment completion from redirects.
- Do not infer verification completion from form submission.
- Do not infer facial verification success from camera capture.
- Do not infer business ownership from CAC verification alone.
- Always display backend statuses.
- Keep local optimistic updates limited to low-risk UI state.
- Refetch transaction details after funding status update, evidence upload, buyer confirmation, dispute update, and release request.
