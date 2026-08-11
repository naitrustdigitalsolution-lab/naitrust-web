import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Mail, ArrowLeft, CheckCircle, Loader2, ShieldCheck } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { toast } from 'sonner';
import { NaitrustLogo } from '../utility/NaitrustLogo';
import { authApi } from '../../libs/api';
import { useAuthStore } from '../../libs/store/auth.store';
import spiralBackground from '../../assets/spiral.svg';
import { SEOHead } from '../utility/SEOHead';

interface VerifyEmailPageProps {
  onNavigate: (page: string, params?: any) => void;
  email?: string;
  otp?: string;
}

export function VerifyEmailPage({ onNavigate, email: initialEmail, otp: initialOtp }: VerifyEmailPageProps) {
  const setUser = useAuthStore((state) => state.setUser);
  const setToken = useAuthStore((state) => state.setToken);
  const [email, setEmail] = useState(initialEmail || '');
  const [otp, setOtp] = useState(initialOtp || '');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState('');

  // Auto-fill OTP from URL params if available
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const urlEmail = urlParams.get('email');
    const urlOtp = urlParams.get('otp');
    
    if (urlEmail && !email) {
      setEmail(decodeURIComponent(urlEmail));
    }
    if (urlOtp && !otp) {
      setOtp(urlOtp);
    }
  }, []);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !otp) {
      setError('Please enter your email and verification code');
      return;
    }

    if (otp.length !== 6) {
      setError('Verification code must be 6 digits');
      return;
    }

    setIsVerifying(true);
    try {
      const response = await authApi.verifyEmail(email, otp);
      
      if (response.success && response.data?.token) {
        toast.success('Email verified successfully! Welcome to Naitrust!');
        
        // Token and user are already set by authApi.verifyEmail
        // Just update auth store state and redirect
        setToken(response.data.token);
        setUser(response.data.user);
        
        // Redirect to appropriate dashboard
        const role = response.data.user?.role;
        if (role === 'business') {
          setTimeout(() => onNavigate('business-dashboard'), 1000);
        } else {
          setTimeout(() => onNavigate('customer-dashboard'), 1000);
        }
      } else {
        setError(response.message || 'Verification failed. Please try again.');
      }
    } catch (error: any) {
      console.error('Verify email error:', error);
      setError(error.response?.data?.message || error.message || 'Verification failed. Please check your code and try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResend = async () => {
    if (!email) {
      setError('Please enter your email address');
      return;
    }

    setIsResending(true);
    setError('');
    
    try {
      const response = await authApi.resendVerificationOTP(email);
      
      if (response.success) {
        toast.success('A new verification code has been sent to your email');
      } else {
        setError(response.message || 'Failed to resend code. Please try again.');
      }
    } catch (error: any) {
      console.error('Resend OTP error:', error);
      toast.error(error.response?.data?.message || 'Failed to resend code. Please try again.');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-white text-foreground dark:bg-background">
      <SEOHead title="Verify your email" description="Verify your email address to continue setting up your Naitrust account." noindex />
      <div className="absolute inset-y-0 left-0 hidden w-[55%] bg-[#eef3f8] dark:bg-[#0A0E1A] lg:block" />
      <div className="pointer-events-none absolute inset-0 mx-auto max-w-520 px-4 sm:px-6 lg:px-8">
        <img src={spiralBackground} alt="" aria-hidden="true" className="absolute left-4 top-1/2 h-[1000px] w-[1000px] max-w-none -translate-y-1/2 rotate-180 opacity-100 sm:left-6 lg:left-8" />
      </div>
      <div className="relative z-10 mx-auto grid min-h-screen w-full max-w-7xl gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[0.92fr_1.08fr] lg:px-8">
        <aside className="auth-balanced-panel hidden flex-col justify-between p-5 sm:p-8 lg:flex lg:p-10">
          <div>
            <button type="button" onClick={() => onNavigate('home')} className="mb-12 inline-flex" aria-label="Go to Naitrust home">
              <NaitrustLogo size="postMd" showText />
            </button>
            <div className="max-w-md">
              <p className="mb-2 text-sm font-semibold uppercase tracking-[0.18em] text-primary">Confirm your account</p>
              <h1 className="text-4xl font-bold leading-tight text-[#0b2b45] dark:text-white">One quick check before you continue.</h1>
              <p className="mt-4 text-base leading-7 text-[#496274] dark:text-slate-300">Confirm the email connected to your account so important payment and Protected Deal updates reach the right person.</p>
            </div>
            <div className="mt-10 max-w-md space-y-4">
              {['Confirm the email connected to your profile', 'Keep account and payment notifications reliable', 'Continue with your identity and business records'].map((item) => (
                <div key={item} className="flex gap-3 rounded-xl border border-white/70 bg-white/70 p-4 text-sm leading-6 text-muted-foreground shadow-sm dark:border-white/10 dark:bg-card dark:text-slate-300">
                  <ShieldCheck size={18} className="mt-0.5 shrink-0 text-primary" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </aside>
        <main className="auth-balanced-form flex min-h-full items-center justify-center py-4 lg:py-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="rounded-2xl border-border/70 shadow-2xl">
          <CardHeader className="text-center space-y-4 pb-6">
            <div className="flex justify-center mb-4">
              <NaitrustLogo size="lg" showText={false} />
            </div>
            <CardTitle className="text-2xl">Verify Your Email</CardTitle>
            <CardDescription>
              We've sent a 6-digit verification code to your email address
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <form onSubmit={handleVerify} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={20} />
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    required
                    disabled={isVerifying}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="otp">Verification Code</Label>
                <Input
                  id="otp"
                  type="text"
                  placeholder="000000"
                  value={otp}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                    setOtp(value);
                  }}
                  maxLength={6}
                  className="text-center text-2xl tracking-widest font-mono"
                  required
                  disabled={isVerifying}
                />
                <p className="text-xs text-muted-foreground text-center">
                  Enter the 6-digit code sent to your email
                </p>
              </div>

              {error && (
                <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                  <p className="text-sm text-destructive text-center">{error}</p>
                </div>
              )}

              <Button
                type="submit"
                className="w-full"
                disabled={isVerifying || !email || otp.length !== 6}
              >
                {isVerifying ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  <>
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Verify Email
                  </>
                )}
              </Button>
            </form>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">Or</span>
              </div>
            </div>

            <div className="space-y-3">
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={handleResend}
                disabled={isResending || !email}
              >
                {isResending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Mail className="mr-2 h-4 w-4" />
                    Resend Verification Code
                  </>
                )}
              </Button>

              <Button
                type="button"
                variant="ghost"
                className="w-full"
                onClick={() => onNavigate('login')}
                disabled={isVerifying}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Login
              </Button>
            </div>

            <div className="text-center text-sm text-muted-foreground space-y-2 pt-4">
              <p>
                Didn't receive the code? Check your spam folder or{' '}
                <button
                  type="button"
                  onClick={handleResend}
                  className="text-primary hover:underline font-medium"
                  disabled={isResending}
                >
                  resend it
                </button>
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
        </main>
      </div>
    </div>
  );
}
