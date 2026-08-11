/**
 * LoginForm
 * The email or phone + password sign-in card.
 * State and submission live in the parent LoginPage; this renders the view.
 */

import { ArrowRight, Lock, UserRound } from 'lucide-react';
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
  onRegister,
}: LoginFormProps) {
  return (
    <Card className="mx-auto w-full max-w-md border-none bg-card/95 p-0 sm:rounded-2xl sm:border sm:border-border/70 sm:p-8 sm:shadow-2xl">
      <div className="text-center mb-8">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl p-2">
          <img src={icon} alt="Naitrust logo" className="h-full w-full" />
        </div>
        <p className="mb-2 text-sm font-semibold text-primary">Secure sign in</p>
        <h2 className="mb-2 text-2xl font-bold text-[#0b2b45] dark:text-white">Welcome back</h2>
        <p className="text-sm leading-6 text-muted-foreground">Use the email or phone number connected to your account.</p>
      </div>

      <form onSubmit={onSubmit} className="space-y-5">
        {error && (
          <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-xl text-sm">
            {error}
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="email">Email or phone number</Label>
          <div className="relative">
            <UserRound className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
            <Input
              id="email"
              type="text"
              inputMode="text"
              autoComplete="username"
              placeholder="Email address or +234 phone number"
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

        <Button type="submit" className="h-12 w-full rounded-lg" size="lg" disabled={isLoading}>
          {isLoading ? (
            <>
              <Spinner size="sm" colorClass="text-white" />
              <span className="ml-2">Logging in...</span>
            </>
          ) : (
            <>
              Sign in securely
              <ArrowRight size={18} className="ml-2" />
            </>
          )}
        </Button>
      </form>

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
