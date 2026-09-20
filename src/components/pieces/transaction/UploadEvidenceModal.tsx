import { prepareEvidenceFile, fileDataUrl, formatFileSize, MAX_EVIDENCE_BATCH_BYTES } from '../../../libs/protected-deals/evidence-files';
/**
 * UploadEvidenceModal
 * Attach evidence to a deal: invoices, waybills, photos, inspection reports.
 * Pick a kind, choose one or more files, add an optional note. In mock mode
 * data URLs keep evidence available after reloading the preview.
 */

import { appConfig } from '../../../configs/env';
import { useEffect, useRef, useState } from 'react';
import { FileText, Loader2, Upload, X } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../../ui/dialog';
import { Button } from '../../ui/button';
import { Label } from '../../ui/label';
import { Textarea } from '../../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import {
  DEAL_EVIDENCE_ACCEPT,
  DEAL_EVIDENCE_FORMATS,
  DEAL_EVIDENCE_KINDS,
} from '../../../libs/protected-deals/evidence';

interface UploadEvidenceModalProps {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  submitting?: boolean;
  initialKind?: string;
  onSubmit: (input: { items: { fileName: string; kind: string; note?: string; fileUrl?: string; mimeType?: string; sizeBytes?: number; originalSizeBytes?: number; notApplicable?: boolean }[] }) => void;
}

export function UploadEvidenceModal({ open, onOpenChange, submitting, initialKind = 'Invoice', onSubmit }: UploadEvidenceModalProps) {
  const [kind, setKind] = useState(initialKind);
  const evidenceKinds = Array.from(new Set([initialKind, ...DEAL_EVIDENCE_KINDS]));
  const [files, setFiles] = useState<Array<{ fileName: string; fileUrl: string; mimeType: string; sizeBytes: number; originalSizeBytes: number }>>([]);
  const [note, setNote] = useState('');
  const [fileError, setFileError] = useState('');
  const [readingFiles, setReadingFiles] = useState(false);
  const readGeneration = useRef(0);
  const fileRef = useRef<HTMLInputElement>(null);

  const reset = () => {
    readGeneration.current += 1;
    setReadingFiles(false);
    setKind(initialKind);
    files.forEach(f => { if (f.fileUrl.startsWith("blob:")) URL.revokeObjectURL(f.fileUrl); });
    setFiles([]);
    setNote('');
    setFileError('');
  };

  useEffect(() => {
    if (open) setKind(initialKind);
    else {
      readGeneration.current += 1;
      setReadingFiles(false);
      setFiles([]);
      setNote('');
      setFileError('');
    }
  }, [initialKind, open]);

  const submit = () => {
    if (files.length === 0) return;
    onSubmit({ items: files.map((file) => ({ ...file, kind, note: note.trim() || undefined })) });
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        onOpenChange(o);
        if (!o) reset();
      }}
    >
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Upload evidence</DialogTitle>
          <DialogDescription>Attach evidence to this deal for authorised participants to review. This upload will be saved as <strong>{kind}</strong>.</DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <div>
            <Label>Type</Label>
            <Select value={kind} onValueChange={setKind}>
              <SelectTrigger className="mt-1.5 w-full"><SelectValue placeholder="Choose evidence type" /></SelectTrigger>
              <SelectContent>{evidenceKinds.map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}</SelectContent>
            </Select>
          </div>

          <div>
            <Label>Files</Label>
            <p className="mt-1 text-xs text-muted-foreground">Up to 3 files, 2 MB each after preparation, 4 MB total. Photos are resized to at most 2,000 pixels and compressed when smaller. PDFs and videos are kept unchanged.</p>
            {fileError && <p role="alert" className="mt-2 text-xs text-destructive">{fileError}</p>}
            <input
              ref={fileRef}
              type="file"
              accept={DEAL_EVIDENCE_ACCEPT}
              multiple
              className="hidden"
              onChange={async (e) => {
                const selected = Array.from(e.target.files ?? []);
                e.currentTarget.value = '';
                if (readingFiles) return;
                if (files.length + selected.length > 3) { setFileError('Upload up to 3 files at a time.'); return; }
                const generation = ++readGeneration.current;
                setReadingFiles(true); setFileError('');
                try {
                  const prepared = [];
                  for (const file of selected) prepared.push(await prepareEvidenceFile(file));
                  if (prepared.reduce((n, p) => n + p.file.size, 0) + files.reduce((n, f) => n + f.sizeBytes, 0) > MAX_EVIDENCE_BATCH_BYTES) throw new Error('Selected files exceed the 4 MB total limit.');
                  const incoming = await Promise.all(prepared.map(async ({ file, originalSizeBytes }) => ({ fileName: file.name, mimeType: file.type, sizeBytes: file.size, originalSizeBytes, fileUrl: await fileDataUrl(file) })));
                  if (generation === readGeneration.current) setFiles(previous => [...previous, ...incoming]);
                } catch (error) { if (generation === readGeneration.current) setFileError(error instanceof Error ? error.message : 'Could not prepare file.'); }
                finally { if (generation === readGeneration.current) setReadingFiles(false); }
              }}
            />
            {files.length > 0 && (
              <ul className="mt-1.5 space-y-1.5">
                {files.map((file, i) => (
                  <li key={`${file.fileName}-${i}`} className="flex items-center gap-2 rounded-lg border bg-muted/40 px-3 py-2">
                    <FileText size={16} className="shrink-0 text-primary" />
                    <div className="min-w-0 flex-1"><span className="block truncate text-sm text-foreground">{file.fileName}</span><span className="text-xs text-muted-foreground">{formatFileSize(file.sizeBytes)}{file.sizeBytes < file.originalSizeBytes && ` · reduced from ${formatFileSize(file.originalSizeBytes)}`}</span></div>
                    <button
                      type="button"
                      aria-label="Remove file"
                      onClick={() => {
                        URL.revokeObjectURL(file.fileUrl);
                        setFiles((prev) => prev.filter((_, idx) => idx !== i));
                      }}
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
              disabled={readingFiles || submitting || files.length >= 3}
              onClick={() => fileRef.current?.click()}
              className="mt-1.5 flex w-full items-center gap-3 rounded-xl border border-dashed p-3 text-left transition-colors hover:bg-accent/40"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Upload size={18} />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">
                  {files.length === 0 ? 'Choose files' : 'Add more files'}
                </p>
                <p className="text-xs text-muted-foreground">{DEAL_EVIDENCE_FORMATS}</p>
              </div>
            </button>
          </div>

          <p className="text-xs text-muted-foreground" aria-live="polite">{readingFiles ? "Preparing files…" : `Total upload: ${formatFileSize(files.reduce((total, file) => total + file.sizeBytes, 0))} / 4 MB`}</p>
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
            <Button variant="ghost" className="rounded-md" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button className="rounded-md" onClick={submit} disabled={submitting || readingFiles || files.length === 0}>
              {submitting ? <Loader2 size={16} className="mr-1.5 animate-spin" /> : <Upload size={16} className="mr-1.5" />}
              Upload {files.length > 0 ? `(${files.length})` : ''}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
