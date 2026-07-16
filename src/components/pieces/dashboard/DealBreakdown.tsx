/**
 * DealBreakdown
 * Dashboard side-analytics: a donut of deals by status plus a few key metrics
 * (completion rate, dispute rate, average deal size). Sits beside the monthly
 * chart. A HelpHint explains what the numbers mean.
 */

import { Cell, Pie, PieChart, ResponsiveContainer } from 'recharts';
import { Card } from '../../ui/card';
import { Skeleton } from '../../ui/skeleton';
import { HelpHint } from '../general/HelpHint';
import {
  computeDealMetrics,
  formatMinorAmountCompact,
  groupDealsByStatus,
} from '../../../libs/utils/safe-deal-presentation';
import type { SafeDealSummary } from '../../../libs/store/types';

interface DealBreakdownProps {
  deals: SafeDealSummary[] | undefined;
  isLoading: boolean;
  currency?: string;
}

// Status colours: brand blue (active), emerald (completed), red (disputed),
// slate (closed). Reserved status hues, always shown with a labelled legend.
const STATUS_COLOR: Record<string, string> = {
  active: '#1e90ff',
  completed: '#10b981',
  disputed: '#ef4444',
  closed: '#94a3b8',
};

function Frame({ children }: { children: React.ReactNode }) {
  return (
    <Card className="gap-4 p-5 shadow-sm">
      <div className="flex items-center gap-2">
        <h2 className="text-base font-semibold text-foreground">Deal breakdown</h2>
        <HelpHint title="Deal breakdown">
          <p>The donut splits your deals by where they stand right now:</p>
          <ul className="list-disc space-y-1 pl-4">
            <li><strong>Active</strong> — in progress or awaiting a step.</li>
            <li><strong>Completed</strong> — delivered and paid out.</li>
            <li><strong>Disputed</strong> — paused while an issue is reviewed.</li>
            <li><strong>Closed</strong> — refunded or cancelled.</li>
          </ul>
          <p>
            Completion and dispute rates are shares of all your deals. Average deal size is the
            typical protected amount.
          </p>
        </HelpHint>
      </div>
      {children}
    </Card>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-muted/50 px-3 py-2.5">
      <p className="text-lg font-bold text-foreground tabular-nums">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}

export function DealBreakdown({ deals, isLoading, currency = 'NGN' }: DealBreakdownProps) {
  if (isLoading || !deals) {
    return (
      <Frame>
        <Skeleton className="mx-auto h-40 w-40 rounded-full" />
        <div className="grid grid-cols-3 gap-2">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-16 rounded-lg" />
          ))}
        </div>
      </Frame>
    );
  }

  const groups = groupDealsByStatus(deals).filter((g) => g.count > 0);
  const metrics = computeDealMetrics(deals);
  const total = deals.length;

  return (
    <Frame>
      {total === 0 ? (
        <div className="flex h-40 flex-col items-center justify-center gap-1 text-center">
          <p className="text-sm font-medium text-foreground">No deals yet</p>
          <p className="text-sm text-muted-foreground">Create a safe deal to see your breakdown.</p>
        </div>
      ) : (
        <>
          <div className="relative h-44">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={groups}
                  dataKey="count"
                  nameKey="label"
                  cx="50%"
                  cy="50%"
                  innerRadius={52}
                  outerRadius={76}
                  paddingAngle={2}
                  stroke="var(--card)"
                  strokeWidth={2}
                >
                  {groups.map((g) => (
                    <Cell key={g.key} fill={STATUS_COLOR[g.key]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-bold text-foreground tabular-nums">{total}</span>
              <span className="text-xs text-muted-foreground">total deals</span>
            </div>
          </div>

          <ul className="grid grid-cols-2 gap-x-4 gap-y-1.5">
            {groups.map((g) => (
              <li key={g.key} className="flex items-center gap-2 text-sm">
                <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: STATUS_COLOR[g.key] }} />
                <span className="text-muted-foreground">{g.label}</span>
                <span className="ml-auto font-semibold text-foreground tabular-nums">{g.count}</span>
              </li>
            ))}
          </ul>

          <div className="grid grid-cols-3 gap-2 border-t pt-4">
            <Metric label="Completion" value={`${Math.round(metrics.completionRate * 100)}%`} />
            <Metric label="Disputes" value={`${Math.round(metrics.disputeRate * 100)}%`} />
            <Metric label="Avg size" value={formatMinorAmountCompact(metrics.avgValueMinor, currency)} />
          </div>
        </>
      )}
    </Frame>
  );
}
