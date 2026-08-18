import { AlertTriangle, ClipboardCheck, FileSearch, MessageSquareWarning, ShieldCheck, Truck, UserRoundCheck } from 'lucide-react';
import { adminApi } from '../../api/admin.api';
import { Card } from '../../../../components/ui/card';

const metrics = [
  ['pendingApplications', 'Partner applications', UserRoundCheck],
  ['sourcingRequests', 'Open sourcing requests', FileSearch],
  ['evidenceReviews', 'Evidence reviews', ClipboardCheck],
  ['paymentReviews', 'Release recommendations', ShieldCheck],
  ['shipmentExceptions', 'Shipment exceptions', Truck],
  ['moderationCases', 'Moderation alerts', MessageSquareWarning],
  ['newLeads', 'New early-access leads', AlertTriangle],
] as const;

export function AdminOverview() {
  const dashboard = adminApi.dashboard();
  return <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{metrics.map(([key, label, Icon]) => <Card key={key} className="rounded-2xl p-4"><span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary"><Icon size={16} /></span><p className="mt-4 text-3xl font-bold">{dashboard[key]}</p><p className="mt-1 text-xs text-muted-foreground">{label}</p></Card>)}</div>;
}
