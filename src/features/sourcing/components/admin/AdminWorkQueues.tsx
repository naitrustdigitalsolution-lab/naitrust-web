import { AlertCircle, Boxes, CheckCircle2, ClipboardCheck, MapPin, ShieldCheck } from 'lucide-react';
import { adminApi } from '../../api/admin.api';
import { Badge } from '../../../../components/ui/badge';
import { Card } from '../../../../components/ui/card';

export function SourcingQueue() {
  const requests = adminApi.database().sourcingRequests;
  return <div className="space-y-3">{requests.map((request) => <Card key={request.id} className="rounded-2xl p-5"><div className="flex flex-wrap items-start justify-between gap-3"><div><h2 className="font-semibold">{request.title}</h2><p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground"><MapPin size={12} /> {request.supplierCity}, China · {request.quantity.toLocaleString()} units</p></div><Badge className="capitalize">{request.status.replace(/_/g, ' ')}</Badge></div><div className="mt-4 flex flex-wrap gap-1">{request.extractedFields.map((field) => <Badge key={field.key} variant="secondary">{field.label}: {field.value}</Badge>)}</div>{request.missingFields.length > 0 && <p className="mt-3 flex items-center gap-2 text-xs text-amber-700"><AlertCircle size={14} /> Missing: {request.missingFields.join(', ')}</p>}</Card>)}</div>;
}

export function ReleaseQueue() {
  const assignments = adminApi.database().assignments;
  const recommendations = assignments.flatMap((assignment) => assignment.certifications.map((certificate) => ({ assignment, certificate, milestone: assignment.milestones.find((item) => item.id === certificate.milestoneId) })));
  return <div className="space-y-3">{recommendations.map(({ assignment, certificate, milestone }) => <Card key={certificate.id} className="rounded-2xl p-5"><div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-xs text-muted-foreground">{assignment.supplierName}</p><h2 className="mt-1 font-semibold">{milestone?.label}</h2></div><Badge variant={certificate.status === 'approved' ? 'success' : 'outline'} className="capitalize">{certificate.status.replace(/_/g, ' ')}</Badge></div><p className="mt-3 text-xs leading-5 text-muted-foreground">{certificate.declaration}</p><div className="mt-3 flex flex-wrap gap-1">{certificate.checks.map((check) => <Badge key={check} variant="secondary"><CheckCircle2 size={11} /> {check}</Badge>)}</div><p className="mt-4 flex items-center gap-2 border-t pt-3 text-[10px] text-muted-foreground"><ShieldCheck size={12} /> Agent recommendation cannot settle money. Buyer approval and provider confirmation remain required.</p></Card>)}</div>;
}

export function ShipmentQueue() {
  const shipments = adminApi.database().shipments;
  return <div className="space-y-3">{shipments.map((shipment) => <Card key={shipment.id} className="rounded-2xl p-5"><div className="flex flex-wrap items-start justify-between gap-3"><div><h2 className="font-semibold">{shipment.name}</h2><p className="mt-1 text-xs text-muted-foreground">{shipment.reference} · {shipment.destination}</p></div><Badge className="capitalize">{shipment.status.replace(/_/g, ' ')}</Badge></div><div className="mt-4 grid gap-2 sm:grid-cols-2">{shipment.orders.map((order) => <div key={order.orderId} className="flex items-center justify-between rounded-xl bg-muted/55 p-3 text-xs"><span><strong className="block">{order.supplierName}</strong>{order.packageCount} cartons · {order.weightKg} kg</span><Badge variant={order.ready ? 'success' : 'outline'}>{order.ready ? 'Ready' : 'Waiting'}</Badge></div>)}</div><p className="mt-4 flex items-center gap-2 text-xs text-muted-foreground"><Boxes size={14} /> {shipment.quotes.length} logistics quotes</p></Card>)}</div>;
}

export function LedgerQueue() {
  const entries = adminApi.database().ledgerEntries;
  return <Card className="overflow-hidden rounded-3xl"><div className="overflow-x-auto"><table className="w-full min-w-[46rem] text-left text-sm"><thead className="bg-muted/60 text-xs text-muted-foreground"><tr><th className="px-4 py-3">Activity</th><th className="px-4 py-3">Order</th><th className="px-4 py-3">Amount</th><th className="px-4 py-3">Provider reference</th><th className="px-4 py-3">Status</th></tr></thead><tbody className="divide-y">{entries.map((entry) => <tr key={entry.id}><td className="px-4 py-3 font-medium">{entry.label}</td><td className="px-4 py-3 text-xs text-muted-foreground">{entry.orderId}</td><td className="px-4 py-3 font-semibold">{new Intl.NumberFormat(entry.currency === 'NGN' ? 'en-NG' : 'en-US', { style: 'currency', currency: entry.currency, maximumFractionDigits: entry.currency === 'NGN' ? 0 : 2 }).format(entry.amountMinor / 100)}</td><td className="px-4 py-3 text-xs text-muted-foreground">{entry.providerReference ?? 'Internal allocation'}</td><td className="px-4 py-3"><Badge variant={entry.status === 'confirmed' ? 'success' : 'outline'} className="capitalize">{entry.status}</Badge></td></tr>)}</tbody></table></div></Card>;
}
