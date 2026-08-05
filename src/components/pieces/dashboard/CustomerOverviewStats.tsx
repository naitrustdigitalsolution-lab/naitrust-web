import { CheckCircle2, ContactRound, ListChecks, ShieldCheck } from 'lucide-react';
import type { ComponentType } from 'react';
import type { SafeDealSummary } from '../../../libs/store/types';
import { summarizeDeals } from '../../../libs/utils/safe-deal-presentation';
import { Card } from '../../ui/card';
import { Skeleton } from '../../ui/skeleton';

interface CustomerOverviewStatsProps {
  deals: SafeDealSummary[] | undefined;
  dealsLoading: boolean;
  beneficiaryCount: number;
  beneficiariesLoading: boolean;
  pendingInvitationCount: number;
  onNavigate: (path: string) => void;
}

interface OverviewStat {
  label: string;
  value: number;
  hint: string;
  path: string;
  icon: ComponentType<{ size?: number }>;
  iconClass: string;
}

export function CustomerOverviewStats({
  deals,
  dealsLoading,
  beneficiaryCount,
  beneficiariesLoading,
  pendingInvitationCount,
  onNavigate,
}: CustomerOverviewStatsProps) {
  const summary = summarizeDeals(deals ?? []);
  const attentionCount = summary.needsAction + pendingInvitationCount;
  const stats: OverviewStat[] = [
    {
      label: 'Active deals',
      value: summary.active,
      hint: 'Protected transactions',
      path: '/app/deals',
      icon: ShieldCheck,
      iconClass: 'bg-primary/10 text-primary',
    },
    {
      label: 'Needs attention',
      value: attentionCount,
      hint: attentionCount > 0 ? 'Waiting for your action' : 'Nothing waiting',
      path: pendingInvitationCount > 0 ? '/app/invitations' : '/app/deals',
      icon: ListChecks,
      iconClass: attentionCount > 0
        ? 'bg-amber-500/10 text-amber-700 dark:text-amber-400'
        : 'bg-muted text-muted-foreground',
    },
    {
      label: 'Saved recipients',
      value: beneficiaryCount,
      hint: 'Ready for faster transfers',
      path: '/app/payments/beneficiaries',
      icon: ContactRound,
      iconClass: 'bg-violet-500/10 text-violet-700 dark:text-violet-300',
    },
    {
      label: 'Completed deals',
      value: summary.completed,
      hint: 'Transaction history',
      path: '/app/deals',
      icon: CheckCircle2,
      iconClass: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400',
    },
  ];

  return (
    <section aria-labelledby="personal-overview-title">
      <div className="mb-3 flex items-center justify-between">
        <h2 id="personal-overview-title" className="text-lg font-semibold">Overview</h2>
        <p className="text-xs text-muted-foreground">Your account today</p>
      </div>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          const loading = dealsLoading || (stat.label === 'Saved recipients' && beneficiariesLoading);

          return (
            <Card
              key={stat.label}
              role="button"
              tabIndex={0}
              className="group cursor-pointer gap-2 rounded-2xl p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-primary/20 hover:shadow-md"
              onClick={() => onNavigate(stat.path)}
              onKeyDown={(event) => event.key === 'Enter' && onNavigate(stat.path)}
            >
              <div className="flex items-start justify-between gap-2">
                <p className="text-xs font-medium text-muted-foreground">{stat.label}</p>
                <span className={`flex h-8 w-8 items-center justify-center rounded-lg ${stat.iconClass}`}>
                  <Icon size={15} />
                </span>
              </div>
              {loading ? <Skeleton className="h-7 w-12" /> : <p className="text-2xl font-bold tabular-nums">{stat.value}</p>}
              <p className="truncate text-[11px] text-muted-foreground">{stat.hint}</p>
            </Card>
          );
        })}
      </div>
    </section>
  );
}

