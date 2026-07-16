/**
 * TransactionStatusBadge
 * Domain badge for safe-deal statuses (guardrails/architecture.md domain component).
 * Pure presentation — mapping logic lives in libs/utils/safe-deal-presentation.ts.
 */

import { Badge } from '../../ui/badge';
import { getStatusPresentation } from '../../../libs/utils/safe-deal-presentation';
import type { SafeDealStatus } from '../../../libs/store/types';

interface TransactionStatusBadgeProps {
  status: SafeDealStatus;
}

export function TransactionStatusBadge({ status }: TransactionStatusBadgeProps) {
  const { label, variant } = getStatusPresentation(status);
  return <Badge variant={variant}>{label}</Badge>;
}
