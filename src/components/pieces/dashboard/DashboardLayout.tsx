/**
 * DashboardLayout
 * Minimal authenticated-app shell: sidebar (brand, nav, user/logout) + topbar.
 * Built on the ui/sidebar primitive. Intentionally small: role-based nav,
 * notifications, and more nav items arrive with future slices.
 */

import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
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
  Send,
  ArrowDownToLine,
  Users,
  HandCoins,
  Receipt,
  ReceiptText,
  Building2,
  Search,
  MessageCircle,
  Gift,
  ShoppingCart,
  ClipboardList,
  PackageSearch,
  UserCheck,
  WalletCards,
  Store,
  Boxes,
  CircleDollarSign,
  Workflow,
  Network,
  Ship,
  Truck,
  ChevronDown,
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
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarTrigger,
} from '../../ui/sidebar';
import { Avatar, AvatarFallback } from '../../ui/avatar';
import { Button } from '../../ui/button';
import { Separator } from '../../ui/separator';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../../ui/collapsible';
import { Skeleton } from '../../ui/skeleton';
import { NaitrustLogo } from '../../utility/NaitrustLogo';
import { SEOHead } from '../../utility/SEOHead';
import { useAuth } from '../../../libs/auth-context';
import { useTheme } from '../../../hooks/useTheme';
import { usePendingInvitationCount } from '../../../hooks/useInvitations';
import { useUnreadNotificationCount } from '../../../hooks/useNotifications';
import { accountTypeLabel, accountTypeOf } from '../../../libs/utils/account';
import { useMyBusiness } from '../../../hooks/useMyBusiness';
import { marketplaceApi, MARKET_CART_UPDATED_EVENT } from '../../../libs/marketplace/marketplace.api';

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
  children?: NavItem[];
}

interface NavGroup {
  label?: string;
  items: NavItem[];
}

const SHARED_ACCOUNT_GROUP: NavGroup = {
  label: 'Account',
  items: [
    { label: 'Rewards', path: '/app/rewards', icon: Gift, matchPrefix: true },
    { label: 'Settings', path: '/app/settings', icon: Settings, matchPrefix: true },
  ],
};

const BUSINESS_NAV_GROUPS: NavGroup[] = [
  { items: [{ label: 'Business home', path: '/app', icon: LayoutDashboard }] },
  {
    label: 'Workspace',
    items: [
      { label: 'Buy wholesale', path: '/app/market', icon: Search, children: [
        { label: 'Find from a link', path: '/app/source', icon: Search, matchPrefix: true },
        { label: 'Browse market', path: '/app/market', icon: Store, matchPrefix: true },
        { label: 'Quotes', path: '/app/quotes', icon: ClipboardList, matchPrefix: true },
        { label: 'Orders', path: '/app/orders', icon: PackageSearch, matchPrefix: true },
        { label: 'Production plan', path: '/app/production', icon: Workflow, matchPrefix: true },
      ] },
      { label: 'Agents & shipping', path: '/app/agents', icon: Network, children: [
        { label: 'Nigerian agents in China', path: '/app/agents', icon: UserCheck, matchPrefix: true },
        { label: 'Agent assignments', path: '/app/agent-assignments', icon: Network, matchPrefix: true },
        { label: 'Logistics providers', path: '/app/logistics', icon: Truck, matchPrefix: true },
        { label: 'Shipments', path: '/app/shipments', icon: Ship, matchPrefix: true },
      ] },
      { label: 'Sell locally', path: '/app/showcase', icon: Store, children: [
        { label: 'Showcase', path: '/app/showcase', icon: Store, matchPrefix: true },
        { label: 'Products', path: '/app/products', icon: Boxes, matchPrefix: true },
        { label: 'Customers', path: '/app/network', icon: Users, matchPrefix: true },
      ] },
    ],
  },
  {
    label: 'Money & support',
    items: [
      { label: 'Earnings & wallet', path: '/app/wallet', icon: CircleDollarSign, matchPrefix: true },
      { label: 'Transactions', path: '/app/transactions', icon: Receipt },
      { label: 'Messages', path: '/app/messages', icon: MessageCircle, matchPrefix: true },
      { label: 'Notifications', path: '/app/notifications', icon: Bell },
    ],
  },
  SHARED_ACCOUNT_GROUP,
];

