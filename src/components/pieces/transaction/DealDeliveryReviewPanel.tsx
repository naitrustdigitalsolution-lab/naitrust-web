import { useState } from 'react';
import {
  AlertTriangle,
  Check,
  FileCheck2,
  KeyRound,
  PackageCheck,
  QrCode,
  RefreshCw,
  ShieldCheck,
  Upload,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  useApproveEarlyRelease,
  useCompleteHandoverReview,
  useConfirmReceiptByOtp,
  useGenerateDeliveryCard,
} from '../../../hooks/useDealDetail';
import {
  fundingReviewLabel,
  isDeliveryCardStatusEligible,
  requiredProductEvidence,
  supportsDeliveryReview,
} from '../../../libs/protected-deals/delivery-review';
import type { SafeDealDetail } from '../../../libs/store/types';
import { Button } from '../../ui/button';
import { Card } from '../../ui/card';
import { Input } from '../../ui/input';
import { PinPromptModal } from '../security/PinPromptModal';
import { DeliveryCardDialog } from './DeliveryCardDialog';
import { LiveDealCountdown } from './LiveDealCountdown';

interface DealDeliveryReviewPanelProps {
  deal: SafeDealDetail;
  hasDispute: boolean;
  onReportIssue: () => void;
  onUploadEvidence: () => void;
}

function actionError(error: unknown): string {
  return error instanceof Error ? error.message : 'This action could not be completed.';
}

