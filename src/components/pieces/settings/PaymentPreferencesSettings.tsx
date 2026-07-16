import { CreditCard, Info, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../ui/card';
import { Label } from '../../ui/label';

interface PaymentPreferencesSettingsProps {
  preferences: {
    preferredPaymentMethod?: 'one_time' | 'auto_renew';
  };
  onUpdate: (preferences: {
    preferredPaymentMethod?: 'one_time' | 'auto_renew';
  }) => void;
  isSaving?: boolean;
}

export function PaymentPreferencesSettings({
  preferences,
  onUpdate,
  isSaving = false,
}: PaymentPreferencesSettingsProps) {
  const current = preferences.preferredPaymentMethod || 'one_time';

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard size={24} />
          Payment Preferences
        </CardTitle>
        <CardDescription>
          Choose how you want to handle subscription payments
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <Label className="text-sm font-medium mb-2 block">Payment Type</Label>
          <p className="text-xs text-muted-foreground mb-3">
            This controls how your subscription renewals are processed via Paystack.
          </p>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => onUpdate({ preferredPaymentMethod: 'one_time' })}
              className={`px-4 py-3 rounded-lg border text-sm font-medium transition-all text-left ${
                current === 'one_time'
                  ? 'border-primary bg-primary/10 text-primary ring-1 ring-primary/20'
                  : 'border-border hover:border-primary/40'
              }`}
            >
              <div className="flex items-center gap-1.5">
                <CreditCard size={14} />
                <span className="font-semibold">One-time</span>
              </div>
              <p className="text-xs font-normal mt-0.5 opacity-70">
                Pay manually each billing cycle
              </p>
            </button>
            <button
              onClick={() => onUpdate({ preferredPaymentMethod: 'auto_renew' })}
              className={`px-4 py-3 rounded-lg border text-sm font-medium transition-all text-left ${
                current === 'auto_renew'
                  ? 'border-primary bg-primary/10 text-primary ring-1 ring-primary/20'
                  : 'border-border hover:border-primary/40'
              }`}
            >
              <div className="flex items-center gap-1.5">
                <RefreshCw size={14} />
                <span className="font-semibold">Auto-renew</span>
              </div>
              <p className="text-xs font-normal mt-0.5 opacity-70">
                Charged automatically via Paystack
              </p>
            </button>
          </div>
        </div>

        <div className="bg-muted/50 rounded-lg p-4 space-y-2">
          <div className="flex items-start gap-3">
            <Info className="text-primary mt-0.5 shrink-0" size={20} />
            <div className="text-sm text-muted-foreground space-y-2">
              <p className="font-medium text-foreground">How it works</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>
                  <strong>One-time:</strong> You pay manually each time your subscription is due. We'll send you email reminders before it expires.
                </li>
                <li>
                  <strong>Auto-renew:</strong> Paystack automatically charges your card on file when your subscription is due. No action required.
                </li>
              </ul>
              <p className="mt-2 text-xs">
                You can change this setting at any time. Your next renewal will use whichever option is selected.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
