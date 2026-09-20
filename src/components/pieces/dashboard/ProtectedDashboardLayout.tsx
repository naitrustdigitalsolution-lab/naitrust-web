import { hasLegalWorkspace } from '../../../features/legal/legal.api';
import { useLegalRefresh } from '../../../features/legal/hooks';
import { useLayoutEffect, useState, type ReactNode } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { ArrowUpRight, Bell, CircleHelp, House, Inbox, LogOut, Menu, Settings, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../../libs/auth-context';
import { usePendingInvitationCount } from '../../../hooks/useInvitations';
import { useUnreadNotificationCount } from '../../../hooks/useNotifications';
import { useMyBusiness } from '../../../hooks/useMyBusiness';
import { businessWebsiteUrl } from '../../../libs/utils/business-website';
import { accountTypeOf, accountTypeLabel } from '../../../libs/utils/account';
import { appConfig } from '../../../configs/env';
import { NaitrustLogo } from '../../utility/NaitrustLogo';
import { SEOHead } from '../../utility/SEOHead';
import { Sheet, SheetContent, SheetTitle, SheetDescription } from '../../ui/sheet';
import '../../../styles/dashboard.css';

const coreNavigation = [
  { label: 'Overview', to: '/app', icon: House, end: true },
  { label: 'My deals', to: '/app/deals', icon: ShieldCheck, end: false },
  { label: 'Invitations', to: '/app/invitations', icon: Inbox, end: false },
];

export function ProtectedDashboardLayout({ title, children }: { title: string; children: ReactNode }) {
  const { user, logout } = useAuth();
  useLegalRefresh();
  const navigate = useNavigate();
  const { data: business } = useMyBusiness();
  const accountType = accountTypeOf(user);
  const website = businessWebsiteUrl(business?.website);
  useLayoutEffect(() => {
    const hadDarkTheme = document.documentElement.classList.contains('dark');
    document.documentElement.classList.remove('dark');
    document.body.classList.add('nd-dashboard-body');
    return () => { document.body.classList.remove('nd-dashboard-body'); if (hadDarkTheme) document.documentElement.classList.add('dark'); };
  }, []);
  const navigation = accountTypeOf(user) === 'admin' ? [
    { label: 'Overview', to: '/app/admin/overview', icon: House, end: true },
    ...[['Accounts', 'accounts'], ['Protected deals', 'deals'], ['Disputes', 'disputes'], ['Payments', 'payments'], ['Legal providers', 'legal'], ['Assignments', 'assignments'], ['Settings', 'settings'], ['Audit log', 'audit']].map(([label, section]) => ({ label, to: `/app/admin/${section}`, icon: ShieldCheck, end: false })),
  ] : [...coreNavigation, ...(hasLegalWorkspace(user) ? [{ label: 'Legal reviews', to: '/app/legal-reviews', icon: ShieldCheck, end: false }] : [])];
  const invitations = usePendingInvitationCount();
  const notifications = useUnreadNotificationCount();
  const [menuOpen, setMenuOpen] = useState(false);
  const name = user?.name || 'Your account';
  const initials = name.split(' ').slice(0, 2).map(part => part[0]).join('');
  const sidebar = <>
    <Link to="/app" className="nd-brand" onClick={() => setMenuOpen(false)} aria-label="Naitrust overview"><NaitrustLogo size="md" /></Link>
    <p className="nd-nav-label">{accountTypeLabel(accountType)}</p>
    <nav aria-label="Main navigation" className="nd-nav">{navigation.map(({ label, to, icon: Icon, end }) => <NavLink key={to} to={to} end={end} onClick={() => setMenuOpen(false)} className={({ isActive }) => isActive ? 'active' : ''}><Icon size={19} strokeWidth={1.7} /><span>{label}</span>{to.endsWith('invitations') && invitations > 0 && <span className="nd-count">{invitations}</span>}</NavLink>)}</nav>
    <div className="nd-sidebar-bottom">
      <div className="nd-sidebar-note"><ShieldCheck size={21} /><p>A little more trust.<br /><strong>In every deal.</strong></p></div>
      <nav aria-label="Account navigation" className="nd-nav"><NavLink to="/app/messages/support" onClick={() => setMenuOpen(false)}><CircleHelp size={19} />Help & support</NavLink><NavLink to="/app/settings" onClick={() => setMenuOpen(false)}><Settings size={19} />Settings</NavLink></nav>
      <div className="nd-account"><span className="nd-avatar">{initials}</span><div><strong>{name}</strong><small>{user?.email}</small></div><button type="button" aria-label="Log out" onClick={async () => { await logout(); navigate('/login', { replace: true }); }}><LogOut size={17} /></button></div>
    </div>
  </>;
  return <div className="nd-app">
    <SEOHead title={title} noindex />
    <aside className="nd-sidebar">{sidebar}</aside>
    <Sheet open={menuOpen} onOpenChange={setMenuOpen}><SheetContent side="left" className="nd-app nd-drawer"><SheetTitle className="sr-only">Your workspace</SheetTitle><SheetDescription className="sr-only">Navigate your deals, invitations and account.</SheetDescription>{sidebar}</SheetContent></Sheet>
    <div className="nd-workspace">
      <header className="nd-topbar"><button className="nd-menu-button" aria-label="Open navigation" onClick={() => setMenuOpen(true)}><Menu size={22} /></button><span>{title}</span><div className="nd-topbar-actions">{accountType === 'business' && website && <a href={website} target="_blank" rel="noopener noreferrer" className="nd-website-link">Visit website <ArrowUpRight size={14} /></a>}<Link to="/app/notifications" aria-label={notifications ? `Notifications, ${notifications} unread` : 'Notifications'} className="nd-notifications"><Bell size={19} />{notifications > 0 && <i />}</Link><Link to="/app/settings" aria-label="Your account" className="nd-avatar">{initials}</Link></div></header>
      {appConfig.isMock && <div className="nd-preview">Payments are not available yet. Deal activity in this workspace is stored locally.</div>}
      <main className="nd-main">{children}</main>
      <nav aria-label="Mobile navigation" className="nd-mobile-nav" style={{ gridTemplateColumns: `repeat(${Math.min(navigation.length, 4) + 1}, minmax(0, 1fr))` }}>{navigation.slice(0, 4).map(({label,to,icon:Icon,end})=><NavLink to={to} end={end} key={to} className={({isActive})=>isActive?'active':''}><Icon size={20}/><span>{label}</span></NavLink>)}<button onClick={()=>setMenuOpen(true)}><Menu size={20}/><span>More</span></button></nav>
    </div>
  </div>;
}
