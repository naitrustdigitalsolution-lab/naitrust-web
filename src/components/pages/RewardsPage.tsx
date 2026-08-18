import { Award, CheckCircle2, Gift, Sparkles, Star } from 'lucide-react';
import { sourcingApi } from '../../features/sourcing/api/sourcing.api';
import { DashboardLayout } from '../pieces/dashboard/DashboardLayout';
import { Card } from '../ui/card';

export function RewardsPage() {
  const rewards = sourcingApi.listRewards();
  const balance = rewards.reduce((total, entry) => total + (entry.kind === 'redeemed' || entry.kind === 'expired' ? -entry.points : entry.points), 0);
  return (
    <DashboardLayout title="Rewards">
      <div className="mx-auto w-full max-w-5xl space-y-5">
        <Card className="relative overflow-hidden border-0 bg-[#071b31] p-5 text-white shadow-lg sm:p-8">
          <div className="pointer-events-none absolute -right-16 -top-20 h-64 w-64 rounded-full bg-primary/30 blur-3xl" />
          <div className="relative flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <span className="hidden h-12 w-12 items-center justify-center rounded-2xl bg-white/10 sm:flex"><Gift size={22} /></span>
              <p className="mt-5 text-xs font-bold uppercase tracking-[0.16em] text-sky-300">Naitrust rewards</p>
              <h1 className="mt-2 text-2xl font-bold sm:text-3xl">Earn while building reliable trade history</h1>
              <p className="mt-2 max-w-xl text-sm leading-6 text-white/65">Eligible supplier checks, completed wholesale orders, useful evidence, and successful deliveries can earn points.</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.07] px-5 py-4 sm:text-right">
              <p className="text-xs font-semibold uppercase tracking-wider text-white/55">Available</p>
              <p className="mt-1 text-4xl font-bold tabular-nums">{balance.toLocaleString()}</p>
              <p className="text-xs text-white/55">points</p>
            </div>
          </div>
        </Card>
        <div className="grid gap-5 lg:grid-cols-[1.25fr_.75fr]">
          <Card className="rounded-2xl p-5 sm:p-6">
            <div className="flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600"><Award size={19} /></span><div><h2 className="font-semibold">Points activity</h2><p className="text-xs text-muted-foreground">Account-scoped reward history.</p></div></div>
            <div className="mt-5 divide-y rounded-2xl border">
              {rewards.length === 0 ? <div className="px-5 py-10 text-center"><Sparkles className="mx-auto text-muted-foreground" size={25} /><p className="mt-3 text-sm font-semibold">No points yet</p><p className="mt-1 text-xs text-muted-foreground">Complete an eligible sourcing or order milestone.</p></div> : rewards.map((entry) => <div key={entry.id} className="flex items-center gap-3 p-4"><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600"><CheckCircle2 size={16} /></span><div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold">{entry.label}</p><p className="mt-0.5 text-xs text-muted-foreground">{new Date(entry.createdAt).toLocaleDateString()} · {entry.kind}</p></div><p className={`shrink-0 text-sm font-bold ${entry.kind === 'redeemed' || entry.kind === 'expired' ? 'text-muted-foreground' : 'text-emerald-600'}`}>{entry.kind === 'redeemed' || entry.kind === 'expired' ? '-' : '+'}{entry.points}</p></div>)}
            </div>
          </Card>
          <Card className="rounded-2xl p-5 sm:p-6">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary"><Star size={19} /></span>
            <h2 className="mt-4 font-semibold">What can earn points</h2>
            <div className="mt-4 space-y-4 text-sm">
              {[
                ['Verified sourcing', 'Complete a supplier or product verification with useful evidence.'],
                ['Reliable orders', 'Complete eligible wholesale orders without an unresolved issue.'],
                ['Successful delivery', 'Finish shipping and buyer review for the connected order.'],
              ].map(([title, detail]) => <div key={title} className="flex gap-3"><Gift className="mt-0.5 shrink-0 text-primary" size={17} /><p><strong className="block">{title}</strong><span className="text-xs leading-5 text-muted-foreground">{detail}</span></p></div>)}
            </div>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
