/**
 * StatTiles
 * Dashboard KPI row (guardrails/ui.md dashboard priorities: active
 * transactions, pending actions, reputation score). Each tile: an
 * uppercase tracked label + tinted icon chip, a large tabular figure, and an
 * honest secondary line (a real value total or status — never a fabricated
 * trend %). Purely presentational; loading renders skeleton tiles in-grid.
 */

import type { ComponentType } from 'react';
import { ShieldCheck, ListChecks, CheckCircle2, Star } from 'lucide-react';
import { Card } from '../../ui/card';
import { Skeleton } from '../../ui/skeleton';
import {
  formatMinorAmountCompact,
  type DealSummaryCounts,
} from '../../../libs/utils/safe-deal-presentation';
import type { ReputationSummary } from '../../../libs/store/types';

interface StatTilesProps {
  counts: DealSummaryCounts | undefined;
  reputation: ReputationSummary | undefined;
  isLoading: boolean;
  currency?: string;
}

interface Tile {
  label: string;
  value: string;
  hint: string;
  hintClass: string;
  icon: ComponentType<{ size?: number; className?: string }>;
  chipClass: string;
}

function LoadingTiles() {
  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4" aria-label="Loading dashboard stats">
      {[0, 1, 2, 3].map((i) => (
        <Card key={i} className="gap-3 p-5">
          <div className="flex items-center justify-between">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-9 w-9 rounded-lg" />
          </div>
          <Skeleton className="h-8 w-16" />
          <Skeleton className="h-3 w-20" />
        </Card>
      ))}
    </div>
  );
}

export function StatTiles({ counts, reputation, isLoading, currency = 'NGN' }: StatTilesProps) {
  if (isLoading || !counts) return <LoadingTiles />;

  const hasRating = !!reputation && reputation.ratingCount > 0;
  const ratingValue = hasRating ? reputation!.ratingAverage!.toFixed(1) : '—';

  const tiles: Tile[] = [
    {
      label: 'Active safe deals',
      value: String(counts.active),
      hint: `${formatMinorAmountCompact(counts.activeValueMinor, currency)} protected`,
      hintClass: 'text-muted-foreground',
      icon: ShieldCheck,
      chipClass: 'bg-primary/10 text-primary',
    },
    {
      label: 'Needs your action',
      value: String(counts.needsAction),
      hint: counts.needsAction > 0 ? 'Awaiting your response' : "You're all caught up",
      hintClass:
        counts.needsAction > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-muted-foreground',
      icon: ListChecks,
      chipClass:
        counts.needsAction > 0
          ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
          : 'bg-muted text-muted-foreground',
    },
    {
      label: 'Completed deals',
      value: String(counts.completed),
      hint: `${formatMinorAmountCompact(counts.releasedValueMinor, currency)} released`,
      hintClass: 'text-muted-foreground',
      icon: CheckCircle2,
      chipClass: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
    },
    {
      label: 'Reputation score',
      value: ratingValue,
      hint: hasRating ? `${reputation!.ratingCount} verified reviews` : 'No reviews yet',
      hintClass: 'text-muted-foreground',
      icon: Star,
      chipClass: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4" aria-label="Dashboard stats">
      {tiles.map((tile) => {
        const Icon = tile.icon;
        return (
          <Card key={tile.label} className="gap-3 p-5 shadow-sm transition-shadow hover:shadow-md">
            <div className="flex items-start justify-between gap-2">
              <span className="text-[0.7rem] font-semibold uppercase tracking-wider text-muted-foreground">
                {tile.label}
              </span>
              <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${tile.chipClass}`}>
                <Icon size={18} />
              </div>
            </div>
            <p className="text-3xl font-bold leading-none tracking-tight text-foreground tabular-nums">
              {tile.value}
            </p>
            <p className={`text-xs font-medium ${tile.hintClass}`}>{tile.hint}</p>
          </Card>
        );
      })}
    </div>
  );
}
