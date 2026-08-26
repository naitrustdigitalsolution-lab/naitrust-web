/**
 * Order agent invitations.
 *
 * Unlike carts, quotes and orders (scoped per authenticated account), an
 * invitation must be readable by someone who is not yet signed in, and by
 * whichever account they end up claiming it with — neither of which is the
 * inviting buyer's account. So this store intentionally uses one shared,
 * unscoped localStorage key rather than `marketplaceStorageKey`.
 */
import type { CustomOrderLink, OrderAgentInvitation } from './types';

const STORAGE_KEY = 'naitrust:order-invitations:v1';
const EXPIRY_DAYS = 14;

function read(): OrderAgentInvitation[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]') as OrderAgentInvitation[];
  } catch {
    return [];
  }
}

function write(list: OrderAgentInvitation[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

function withComputedStatus(invitation: OrderAgentInvitation): OrderAgentInvitation {
  if (invitation.status === 'pending' && Date.now() > new Date(invitation.expiresAt).getTime()) {
    return { ...invitation, status: 'expired' };
  }
  return invitation;
}

function normalise(value: string): string {
  return value.trim().toLowerCase();
}

function isRecipient(invitation: OrderAgentInvitation, identifiers: string[]): boolean {
  const contact = normalise(invitation.contact);
  return identifiers.some((identifier) => normalise(identifier) === contact);
}

const wait = () => new Promise((resolve) => setTimeout(resolve, 250));

export const orderInvitationsApi = {
  /** A buyer, who already has an order, invites a sourcing agent to work on it. */
  create: async (input: {
    orderId: string;
    orderReference: string;
    orderSummary: string;
    destination?: string;
    links: CustomOrderLink[];
    requestNotes?: string;
    contact: string;
    invitedByName: string;
  }): Promise<{ token: string; url: string }> => {
    await wait();
    const token = `nt-order-invite-${crypto.randomUUID()}`;
    const invitation: OrderAgentInvitation = {
      token,
      kind: 'agent_invite',
      orderId: input.orderId,
      orderReference: input.orderReference,
      orderSummary: input.orderSummary,
      destination: input.destination,
      links: input.links,
      requestNotes: input.requestNotes,
      contact: input.contact,
      invitedByName: input.invitedByName,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + EXPIRY_DAYS * 86400000).toISOString(),
      status: 'pending',
    };
    write([invitation, ...read()]);
    return { token, url: `${window.location.origin}/invite/order/${token}` };
  },

  /**
   * A sourcing agent has found products for a buyer who doesn't have an
   * order yet. The order is created in the buyer's own account only once
   * they claim the invitation — the agent's account can't hold it.
   */
  createBuyerRequest: async (input: {
    orderSummary: string;
    destination?: string;
    links: CustomOrderLink[];
    requestNotes?: string;
    contact: string;
    invitedByName: string;
  }): Promise<{ token: string; url: string }> => {
    await wait();
    const token = `nt-order-invite-${crypto.randomUUID()}`;
    const invitation: OrderAgentInvitation = {
      token,
      kind: 'buyer_request',
      orderId: `pending_${token}`,
      orderReference: `NTM-${String(Date.now()).slice(-7)}`,
      orderSummary: input.orderSummary,
      destination: input.destination,
      links: input.links,
      requestNotes: input.requestNotes,
      contact: input.contact,
      invitedByName: input.invitedByName,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + EXPIRY_DAYS * 86400000).toISOString(),
      status: 'pending',
    };
    write([invitation, ...read()]);
    return { token, url: `${window.location.origin}/invite/order/${token}` };
  },

  listForOrder: (orderId: string): OrderAgentInvitation[] =>
    read().map(withComputedStatus).filter((invitation) => invitation.orderId === orderId),

  /** Invitations an agent or buyer has sent that are still awaiting a claim. */
  listSentByName: (invitedByName: string): OrderAgentInvitation[] =>
    read().map(withComputedStatus).filter((invitation) => invitation.invitedByName === invitedByName),

  listForRecipient: (identifiers: string[], kind?: OrderAgentInvitation['kind']): OrderAgentInvitation[] =>
    read().map(withComputedStatus).filter((invitation) => isRecipient(invitation, identifiers) && (!kind || invitation.kind === kind)),

  getPublicPreview: (token: string): OrderAgentInvitation | null => {
    const invitation = read().find((item) => item.token === token);
    return invitation ? withComputedStatus(invitation) : null;
  },

  claim: async (token: string, user: { id: string; name: string }): Promise<{ destination: string }> => {
    await wait();
    const list = read();
    const invitation = list.find((item) => item.token === token);
    if (!invitation) throw new Error('This invitation could not be found.');
    const current = withComputedStatus(invitation);
    if (current.status === 'expired') throw new Error('This invitation has expired.');
    if (current.status === 'claimed') throw new Error('This invitation has already been claimed.');

    if (current.kind === 'buyer_request') {
      const claimed: OrderAgentInvitation = { ...invitation, status: 'claimed', claimedByUserId: user.id, claimedByName: user.name };
      write(list.map((item) => item.token === token ? claimed : item));
      return { destination: `/app/orders/new?invitation=${encodeURIComponent(token)}` };
    }

    const claimed: OrderAgentInvitation = { ...invitation, status: 'claimed', claimedByUserId: user.id, claimedByName: user.name };
    write(list.map((item) => item.token === token ? claimed : item));
    return { destination: `/app/orders/invited/${token}` };
  },

  completeBuyerRequest: (token: string, orderId: string): void => {
    write(read().map((item) => item.token === token && item.kind === 'buyer_request' ? { ...item, orderId } : item));
  },

  claimForAgent: async (token: string, agent: { id: string; name: string; identifiers: string[] }): Promise<void> => {
    await wait();
    const list = read();
    const invitation = list.find((item) => item.token === token);
    if (!invitation || invitation.kind !== 'agent_invite') throw new Error('This agent invitation could not be found.');
    if (!isRecipient(invitation, agent.identifiers)) throw new Error('This invitation was sent to another sourcing-agent account.');
    const current = withComputedStatus(invitation);
    if (current.status !== 'pending') throw new Error(`This invitation is already ${current.status}.`);
    write(list.map((item) => item.token === token ? { ...item, status: 'claimed' as const, claimedByUserId: agent.id, claimedByName: agent.name } : item));
  },

  decline: async (token: string, identifiers: string[]): Promise<void> => {
    await wait();
    const list = read();
    const invitation = list.find((item) => item.token === token);
    if (!invitation) throw new Error('This invitation could not be found.');
    if (!isRecipient(invitation, identifiers)) throw new Error('This invitation was sent to another account.');
    const current = withComputedStatus(invitation);
    if (current.status !== 'pending') throw new Error(`This invitation is already ${current.status}.`);
    write(list.map((item) => item.token === token ? { ...item, status: 'declined' as const } : item));
  },

  withdraw: (token: string): void => {
    write(read().map((item) => item.token === token ? { ...item, status: 'withdrawn' as const } : item));
  },
};