export function DealDeliveryReviewPanel({
  deal,
  hasDispute,
  onReportIssue,
  onUploadEvidence,
}: DealDeliveryReviewPanelProps) {
  const role = deal.parties.find((party) => party.isYou)?.role;
  const isBuyer = role === 'buyer';
  const isSeller = role === 'seller';
  const generate = useGenerateDeliveryCard(deal.id);
  const confirmOtp = useConfirmReceiptByOtp(deal.id);
  const completeHandover = useCompleteHandoverReview(deal.id);
  const release = useApproveEarlyRelease(deal.id);
  const [otp, setOtp] = useState('');
  const [showCard, setShowCard] = useState(false);
  const [showPin, setShowPin] = useState(false);

  const delivery = generate.data?.data.delivery ?? deal.delivery;
  const card = delivery.card;
  const evidenceRequirements = requiredProductEvidence(deal.evidence);
  const evidenceReady = evidenceRequirements.every((item) => item.complete);
  const canGenerate =
    isSeller &&
    deal.funding.status === 'funded' &&
    isDeliveryCardStatusEligible(deal.status) &&
    delivery.handover.status === 'not_started';
  const showFeature = supportsDeliveryReview(deal.useCase) || delivery.handover.status !== 'not_started' || Boolean(card);

  if (!showFeature) return null;

  const generateCard = () => {
    generate.mutate(undefined, {
      onSuccess: () => {
        setShowCard(true);
        toast.success(card ? 'Delivery card regenerated. The previous QR and OTP are invalid.' : 'Delivery card generated.');
      },
      onError: (error) => toast.error(actionError(error)),
    });
  };

  const confirmWithOtp = () => {
    confirmOtp.mutate(otp, {
      onSuccess: () => {
        setOtp('');
        toast.success('Product received. Your ten-minute handover review has started.');
      },
      onError: (error) => toast.error(actionError(error)),
    });
  };

  return (
    <Card className="mt-4 overflow-hidden border-primary/15 p-0 shadow-sm">
      <div className="flex flex-col gap-3 bg-[#c4e9fdb3] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/80 text-[#087ff5] shadow-sm">
            <PackageCheck size={20} />
          </span>
          <div>
            <p className="text-sm font-bold text-[#071b31]">Product handover and funding review</p>
            <p className="mt-0.5 text-xs leading-5 text-[#071b31]/70">
              Receipt starts inspection. Payment stays protected until the following review ends or the buyer releases it.
            </p>
          </div>
        </div>
        {deal.extendedProductTestingDays && (
          <span className="w-fit rounded-full border border-[#071b31]/10 bg-white/70 px-3 py-1 text-xs font-semibold text-[#071b31]">
            {deal.extendedProductTestingDays}-day testing period agreed
          </span>
        )}
      </div>

      <div className="p-5">
        {delivery.handover.status === 'not_started' && isSeller && (
          <div className="grid gap-5 lg:grid-cols-[1fr_auto] lg:items-end">
            <div>
              <p className="text-sm font-semibold text-foreground">Prepare the delivery card</p>
              <p className="mt-1 text-xs leading-5 text-muted-foreground">
                Record what leaves your control before giving the one-time card to the rider.
              </p>
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                {evidenceRequirements.map((requirement) => (
                  <div key={requirement.kind} className="flex items-center gap-2 text-xs">
                    <span className={requirement.complete ? 'text-emerald-600' : 'text-muted-foreground'}>
                      {requirement.complete ? <Check size={14} /> : <span className="block h-3.5 w-3.5 rounded-full border" />}
                    </span>
                    <span className={requirement.complete ? 'text-foreground' : 'text-muted-foreground'}>{requirement.kind}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex flex-wrap gap-2 lg:justify-end">
              {!evidenceReady && (
                <Button variant="outline" className="rounded-full" onClick={onUploadEvidence}>
                  <Upload size={15} /> Add evidence
                </Button>
              )}
              {card?.status === 'active' && (
                <Button variant="outline" className="rounded-full" onClick={() => setShowCard(true)}>
                  <QrCode size={15} /> View card
                </Button>
              )}
              <Button
                className="rounded-full"
                disabled={!canGenerate || !evidenceReady || generate.isPending}
                onClick={generateCard}
              >
                {card?.status === 'active' ? <RefreshCw size={15} /> : <FileCheck2 size={15} />}
                {card?.status === 'active' ? 'Regenerate card' : 'Generate delivery card'}
              </Button>
            </div>
          </div>
        )}

        {delivery.handover.status === 'not_started' && isBuyer && (
          <div className="grid gap-4 md:grid-cols-[1fr_290px] md:items-end">
            <div>
              <p className="text-sm font-semibold text-foreground">Confirm only when the product is in front of you</p>
              <p className="mt-1 text-xs leading-5 text-muted-foreground">
                Check the package and tamper seal with the rider present. Receipt confirmation starts ten minutes of product inspection; it does not release payment.
              </p>
            </div>
            <div>
              <label htmlFor="handover-otp" className="text-xs font-medium text-foreground">Six-digit handover OTP</label>
              <div className="mt-1.5 flex gap-2">
                <Input
                  id="handover-otp"
                  value={otp}
                  onChange={(event) => setOtp(event.target.value.replace(/\D/g, '').slice(0, 6))}
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  placeholder="000000"
                  className="font-mono tracking-[0.2em]"
                />
                <Button disabled={otp.length !== 6 || confirmOtp.isPending || !card} onClick={confirmWithOtp}>
                  <KeyRound size={15} /> Confirm
                </Button>
              </div>
              {!card && <p className="mt-1.5 text-[0.7rem] text-muted-foreground">Waiting for the seller to issue a valid delivery card.</p>}
            </div>
          </div>
        )}

        {delivery.handover.status === 'in_progress' && (
          <div className="grid gap-5 lg:grid-cols-[280px_1fr]">
            <LiveDealCountdown deadline={delivery.handover.endsAt} label="Handover review remaining" />
            <div>
              <p className="text-sm font-semibold text-foreground">Inspect before the rider leaves</p>
              <p className="mt-1 text-xs leading-5 text-muted-foreground">
                Compare the product, serial or IMEI, contents, packaging, and seal with the seller evidence. You can finish early as soon as you are satisfied.
              </p>
              {isBuyer ? (
                <div className="mt-4 flex flex-wrap gap-2">
                  <Button
                    className="rounded-full"
                    disabled={completeHandover.isPending}
                    onClick={() =>
                      completeHandover.mutate(undefined, {
                        onSuccess: () => toast.success('Correct product confirmed. The funding-review period has started.'),
                        onError: (error) => toast.error(actionError(error)),
                      })
                    }
                  >
                    <ShieldCheck size={15} /> Correct product received
                  </Button>
                  <Button variant="outline" className="rounded-full" onClick={onUploadEvidence}>
                    <Upload size={15} /> Upload handover evidence
                  </Button>
                  <Button
                    variant="outline"
                    className="rounded-full text-destructive hover:bg-destructive/10 hover:text-destructive"
                    onClick={onReportIssue}
                  >
                    <AlertTriangle size={15} /> Report an immediate problem
                  </Button>
                </div>
              ) : (
                <p className="mt-4 rounded-xl bg-muted/50 p-3 text-xs leading-5 text-muted-foreground">
                  The buyer is checking the product. You will be notified when handover completes or a problem is reported.
                </p>
              )}
            </div>
          </div>
        )}

        {delivery.fundingReview.status === 'in_progress' && (
          <div className="grid gap-5 lg:grid-cols-[280px_1fr]">
            <LiveDealCountdown deadline={delivery.fundingReview.endsAt} label="Funding review remaining" />
            <div>
              <p className="text-sm font-semibold text-foreground">
                {fundingReviewLabel(delivery.fundingReview.extendedProductTestingDays)} in progress
              </p>
              <p className="mt-1 text-xs leading-5 text-muted-foreground">
                A dispute opened before the deadline freezes release. If no dispute is opened, payment releases automatically at the deadline.
              </p>
              {isBuyer && !hasDispute && (
                <div className="mt-4 flex flex-wrap gap-2">
                  <Button className="rounded-full" onClick={() => setShowPin(true)}>
                    <ShieldCheck size={15} /> Product checked — release payment
                  </Button>
                  <Button variant="outline" className="rounded-full" onClick={onUploadEvidence}>
                    <Upload size={15} /> Add product evidence
                  </Button>
                  <Button
                    variant="outline"
                    className="rounded-full text-destructive hover:bg-destructive/10 hover:text-destructive"
                    onClick={onReportIssue}
                  >
                    <AlertTriangle size={15} /> Report a problem
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}

        {(hasDispute || delivery.fundingReview.status === 'blocked' || delivery.handover.status === 'issue_reported') && (
          <div className="flex items-start gap-3 rounded-2xl border border-destructive/20 bg-destructive/[0.06] p-4">
            <AlertTriangle size={18} className="mt-0.5 shrink-0 text-destructive" />
            <div>
              <p className="text-sm font-semibold text-foreground">Countdown-based release is blocked</p>
              <p className="mt-1 text-xs leading-5 text-muted-foreground">
                A product problem was reported. Payment remains protected while the existing dispute and evidence process continues.
              </p>
            </div>
          </div>
        )}

        {delivery.fundingReview.status === 'release_approved' && (
          <div className="flex items-start gap-3 rounded-2xl border border-primary/20 bg-primary/[0.06] p-4">
            <ShieldCheck size={18} className="mt-0.5 shrink-0 text-primary" />
            <div>
              <p className="text-sm font-semibold text-foreground">Payment release approved</p>
              <p className="mt-1 text-xs leading-5 text-muted-foreground">
                The protected-funding instruction is approved and partner payout is processing.
              </p>
            </div>
          </div>
        )}

        {delivery.fundingReview.status === 'paid_out' && (
          <div className="flex items-start gap-3 rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.07] p-4">
            <ShieldCheck size={18} className="mt-0.5 shrink-0 text-emerald-600" />
            <div>
              <p className="text-sm font-semibold text-foreground">Product review complete and payment released</p>
              <p className="mt-1 text-xs leading-5 text-muted-foreground">
                The deal record keeps the delivery, evidence, handover, and release history together.
              </p>
            </div>
          </div>
        )}
      </div>

      {card && (
        <DeliveryCardDialog
          open={showCard}
          onOpenChange={setShowCard}
          title={deal.title}
          reference={deal.reference}
          card={card}
        />
      )}
      <PinPromptModal
        open={showPin}
        onOpenChange={setShowPin}
        title="Release protected payment?"
        description="Confirm that product checks are complete. This releases payment to the seller and cannot be undone from the Transaction Room."
        onVerified={() =>
          release.mutate(undefined, {
            onSuccess: () => toast.success('Product checked. Payment release approved.'),
            onError: (error) => toast.error(actionError(error)),
          })
        }
      />
    </Card>
  );
}
