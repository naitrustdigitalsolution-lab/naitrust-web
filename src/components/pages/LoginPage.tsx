import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Shield, Mail, Lock, ArrowRight, CheckCircle, KeyRound, ArrowLeft, Loader2, Sparkles, ShieldCheck, Landmark, FileCheck, Clock3 } from 'lucide-react';
import { Button } from '../ui/button';
import { Input, PasswordInput } from '../ui/input';
import { Label } from '../ui/label';
import { Card } from '../ui/card';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '../ui/input-otp';
import { useAuth } from '../../libs/auth-context';
import { useAuthStore } from '../../libs/store/auth.store';
import { motion, AnimatePresence } from 'motion/react';
import { authApi } from '../../libs/api';
import { toast } from 'sonner';
import icon from '../../assets/naitrust-logo/naitrust-icon-3.png';
import Spinner from '../ui/spinner';
import { NaitrustLogo } from '../utility/NaitrustLogo';
import spiralBackground from '../../assets/spiral.svg';
import { useTheme } from '@/hooks/useTheme';

interface LoginPageProps {
  onNavigate: (page: string) => void;
  initialView?: AuthView;
  initialEmail?: string;
}

type AuthView =
  | 'login'
  | 'verify-2fa'
  | 'forgot-password'
  | 'verify-otp'
  | 'reset-password';

