export type BusinessBillCategory =
  | 'supplier'
  | 'utilities'
  | 'rent'
  | 'payroll'
  | 'tax'
  | 'subscription'
  | 'logistics'
  | 'other';

export type BusinessBillRecurrence = 'one_off' | 'weekly' | 'monthly' | 'quarterly' | 'annually';
export type BusinessBillStatus = 'upcoming' | 'due' | 'overdue' | 'paid';

export interface BusinessBill {
  id: string;
  businessId: string;
  title: string;
  payeeName: string;
  category: BusinessBillCategory;
  amountMinor: number;
  currency: string;
  dueDate: string;
  recurrence: BusinessBillRecurrence;
  reference?: string;
  note?: string;
  paidAt?: string;
  createdAt: string;
}

export type CreateBusinessBillInput = Omit<BusinessBill, 'id' | 'createdAt' | 'paidAt'>;

