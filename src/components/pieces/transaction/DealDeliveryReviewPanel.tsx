import { useRef, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Clock3,
  HandCoins,
  KeyRound,
  PackageCheck,
  QrCode,
  RefreshCw,
  ScanLine,
  ShieldCheck,
  Upload,
} from "lucide-react";
import { toast } from "sonner";
import {
  useApproveEarlyRelease,
  useCompleteHandoverReview,
  useConfirmReceiptByOtp,
  useConfirmReceiptByToken,
  useGenerateDeliveryCard,
} from "../../../hooks/useDealDetail";
import {
  fundingReviewLabel,
  isDeliveryCardStatusEligible,
  isPilotRestrictedDelivery,
  supportsDeliveryReview,
} from "../../../libs/protected-deals/delivery-review";
import type { SafeDealDetail } from "../../../libs/store/types";
import { Button } from "../../ui/button";
import { Card } from "../../ui/card";
import { Input } from "../../ui/input";
import { PinPromptModal } from "../security/PinPromptModal";
import { DeliveryCardDialog } from "./DeliveryCardDialog";
import { LiveDealCountdown } from "./LiveDealCountdown";

interface DealDeliveryReviewPanelProps {
  deal: SafeDealDetail;
  viewerRole: "buyer" | "seller";
  hasDispute: boolean;
  onUploadEvidence: (kind?: string) => void;
}

function actionError(error: unknown): string {
  return error instanceof Error
    ? error.message
    : "This action could not be completed.";
}

