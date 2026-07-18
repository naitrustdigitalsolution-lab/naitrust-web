/**
 * RaiseDisputeModal
 * Open a structured dispute on a deal: pick a reason, describe the issue.
 * Opening pauses release and starts an evidence-based admin review.
 */

import { useState } from 'react';
import { Loader2, ShieldAlert } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../../ui/dialog';
import { Button } from '../../ui/button';
import { Label } from '../../ui/label';
import { Textarea } from '../../ui/textarea';

const REASONS = [
  'Item not as described',
  'Not delivered',
  'Damaged on arrival',
  'Wrong quantity',
  'Missed property milestone',
  'Other',
];

interface RaiseDisputeModalProps {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  submitting?: boolean;
  onSubmit: (input: { reason: string; description: string }) => void;
}

export function RaiseDisputeModal({ open, onOpenChange, submitting, onSubmit }: RaiseDisputeModalProps) {
  const [reason, setReason] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');

  const reset = () => {
    setReason('');
    setDescription('');
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
    onSubmit({ reason, description: description.trim() });
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
            Opening a dispute pauses the release while our team reviews the evidence from both
            parties.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <div>
            <Label>Reason</Label>
            <div className="mt-1.5 flex flex-wrap gap-2">
              {REASONS.map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => {
                    setReason(r);
                    setError('');
                  }}
                  className={
                    'rounded-full border px-3 py-1 text-sm transition-colors ' +
                    (reason === r
                      ? 'border-destructive bg-destructive text-destructive-foreground'
                      : 'border-border text-muted-foreground hover:bg-accent/40')
                  }
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          <div>
            <Label htmlFor="dispute-desc">What happened?</Label>
            <Textarea
              id="dispute-desc"
              className="mt-1.5"
              rows={4}
              placeholder="Explain the issue with as much detail as you can. You can add evidence after opening."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {error && <p className="text-xs text-destructive">{error}</p>}

          <div className="flex justify-end gap-2">
            <Button variant="ghost" className="rounded-full" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              className="rounded-full bg-destructive text-destructive-foreground hover:bg-destructive/90"
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
