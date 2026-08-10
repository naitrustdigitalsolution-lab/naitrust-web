/**
 * DashboardLayout
 * Minimal authenticated-app shell: sidebar (brand, nav, user/logout) + topbar.
 * Built on the ui/sidebar primitive. Intentionally small: role-based nav,
 * notifications, and more nav items arrive with future slices.
 */

import { useState, type ReactNode } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  LogOut,
  Bell,
  Moon,
  Sun,
  Inbox,
  PlusCircle,
  Settings,
  ShieldCheck,
  Lock,
  FileClock,
  Send,
  ArrowDownToLine,
  Users,
  HandCoins,
  Receipt,
  ReceiptText,
  Building2,
  Search,
  MessageCircle,
  BadgeCheck,
  Gift,
} from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from '../../ui/sidebar';
import { Avatar, AvatarFallback } from '../../ui/avatar';
import { Button } from '../../ui/button';
import { Separator } from '../../ui/separator';
import { Skeleton } from '../../ui/skeleton';
import { NaitrustLogo } from '../../utility/NaitrustLogo';
import { SEOHead } from '../../utility/SEOHead';
import { useAuth } from '../../../libs/auth-context';
import { useTheme } from '../../../hooks/useTheme';
import { usePendingInvitationCount } from '../../../hooks/useInvitations';
import { useUnreadNotificationCount } from '../../../hooks/useNotifications';
import { accountTypeLabel, accountTypeOf } from '../../../libs/utils/account';
import { useMyBusiness } from '../../../hooks/useMyBusiness';

interface DashboardLayoutProps {
  title: string;
  children: ReactNode;
}

interface NavItem {
  label: string;
  path: string;
  icon: typeof LayoutDashboard;
  /** true → active on any sub-path; false/undefined → exact match only. */
  matchPrefix?: boolean;
}

interface NavGroup {
  label?: string;
  items: NavItem[];
}

const SHARED_ACCOUNT_GROUP: NavGroup = {
  label: 'Account',
  items: [
    { label: 'Rewards', path: '/app/rewards', icon: Gift, matchPrefix: true },
    { label: 'Security', path: '/app/security', icon: Lock, matchPrefix: true },
    { label: 'Settings', path: '/app/settings', icon: Settings, matchPrefix: true },
  ],
};

const BUSINESS_ACCOUNT_GROUP: NavGroup = {
  label: 'Account',
  items: [
    { label: 'Trust Profile', path: '/app/trust-profile', icon: BadgeCheck, matchPrefix: true },
    ...SHARED_ACCOUNT_GROUP.items,
  ],
};

const BUSINESS_NAV_GROUPS: NavGroup[] = [
  {
    items: [{ label: 'Dashboard', path: '/app', icon: LayoutDashboard }],
  },
  {
    label: 'Business trust',
    items: [
      { label: 'Find a Business', path: '/app/businesses', icon: Search, matchPrefix: true },
      { label: 'Customers & Suppliers', path: '/app/network', icon: Building2, matchPrefix: true },
    ],
  },
  {
    label: 'Protected Deals',
    items: [
      { label: 'All Deals', path: '/app/deals', icon: ShieldCheck, matchPrefix: true },
      { label: 'Protect a Payment', path: '/app/deals/new', icon: PlusCircle },
      { label: 'Drafts', path: '/app/drafts', icon: FileClock },
      { label: 'Invitations', path: '/app/invitations', icon: Inbox, matchPrefix: true },
    ],
  },
  {
    label: 'Business money',
    items: [
      { label: 'Receive Money', path: '/app/payments/receive', icon: ArrowDownToLine },
      { label: 'Send Money', path: '/app/payments', icon: Send },
      { label: 'Transactions', path: '/app/transactions', icon: Receipt },
    ],
  },
  { label: 'More', items: [{ label: 'Bills & Airtime', path: '/app/bills', icon: ReceiptText }] },
  {
    label: 'Support',
    items: [
      { label: 'Messages', path: '/app/messages', icon: MessageCircle, matchPrefix: true },
      { label: 'Notifications', path: '/app/notifications', icon: Bell },
    ],
  },
  BUSINESS_ACCOUNT_GROUP,
];

const CUSTOMER_NAV_GROUPS: NavGroup[] = [
  { items: [{ label: 'Dashboard', path: '/app', icon: LayoutDashboard }] },
  {
    label: 'Businesses',
    items: [
      { label: 'Find a Business', path: '/app/businesses', icon: Search, matchPrefix: true },
    ],
  },
  {
    label: 'Money',
    items: [
      { label: 'Pay a Business', path: '/app/payments', icon: Send },
      { label: 'Receive Money', path: '/app/payments/receive', icon: ArrowDownToLine },
      { label: 'Money Activity', path: '/app/transactions', icon: Receipt },
    ],
  },
  { label: 'More', items: [{ label: 'Bills & Airtime', path: '/app/bills', icon: ReceiptText }] },
  {
    label: 'Protected Deals',
    items: [
      { label: 'All Deals', path: '/app/deals', icon: ShieldCheck, matchPrefix: true },
      { label: 'Protect a Payment', path: '/app/deals/new', icon: PlusCircle },
      { label: 'Drafts', path: '/app/drafts', icon: FileClock },
      { label: 'Invitations', path: '/app/invitations', icon: Inbox, matchPrefix: true },
    ],
  },
  {
    label: 'Support',
    items: [
      { label: 'Messages', path: '/app/messages', icon: MessageCircle, matchPrefix: true },
      { label: 'Notifications', path: '/app/notifications', icon: Bell },
    ],
  },
  SHARED_ACCOUNT_GROUP,
];

