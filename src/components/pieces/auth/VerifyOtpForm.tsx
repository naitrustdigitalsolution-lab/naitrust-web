/**
 * VerifyOtpForm
 * Enters the 6-digit code sent to the user's email during password reset.
 */

import { ArrowLeft, ArrowRight, Loader2, Sparkles } from 'lucide-react';
import { Button } from '../../ui/button';
import { Card } from '../../ui/card';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '../../ui/input-otp';

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
  return (
    <Card className="mx-auto w-full max-w-md border-none sm:border-border/60 bg-card/95 p-5 sm:shadow-2xl backdrop-blur-sm md:p-8">
      <button onClick={onBack} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-6">
        <ArrowLeft size={16} />
        Back
      </button>

      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-green-500/10 rounded-2xl mb-4">
          <Sparkles size={32} className="text-green-500" />
        </div>
        <h2 className="mb-2 text-2xl font-bold">Enter Verification Code</h2>
        <p className="text-muted-foreground">
          We sent a 6-digit code to
          <br />
          <strong>{email}</strong>
        </p>
      </div>

      <form onSubmit={onSubmit} className="space-y-6">
        {error && <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-xl text-sm">{error}</div>}
        <div className="flex justify-center">
          <InputOTP maxLength={6} value={otp} onChange={onChange} disabled={isVerifying}>
            <InputOTPGroup>
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <InputOTPSlot key={i} index={i} className="w-12 h-12 text-lg" />
              ))}
            </InputOTPGroup>
          </InputOTP>
        </div>
        <Button type="submit" className="h-12 w-full rounded-full" size="lg" disabled={isVerifying || otp.length !== 6}>
          {isVerifying ? (
            <>
              <Loader2 size={18} className="mr-2 animate-spin" />
              Verifying...
            </>
          ) : (
            <>
              Verify Code
              <ArrowRight size={18} className="ml-2" />
            </>
          )}
        </Button>
        <div className="text-center">
          <button type="button" onClick={onResend} className="text-sm text-muted-foreground hover:text-primary transition-colors">
            Didn't receive code? <strong>Resend</strong>
          </button>
        </div>
      </form>
    </Card>
  );
}
