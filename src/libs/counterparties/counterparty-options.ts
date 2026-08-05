import type { CounterpartyRelation } from '../store/types';
import type { CounterpartyFilter } from './types';

export const COUNTERPARTY_RELATION_LABEL: Record<CounterpartyRelation, string> = {
  supplier: 'Supplier',
  buyer: 'Buyer',
  contractor: 'Contractor',
  customer: 'Customer',
  agent: 'Agent',
  other: 'Other',
};

export const COUNTERPARTY_FILTER_OPTIONS: ReadonlyArray<{
  value: CounterpartyFilter;
  label: string;
}> = [
  { value: 'all', label: 'All contacts' },
  { value: 'favourite', label: 'Favourites' },
  { value: 'supplier', label: 'Suppliers' },
  { value: 'contractor', label: 'Contractors' },
  { value: 'customer', label: 'Customers' },
  { value: 'agent', label: 'Agents' },
  { value: 'blocked', label: 'Blocked' },
];

export function counterpartyRelationLabel(relation: CounterpartyRelation): string {
  return COUNTERPARTY_RELATION_LABEL[relation];
}