export function LoginPage({ onNavigate, initialView = 'login', initialEmail = '' }: LoginPageProps) {
  const { login, verify2FALogin } = useAuth();
  const location = useLocation();
  const routerNavigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [otp, setOtp] = useState('');
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [pending2FAUserId, setPending2FAUserId] = useState<string | null>(null);
  const [resetEmail, setResetEmail] = useState(initialEmail);
  const { isDarkMode, toggleTheme } = useTheme();
  const fromPath = (location.state as any)?.from?.pathname as string | undefined;
  const fromSearch = (location.state as any)?.from?.search as string | undefined;
  const shouldRedirectBack = fromPath === '/business/subscription' && fromSearch?.includes('source=email');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const [view, setView] = useState<AuthView>(initialView);

  const trustHighlights = [
    {
      icon: ShieldCheck,
      title: 'Verified parties',
      text: 'Review who you are dealing with before the transaction moves forward.',
    },
    {
      icon: Landmark,
      title: 'Partner payment rails',
      text: 'Track funding, release, and refund instructions through trusted workflows.',
    },
    {
      icon: FileCheck,
      title: 'Evidence trail',
      text: 'Keep terms, delivery proof, receipts, and issue notes tied to the deal.',
    },
  ];

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const result = await login(email, password);

      if (result && typeof result === 'object' && 'requires2FA' in result && result.requires2FA) {
        const userData = result.user;
        if (userData?.id) {
          setPending2FAUserId(userData.id);
        }
        setView('verify-2fa');
        setIsLoading(false);
        return;
      }

      if (result === true) {
        const loggedInUser = useAuthStore.getState().user;

        if (loggedInUser) {
          if (loggedInUser.role === 'business') {
            const pendingVerificationTier = localStorage.getItem('pendingVerificationTier');
            const pendingBusinessId = localStorage.getItem('pendingBusinessId');

            if (pendingVerificationTier && pendingVerificationTier !== 'unverified' && pendingBusinessId) {
              sessionStorage.setItem('cacVerificationBusinessId', pendingBusinessId);
              onNavigate('cac-verification');
              return;
            }
          }

          if (shouldRedirectBack && fromPath) {
            routerNavigate(fromPath + (fromSearch || ''), { replace: true });
            return;
          }

          switch (loggedInUser.role) {
            case 'customer':
              onNavigate('customer-dashboard');
              break;
            case 'business':
              onNavigate('business-dashboard');
              break;
            case 'admin':
              onNavigate('admin-dashboard');
              break;
            default:
              onNavigate('home');
          }
        }
      } else {
        setError('Invalid email or password. Please try again or register a new account.');
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Login failed. Please try again.';
      if (errorMessage.includes('Invalid email') || errorMessage.includes('password')) {
        setError('Invalid email or password. If you haven\'t registered yet, please create an account first.');
      } else {
        setError(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify2FA = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!twoFactorCode || twoFactorCode.length !== 6) {
      setError('Please enter a valid 6-digit code');
      return;
    }

    setIsLoading(true);

    try {
      const userId = pending2FAUserId || useAuthStore.getState().user?.id;
      const success = await verify2FALogin(userId || email, twoFactorCode);

      if (success) {
        const loggedInUser = useAuthStore.getState().user;

        if (loggedInUser) {
          setPending2FAUserId(null);

          if (shouldRedirectBack && fromPath) {
            routerNavigate(fromPath + (fromSearch || ''), { replace: true });
            return;
          }

          switch (loggedInUser.role) {
            case 'customer':
              onNavigate('customer-dashboard');
              break;
            case 'business':
              onNavigate('business-dashboard');
              break;
            case 'admin':
              onNavigate('admin-dashboard');
              break;
            default:
              onNavigate('home');
          }
        } else {
          setError('Login successful but user data not found. Please try logging in again.');
        }
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Invalid code. Please try again.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!resetEmail) {
      setError('Please enter your email address');
      return;
    }

    setIsSendingOtp(true);
    try {
      const response = await authApi.forgotPassword(resetEmail);
      if (response.success) {
        toast.success('OTP has been sent to your email');
        setView('verify-otp');
      } else {
        setError(response.message || 'Failed to send OTP. Please try again.');
      }
    } catch {
      toast.success('If the email exists, an OTP has been sent.');
      setView('verify-otp');
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!otp || otp.length !== 6) {
      setError('Please enter a valid 6-digit OTP');
      return;
    }

    setIsVerifyingOtp(true);
    try {
      const response = await authApi.verifyOtp(resetEmail, otp);
      if (response.success && response.data?.resetToken) {
        setResetToken(response.data.resetToken);
        toast.success('OTP verified successfully');
        setView('reset-password');
      } else {
        setError(response.message || 'Invalid OTP. Please try again.');
      }
    } catch (error: any) {
      setError(error.message || 'Invalid or expired OTP. Please request a new one.');
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!newPassword || !confirmPassword) {
      setError('Please enter both password fields');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }
    if (!resetToken) {
      setError('Reset token is missing. Please start the reset process again.');
      setView('forgot-password');
      return;
    }

    setIsResettingPassword(true);
    try {
      const response = await authApi.resetPassword(resetEmail, resetToken, newPassword);
      if (response.success) {
        toast.success('Password reset successfully! Please login with your new password.');
        setView('login');
        setError('');
        setEmail(resetEmail);
        setOtp('');
        setResetEmail('');
        setNewPassword('');
        setConfirmPassword('');
        setResetToken('');
      } else {
        setError(response.error || response.message || 'Failed to reset password. Please try again.');
      }
    } catch (error: any) {
      setError(error.message || error.response?.data?.error || 'Failed to reset password. Please try again.');
    } finally {
      setIsResettingPassword(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-white text-foreground dark:bg-background">
      <div className="absolute inset-y-0 left-0 hidden w-[55%] bg-[#eef3f8] dark:bg-[#0A0E1A] lg:block" />
       <div className="pointer-events-none absolute inset-0 mx-auto max-w-520 px-4 sm:px-6 lg:px-8 ">
          <img
            src={spiralBackground}
            alt=""
            aria-hidden="true"
            className="absolute left-4 top-1/2 bottom-0 h-[1000px] w-[1000px] max-w-none -translate-y-1/2 rotate-180 opacity-100 sm:left-6 lg:left-8"
          />
        </div>
      <div className="relative z-10 mx-auto grid min-h-screen w-full max-w-7xl gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[0.92fr_1.08fr] lg:px-8">
        <aside className="flex flex-col justify-between rounded-2xl bg-[#eef3f8] p-5 dark:bg-[#0A0E1A] sm:p-8 lg:rounded-none lg:bg-transparent lg:p-10 lg:dark:bg-transparent">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.45, ease: 'easeInOut' }}
          >
            <button
              type="button"
              onClick={() => onNavigate('home')}
              className="mb-12 inline-flex items-center"
              aria-label="Go to Naitrust home"
            >
              <NaitrustLogo size="postMd" showText={true} textColor={isDarkMode ? "text-white" : "text-primary"} />
            </button>

            <div className="max-w-md space-y-8">
              <div className="space-y-5">
                <div className="space-y-4">
                  <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
                    <ShieldCheck size={16} />
                    Safer commerce for Nigerian buyers and businesses
                  </div>
                  <h1 className="text-5xl font-bold leading-tight text-[#0b2b45] dark:text-white">
                    Return to your safe transaction room.
                  </h1>
                  <p className="text-lg leading-8 text-[#496274] dark:text-slate-300">
                    Sign in to review deal terms, verification status, funding updates, evidence uploads, and release actions in one trusted record.
                    
                  </p>
                </div>
              </div>

              <div className="grid gap-3">
                {trustHighlights.map((item) => {
                  const Icon = item.icon;

                  return (
                    <div key={item.title} className="flex gap-4 rounded-xl border border-border/70 bg-background/70 dark:bg-card dark:text-slate-300 p-4 shadow-sm backdrop-blur-sm">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <Icon size={22} />
                      </div>
                      <div>
                        <h3 className="text-base font-semibold text-foreground">{item.title}</h3>
                        <p className="mt-1 text-sm leading-6 text-muted-foreground">{item.text}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
          <div className="mt-10 text-sm leading-6 text-muted-foreground">
            Don't have an account?{' '}
            <button
              type="button"
              onClick={() => onNavigate('register')}
              className="font-semibold text-primary hover:underline"
            >
              Sign up free
            </button>
          </div>
        </aside>

          {/* Right side - Auth Forms */}
        <main className="flex min-h-full items-center justify-center py-4 lg:py-10">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.45, ease: 'easeInOut' }}
            className="w-full"
          >
            <AnimatePresence mode="wait">
              {/* Login Form */}
              {view === 'login' && (
                <motion.div
                  key="login"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.35, ease: 'easeInOut' }}
                >
                  <Card className="mx-auto w-full max-w-md border-border/60 bg-card/95 p-5 md:p-8 shadow-2xl">
                    <div className="text-center mb-8">
                      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl p-2">
                        <img src={icon} alt="Naitrust logo" className="h-full w-full" />
                      </div>
                      <h2 className="mb-2 text-2xl font-bold">Welcome back</h2>
                      <p className="text-sm leading-6 text-muted-foreground">Access your transaction rooms, evidence, and pending actions.</p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-5">
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
                            onChange={(e) => setEmail(e.target.value)}
                            className="pl-10 h-11"
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="password">Password</Label>
                          <button
                            type="button"
                            onClick={() => setView('forgot-password')}
                            className="text-xs text-primary hover:underline"
                          >
                            Forgot password?
                          </button>
                        </div>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground z-10" size={18} />
                          <PasswordInput
                            id="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
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

                    <Button
                      type="button"
                      variant="outline"
                      className="mt-6 h-12 w-full rounded-full"
                      onClick={() => {
                        setError('');
                        toast.info('Google Sign-In will be available soon! Please use email and password to login.');
                      }}
                    >
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
                      <button
                        onClick={() => onNavigate('register')}
                        className="text-sm text-muted-foreground hover:text-primary transition-colors"
                      >
                        Don't have an account? <strong className="text-primary">Sign up free</strong>
                      </button>
                    </div>
                  </Card>
                </motion.div>
              )}

              {/* 2FA Verification */}
              {view === 'verify-2fa' && (
                <motion.div
                  key="verify-2fa"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.35, ease: 'easeInOut' }}
                >
                  <Card className="mx-auto w-full max-w-md border-border/60 bg-card/95 p-5 shadow-[0_24px_70px_rgba(11,43,69,0.14)] backdrop-blur-sm md:p-8">
                    <button
                      onClick={() => { setView('login'); setTwoFactorCode(''); setError(''); }}
                      className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-6"
                    >
                      <ArrowLeft size={16} />
                      Back to login
                    </button>

                    <div className="text-center mb-8">
                      <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-2xl mb-4">
                        <Shield size={32} className="text-primary" />
                      </div>
                      <h2 className="mb-2">Two-Factor Authentication</h2>
                      <p className="text-muted-foreground">Enter the 6-digit code from your authenticator app</p>
                    </div>

                    <form onSubmit={handleVerify2FA} className="space-y-6">
                      {error && (
                        <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-xl text-sm">{error}</div>
                      )}
                      <div className="flex justify-center">
                        <InputOTP maxLength={6} value={twoFactorCode} onChange={(value) => setTwoFactorCode(value)} disabled={isLoading}>
                          <InputOTPGroup>
                            {[0, 1, 2, 3, 4, 5].map(i => (
                              <InputOTPSlot key={i} index={i} className="w-12 h-12 text-lg" />
                            ))}
                          </InputOTPGroup>
                        </InputOTP>
                      </div>
                      <Button type="submit" className="h-12 w-full rounded-full" size="lg" disabled={isLoading || twoFactorCode.length !== 6}>
                        {isLoading ? (<><Spinner size="sm" colorClass="text-white" /><span className="ml-2">Verifying...</span></>) : (<>Verify Code<ArrowRight size={18} className="ml-2" /></>)}
                      </Button>
                    </form>
                  </Card>
                </motion.div>
              )}

              {/* Forgot Password */}
              {view === 'forgot-password' && (
                <motion.div
                  key="forgot-password"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.35, ease: 'easeInOut' }}
                >
                  <Card className="mx-auto w-full max-w-md border-border/60 bg-card/95 p-5 shadow-[0_24px_70px_rgba(11,43,69,0.14)] backdrop-blur-sm md:p-8">
                    <button onClick={() => setView('login')} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-6">
                      <ArrowLeft size={16} />
                      Back to login
                    </button>

                    <div className="text-center mb-8">
                      <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-500/10 rounded-2xl mb-4">
                        <KeyRound size={32} className="text-orange-500" />
                      </div>
                      <h2 className="mb-2">Forgot Password?</h2>
                      <p className="text-muted-foreground">No worries! We'll send you a verification code</p>
                    </div>

                    <form onSubmit={handleForgotPassword} className="space-y-5">
                      <div className="space-y-2">
                        <Label htmlFor="reset-email">Email Address</Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                          <Input id="reset-email" type="email" placeholder="you@example.com" value={resetEmail} onChange={(e) => setResetEmail(e.target.value)} className="pl-10 h-11" required />
                        </div>
                      </div>
                      {error && (<div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-xl text-sm">{error}</div>)}
                      <Button type="submit" className="h-12 w-full rounded-full" size="lg" disabled={isSendingOtp}>
                        {isSendingOtp ? (<><Loader2 size={18} className="mr-2 animate-spin" />Sending...</>) : (<>Send Verification Code<ArrowRight size={18} className="ml-2" /></>)}
                      </Button>
                    </form>
                  </Card>
                </motion.div>
              )}

              {/* Verify OTP */}
              {view === 'verify-otp' && (
                <motion.div
                  key="verify-otp"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.35, ease: 'easeInOut' }}
                >
                  <Card className="mx-auto w-full max-w-md border-border/60 bg-card/95 p-5 shadow-[0_24px_70px_rgba(11,43,69,0.14)] backdrop-blur-sm md:p-8">
                    <button onClick={() => setView('forgot-password')} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-6">
                      <ArrowLeft size={16} />
                      Back
                    </button>

                    <div className="text-center mb-8">
                      <div className="inline-flex items-center justify-center w-16 h-16 bg-green-500/10 rounded-2xl mb-4">
                        <Sparkles size={32} className="text-green-500" />
                      </div>
                      <h2 className="mb-2">Enter Verification Code</h2>
                      <p className="text-muted-foreground">We sent a 6-digit code to<br /><strong>{resetEmail}</strong></p>
                    </div>

                    <form onSubmit={handleVerifyOTP} className="space-y-6">
                      {error && (<div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-xl text-sm">{error}</div>)}
                      <div className="flex justify-center">
                        <InputOTP maxLength={6} value={otp} onChange={(value) => setOtp(value)} disabled={isVerifyingOtp}>
                          <InputOTPGroup>
                            {[0, 1, 2, 3, 4, 5].map(i => (
                              <InputOTPSlot key={i} index={i} className="w-12 h-12 text-lg" />
                            ))}
                          </InputOTPGroup>
                        </InputOTP>
                      </div>
                      <Button type="submit" className="h-12 w-full rounded-full" size="lg" disabled={isVerifyingOtp || otp.length !== 6}>
                        {isVerifyingOtp ? (<><Loader2 size={18} className="mr-2 animate-spin" />Verifying...</>) : (<>Verify Code<ArrowRight size={18} className="ml-2" /></>)}
                      </Button>
                      <div className="text-center">
                        <button type="button" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                          Didn't receive code? <strong>Resend</strong>
                        </button>
                      </div>
                    </form>
                  </Card>
                </motion.div>
              )}

              {/* Reset Password */}
              {view === 'reset-password' && (
                <motion.div
                  key="reset-password"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.35, ease: 'easeInOut' }}
                >
                  <Card className="mx-auto w-full max-w-md border-border/60 bg-card/95 p-5 shadow-[0_24px_70px_rgba(11,43,69,0.14)] backdrop-blur-sm md:p-8">
                    <div className="text-center mb-8">
                      <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-500/10 rounded-2xl mb-4">
                        <Lock size={32} className="text-blue-500" />
                      </div>
                      <h2 className="mb-2">Create New Password</h2>
                      <p className="text-muted-foreground">Enter a strong password for your account</p>
                    </div>

                    <form onSubmit={handleResetPassword} className="space-y-5">
                      {error && (<div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-xl text-sm">{error}</div>)}
                      <div className="space-y-2">
                        <Label htmlFor="new-password">New Password</Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground z-10" size={18} />
                          <PasswordInput id="new-password" placeholder="••••••••" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="pl-10 h-11" required minLength={8} />
                        </div>
                        <p className="text-xs text-muted-foreground">At least 8 characters</p>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="confirm-password">Confirm Password</Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground z-10" size={18} />
                          <PasswordInput id="confirm-password" placeholder="••••••••" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="pl-10 h-11" required minLength={8} />
                        </div>
                      </div>
                      <Button type="submit" className="h-12 w-full rounded-full" size="lg" disabled={isResettingPassword}>
                        {isResettingPassword ? (<><Loader2 size={18} className="mr-2 animate-spin" />Resetting...</>) : (<>Reset Password<CheckCircle size={18} className="ml-2" /></>)}
                      </Button>
                    </form>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </main>
      </div>
    </div>
  );
}
