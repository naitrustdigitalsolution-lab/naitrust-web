import { ArrowLeft, CheckCircle2, ShieldCheck, Ship, Truck, UserCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import { Card } from '../../../components/ui/card';
import { marketSuppliers } from '../../../libs/marketplace/marketplace.api';
import type { MarketOrder } from '../../../libs/marketplace/types';
import { formatCny, formatNaira, formatUsd } from '../lib/money';

interface OrderRoomProps { order: MarketOrder }

export function OrderRoom({ order }: OrderRoomProps) {
  const navigate = useNavigate();
  const supplier = marketSuppliers.find((candidate) => candidate.id === order.supplierId);
  const payment = order.paymentCurrency === 'USD' ? formatUsd(order.paymentAmountMinor) : formatNaira(order.paymentAmountMinor);
  const settlement = order.settlementCurrency === 'CNY'
    ? formatCny(order.settlementAmountMinor)
    : order.settlementCurrency === 'USD'
      ? formatUsd(order.settlementAmountMinor)
      : formatNaira(order.settlementAmountMinor);

  return (
    <div className="mx-auto w-full max-w-6xl">
      <Button variant="ghost" className="mb-4 rounded-full" onClick={() => navigate('/app/orders')}><ArrowLeft size={15} /> Orders</Button>
      <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
        <div>
          <Badge>{order.deliveryMode === 'international' ? 'China import' : 'Nigeria local'}</Badge>
          <h1 className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">{supplier?.name ?? 'Supplier order'}</h1>
          <p className="mt-1 text-xs text-muted-foreground">{order.reference}</p>
        </div>
        <Button variant="outline" className="rounded-full" onClick={() => navigate(`/app/agents?city=${encodeURIComponent(supplier?.city ?? '')}&supplier=${order.supplierId}&order=${order.id}`)}><UserCheck size={16} /> Assign local agent</Button>
      </div>
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <Card className="rounded-3xl p-5 sm:p-7">
          <h2 className="font-bold">Order journey</h2>
          <div className="mt-6">
            {order.timeline.map((step, index) => (
              <div key={`${step.status}-${index}`} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <span className={`flex h-8 w-8 items-center justify-center rounded-full ${step.complete ? 'bg-emerald-600 text-white' : 'border bg-background text-muted-foreground'}`}>
                    {step.complete ? <CheckCircle2 size={15} /> : <span className="text-[10px] font-bold">{index + 1}</span>}
                  </span>
                  {index < order.timeline.length - 1 && <span className="h-12 w-px bg-border" />}
                </div>
                <div className="pb-5">
                  <p className="text-sm font-semibold">{step.label}</p>
                  <p className="mt-1 text-xs leading-5 text-muted-foreground">{step.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
        <aside className="space-y-4">
          <Card className="rounded-2xl p-5">
            <p className="text-xs text-muted-foreground">Customer payment</p>
            <p className="mt-1 text-2xl font-bold">{payment}</p>
            <div className="mt-4 flex items-start gap-2 border-t pt-4 text-xs leading-5 text-muted-foreground">
              <ShieldCheck size={16} className="mt-0.5 shrink-0 text-emerald-600" />
              <p>Supplier funds remain pending until the agreed agent readiness evidence is reviewed and the buyer authorizes the eligible release.</p>
            </div>
            <p className="mt-3 text-xs text-muted-foreground">Planned supplier settlement: <strong className="text-foreground">{settlement}</strong></p>
          </Card>
          <Card className="rounded-2xl p-5">
            <p className="flex items-center gap-2 font-semibold"><Truck size={16} className="text-primary" /> Logistics allocation</p>
            <dl className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between"><dt className="text-muted-foreground">Paid</dt><dd className="font-semibold">{formatNaira(order.logistics.paidMinor)}</dd></div>
              <div className="flex justify-between"><dt className="text-muted-foreground">Committed</dt><dd>{formatNaira(order.logistics.committedMinor)}</dd></div>
              <div className="flex justify-between"><dt className="text-muted-foreground">Unused</dt><dd className="font-semibold text-emerald-700">{formatNaira(order.logistics.refundableMinor)}</dd></div>
            </dl>
          </Card>
          <div className="grid gap-2">
            <Button className="rounded-full" onClick={() => navigate(`/app/agent-assignments?order=${order.id}`)}><UserCheck size={16} /> Agent evidence</Button>
            <Button variant="outline" className="rounded-full" onClick={() => navigate(`/app/shipments?order=${order.id}`)}><Ship size={16} /> Shipping plan</Button>
          </div>
        </aside>
      </div>
    </div>
  );
}