const CUSTOMER_NAV_GROUPS: NavGroup[] = [
  { items: [{ label: 'Home', path: '/app', icon: LayoutDashboard }] },
  {
    label: 'Workspace',
    items: [
      { label: 'Buy wholesale', path: '/app/market', icon: Search, children: [
        { label: 'Find from a link', path: '/app/source', icon: Search, matchPrefix: true },
        { label: 'Browse market', path: '/app/market', icon: Store, matchPrefix: true },
        { label: 'Quotes', path: '/app/quotes', icon: ClipboardList, matchPrefix: true },
        { label: 'Orders', path: '/app/orders', icon: PackageSearch, matchPrefix: true },
      ] },
      { label: 'Agents & shipping', path: '/app/agents', icon: Network, children: [
        { label: 'Nigerian agents in China', path: '/app/agents', icon: UserCheck, matchPrefix: true },
        { label: 'Agent assignments', path: '/app/agent-assignments', icon: Network, matchPrefix: true },
        { label: 'Logistics providers', path: '/app/logistics', icon: Truck, matchPrefix: true },
        { label: 'Shipments', path: '/app/shipments', icon: Ship, matchPrefix: true },
      ] },
    ],
  },
  {
    label: 'Money & support',
    items: [
      { label: 'Order wallet', path: '/app/wallet', icon: WalletCards, matchPrefix: true },
      { label: 'Transactions', path: '/app/transactions', icon: Receipt },
      { label: 'Messages', path: '/app/messages', icon: MessageCircle, matchPrefix: true },
      { label: 'Notifications', path: '/app/notifications', icon: Bell },
    ],
  },
  SHARED_ACCOUNT_GROUP,
];

