import type {
  DealActivityEvent,
  DealDeliveryLifecycle,
  DealEvidenceItem,
  DealRole,
  ExtendedProductTestingDays,
  FundingStatus,
  SafeDealStatus,
} from '../store/types';
import {
  createHandoverOtp,
  createOpaqueToken,
  DELIVERY_CARD_VALIDITY_MS,
  emptyDeliveryLifecycle,
  fundingReviewDurationMs,
  fundingReviewLabel,
  HANDOVER_REVIEW_MS,
  isDeliveryCardStatusEligible,
  hasRequiredProductEvidence,
} from '../protected-deals/delivery-review';
import {
  findMockDealByDeliveryToken,
  getMockDealRuntime,
  patchMockDealRuntime,
} from './mock-protected-deal-store';
import { notificationsApi } from './notifications.api';

export interface DeliveryDealContext {
  id: string;
  reference: string;
  title: string;
  status: SafeDealStatus;
  fundingStatus: FundingStatus;
  actorRole: DealRole;
  actorUserId?: string;
  buyerUserId?: string;
  evidence: DealEvidenceItem[];
  extendedProductTestingDays?: ExtendedProductTestingDays;
  amountMinor: number;
  useCase?: string;
}

function event(kind: DealActivityEvent['kind'], message: string, at = new Date()): DealActivityEvent {
  return { id: `activity_${crypto.randomUUID()}`, kind, message, createdAt: at.toISOString() };
}

function saveLifecycle(
  dealId: string,
  delivery: DealDeliveryLifecycle,
  status?: SafeDealStatus,
  nextEvents: DealActivityEvent[] = [],
): DealDeliveryLifecycle {
  const current = getMockDealRuntime(dealId);
  patchMockDealRuntime(dealId, {
    delivery,
    status: status ?? current?.status,
    activity: [...nextEvents, ...(current?.activity ?? [])],
  });
  return delivery;
}

function notify(title: string, message: string, dealId: string): void {
  notificationsApi.pushLocal({
    type: 'deal',
    title,
    message,
    link: `/app/deals/${dealId}`,
  });
}

function startFundingReview(
  delivery: DealDeliveryLifecycle,
  at: Date,
): DealDeliveryLifecycle {
  const days = delivery.fundingReview.extendedProductTestingDays;
  return {
    ...delivery,
    fundingReview: {
      status: 'in_progress',
      startsAt: at.toISOString(),
      endsAt: new Date(at.getTime() + fundingReviewDurationMs(days)).toISOString(),
      extendedProductTestingDays: days,
    },
  };
}

function expireCard(delivery: DealDeliveryLifecycle, now: Date): DealDeliveryLifecycle {
  const card = delivery.card;
  if (!card || card.status !== 'active' || new Date(card.expiresAt).getTime() > now.getTime()) {
    return delivery;
  }
  return { ...delivery, card: { ...card, status: 'expired', invalidatedAt: now.toISOString() } };
}

export function getDeliveryLifecycle(
  dealId: string,
  testingDays?: ExtendedProductTestingDays,
): DealDeliveryLifecycle {
  return getMockDealRuntime(dealId)?.delivery ?? emptyDeliveryLifecycle(testingDays);
}

