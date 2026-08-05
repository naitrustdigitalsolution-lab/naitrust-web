import fixtureResponse from '../../mocks/apis/beneficiaries.json';
import { getUserData } from '../api/config';
import type { Beneficiary } from '../store/types';
import type { CreateBeneficiaryInput } from './recipient-beneficiary';

const STORAGE_PREFIX = 'naitrust:beneficiaries:v4:';

function ownerKey(): string {
  const user = getUserData() as { id?: string } | null;
  return user?.id ?? 'anonymous';
}

function storageKey(): string {
  return `${STORAGE_PREFIX}${ownerKey()}`;
}

function seededBeneficiaries(): Beneficiary[] {
  type OwnedBeneficiary = Beneficiary & { ownerUserId: string };
  return (fixtureResponse.data as OwnedBeneficiary[])
    .filter((beneficiary) => beneficiary.ownerUserId === ownerKey())
    .map(({ ownerUserId: _ownerUserId, ...beneficiary }) => beneficiary);
}

function writeBeneficiaries(beneficiaries: Beneficiary[]): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(storageKey(), JSON.stringify(beneficiaries));
}

export function listMockBeneficiaries(): Beneficiary[] {
  if (typeof window === 'undefined') return seededBeneficiaries();
  const stored = window.localStorage.getItem(storageKey());
  if (!stored) {
    const seeded = seededBeneficiaries();
    writeBeneficiaries(seeded);
    return seeded;
  }
  try {
    const parsed = JSON.parse(stored) as Beneficiary[];
    return Array.isArray(parsed) ? parsed : seededBeneficiaries();
  } catch {
    const seeded = seededBeneficiaries();
    writeBeneficiaries(seeded);
    return seeded;
  }
}

function sameBeneficiary(left: Beneficiary, right: CreateBeneficiaryInput): boolean {
  if (left.type !== right.type) return false;
  if (left.type === 'bank_account') {
    return left.bankName?.toLowerCase() === right.bankName?.toLowerCase()
      && left.accountNumber?.replace(/\D/g, '') === right.accountNumber?.replace(/\D/g, '');
  }
  return Boolean(
    (right.email && left.email?.toLowerCase() === right.email.toLowerCase())
    || (right.phone && left.phone?.replace(/\D/g, '') === right.phone.replace(/\D/g, ''))
    || (right.naitrustIdentifier && left.naitrustIdentifier?.toLowerCase() === right.naitrustIdentifier.toLowerCase())
    || (right.naitrustAccountNumber && left.naitrustAccountNumber === right.naitrustAccountNumber)
    || (right.naitrustId && left.naitrustId?.toLowerCase() === right.naitrustId.toLowerCase()),
  );
}

export function createMockBeneficiary(input: CreateBeneficiaryInput): Beneficiary {
  const beneficiaries = listMockBeneficiaries();
  const existing = beneficiaries.find((beneficiary) => sameBeneficiary(beneficiary, input));
  if (existing) return existing;
  const beneficiary: Beneficiary = {
    ...input,
    id: `ben_mock_${crypto.randomUUID()}`,
    isFavourite: false,
    createdAt: new Date().toISOString(),
  };
  writeBeneficiaries([beneficiary, ...beneficiaries]);
  return beneficiary;
}

export function removeMockBeneficiary(id: string): void {
  writeBeneficiaries(listMockBeneficiaries().filter((beneficiary) => beneficiary.id !== id));
}
