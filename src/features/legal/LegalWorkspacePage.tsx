import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { toast } from 'sonner';
import { DashboardLayout } from '../../components/pieces/dashboard/DashboardLayout';
import { Button } from '../../components/ui/button';
import { Textarea } from '../../components/ui/textarea';
import { Card } from '../../components/ui/card';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '../../components/ui/dialog';
import { useAuthStore } from '../../libs/store/auth.store';
import { hasLegalWorkspace, legalApi } from './legal.api';
import { useLegalRefresh } from './hooks';
import type { LegalDocument } from './types';

export default function LegalWorkspacePage() {
  const refresh = useLegalRefresh();
  const user = useAuthStore(s => s.user);
  const [selected, setSelected] = useState('');
  const [text, setText] = useState('');
  const [document, setDocument] = useState<LegalDocument>();
  useEffect(() => { setDocument(undefined); setText(''); }, [selected, user?.id]);
  let view: ReturnType<typeof legalApi.reviewerView> | undefined;
  try { if (selected) view = legalApi.reviewerView(selected); } catch { /* Revoked and unpaid assignments intentionally have no content. */ }
  const canView = !!view;
  useEffect(() => { if (!canView) setDocument(undefined); }, [refresh, canView]);
  if (!hasLegalWorkspace(user)) return <Navigate to="/app" replace />;
  const assignments = legalApi.assignments();
  return <DashboardLayout title="Legal reviews"><div className="space-y-5"><header><h1 className="text-2xl font-semibold">Legal reviews</h1><p className="mt-2 text-sm text-muted-foreground">Assigned matters for your account. Agreements and documents from your assigned rooms, with new uploads available automatically.</p></header>
    <div className="grid gap-4 lg:grid-cols-[280px_1fr]"><div className="space-y-3">{assignments.length === 0 && <p>No assigned reviews yet.</p>}{assignments.map(a => <button key={a.dealId} onClick={() => setSelected(a.dealId)} className={`w-full rounded-xl border p-4 text-left ${selected === a.dealId ? 'border-primary bg-primary/5' : 'bg-card'}`}><strong className="block">{a.title}</strong><span className="text-xs">{a.reference} · {a.status}</span></button>)}</div>
    <Card className="space-y-4 p-5">{!view ? <p className="text-sm">{selected ? 'Documents are unavailable until both parties approve and the fee is paid. Deactivated or restricted matters cannot be viewed.' : 'Select an assignment to review.'}</p> : <><h2 className="font-semibold">{view.title}</h2><p className="text-sm">{view.purpose}</p><div className="flex flex-wrap gap-2">{view.documents.map(d => <Button key={d.id} variant="outline" onClick={async () => { try { setDocument(await legalApi.document(selected, d.id, view!.version)); } catch (e) { toast.error((e as Error).message); } }}>{d.name}</Button>)}</div>{view.requests.map((r, i) => <p key={i} className="rounded-md bg-muted p-3 text-sm">Request: {r.text}</p>)}{view.findings.map((f, i) => <p key={i} className="whitespace-pre-wrap rounded-md border p-3 text-sm">{f.text}</p>)}<Textarea aria-label="Legal findings" value={text} maxLength={10000} onChange={e => setText(e.target.value)} placeholder="Record your findings for both deal parties" /><Button disabled={!text.trim()} onClick={() => { try { legalApi.finding(selected, view!.version, text); setText(''); } catch (e) { toast.error((e as Error).message); } }}>Submit findings</Button><p className="text-xs text-muted-foreground">Findings do not certify authenticity or change payment release or dispute decisions.</p></>}</Card></div>
    <Dialog open={!!document && !!view} onOpenChange={o => !o && setDocument(undefined)}><DialogContent className="max-h-[85vh] overflow-y-auto"><DialogTitle>{document?.name}</DialogTitle><DialogDescription>Document version {document?.version}. Viewing is recorded.</DialogDescription>{document?.text && <p className="whitespace-pre-wrap text-sm">{document.text}</p>}{document?.fileUrl && /^(data:(application\/pdf|image\/(jpeg|png|webp)|video\/(mp4|quicktime|webm));base64,|blob:)/.test(document.fileUrl) && <a href={document.fileUrl} download={document.name} className="text-primary underline">Open approved file</a>}{!document?.text && !document?.fileUrl && <p>This sample document has no file attached.</p>}</DialogContent></Dialog>
  </div></DashboardLayout>;
}
