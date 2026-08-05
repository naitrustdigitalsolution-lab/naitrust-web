import { ArrowDownLeft, ArrowUpRight, Receipt } from 'lucide-react';
import type { CounterpartyTransaction } from '../../../libs/counterparties/types';
import { formatMinorAmount } from '../../../libs/utils/safe-deal-presentation';
import { Badge } from '../../ui/badge';
import { Card } from '../../ui/card';

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function CounterpartyTransactionsPanel({ transactions }: { transactions: CounterpartyTransaction[] }) {
  return (
    <Card className="gap-0 overflow-hidden rounded-3xl p-0 shadow-sm">
      <div className="flex items-center justify-between border-b px-5 py-4 sm:px-6">
        <div><h2 className="font-semibold">Completed transactions</h2><p className="mt-0.5 text-xs text-muted-foreground">Your finished payment and Protected Deal history with this contact.</p></div>
        <Badge variant="secondary" className="rounded-full">{transactions.length}</Badge>
      </div>
      {transactions.length === 0 ? (
        <div className="flex flex-col items-center px-6 py-12 text-center">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-muted text-muted-foreground"><Receipt size={19} /></span>
          <p className="mt-3 text-sm font-semibold">No completed transactions yet</p>
          <p className="mt-1 max-w-sm text-xs leading-5 text-muted-foreground">Payments and Protected Deals completed with this contact will be recorded here.</p>
        </div>
      ) : transactions.map((transaction) => {
        const received = transaction.direction === 'received';
        const DirectionIcon = received ? ArrowDownLeft : ArrowUpRight;
        return (
          <div key={transaction.id} className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 border-b px-4 py-4 last:border-b-0 sm:px-6">
            <span className={`flex h-9 w-9 items-center justify-center rounded-xl ${received ? 'bg-emerald-50 text-emerald-700' : 'bg-blue-50 text-blue-700'}`}><DirectionIcon size={17} /></span>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">{transaction.title}</p>
              <p className="mt-1 truncate text-xs text-muted-foreground">{transaction.reference} · {formatDate(transaction.completedAt)}</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-bold tabular-nums">{received ? '+' : '−'}{formatMinorAmount(transaction.amountMinor, transaction.currency)}</p>
              <p className="mt-1 text-[11px] capitalize text-muted-foreground">{transaction.type.replace('_', ' ')}</p>
            </div>
          </div>
        );
      })}
    </Card>
  );
}