function initialsOf(name: string | undefined): string {
  if (!name) return 'NT';
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');
}

export function DashboardLayout({ title, children }: DashboardLayoutProps) {
  const { user, logout } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const pendingInvitations = usePendingInvitationCount();
  const unreadNotifications = useUnreadNotificationCount();
  const { data: business, isLoading: isBusinessLoading } = useMyBusiness();
  const isBusinessAccount = accountTypeOf(user) !== 'customer';
  const displayName = isBusinessAccount ? business?.name : user?.name;
  const accountIdentityLoading = isBusinessAccount && isBusinessLoading;
  const navGroups = isBusinessAccount ? BUSINESS_NAV_GROUPS : CUSTOMER_NAV_GROUPS;
  const navItems = navGroups.flatMap((group) => group.items);

  // Tablets (iPad portrait/landscape included) default to the collapsed icon
  // rail so page content isn't squeezed behind a full 256px sidebar; only
  // genuine desktop-width viewports start expanded. Still user-toggleable via
  // the sidebar trigger either way.
  const [sidebarOpen, setSidebarOpen] = useState(
    () => typeof window !== 'undefined' && window.innerWidth >= 1280,
  );

  // An exact nav match (e.g. /app/deals/new) wins so a prefix item
  // (/app/deals) doesn't also highlight.
  const exactMatch = navItems.some((i) => i.path === location.pathname);
  const isActive = (item: NavItem) =>
    exactMatch
      ? item.path === location.pathname
      : item.matchPrefix
        ? location.pathname.startsWith(item.path)
        : location.pathname === item.path;

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  return (
    <SidebarProvider open={sidebarOpen} onOpenChange={setSidebarOpen}>
      {/* The authenticated app is private: never index any /app screen. */}
      <SEOHead title={title} noindex />
      <Sidebar collapsible="icon">
        <SidebarHeader className="gap-3 px-3 py-4">
          <NaitrustLogo size="sm" showText className="group-data-[collapsible=icon]:[&>span]:hidden" />
          {/* Account identity is deliberately personal for customers and business-led for merchants. */}
          <div className="flex items-center gap-2 rounded-xl border bg-muted/40 px-2.5 py-2 group-data-[collapsible=icon]:hidden">
            {accountIdentityLoading ? (
              <>
                <Skeleton className="h-8 w-8 shrink-0 rounded-full" />
                <div className="flex-1 space-y-1.5">
                  <Skeleton className="h-3.5 w-28" />
                  <Skeleton className="h-3 w-20" />
                </div>
              </>
            ) : (
              <>
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
                    {initialsOf(displayName)}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-foreground">{displayName}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {accountTypeLabel(accountTypeOf(user))}
                  </p>
                </div>
              </>
            )}
          </div>
        </SidebarHeader>

        <SidebarContent>
          {navGroups.map((group, gi) => (
            <SidebarGroup key={group.label ?? `group-${gi}`}>
              {group.label && <SidebarGroupLabel>{group.label}</SidebarGroupLabel>}
              <SidebarMenu>
                {group.items.map((item) => (
                  <SidebarMenuItem key={item.path}>
                    <SidebarMenuButton
                      isActive={isActive(item)}
                      tooltip={item.label}
                      onClick={() => navigate(item.path)}
                    >
                      <item.icon />
                      <span>{item.label}</span>
                    </SidebarMenuButton>
                    {item.path === '/app/invitations' && pendingInvitations > 0 && (
                      <SidebarMenuBadge>{pendingInvitations}</SidebarMenuBadge>
                    )}
                    {item.path === '/app/notifications' && unreadNotifications > 0 && (
                      <SidebarMenuBadge>{unreadNotifications}</SidebarMenuBadge>
                    )}
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroup>
          ))}
        </SidebarContent>

        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <div className="flex items-center gap-2 px-2 py-1.5 group-data-[collapsible=icon]:px-0">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
                    {initialsOf(user?.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 group-data-[collapsible=icon]:hidden">
                  <p className="truncate text-sm font-medium text-foreground">{user?.name}</p>
                  <p className="truncate text-xs text-muted-foreground">{user?.email}</p>
                </div>
              </div>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton
                tooltip="Log out"
                onClick={handleLogout}
                className="hover:bg-red-500/10 hover:text-red-600 dark:hover:text-red-400"
              >
                <LogOut />
                <span>Log out</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>

      <SidebarInset>
        <header className="sticky top-0 z-10 flex h-14 items-center gap-2 border-b bg-background/90 px-3 backdrop-blur sm:gap-3 sm:px-4">
          <SidebarTrigger />
          <Separator orientation="vertical" className="h-5" />
          <h1 className="min-w-0 truncate text-sm font-semibold text-foreground sm:text-base">{title}</h1>

          <div className="ml-auto flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              aria-label="Toggle theme"
              onClick={toggleTheme}
            >
              {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Notifications"
              className="relative"
              onClick={() => navigate('/app/notifications')}
            >
              <Bell size={18} />
              {unreadNotifications > 0 && (
                <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-primary" />
              )}
            </Button>
          </div>
        </header>
        <main className="min-w-0 flex-1 overflow-x-hidden bg-muted/40 p-3 sm:p-4 md:p-6">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
