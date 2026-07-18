import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ShieldCheck, Landmark, FileCheck } from 'lucide-react';
import { useAuth } from '../../libs/auth-context';
import { useAuthStore } from '../../libs/store/auth.store';
import { motion, AnimatePresence } from 'motion/react';
import { authApi } from '../../libs/api';
import { toast } from 'sonner';
import { LoginForm } from '../pieces/auth/LoginForm';
import { TwoFactorForm } from '../pieces/auth/TwoFactorForm';
import { ForgotPasswordForm } from '../pieces/auth/ForgotPasswordForm';
import { VerifyOtpForm } from '../pieces/auth/VerifyOtpForm';
import { ResetPasswordForm } from '../pieces/auth/ResetPasswordForm';
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
      text: 'Keep property terms, receipts, documents, milestones, and issue notes tied to the transaction.',
    },
  ];

  // Shared so the same trust points sit in the desktop side panel AND, on
  // mobile, in a card BELOW the form (split copy: intro up top, detail down low).
  const highlightsBlock = (
    <div className="grid gap-2.5 lg:gap-3">
      {trustHighlights.map((item) => {
        const Icon = item.icon;
        return (
          <div key={item.title} className="flex items-start gap-3 rounded-xl border border-border/70 bg-background/70 dark:bg-card dark:text-slate-300 p-3 shadow-sm backdrop-blur-sm lg:gap-4 lg:p-4">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary lg:h-11 lg:w-11">
              <Icon size={18} className="lg:hidden" />
              <Icon size={22} className="hidden lg:block" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground lg:text-base">{item.title}</h3>
              <p className="mt-0.5 text-xs leading-5 text-muted-foreground lg:mt-1 lg:text-sm lg:leading-6">{item.text}</p>
            </div>
          </div>
        );
      })}
    </div>
  );

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
      <div className="relative z-10 mx-auto grid min-h-screen w-full max-w-7xl xl:gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[0.92fr_1.08fr] lg:px-8">
        <aside className="flex-col hidden lg:flex justify-between rounded-2xl bg-[#eef3f8] py-5 dark:bg-[#0A0E1A] sm:p-8 lg:rounded-none lg:py-10">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.45, ease: 'easeInOut' }}
          >
            <button
              type="button"
              onClick={() => onNavigate('home')}
              className="mb-6 inline-flex items-center lg:mb-12"
              aria-label="Go to Naitrust home"
            >
              <NaitrustLogo size="postMd" textColor={isDarkMode ? "text-white" : "text-primary"} />
            </button>

            <div className="max-w-md space-y-6 lg:space-y-8">
              <div className="space-y-3 lg:space-y-4">
                <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary sm:px-4 sm:py-2 sm:text-sm">
                  <ShieldCheck size={15} />
                  Clearer property transactions for Nigerian participants
                </div>
                <h1 className="text-2xl font-bold leading-tight text-[#0b2b45] dark:text-white sm:text-3xl lg:text-4xl xl:text-5xl">
                  Return to your property transaction room.
                </h1>
                <p className="text-sm leading-6 text-[#496274] dark:text-slate-300 sm:text-base lg:text-md xl:text-lg lg:leading-8">
                  Sign in to review property terms, participant verification, payment updates, documents, milestones, and supporting evidence in one trusted record.
                </p>
              </div>

              {/* Trust points — desktop side panel only; on mobile they appear below the form. */}
              <div className="hidden lg:block">{highlightsBlock}</div>
            </div>
          </motion.div>
          <div className="mt-10 hidden text-sm leading-6 text-muted-foreground lg:block">
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
              {view === 'login' && (
                <motion.div key="login" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.35, ease: 'easeInOut' }}>
                  <LoginForm
                    email={email}
                    password={password}
                    error={error}
                    isLoading={isLoading}
                    onEmailChange={setEmail}
                    onPasswordChange={setPassword}
                    onSubmit={handleLogin}
                    onForgot={() => setView('forgot-password')}
                    onGoogle={() => {
                      setError('');
                      toast.info('Google Sign-In will be available soon! Please use email and password to login.');
                    }}
                    onRegister={() => onNavigate('register')}
                  />
                </motion.div>
              )}

              {view === 'verify-2fa' && (
                <motion.div key="verify-2fa" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.35, ease: 'easeInOut' }}>
                  <TwoFactorForm
                    code={twoFactorCode}
                    error={error}
                    isLoading={isLoading}
                    onChange={setTwoFactorCode}
                    onSubmit={handleVerify2FA}
                    onBack={() => {
                      setView('login');
                      setTwoFactorCode('');
                      setError('');
                    }}
                  />
                </motion.div>
              )}

              {view === 'forgot-password' && (
                <motion.div key="forgot-password" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.35, ease: 'easeInOut' }}>
                  <ForgotPasswordForm
                    email={resetEmail}
                    error={error}
                    isSending={isSendingOtp}
                    onChange={setResetEmail}
                    onSubmit={handleForgotPassword}
                    onBack={() => setView('login')}
                  />
                </motion.div>
              )}

              {view === 'verify-otp' && (
                <motion.div key="verify-otp" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.35, ease: 'easeInOut' }}>
                  <VerifyOtpForm
                    otp={otp}
                    email={resetEmail}
                    error={error}
                    isVerifying={isVerifyingOtp}
                    onChange={setOtp}
                    onSubmit={handleVerifyOTP}
                    onBack={() => setView('forgot-password')}
                    onResend={() => {}}
                  />
                </motion.div>
              )}

              {view === 'reset-password' && (
                <motion.div key="reset-password" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.35, ease: 'easeInOut' }}>
                  <ResetPasswordForm
                    newPassword={newPassword}
                    confirmPassword={confirmPassword}
                    error={error}
                    isResetting={isResettingPassword}
                    onNewPassword={setNewPassword}
                    onConfirmPassword={setConfirmPassword}
                    onSubmit={handleResetPassword}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </main>

        {/* Mobile: the supporting trust points sit BELOW the form (split copy). */}
        <section className="hidden">
          <p className="mb-3 text-sm font-semibold text-foreground">Why sign in with Naitrust</p>
          {highlightsBlock}
        </section>
      </div>
    </div>
  );
}
