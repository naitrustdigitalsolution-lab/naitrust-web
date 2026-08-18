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
import { getUserData } from './config';
import { getMarketplaceAccountScope } from '../marketplace/account-scope';
import { marketplaceStorageKey } from '../marketplace/account-scope';

const MOCK_LATENCY_MS = 400;
interface MockWalletState {
  availableMinor?: number;
  usdAvailableMinor?: number;
  billsMinor?: number;
  activity: WalletActivityEvent[];
}

const mockWalletStates = new Map<string, MockWalletState>();

function getMockState(): MockWalletState {
  const scope = getMarketplaceAccountScope();
  const existing = mockWalletStates.get(scope);
  if (existing) return existing;
  const next: MockWalletState = { activity: [] };
  mockWalletStates.set(scope, next);
  return next;
}

function getWalletOwnerName(): string {
  const user = getUserData();
  return user?.businessName || user?.name || [user?.firstName, user?.lastName].filter(Boolean).join(' ') || 'Naitrust account holder';
}

interface MockLinkedBankState {
  added: LinkedBankAccount[];
  defaultId?: string;
}

function readMockLinkedBankState(): MockLinkedBankState {
  if (typeof window === 'undefined') return { added: [] };
  try {
    const raw = window.localStorage.getItem(marketplaceStorageKey('wallet-bank-accounts', 'v1'));
    return raw ? JSON.parse(raw) as MockLinkedBankState : { added: [] };
  } catch {
    return { added: [] };
  }
}

function writeMockLinkedBankState(state: MockLinkedBankState): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(marketplaceStorageKey('wallet-bank-accounts', 'v1'), JSON.stringify(state));
}

