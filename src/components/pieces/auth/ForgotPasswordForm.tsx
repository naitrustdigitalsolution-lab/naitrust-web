/**
 * ForgotPasswordForm
 * Collects the account email and sends a password-reset verification code.
 */

import { ArrowLeft, ArrowRight, KeyRound, Loader2, Mail } from 'lucide-react';
import { Button } from '../../ui/button';
import { Card } from '../../ui/card';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';

interface ForgotPasswordFormProps {
  email: string;
  error: string;
  isSending: boolean;
  onChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onBack: () => void;
}

export function ForgotPasswordForm({ email, error, isSending, onChange, onSubmit, onBack }: ForgotPasswordFormProps) {
  return (
    <Card className="mx-auto w-full max-w-md border-none sm:border-border/60 bg-card/95 p-5 sm:shadow-2xl backdrop-blur-sm md:p-8">
      <button onClick={onBack} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-6">
        <ArrowLeft size={16} />
        Back to login
      </button>

      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-500/10 rounded-2xl mb-4">
          <KeyRound size={32} className="text-orange-500" />
        </div>
        <h2 className="mb-2 text-2xl font-bold">Forgot Password?</h2>
        <p className="text-muted-foreground">No worries! We'll send you a verification code</p>
      </div>

      <form onSubmit={onSubmit} className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="reset-email">Email Address</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
            <Input
              id="reset-email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => onChange(e.target.value)}
              className="pl-10 h-11"
              required
            />
          </div>
        </div>
        {error && <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-xl text-sm">{error}</div>}
        <Button type="submit" className="h-12 w-full rounded-full" size="lg" disabled={isSending}>
          {isSending ? (
            <>
              <Loader2 size={18} className="mr-2 animate-spin" />
              Sending...
            </>
          ) : (
            <>
              Send Verification Code
              <ArrowRight size={18} className="ml-2" />
            </>
          )}
        </Button>
      </form>
    </Card>
  );
}
