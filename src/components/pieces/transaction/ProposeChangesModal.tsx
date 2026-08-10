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
  const allocatedRecipients = deal.parties.filter((party) => party.role === 'seller' && party.allocationMinor !== undefined);
  const hasSplitAllocation = allocatedRecipients.length > 1;
  const hasSplitPayment = Boolean(deal.initialPaymentMinor && deal.remainingPaymentMinor);
  const [message, setMessage] = useState('');
  const [amount, setAmount] = useState('');
  const [initialPayment, setInitialPayment] = useState('');
  const [remainingPayment, setRemainingPayment] = useState('');
  const [deliveryDueDate, setDeliveryDueDate] = useState('');
  const [releaseConditions, setReleaseConditions] = useState('');
  const [agreementNote, setAgreementNote] = useState('');
  const [allocations, setAllocations] = useState<Record<string, string>>({});
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) {
      setMessage('');
      setAmount(String(deal.amountMinor / 100));
      setInitialPayment(String((deal.initialPaymentMinor ?? 0) / 100));
      setRemainingPayment(String((deal.remainingPaymentMinor ?? 0) / 100));
      setDeliveryDueDate(deal.deliveryDueDate);
      setReleaseConditions(deal.releaseConditions);
      setAgreementNote('');
      setAllocations(Object.fromEntries(allocatedRecipients.map((party) => [party.id, String((party.allocationMinor ?? 0) / 100)])));
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
    if (hasSplitPayment) {
      const initialPaymentMinor = Math.round(Number(initialPayment || 0) * 100);
      const remainingPaymentMinor = Math.round(Number(remainingPayment || 0) * 100);
      if (initialPaymentMinor + remainingPaymentMinor !== amountMinor) {
        setError('The first and remaining payment allocations must equal the proposed total amount.');
        return;
      }
      if (initialPaymentMinor !== deal.initialPaymentMinor) changes.initialPaymentMinor = initialPaymentMinor;
      if (remainingPaymentMinor !== deal.remainingPaymentMinor) changes.remainingPaymentMinor = remainingPaymentMinor;
    }
    if (deliveryDueDate && deliveryDueDate !== deal.deliveryDueDate) changes.deliveryDueDate = deliveryDueDate;
    if (releaseConditions.trim() && releaseConditions.trim() !== deal.releaseConditions)
      changes.releaseConditions = releaseConditions.trim();
    if (agreementNote.trim()) changes.agreementNote = agreementNote.trim();
    const participantAllocations = allocatedRecipients
      .map((party) => ({ partyId: party.id, partyName: party.name, amountMinor: Math.round(Number(allocations[party.id] || 0) * 100), current: party.allocationMinor ?? 0 }))
      .filter((allocation) => allocation.amountMinor !== allocation.current)
      .map(({ partyId, partyName, amountMinor }) => ({ partyId, partyName, amountMinor }));
    if (participantAllocations.length) changes.participantAllocations = participantAllocations;

    if (Object.keys(changes).length === 0) {
      setError('Change at least one term, or add an agreement change request.');
      return;
    }
    onSubmit({ message: message.trim(), changes });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Propose changes</DialogTitle>
          <DialogDescription>
            Suggest new terms. The other party can accept, decline, or counter your proposal.
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
              <Label htmlFor="np-due">Next milestone or completion date</Label>
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

          {(hasSplitPayment || hasSplitAllocation) && (
            <div className="rounded-xl border bg-muted/20 p-4">
              {hasSplitPayment && (
                <div>
                  <p className="text-sm font-semibold text-foreground">Proposed payment allocation</p>
                  <p className="mt-1 text-xs text-muted-foreground">This deal was split into two payments. Adjust either stage while keeping their combined value equal to the proposed total.</p>
                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    <div>
                      <Label htmlFor="np-initial-payment">First payment (NGN)</Label>
                      <Input id="np-initial-payment" type="number" min="0" inputMode="decimal" className="mt-1.5" value={initialPayment} onChange={(event) => setInitialPayment(event.target.value)} />
                    </div>
                    <div>
                      <Label htmlFor="np-remaining-payment">Remaining payment (NGN)</Label>
                      <Input id="np-remaining-payment" type="number" min="0" inputMode="decimal" className="mt-1.5" value={remainingPayment} onChange={(event) => setRemainingPayment(event.target.value)} />
                    </div>
                  </div>
                </div>
              )}
              {hasSplitAllocation ? (
                <div className={hasSplitPayment ? "mt-4 border-t pt-4" : undefined}>
                  <p className="text-sm font-semibold text-foreground">Proposed receiving allocation</p>
                  <p className="mt-1 text-xs text-muted-foreground">Enter the new amount you propose for each seller or recipient.</p>
                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    {allocatedRecipients.map((party) => (
                      <div key={party.id}>
                        <Label htmlFor={`np-allocation-${party.id}`}>{party.name} (NGN)</Label>
                        <Input id={`np-allocation-${party.id}`} type="number" min="0" inputMode="decimal" className="mt-1.5" value={allocations[party.id] ?? ''} onChange={(event) => setAllocations((current) => ({ ...current, [party.id]: event.target.value }))} />
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          )}

          <div>
            <Label htmlFor="np-agreement">Other requested changes (optional)</Label>
            <Textarea
              id="np-agreement"
              className="mt-1.5"
              rows={2}
              placeholder="Describe any other update, such as split allocations, payment stages, participant details, delivery terms, or an agreement clause."
              value={agreementNote}
              onChange={(e) => setAgreementNote(e.target.value)}
            />
          </div>

          {error && <p className="text-xs text-destructive">{error}</p>}

          <div className="flex justify-end gap-2">
            <Button variant="ghost" className="rounded-md" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button className="rounded-md" onClick={submit} disabled={submitting}>
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
