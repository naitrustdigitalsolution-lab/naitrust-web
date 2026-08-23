/**
 * VerifyOtpForm
 * Enters the 6-digit code sent to the user's email during password reset.
 */

import { ArrowLeft, ArrowRight, Loader2, Sparkles } from 'lucide-react';
import { Button } from '../../ui/button';
import { Card } from '../../ui/card';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '../../ui/input-otp';
import { useTranslation } from 'react-i18next';

interface VerifyOtpFormProps {
  otp: string;
  email: string;
  error: string;
  isVerifying: boolean;
  onChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onBack: () => void;
  onResend: () => void;
}

export function VerifyOtpForm({ otp, email, error, isVerifying, onChange, onSubmit, onBack, onResend }: VerifyOtpFormProps) {
  const { t } = useTranslation('auth');
  return (
    <Card className="mx-auto w-full max-w-md border-none bg-card/95 p-0 sm:rounded-2xl sm:border sm:border-border/70 sm:p-8 sm:shadow-2xl">
      <button onClick={onBack} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-6">
        <ArrowLeft size={16} />
        {t('back')}
      </button>

      <div className="mb-6 text-center">
        <div className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-green-500/10">
          <Sparkles size={24} className="text-green-500" />
        </div>
        <h2 className="mb-2 text-2xl font-bold">{t('verificationTitle')}</h2>
        <p className="text-muted-foreground">
          {t('verificationSent')}
          <br />
          <strong>{email}</strong>
        </p>
      </div>

      <form onSubmit={onSubmit} className="space-y-5">
        {error && <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-xl text-sm">{error}</div>}
        <div className="flex justify-center">
          <InputOTP maxLength={6} value={otp} onChange={onChange} disabled={isVerifying} autoComplete="one-time-code" aria-label={t('emailCode')}>
            <InputOTPGroup>
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <InputOTPSlot key={i} index={i} />
              ))}
            </InputOTPGroup>
          </InputOTP>
        </div>
        <Button type="submit" className="h-12 w-full rounded-lg" size="lg" disabled={isVerifying || otp.length !== 6}>
          {isVerifying ? (
            <>
              <Loader2 size={18} className="mr-2 animate-spin" />
              {t('verifying')}
            </>
          ) : (
            <>
              {t('verifyCode')}
              <ArrowRight size={18} className="ml-2" />
            </>
          )}
        </Button>
        <div className="text-center">
          <button type="button" onClick={onResend} className="text-sm text-muted-foreground hover:text-primary transition-colors">
            {t('noCode')} <strong>{t('resend')}</strong>
          </button>
        </div>
      </form>
    </Card>
  );
}
