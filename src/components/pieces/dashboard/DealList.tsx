import { Link } from 'react-router-dom';
import { ArrowRight, FileText, ShieldCheck } from 'lucide-react';
import { TransactionStatusBadge } from './TransactionStatusBadge';
import { formatMinorAmount } from '../../../libs/utils/safe-deal-presentation';
import type { SafeDealSummary } from '../../../libs/store/types';
import { Button } from '../../ui/button';

export function DealList({ deals, loading, error, onRetry, emptyTitle = 'Your next good deal starts here', emptyDescription = 'Agree the details, invite the other person, and keep everything in one Deal Room.' }: { deals?: SafeDealSummary[]; loading?: boolean; error?: boolean; onRetry?: () => void; emptyTitle?: string; emptyDescription?: string }) {
  if (loading) return <div className="nd-deal-list" role="status" aria-label="Loading deals">{[0,1,2].map(i=><div key={i} className="h-24 animate-pulse border-b bg-slate-50 last:border-0" />)}</div>;
  if (error) return <div className="nd-empty" role="alert"><h2>We couldn’t load your deals</h2><p>Please try again. Your saved deals haven’t changed.</p><Button variant="outline" onClick={onRetry}>Try again</Button></div>;
  if (!deals?.length) return <div className="nd-empty"><ShieldCheck size={30}/><h2>{emptyTitle}</h2><p>{emptyDescription}</p><Button asChild><Link to="/app/deals/new">Create a deal <ArrowRight size={15}/></Link></Button></div>;
  return <div className="nd-deal-list">{deals.map(deal=><Link key={deal.id} to={`/app/deals/${deal.id}`} className="nd-deal-row"><span className="nd-deal-icon"><FileText size={19}/></span><div className="nd-deal-title"><strong>{deal.title}</strong><p>{deal.counterpartyName}</p></div><div className="nd-deal-money">{formatMinorAmount(deal.amountMinor,deal.currency)}<div><TransactionStatusBadge status={deal.status}/></div></div><ArrowRight size={15} className="text-slate-400"/></Link>)}</div>;
}
