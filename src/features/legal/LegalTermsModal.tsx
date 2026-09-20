import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { Button } from '../../components/ui/button';
import { formatMinorAmount } from '../../libs/utils/safe-deal-presentation';
import { legalTermsSections } from './terms';
import type { LegalFee } from './types';

export function LegalTermsModal({ open, onOpenChange, providerName, purpose, fee, onAccept, busy = false }: {
  open: boolean; onOpenChange: (open: boolean) => void; providerName: string; purpose: string; fee: LegalFee; onAccept: () => void; busy?: boolean;
}) {
  const [checked, setChecked] = useState(false);
  return <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
      <DialogHeader><DialogTitle>Legal review agreement</DialogTitle><DialogDescription>Read the terms before adding {providerName} to this room.</DialogDescription></DialogHeader>
      <div className="space-y-5 text-sm leading-6">
        <div className="rounded-xl bg-muted/40 p-4"><p className="font-semibold">{providerName}</p><p className="text-muted-foreground">{purpose}</p></div>
        {legalTermsSections.map(section => <section key={section.heading}><h3 className="font-semibold">{section.heading}</h3><p className="mt-1 text-muted-foreground">{section.body}</p></section>)}
        <dl className="grid grid-cols-2 gap-2 rounded-xl border p-4"><dt>Deal amount</dt><dd>{formatMinorAmount(fee.principalMinor, fee.currency)}</dd><dt>Platform fee</dt><dd>{formatMinorAmount(fee.platformFeeMinor, fee.currency)}</dd><dt>Additional legal fee ({fee.rateBps / 100}%)</dt><dd>{formatMinorAmount(fee.amountMinor, fee.currency)}</dd><dt className="font-semibold">Total payable by payer</dt><dd className="font-semibold">{formatMinorAmount(fee.principalMinor + fee.platformFeeMinor + fee.amountMinor, fee.currency)}</dd></dl>
        <label className="flex items-start gap-3"><input type="checkbox" className="mt-1.5" checked={checked} onChange={e => setChecked(e.target.checked)} /><span>I have read and agree to the legal review terms, including ongoing document access and the additional fee.</span></label>
        <p className="text-xs text-muted-foreground">Legal review payments are not available until the service launches.</p>
      </div>
      <DialogFooter><Button variant="outline" onClick={() => onOpenChange(false)}>Back</Button><Button disabled={!checked || busy} onClick={onAccept}>Accept legal terms</Button></DialogFooter>
    </DialogContent>
  </Dialog>;
}
