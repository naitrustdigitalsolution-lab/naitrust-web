import { useState } from 'react';
import { BadgeCheck, Building2, Check, ClipboardCopy, Globe2, ShieldCheck, UserCheck, X } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../../libs/auth-context';
import { productionNetworkApi } from '../../libs/marketplace/production-network.api';
import type { PartnerApplication } from '../../libs/marketplace/types';
import { DashboardLayout } from '../pieces/dashboard/DashboardLayout';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Card } from '../ui/card';

export function PartnerAdminPage() {
  const { user } = useAuth();
  const [applications, setApplications] = useState(() => productionNetworkApi.listApplications());

  if (user?.role !== 'admin') return <DashboardLayout title="Partner network"><Card className="mx-auto max-w-lg rounded-3xl p-8 text-center"><ShieldCheck className="mx-auto text-muted-foreground" size={32} /><h1 className="mt-4 text-xl font-bold">Admin access required</h1><p className="mt-2 text-sm text-muted-foreground">Partner approval, invitations, and access controls are available only to Naitrust administrators.</p></Card></DashboardLayout>;

  const review = (id: string, status: 'approved' | 'rejected') => {
    const updated = productionNetworkApi.reviewApplication(id, status);
    setApplications(productionNetworkApi.listApplications());
    toast.success(status === 'approved' ? `Approved. Access code ${updated.inviteCode} created.` : 'Application rejected.');
  };

  const copyCode = async (application: PartnerApplication) => {
    if (!application.inviteCode) return;
    await navigator.clipboard.writeText(application.inviteCode);
    toast.success('Partner access code copied.');
  };

  const pending = applications.filter((application) => application.status === 'pending').length;
  const approvedAgents = applications.filter((application) => application.status === 'approved' && application.role === 'agent').length;
  const approvedSuppliers = applications.filter((application) => application.status === 'approved' && application.role === 'supplier').length;

  return <DashboardLayout title="Partner network"><div className="w-full"><section className="rounded-3xl bg-[#061a31] p-5 text-white sm:p-8"><p className="text-xs font-bold uppercase tracking-[.16em] text-sky-300">Admin controlled network</p><div className="mt-3 flex flex-wrap items-end justify-between gap-5"><div><h1 className="text-3xl font-bold sm:text-4xl">Agents and Chinese suppliers</h1><p className="mt-3 max-w-2xl text-sm leading-6 text-white/60">Review applications, approve partners, issue access codes, and control their assignments and settlement permissions.</p></div><Badge className="border-white/15 bg-white/10 text-white"><Globe2 size={12} /> China launch</Badge></div></section><section className="mt-4 grid grid-cols-3 gap-3"><Metric icon={ShieldCheck} label="Pending review" value={pending} /><Metric icon={UserCheck} label="Approved agents" value={approvedAgents} /><Metric icon={Building2} label="Approved suppliers" value={approvedSuppliers} /></section><section className="mt-5"><div className="mb-3"><h2 className="text-lg font-bold">Partner applications</h2><p className="mt-1 text-xs text-muted-foreground">Access codes shown here are mock data. Production codes must be generated, hashed, delivered, and revoked by the backend.</p></div><div className="space-y-3">{applications.map((application) => <Card key={application.id} className="rounded-2xl p-4 sm:p-5"><div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-center"><div className="flex gap-3"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">{application.role === 'agent' ? <UserCheck size={18} /> : <Building2 size={18} />}</span><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><p className="font-semibold">{application.companyName ?? application.contactName}</p><Badge variant={application.status === 'approved' ? 'success' : application.status === 'rejected' ? 'destructive' : 'outline'} className="capitalize">{application.status}</Badge></div><p className="mt-1 text-xs text-muted-foreground">{application.contactName} · {application.city}, China · {application.email}</p><p className="mt-2 line-clamp-2 text-xs leading-5 text-muted-foreground">{application.experience}</p><div className="mt-2 flex flex-wrap gap-1">{application.services.map((service) => <Badge key={service} variant="secondary">{service}</Badge>)}</div></div></div><div className="flex flex-wrap gap-2 lg:justify-end">{application.status === 'pending' ? <><Button size="sm" variant="outline" className="rounded-full text-destructive" onClick={() => review(application.id, 'rejected')}><X size={14} /> Reject</Button><Button size="sm" className="rounded-full" onClick={() => review(application.id, 'approved')}><Check size={14} /> Approve and invite</Button></> : application.inviteCode ? <Button size="sm" variant="outline" className="rounded-full" onClick={() => void copyCode(application)}><ClipboardCopy size={14} /> {application.inviteCode}</Button> : null}</div></div></Card>)}</div></section></div></DashboardLayout>;
}

function Metric({ icon: Icon, label, value }: { icon: typeof BadgeCheck; label: string; value: number }) {
  return <Card className="rounded-2xl p-4"><Icon size={17} className="text-primary" /><p className="mt-3 text-2xl font-bold">{value}</p><p className="text-[11px] text-muted-foreground">{label}</p></Card>;
}
