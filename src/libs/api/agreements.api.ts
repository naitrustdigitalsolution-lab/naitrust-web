/**
 * Agreements API
 * AI-assisted drafting of the deal agreement both parties accept.
 *
 * The real backend drafts via its OpenAI integration (backend-only, advisory
 * — the AI never triggers protected actions; parties always review and
 * accept). In mock mode we synthesize a deterministic draft from the deal
 * terms with generation-like latency so the UX matches production.
 */

import { httpClient } from './client';
import { endpoints } from './endpoints';
import { appConfig } from '../../configs/env';
import type { AgreementDraft, ExtendedProductTestingDays } from '../store/types';
import type { ApiSuccess } from './types';
import { formatMinorAmount } from '../utils/safe-deal-presentation';

export interface DraftAgreementInput {
  useCaseTitle: string;
  partyModeLabel: string;
  buyerName: string;
  sellerName: string;
  title: string;
  description: string;
  amountMinor: number;
  currency: string;
  deliveryDueDate: string;
  releaseConditions: string;
  extendedProductTestingDays?: ExtendedProductTestingDays;
}

const MOCK_GENERATION_MS = 1400;

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function buildMockDraft(input: DraftAgreementInput, version: number): AgreementDraft {
  const amount = formatMinorAmount(input.amountMinor, input.currency);
  const reviewWindow = input.extendedProductTestingDays
    ? `${input.extendedProductTestingDays}-day extended product testing period`
    : 'standard 24-hour funding-review period';
  return {
    version,
    generatedByAi: false,
    sections: [
      {
        heading: 'Parties and purpose',
        body: `This safe deal agreement is between ${input.buyerName} (the Buyer) and ${input.sellerName} (the Seller) for "${input.title}" — a ${input.partyModeLabel.toLowerCase()} transaction under the ${input.useCaseTitle} category.${input.description ? ` Scope: ${input.description}` : ''}`,
      },
      {
        heading: 'Protected payment',
        body: `The Buyer will fund ${amount} into a partner-issued virtual account operated by a regulated payment partner. Naitrust never holds the funds directly. Funds remain protected until the release conditions in this agreement are met.`,
      },
      {
        heading: 'Delivery obligations',
        body: `The Seller must deliver as agreed on or before ${input.deliveryDueDate}. Before handover, the Seller should record the product model, serial or IMEI where applicable, packaging condition, and tamper seal in the transaction room.`,
      },
      {
        heading: 'Release conditions',
        body: `Funds are released to the Seller only when the following conditions are met: ${input.releaseConditions} Receipt starts a ten-minute handover review, followed by the ${reviewWindow}. The Buyer may approve release earlier with a transaction PIN. A dispute opened before the deadline blocks release.`,
      },
      {
        heading: 'Product checks and consumer rights',
        body: `The ${reviewWindow} controls only Naitrust's partner-funding release deadline. Receipt confirmation and timer expiry do not waive defect, statutory, manufacturer, or seller warranty rights.`,
      },
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
