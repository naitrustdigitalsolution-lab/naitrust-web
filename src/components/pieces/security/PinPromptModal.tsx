/**
 * PinPromptModal
 * Requires the user's 4-digit transaction PIN before a sensitive action
 * (creating a deal, accepting an invite, releasing funds). If no PIN is set,
 * it routes the user to set one first. Production verifies the PIN server-side
 * (securityApi.verifyPin); the mock also matches the locally-set value.
 */

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { KeyRound, Loader2, ShieldCheck } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../../ui/dialog';
import { Button } from '../../ui/button';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '../../ui/input-otp';
import { useSecurity } from '../../../hooks/useSecurity';
import { securityApi } from '../../../libs/api/security.api';

interface PinPromptModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onVerified: () => void;
  title?: string;
  description?: string;
}

export function PinPromptModal({
  open,
  onOpenChange,
  onVerified,
  title = 'Enter your transaction PIN',
  description = 'For your security, confirm this action with your 4-digit PIN.',
}: PinPromptModalProps) {
  const navigate = useNavigate();
  const { pinSet, pin: setPinValue } = useSecurity();
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [verifying, setVerifying] = useState(false);

  useEffect(() => {
    if (!open) {
      setPin('');
      setError('');
      setVerifying(false);
    }
  }, [open]);

  const submit = async (value: string) => {
    setVerifying(true);
    setError('');
    try {
      const res = await securityApi.verifyPin(value);
      // Mock also checks the entered PIN matches the one the user set.
      if (res.data.valid && value === setPinValue) {
        onVerified();
        onOpenChange(false);
      } else {
        setError('Incorrect PIN. Please try again.');
        setPin('');
      }
    } catch {
      setError('Could not verify your PIN. Please try again.');
      setPin('');
    } finally {
      setVerifying(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShieldCheck size={18} className="text-primary" />
            {title}
          </DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        {!pinSet ? (
          <div className="flex flex-col items-center gap-3 py-4 text-center">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <KeyRound size={22} />
            </div>
            <p className="text-sm font-medium text-foreground">Set up your transaction PIN first</p>
            <p className="max-w-xs text-xs text-muted-foreground">
              A 4-digit PIN protects every money-moving action on your account.
            </p>
            <Button
              className="mt-1 rounded-full"
              onClick={() => {
                onOpenChange(false);
                navigate('/app/security');
              }}
            >
              Set up PIN
            </Button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4 py-4">
            <InputOTP
              maxLength={4}
              value={pin}
              onChange={(v) => {
                setPin(v);
                setError('');
                if (v.length === 4) void submit(v);
              }}
              disabled={verifying}
            >
              <InputOTPGroup>
                {[0, 1, 2, 3].map((i) => (
                  <InputOTPSlot key={i} index={i} className="h-12 w-12 text-lg" />
                ))}
              </InputOTPGroup>
            </InputOTP>
            {verifying && (
              <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Loader2 size={12} className="animate-spin" />
                Verifying…
              </p>
            )}
            {error && <p className="text-xs text-destructive">{error}</p>}
            <p className="text-center text-[0.7rem] text-muted-foreground">
              Never share your PIN. Naitrust staff will never ask for it.
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
