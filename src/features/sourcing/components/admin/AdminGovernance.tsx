import { Check, ShieldAlert, UserRoundSearch } from 'lucide-react';
import { toast } from 'sonner';
import { adminApi } from '../../api/admin.api';
import { Badge } from '../../../../components/ui/badge';
import { Button } from '../../../../components/ui/button';
import { Card } from '../../../../components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../../components/ui/select';

export function ModerationSection() {
  const cases = adminApi.database().moderationCases;
  return <div className="space-y-3">{cases.map((item) => <Card key={item.id} className="rounded-2xl p-5"><div className="flex items-start gap-3"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-amber-700"><ShieldAlert size={17} /></span><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><p className="font-semibold">{item.reason}</p><Badge variant="outline" className="capitalize">{item.status}</Badge></div><p className="mt-2 rounded-xl bg-muted/55 p-3 text-xs text-muted-foreground">{item.excerpt}</p>{item.status === 'open' && <div className="mt-3 flex gap-2"><Button size="sm" variant="outline" className="rounded-full" onClick={() => { adminApi.resolveModeration(item.id, 'cleared'); toast.success('Case cleared.'); }}><Check size={13} /> Clear</Button><Button size="sm" className="rounded-full" onClick={() => { adminApi.resolveModeration(item.id, 'actioned'); toast.success('Moderation action recorded.'); }}>Take action</Button></div>}</div></div></Card>)}</div>;
}

export function LeadsSection() {
  const leads = adminApi.database().waitlistLeads;
  return <div className="space-y-3">{leads.map((lead) => <Card key={lead.id} className="rounded-2xl p-5"><div className="grid gap-4 sm:grid-cols-[1fr_11rem] sm:items-center"><div className="flex gap-3"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary"><UserRoundSearch size={17} /></span><div><h2 className="font-semibold">{lead.fullName}</h2><p className="mt-1 text-xs text-muted-foreground">{lead.businessName ?? 'Individual buyer'} · {lead.email}</p><div className="mt-2 flex flex-wrap gap-1">{lead.needs.map((item) => <Badge key={item} variant="secondary">{item}</Badge>)}</div></div></div><Select value={lead.status} onValueChange={(value) => { adminApi.updateLeadStatus(lead.id, value as typeof lead.status); toast.success('Lead status updated.'); }}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{['new', 'contacted', 'qualified', 'invited', 'closed'].map((status) => <SelectItem key={status} value={status} className="capitalize">{status}</SelectItem>)}</SelectContent></Select></div></Card>)}</div>;
}

export function AuditSection() {
  const events = adminApi.database().auditEvents;
  return <Card className="rounded-3xl p-5"><div className="space-y-4">{events.map((event) => <div key={event.id} className="flex gap-3 border-b pb-4 last:border-0 last:pb-0"><span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-primary" /><div><p className="text-sm font-medium">{event.summary}</p><p className="mt-1 text-[10px] text-muted-foreground">{event.action} · {event.entityType} · {event.actorUserId} · {new Date(event.createdAt).toLocaleString()}</p></div></div>)}{events.length === 0 && <p className="py-8 text-center text-sm text-muted-foreground">Admin actions will appear here.</p>}</div></Card>;
}
