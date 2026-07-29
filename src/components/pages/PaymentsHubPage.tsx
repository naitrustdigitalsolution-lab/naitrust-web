/**
 * PaymentsHubPage
 * The Payments area landing (`/app/payments`) — the primary place the
 * "two ways to pay" choice is offered: Send Instantly for people/businesses
 * you already trust, or Protect a Payment (a Protected Deal) for new
 * suppliers, contractors, large orders, or anything needing delivery
 * confirmation. Quick links to Receive, Wallet, Beneficiaries and Requests,
 * plus a short recent-transfers list.
 */

import { useNavigate } from 'react-router-dom';
import { ArrowRight, Download, HandCoins, Send, ShieldCheck, Users } from 'lucide-react';
import { DashboardLayout } from '../pieces/dashboard/DashboardLayout';
import { CounterpartyAvatar } from '../pieces/dashboard/CounterpartyAvatar';
import { SandboxBadge } from '../pieces/general/SandboxBadge';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { useInstantTransfers } from '../../hooks/useInstantTransfer';
import { formatMinorAmount } from '../../libs/utils/safe-deal-presentation';

const QUICK_LINKS = [
  { label: 'Receive Money', path: '/app/payments/receive', icon: Download },
  { label: 'Saved Recipients', path: '/app/payments/beneficiaries', icon: Users },
  { label: 'Payment Requests', path: '/app/payments/requests', icon: HandCoins },
];

export function PaymentsHubPage() {
  const navigate = useNavigate();
  const { data: transfers } = useInstantTransfers();
  const recent = (transfers ?? []).slice(0, 5);

  return (
    <DashboardLayout title="Payments">
      <div className="mx-auto w-full max-w-5xl">
        <div className="mb-8">
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.16em] text-primary">Your business payments</p>
          <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">Move money the way the moment requires.</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
            Receive sales, pay regular suppliers instantly, or protect an important order when the relationship or delivery is still new.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Card
            role="button"
            tabIndex={0}
            onClick={() => navigate('/app/payments/send')}
            onKeyDown={(e) => e.key === 'Enter' && navigate('/app/payments/send')}
            className="group cursor-pointer gap-3 rounded-3xl p-7 shadow-sm transition-all hover:-translate-y-1 hover:border-primary/40 hover:shadow-xl"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Send size={20} />
            </div>
            <p className="text-xl font-semibold text-foreground">Pay a trusted supplier</p>
            <p className="text-sm leading-6 text-muted-foreground">
              Send instantly when you already know the person or business and do not need delivery conditions.
            </p>
            <span className="mt-1 inline-flex items-center gap-1 text-sm font-medium text-primary">
              Send money <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
            </span>
          </Card>

          <Card
            role="button"
            tabIndex={0}
            onClick={() => navigate('/app/deals/new')}
            onKeyDown={(e) => e.key === 'Enter' && navigate('/app/deals/new')}
            className="group cursor-pointer gap-3 rounded-3xl border-emerald-500/20 p-7 shadow-sm transition-all hover:-translate-y-1 hover:border-emerald-500/50 hover:shadow-xl"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <ShieldCheck size={20} />
            </div>
            <p className="text-xl font-semibold text-foreground">Protect an important order</p>
            <p className="text-sm leading-6 text-muted-foreground">
              Record the order, supplier, terms, evidence, and payment when delivery needs to be confirmed.
            </p>
            <span className="mt-1 inline-flex items-center gap-1 text-sm font-medium text-primary">
              Start a Protected Deal <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
            </span>
          </Card>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {QUICK_LINKS.map((link) => (
            <Button
              key={link.path}
              variant="outline"
              className="h-auto flex-col gap-2 rounded-xl py-4"
              onClick={() => navigate(link.path)}
            >
              <link.icon size={18} />
              <span className="text-xs font-medium">{link.label}</span>
            </Button>
          ))}
        </div>

        <div className="mt-8">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm font-semibold text-foreground">Recent transfers</p>
            <Button variant="ghost" size="sm" className="text-xs" onClick={() => navigate('/app/transactions')}>
              View all
            </Button>
          </div>
          {recent.length === 0 ? (
            <Card className="p-6 text-center text-sm text-muted-foreground shadow-sm">
              No instant transfers yet. Pay a trusted supplier or business contact when you are ready.
            </Card>
          ) : (
            <Card className="gap-0 overflow-hidden p-0 shadow-sm">
              {recent.map((t) => (
                <div key={t.id} className="flex items-center gap-3 border-b px-4 py-3 last:border-b-0">
                  <CounterpartyAvatar name={t.recipient.resolvedName ?? t.recipient.identifier} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground">
                      {t.recipient.resolvedName ?? t.recipient.identifier}
                    </p>
                    <p className="text-xs text-muted-foreground">{t.reference}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-foreground">{formatMinorAmount(t.amountMinor, t.currency)}</p>
                    {t.isMock && <SandboxBadge className="mt-1" />}
                  </div>
                </div>
              ))}
            </Card>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
