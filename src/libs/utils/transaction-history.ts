/**
 * Transaction History mapping
 * Pure functions that project the existing protected-deal, instant-transfer
 * and wallet-activity sources into one unified `TransactionRecord[]` for the
 * Transactions screen: the aggregation layer stays purely presentational,
 * it does not fork or duplicate the underlying data sources.
 */

import type {
  InstantTransfer,
  SafeDealSummary,
  TransactionRecord,
  WalletActivityEvent,
} from '../store/types';
import { getStatusPresentation } from './safe-deal-presentation';

export function dealsToTransactionRecords(deals: SafeDealSummary[]): TransactionRecord[] {
  return deals.map((deal) => ({
    id: `deal_${deal.id}`,
    reference: deal.reference,
    type:
      deal.status === 'refunded'
        ? 'refund'
        : deal.status === 'completed' || deal.status === 'paid_out'
          ? 'final_release'
          : 'protected_funding',
    method: 'protected',
    amountMinor: deal.amountMinor,
    feeMinor: 0,
    currency: deal.currency,
    counterpartyName: deal.counterpartyName,
    statusLabel: getStatusPresentation(deal.status).label,
    provider: 'anchor',
    relatedDealId: deal.id,
    createdAt: deal.createdAt,
  }));
}

const INSTANT_STATUS_LABEL: Record<string, string> = {
  draft: 'Draft',
  recipient_validation: 'Validating recipient',
  recipient_confirmed: 'Recipient confirmed',
  awaiting_confirmation: 'Awaiting confirmation',
  processing: 'Processing',
  successful: 'Successful',
  pending: 'Pending',
  failed: 'Failed',
  reversed: 'Reversed',
  cancelled: 'Cancelled',
  refunded: 'Refunded',
};

export function transfersToTransactionRecords(transfers: InstantTransfer[]): TransactionRecord[] {
  return transfers.map((transfer) => ({
    id: `instant_${transfer.id}`,
    reference: transfer.reference,
    type: transfer.status === 'reversed' ? 'reversal' : 'instant_transfer',
    method: 'instant',
    amountMinor: transfer.amountMinor,
    feeMinor: transfer.feeMinor,
    currency: transfer.currency,
    counterpartyName: transfer.recipient.resolvedName ?? transfer.recipient.identifier,
    statusLabel: INSTANT_STATUS_LABEL[transfer.status] ?? transfer.status,
    provider: transfer.provider,
    createdAt: transfer.createdAt,
  }));
}

const WALLET_KIND_TO_TYPE: Partial<Record<WalletActivityEvent['kind'], TransactionRecord['type']>> = {
  funding: 'wallet_funding',
  withdrawal: 'withdrawal',
  fee: 'fee',
};

/**
 * Only funding/withdrawal/fee wallet events become their own transaction
 * record: instant-transfer and protected-deal wallet events are already
 * represented via `transfersToTransactionRecords`/`dealsToTransactionRecords`
 * and would otherwise appear twice.
 */
export function walletActivityToTransactionRecords(events: WalletActivityEvent[]): TransactionRecord[] {
  return events
    .filter((event): event is WalletActivityEvent & { kind: keyof typeof WALLET_KIND_TO_TYPE } =>
      Boolean(WALLET_KIND_TO_TYPE[event.kind]),
    )
    .map((event) => ({
      id: `wallet_${event.id}`,
      reference: event.id,
      type: WALLET_KIND_TO_TYPE[event.kind] as TransactionRecord['type'],
      method: 'instant',
      amountMinor: event.amountMinor,
      feeMinor: 0,
      currency: event.currency,
      counterpartyName: event.description,
      statusLabel: 'Successful',
      provider: 'mock',
      createdAt: event.createdAt,
    }));
}

export const TRANSACTION_TYPE_LABEL: Record<TransactionRecord['type'], string> = {
  instant_transfer: 'Instant Transfer',
  incoming_transfer: 'Instant Transfer',
  wallet_funding: 'Wallet Funding',
  withdrawal: 'Withdrawal',
  protected_funding: 'Protected Payment',
  milestone_release: 'Milestone Release',
  final_release: 'Final Release',
  refund: 'Refund',
  reversal: 'Reversal',
  fee: 'Fee',
};
