import { useState } from 'react';
import { ClipboardCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { PinPromptModal } from '../../../components/pieces/security/PinPromptModal';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import { Card } from '../../../components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../../../components/ui/dialog';
import { useAuth } from '../../../libs/auth-context';
import { getAppImage } from '../../../libs/images/image-manifest';
import { marketSuppliers, marketplaceApi } from '../../../libs/marketplace/marketplace.api';
import type { CustomerPaymentCurrency, LandedCostQuote } from '../../../libs/marketplace/types';
import { formatCny, formatNaira, formatUsd } from '../lib/money';
import { WorkspaceEmpty } from './WorkspaceEmpty';
import { WorkspaceHeader } from './WorkspaceHeader';

export function QuotesWorkspace() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [, refresh] = useState(0);
  const [selected, setSelected] = useState<LandedCostQuote | null>(null);
  const [currency, setCurrency] = useState<CustomerPaymentCurrency>('NGN');
  const [pinOpen, setPinOpen] = useState(false);
  const quotes = marketplaceApi.listQuotes();
  const canPayUsd = user?.role === 'business' || user?.role === 'business-member';

  const confirmPayment = () => {
    if (!selected) return;
    const order = marketplaceApi.acceptQuote(selected.id, currency);
    toast.success(`Order created with ${currency} payment.`);
    setSelected(null);
    refresh((value) => value + 1);
    navigate(`/app/orders/${order.id}`);
  };

  return (
    <div className="mx-auto w-full max-w-6xl">
      <WorkspaceHeader
        eyebrow="Supplier quotes"
        title="Confirmed costs, separated by supplier"
        description="Compare each product, service, and delivery cost before deciding which supplier order to accept."
        icon={ClipboardCheck}
        image={getAppImage('quotes', 'A complete landed-cost quote prepared for a wholesale order')}
      />
      {quotes.length === 0 ? (
        <WorkspaceEmpty icon={ClipboardCheck} title="No quotes yet" description="Build a wholesale cart and send your supplier requests." actionLabel="Browse products" onAction={() => navigate('/app/market')} />
      ) : (
        <div className="space-y-4">
          {quotes.map((quote) => {
            const supplier = marketSuppliers.find((candidate) => candidate.id === quote.supplierId);
            return (
              <Card key={quote.id} className="rounded-3xl p-5 sm:p-6">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <div className="flex flex-wrap gap-2">
                      <Badge>{quote.deliveryMode === 'international' ? 'China import' : 'Nigeria local'}</Badge>
                      <Badge variant="outline" className="capitalize">{quote.status}</Badge>
                      {quote.batchId && <Badge variant="secondary">Separate supplier quote</Badge>}
                    </div>
                    <h2 className="mt-3 text-lg font-bold">{supplier?.name ?? 'Supplier'}</h2>
                    <p className="mt-1 text-xs text-muted-foreground">Valid until {new Date(quote.expiresAt).toLocaleString()}</p>
                  </div>
                  <div className="sm:text-right">
                    <p className="text-xs text-muted-foreground">Confirmed landed cost</p>
                    <p className="mt-1 text-2xl font-bold">{formatNaira(quote.totalNgnMinor)}</p>
                  </div>
                </div>
                <div className="mt-5 grid gap-x-8 gap-y-2 border-y py-4 sm:grid-cols-2">
                  {quote.lines.map((line) => (
                    <div key={`${line.kind}-${line.label}`} className="flex justify-between gap-3 text-sm">
                      <span className="text-muted-foreground">{line.label}</span>
                      <span className="font-medium">{formatNaira(line.amountMinor)}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-medium">Estimated delivery: {quote.estimatedDelivery}</p>
                    <p className="mt-1 text-[11px] text-muted-foreground">{quote.sourceCurrency === 'CNY' ? `${formatCny(quote.sourceSubtotalMinor)} supplier subtotal · ` : ''}{quote.exchangeRateNote}</p>
                  </div>
                  {quote.status === 'ready' && (
                    <div className="flex gap-2">
                      <Button variant="ghost" className="rounded-full" onClick={() => { marketplaceApi.declineQuote(quote.id); refresh((value) => value + 1); }}>Decline</Button>
                      <Button className="rounded-full" onClick={() => { setCurrency('NGN'); setSelected(quote); }}>Accept quote</Button>
                    </div>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <Dialog open={Boolean(selected)} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Choose payment currency</DialogTitle>
            <DialogDescription>Naira is available for every order. Eligible business accounts can also use USD.</DialogDescription>
          </DialogHeader>
          {selected && (
            <div className={`grid gap-3 ${canPayUsd ? 'grid-cols-2' : ''}`}>
              <button type="button" onClick={() => setCurrency('NGN')} className={`rounded-2xl border p-4 text-left ${currency === 'NGN' ? 'border-primary bg-primary/[.05] ring-1 ring-primary/15' : ''}`}>
                <span className="text-xs text-muted-foreground">Pay in Naira</span>
                <strong className="mt-1 block text-lg">{formatNaira(selected.totalNgnMinor)}</strong>
                <Badge className="mt-3">Default</Badge>
              </button>
              {canPayUsd && (
                <button type="button" onClick={() => setCurrency('USD')} className={`rounded-2xl border p-4 text-left ${currency === 'USD' ? 'border-primary bg-primary/[.05] ring-1 ring-primary/15' : ''}`}>
                  <span className="text-xs text-muted-foreground">Pay in US Dollars</span>
                  <strong className="mt-1 block text-lg">{formatUsd(selected.totalUsdMinor)}</strong>
                  <p className="mt-3 text-[10px] text-muted-foreground">Business account</p>
                </button>
              )}
            </div>
          )}
          <p className="rounded-xl bg-muted/50 p-3 text-xs leading-5 text-muted-foreground">The payment provider processes your selected currency. Supplier settlement is recorded separately from logistics and service charges.</p>
          <DialogFooter><Button className="w-full rounded-full" onClick={() => setPinOpen(true)}>Confirm {currency} payment</Button></DialogFooter>
        </DialogContent>
      </Dialog>
      <PinPromptModal open={pinOpen} onOpenChange={setPinOpen} onVerified={confirmPayment} title="Confirm order" description="Enter your transaction PIN to accept this supplier quote." />
    </div>
  );
}
