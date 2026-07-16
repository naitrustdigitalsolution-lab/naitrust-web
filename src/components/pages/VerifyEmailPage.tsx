import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Mail, ArrowLeft, CheckCircle, Loader2 } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { toast } from 'sonner';
import { NaitrustLogo } from '../utility/NaitrustLogo';
import { authApi } from '../../libs/api';
import { useAuthStore } from '../../libs/store/auth.store';

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
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="shadow-2xl border-primary/20">
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
    </div>
  );
}
