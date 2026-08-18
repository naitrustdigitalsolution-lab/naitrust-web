/**
 * TransactionStatusBadge
 * Domain badge for safe-deal statuses (guardrails/architecture.md domain component).
 * Pure presentation: mapping logic lives in libs/utils/safe-deal-presentation.ts.
 */

import { Badge } from '../../ui/badge';
import { getStatusPresentation } from '../../../libs/utils/safe-deal-presentation';
import type { SafeDealStatus } from '../../../libs/store/types';

interface TransactionStatusBadgeProps {
  status: SafeDealStatus;
}

export function TransactionStatusBadge({ status }: TransactionStatusBadgeProps) {
  const { label, variant } = getStatusPresentation(status);
  return <Badge variant={variant} className="px-2 py-0.5 text-[10px] leading-4 sm:px-2.5 sm:text-xs">{label}</Badge>;
}
