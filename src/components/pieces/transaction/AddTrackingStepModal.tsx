/**
 * AddTrackingStepModal
 * The seller logs a custom tracking update (a title + optional note) beyond the
 * standard delivery stages — e.g. "Cleared customs", "Handed to courier".
 *
 * Two modes:
 * - add:  create a new update, optionally choosing which existing step it
 *         should sit after (defaults to the current delivery point).
 * - edit: change the title/note of an existing step.
 */

import { useEffect, useState } from 'react';
import { Loader2, Pencil, Plus } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../../ui/dialog';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Textarea } from '../../ui/textarea';
import type { DealMilestone } from '../../../libs/store/types';

interface AddTrackingStepModalProps {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  submitting?: boolean;
  /** 'add' (default) creates a step; 'edit' updates an existing one. */
  mode?: 'add' | 'edit';
  /** Existing steps — used to build the "insert after" picker (add mode). */
  steps?: DealMilestone[];
  /** Prefill for edit mode. */
  initial?: { title: string; description?: string };
  onSubmit: (step: { title: string; description?: string }, afterStepId?: string | null) => void;
}

export function AddTrackingStepModal({
  open,
  onOpenChange,
  submitting,
  mode = 'add',
  steps = [],
  initial,
  onSubmit,
}: AddTrackingStepModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [afterStepId, setAfterStepId] = useState<string>('');
  const [error, setError] = useState('');
  const isEdit = mode === 'edit';

  // Re-seed the fields whenever the modal opens (edit prefill / add reset).
  useEffect(() => {
    if (open) {
      setTitle(initial?.title ?? '');
      setDescription(initial?.description ?? '');
      setAfterStepId('');
      setError('');
    }
  }, [open, initial?.title, initial?.description]);

  const reset = () => {
    setTitle('');
    setDescription('');
    setAfterStepId('');
    setError('');
  };

  const submit = () => {
    if (!title.trim()) {
      setError('Give the update a short title.');
      return;
    }
    onSubmit(
      { title: title.trim(), description: description.trim() || undefined },
      isEdit ? undefined : afterStepId || null,
    );
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
          <DialogTitle>{isEdit ? 'Edit tracking step' : 'Add a tracking update'}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? 'Update the wording of this step. The buyer sees the change straight away.'
              : 'Post a custom step so the buyer can follow the delivery.'}
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-3">
          <div>
            <Label htmlFor="ts-title">Update</Label>
            <Input
              id="ts-title"
              className="mt-1.5"
              placeholder="e.g. Cleared the checkpoint at Lokoja"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="ts-note">Note (optional)</Label>
            <Textarea
              id="ts-note"
              className="mt-1.5"
              rows={2}
              placeholder="Any detail the buyer should know."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          {!isEdit && steps.length > 0 && (
            <div>
              <Label htmlFor="ts-after">Position</Label>
              <select
                id="ts-after"
                className="mt-1.5 flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                value={afterStepId}
                onChange={(e) => setAfterStepId(e.target.value)}
              >
                <option value="">At the current delivery point</option>
                {steps.map((s) => (
                  <option key={s.id} value={s.id}>
                    After: {s.title}
                  </option>
                ))}
              </select>
            </div>
          )}
          {error && <p className="text-xs text-destructive">{error}</p>}
          <div className="flex justify-end gap-2">
            <Button variant="ghost" className="rounded-full" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button className="rounded-full" onClick={submit} disabled={submitting}>
              {submitting ? (
                <Loader2 size={16} className="mr-1.5 animate-spin" />
              ) : isEdit ? (
                <Pencil size={16} className="mr-1.5" />
              ) : (
                <Plus size={16} className="mr-1.5" />
              )}
              {isEdit ? 'Save changes' : 'Add update'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
