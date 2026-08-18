import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { Activity, Boxes, ClipboardCheck, LayoutDashboard, MessageSquareWarning, Network, PackagePlus, Receipt, Ship, Store, Truck, UserRoundCheck, Users } from 'lucide-react';
import { DashboardLayout } from '../pieces/dashboard/DashboardLayout';
import { useAuth } from '../../libs/auth-context';
import { AdminOverview } from '../../features/sourcing/components/admin/AdminOverview';
import { AuditSection, LeadsSection, ModerationSection } from '../../features/sourcing/components/admin/AdminGovernance';
import { AgentOperationsSection, LogisticsOperationsSection } from '../../features/sourcing/components/admin/PartnerDirectorySection';
import { PartnerApplicationsSection } from '../../features/sourcing/components/admin/PartnerApplicationsSection';
import { LedgerQueue, ReleaseQueue, ShipmentQueue, SourcingQueue } from '../../features/sourcing/components/admin/AdminWorkQueues';
import { OperationsHeader } from '../../features/sourcing/components/OperationsHeader';
import { useOperationsRefresh } from '../../features/sourcing/hooks/use-operations-refresh';
import { ProductCatalogueSection, SupplierCatalogueSection } from '../../features/sourcing/components/admin/AdminMarketplaceSection';

const sections = {
  overview: { title: 'Operations overview', description: 'Urgent sourcing, partner, evidence, logistics, payment and moderation queues in one place.', icon: LayoutDashboard, content: AdminOverview },
  sourcing: { title: 'Sourcing requests', description: 'Review extracted product briefs, supplier candidates, missing facts and verification readiness.', icon: ClipboardCheck, content: SourcingQueue },
  suppliers: { title: 'Supplier catalogue', description: 'Add verified China and Nigeria suppliers, control availability and keep operating records in one place.', icon: Store, content: SupplierCatalogueSection },
  products: { title: 'Product catalogue', description: 'Create supplier-linked product drafts and publish only after matching media and details are complete.', icon: PackagePlus, content: ProductCatalogueSection },
  applications: { title: 'Partner applications', description: 'Review sourcing agents, suppliers and international logistics providers before controlled onboarding.', icon: Network, content: PartnerApplicationsSection },
  agents: { title: 'Sourcing agents', description: 'Control agent availability, locations, expertise, evidence performance and operational access.', icon: UserRoundCheck, content: AgentOperationsSection },
  logistics: { title: 'Logistics providers', description: 'Manage verified routes, consolidation, freight, insurance evidence and service availability.', icon: Truck, content: LogisticsOperationsSection },
  releases: { title: 'Supplier payment reviews', description: 'Monitor agent readiness certifications without allowing agents or admins to directly move buyer funds.', icon: Receipt, content: ReleaseQueue },
  shipments: { title: 'Shipment batches', description: 'Monitor ready supplier orders, consolidation choices, logistics quotes and delivery exceptions.', icon: Ship, content: ShipmentQueue },
  payments: { title: 'Payments and reconciliation', description: 'Read-only provider-backed money events. Balances cannot be manually edited.', icon: Activity, content: LedgerQueue },
  moderation: { title: 'Messages and moderation', description: 'Review attempts to share contact details or move communication and payment off-platform.', icon: MessageSquareWarning, content: ModerationSection },
  leads: { title: 'Waitlist and leads', description: 'Qualify buyers, suppliers and businesses interested in China or Nigeria wholesale sourcing.', icon: Users, content: LeadsSection },
  audit: { title: 'Admin audit log', description: 'Every approval, rejection, suspension, financial decision and sensitive change is recorded.', icon: Boxes, content: AuditSection },
} as const;

export type AdminSection = keyof typeof sections;

export function AdminPortalPage() {
  useOperationsRefresh();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { section = 'overview' } = useParams<{ section?: string }>();
  if (user?.role !== 'admin') return <Navigate to="/app" replace />;
  const key = (section in sections ? section : 'overview') as AdminSection;
  const selected = sections[key];
  const Content = selected.content;
  return <DashboardLayout title="Admin portal"><div className="mx-auto w-full max-w-7xl space-y-5"><OperationsHeader eyebrow="Naitrust operations" title={selected.title} description={selected.description} icon={selected.icon} badge="Mock back office" /><div className="scrollbar-none flex gap-2 overflow-x-auto pb-1 xl:hidden">{Object.entries(sections).map(([id, item]) => <button key={id} type="button" onClick={() => navigate(`/app/admin/${id}`)} className={`shrink-0 rounded-full border px-3 py-2 text-xs font-semibold ${id === key ? 'border-primary bg-primary text-primary-foreground' : 'bg-card'}`}>{item.title}</button>)}</div><Content /></div></DashboardLayout>;
}