export function reconcileDeliveryLifecycle(
  dealId: string,
  testingDays?: ExtendedProductTestingDays,
  now = new Date(),
): DealDeliveryLifecycle {
  const runtime = getMockDealRuntime(dealId);
  let delivery = runtime?.delivery ?? emptyDeliveryLifecycle(testingDays);
  const nextEvents: DealActivityEvent[] = [];
  let status = runtime?.status;

  delivery = expireCard(delivery, now);
  if (
    delivery.handover.status === 'in_progress' &&
    delivery.handover.endsAt &&
    new Date(delivery.handover.endsAt).getTime() <= now.getTime()
  ) {
    delivery = startFundingReview(
      {
        ...delivery,
        handover: {
          ...delivery.handover,
          status: 'completed',
          completedAt: delivery.handover.endsAt,
          completionReason: 'timer_elapsed',
        },
      },
      new Date(delivery.handover.endsAt),
    );
    status = 'buyer_review';
    nextEvents.push(
      event('delivery', 'Handover review completed without an immediate issue.', new Date(delivery.handover.endsAt)),
      event(
        'review',
        `${fundingReviewLabel(testingDays)} started. A dispute before the deadline blocks release.`,
        new Date(delivery.handover.endsAt),
      ),
    );
    notify('Handover review completed', 'No immediate product problem was reported during handover.', dealId);
    notify('Funding review started', `${fundingReviewLabel(testingDays)} is now active.`, dealId);
  }

  if (
    delivery.fundingReview.status === 'in_progress' &&
    delivery.fundingReview.endsAt &&
    new Date(delivery.fundingReview.endsAt).getTime() <= now.getTime()
  ) {
    const approvedAt = delivery.fundingReview.endsAt;
    delivery = {
      ...delivery,
      fundingReview: {
        ...delivery.fundingReview,
        status: 'release_approved',
        releaseApprovedAt: approvedAt,
        releaseMethod: 'automatic',
      },
    };
    status = 'release_approved';
    nextEvents.push(
      event('released', 'The review deadline passed without a dispute. Release was approved.', new Date(approvedAt)),
    );
    notify('Automatic release approved', 'The review deadline passed without a dispute. Partner payout is processing.', dealId);
  }

  if (
    delivery.fundingReview.status === 'release_approved' &&
    delivery.fundingReview.releaseApprovedAt &&
    new Date(delivery.fundingReview.releaseApprovedAt).getTime() + 1_000 <= now.getTime()
  ) {
    const firstSplitPaymentCompleted = runtime?.activePaymentStage === 1 && Boolean(runtime.remainingPaymentMinor);
    if (firstSplitPaymentCompleted) {
      const activatedAt = now.toISOString();
      delivery = emptyDeliveryLifecycle(testingDays);
      status = 'awaiting_funding';
      patchMockDealRuntime(dealId, {
        activePaymentStage: 2,
        firstPaymentReleasedAt: activatedAt,
      });
      nextEvents.push(
        event('completed', 'The first payment allocation reached the seller.', now),
        event('funded', 'The second payment allocation activated automatically and is awaiting funding.', now),
      );
      notify('Next payment activated', 'The first allocation was released successfully. The second allocation is now active.', dealId);
      return saveLifecycle(dealId, delivery, status, nextEvents);
    }
    delivery = {
      ...delivery,
      fundingReview: {
        ...delivery.fundingReview,
        status: 'paid_out',
        paidOutAt: now.toISOString(),
        paymentReference: delivery.fundingReview.paymentReference ?? `NTR-${crypto.randomUUID().slice(0, 8).toUpperCase()}`,
      },
    };
    status = 'paid_out';
    nextEvents.push(event('completed', 'Protected funds were released to the seller.', now));
    notify('Payment released', 'Protected funds were paid out to the seller.', dealId);
  }

  return saveLifecycle(dealId, delivery, status, nextEvents);
}

export function generateDeliveryCard(context: DeliveryDealContext): DealDeliveryLifecycle {
  if (context.actorRole !== 'seller') throw new Error('Only the seller can generate a delivery card.');
  if (context.fundingStatus !== 'funded' || !isDeliveryCardStatusEligible(context.status)) {
    throw new Error('The deal must be funded and active before a delivery card can be generated.');
  }
  const now = new Date();
  const current = reconcileDeliveryLifecycle(context.id, context.extendedProductTestingDays, now);
  if (current.handover.status !== 'not_started') {
    throw new Error('This product has already been received. The delivery card cannot be changed.');
  }
  const generation = (current.card?.generation ?? 0) + 1;
  const delivery: DealDeliveryLifecycle = {
    ...current,
    card: {
      token: createOpaqueToken(),
      otpCode: createHandoverOtp(),
      intendedBuyerUserId: context.buyerUserId,
      generatedAt: now.toISOString(),
      expiresAt: new Date(now.getTime() + DELIVERY_CARD_VALIDITY_MS).toISOString(),
      status: 'active',
      generation,
    },
  };
  return saveLifecycle(
    context.id,
    delivery,
    undefined,
    [event('delivery', generation === 1 ? 'Delivery card generated.' : 'Delivery card regenerated. Previous credentials were invalidated.')],
  );
}

export function resolveDeliveryToken(token: string): string | null {
  return findMockDealByDeliveryToken(token)?.dealId ?? null;
}

export function invalidateDeliveryCard(dealId: string): DealDeliveryLifecycle {
  const current = getDeliveryLifecycle(dealId);
  if (!current.card || current.card.status !== 'active') return current;
  const now = new Date().toISOString();
  return saveLifecycle(dealId, {
    ...current,
    card: { ...current.card, status: 'invalidated', invalidatedAt: now },
  });
}

