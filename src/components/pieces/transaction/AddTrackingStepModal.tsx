/**
 * AddTrackingStepModal
 * The seller logs a custom tracking update (a title + optional note) beyond the
 * standard delivery stages — e.g. "Cleared customs", "Handed to courier".
 */

import { useState } from 'react';
import { Loader2, Plus } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../../ui/dialog';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Textarea } from '../../ui/textarea';

interface AddTrackingStepModalProps {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  submitting?: boolean;
  onSubmit: (step: { title: string; description?: string }) => void;
}

export function AddTrackingStepModal({ open, onOpenChange, submitting, onSubmit }: AddTrackingStepModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');

  const submit = () => {
    if (!title.trim()) {
      setError('Give the update a short title.');
      return;
    }
    onSubmit({ title: title.trim(), description: description.trim() || undefined });
    setTitle('');
    setDescription('');
    setError('');
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        onOpenChange(o);
        if (!o) {
          setTitle('');
          setDescription('');
          setError('');
        }
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add a tracking update</DialogTitle>
          <DialogDescription>Post a custom step so the buyer can follow the delivery.</DialogDescription>
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
          {error && <p className="text-xs text-destructive">{error}</p>}
          <div className="flex justify-end gap-2">
            <Button variant="ghost" className="rounded-full" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button className="rounded-full" onClick={submit} disabled={submitting}>
              {submitting ? <Loader2 size={16} className="mr-1.5 animate-spin" /> : <Plus size={16} className="mr-1.5" />}
              Add update
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
