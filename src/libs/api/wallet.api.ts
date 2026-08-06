/**
 * Wallet API
 * Typed access to the everyday wallet: balance, funding, withdrawal,
 * linked bank accounts and activity feed.
 *
 * No backend endpoint exists for this yet (see endpoints.ts): every method
 * is mock-only for this phase, resolving fixture data from
 * `src/mocks/apis/` with simulated latency, using the same `ApiSuccess<T>`
 * envelope the real backend will eventually return.
 */

import { httpClient } from './client';
import { endpoints } from './endpoints';
import { appConfig } from '../../configs/env';
import type {
  LinkedBankAccount,
  WalletAccount,
  WalletActivityEvent,
} from '../store/types';
import mockWallet from '../../mocks/apis/wallet.json';
import mockWalletBankAccounts from '../../mocks/apis/wallet-bank-accounts.json';
import mockWalletActivity from '../../mocks/apis/wallet-activity.json';
import type { ApiSuccess } from './types';

const MOCK_LATENCY_MS = 400;
let mockAvailableMinor: number | undefined;
const mockBillActivity: WalletActivityEvent[] = [];

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export const walletApi = {
  payBill: async (amountMinor: number, description: string): Promise<ApiSuccess<WalletAccount>> => {
    if (!appConfig.isMock) throw new Error('Bill payment is handled by the bills API.');
    await delay(MOCK_LATENCY_MS);
    const current = mockWallet as ApiSuccess<WalletAccount>;
    const available = mockAvailableMinor ?? current.data.balance.availableMinor;
    if (amountMinor <= 0) throw new Error('Enter a valid amount.');
    if (amountMinor > available) throw new Error('Your available NaiTrust balance is not enough for this payment.');
    mockAvailableMinor = available - amountMinor;
    mockBillActivity.unshift({
      id: `wact_bill_${crypto.randomUUID()}`,
      kind: 'bill_payment',
      amountMinor,
      currency: 'NGN',
      description,
      createdAt: new Date().toISOString(),
    });
    return {
      success: true,
      message: 'Bill paid from NaiTrust balance',
      data: { ...current.data, balance: { ...current.data.balance, availableMinor: mockAvailableMinor }, totalOutflowMinor: current.data.totalOutflowMinor + amountMinor },
    };
  },
  /**
   * Get the current user's wallet: available, pending and protected
   * balances kept as distinct fields; the UI must never present protected
   * funds as available for withdrawal or instant transfer.
   * Real endpoint (not yet implemented): GET /wallet/me
   */
  getMine: async (): Promise<ApiSuccess<WalletAccount>> => {
    if (appConfig.isMock) {
      await delay(MOCK_LATENCY_MS);
      const current = mockWallet as ApiSuccess<WalletAccount>;
      return mockAvailableMinor === undefined
        ? current
        : { ...current, data: { ...current.data, balance: { ...current.data.balance, availableMinor: mockAvailableMinor } } };
    }
    const response = await httpClient.get<WalletAccount>(endpoints.wallet.getMine);
    return response as ApiSuccess<WalletAccount>;
  },

  payProtectedDeal: async (amountMinor: number): Promise<ApiSuccess<WalletAccount>> => {
    if (!appConfig.isMock) throw new Error('Wallet deal funding is not enabled by the API yet.');
    await delay(MOCK_LATENCY_MS);
    const current = mockWallet as ApiSuccess<WalletAccount>;
    const available = mockAvailableMinor ?? current.data.balance.availableMinor;
    if (amountMinor > available) throw new Error('Your available wallet balance is not enough for this deal.');
    mockAvailableMinor = available - amountMinor;
    return {
      success: true,
      message: 'Protected deal funded from wallet',
      data: { ...current.data, balance: { ...current.data.balance, availableMinor: mockAvailableMinor, protectedMinor: current.data.balance.protectedMinor + amountMinor } },
    };
  },

  /**
   * Fund the wallet from a linked bank account. Mock-only for this phase , 
   * no real money movement happens in the frontend.
   * Real endpoint (not yet implemented): POST /wallet/fund
   */
  fund: async (input: {
    linkedBankAccountId: string;
    amountMinor: number;
  }): Promise<ApiSuccess<WalletAccount>> => {
    if (appConfig.isMock) {
      await delay(MOCK_LATENCY_MS);
      const current = mockWallet as ApiSuccess<WalletAccount>;
      return {
        success: true,
        message: 'Sandbox funding recorded',
        data: {
          ...current.data,
          balance: {
            ...current.data.balance,
            pendingMinor: current.data.balance.pendingMinor + input.amountMinor,
          },
          totalInflowMinor: current.data.totalInflowMinor + input.amountMinor,
        },
      };
    }
    const response = await httpClient.post<WalletAccount>(endpoints.wallet.fund, input);
    return response as ApiSuccess<WalletAccount>;
  },

  /**
   * Withdraw available funds to a linked bank account. Mock-only for this
   * phase. Callers must ensure `amountMinor` never exceeds
   * `balance.availableMinor`: protected and pending funds are not
   * withdrawable.
   * Real endpoint (not yet implemented): POST /wallet/withdraw
   */
  withdraw: async (input: {
    linkedBankAccountId: string;
    amountMinor: number;
  }): Promise<ApiSuccess<WalletAccount>> => {
    if (appConfig.isMock) {
      await delay(MOCK_LATENCY_MS);
      const current = mockWallet as ApiSuccess<WalletAccount>;
      return {
        success: true,
        message: 'Sandbox withdrawal recorded',
        data: {
          ...current.data,
          balance: {
            ...current.data.balance,
            availableMinor: current.data.balance.availableMinor - input.amountMinor,
          },
          totalOutflowMinor: current.data.totalOutflowMinor + input.amountMinor,
        },
      };
    }
    const response = await httpClient.post<WalletAccount>(endpoints.wallet.withdraw, input);
    return response as ApiSuccess<WalletAccount>;
  },

  /**
   * List bank accounts linked to the wallet for funding/withdrawal.
   * Real endpoint (not yet implemented): GET /wallet/bank-accounts
   */
  getLinkedBankAccounts: async (): Promise<ApiSuccess<LinkedBankAccount[]>> => {
    if (appConfig.isMock) {
      await delay(MOCK_LATENCY_MS);
      return mockWalletBankAccounts as ApiSuccess<LinkedBankAccount[]>;
    }
    const response = await httpClient.get<LinkedBankAccount[]>(
      endpoints.wallet.linkedBankAccounts,
    );
    return response as ApiSuccess<LinkedBankAccount[]>;
  },

  /**
   * Wallet activity feed (statement): funding, withdrawals, instant
   * transfers, protected-deal allocation/release and fees.
   * Real endpoint (not yet implemented): GET /wallet/activity
   */
  getActivity: async (): Promise<ApiSuccess<WalletActivityEvent[]>> => {
    if (appConfig.isMock) {
      await delay(MOCK_LATENCY_MS);
      const current = mockWalletActivity as ApiSuccess<WalletActivityEvent[]>;
      return { ...current, data: [...mockBillActivity, ...current.data] };
    }
    const response = await httpClient.get<WalletActivityEvent[]>(endpoints.wallet.activity);
    return response as ApiSuccess<WalletActivityEvent[]>;
  },
};
