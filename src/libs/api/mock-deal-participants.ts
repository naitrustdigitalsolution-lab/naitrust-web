import authFixtures from '../../mocks/apis/auth-users.json';
import businessFixtures from '../../mocks/apis/businesses.json';
import type { DealParticipantInput, SafeDealSummary } from '../store/types';
import { findMockCreatedDeal } from './mock-protected-deal-store';

type AuthFixture = { user: { id: string; name?: string; email: string; phone?: string; naitrustId?: string } };
type BusinessFixture = { id: string; ownerUserId: string; name: string; email?: string; phone?: string; ntId?: string; paymentAccount?: { accountNumber?: string } };

const users = authFixtures.users as AuthFixture[];
const businesses = businessFixtures.data as BusinessFixture[];
const normalize = (value: string | undefined) => value?.trim().toLowerCase().replace(/\s/g, '');
const normalizeBusinessName = (value: string | undefined) => normalize(value)
  ?.replace(/[^a-z0-9]/g, '')
  .replace(/(limited|ltd|incorporated|inc|plc)$/g, '');

export function mockParticipantUserId(participant: DealParticipantInput): string | undefined {
  const profileId = participant.profileId;
  const directUser = users.find(({ user }) => user.id === profileId);
  if (directUser) return directUser.user.id;
  const business = businesses.find((item) => item.id === profileId);
  if (business) return business.ownerUserId;

  const identities = [participant.email, participant.phone, participant.identifier].map(normalize).filter(Boolean);
  const user = users.find(({ user }) => [user.email, user.phone, user.naitrustId].map(normalize).some((value) => value && identities.includes(value)));
  if (user) return user.user.id;
  return businesses.find((item) =>
    normalizeBusinessName(item.name) === normalizeBusinessName(participant.name)
    || [item.email, item.phone, item.ntId, item.paymentAccount?.accountNumber].map(normalize).some((value) => value && identities.includes(value)),
  )?.ownerUserId;
}

export function mockCreatedDealParticipantIndex(dealId: string, userId: string | undefined, signedInIdentities: Array<string | undefined> = []): number {
  if (!userId) return -1;
  const deal = findMockCreatedDeal(dealId);
  const context = mockCreatedDealRoleContext(dealId);
  if (!deal || deal.summary.createdByUserId === userId) return -1;
  const viewerIdentities = signedInIdentities.map(normalize).filter(Boolean);
  const participantIndex = deal.input.participants.findIndex((participant, index) =>
    index !== context.selfParticipantIndex && (
      participant.profileId === userId
      || mockParticipantUserId(participant) === userId
      || [participant.email, participant.phone, participant.identifier].map(normalize).some((value) => value && viewerIdentities.includes(value))
    ),
  );
  if (participantIndex >= 0) return participantIndex;

  // Compatibility for older locally-created mock deals whose selected
  // business contact did not persist a resolvable profile ID. The summary
  // still carries the intended business name.
  const viewerBusinesses = businesses.filter((business) => business.ownerUserId === userId);
  const summaryMatchesViewer = viewerBusinesses.some((business) =>
    normalizeBusinessName(business.name) === normalizeBusinessName(deal.summary.counterpartyName),
  );
  if (!summaryMatchesViewer) return -1;
  return deal.input.participants.findIndex((_, index) => index !== context.selfParticipantIndex);
}

export function mockCreatedDealRoleContext(dealId: string): {
  creatorRole: 'buyer' | 'seller';
  selfParticipantIndex: number;
} {
  const deal = findMockCreatedDeal(dealId);
  if (!deal) return { creatorRole: 'buyer', selfParticipantIndex: -1 };
  const ownerId = deal.summary.createdByUserId;
  const ownerBusinesses = businesses.filter((business) => business.ownerUserId === ownerId);
  const selectedBusiness = ownerBusinesses.find((business) => business.id === deal.summary.businessId) ?? ownerBusinesses[0];
  const selfParticipantIndex = deal.input.participants.findIndex((participant) =>
    ownerBusinesses.some((business) => business.id === participant.profileId)
    || normalize(participant.name) === normalize(selectedBusiness?.name),
  );
  const selfParticipant = selfParticipantIndex >= 0 ? deal.input.participants[selfParticipantIndex] : undefined;
  return {
    creatorRole: selfParticipant?.allocationMinor ? 'seller' : deal.input.role,
    selfParticipantIndex,
  };
}

function creatorDisplayName(deal: SafeDealSummary): string | undefined {
  const creatorBusinesses = businesses.filter((business) => business.ownerUserId === deal.createdByUserId);
  return creatorBusinesses.find((business) => business.id === deal.businessId)?.name
    ?? creatorBusinesses[0]?.name
    ?? users.find(({ user }) => user.id === deal.createdByUserId)?.user.name;
}

/** Returns the party label from the current viewer's perspective. */
export function mockDealPartyLabel(deal: SafeDealSummary, viewerUserId: string | undefined): string {
  if (!viewerUserId || deal.createdByUserId === viewerUserId) {
    const createdDeal = findMockCreatedDeal(deal.id);
    if (!createdDeal) return deal.counterpartyName;
    const { selfParticipantIndex } = mockCreatedDealRoleContext(deal.id);
    const otherPartyNames = createdDeal.input.participants
      .filter((_, index) => index !== selfParticipantIndex)
      .map((participant) => participant.name.trim())
      .filter((name, index, names) => Boolean(name) && names.indexOf(name) === index);
    return otherPartyNames.join(', ') || deal.counterpartyName;
  }

  return creatorDisplayName(deal) ?? deal.counterpartyName;
}