function mockLinkedBankAccounts(): LinkedBankAccount[] {
  const current = mockWalletBankAccounts as ApiSuccess<LinkedBankAccount[]>;
  const ownerName = getWalletOwnerName();
  const state = readMockLinkedBankState();
  const base = current.data.map((account) => ({ ...account, accountName: ownerName }));
  const accounts = [...base, ...state.added];
  const defaultId = state.defaultId ?? accounts.find((account) => account.isDefault)?.id;
  return accounts.map((account) => ({ ...account, isDefault: account.id === defaultId }));
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export const walletApi = {
  payBill: async (amountMinor: number, description: string): Promise<ApiSuccess<WalletAccount>> => {
    if (!appConfig.isMock) throw new Error('Bill payment is handled by the bills API.');
    await delay(MOCK_LATENCY_MS);
    const state = getMockState();
    const current = mockWallet as ApiSuccess<WalletAccount>;
    const bills = state.billsMinor ?? current.data.balance.billsMinor ?? 0;
    if (amountMinor <= 0) throw new Error('Enter a valid amount.');
    if (amountMinor > bills) throw new Error('Your Bills Account balance is not enough for this payment.');
    state.billsMinor = bills - amountMinor;
    state.activity.unshift({
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
      data: { ...current.data, balance: { ...current.data.balance, availableMinor: state.availableMinor ?? current.data.balance.availableMinor, billsMinor: state.billsMinor }, totalOutflowMinor: current.data.totalOutflowMinor + amountMinor },
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
      const state = getMockState();
      const ownerName = getWalletOwnerName();
      const current = mockWallet as ApiSuccess<WalletAccount>;
      const currencyAccounts = current.data.currencyAccounts?.map((account) => ({
        ...account,
        fundingAccount: account.fundingAccount ? {
          ...account.fundingAccount,
          accountName: account.currency === 'NGN' ? `Naitrust / ${ownerName}` : ownerName,
        } : undefined,
        availableMinor: account.currency === 'USD'
          ? (state.usdAvailableMinor ?? account.availableMinor)
          : (state.availableMinor ?? account.availableMinor),
      }));
      return {
        ...current,
        data: {
          ...current.data,
          ownerUserId: getMarketplaceAccountScope(),
          balance: {
            ...current.data.balance,
            availableMinor: state.availableMinor ?? current.data.balance.availableMinor,
            billsMinor: state.billsMinor ?? current.data.balance.billsMinor ?? 0,
          },
          currencyAccounts,
          virtualAccount: current.data.virtualAccount ? { ...current.data.virtualAccount, accountName: `Naitrust / ${ownerName}` } : undefined,
        },
      };
    }
    const response = await httpClient.get<WalletAccount>(endpoints.wallet.getMine);
    return response as ApiSuccess<WalletAccount>;
  },

  payProtectedDeal: async (amountMinor: number): Promise<ApiSuccess<WalletAccount>> => {
    if (!appConfig.isMock) throw new Error('Wallet deal funding is not enabled by the API yet.');
    await delay(MOCK_LATENCY_MS);
    const state = getMockState();
    const current = mockWallet as ApiSuccess<WalletAccount>;
    const available = state.availableMinor ?? current.data.balance.availableMinor;
    if (amountMinor > available) throw new Error('Your available wallet balance is not enough for this deal.');
    state.availableMinor = available - amountMinor;
    return {
      success: true,
      message: 'Protected deal funded from wallet',
      data: { ...current.data, balance: { ...current.data.balance, availableMinor: state.availableMinor, protectedMinor: current.data.balance.protectedMinor + amountMinor } },
    };
  },

  fundBillsAccount: async (amountMinor: number): Promise<ApiSuccess<WalletAccount>> => {
    if (amountMinor <= 0) throw new Error('Enter a valid amount.');
    if (appConfig.isMock) {
      await delay(MOCK_LATENCY_MS);
      const state = getMockState();
      const current = mockWallet as ApiSuccess<WalletAccount>;
      const available = state.availableMinor ?? current.data.balance.availableMinor;
      const bills = state.billsMinor ?? current.data.balance.billsMinor ?? 0;
      if (amountMinor > available) throw new Error('Your available Naitrust balance is not enough.');
      state.availableMinor = available - amountMinor;
      state.billsMinor = bills + amountMinor;
      state.activity.unshift({
        id: `wact_bill_fund_${crypto.randomUUID()}`,
        kind: 'bill_funding',
        amountMinor,
        currency: current.data.balance.currency,
        description: 'Moved to Bills Account',
        createdAt: new Date().toISOString(),
      });
      return {
        success: true,
        message: 'Bills Account funded',
        data: { ...current.data, balance: { ...current.data.balance, availableMinor: state.availableMinor, billsMinor: state.billsMinor } },
      };
    }
    const response = await httpClient.post<WalletAccount>(endpoints.wallet.fundBills, { amountMinor });
    return response as ApiSuccess<WalletAccount>;
  },

  /**
   * Fund the wallet from a linked bank account. Mock-only for this phase , 
   * no real money movement happens in the frontend.
   * Real endpoint (not yet implemented): POST /wallet/fund
   */
  fund: async (input: {
    linkedBankAccountId: string;
    amountMinor: number;
    currency?: 'NGN' | 'USD';
  }): Promise<ApiSuccess<WalletAccount>> => {
    if (appConfig.isMock) {
      await delay(MOCK_LATENCY_MS);
      if (input.amountMinor <= 0) throw new Error('Enter a valid amount.');
      const state = getMockState();
      const current = mockWallet as ApiSuccess<WalletAccount>;
      const currency = input.currency ?? 'NGN';
      if (currency === 'USD') {
        const existing = current.data.currencyAccounts?.find((account) => account.currency === 'USD')?.availableMinor ?? 0;
        state.usdAvailableMinor = (state.usdAvailableMinor ?? existing) + input.amountMinor;
      } else {
        state.availableMinor = (state.availableMinor ?? current.data.balance.availableMinor) + input.amountMinor;
      }
      state.activity.unshift({ id: `wact_fund_${crypto.randomUUID()}`, kind: 'funding', amountMinor: input.amountMinor, currency, description: `${currency} wallet funding`, createdAt: new Date().toISOString() });
      const currencyAccounts = current.data.currencyAccounts?.map((account) => ({
        ...account,
        availableMinor: account.currency === 'USD'
          ? (state.usdAvailableMinor ?? account.availableMinor)
          : (state.availableMinor ?? account.availableMinor),
      }));
      return {
        success: true,
        message: 'Sandbox funding recorded',
        data: {
          ...current.data,
          balance: {
            ...current.data.balance,
            availableMinor: state.availableMinor ?? current.data.balance.availableMinor,
          },
          currencyAccounts,
          totalInflowMinor: current.data.totalInflowMinor + input.amountMinor,
        },
      };
    }
    const response = await httpClient.post<WalletAccount>(endpoints.wallet.fund, input);
    return response as ApiSuccess<WalletAccount>;
  },

  swapCurrency: async (input: {
    from: 'NGN' | 'USD';
    to: 'NGN' | 'USD';
    sourceAmountMinor: number;
  }): Promise<ApiSuccess<{ wallet: WalletAccount; receivedMinor: number; ngnPerUsd: number }>> => {
    if (!appConfig.isMock) throw new Error('Currency swaps are not enabled by the API yet.');
    if (input.from === input.to || input.sourceAmountMinor <= 0) throw new Error('Enter a valid swap.');
    await delay(MOCK_LATENCY_MS);
    const state = getMockState();
    const current = mockWallet as ApiSuccess<WalletAccount>;
    const ngnPerUsd = 1600;
    const baseNgn = state.availableMinor ?? current.data.balance.availableMinor;
    const baseUsd = state.usdAvailableMinor ?? current.data.currencyAccounts?.find((account) => account.currency === 'USD')?.availableMinor ?? 0;
    const receivedMinor = input.from === 'NGN'
      ? Math.floor(input.sourceAmountMinor / ngnPerUsd)
      : Math.floor(input.sourceAmountMinor * ngnPerUsd);

    if (receivedMinor <= 0) throw new Error('The amount is too small to swap.');
    if (input.from === 'NGN') {
      if (input.sourceAmountMinor > baseNgn) throw new Error('Your NGN balance is not enough for this swap.');
      state.availableMinor = baseNgn - input.sourceAmountMinor;
      state.usdAvailableMinor = baseUsd + receivedMinor;
    } else {
      if (input.sourceAmountMinor > baseUsd) throw new Error('Your USD balance is not enough for this swap.');
      state.usdAvailableMinor = baseUsd - input.sourceAmountMinor;
      state.availableMinor = baseNgn + receivedMinor;
    }

    state.activity.unshift({
      id: `wact_swap_${crypto.randomUUID()}`,
      kind: 'currency_exchange',
      amountMinor: input.sourceAmountMinor,
      currency: input.from,
      description: `Swapped ${input.from} to ${input.to}`,
      createdAt: new Date().toISOString(),
    });

    const wallet: WalletAccount = {
      ...current.data,
      balance: { ...current.data.balance, availableMinor: state.availableMinor },
      currencyAccounts: current.data.currencyAccounts?.map((account) => ({
        ...account,
        availableMinor: account.currency === 'NGN' ? state.availableMinor! : state.usdAvailableMinor!,
      })),
    };
    return { success: true, message: 'Currency swap completed', data: { wallet, receivedMinor, ngnPerUsd } };
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
      const state = getMockState();
      const current = mockWallet as ApiSuccess<WalletAccount>;
      const available = state.availableMinor ?? current.data.balance.availableMinor;
      if (input.amountMinor <= 0 || input.amountMinor > available) throw new Error('Enter an amount within your available balance.');
      state.availableMinor = available - input.amountMinor;
      state.activity.unshift({ id: `wact_withdraw_${crypto.randomUUID()}`, kind: 'withdrawal', amountMinor: input.amountMinor, currency: 'NGN', description: 'Withdrawal to verified bank account', createdAt: new Date().toISOString() });
      return {
        success: true,
        message: 'Sandbox withdrawal recorded',
        data: {
          ...current.data,
          balance: {
            ...current.data.balance,
            availableMinor: state.availableMinor,
          },
          currencyAccounts: current.data.currencyAccounts?.map((account) => account.currency === 'NGN' ? { ...account, availableMinor: state.availableMinor ?? account.availableMinor } : { ...account, availableMinor: state.usdAvailableMinor ?? account.availableMinor }),
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
      const current = mockWalletBankAccounts as ApiSuccess<LinkedBankAccount[]>;
      return { ...current, data: mockLinkedBankAccounts() };
    }
    const response = await httpClient.get<LinkedBankAccount[]>(
      endpoints.wallet.linkedBankAccounts,
    );
    return response as ApiSuccess<LinkedBankAccount[]>;
  },

  addLinkedBankAccount: async (input: Omit<LinkedBankAccount, 'id' | 'isDefault'>): Promise<ApiSuccess<LinkedBankAccount>> => {
    if (!appConfig.isMock) throw new Error('Adding withdrawal accounts is not enabled by the API yet.');
    await delay(MOCK_LATENCY_MS);
    const state = readMockLinkedBankState();
    const account: LinkedBankAccount = {
      ...input,
      id: `bank_${crypto.randomUUID()}`,
      accountNumber: `•••• ${input.accountNumber.slice(-4)}`,
      isDefault: false,
    };
    state.added.push(account);
    writeMockLinkedBankState(state);
    return { success: true, message: 'Bank account added', data: account };
  },

  setDefaultLinkedBankAccount: async (id: string): Promise<ApiSuccess<LinkedBankAccount[]>> => {
    if (!appConfig.isMock) throw new Error('Changing the default withdrawal account is not enabled by the API yet.');
    await delay(MOCK_LATENCY_MS);
    const accounts = mockLinkedBankAccounts();
    if (!accounts.some((account) => account.id === id)) throw new Error('Bank account not found.');
    const state = readMockLinkedBankState();
    state.defaultId = id;
    writeMockLinkedBankState(state);
    return { success: true, message: 'Default bank account updated', data: mockLinkedBankAccounts() };
  },

  /**
   * Wallet activity feed (statement): funding, withdrawals, instant
   * transfers, protected-deal allocation/release and fees.
   * Real endpoint (not yet implemented): GET /wallet/activity
   */
  getActivity: async (): Promise<ApiSuccess<WalletActivityEvent[]>> => {
    if (appConfig.isMock) {
      await delay(MOCK_LATENCY_MS);
      const state = getMockState();
      const current = mockWalletActivity as ApiSuccess<WalletActivityEvent[]>;
      return { ...current, data: [...state.activity, ...current.data] };
    }
    const response = await httpClient.get<WalletActivityEvent[]>(endpoints.wallet.activity);
    return response as ApiSuccess<WalletActivityEvent[]>;
  },
};
