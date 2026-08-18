import { Building2, Check, Ship, UserCheck, X } from 'lucide-react';
import { toast } from 'sonner';
import { adminApi } from '../../api/admin.api';
import { Badge } from '../../../../components/ui/badge';
import { Button } from '../../../../components/ui/button';
import { Card } from '../../../../components/ui/card';

const iconByKind = { sourcing_agent: UserCheck, supplier: Building2, logistics_provider: Ship } as const;

export function PartnerApplicationsSection() {
  const applications = adminApi.database().partnerApplications;
  return <div className="space-y-3">{applications.map((application) => { const Icon = iconByKind[application.kind]; return <Card key={application.id} className="rounded-2xl p-4 sm:p-5"><div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-center"><div className="flex gap-3"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary"><Icon size={18} /></span><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><p className="font-semibold">{application.companyName ?? application.contactName}</p><Badge variant={application.status === 'approved' ? 'success' : application.status === 'rejected' ? 'destructive' : 'outline'} className="capitalize">{application.status}</Badge><Badge variant="secondary" className="capitalize">{application.kind.replace(/_/g, ' ')}</Badge></div><p className="mt-1 text-xs text-muted-foreground">{application.contactName} · {application.city}, {application.country}</p><p className="mt-2 text-xs leading-5 text-muted-foreground">{application.experience}</p><div className="mt-2 flex flex-wrap gap-1">{application.services.map((service) => <Badge key={service} variant="outline">{service}</Badge>)}</div></div></div>{application.status === 'pending' && <div className="flex gap-2"><Button size="sm" variant="outline" className="rounded-full text-destructive" onClick={() => { adminApi.reviewApplication(application.id, 'rejected', 'Application did not meet the current launch requirements.'); toast.success('Application rejected.'); }}><X size={14} /> Reject</Button><Button size="sm" className="rounded-full" onClick={() => { adminApi.reviewApplication(application.id, 'approved', 'Approved for controlled onboarding.'); toast.success('Application approved and added to onboarding.'); }}><Check size={14} /> Approve</Button></div>}</div></Card>; })}</div>;
}
