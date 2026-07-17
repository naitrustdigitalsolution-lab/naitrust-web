/**
 * ResetPasswordForm
 * Sets a new password after the reset OTP has been verified.
 */

import { CheckCircle, Loader2, Lock } from 'lucide-react';
import { Button } from '../../ui/button';
import { Card } from '../../ui/card';
import { PasswordInput } from '../../ui/input';
import { Label } from '../../ui/label';

interface ResetPasswordFormProps {
  newPassword: string;
  confirmPassword: string;
  error: string;
  isResetting: boolean;
  onNewPassword: (value: string) => void;
  onConfirmPassword: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export function ResetPasswordForm({
  newPassword,
  confirmPassword,
  error,
  isResetting,
  onNewPassword,
  onConfirmPassword,
  onSubmit,
}: ResetPasswordFormProps) {
  return (
    <Card className="mx-auto w-full max-w-md border-none sm:border-border/60 bg-card/95 p-5 sm:shadow-2xl backdrop-blur-sm md:p-8">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-500/10 rounded-2xl mb-4">
          <Lock size={32} className="text-blue-500" />
        </div>
        <h2 className="mb-2 text-2xl font-bold">Create New Password</h2>
        <p className="text-muted-foreground">Enter a strong password for your account</p>
      </div>

      <form onSubmit={onSubmit} className="space-y-5">
        {error && <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-xl text-sm">{error}</div>}
        <div className="space-y-2">
          <Label htmlFor="new-password">New Password</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground z-10" size={18} />
            <PasswordInput
              id="new-password"
              placeholder="••••••••"
              value={newPassword}
              onChange={(e) => onNewPassword(e.target.value)}
              className="pl-10 h-11"
              required
              minLength={8}
            />
          </div>
          <p className="text-xs text-muted-foreground">At least 8 characters</p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="confirm-password">Confirm Password</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground z-10" size={18} />
            <PasswordInput
              id="confirm-password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => onConfirmPassword(e.target.value)}
              className="pl-10 h-11"
              required
              minLength={8}
            />
          </div>
        </div>
        <Button type="submit" className="h-12 w-full rounded-full" size="lg" disabled={isResetting}>
          {isResetting ? (
            <>
              <Loader2 size={18} className="mr-2 animate-spin" />
              Resetting...
            </>
          ) : (
            <>
              Reset Password
              <CheckCircle size={18} className="ml-2" />
            </>
          )}
        </Button>
      </form>
    </Card>
  );
}
