import { Award, CheckCircle2, Gift, ShieldCheck, Sparkles, Star } from 'lucide-react';
import { useMemo } from 'react';
import { useTransactions } from '../../hooks/useTransactions';
import { DashboardLayout } from '../pieces/dashboard/DashboardLayout';
import { Card } from '../ui/card';
import { Skeleton } from '../ui/skeleton';

function claimedDealIds(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const value = JSON.parse(localStorage.getItem('naitrust_mock_claimed_deal_rewards') || '[]');
    return Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : [];
  } catch {
    return [];
  }
}

function claimedRewardAmounts(): Record<string, number> {
  if (typeof window === 'undefined') return {};
  try {
    const value = JSON.parse(localStorage.getItem('naitrust_mock_deal_reward_amounts') || '{}');
    return value && typeof value === 'object' ? value as Record<string, number> : {};
  } catch {
    return {};
  }
}

export function RewardsPage() {
  const { data: deals = [], isLoading } = useTransactions();
  const claimedIds = useMemo(claimedDealIds, []);
  const rewardAmounts = useMemo(claimedRewardAmounts, []);
  const rewardAmountFor = (id: string) => {
    const deal = deals.find((item) => item.id === id);
    return deal?.reference === 'NT-2026-072249' ? 300 : (rewardAmounts[id] ?? 100);
  };
  const points = claimedIds.reduce((total, id) => total + rewardAmountFor(id), 0);

  return (
    <DashboardLayout title="Rewards">
      <div className="mx-auto w-full max-w-5xl space-y-5">
        <Card className="relative overflow-hidden border-0 bg-[#071b31] p-6 text-white shadow-xl sm:p-8">
          <div className="pointer-events-none absolute -right-16 -top-20 h-64 w-64 rounded-full bg-primary/30 blur-3xl" />
          <div className="relative flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10"><Gift size={22} /></span>
              <p className="mt-6 text-xs font-bold uppercase tracking-[0.16em] text-sky-300">Naitrust rewards</p>
              <h1 className="mt-2 text-2xl font-bold sm:text-3xl">Your reward points</h1>
              <p className="mt-2 max-w-lg text-sm leading-6 text-white/65">Earn points when you successfully complete eligible Protected Deals.</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.07] px-6 py-4 sm:text-right">
              <p className="text-xs font-semibold uppercase tracking-wider text-white/55">Available balance</p>
              <p className="mt-1 text-4xl font-bold tabular-nums">{points.toLocaleString()}</p>
              <p className="mt-1 text-xs text-white/55">reward points</p>
            </div>
          </div>
        </Card>

        <div className="grid gap-5 lg:grid-cols-[1.25fr_.75fr]">
          <Card className="p-5 shadow-sm sm:p-6">
            <div className="flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600"><Award size={19} /></span><div><h2 className="font-semibold">Reward activity</h2><p className="text-xs text-muted-foreground">Points claimed from completed transactions.</p></div></div>
            <div className="mt-5 divide-y rounded-2xl border">
              {isLoading ? <div className="space-y-3 p-4"><Skeleton className="h-14"/><Skeleton className="h-14"/></div> : claimedIds.length === 0 ? (
                <div className="px-5 py-10 text-center"><Sparkles className="mx-auto text-muted-foreground" size={25}/><p className="mt-3 text-sm font-semibold">No reward activity yet</p><p className="mt-1 text-xs text-muted-foreground">Complete an eligible Protected Deal and claim its reward.</p></div>
              ) : claimedIds.map((id) => {
                const deal = deals.find((item) => item.id === id);
                return <div key={id} className="flex items-center gap-3 p-4"><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600"><CheckCircle2 size={17}/></span><div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold">{deal?.title ?? 'Completed Protected Deal'}</p><p className="mt-0.5 truncate text-xs text-muted-foreground">{deal?.reference ?? id} · Reward claimed</p></div><p className="shrink-0 text-sm font-bold text-emerald-600">+{rewardAmountFor(id)}</p></div>;
              })}
            </div>
          </Card>

          <Card className="p-5 shadow-sm sm:p-6">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary"><Star size={19}/></span>
            <h2 className="mt-4 font-semibold">How rewards work</h2>
            <div className="mt-4 space-y-4 text-sm">
              <div className="flex gap-3"><ShieldCheck className="mt-0.5 shrink-0 text-primary" size={17}/><p><strong className="block">Complete a Protected Deal</strong><span className="text-xs leading-5 text-muted-foreground">Payment must reach the seller successfully without an unresolved dispute.</span></p></div>
              <div className="flex gap-3"><Gift className="mt-0.5 shrink-0 text-primary" size={17}/><p><strong className="block">Claim your points</strong><span className="text-xs leading-5 text-muted-foreground">Buyers receive 300 points and sellers receive 100 points after successful payout.</span></p></div>
              <div className="flex gap-3"><Sparkles className="mt-0.5 shrink-0 text-primary" size={17}/><p><strong className="block">Build your history</strong><span className="text-xs leading-5 text-muted-foreground">Every claimed reward remains visible in your reward activity.</span></p></div>
            </div>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
