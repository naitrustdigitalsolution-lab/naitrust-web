/**
 * Agreements API
 * AI assistance for drafting the deal agreement both parties accept.
 *
 * The real backend drafts via its OpenAI integration (backend-only, advisory
 *: the AI never triggers protected actions; parties always review and
 * accept). In mock mode we synthesize a deterministic draft from the deal
 * terms with generation-like latency so the UX matches production.
 */

import { httpClient } from './client';
import { endpoints } from './endpoints';
import { appConfig } from '../../configs/env';
import type { AgreementDraft, DealWorkflowMode, ExtendedProductTestingDays } from '../store/types';
import type { ApiSuccess } from './types';
import { formatMinorAmount } from '../utils/safe-deal-presentation';

export interface DraftAgreementInput {
  workflowMode: DealWorkflowMode;
  useCaseTitle: string;
  partyModeLabel: string;
  buyerName: string;
  sellerName: string;
  title: string;
  description: string;
  amountMinor: number;
  initialPaymentMinor?: number;
  nextPaymentReleaseConditions?: string;
  currency: string;
  deliveryDueDate: string;
  releaseConditions: string;
  extendedProductTestingDays?: ExtendedProductTestingDays;
}

export interface DraftPaymentConditionsInput {
  workflowMode: DealWorkflowMode;
  paymentStage?: 'first' | 'final';
  useCaseTitle: string;
  title: string;
  description: string;
  deliveryDueDate: string;
  buyerName: string;
  sellerName: string;
  requestIndex?: number;
}

export interface SuggestDealDetailsInput {
  useCase: string;
  useCaseTitle: string;
  currentTitle?: string;
  currentDescription?: string;
  requestIndex?: number;
}

const AI_DEAL_DETAIL_PLACEHOLDERS = new Set([
  'add details', 'add them', 'air, sea or road', 'anything not included',
  'cartons, bags or units', 'completion standard', 'describe how the order will be checked',
  'describe it', 'describe the exact product or service', 'describe the work',
  'description and quantity', 'fragile, sealed or temperature-sensitive', 'list each item',
  'list the tasks', 'list them', 'location', 'locations', 'make, model and year',
  'name, brand and model', 'new/used and warranty', 'new/used',
  'quantity, quality, expiry date or seal', 'registration, vin or chassis number where available',
  'used/new and known faults', 'waybill, recipient name or photos', 'what must be completed',
]);

export function containsAiDealDetailPlaceholder(value: string) {
  return Array.from(value.matchAll(/\[([^\]]+)\]/g))
    .some((match) => AI_DEAL_DETAIL_PLACEHOLDERS.has(match[1].trim().toLowerCase()));
}

const MOCK_GENERATION_MS = 1400;

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function buildMockDraft(input: DraftAgreementInput, version: number): AgreementDraft {
  const amount = formatMinorAmount(input.amountMinor, input.currency);
  const firstPayment = input.initialPaymentMinor && input.initialPaymentMinor < input.amountMinor
    ? formatMinorAmount(input.initialPaymentMinor, input.currency)
    : null;
  const remainingPayment = firstPayment
    ? formatMinorAmount(input.amountMinor - input.initialPaymentMinor!, input.currency)
    : null;
  const reviewWindow = 'standard 1-hour payment-review period';
  const isDelivery = input.workflowMode === 'delivery';
  const isService = input.workflowMode === 'service';
  return {
    version,
    generatedByAi: true,
    sections: [
      {
        heading: 'Parties and purpose',
        body: `This Protected Deal agreement is between ${input.buyerName} (the Buyer) and ${input.sellerName} (the Seller) for "${input.title}": a ${input.partyModeLabel.toLowerCase()} transaction under the ${input.useCaseTitle} category.${input.description ? ` Scope: ${input.description}` : ''}`,
      },
      {
        heading: 'Protected payment',
        body: firstPayment
          ? `The total deal value is ${amount}. The Buyer will first fund ${firstPayment} into a virtual account issued by a regulated payment partner. Naitrust will track the remaining ${remainingPayment}. The remaining payment becomes due only after this condition is confirmed: ${input.nextPaymentReleaseConditions}`
          : `The Buyer will fund ${amount} into a virtual account issued by a regulated payment partner. Naitrust never holds the funds directly. Funds remain protected until the release conditions in this agreement are met.`,
      },
      {
        heading: isDelivery ? 'Delivery obligations' : isService ? 'Service completion' : 'Milestone obligations',
        body: isDelivery
          ? `The Seller must deliver as agreed on or before ${input.deliveryDueDate}. Before handover, the Seller should add the relevant product and dispatch evidence to the Deal Room.`
          : isService
            ? `The Provider must complete the agreed work on or before ${input.deliveryDueDate}, add relevant completion evidence, and request payment from the Deal Room when the work is ready for review.`
            : `The Provider must complete the agreed stages by ${input.deliveryDueDate}, record progress, and attach evidence relevant to each completed milestone.`,
      },
      {
        heading: 'Release conditions',
        body: isService
          ? `Funds release only after the Provider submits completion evidence and requests payment, and the Buyer reviews the work and approves release with their transaction PIN. The Buyer may request changes or open a dispute. There is no automatic release timer for this service deal.`
          : input.workflowMode === 'milestone'
            ? `Funds release only for the currently eligible stage after its progress and evidence meet these conditions: ${input.releaseConditions} The Buyer must approve release with their transaction PIN or raise an issue.`
            : firstPayment
          ? `Payments are released separately. The first payment releases only after this condition is met: ${input.releaseConditions} Receipt starts a ten-minute handover review followed by the ${reviewWindow}. The second payment remains locked until the first payment has been released successfully, then requires this condition: ${input.nextPaymentReleaseConditions} Each release has its own review period. The Seller may request a release, but only the Buyer can approve an early release with a transaction PIN. A dispute opened before either deadline blocks that release.`
          : `Funds are released to the Seller only when the following conditions are met: ${input.releaseConditions} Receipt starts a ten-minute handover review, followed by the ${reviewWindow}. The Seller may request release. The Buyer may approve release earlier with a transaction PIN. A dispute opened before the deadline blocks release.`,
      },
      ...(isDelivery ? [{
        heading: 'Product checks and consumer rights',
        body: `The ${reviewWindow} controls only Naitrust's partner-funding release deadline. Receipt confirmation and timer expiry do not waive defect, statutory, manufacturer, or seller warranty rights.`,
      }] : []),
      {
        heading: 'Disputes',
        body: 'Either party may open a dispute in the transaction room before release. While a dispute is open, no release occurs. Disputes are reviewed against the evidence attached to this deal, and the outcome may be a release, a refund, or a documented split.',
      },
      {
        heading: 'Acceptance',
        body: 'By accepting this agreement, both parties confirm the terms above reflect their understanding. Once both parties accept, the agreement is frozen and changes require a new agreed version.',
      },
    ],
  };
}

