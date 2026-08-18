import { ArrowDownLeft, ArrowUpRight, LockKeyhole } from 'lucide-react';
import type { OrderLedgerEntry } from '../domain/types';
import { Badge } from '../../../components/ui/badge';
import { Card } from '../../../components/ui/card';

function money(minor: number, currency: string) {
  return new Intl.NumberFormat(currency === 'NGN' ? 'en-NG' : 'en-US', { style: 'currency', currency, maximumFractionDigits: currency === 'NGN' ? 0 : 2 }).format(minor / 100);
}

export function MoneyLedger({ entries }: { entries: OrderLedgerEntry[] }) {
  return (
    <Card className="rounded-3xl p-5 sm:p-6">
      <div><h2 className="font-bold">Money activity</h2><p className="mt-1 text-xs text-muted-foreground">Every allocation, fee, settlement and refund for this order.</p></div>
      <div className="mt-5 divide-y">
        {entries.map((entry) => {
          const Icon = entry.direction === 'in' ? ArrowDownLeft : entry.direction === 'out' ? ArrowUpRight : LockKeyhole;
          return <div key={entry.id} className="flex items-center gap-3 py-3"><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-muted text-muted-foreground"><Icon size={15} /></span><div className="min-w-0 flex-1"><p className="truncate text-sm font-medium">{entry.label}</p><p className="mt-0.5 text-[10px] text-muted-foreground">{new Date(entry.createdAt).toLocaleString()} {entry.providerReference ? `· ${entry.providerReference}` : ''}</p></div><div className="text-right"><p className="text-sm font-semibold">{money(entry.amountMinor, entry.currency)}</p><Badge variant={entry.status === 'confirmed' ? 'success' : 'outline'} className="mt-1 capitalize">{entry.status}</Badge></div></div>;
        })}
        {entries.length === 0 && <p className="py-8 text-center text-sm text-muted-foreground">No money activity recorded yet.</p>}
      </div>
    </Card>
  );
}
