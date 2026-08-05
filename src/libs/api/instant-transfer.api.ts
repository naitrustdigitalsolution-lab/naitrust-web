/**
 * Instant Transfer API
 * Typed access to everyday payments between parties who already trust each
 * other: recipient validation, transfer creation, status and history.
 *
 * No backend endpoint exists for this yet (see endpoints.ts): every method
 * is mock-only for this phase. Mock transfers never resolve as a real
 * completed payment silently; callers are expected to surface the sandbox
 * indicator carried on every `InstantTransfer.isMock` record.
 */

import { httpClient } from './client';
import { endpoints } from './endpoints';
import { appConfig } from '../../configs/env';
import type {
  CreateInstantTransferInput,
  InstantTransfer,
  InstantTransferStatus,
  TransferRecipient,
} from '../store/types';
import mockInstantTransfers from '../../mocks/apis/instant-transfers.json';
import mockNaitrustRecipients from '../../mocks/apis/naitrust-recipients.json';
import mockBeneficiaries from '../../mocks/apis/beneficiaries.json';
import type { ApiSuccess } from './types';

const MOCK_LATENCY_MS = 500;

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function mockReference(): string {
  const now = new Date();
  return `IT-${now.getFullYear()}-${String(Math.floor(now.getTime() / 1000) % 1000000).padStart(6, '0')}`;
}

/** Resolves a display name for a recipient in mock mode. */
function resolveMockRecipientName(recipient: TransferRecipient): string {
  if (recipient.resolvedName) return recipient.resolvedName;
  if (recipient.method === 'naitrust_account_number') return `Naitrust account (${recipient.identifier})`;
  if (recipient.method === 'naitrust_id') return `Naitrust user (${recipient.identifier})`;
  if (recipient.method === 'phone_number') return `Naitrust user (${recipient.identifier})`;
  if (recipient.method === 'email_address') return `Naitrust user (${recipient.identifier})`;
  if (recipient.method === 'bank_transfer') return `Bank recipient (${recipient.identifier})`;
  return recipient.identifier;
}

interface MockNaitrustRecipient {
  name: string;
  naitrustAccountNumber: string;
  naitrustId: string;
  accountType: 'customer' | 'business';
  identityVerified: boolean;
}

function resolveNaitrustRecipient(recipient: TransferRecipient): TransferRecipient | null {
  if (!['naitrust_account_number', 'naitrust_id'].includes(recipient.method)) return null;
  const normalized = recipient.identifier.trim().toLowerCase();
  const match = (mockNaitrustRecipients as MockNaitrustRecipient[]).find((entry) =>
    recipient.method === 'naitrust_account_number'
      ? entry.naitrustAccountNumber === normalized
      : entry.naitrustId.toLowerCase() === normalized,
  );
  return match ? {
    ...recipient,
    resolvedName: match.name,
    naitrustAccountNumber: match.naitrustAccountNumber,
    naitrustId: match.naitrustId,
    accountType: match.accountType,
    identityVerified: match.identityVerified,
  } : null;
}

function resolveBankRecipient(recipient: TransferRecipient): TransferRecipient | null {
  if (recipient.method !== 'bank_transfer' || !recipient.bankName) return null;
  const match = (mockBeneficiaries.data as Array<{
    type: string;
    name: string;
    bankName?: string;
    accountNumber?: string;
  }>).find((entry) =>
    entry.type === 'bank_account'
    && entry.bankName?.toLowerCase() === recipient.bankName?.toLowerCase()
    && entry.accountNumber === recipient.identifier,
  );
  return match ? { ...recipient, resolvedName: match.name } : null;
}

export const instantTransferApi = {
  /**
   * Confirm a recipient exists before money moves: step 1-2 of the
   * instant-payment flow (select/add recipient → confirm recipient).
   * Real endpoint (not yet implemented): POST /instant-transfers/validate-recipient
   */
  validateRecipient: async (
    recipient: TransferRecipient,
  ): Promise<ApiSuccess<TransferRecipient>> => {
    if (appConfig.isMock) {
      await delay(300);
      const naitrustRecipient = resolveNaitrustRecipient(recipient);
      const bankRecipient = resolveBankRecipient(recipient);
      if (['naitrust_account_number', 'naitrust_id'].includes(recipient.method) && !naitrustRecipient) {
        throw new Error('Naitrust recipient not found');
      }
      return {
        success: true,
        data: naitrustRecipient
          ?? bankRecipient
          ?? { ...recipient, resolvedName: resolveMockRecipientName(recipient) },
      };
    }
    const response = await httpClient.post<TransferRecipient>(
      endpoints.instantTransfers.validateRecipient,
      recipient,
    );
    return response as ApiSuccess<TransferRecipient>;
  },

  /**
   * Create and send an instant transfer. Sandboxed in mock mode: always
   * returns a clearly-labeled mock record (`isMock: true`), never presented
   * as a real completed transfer.
   * Real endpoint (not yet implemented): POST /instant-transfers
   */
  createTransfer: async (input: CreateInstantTransferInput): Promise<ApiSuccess<InstantTransfer>> => {
    if (appConfig.isMock) {
      await delay(MOCK_LATENCY_MS);
      const now = new Date();
      // A small, deterministic-feeling spread of outcomes so the UI's
      // success/pending/failed states are all reachable in the sandbox.
      const roll = input.amountMinor % 10;
      const status: InstantTransferStatus = roll === 9 ? 'failed' : roll >= 7 ? 'pending' : 'successful';
      const transfer: InstantTransfer = {
        id: `itr_mock_${crypto.randomUUID()}`,
        reference: mockReference(),
        recipient: {
          ...input.recipient,
          resolvedName: resolveMockRecipientName(input.recipient),
        },
        amountMinor: input.amountMinor,
        currency: input.currency,
        feeMinor: input.amountMinor > 5000000 ? 50000 : 15000,
        narration: input.narration,
        status,
        provider: 'mock',
        isMock: true,
        createdAt: now.toISOString(),
        completedAt: status === 'successful' ? now.toISOString() : undefined,
      };
      return { success: true, data: transfer, message: 'Sandbox transfer created' };
    }
    const response = await httpClient.post<InstantTransfer>(
      endpoints.instantTransfers.create,
      input,
    );
    return response as ApiSuccess<InstantTransfer>;
  },

  /** Real endpoint (not yet implemented): GET /instant-transfers/:id */
  getTransfer: async (id: string): Promise<ApiSuccess<InstantTransfer>> => {
    if (appConfig.isMock) {
      await delay(300);
      const fixture = mockInstantTransfers as ApiSuccess<InstantTransfer[]>;
      const found = fixture.data.find((transfer) => transfer.id === id) ?? fixture.data[0];
      return { success: true, data: found };
    }
    const response = await httpClient.get<InstantTransfer>(
      endpoints.instantTransfers.getOne(id),
    );
    return response as ApiSuccess<InstantTransfer>;
  },

  /** Real endpoint (not yet implemented): GET /instant-transfers/my */
  getMyTransfers: async (): Promise<ApiSuccess<InstantTransfer[]>> => {
    if (appConfig.isMock) {
      await delay(MOCK_LATENCY_MS);
      return mockInstantTransfers as ApiSuccess<InstantTransfer[]>;
    }
    const response = await httpClient.get<InstantTransfer[]>(
      endpoints.instantTransfers.getMyTransfers,
    );
    return response as ApiSuccess<InstantTransfer[]>;
  },
};
