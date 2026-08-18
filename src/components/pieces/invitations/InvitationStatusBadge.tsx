/**
 * InvitationStatusBadge
 * Domain badge for invitation states. Pure presentation.
 */

import { Badge } from '../../ui/badge';
import type { InvitationStatus } from '../../../libs/store/types';
import type { StatusBadgeVariant } from '../../../libs/utils/safe-deal-presentation';

const PRESENTATION: Record<InvitationStatus, { label: string; variant: StatusBadgeVariant }> = {
  pending: { label: 'Pending', variant: 'default' },
  changes_requested: { label: 'Changes requested', variant: 'outline' },
  accepted: { label: 'Accepted', variant: 'success' },
  declined: { label: 'Declined', variant: 'secondary' },
  expired: { label: 'Expired', variant: 'secondary' },
  withdrawn: { label: 'Withdrawn', variant: 'secondary' },
  already_claimed: { label: 'Claimed', variant: 'secondary' },
  wrong_recipient: { label: 'Different recipient', variant: 'destructive' },
};

export function InvitationStatusBadge({ status }: { status: InvitationStatus }) {
  const { label, variant } = PRESENTATION[status];
  return <Badge variant={variant} className="px-2 py-0.5 text-[10px] leading-4 sm:px-2.5 sm:text-xs">{label}</Badge>;
}
