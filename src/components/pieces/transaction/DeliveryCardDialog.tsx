import { useRef } from 'react';
import { Copy, Download, FileDown, ShieldCheck } from 'lucide-react';
import QRCode from 'react-qr-code';
import { toPng } from 'html-to-image';
import { toast } from 'sonner';
import type { DealDeliveryCard } from '../../../libs/store/types';
import { downloadDeliveryCardPdf } from '../../../libs/utils/deal-documents';
import { Button } from '../../ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../../ui/dialog';
import { NaitrustLogo } from '../../utility/NaitrustLogo';

interface DeliveryCardDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  reference: string;
  card: DealDeliveryCard;
}

export function DeliveryCardDialog({
  open,
  onOpenChange,
  title,
  reference,
  card,
}: DeliveryCardDialogProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const handoverUrl = `${window.location.origin}/delivery/${card.token}`;

  const copyOtp = async () => {
    await navigator.clipboard.writeText(card.otpCode);
    toast.success('Handover OTP copied.');
  };

  const downloadPng = async () => {
    if (!cardRef.current) return;
    const dataUrl = await toPng(cardRef.current, { pixelRatio: 3, backgroundColor: '#ffffff' });
    const link = document.createElement('a');
    link.download = `naitrust-delivery-${reference}.png`;
    link.href = dataUrl;
    link.click();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Delivery card</DialogTitle>
          <DialogDescription>
            Attach this single use card to the parcel or give it to the delivery agent or person. The buyer verifies it only with the product physically present. Regenerating it invalidates this code.
          </DialogDescription>
        </DialogHeader>

        <div ref={cardRef} className="overflow-hidden rounded-[1.5rem] border bg-white text-[#071b31] shadow-sm">
          <div className="bg-[#071b31] px-6 py-5 text-white">
            <NaitrustLogo size="sm" textColor="text-white" />
            <p className="mt-4 text-[0.65rem] font-bold uppercase tracking-[0.2em] text-white/60">Secure product handover</p>
            <h3 className="mt-1 text-xl font-bold leading-tight text-white">{title}</h3>
            <p className="mt-1 text-xs text-white/60">{reference}</p>
          </div>

          <div className="grid gap-5 p-6 sm:grid-cols-[180px_1fr] sm:items-center">
            <div className="mx-auto rounded-2xl border bg-white p-3">
              <QRCode value={handoverUrl} size={156} bgColor="#ffffff" fgColor="#071b31" level="H" />
            </div>
            <div>
              <p className="text-[0.65rem] font-bold uppercase tracking-[0.16em] text-slate-500">Handover OTP</p>
              <p className="mt-1 text-3xl font-black tracking-[0.22em]">{card.otpCode}</p>
              <p className="mt-4 text-[0.65rem] font-bold uppercase tracking-[0.16em] text-slate-500">Expires</p>
              <p className="mt-1 text-sm font-semibold">
                {new Date(card.expiresAt).toLocaleString('en-NG', { dateStyle: 'medium', timeStyle: 'short' })}
              </p>
            </div>
          </div>

          <div className="mx-6 mb-6 rounded-2xl bg-[#eaf7f3] p-4">
            <p className="flex items-center gap-2 text-sm font-bold text-emerald-900">
              <ShieldCheck size={16} /> Buyer instructions
            </p>
            <ol className="mt-2 list-decimal space-y-1 pl-4 text-xs leading-5 text-emerald-950/75">
              <li>Inspect the package, seal, product model, and serial or IMEI with the rider present.</li>
              <li>Scan the QR or enter the OTP in your Deal Room.</li>
              <li>Confirm the correct product or report a problem during the handover review.</li>
            </ol>
            <p className="mt-3 border-t border-emerald-900/10 pt-3 text-[0.7rem] leading-5 text-emerald-950/70">
              Receipt confirmation does not release payment or waive defect or consumer rights.
            </p>
          </div>
        </div>

        <div className="grid gap-2 sm:grid-cols-3">
          <Button variant="outline" className="rounded-full" onClick={() => void copyOtp()}>
            <Copy size={15} /> Copy OTP
          </Button>
          <Button
            variant="outline"
            className="rounded-full"
            onClick={() =>
              toast.promise(downloadPng(), {
                loading: 'Preparing PNG…',
                success: 'Delivery card PNG downloaded.',
                error: 'Could not create the PNG.',
              })
            }
          >
            <Download size={15} /> PNG
          </Button>
          <Button
            className="rounded-full"
            onClick={() =>
              toast.promise(downloadDeliveryCardPdf({ title, reference, card, handoverUrl }), {
                loading: 'Preparing PDF…',
                success: 'Delivery card PDF downloaded.',
                error: 'Could not create the PDF.',
              })
            }
          >
            <FileDown size={15} /> PDF
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
