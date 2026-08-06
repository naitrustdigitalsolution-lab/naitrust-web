import authUsers from '../../mocks/apis/auth-users.json';
import businesses from '../../mocks/apis/businesses.json';

export interface NaitrustContactMatch {
  naitrustId: string;
  name: string;
  businessName?: string;
  email?: string;
  phone?: string;
  address?: string;
  isBusiness: boolean;
}

export async function lookupNaitrustContact(value: string): Promise<NaitrustContactMatch | null> {
  await new Promise((resolve) => window.setTimeout(resolve, 350));
  const id = value.trim().toLowerCase();
  const business = businesses.data.find((item) => item.ntId.toLowerCase() === id);
  if (business) return { naitrustId: business.ntId, name: business.ownerName ?? business.name, businessName: business.name, email: business.email, phone: business.phone, address: business.address, isBusiness: true };
  const account = authUsers.users.map((entry) => entry.user).find((user) => user.naitrustId.toLowerCase() === id);
  if (!account) return null;
  return { naitrustId: account.naitrustId, name: account.name, email: account.email, phone: account.phone, isBusiness: account.role === 'business' };
}
