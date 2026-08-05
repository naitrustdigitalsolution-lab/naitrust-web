import { differenceInCalendarDays, parseISO } from 'date-fns';
import fixtures from '../../mocks/apis/business-bills.json';
import type {
  BusinessBill,
  BusinessBillStatus,
  CreateBusinessBillInput,
} from './types';

const STORAGE_PREFIX = 'naitrust:business-bills:v1:';

function storageKey(businessId: string): string {
  return `${STORAGE_PREFIX}${businessId}`;
}

function fixtureBills(businessId: string): BusinessBill[] {
  return (fixtures as BusinessBill[]).filter((bill) => bill.businessId === businessId);
}

function writeBills(businessId: string, bills: BusinessBill[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(storageKey(businessId), JSON.stringify(bills));
}

export function listBusinessBills(businessId: string | undefined): BusinessBill[] {
  if (!businessId || typeof window === 'undefined') return [];
  const stored = localStorage.getItem(storageKey(businessId));
  if (!stored) {
    const seeded = fixtureBills(businessId);
    writeBills(businessId, seeded);
    return seeded;
  }
  try {
    const parsed = JSON.parse(stored) as BusinessBill[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    const seeded = fixtureBills(businessId);
    writeBills(businessId, seeded);
    return seeded;
  }
}

export function createBusinessBill(input: CreateBusinessBillInput): BusinessBill {
  const bill: BusinessBill = {
    ...input,
    id: `bill_mock_${crypto.randomUUID()}`,
    createdAt: new Date().toISOString(),
  };
  writeBills(input.businessId, [bill, ...listBusinessBills(input.businessId)]);
  return bill;
}

export function markBusinessBillPaid(businessId: string, billId: string): BusinessBill | null {
  let updated: BusinessBill | null = null;
  const bills = listBusinessBills(businessId).map((bill) => {
    if (bill.id !== billId) return bill;
    updated = { ...bill, paidAt: new Date().toISOString() };
    return updated;
  });
  writeBills(businessId, bills);
  return updated;
}

export function businessBillStatus(bill: BusinessBill, today = new Date()): BusinessBillStatus {
  if (bill.paidAt) return 'paid';
  const daysUntilDue = differenceInCalendarDays(parseISO(bill.dueDate), today);
  if (daysUntilDue < 0) return 'overdue';
  if (daysUntilDue <= 3) return 'due';
  return 'upcoming';
}

