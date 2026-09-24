import { useState } from 'react';
import { Navigate, NavLink, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { DashboardLayout } from '../pieces/dashboard/DashboardLayout';
import { useAuth } from '../../libs/auth-context';
import { appConfig } from '../../configs/env';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Card } from '../ui/card';
import { legalAdminApi, legalRate, legalStatus } from '../../features/legal/legal.api';
import { useLegalRefresh } from '../../features/legal/hooks';
import { formatMinorAmount } from '../../libs/utils/safe-deal-presentation';

const ADMIN_SECTIONS = { overview: 'Overview', accounts: 'Accounts & businesses', deals: 'Protected deals', disputes: 'Disputes', payments: 'Payments', legal: 'Legal providers', assignments: 'Legal assignments', settings: 'Settings', audit: 'Audit history' };
export type AdminSection = keyof typeof ADMIN_SECTIONS;
function run(fn: () => void) { try { fn(); toast.success('Saved locally.'); } catch (e) { toast.error((e as Error).message); } }
function CaseEditor({ id }: { id: string }) {
  const c = legalAdminApi.case(id);
  const [assignee, setAssignee] = useState(c.assignedTo ?? '');
  const [note, setNote] = useState('');
  return <details className="mt-3 text-sm"><summary>Case notes and assignment</summary><div className="mt-3 space-y-3"><label className="block">Assigned administrator<select aria-label="Assigned administrator" className="ml-2 rounded border p-2" value={assignee} onChange={e => setAssignee(e.target.value)}><option value="">Unassigned</option>{legalAdminApi.accounts().filter(a => a.role === 'admin' && !a.suspended).map(a => <option key={a.id} value={a.id}>{a.name}</option>)}</select></label>{c.notes.map((n, i) => <p key={i} className="rounded bg-muted p-2">{n.text}<small className="block">{new Date(n.at).toLocaleString()}</small></p>)}<Textarea aria-label="Administrative case note" value={note} maxLength={4000} onChange={e => setNote(e.target.value)} placeholder="Internal case note"/><Button size="sm" onClick={() => run(() => { legalAdminApi.updateCase(id, assignee, note); setNote(''); })}>Save case update</Button></div></details>;
}
function AdminContent({ section }: { section: AdminSection }) {
  useLegalRefresh();
  const [search, setSearch] = useState('');
  const [rate, setRate] = useState(legalRate() === null ? '' : String(legalRate()! / 100));
  const accounts = legalAdminApi.accounts();
  const deals = legalAdminApi.deals();
  const providers = legalAdminApi.providers().sort((a,b) => Number(b.enabled) - Number(a.enabled) || a.name.localeCompare(b.name));
  const proposals = legalAdminApi.proposals();
  const match = (value: string) => value.toLowerCase().includes(search.toLowerCase());
  return <div className="space-y-4">
    {['accounts', 'deals', 'disputes', 'legal', 'assignments'].includes(section) && <Input aria-label="Search admin records" placeholder="Search by name, email or reference" value={search} onChange={e => setSearch(e.target.value)} />}
    {section === 'overview' && <><div className="grid gap-4 sm:grid-cols-3">{[['Accounts', accounts.length], ['Open deals', deals.filter(d => !['completed','paid_out','refunded','cancelled'].includes(d.status)).length], ['Legal assignments', proposals.filter(p => p.assignedAt).length]].map(([label, count]) => <Card key={label} className="p-5"><p className="text-sm">{label}</p><strong className="text-3xl">{count}</strong></Card>)}</div><Card className="p-5"><h2 className="font-semibold">Protected deal administration</h2><p className="mt-2 text-sm text-muted-foreground">Manage accounts, legal eligibility, deal oversight, dispute casework and legal pricing. Payment records are read only. Administrative actions do not directly move funds or change release deadlines.</p></Card></>}
    {section === 'accounts' && accounts.filter(a => match(`${a.name} ${a.email} ${a.businesses.map(b => b.name).join(' ')}`)).map(a => <Card key={a.id} className="p-4"><div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="font-semibold">{a.name}</h2><p className="text-sm">{a.email} · {a.role} · {a.suspended ? 'Suspended' : 'Active'}</p>{a.businesses.map(b => <p key={b.id} className="text-sm text-muted-foreground">{b.name}</p>)}</div>{a.role !== 'admin' && <Button variant="outline" onClick={() => run(() => legalAdminApi.suspend(a.id, !a.suspended))}>{a.suspended ? 'Restore account' : 'Suspend account'}</Button>}</div></Card>)}
    {(section === 'deals' || section === 'disputes') && deals.filter(d => (section !== 'disputes' || d.status === 'disputed') && match(`${d.title} ${d.reference}`)).map(d => <Card key={d.id} className="p-4"><h2 className="font-semibold">{d.title}</h2><p className="mt-1 text-sm">{d.reference} · {d.status.replace(/_/g,' ')} · {formatMinorAmount(d.amountMinor,d.currency)}</p><CaseEditor id={d.id}/></Card>)}
    {section === 'legal' && <><p className="text-sm text-muted-foreground">Only Naitrust admins can enable lawyer access. For businesses, access belongs to the owner account. Enabling access does not grant administrative or payment permissions.</p>{providers.filter(p => match(p.name)).map(p => <Card key={p.id} className="flex flex-row flex-wrap items-center justify-between gap-3 p-4 text-left"><div><h2 className="font-semibold">{p.name}</h2><p className="text-sm">{p.kind === 'business' ? (p.enabled ? 'Law firm' : 'Business account') : (p.enabled ? 'Individual lawyer' : 'Individual account')} · {p.enabled ? 'Approved' : 'Not enabled'}</p></div><Button variant="outline" onClick={() => run(() => legalAdminApi.setProvider(p.id,!p.enabled))}>{p.enabled ? 'Revoke lawyer flag' : 'Enable lawyer flag'}</Button></Card>)}</>}
    {section === 'assignments' && <>{proposals.filter(p => match(`${p.title} ${p.reference} ${p.provider.name}`)).map(p => <Card key={p.dealId} className="p-4"><h2 className="font-semibold">{p.title}</h2><p className="text-sm">{p.provider.name} · {legalStatus(p)} · {p.fee.rateBps/100}%</p><p className="mt-2 text-xs">Paid reviewer replacements require a case review. No automated replacement, recharge or refund is performed.</p><CaseEditor id={p.dealId}/></Card>)}{!proposals.length && <p>No legal proposals yet.</p>}</>}
    {section === 'payments' && <><p className="text-sm text-muted-foreground">Local funding records are not provider confirmed transfers. Protected principal and legal fees are separate.</p><div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead><tr><th className="p-3">Deal</th><th>Principal</th><th>State</th><th>Legal fee</th></tr></thead><tbody>{deals.map(d => { const p = proposals.find(p => p.dealId === d.id); return <tr key={d.id} className="border-t"><td className="p-3">{d.reference}</td><td>{formatMinorAmount(d.amountMinor,d.currency)}</td><td>{d.status.replace(/_/g,' ')}</td><td>{p ? `${formatMinorAmount(p.fee.amountMinor,p.fee.currency)} · ${p.fee.payment ? 'Payment unconfirmed' : 'Unpaid'}` : '—'}</td></tr>; })}</tbody></table></div></>}
    {section === 'settings' && <Card className="max-w-lg space-y-4 p-5"><h2 className="font-semibold">Legal review pricing</h2><p className="text-sm">{legalRate() === null ? 'Not configured. Legal proposals cannot be sent.' : `Current additional fee: ${legalRate()! / 100}% of the deal principal.`} The deal payer pays this fee. Approved quotes retain their original rate.</p><label className="block text-sm">Additional legal fee (%)<Input aria-label="Additional legal fee (%)" type="number" min="0" max="100" step="0.01" value={rate} onChange={e => setRate(e.target.value)}/></label><Button onClick={() => run(() => { if (!/^\d+(\.\d{1,2})?$/.test(rate)) throw new Error('Enter a percentage with up to two decimal places.'); legalAdminApi.setRate(Math.round(Number(rate)*100)); })}>Save legal percentage</Button><p className="text-xs text-muted-foreground">Other platform features remain unchanged. Legal services, fee collection and insurance are unavailable until connected and approved.</p></Card>}
    {section === 'audit' && <div className="space-y-2">{legalAdminApi.audit().map(e => <Card key={e.id} className="p-4"><strong className="text-sm">{e.action}</strong><p className="text-xs">{e.target} · {e.actorUserId} · {new Date(e.at).toLocaleString()}</p></Card>)}{!legalAdminApi.audit().length && <p>No administrative changes recorded yet.</p>}</div>}
  </div>;
}
export function AdminPortalPage() {
  const { user } = useAuth(); const { section = 'overview' } = useParams();
  if (user?.role !== 'admin') return <Navigate to="/app" replace />;
  const current = (section in ADMIN_SECTIONS ? section : 'overview') as AdminSection;
  return <DashboardLayout title="Naitrust administration"><div className="space-y-5"><header><h1 className="text-2xl font-semibold">{ADMIN_SECTIONS[current]}</h1><p className="mt-2 text-sm text-muted-foreground">Naitrust protected deal operations · Local administration</p></header><nav aria-label="Administration sections" className="flex flex-wrap gap-2">{Object.entries(ADMIN_SECTIONS).map(([id,label]) => <NavLink key={id} to={`/app/admin/${id}`} className={`rounded-full border px-3 py-2 text-xs ${current===id?'bg-primary text-primary-foreground':'bg-card'}`}>{label}</NavLink>)}</nav>{appConfig.isMock ? <AdminContent key={current} section={current}/> : <p>Administration requires connected backend services.</p>}</div></DashboardLayout>;
}
