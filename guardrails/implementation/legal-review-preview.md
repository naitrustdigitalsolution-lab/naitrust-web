# Legal review and administration preview

Implemented for `naitrust-web` only. This is a local mock preview, not a live legal service, payment integration, professional qualification check, or legal opinion. Production deployment requires the existing product guardrail launch reviews.

## Try the preview

Run `npm run dev -- --port 5178` in mock mode. Sign in using the existing configured demo password (no new password is introduced):

- `admin@naitrust.test`: new protected-deal administration at `/app/admin/overview`.
- `legal.firm@naitrust.test`: Ada Okoro, owner of fictional **Okoro Legal Partners (Demo)**, at `/app/legal-reviews`.
- Existing Fatima/Emeka demo accounts can propose and consent to legal review as deal parties.

The legal percentage starts **unset**. Configure it under Administration → Settings before sending proposals. The two historical law-firm sample assignments have an explicitly fictional 1% rate; they do not set the current platform rate. One is active and the other awaits the fee.

The old sourcing administration screens are no longer rendered or linked. Unknown legacy admin sections return the current overview. Existing historical files and stored customer data are not deleted.

## Workflow and permissions

Only Naitrust-approved provider accounts may be selected. Admins can enable individual customer accounts or businesses; only the business owner receives legal access. Business members, ordinary users, and legal providers do not gain admin permissions. Enabling a flag alone gives no deal access.

Creation accepts optional `legalReview: LegalSelection`. The selection stores the provider, purpose, room-wide document scope, accepted terms version, explicit consent and accepted fee snapshot. A compact terms modal must be accepted before sending; changing the provider, purpose or fee resets acceptance. The same interface proposes a later review in an open Deal Room. The preview requires two identifiable registered parties; it does not guess the identity of an unregistered invitee or implement multi-party legal consent.

Both parties approve the same proposal version separately. Legal consent is separate from invitation acceptance and from accepting the deal agreement. A proposal records terms version, actor, timestamp, provider, sharing scope, baseline document versions and fee. Both approvals authorize the agreement and all current and future room evidence. Uploads do not require another proposal or fee. An active appointment must be jointly deactivated before a new proposal; changing pending proposal details resets approvals. The agreement snapshot includes a content fingerprint to detect draft edits even when the displayed agreement version is unchanged. The fingerprint detects preview changes; it is not a cryptographic integrity guarantee.

The reviewer is automatically assigned after both approvals, without a lawyer acceptance step. No documents are accessible until the fee is recorded as paid. Unfunded deals require joint approval or joint removal before funding. Funded deals continue their normal deadlines while legal proposals are pending or declined. Neither legal requests nor findings can freeze funds or decide disputes.

Fees use integer basis points and principal minor units with half-up rounding. The preview currently has a zero platform fee, labelled as such. The payer sees principal, platform fee, additional legal fee and total. Funding an unfunded deal records a separate legal-fee payment alongside the simulated principal payment; an already-funded deal exposes a separate demo fee action. Repeated payment calls retain the original payment ID. New uploads are automatically included without another fee. Paid reviewer replacement is blocked and requires an admin case review; there is no simulated automatic refund or provider payout.

Both parties must confirm deactivation to end a room-wide appointment. The first request leaves access active; the second ends future access immediately. Access continues to retained room documents after completion until joint deactivation. Provider revocation or account suspension also blocks access. Re-enabling a revoked provider does not restore old consent. Existing copies cannot be recalled. Private chat, account banking details, identity captures and financial actions are excluded from reviewer response objects. Uploaded documents may themselves contain sensitive information, so the terms disclose that all room uploads will be shared. Privacy-rights requests are handled separately through the privacy contact. Legacy selected-document proposals retain their original narrow scope, unilateral withdrawal and closure rules until both parties explicitly approve the new room-wide terms.

## API contracts and storage

Types live in `src/features/legal/types.ts`; `legal.api.ts` is the mock adapter. Production services must implement equivalent commands with authenticated server-derived actors:

| Capability | Proposed backend interface |
| --- | --- |
| Approved directory | `GET /legal/providers` |
| Current party proposal/history | `GET /transactions/:id/legal-review` |
| New/revised proposal | `POST /transactions/:id/legal-review` with provider, purpose, scope, accepted terms, expected revision and accepted fee snapshot |
| Consent/decline/joint deactivation | `POST /transactions/:id/legal-review/:version/decisions` |
| Separate legal fee | `POST /transactions/:id/legal-review/payment` with an idempotency key |
| Reviewer assignment list | `GET /legal/assignments` with restricted assignment metadata |
| Approved reviewer content | `GET /legal/assignments/:id` |
| Approved file access | `POST /legal/assignments/:id/documents/:documentId/access` |
| Requests/findings | `POST /transactions/:id/legal-review/requests`, `POST /legal/assignments/:id/findings` |
| Admin accounts/provider flags/config/cases/audit | Admin-only services corresponding to `legalAdminApi` |

Server authorization must recheck active account, business ownership, provider eligibility, assignment, consent revision, fee settlement, deactivation state and the applicable legacy/room-wide scope on every relevant request. Reject stale writes atomically. Use cryptographic document version identifiers, private object storage, short-lived authorized file access and malware/type validation. No arbitrary client-provided file URL or payer ID should be trusted. Real fee settlement requires separate ledger entries, provider confirmation, idempotency, refund/replacement policy and reconciliation; the mock payment flag is not evidence of funds moving.

Mock proposals are stored under the creating account and deal ID. Reads require an explicit party or reviewer relationship; admin records use an admin namespace. Provider flags are keyed by provider, suspension by account, and notifications by recipient. Browser storage can be inspected or modified by its user and is not a production security boundary. Consent/access records are append-only through the adapter, but require immutable server audit storage in production.

Reviewer APIs build a restricted document response from current room evidence and the agreement, rather than returning full Deal Room payloads. Legacy assignments return selected snapshots only. File opens are audited. Joint deactivation ends room-wide access without deleting required administrative history; completion alone does not deactivate the appointment. Production retention, professional engagement and confidentiality policies require legal approval.

## Evidence size and storage

The upload modal displays prepared size per file, original size when reduced, and total batch size. Limits are three files, 2 MiB per saved file, 4 MiB per batch, and 20 MiB of evidence per preview deal. Accepted source images are capped at 10 MiB before decoding. JPG/PNG photos are resized to at most 2,000 pixels on the longest edge and encoded as JPEG at 0.88 quality, with a white background for transparency. Compression is disclosed. PDFs and videos are not re-encoded. Users must keep original evidence separately if needed.

The adapter verifies actual data sizes rather than trusting size metadata. Binary files are stored in IndexedDB under an owner/deal/file key; localStorage retains small metadata/reference records, avoiding base64 copies in deal records and legal proposals. Authorized downloads resolve those references on demand. Existing data-URL evidence remains readable. This preview retains files until browser storage is cleared; production storage quotas, orphan cleanup and retention jobs belong in the backend.

## Verification

Against a local Vite mock server:

```
NAITRUST_TEST_URL=http://localhost:5178 npm run verify:legal
NAITRUST_TEST_URL=http://localhost:5178 npm run verify:deals
npm run build
```

`verify:legal` checks API authorization, terms acceptance, fee rounding and snapshots, initial/separate payments, duplicate payments, restricted document responses, automatic upload sharing, joint deactivation, retained access after completion, legacy-scope migration, revocation, suspension, proposal-modal gating and homepage logos. `verify:deals` includes creation-time legal selection, approval by the second party, initial funding, evidence size feedback and persistence/download, PIN-protected release and disputes. These tests use isolated browser data and never move real money.
