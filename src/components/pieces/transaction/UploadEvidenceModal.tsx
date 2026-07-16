/**
 * UploadEvidenceModal
 * Attach evidence to a deal — invoices, waybills, photos, inspection reports.
 * Pick a kind, choose one or more files, add an optional note. In mock mode
 * only the file names are recorded; production uploads the files.
 */

import { useRef, useState } from 'react';
import { FileText, Loader2, Upload, X } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../../ui/dialog';
import { Button } from '../../ui/button';
import { Label } from '../../ui/label';
import { Textarea } from '../../ui/textarea';

const KINDS = ['Invoice', 'Waybill', 'Photo', 'Inspection report', 'Receipt', 'Other'];

interface UploadEvidenceModalProps {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  submitting?: boolean;
  onSubmit: (input: { items: { fileName: string; kind: string; note?: string }[] }) => void;
}

export function UploadEvidenceModal({ open, onOpenChange, submitting, onSubmit }: UploadEvidenceModalProps) {
  const [kind, setKind] = useState('Invoice');
  const [names, setNames] = useState<string[]>([]);
  const [note, setNote] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const reset = () => {
    setKind('Invoice');
    setNames([]);
    setNote('');
  };

  const submit = () => {
    if (names.length === 0) return;
    onSubmit({ items: names.map((fileName) => ({ fileName, kind, note: note.trim() || undefined })) });
    reset();
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        onOpenChange(o);
        if (!o) reset();
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Upload evidence</DialogTitle>
          <DialogDescription>Attach proof to this deal for both parties to see.</DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <div>
            <Label>Type</Label>
            <div className="mt-1.5 flex flex-wrap gap-2">
              {KINDS.map((k) => (
                <button
                  key={k}
                  type="button"
                  onClick={() => setKind(k)}
                  className={
                    'rounded-full border px-3 py-1 text-sm transition-colors ' +
                    (kind === k
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-border text-muted-foreground hover:bg-accent/40')
                  }
                >
                  {k}
                </button>
              ))}
            </div>
          </div>

          <div>
            <Label>Files</Label>
            <input
              ref={fileRef}
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              multiple
              className="hidden"
              onChange={(e) => {
                const incoming = Array.from(e.target.files ?? []).map((f) => f.name);
                setNames((prev) => [...prev, ...incoming]);
                e.currentTarget.value = '';
              }}
            />
            {names.length > 0 && (
              <ul className="mt-1.5 space-y-1.5">
                {names.map((n, i) => (
                  <li key={`${n}-${i}`} className="flex items-center gap-2 rounded-lg border bg-muted/40 px-3 py-2">
                    <FileText size={16} className="shrink-0 text-primary" />
                    <span className="min-w-0 flex-1 truncate text-sm text-foreground">{n}</span>
                    <button
                      type="button"
                      aria-label="Remove file"
                      onClick={() => setNames((prev) => prev.filter((_, idx) => idx !== i))}
                      className="text-muted-foreground transition-colors hover:text-destructive"
                    >
                      <X size={15} />
                    </button>
                  </li>
                ))}
              </ul>
            )}
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="mt-1.5 flex w-full items-center gap-3 rounded-xl border border-dashed p-3 text-left transition-colors hover:bg-accent/40"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Upload size={18} />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">
                  {names.length === 0 ? 'Choose files' : 'Add more files'}
                </p>
                <p className="text-xs text-muted-foreground">PDF, JPG or PNG</p>
              </div>
            </button>
          </div>

          <div>
            <Label htmlFor="ev-note">Note (optional)</Label>
            <Textarea
              id="ev-note"
              className="mt-1.5"
              rows={2}
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="ghost" className="rounded-full" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button className="rounded-full" onClick={submit} disabled={names.length === 0 || submitting}>
              {submitting ? <Loader2 size={16} className="mr-1.5 animate-spin" /> : <Upload size={16} className="mr-1.5" />}
              Upload {names.length > 0 ? `(${names.length})` : ''}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
