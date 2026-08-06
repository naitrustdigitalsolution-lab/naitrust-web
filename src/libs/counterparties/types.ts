import type { CounterpartyProfile } from '../store/types';

export type CounterpartyFilter =
  | 'all'
  | 'favourite'
  | 'supplier'
  | 'contractor'
  | 'customer'
  | 'agent'
  | 'blocked';

export interface CreateCounterpartyInput {
  name: string;
  naitrustId?: string;
  businessName?: string;
  relation: 'customer' | 'supplier' | 'contractor' | 'agent';
  email?: string;
  phone?: string;
  address?: string;
  notes?: string;
}

export type CounterpartyTransactionType = 'protected_deal' | 'instant_payment';
export type CounterpartyTransactionDirection = 'sent' | 'received';

export interface CounterpartyTransaction {
  id: string;
  counterpartyId: CounterpartyProfile['id'];
  reference: string;
  title: string;
  type: CounterpartyTransactionType;
  direction: CounterpartyTransactionDirection;
  amountMinor: number;
  currency: string;
  status: 'completed';
  completedAt: string;
}
