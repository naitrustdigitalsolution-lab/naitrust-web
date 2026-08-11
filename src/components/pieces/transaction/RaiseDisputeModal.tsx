/**
 * RaiseDisputeModal
 * Open a structured dispute on a deal: pick a reason, describe the issue.
 * Opening pauses release and starts an evidence-based admin review.
 */

import { useRef, useState } from 'react';
import { FileText, Loader2, ShieldAlert, Upload, X } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../../ui/dialog';
import { Button } from '../../ui/button';
import { Label } from '../../ui/label';
import { Textarea } from '../../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { DEAL_EVIDENCE_ACCEPT, DEAL_EVIDENCE_FORMATS } from '../../../libs/protected-deals/evidence';

interface DisputeEvidenceUpload {
  fileName: string;
  fileUrl: string;
  mimeType: string;
  kind: 'Buyer problem evidence';
}

const REASONS = [
  'Damaged in transit',
  'Wrong item',
  'Defective item',
  'Missing contents',
  'Tampered packaging',
  'Non-delivery',
  'Missed deal milestone',
  'Other',
];

interface RaiseDisputeModalProps {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  submitting?: boolean;
  onSubmit: (input: { reason: string; description: string; evidence: DisputeEvidenceUpload[] }) => void;
}

export function RaiseDisputeModal({ open, onOpenChange, submitting, onSubmit }: RaiseDisputeModalProps) {
  const [reason, setReason] = useState('');
  const [description, setDescription] = useState('');
  const [evidence, setEvidence] = useState<DisputeEvidenceUpload[]>([]);
  const [error, setError] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const reset = () => {
    setReason('');
    setDescription('');
    setEvidence([]);
    setError('');
  };

  const submit = () => {
    if (!reason) {
      setError('Choose a reason.');
      return;
    }
    if (!description.trim()) {
      setError('Describe the issue so we can review it.');
      return;
    }
    onSubmit({ reason, description: description.trim(), evidence });
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        onOpenChange(o);
        if (!o) reset();
      }}
    >
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShieldAlert size={18} className="text-destructive" />
            Raise a dispute
          </DialogTitle>
          <DialogDescription>
            A report with relevant evidence pauses automatic release while our team reviews the
            information from both parties. A report without evidence does not freeze payment yet.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <div>
            <Label htmlFor="dispute-reason">Reason</Label>
            <Select value={reason} onValueChange={(value) => { setReason(value); setError(''); }}>
              <SelectTrigger id="dispute-reason" className="mt-1.5 w-full">
                <SelectValue placeholder="Choose a reason for the dispute" />
              </SelectTrigger>
              <SelectContent>
                {REASONS.map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="dispute-desc">What happened?</Label>
            <Textarea
              id="dispute-desc"
              className="mt-1.5"
              rows={4}
              placeholder="Explain the issue and what the attached evidence shows."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div>
            <Label>Dispute evidence (recommended)</Label>
            <input
              ref={fileRef}
              type="file"
              accept={DEAL_EVIDENCE_ACCEPT}
              multiple
              className="hidden"
              onChange={(event) => {
                const incoming = Array.from(event.target.files ?? []).map((file) => ({
                  fileName: file.name,
                  fileUrl: URL.createObjectURL(file),
                  mimeType: file.type || 'application/octet-stream',
                  kind: 'Buyer problem evidence' as const,
                }));
                setEvidence((current) => [...current, ...incoming]);
                event.currentTarget.value = '';
                setError('');
              }}
            />
            {evidence.map((item, index) => (
              <div key={`${item.fileName}-${index}`} className="mt-2 flex items-center gap-2 rounded-lg border px-3 py-2 text-sm">
                <FileText size={15} className="shrink-0 text-primary" />
                <span className="min-w-0 flex-1 truncate">{item.fileName}</span>
                <button type="button" aria-label={`Remove ${item.fileName}`} onClick={() => {
                  URL.revokeObjectURL(item.fileUrl);
                  setEvidence((current) => current.filter((_, itemIndex) => itemIndex !== index));
                }}><X size={15} /></button>
              </div>
            ))}
            <Button type="button" variant="outline" className="mt-2 w-full rounded-xl" onClick={() => fileRef.current?.click()}>
              <Upload size={15} /> {evidence.length ? 'Add more evidence' : 'Attach evidence'}
            </Button>
            <p className="mt-1 text-[11px] text-muted-foreground">{DEAL_EVIDENCE_FORMATS}</p>
          </div>

          {error && <p className="text-xs text-destructive">{error}</p>}

          <div className="rounded-xl border bg-muted/30 p-3 text-xs leading-5 text-muted-foreground">
            You may open the report without evidence, but payment will not freeze until evidence is uploaded. Insufficient evidence may affect the final decision.
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="ghost" className="rounded-md" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              className="rounded-md bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={submit}
              disabled={submitting}
            >
              {submitting ? <Loader2 size={16} className="mr-1.5 animate-spin" /> : <ShieldAlert size={16} className="mr-1.5" />}
              Open dispute
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
