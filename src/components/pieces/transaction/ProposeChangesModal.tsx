/**
 * ProposeChangesModal
 * Form to open or counter a negotiation: a message plus proposed changes to
 * the amount, delivery date, release conditions, and/or a requested agreement
 * change. Prefilled with the deal's current terms; only fields that actually
 * change are sent as a proposal.
 */

import { useEffect, useState } from 'react';
import { Loader2, Send } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../../ui/dialog';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Textarea } from '../../ui/textarea';
import { formatMinorAmount } from '../../../libs/utils/safe-deal-presentation';
import type { SafeDealDetail } from '../../../libs/store/types';
import type { ProposedChanges } from '../../../libs/store/types';

interface ProposeChangesModalProps {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  deal: SafeDealDetail;
  submitting?: boolean;
  onSubmit: (input: { message: string; changes: ProposedChanges }) => void;
}

export function ProposeChangesModal({
  open,
  onOpenChange,
  deal,
  submitting,
  onSubmit,
}: ProposeChangesModalProps) {
  const [message, setMessage] = useState('');
  const [amount, setAmount] = useState('');
  const [deliveryDueDate, setDeliveryDueDate] = useState('');
  const [releaseConditions, setReleaseConditions] = useState('');
  const [agreementNote, setAgreementNote] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) {
      setMessage('');
      setAmount(String(deal.amountMinor / 100));
      setDeliveryDueDate(deal.deliveryDueDate);
      setReleaseConditions(deal.releaseConditions);
      setAgreementNote('');
      setError('');
    }
  }, [open, deal]);

  const submit = () => {
    if (!message.trim()) {
      setError('Add a short note explaining what you want to change.');
      return;
    }
    const changes: ProposedChanges = {};
    const amountMinor = Math.round(Number(amount || 0) * 100);
    if (amountMinor > 0 && amountMinor !== deal.amountMinor) changes.amountMinor = amountMinor;
    if (deliveryDueDate && deliveryDueDate !== deal.deliveryDueDate) changes.deliveryDueDate = deliveryDueDate;
    if (releaseConditions.trim() && releaseConditions.trim() !== deal.releaseConditions)
      changes.releaseConditions = releaseConditions.trim();
    if (agreementNote.trim()) changes.agreementNote = agreementNote.trim();

    if (Object.keys(changes).length === 0) {
      setError('Change at least one term, or add an agreement change request.');
      return;
    }
    onSubmit({ message: message.trim(), changes });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Propose changes</DialogTitle>
          <DialogDescription>
            Suggest new terms. The counterparty can accept, decline, or counter your proposal.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <div>
            <Label htmlFor="np-msg">Message</Label>
            <Textarea
              id="np-msg"
              className="mt-1.5"
              rows={2}
              placeholder="Explain what you'd like to change and why."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <Label htmlFor="np-amount">
                Amount (NGN)
                <span className="ml-1 text-xs text-muted-foreground">
                  now {formatMinorAmount(deal.amountMinor, deal.currency)}
                </span>
              </Label>
              <Input
                id="np-amount"
                type="number"
                min="0"
                inputMode="decimal"
                className="mt-1.5"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="np-due">Delivery due date</Label>
              <Input
                id="np-due"
                type="date"
                className="mt-1.5"
                value={deliveryDueDate}
                onChange={(e) => setDeliveryDueDate(e.target.value)}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="np-release">Release conditions</Label>
            <Textarea
              id="np-release"
              className="mt-1.5"
              rows={2}
              value={releaseConditions}
              onChange={(e) => setReleaseConditions(e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="np-agreement">Requested agreement change (optional)</Label>
            <Textarea
              id="np-agreement"
              className="mt-1.5"
              rows={2}
              placeholder="Ask for a specific clause to be reworded or added."
              value={agreementNote}
              onChange={(e) => setAgreementNote(e.target.value)}
            />
          </div>

          {error && <p className="text-xs text-destructive">{error}</p>}

          <div className="flex justify-end gap-2">
            <Button variant="ghost" className="rounded-full" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button className="rounded-full" onClick={submit} disabled={submitting}>
              {submitting ? (
                <Loader2 size={16} className="mr-1.5 animate-spin" />
              ) : (
                <Send size={16} className="mr-1.5" />
              )}
              Send proposal
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
