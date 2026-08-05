import { CheckCircle2, LockKeyhole, MessageSquareText, Star } from 'lucide-react';
import { useEffect, useState, type FormEvent } from 'react';
import { toast } from 'sonner';
import { useSubmitBusinessReview } from '../../../hooks/useBusinessReviews';
import type { CompletedCustomerBusinessTransaction } from '../../../libs/business-reviews/types';
import type { User } from '../../../libs/store/types';
import { Button } from '../../ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../../ui/dialog';
import { Label } from '../../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { Textarea } from '../../ui/textarea';

interface BusinessReviewComposerProps {
  businessId: string;
  businessName: string;
  user: User | null;
  eligibleTransactions: CompletedCustomerBusinessTransaction[];
  onSubmitted: () => void;
  onSignIn: () => void;
}

function transactionKindLabel(kind: CompletedCustomerBusinessTransaction['kind']): string {
  return kind === 'protected_deal' ? 'Protected Deal' : 'Naitrust transfer';
}

export function BusinessReviewComposer({
  businessId,
  businessName,
  user,
  eligibleTransactions,
  onSubmitted,
  onSignIn,
}: BusinessReviewComposerProps) {
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [transactionId, setTransactionId] = useState(eligibleTransactions[0]?.id ?? '');
  const submitReview = useSubmitBusinessReview(businessId, user);

  useEffect(() => {
    if (!eligibleTransactions.some((transaction) => transaction.id === transactionId)) {
      setTransactionId(eligibleTransactions[0]?.id ?? '');
    }
  }, [eligibleTransactions, transactionId]);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!rating) {
      toast.error('Choose a star rating.');
      return;
    }

    try {
      const response = await submitReview.mutateAsync({ transactionId, rating, comment });
      toast.success(response.message);
      setOpen(false);
      setRating(0);
      setComment('');
      onSubmitted();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to publish your review.');
    }
  };

  if (!user) {
    return (
      <div className="flex flex-col gap-3 rounded-2xl border bg-muted/30 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-3">
          <LockKeyhole className="mt-0.5 shrink-0 text-muted-foreground" size={18} />
          <div><p className="text-sm font-semibold">Completed a transaction here?</p><p className="mt-1 text-xs leading-5 text-muted-foreground">Sign in to rate or comment using your completed Naitrust transaction.</p></div>
        </div>
        <Button size="sm" variant="outline" className="rounded-full" onClick={onSignIn}>Sign in to review</Button>
      </div>
    );
  }

  if (user.role !== 'customer') {
    return (
      <div className="flex gap-3 rounded-2xl border bg-muted/30 p-4">
        <LockKeyhole className="mt-0.5 shrink-0 text-muted-foreground" size={18} />
        <div><p className="text-sm font-semibold">Customer reviews only</p><p className="mt-1 text-xs leading-5 text-muted-foreground">Only personal customers can review a business after completing a Naitrust transaction with it.</p></div>
      </div>
    );
  }

  if (eligibleTransactions.length === 0) {
    return (
      <div className="flex gap-3 rounded-2xl border bg-muted/30 p-4">
        <CheckCircle2 className="mt-0.5 shrink-0 text-muted-foreground" size={18} />
        <div><p className="text-sm font-semibold">Transaction-backed reviews</p><p className="mt-1 text-xs leading-5 text-muted-foreground">You can rate this business after completing a Naitrust transfer or Protected Deal with it. Each completed transaction can be reviewed once.</p></div>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col gap-3 rounded-2xl border border-primary/15 bg-primary/5 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-3">
          <MessageSquareText className="mt-0.5 shrink-0 text-primary" size={18} />
          <div><p className="text-sm font-semibold">Share feedback from your transaction</p><p className="mt-1 text-xs leading-5 text-muted-foreground">You have {eligibleTransactions.length} completed {eligibleTransactions.length === 1 ? 'transaction' : 'transactions'} available to review.</p></div>
        </div>
        <Button size="sm" className="rounded-full" onClick={() => setOpen(true)}>Rate this business</Button>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Rate {businessName}</DialogTitle>
            <DialogDescription>Your rating and comment will appear on the business’s public Trust Profile.</DialogDescription>
          </DialogHeader>
          <form className="mt-2 space-y-5" onSubmit={submit}>
            <div>
              <Label>Completed transaction</Label>
              <Select value={transactionId} onValueChange={setTransactionId}>
                <SelectTrigger className="mt-2"><SelectValue placeholder="Choose a completed transaction" /></SelectTrigger>
                <SelectContent>
                  {eligibleTransactions.map((transaction) => (
                    <SelectItem key={transaction.id} value={transaction.id}>
                      {transaction.title} · {transaction.reference}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {transactionId && <p className="mt-2 text-xs text-muted-foreground">{transactionKindLabel(eligibleTransactions.find((transaction) => transaction.id === transactionId)?.kind ?? 'instant_transfer')} · completed on {new Date(eligibleTransactions.find((transaction) => transaction.id === transactionId)?.completedAt ?? '').toLocaleDateString()}</p>}
            </div>

            <div>
              <Label>Your rating</Label>
              <div className="mt-2 flex gap-1" role="radiogroup" aria-label="Business rating">
                {Array.from({ length: 5 }, (_, index) => index + 1).map((value) => (
                  <button
                    key={value}
                    type="button"
                    role="radio"
                    aria-checked={rating === value}
                    aria-label={`${value} ${value === 1 ? 'star' : 'stars'}`}
                    className="rounded-full p-2 text-amber-500 transition hover:bg-amber-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    onClick={() => setRating(value)}
                  >
                    <Star size={25} className={value <= rating ? 'fill-current' : 'text-muted-foreground'} />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <Label htmlFor="business-review-comment">Comment <span className="font-normal text-muted-foreground">(optional)</span></Label>
              <Textarea
                id="business-review-comment"
                className="mt-2 min-h-28 resize-y"
                maxLength={500}
                value={comment}
                onChange={(event) => setComment(event.target.value)}
                placeholder="What went well, or what could have been better?"
              />
              <p className="mt-1 text-right text-xs text-muted-foreground">{comment.length}/500</p>
            </div>

            <Button type="submit" className="w-full rounded-full" disabled={!transactionId || !rating || submitReview.isPending}>
              {submitReview.isPending ? 'Publishing…' : 'Publish verified review'}
            </Button>
            <p className="text-center text-[11px] leading-4 text-muted-foreground">Naitrust links this review to the completed transaction. Private payment details are never shown.</p>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}

