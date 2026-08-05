import type { Beneficiary, TransferRecipient } from '../store/types';

export type CreateBeneficiaryInput = Omit<Beneficiary, 'id' | 'createdAt' | 'isFavourite'>;

function normalize(value: string | undefined): string {
  return (value ?? '').trim().toLowerCase().replace(/[\s()-]/g, '');
}

export function beneficiaryMatchesRecipient(
  beneficiary: Beneficiary,
  recipient: TransferRecipient,
): boolean {
  if (recipient.method === 'bank_transfer') {
    return beneficiary.type === 'bank_account'
      && normalize(beneficiary.bankName) === normalize(recipient.bankName)
      && normalize(beneficiary.accountNumber) === normalize(recipient.identifier);
  }

  if (beneficiary.type !== 'naitrust_user') return false;
  const identifier = normalize(recipient.identifier);
  return [
    beneficiary.email,
    beneficiary.phone,
    beneficiary.naitrustIdentifier,
    beneficiary.naitrustAccountNumber,
    beneficiary.naitrustId,
  ]
    .some((value) => normalize(value) === identifier);
}

export function beneficiaryInputFromRecipient(
  recipient: TransferRecipient,
): CreateBeneficiaryInput | null {
  const name = recipient.resolvedName?.trim() || recipient.identifier.trim();
  if (recipient.method === 'beneficiary') return null;
  if (recipient.method === 'bank_transfer') {
    if (!recipient.bankName) return null;
    return {
      type: 'bank_account',
      name,
      bankName: recipient.bankName,
      accountNumber: recipient.identifier,
    };
  }
  if (recipient.method === 'email_address') return { type: 'naitrust_user', name, email: recipient.identifier };
  if (recipient.method === 'phone_number') return { type: 'naitrust_user', name, phone: recipient.identifier };
  return {
    type: 'naitrust_user',
    name,
    naitrustAccountNumber: recipient.naitrustAccountNumber
      ?? (recipient.method === 'naitrust_account_number' ? recipient.identifier : undefined),
    naitrustId: recipient.naitrustId
      ?? (recipient.method === 'naitrust_id' ? recipient.identifier : undefined),
  };
}

export function isRecipientSaved(
  beneficiaries: Beneficiary[] | undefined,
  recipient: TransferRecipient | null,
): boolean {
  return Boolean(recipient && beneficiaries?.some((beneficiary) => beneficiaryMatchesRecipient(beneficiary, recipient)));
}