export const agreementsApi = {
  suggestDealDetails: async (input: SuggestDealDetailsInput): Promise<ApiSuccess<{ titles: string[]; detailDraft: string }>> => {
    if (appConfig.isMock) {
      await delay(650);
      const suggestions: Record<string, { titles: string[]; detailDraft: string }> = {
        'vehicle-transactions': { titles: ['Vehicle purchase and handover', 'Car inspection and purchase', 'Vehicle delivery from seller'], detailDraft: 'Vehicle: [make, model and year]. Identification: [registration, VIN or chassis number where available]. Agreed condition: [used/new and known faults]. Included documents or accessories: [list them]. Delivery or handover location: [location].' },
        'supplier-purchase': { titles: ['Supplier stock order', 'Goods purchase from supplier', 'Retail stock delivery'], detailDraft: 'Items and quantities: [list each item]. Brand, grade or specification: [add details]. Packaging requirement: [cartons, bags or units]. Delivery location: [location]. Important condition checks: [quantity, quality, expiry date or seal].' },
        'wholesale-order': { titles: ['Wholesale stock order', 'Bulk goods purchase', 'Distributor supply order'], detailDraft: 'Goods and quantities: [list them]. Unit or carton specification: [add details]. Approved sample or quality standard: [describe it]. Delivery location: [location]. Shortage or damage checks: [describe how the order will be checked].' },
        'service-delivery': { titles: ['Professional service delivery', 'Service work and completion', 'Agreed service engagement'], detailDraft: 'Service required: [describe the work]. Expected result: [what must be completed]. Included tasks: [list them]. Exclusions: [anything not included]. Completion location or delivery method: [add details].' },
        'contractor-engagement': { titles: ['Contractor work agreement', 'Repair and installation work', 'Project work by contractor'], detailDraft: 'Scope of work: [list the tasks]. Materials supplied by each party: [add details]. Expected result: [completion standard]. Work location: [location]. Important measurements, drawings or specifications: [add them].' },
        'equipment-purchase': { titles: ['Equipment purchase and delivery', 'Machinery order and inspection', 'Business equipment supply'], detailDraft: 'Equipment: [name, brand and model]. Quantity and specification: [add details]. Condition: [new/used and warranty]. Included parts or accessories: [list them]. Delivery location and installation requirement: [add details].' },
        'logistics-agreement': { titles: ['Goods delivery and haulage', 'Logistics service agreement', 'Pickup and delivery service'], detailDraft: 'Goods being moved: [description and quantity]. Pickup location: [location]. Destination: [location]. Handling requirements: [fragile, sealed or temperature-sensitive]. Required delivery proof: [waybill, recipient name or photos].' },
        'import-export': { titles: ['Imported goods order', 'International shipment purchase', 'Import and delivery transaction'], detailDraft: 'Goods and quantities: [list them]. Origin and destination: [locations]. Shipping method: [air, sea or road]. Required commercial or customs documents: [list them]. Delivery condition and inspection requirements: [add details].' },
        'high-value-personal-purchases': { titles: ['Product purchase and delivery', 'Item order from seller', 'Product order agreement'], detailDraft: 'Product: [name, brand and model]. Quantity, size or colour: [add details]. Condition: [new/used]. Included accessories or warranty: [list them]. Delivery location and condition checks: [add details].' },
      };
      const selected = suggestions[input.useCase] ?? { titles: [`${input.useCaseTitle} agreement`, `${input.useCaseTitle} and delivery`, 'Protected purchase or service'], detailDraft: 'What is being provided: [describe it]. Quantity, scope or specification: [add details]. Expected condition or result: [describe it]. Delivery or completion location: [location]. Anything specifically included or excluded: [add details].' };
      const alternateTitles = [
        `Protected ${input.useCaseTitle.toLowerCase()}`,
        `${input.useCaseTitle} with delivery checks`,
        `${input.useCaseTitle} agreement and payment`,
      ];
      const subject = input.currentDescription?.trim() || input.currentTitle?.trim() || input.useCaseTitle;
      const cleanSubject = subject.replace(/[.\s]+$/, '');
      const assumptionDraft = `${cleanSubject.charAt(0).toUpperCase()}${cleanSubject.slice(1)}.`;
      const alternateDetail = `This deal covers ${cleanSubject.charAt(0).toLowerCase()}${cleanSubject.slice(1)}.`;
      return { success: true, data: { titles: (input.requestIndex ?? 0) % 2 === 0 ? selected.titles : alternateTitles, detailDraft: (input.requestIndex ?? 0) % 2 === 0 ? assumptionDraft : alternateDetail } };
    }
    const response = await httpClient.post<{ titles: string[]; detailDraft: string }>('/agreements/deal-details/suggest', input);
    return response as ApiSuccess<{ titles: string[]; detailDraft: string }>;
  },
  /** Advisory AI draft only. The creator can edit it and both parties review it. */
  draftPaymentConditions: async (input: DraftPaymentConditionsInput): Promise<ApiSuccess<{ text: string; generatedByAi: true }>> => {
    if (appConfig.isMock) {
      await delay(900);
      const subject = input.description.trim() || input.title.trim() || input.useCaseTitle;
      if (input.paymentStage === 'final') {
        const finalText = input.workflowMode === 'delivery'
          ? `The remaining payment releases after the full order is delivered, the buyer completes the final handover checks, and no dispute is open.`
          : input.workflowMode === 'service'
            ? `The remaining payment releases only after the provider submits final completion evidence and the buyer reviews the completed work and approves release with their transaction PIN.`
            : `The remaining payment releases only after the final milestone and its supporting evidence are completed and approved by the buyer.`;
        return { success: true, data: { generatedByAi: true, text: finalText } };
      }
      const standardDraft = input.workflowMode === 'service'
        ? `${input.sellerName} must complete ${subject} by ${input.deliveryDueDate} and submit evidence for review. Payment releases only when ${input.buyerName} approves the completed work with their transaction PIN.`
        : input.workflowMode === 'milestone'
          ? `${input.sellerName} must complete the eligible stage for ${subject} and attach progress evidence. Its payment releases only after ${input.buyerName} reviews and approves that stage.`
          : `${input.sellerName} must deliver ${subject} by ${input.deliveryDueDate} as agreed. Payment releases after ${input.buyerName} confirms receipt and condition, provided no dispute is open.`;
      const alternateDraft = input.workflowMode === 'service'
        ? `Release payment after ${subject} is completed, supporting evidence is submitted, and ${input.buyerName} approves the work with their transaction PIN.`
        : input.workflowMode === 'milestone'
          ? `Release the eligible stage payment after its agreed work and evidence have been reviewed and approved by ${input.buyerName}.`
          : `Release payment after ${subject} is delivered and ${input.buyerName} completes the agreed receipt check without reporting an issue.`;
      return {
        success: true,
        data: {
          generatedByAi: true,
          text: (input.requestIndex ?? 0) % 2 === 0 ? standardDraft : alternateDraft,
        },
      };
    }
    const response = await httpClient.post<{ text: string; generatedByAi: true }>('/agreements/payment-conditions/draft', input);
    return response as ApiSuccess<{ text: string; generatedByAi: true }>;
  },
  /**
   * Draft the agreement document from the deal terms.
   * Real endpoint: POST /agreements/draft (backend AI, advisory only).
   */
  draft: async (input: DraftAgreementInput, version = 1): Promise<ApiSuccess<AgreementDraft>> => {
    if (appConfig.isMock) {
      await delay(MOCK_GENERATION_MS);
      return { success: true, data: buildMockDraft(input, version) };
    }
    const response = await httpClient.post<AgreementDraft>(endpoints.agreements.draft, {
      ...input,
      version,
    });
    return response as ApiSuccess<AgreementDraft>;
  },
};
