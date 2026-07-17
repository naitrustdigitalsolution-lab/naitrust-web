/**
 * LoginForm
 * The email + password sign-in card (with Google option and a link to sign up).
 * State and submission live in the parent LoginPage; this renders the view.
 */

import { ArrowRight, Lock, Mail } from 'lucide-react';
import { Button } from '../../ui/button';
import { Card } from '../../ui/card';
import { Input, PasswordInput } from '../../ui/input';
import { Label } from '../../ui/label';
import Spinner from '../../ui/spinner';
import icon from '../../../assets/naitrust-logo/naitrust-icon-3.png';

interface LoginFormProps {
  email: string;
  password: string;
  error: string;
  isLoading: boolean;
  onEmailChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onForgot: () => void;
  onGoogle: () => void;
  onRegister: () => void;
}

export function LoginForm({
  email,
  password,
  error,
  isLoading,
  onEmailChange,
  onPasswordChange,
  onSubmit,
  onForgot,
  onGoogle,
  onRegister,
}: LoginFormProps) {
  return (
    <Card className="mx-auto w-full max-w-md border-none sm:border-border/60 bg-card/95 sm:p-5 md:p-8 sm:shadow-2xl">
      <div className="text-center mb-8">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl p-2">
          <img src={icon} alt="Naitrust logo" className="h-full w-full" />
        </div>
        <h2 className="mb-2 text-2xl font-bold">Welcome back</h2>
        <p className="text-sm leading-6 text-muted-foreground">Access your transaction rooms, evidence, and pending actions.</p>
      </div>

      <form onSubmit={onSubmit} className="space-y-5">
        {error && (
          <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-xl text-sm">
            {error}
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="email">Email Address</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => onEmailChange(e.target.value)}
              className="pl-10 h-11"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <button type="button" onClick={onForgot} className="text-xs text-primary hover:underline">
              Forgot password?
            </button>
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground z-10" size={18} />
            <PasswordInput
              id="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => onPasswordChange(e.target.value)}
              className="pl-10 h-11"
              required
            />
          </div>
        </div>

        <Button type="submit" className="h-12 w-full rounded-full" size="lg" disabled={isLoading}>
          {isLoading ? (
            <>
              <Spinner size="sm" colorClass="text-white" />
              <span className="ml-2">Logging in...</span>
            </>
          ) : (
            <>
              Login to account
              <ArrowRight size={18} className="ml-2" />
            </>
          )}
        </Button>
      </form>

      <div className="mt-6 relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
        </div>
      </div>

      <Button type="button" variant="outline" className="mt-6 h-12 w-full rounded-full" onClick={onGoogle}>
        <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
          <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
          <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
          <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
          <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
        </svg>
        Continue with Google
      </Button>

      <div className="mt-6 rounded-xl border border-primary/15 bg-primary/5 p-3 text-center text-xs leading-5 text-muted-foreground">
        Keep your password private. Naitrust will never ask for your password, OTP, or private account details outside secure sign-in.
      </div>

      <div className="mt-6 text-center">
        <button onClick={onRegister} className="text-sm text-muted-foreground hover:text-primary transition-colors">
          Don't have an account? <strong className="text-primary">Sign up free</strong>
        </button>
      </div>
    </Card>
  );
}
