/**
 * PendingActions
 * "Needs your action" panel — deals whose status requires the current user
 * to act next (fund, review evidence, respond to a dispute). Distinct from
 * the general deal list below it (guardrails/ui.md: "pending actions" and
 * "disputes needing response" are explicit dashboard priorities).
 */

import { ArrowRight, CircleAlert } from 'lucide-react';
import { Card } from '../../ui/card';
import { TransactionStatusBadge } from './TransactionStatusBadge';
import { CounterpartyAvatar } from './CounterpartyAvatar';
import { getActionReason, formatMinorAmount } from '../../../libs/utils/safe-deal-presentation';
import type { SafeDealSummary } from '../../../libs/store/types';

interface PendingActionsProps {
  deals: SafeDealSummary[];
  onSelect: (deal: SafeDealSummary) => void;
}

export function PendingActions({ deals, onSelect }: PendingActionsProps) {
  if (deals.length === 0) return null;

  return (
    <div>
      <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
        <CircleAlert size={16} className="text-primary" />
        Needs your action
      </h3>
      <ul className="mt-2 space-y-2" aria-label="Deals needing your action">
        {deals.map((deal) => (
          <li key={deal.id}>
            <Card
              role="button"
              tabIndex={0}
              onClick={() => onSelect(deal)}
              onKeyDown={(e) => e.key === 'Enter' && onSelect(deal)}
              className="flex cursor-pointer flex-row items-center justify-between gap-4 p-4 shadow-sm transition-colors hover:bg-accent/50"
            >
              <div className="flex min-w-0 items-center gap-3">
                <CounterpartyAvatar name={deal.counterpartyName} />
                <div className="min-w-0">
                  <p className="truncate font-semibold text-foreground">{deal.counterpartyName}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">{getActionReason(deal.status)}</p>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-3">
                <span className="hidden text-sm font-semibold text-foreground tabular-nums sm:inline">
                  {formatMinorAmount(deal.amountMinor, deal.currency)}
                </span>
                <TransactionStatusBadge status={deal.status} />
                <ArrowRight size={16} className="text-muted-foreground" />
              </div>
            </Card>
          </li>
        ))}
      </ul>
    </div>
  );
}
