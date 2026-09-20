import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ChevronLeft, ChevronRight, FileClock, Plus, Search } from 'lucide-react';
import { DashboardLayout } from '../pieces/dashboard/DashboardLayout';
import { DealList } from '../pieces/dashboard/DealList';
import { Button } from '../ui/button';
import { useTransactions } from '../../hooks/useTransactions';
const filters = ['all','active','completed','disputed'] as const;
type Filter = typeof filters[number];
export function DealsPage() {
  const query = useTransactions();
  const [params,setParams] = useSearchParams();
  const selected = params.get('status');
  const filter: Filter = filters.includes(selected as Filter) ? selected as Filter : 'all';
  const [search,setSearch] = useState('');
  const [page,setPage] = useState(1);
  const deals = (query.data ?? []).filter(deal => deal.status !== 'draft').filter(deal => {
    if(filter === 'active') return !['completed','paid_out','refunded','cancelled'].includes(deal.status);
    if(filter === 'completed') return ['completed','paid_out'].includes(deal.status);
    if(filter === 'disputed') return deal.status === 'disputed';
    return true;
  }).filter(deal => `${deal.title} ${deal.counterpartyName} ${deal.reference}`.toLowerCase().includes(search.toLowerCase()));
  const pages = Math.max(1,Math.ceil(deals.length/8));
  const current = Math.min(page,pages);
  return <DashboardLayout title="My deals"><div className="nd-heading"><div><h1>My deals</h1><p>Clear terms. Shared progress. One place for every deal.</p></div><Button asChild><Link to="/app/deals/new"><Plus size={15}/>New deal</Link></Button></div>
    <div className="nd-toolbar"><label className="nd-search"><span className="sr-only">Search deals</span><Search size={16}/><input placeholder="Search deals or people" value={search} onChange={event=>{setSearch(event.target.value);setPage(1);}}/></label><Button variant="ghost" asChild><Link to="/app/drafts"><FileClock size={15}/>Drafts</Link></Button></div>
    <div className="nd-filters" aria-label="Filter deals">{filters.map(value=><button key={value} aria-pressed={value===filter} onClick={()=>{setParams(value==='all'?{}:{status:value});setPage(1);}}>{value==='all'?'All deals':value[0].toUpperCase()+value.slice(1)}</button>)}</div>
    <DealList deals={deals.slice((current-1)*8,current*8)} loading={query.isLoading} error={query.isError} onRetry={()=>void query.refetch()} emptyTitle={search || filter!=='all' ? 'No matching deals' : undefined} emptyDescription={search || filter!=='all' ? 'Try another search or select All deals.' : undefined}/>
    {deals.length>8 && <div className="nd-pagination"><span>Page {current} of {pages}</span><div><Button variant="outline" size="icon" aria-label="Previous page" disabled={current===1} onClick={()=>setPage(current-1)}><ChevronLeft size={16}/></Button><Button variant="outline" size="icon" aria-label="Next page" disabled={current===pages} onClick={()=>setPage(current+1)}><ChevronRight size={16}/></Button></div></div>}
  </DashboardLayout>;
}
