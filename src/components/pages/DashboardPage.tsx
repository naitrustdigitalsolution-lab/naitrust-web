import { Link, Navigate } from 'react-router-dom';
import { ArrowRight, CheckCheck, Inbox, Plus, ShieldCheck } from 'lucide-react';
import { DashboardLayout } from '../pieces/dashboard/DashboardLayout';
import { DealList } from '../pieces/dashboard/DealList';
import { Button } from '../ui/button';
import { useAuth } from '../../libs/auth-context';
import { useSecurity } from '../../hooks/useSecurity';
import { useTransactions } from '../../hooks/useTransactions';
import { useInvitations } from '../../hooks/useInvitations';
import { useMyBusiness } from '../../hooks/useMyBusiness';
import { businessWebsiteUrl } from '../../libs/utils/business-website';
import { accountTypeOf, accountTypeLabel } from '../../libs/utils/account';

export function DashboardPage() {
  const { user } = useAuth();
  const security = useSecurity();
  const business = useMyBusiness();
  const accountType = accountTypeOf(user);
  const deals = useTransactions();
  const invitations = useInvitations();
  if (accountTypeOf(user) === 'admin') return <Navigate to="/app/admin/overview" replace />;
  const published = (deals.data ?? []).filter(deal => deal.status !== 'draft');
  const completed = published.filter(deal => ['completed','paid_out'].includes(deal.status)).length;
  const active = published.filter(deal => !['completed','paid_out','refunded','cancelled'].includes(deal.status)).length;
  const pending = (invitations.data ?? []).filter(invitation => invitation.status === 'pending' && new Date(invitation.expiresAt).getTime() > Date.now()).length;
  const firstName = user?.firstName || user?.name?.split(' ')[0] || 'there';
  return <DashboardLayout title="Overview">
    <div className="nd-heading"><div><span className="nd-account-type">{accountTypeLabel(accountType)}</span><h1>Hello, {firstName} <span className="text-slate-400">.</span></h1><p>A little more confidence in every deal.</p></div></div>
    <section className="nd-overview-hero"><div><h2>Good deals start with<br/>clear agreements.</h2><p>Buying or selling? Agree the details and decide together when payment can be released.</p><Button asChild><Link to="/app/deals/new"><Plus size={16}/>Create a deal</Link></Button></div><div className="nd-hero-steps" aria-label="How a protected deal works"><div><span>01</span>Agree the terms together</div><div><span>02</span>Fund the agreed payment</div><div><span>03</span>Review, approve and release</div></div></section>
    {!security.canCreateDeal && <section className="nd-setup"><ShieldCheck size={21}/><div><h2>Let’s get your account ready</h2><p>Complete your verification and set a PIN before creating a deal.</p></div><Button variant="outline" asChild><Link to="/app/settings?tab=security">Finish setup <ArrowRight size={14}/></Link></Button></section>}
    {accountType === 'business' && business.isSuccess && !businessWebsiteUrl(business.data?.website) && <div className="nd-website-prompt"><p>Add your business website for quick access from your workspace.</p><Link to="/app/settings?tab=business">Add website <ArrowRight size={14}/></Link></div>}
    <div className="nd-stats"><Link className="nd-stat" to="/app/deals?status=active"><span><ShieldCheck size={15}/>Active deals</span><strong>{deals.isLoading || deals.isError ? '—' : active}</strong><small>Agreements in progress</small></Link><Link className="nd-stat" to="/app/invitations"><span><Inbox size={15}/>Invitations</span><strong>{invitations.isLoading || invitations.isError ? '—' : pending}</strong><small>Ready for your review</small></Link><Link className="nd-stat" to="/app/deals?status=completed"><span><CheckCheck size={15}/>Completed</span><strong>{deals.isLoading || deals.isError ? '—' : completed}</strong><small>Deals closed together</small></Link></div>
    <div className="nd-section-title"><h2>Recent deals</h2><Link to="/app/deals">View all <ArrowRight size={14}/></Link></div>
    <DealList deals={published.slice(0,5)} loading={deals.isLoading} error={deals.isError} onRetry={()=>void deals.refetch()}/>
    <p className="nd-subtle-note">Every deal has its own room for the agreement, payment status, messages and evidence.</p>
  </DashboardLayout>;
}
