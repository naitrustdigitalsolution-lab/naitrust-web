import type {
  BusinessBillCategory,
  BusinessBillRecurrence,
  BusinessBillStatus,
} from './types';

export const BUSINESS_BILL_CATEGORY_OPTIONS: ReadonlyArray<{
  value: BusinessBillCategory;
  label: string;
}> = [
  { value: 'supplier', label: 'Supplier' },
  { value: 'utilities', label: 'Utilities' },
  { value: 'rent', label: 'Rent' },
  { value: 'payroll', label: 'Payroll' },
  { value: 'tax', label: 'Tax and levy' },
  { value: 'subscription', label: 'Subscription' },
  { value: 'logistics', label: 'Logistics' },
  { value: 'other', label: 'Other' },
];

export const BUSINESS_BILL_RECURRENCE_OPTIONS: ReadonlyArray<{
  value: BusinessBillRecurrence;
  label: string;
}> = [
  { value: 'one_off', label: 'One-time' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'quarterly', label: 'Quarterly' },
  { value: 'annually', label: 'Yearly' },
];

export const BUSINESS_BILL_STATUS_FILTERS: ReadonlyArray<{
  value: 'all' | BusinessBillStatus;
  label: string;
}> = [
  { value: 'all', label: 'All bills' },
  { value: 'due', label: 'Due soon' },
  { value: 'overdue', label: 'Overdue' },
  { value: 'upcoming', label: 'Upcoming' },
  { value: 'paid', label: 'Paid' },
];

export function businessBillCategoryLabel(value: BusinessBillCategory): string {
  return BUSINESS_BILL_CATEGORY_OPTIONS.find((option) => option.value === value)?.label ?? 'Other';
}

export function businessBillRecurrenceLabel(value: BusinessBillRecurrence): string {
  return BUSINESS_BILL_RECURRENCE_OPTIONS.find((option) => option.value === value)?.label ?? 'One-time';
}

