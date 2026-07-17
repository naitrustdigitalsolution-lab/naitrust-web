/**
 * TerminationReasonModal
 * Collects a required reason — reused for requesting a deal termination and for
 * rejecting someone else's termination request.
 */

import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../../ui/dialog';
import { Button } from '../../ui/button';
import { Label } from '../../ui/label';
import { Textarea } from '../../ui/textarea';

interface TerminationReasonModalProps {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  title: string;
  description: string;
  submitLabel: string;
  destructive?: boolean;
  submitting?: boolean;
  onSubmit: (reason: string) => void;
}

export function TerminationReasonModal({
  open,
  onOpenChange,
  title,
  description,
  submitLabel,
  destructive,
  submitting,
  onSubmit,
}: TerminationReasonModalProps) {
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) {
      setReason('');
      setError('');
    }
  }, [open]);

  const submit = () => {
    if (reason.trim().length < 5) {
      setError('Please give a clear reason (at least a few words).');
      return;
    }
    onSubmit(reason.trim());
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-3">
          <div>
            <Label htmlFor="termination-reason">Reason</Label>
            <Textarea
              id="termination-reason"
              className="mt-1.5"
              rows={4}
              placeholder="Explain why — the other party will see this."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </div>
          {error && <p className="text-xs text-destructive">{error}</p>}
          <div className="flex justify-end gap-2">
            <Button variant="ghost" className="rounded-full" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              variant={destructive ? 'destructive' : 'default'}
              className="rounded-full"
              onClick={submit}
              disabled={submitting}
            >
              {submitting ? <Loader2 size={16} className="mr-1.5 animate-spin" /> : null}
              {submitLabel}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
