/**
 * TwoFactorForm
 * The 6-digit authenticator-code step shown after a password login when the
 * account has 2FA enabled.
 */

import { ArrowLeft, ArrowRight, Shield } from 'lucide-react';
import { Button } from '../../ui/button';
import { Card } from '../../ui/card';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '../../ui/input-otp';
import Spinner from '../../ui/spinner';

interface TwoFactorFormProps {
  code: string;
  error: string;
  isLoading: boolean;
  onChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onBack: () => void;
}

export function TwoFactorForm({ code, error, isLoading, onChange, onSubmit, onBack }: TwoFactorFormProps) {
  return (
    <Card className="mx-auto w-full max-w-md sm:border-border/60 bg-card/95 sm:p-5 md:p-8 sm:shadow-2xl backdrop-blur-sm">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-6"
      >
        <ArrowLeft size={16} />
        Back to login
      </button>

      <div className="mb-6 text-center">
        <div className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
          <Shield size={24} className="text-primary" />
        </div>
        <h2 className="mb-2 text-2xl font-bold">Two-Factor Authentication</h2>
        <p className="text-muted-foreground">Enter the current 6-digit code shown in your authenticator app.</p>
      </div>

      <form onSubmit={onSubmit} className="space-y-5">
        {error && (
          <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-xl text-sm">{error}</div>
        )}
        <div className="flex justify-center">
          <InputOTP maxLength={6} value={code} onChange={onChange} disabled={isLoading} autoComplete="one-time-code" aria-label="Six-digit authenticator code">
            <InputOTPGroup>
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <InputOTPSlot key={i} index={i} />
              ))}
            </InputOTPGroup>
          </InputOTP>
        </div>
        <Button type="submit" className="h-12 w-full rounded-lg" size="lg" disabled={isLoading || code.length !== 6}>
          {isLoading ? (
            <>
              <Spinner size="sm" colorClass="text-white" />
              <span className="ml-2">Verifying...</span>
            </>
          ) : (
            <>
              Verify code
              <ArrowRight size={18} className="ml-2" />
            </>
          )}
        </Button>
      </form>
    </Card>
  );
}
