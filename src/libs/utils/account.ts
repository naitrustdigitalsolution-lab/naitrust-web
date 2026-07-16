/**
 * Account type helpers
 * One dashboard shell serves everyone; the account type (derived from the
 * user's role chosen at registration) drives which nav, copy, and KYC flow
 * they see. Business members inherit the business view.
 */

import type { User } from '../store/types';
import type { PartyMode } from '../store/types';

export type AccountType = 'business' | 'customer' | 'admin';

export interface PartyModeOption {
  mode: PartyMode;
  title: string;
  description: string;
}

/**
 * The "who's involved" choices a given account type may create. A customer
 * only deals with a business/vendor (B2C); a business can deal with another
 * business (B2B) or with an individual customer (B2C). Keeps each account type
 * from seeing options that don't apply to it.
 */
export function partyModeOptionsFor(type: AccountType): PartyModeOption[] {
  if (type === 'customer') {
    return [
      {
        mode: 'b2c',
        title: 'You and a business',
        description: 'A protected deal between you and a business or vendor.',
      },
    ];
  }
  return [
    {
      mode: 'b2b',
      title: 'Business to business',
      description: 'You and another business — supplier, distributor, or partner.',
    },
    {
      mode: 'b2c',
      title: 'Business to customer',
      description: 'Your business and an individual customer.',
    },
  ];
}

export function accountTypeOf(user: User | null | undefined): AccountType {
  if (!user) return 'customer';
  if (user.role === 'business' || user.role === 'business-member') return 'business';
  if (user.role === 'admin') return 'admin';
  return 'customer';
}

export function accountTypeLabel(type: AccountType): string {
  switch (type) {
    case 'business':
      return 'Business account';
    case 'admin':
      return 'Admin';
    default:
      return 'Customer account';
  }
}

export function isBusinessAccount(user: User | null | undefined): boolean {
  return accountTypeOf(user) === 'business';
}