const ADMIN_NAV_GROUPS: NavGroup[] = [
  { items: [{ label: 'Admin overview', path: '/app/admin/overview', icon: LayoutDashboard }] },
  {
    label: 'Operations',
    items: [
      { label: 'Marketplace', path: '/app/admin/sourcing', icon: Store, children: [
        { label: 'Sourcing requests', path: '/app/admin/sourcing', icon: Search },
        { label: 'Suppliers', path: '/app/admin/suppliers', icon: Store },
        { label: 'Products', path: '/app/admin/products', icon: Boxes },
      ] },
      { label: 'Partners', path: '/app/admin/applications', icon: Network, children: [
        { label: 'Applications', path: '/app/admin/applications', icon: Network },
        { label: 'Sourcing agents', path: '/app/admin/agents', icon: UserCheck },
        { label: 'Logistics providers', path: '/app/admin/logistics', icon: Truck },
      ] },
      { label: 'Orders & releases', path: '/app/admin/releases', icon: ShieldCheck, children: [
        { label: 'Supplier releases', path: '/app/admin/releases', icon: ShieldCheck },
        { label: 'Shipment batches', path: '/app/admin/shipments', icon: Ship },
      ] },
    ],
  },
  {
    label: 'Control centre',
    items: [
      { label: 'Payments', path: '/app/admin/payments', icon: Receipt },
      { label: 'Moderation', path: '/app/admin/moderation', icon: MessageCircle },
      { label: 'Waitlist & leads', path: '/app/admin/leads', icon: Users },
      { label: 'Audit log', path: '/app/admin/audit', icon: ClipboardList },
    ],
  },
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
  const accountType = accountTypeOf(user);
  const isBusinessAccount = accountType === 'business';
  const displayName = isBusinessAccount ? business?.name : user?.name;
  const accountIdentityLoading = isBusinessAccount && isBusinessLoading;
  const navGroups = accountType === 'admin' ? ADMIN_NAV_GROUPS : isBusinessAccount ? BUSINESS_NAV_GROUPS : CUSTOMER_NAV_GROUPS;
  const navItems = navGroups.flatMap((group) => group.items.flatMap((item) => item.children ?? [item]));
  const [cartCount, setCartCount] = useState(() => marketplaceApi.getCart()?.items.length ?? 0);

  useEffect(() => {
    const updateCartCount = () => setCartCount(marketplaceApi.getCart()?.items.length ?? 0);
    window.addEventListener(MARKET_CART_UPDATED_EVENT, updateCartCount);
    window.addEventListener('storage', updateCartCount);
    updateCartCount();
    return () => {
      window.removeEventListener(MARKET_CART_UPDATED_EVENT, updateCartCount);
      window.removeEventListener('storage', updateCartCount);
    };
  }, [user?.id, user?.email]);

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
  const isPathActive = useCallback((item: NavItem) =>
    exactMatch
      ? item.path === location.pathname
      : item.matchPrefix
        ? location.pathname.startsWith(item.path)
        : location.pathname === item.path, [exactMatch, location.pathname]);
  const isActive = useCallback((item: NavItem) => isPathActive(item) || Boolean(item.children?.some(isPathActive)), [isPathActive]);
  const [openNavItems, setOpenNavItems] = useState<Record<string, boolean>>(() => Object.fromEntries(
    navGroups.flatMap((group) => group.items.filter((item) => item.children).map((item) => [item.label, isActive(item)])),
  ));

  useEffect(() => {
    const activeParent = navGroups.flatMap((group) => group.items).find((item) => item.children && isActive(item));
    if (!activeParent) return;
    setOpenNavItems((current) => current[activeParent.label] ? current : { ...current, [activeParent.label]: true });
  }, [isActive, navGroups]);

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
          {navGroups.map((group, gi) => <SidebarGroup key={group.label ?? `group-${gi}`}>{group.label && <SidebarGroupLabel>{group.label}</SidebarGroupLabel>}<SidebarMenu>{group.items.map((item) => {
            if (!item.children) return <SidebarMenuItem key={item.path}><SidebarMenuButton isActive={isActive(item)} tooltip={item.label} onClick={() => navigate(item.path)}><item.icon /><span>{item.label}</span></SidebarMenuButton>{item.path === '/app/invitations' && pendingInvitations > 0 && <SidebarMenuBadge>{pendingInvitations}</SidebarMenuBadge>}{item.path === '/app/notifications' && unreadNotifications > 0 && <SidebarMenuBadge>{unreadNotifications}</SidebarMenuBadge>}</SidebarMenuItem>;
            const open = Boolean(openNavItems[item.label]);
            return (
              <Collapsible
                key={item.label}
                asChild
                open={open}
                onOpenChange={(next) => {
                  setOpenNavItems((current) => ({ ...current, [item.label]: next }));
                  if (next) setSidebarOpen(true);
                }}
              >
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton isActive={isActive(item)} tooltip={item.label}>
                      <item.icon />
                      <span>{item.label}</span>
                      <ChevronDown
                        className={`ml-auto transition-transform group-data-[collapsible=icon]:hidden ${open ? 'rotate-180' : ''}`}
                      />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      {item.children.map((child) => (
                        <SidebarMenuSubItem key={child.path}>
                          <SidebarMenuSubButton asChild isActive={isActive(child)}>
                            <Link to={child.path}>{child.label}</Link>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      ))}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>
            );
          })}</SidebarMenu></SidebarGroup>)}
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
            {accountType !== 'admin' && <Button
              variant="ghost"
              size="icon"
              aria-label={cartCount > 0 ? `Cart with ${cartCount} items` : 'Cart'}
              className="relative"
              onClick={() => navigate('/app/cart')}
            >
              <ShoppingCart size={18} />
              {cartCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[9px] font-bold text-white">
                  {cartCount > 99 ? '99+' : cartCount}
                </span>
              )}
            </Button>}
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
