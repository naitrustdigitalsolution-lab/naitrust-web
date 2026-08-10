import { useState } from 'react';
import { ArrowRight, Check, PackageCheck, ShieldAlert, ShieldCheck, Upload } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import {
  useAddEvidence,
  useCompleteHandoverReview,
  useConfirmReceiptByToken,
  useDeliveryPreview,
} from '../../hooks/useDealDetail';
import { useOpenDispute } from '../../hooks/useDispute';
import { useAuth } from '../../libs/auth-context';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import Spinner from '../ui/spinner';
import { LiveDealCountdown } from '../pieces/transaction/LiveDealCountdown';
import { RaiseDisputeModal } from '../pieces/transaction/RaiseDisputeModal';
import { UploadEvidenceModal } from '../pieces/transaction/UploadEvidenceModal';

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'This handover action could not be completed.';
}

export function DeliveryHandoverPage() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, isHydrated } = useAuth();
  const { data: preview, isLoading } = useDeliveryPreview(token);
  const confirmReceipt = useConfirmReceiptByToken(token, preview?.dealId);
  const completeHandover = useCompleteHandoverReview(preview?.dealId);
  const openDispute = useOpenDispute(preview?.dealId);
  const addEvidence = useAddEvidence(preview?.dealId);
  const [showDispute, setShowDispute] = useState(false);
  const [showEvidence, setShowEvidence] = useState(false);

  const returnPath = `/delivery/${token ?? ''}`;
  const loginPath = `/login?returnTo=${encodeURIComponent(returnPath)}`;
  const delivery = preview?.delivery;
  const handoverActive = delivery?.handover.status === 'in_progress';

  return (
    <div className="min-h-screen bg-[#f5f8fc] px-4 py-8 text-[#071b31] sm:px-6 sm:py-12">
      <div className="mx-auto w-full max-w-2xl">
        <div className="mb-6 flex items-center justify-center gap-2 text-xl font-extrabold text-[#1689ff]">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#1689ff] text-sm text-white">N</span>
          Naitrust
        </div>

        {!isHydrated || isLoading ? (
          <Card className="flex items-center justify-center p-16"><Spinner size="lg" /></Card>
        ) : !preview ? (
          <Card className="items-center p-8 text-center sm:p-12">
            <ShieldAlert size={34} className="text-destructive" />
            <h1 className="mt-4 text-xl font-bold">Delivery card not found</h1>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              This link may have been replaced, cancelled, or entered incorrectly. Ask the seller for the current card.
            </p>
          </Card>
        ) : !isAuthenticated ? (
          <Card className="p-6 shadow-sm sm:p-8">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <ShieldCheck size={23} />
            </div>
            <p className="mt-5 text-xs font-bold uppercase tracking-[0.15em] text-primary">Secure product handover</p>
            <h1 className="mt-2 text-2xl font-bold">Sign in to confirm this delivery</h1>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Naitrust must verify that you are the buyer on this Protected Deal before receipt can be recorded.
            </p>
            <Button className="mt-6 w-full rounded-full" onClick={() => navigate(loginPath)}>
              Sign in securely <ArrowRight size={16} />
            </Button>
          </Card>
        ) : preview.actorRole !== 'buyer' ? (
          <Card className="p-8 text-center shadow-sm">
            <ShieldAlert size={32} className="mx-auto text-amber-600" />
            <h1 className="mt-4 text-xl font-bold">Buyer confirmation required</h1>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Only the buyer assigned to {preview.reference} can confirm receipt. Sellers, riders, and other accounts cannot use this card.
            </p>
            <Button variant="outline" className="mt-6 rounded-full" onClick={() => navigate(`/app/deals/${preview.dealId}`)}>
              Open Deal Room
            </Button>
          </Card>
        ) : (
          <Card className="overflow-hidden p-0 shadow-sm">
            <div className="bg-[#c4e9fdb3] p-6 sm:p-8">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/80 text-primary shadow-sm">
                <PackageCheck size={24} />
              </div>
              <p className="mt-5 text-xs font-bold uppercase tracking-[0.15em] text-primary">{preview.reference}</p>
              <h1 className="mt-2 text-2xl font-bold leading-tight">{preview.title}</h1>
            </div>

            <div className="p-6 sm:p-8">
              {preview.cardStatus === 'expired' && delivery?.handover.status === 'not_started' ? (
                <div className="rounded-2xl border border-amber-500/20 bg-amber-500/[0.07] p-4">
                  <p className="font-semibold">This delivery card has expired</p>
                  <p className="mt-1 text-sm leading-6 text-muted-foreground">Ask the seller to generate a new card before accepting the product.</p>
                </div>
              ) : delivery?.handover.status === 'not_started' ? (
                <>
                  <h2 className="text-lg font-bold">Confirm the product is physically with you</h2>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    Keep the rider present while you compare the package, tamper seal, product model, contents, and serial or IMEI with the deal evidence.
                  </p>
                  <div className="mt-5 rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.07] p-4 text-sm leading-6 text-emerald-950 dark:text-emerald-100">
                  Confirming receipt records only that the parcel is physically with you and starts a ten-minute handover review. It does not confirm that the item is fault-free, release payment, or waive consumer and warranty rights.
                  </div>
                  <Button
                    className="mt-6 w-full rounded-full"
                    disabled={confirmReceipt.isPending || preview.cardStatus !== 'active'}
                    onClick={() =>
                      confirmReceipt.mutate(undefined, {
                        onSuccess: () => toast.success('Receipt confirmed. Inspect the product before the countdown ends.'),
                        onError: (error) => toast.error(errorMessage(error)),
                      })
                    }
                  >
                    <PackageCheck size={16} /> Confirm product received
                  </Button>
                </>
              ) : handoverActive ? (
                <>
                  <LiveDealCountdown deadline={delivery.handover.endsAt} label="Handover review remaining" />
                  <h2 className="mt-6 text-lg font-bold">Inspect the product now</h2>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    If the product is correct, finish immediately. If it is wrong, substituted, damaged, opened, or incomplete, record evidence and report it before the rider leaves.
                  </p>
                  <div className="mt-5 grid gap-2 sm:grid-cols-2">
                    <Button
                      className="rounded-full"
                      disabled={completeHandover.isPending}
                      onClick={() =>
                        completeHandover.mutate(undefined, {
                          onSuccess: () => toast.success('Correct product confirmed. The funding-review period has started.'),
                          onError: (error) => toast.error(errorMessage(error)),
                        })
                      }
                    >
                      <Check size={16} /> Correct product received
                    </Button>
                    <Button variant="outline" className="rounded-full" onClick={() => setShowEvidence(true)}>
                      <Upload size={16} /> Upload evidence
                    </Button>
                    <Button
                      variant="outline"
                      className="rounded-full text-destructive hover:bg-destructive/10 hover:text-destructive sm:col-span-2"
                      onClick={() => setShowDispute(true)}
                    >
                      <ShieldAlert size={16} /> Report an immediate problem
                    </Button>
                  </div>
                </>
              ) : (
                <div className="text-center">
                  <ShieldCheck size={34} className="mx-auto text-emerald-600" />
                  <h2 className="mt-4 text-xl font-bold">Handover recorded</h2>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    Continue product checks and follow the funding-review deadline in the Deal Room.
                  </p>
                  <Button className="mt-6 rounded-full" onClick={() => navigate(`/app/deals/${preview.dealId}`)}>
                    Open Deal Room <ArrowRight size={16} />
                  </Button>
                </div>
              )}
            </div>
          </Card>
        )}
      </div>

      <RaiseDisputeModal
        open={showDispute}
        onOpenChange={setShowDispute}
        submitting={openDispute.isPending || addEvidence.isPending}
        onSubmit={async ({ evidence, ...input }) => {
          try {
            await addEvidence.mutateAsync({ items: evidence, uploadedByName: 'You', uploadedByRole: 'buyer' });
            await openDispute.mutateAsync({ ...input, hasEvidence: evidence.length > 0 });
            setShowDispute(false);
            toast.success(evidence.length > 0
              ? 'Evidence submitted. Payment is now paused while the dispute is reviewed.'
              : 'Report opened. Payment will freeze after buyer evidence is uploaded.');
          } catch (error) {
            toast.error(errorMessage(error));
          }
        }}
      />
      <UploadEvidenceModal
        open={showEvidence}
        onOpenChange={setShowEvidence}
        submitting={addEvidence.isPending}
        onSubmit={({ items }) =>
          addEvidence.mutate(
            { items, uploadedByName: 'You', uploadedByRole: 'buyer' },
            {
              onSuccess: () => {
                setShowEvidence(false);
                toast.success('Handover evidence added.');
              },
            },
          )
        }
      />
    </div>
  );
}
