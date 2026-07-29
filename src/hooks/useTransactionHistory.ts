/**
 * useTransactionHistory
 * Combines the existing protected-deal, instant-transfer and wallet-activity
 * queries into one unified, sorted `TransactionRecord[]` for the Transactions
 * screen. Does not introduce a new data source — purely a presentational
 * merge of the three that already exist.
 */

import { useMemo } from 'react';
import { useTransactions } from './useTransactions';
import { useInstantTransfers } from './useInstantTransfer';
import { useWalletActivity } from './useWallet';
import {
  dealsToTransactionRecords,
  transfersToTransactionRecords,
  walletActivityToTransactionRecords,
} from '../libs/utils/transaction-history';
import type { TransactionRecord } from '../libs/store/types';

export function useTransactionHistory(): {
  records: TransactionRecord[];
  isLoading: boolean;
} {
  const { data: deals, isLoading: dealsLoading } = useTransactions();
  const { data: transfers, isLoading: transfersLoading } = useInstantTransfers();
  const { data: activity, isLoading: activityLoading } = useWalletActivity();

  const records = useMemo(() => {
    const combined: TransactionRecord[] = [
      ...dealsToTransactionRecords(deals ?? []),
      ...transfersToTransactionRecords(transfers ?? []),
      ...walletActivityToTransactionRecords(activity ?? []),
    ];
    return combined.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [deals, transfers, activity]);

  return { records, isLoading: dealsLoading || transfersLoading || activityLoading };
}