export function DealDeliveryReviewPanel({
  deal,
  viewerRole,
  hasDispute,
  onUploadEvidence,
}: DealDeliveryReviewPanelProps) {
  const isBuyer = viewerRole === "buyer";
  const isSeller = viewerRole === "seller";
  const generate = useGenerateDeliveryCard(deal.id);
  const confirmOtp = useConfirmReceiptByOtp(deal.id);
  const completeHandover = useCompleteHandoverReview(deal.id);
  const release = useApproveEarlyRelease(deal.id);
  const [otp, setOtp] = useState("");
  const [showCard, setShowCard] = useState(false);
  const [showPin, setShowPin] = useState(false);
  const [releaseRequested, setReleaseRequested] = useState(false);
  const scanInputRef = useRef<HTMLInputElement>(null);

  // Active lifecycle changes come from the polling deal query. Keeping a
  // completed generate-card response here would mask newer countdown states.
  const delivery = deal.delivery;
  const card = delivery.card;
  const requiresInsurance = isPilotRestrictedDelivery(deal.amountMinor, deal.useCase);
  const confirmQr = useConfirmReceiptByToken(card?.token, deal.id);
  const canGenerate =
    isSeller &&
    deal.funding.status === "funded" &&
    isDeliveryCardStatusEligible(deal.status) &&
    delivery.handover.status === "not_started";
  const deliveryCardBlockedReason = deal.funding.status !== 'funded'
    ? 'Available after the protected payment is received.'
    : !isDeliveryCardStatusEligible(deal.status)
      ? 'Delivery cards are unavailable at this stage of the deal.'
      : delivery.handover.status !== 'not_started'
        ? 'The delivery handover has already started.'
        : '';
  const showFeature =
    supportsDeliveryReview(deal.useCase) ||
    delivery.handover.status !== "not_started" ||
    Boolean(card);
  if (!showFeature) return null;

  const generateCard = () =>
    generate.mutate(undefined, {
      onSuccess: () => {
        setShowCard(true);
        toast.success(
          card
            ? "New delivery code created. The old code no longer works."
            : "Delivery code created.",
        );
      },
      onError: (error) => toast.error(actionError(error)),
    });

  const confirmWithOtp = () =>
    confirmOtp.mutate(otp, {
      onSuccess: () => {
        setOtp("");
        toast.success(
          "Delivery verified. Your 10-minute handover review has started.",
        );
      },
      onError: (error) => toast.error(actionError(error)),
    });

  const scanQrImage = async (file: File | undefined) => {
    if (!file || !card) return;
    try {
      const Detector = (
        window as unknown as {
          BarcodeDetector?: new (options: { formats: string[] }) => {
            detect: (
              source: ImageBitmap,
            ) => Promise<Array<{ rawValue: string }>>;
          };
        }
      ).BarcodeDetector;
      if (!Detector)
        throw new Error(
          "QR scanning is not supported by this browser. Enter the six-digit PIN instead.",
        );
      const bitmap = await createImageBitmap(file);
      const results = await new Detector({ formats: ["qr_code"] }).detect(
        bitmap,
      );
      bitmap.close();
      const value = results[0]?.rawValue;
      if (!value || !value.endsWith(`/delivery/${card.token}`))
        throw new Error("This QR code does not belong to this delivery.");
      confirmQr.mutate(undefined, {
        onSuccess: () =>
          toast.success(
            "Delivery verified. Your 10-minute handover review has started.",
          ),
        onError: (error) => toast.error(actionError(error)),
      });
    } catch (error) {
      toast.error(actionError(error));
    } finally {
      if (scanInputRef.current) scanInputRef.current.value = "";
    }
  };

  return (
    <Card className="mb-4 gap-0 overflow-hidden p-0 shadow-none">
      <div className="border-b px-4 py-3 sm:px-5">
        <div className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2">
            <PackageCheck size={16} className="shrink-0 text-primary" />
            <p className="text-sm font-semibold text-foreground">
              {delivery.fundingReview.status === "in_progress"
                ? fundingReviewLabel(delivery.fundingReview.extendedProductTestingDays)
                : delivery.handover.status === "in_progress"
                  ? "10-minute handover review"
                  : delivery.handover.status === "completed"
                ? "Delivery received"
                : isSeller
                  ? "Delivery card"
                  : "Verify delivery"}
            </p>
          </div>
          <span className="shrink-0 rounded-full bg-muted px-2.5 py-1 text-[10px] font-semibold text-muted-foreground">
            {delivery.fundingReview.status === "in_progress"
              ? "Delivery review active"
              : delivery.handover.status === "in_progress"
                ? "Buyer checking"
                : delivery.handover.status === "completed"
              ? "Received"
              : card?.status === "active"
                ? isSeller
                  ? "Awaiting buyer"
                  : "Ready to verify"
                : isSeller
                  ? "Not created"
                  : "Waiting for seller"}
          </span>
        </div>
      </div>

      <div className="p-4 sm:p-5">
        {delivery.handover.status === "not_started" && isSeller && (
          <div>
            <p className="text-sm font-semibold">
              {card?.status === "active"
                ? "Delivery card ready"
                : "Create the rider’s delivery card"}
            </p>
            <p className="mt-1 text-xs leading-5 text-muted-foreground">
              Attach the delivery card to the parcel or give it to the delivery agent or person.
              The buyer must scan its QR code or enter its single use PIN while the product is physically present.
            </p>
            {!card && (
              <div className="mt-4 rounded-xl border bg-muted/30 p-3">
                <p className="text-xs font-semibold">Add seller proof (optional)</p>
                <p className="mt-1 text-[11px] leading-4 text-muted-foreground">
                  One relevant photo, video, or document can help the buyer understand the item and its condition before dispatch. This does not affect delivery-card availability.
                </p>
                <Button type="button" size="sm" variant="outline" className="mt-2 h-8 rounded-full text-xs" onClick={() => onUploadEvidence('Photo')}><Upload size={13} />Upload proof</Button>
                {requiresInsurance && (
                  <div className="mt-3 rounded-lg bg-amber-500/10 p-3 text-[11px] leading-4 text-amber-800 dark:text-amber-200">
                    <p>Expensive or fragile delivery: appropriate courier insurance is recommended but does not block this deal. Without it, parcel loss or damage may not be recoverable beyond the protected payment.</p>
                  </div>
                )}
              </div>
            )}
            <div className="mt-4 flex flex-wrap gap-2">
              {card?.status === "active" && (
                <Button
                  size="sm"
                  variant="outline"
                  className="rounded-full"
                  onClick={() => setShowCard(true)}
                >
                  <QrCode size={14} /> View code
                </Button>
              )}
              <Button
                size="sm"
                className="rounded-full"
                disabled={!canGenerate || generate.isPending}
                onClick={generateCard}
              >
                {card?.status === "active" ? (
                  <RefreshCw size={14} />
                ) : (
                  <KeyRound size={14} />
                )}{" "}
                {card?.status === "active"
                  ? "Create a new code"
                  : "Create delivery code"}
              </Button>
            </div>
            {!canGenerate && deliveryCardBlockedReason && <p className="mt-2 text-[11px] leading-4 text-muted-foreground">{deliveryCardBlockedReason}</p>}
            {card?.status === "active" && (
              <p className="mt-3 rounded-xl bg-muted/50 p-3 text-xs text-muted-foreground">
                Waiting for the buyer to verify the card. You’ll receive a
                notification and the tracking/activity records will update
                automatically.
              </p>
            )}
          </div>
        )}

        {delivery.handover.status === "not_started" &&
          isBuyer &&
          (card?.status === "active" ? (
            <div>
              <p className="text-xs leading-5 text-muted-foreground">
                When the product is in your hands, scan the rider’s card or
                enter its six-digit PIN. Verification records physical receipt only—it does not mean the item is fault-free or waive your consumer or warranty rights.
              </p>
              <p className="mt-2 rounded-lg bg-amber-500/10 p-2.5 text-[11px] leading-4 text-amber-800 dark:text-amber-200">
                Do not accept or confirm this delivery if the parcel or delivery person does not provide the matching Naitrust card or PIN.
              </p>
              <input
                ref={scanInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={(event) => void scanQrImage(event.target.files?.[0])}
              />
              <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center">
                <Button
                  type="button"
                  size="sm"
                  className="shrink-0 rounded-full"
                  disabled={confirmQr.isPending}
                  onClick={() => scanInputRef.current?.click()}
                >
                  <ScanLine size={15} /> Scan QR
                </Button>
                <span className="hidden text-[10px] uppercase text-muted-foreground sm:inline">
                  or
                </span>
                <div className="flex min-w-0 flex-1 gap-2">
                  <Input
                    aria-label="Six digit delivery code"
                    value={otp}
                    onChange={(event) =>
                      setOtp(event.target.value.replace(/\D/g, "").slice(0, 6))
                    }
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    placeholder="6-digit PIN"
                    className="h-9 min-w-0 font-mono tracking-[0.18em]"
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    className="shrink-0 rounded-full"
                    disabled={otp.length !== 6 || confirmOtp.isPending}
                    onClick={confirmWithOtp}
                  >
                    <KeyRound size={15} /> Verify
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="h-2 w-2 shrink-0 rounded-full bg-amber-400" />
              Waiting for the seller to create the delivery card. Verification
              will appear here when it is ready. Do not accept the product without the matching card or PIN.
            </div>
          ))}

        {delivery.handover.status === "in_progress" && (
          <div className="grid gap-5 md:grid-cols-[220px_1fr] md:items-center">
            <LiveDealCountdown
              deadline={delivery.handover.endsAt}
              label="Handover review time"
            />
            <div>
              <div className="flex items-center gap-2">
                <Clock3 size={16} className="text-primary" />
                <p className="text-sm font-semibold">
                  Check the product while the driver is here
                </p>
              </div>
              <p className="mt-1 text-xs leading-5 text-muted-foreground">
                Use these 10 minutes to inspect the item, packaging, contents
                and condition. The {fundingReviewLabel(delivery.fundingReview.extendedProductTestingDays)} has not started yet.
              </p>
              {isBuyer && !hasDispute && (
                <div className="mt-4 flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    className="rounded-full"
                    disabled={completeHandover.isPending}
                    onClick={() =>
                      completeHandover.mutate(undefined, {
                        onSuccess: () =>
                          toast.success(
                            `Delivery confirmed. The ${fundingReviewLabel(delivery.fundingReview.extendedProductTestingDays)} has started.`,
                          ),
                        onError: (error) => toast.error(actionError(error)),
                      })
                    }
                  >
                    <CheckCircle2 size={15} /> Accept & confirm delivery
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="rounded-full"
                    onClick={() => onUploadEvidence("Photo")}
                  >
                    <Upload size={14} /> Add optional buyer evidence
                  </Button>
                </div>
              )}
              {isSeller && (
                <p className="mt-3 rounded-xl bg-muted/50 p-3 text-xs text-muted-foreground">
                  The buyer is checking the product. Please keep the driver or
                  agent present until they confirm delivery or the handover
                  timer ends.
                </p>
              )}
            </div>
          </div>
        )}

        {delivery.fundingReview.status === "in_progress" && (
          <div className="overflow-hidden rounded-2xl border border-primary/15 bg-gradient-to-br from-primary/[0.07] via-background to-emerald-500/[0.06]">
            <div className="grid gap-5 p-4 sm:p-5 md:grid-cols-[250px_1fr] md:items-center">
              <LiveDealCountdown
                deadline={delivery.fundingReview.endsAt}
                label="Payment review time"
              />
              <div>
                <div className="flex items-center gap-2">
                  <ShieldCheck size={17} className="text-primary" />
                  <p className="text-sm font-semibold">
                    {fundingReviewLabel(
                      delivery.fundingReview.extendedProductTestingDays,
                    )}
                  </p>
                </div>
                <p className="mt-1 text-xs leading-5 text-muted-foreground">
                  Payment releases automatically when this review ends. The
                  seller may request an earlier release, but only the buyer can
                  approve it or report a problem. This deadline controls payment release only; statutory, manufacturer, and seller-warranty rights continue afterward.
                </p>
                {isBuyer && (
                  <div className="mt-3 flex items-start gap-2 rounded-xl border border-amber-500/25 bg-amber-500/[0.08] p-3 text-xs leading-5 text-foreground">
                    <AlertTriangle size={16} className="mt-0.5 shrink-0 text-amber-600" />
                    <p><strong>Check your purchase carefully.</strong> Make sure it is complete, correct, and in the agreed condition. Once payment is released, you can no longer open a Naitrust payment dispute for this deal.</p>
                  </div>
                )}
                {isBuyer && !hasDispute ? (
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      className="rounded-full"
                      onClick={() => setShowPin(true)}
                    >
                      <ShieldCheck size={15} /> Release payment now
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="rounded-full"
                      onClick={() => onUploadEvidence("Photo")}
                    >
                      <Upload size={14} /> Add optional buyer evidence
                    </Button>
                  </div>
                ) : isSeller && !hasDispute ? (
                  <div className="mt-4">
                    <Button
                      size="sm"
                      variant="outline"
                      className="rounded-full"
                      disabled={releaseRequested}
                      onClick={() => {
                        setReleaseRequested(true);
                        toast.success("Release request sent to the buyer.");
                      }}
                    >
                      <HandCoins size={15} />
                      {releaseRequested
                        ? "Release requested"
                        : "Request fund release"}
                    </Button>
                    {releaseRequested && (
                      <p className="mt-2 text-[11px] text-muted-foreground">
                        The buyer has been notified. The review continues unless
                        they approve early release.
                      </p>
                    )}
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        )}

        {(hasDispute ||
          delivery.fundingReview.status === "blocked" ||
          delivery.handover.status === "issue_reported") && (
          <StatusNotice
            danger
            title="Payment is paused"
            text="A problem was reported. Funds remain protected and will never release automatically while evidence is inconclusive or the dispute is under review."
          />
        )}
        {delivery.fundingReview.status === "release_approved" && (
          <StatusNotice
            title="Payment release approved"
            text="The payment partner is processing the seller payout."
          />
        )}
        {delivery.fundingReview.status === "paid_out" && (
          <StatusNotice
            title="Payment completed"
            text={`The seller has been paid ${delivery.fundingReview.releaseMethod === 'buyer_approved' ? 'after buyer approval' : 'automatically when the review ended'}. Released ${delivery.fundingReview.paidOutAt ? new Date(delivery.fundingReview.paidOutAt).toLocaleString() : 'successfully'}${delivery.fundingReview.paymentReference ? ` · Reference ${delivery.fundingReview.paymentReference}` : ''}. The Deal Room record remains available, but a Naitrust payment dispute can no longer be opened. Statutory, warranty, fraud-reporting, and other legal rights are not removed.`}
          />
        )}
      </div>

      <div className="border-t bg-muted/20 px-4 py-4 sm:px-5">
        <p className="text-xs font-semibold">Delivery responsibility</p>
        <p className="mt-1 text-[11px] leading-5 text-muted-foreground">
          Naitrust does not transport or insure goods, but it freezes protected payment when a delivery problem is reported. For seller-arranged delivery, the seller remains responsible until agreed-condition receipt. Buyer-arranged courier risk depends on documented handover, the deal terms, and applicable law. Return-delivery costs follow fault or the parties’ recorded resolution.
        </p>
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
        title="Release protected payment now?"
        description="You are releasing this payment early. Confirm that you have checked the purchase and are satisfied."
        warning="Once released, Naitrust cannot freeze or reverse this payment from the Deal Room, and you can no longer open a Naitrust payment dispute for it. Statutory and warranty rights are not removed."
        onVerified={() =>
          release.mutate(undefined, {
            onSuccess: () => toast.success("Payment release approved."),
            onError: (error) => toast.error(actionError(error)),
          })
        }
      />
    </Card>
  );
}

function StatusNotice({
  title,
  text,
  danger = false,
}: {
  title: string;
  text: string;
  danger?: boolean;
}) {
  return (
    <div
      className={`flex items-start gap-3 rounded-2xl border p-4 ${danger ? "border-destructive/20 bg-destructive/[0.06]" : "border-emerald-500/20 bg-emerald-500/[0.07]"}`}
    >
      <span className={danger ? "text-destructive" : "text-emerald-600"}>
        {danger ? <AlertTriangle size={18} /> : <ShieldCheck size={18} />}
      </span>
      <div>
        <p className="text-sm font-semibold">{title}</p>
        <p className="mt-1 text-xs leading-5 text-muted-foreground">{text}</p>
      </div>
    </div>
  );
}