function assertReceiptAllowed(
  context: DeliveryDealContext,
  delivery: DealDeliveryLifecycle,
): void {
  if (context.actorRole !== 'buyer') throw new Error('Only the buyer on this deal can confirm receipt.');
  if (delivery.card?.intendedBuyerUserId && context.actorUserId !== delivery.card.intendedBuyerUserId) {
    throw new Error('This delivery card belongs to a different buyer account.');
  }
  if (context.fundingStatus !== 'funded' || !isDeliveryCardStatusEligible(context.status)) {
    throw new Error('This deal is not active and funded.');
  }
  if (!delivery.card || delivery.card.status !== 'active') {
    throw new Error('This delivery card is no longer valid.');
  }
  if (delivery.handover.status !== 'not_started') throw new Error('Receipt has already been confirmed.');
}

export function confirmDeliveryReceipt(
  context: DeliveryDealContext,
  credential: { token?: string; otpCode?: string },
): DealDeliveryLifecycle {
  const now = new Date();
  const current = reconcileDeliveryLifecycle(context.id, context.extendedProductTestingDays, now);
  assertReceiptAllowed(context, current);
  const tokenMatches = credential.token && current.card?.token === credential.token;
  const otpMatches = credential.otpCode && current.card?.otpCode === credential.otpCode.trim();
  if (!tokenMatches && !otpMatches) throw new Error('The handover QR or OTP is not valid.');

  const delivery: DealDeliveryLifecycle = {
    ...current,
    card: { ...current.card!, status: 'used', usedAt: now.toISOString() },
    handover: {
      status: 'in_progress',
      receivedAt: now.toISOString(),
      endsAt: new Date(now.getTime() + HANDOVER_REVIEW_MS).toISOString(),
    },
  };
  notify(
    'Buyer received the product',
    'The buyer verified the rider’s delivery card and confirmed receipt.',
    context.id,
  );
  return saveLifecycle(
    context.id,
    delivery,
    'buyer_review',
    [
      event('delivery', 'Buyer verified the delivery card. The ten-minute handover review started.'),
    ],
  );
}

export function completeHandoverReview(context: DeliveryDealContext): DealDeliveryLifecycle {
  if (context.actorRole !== 'buyer') throw new Error('Only the buyer can complete the handover review.');
  const now = new Date();
  const current = reconcileDeliveryLifecycle(context.id, context.extendedProductTestingDays, now);
  if (current.handover.status !== 'in_progress') throw new Error('The handover review is not active.');

  const delivery = startFundingReview(
    {
      ...current,
      handover: {
        ...current.handover,
        status: 'completed',
        completedAt: now.toISOString(),
        completionReason: 'buyer_confirmed',
      },
    },
    now,
  );
  notify('Handover review completed', 'The buyer confirmed the correct product during handover.', context.id);
  notify('Funding review started', `${fundingReviewLabel(context.extendedProductTestingDays)} is now active.`, context.id);
  return saveLifecycle(
    context.id,
    delivery,
    'buyer_review',
    [
      event('delivery', 'Buyer confirmed the correct product during handover.'),
      event('review', `${fundingReviewLabel(context.extendedProductTestingDays)} started.`),
    ],
  );
}

export function blockDeliveryRelease(dealId: string): DealDeliveryLifecycle {
  const now = new Date();
  const current = getDeliveryLifecycle(dealId);
  const delivery: DealDeliveryLifecycle = {
    ...current,
    handover:
      current.handover.status === 'in_progress'
        ? {
            ...current.handover,
            status: 'issue_reported',
            completedAt: now.toISOString(),
            completionReason: 'issue_reported',
          }
        : current.handover,
    fundingReview: { ...current.fundingReview, status: 'blocked' },
  };
  notify('Dispute blocks release', 'A reported problem has paused countdown-based payment release.', dealId);
  return saveLifecycle(
    dealId,
    delivery,
    'disputed',
    [event('dispute', 'An immediate product problem was reported. Automatic release is blocked.')],
  );
}

export function approveEarlyRelease(context: DeliveryDealContext): DealDeliveryLifecycle {
  if (context.actorRole !== 'buyer') throw new Error('Only the buyer can approve early release.');
  const now = new Date();
  const current = reconcileDeliveryLifecycle(context.id, context.extendedProductTestingDays, now);
  if (current.fundingReview.status !== 'in_progress') {
    throw new Error('Payment can only be released during an active funding-review period.');
  }
  const delivery: DealDeliveryLifecycle = {
    ...current,
    fundingReview: {
      ...current.fundingReview,
      status: 'release_approved',
      releaseApprovedAt: now.toISOString(),
      releaseMethod: 'buyer_approved',
    },
  };
  notify('Buyer approved payment release', 'The buyer completed product checks. Partner payout is processing.', context.id);
  return saveLifecycle(
    context.id,
    delivery,
    'release_approved',
    [
      event('released', 'Buyer approved early release after completing product checks.'),
    ],
  );
}
