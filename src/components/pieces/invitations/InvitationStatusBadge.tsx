/**
 * InvitationStatusBadge
 * Domain badge for invitation states. Pure presentation.
 */

import { Badge } from '../../ui/badge';
import type { InvitationStatus } from '../../../libs/store/types';
import type { StatusBadgeVariant } from '../../../libs/utils/safe-deal-presentation';

const PRESENTATION: Record<InvitationStatus, { label: string; variant: StatusBadgeVariant }> = {
  pending: { label: 'Pending', variant: 'default' },
  accepted: { label: 'Accepted', variant: 'success' },
  declined: { label: 'Declined', variant: 'secondary' },
  expired: { label: 'Expired', variant: 'secondary' },
};

export function InvitationStatusBadge({ status }: { status: InvitationStatus }) {
  const { label, variant } = PRESENTATION[status];
  return <Badge variant={variant}>{label}</Badge>;
}
