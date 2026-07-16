import { useState } from 'react';
import { Shield, Loader2, CheckCircle2, Copy, AlertCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '../ui/input-otp';
import { toast } from 'sonner';
import { authApi } from '../../libs/api';

interface TwoFactorSetupModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function TwoFactorSetupModal({ open, onClose, onSuccess }: TwoFactorSetupModalProps) {
  const [step, setStep] = useState<'generate' | 'verify' | 'backup'>('generate');
  const [qrCode, setQrCode] = useState<string>('');
  const [secret, setSecret] = useState<string>('');
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [showBackupCodes, setShowBackupCodes] = useState(false);
  const [isReEnabling, setIsReEnabling] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const response = await authApi.generate2FASecret();
      if (response.data) {
        setQrCode(response.data.qrCode);
        setSecret(response.data.manualEntryKey);
        setBackupCodes(response.data.backupCodes || []);
        setIsReEnabling(response.data.isReEnabling || false);
        setStep('verify');
      } else {
        toast.error('Failed to generate 2FA secret');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to generate 2FA secret');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleVerify = async () => {
    if (verificationCode.length !== 6) {
      toast.error('Please enter a 6-digit code');
      return;
    }

    setIsVerifying(true);
    try {
      const response = await authApi.verify2FASetup(verificationCode);
      if (response.success) {
        // Show backup codes before closing
        if (backupCodes.length > 0) {
          setShowBackupCodes(true);
          setStep('backup');
        } else {
          toast.success('2FA enabled successfully!');
          onSuccess();
          onClose();
          // Reset state
          setStep('generate');
          setQrCode('');
          setSecret('');
          setBackupCodes([]);
          setVerificationCode('');
        }
      } else {
        toast.error(response.message || 'Verification failed');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Verification failed. Please check your code.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleCopySecret = () => {
    navigator.clipboard.writeText(secret);
    toast.success('Secret key copied to clipboard');
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield size={24} />
            Enable Two-Factor Authentication
          </DialogTitle>
          <DialogDescription>
            Add an extra layer of security to your account
          </DialogDescription>
        </DialogHeader>

        {step === 'generate' && (
          <div className="space-y-4">
            <div className="bg-muted/50 rounded-lg p-4">
              <h3 className="font-semibold mb-2">How it works:</h3>
              <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
                <li>Scan the QR code with an authenticator app (Google Authenticator, Authy, etc.)</li>
                <li>Enter the 6-digit code from your app to verify</li>
                <li>2FA will be enabled for your account</li>
              </ol>
            </div>

            <Button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="w-full"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Shield className="mr-2 h-4 w-4" />
                  Generate QR Code
                </>
              )}
            </Button>
          </div>
        )}

        {step === 'verify' && (
          <div className="space-y-4">
            {isReEnabling && (
              <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-4">
                <div className="flex items-start gap-2">
                  <AlertCircle className="text-orange-500 mt-0.5 flex-shrink-0" size={20} />
                  <div>
                    <h3 className="font-semibold text-orange-700 dark:text-orange-400 mb-1">
                      Important: Remove Old Entry
                    </h3>
                    <p className="text-sm text-orange-600 dark:text-orange-300">
                      A new QR code has been generated. Please remove the old "Naitrust" entry from your authenticator app before scanning this new QR code.
                    </p>
                  </div>
                </div>
              </div>
            )}
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-4">
                Scan this QR code with your authenticator app
              </p>
              {qrCode && (
                <div className="bg-white p-4 rounded-lg inline-block mb-4">
                  <img src={qrCode} alt="2FA QR Code" className="w-48 h-48" />
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label>Manual Entry Key (if you can't scan)</Label>
              <div className="flex items-center gap-2">
                <Input
                  value={secret}
                  readOnly
                  className="font-mono text-sm"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleCopySecret}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Enter verification code</Label>
              <div className="flex justify-center">
                <InputOTP
                  maxLength={6}
                  value={verificationCode}
                  onChange={setVerificationCode}
                >
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setStep('generate');
                  setQrCode('');
                  setSecret('');
                  setVerificationCode('');
                }}
                className="flex-1"
              >
                Back
              </Button>
              <Button
                onClick={handleVerify}
                disabled={isVerifying || verificationCode.length !== 6}
                className="flex-1"
              >
                {isVerifying ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Verify & Enable
                  </>
                )}
              </Button>
            </div>
          </div>
        )}

        {step === 'backup' && backupCodes.length > 0 && (
          <div className="space-y-4">
            <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-4">
              <div className="flex items-start gap-2 mb-2">
                <AlertCircle className="text-orange-500 mt-0.5" size={20} />
                <div>
                  <h3 className="font-semibold text-orange-700 dark:text-orange-400 mb-1">
                    Save Your Backup Codes
                  </h3>
                  <p className="text-sm text-orange-600 dark:text-orange-300">
                    These codes can be used to access your account if you lose access to your authenticator app. 
                    Save them in a safe place - you won't be able to see them again!
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-muted/50 rounded-lg p-4 space-y-2">
              <Label className="text-sm font-semibold">Your Backup Codes:</Label>
              <div className="grid grid-cols-2 gap-2 font-mono text-sm">
                {backupCodes.map((code, index) => (
                  <div key={index} className="bg-background p-2 rounded border text-center">
                    {code}
                  </div>
                ))}
              </div>
            </div>

            <Button
              onClick={() => {
                navigator.clipboard.writeText(backupCodes.join('\n'));
                toast.success('Backup codes copied to clipboard');
              }}
              variant="outline"
              className="w-full"
            >
              <Copy className="mr-2 h-4 w-4" />
              Copy All Codes
            </Button>

            <Button
              onClick={() => {
                toast.success('2FA enabled successfully!');
                onSuccess();
                onClose();
                // Reset state
                setStep('generate');
                setQrCode('');
                setSecret('');
                setBackupCodes([]);
                setShowBackupCodes(false);
                setVerificationCode('');
              }}
              className="w-full"
            >
              <CheckCircle2 className="mr-2 h-4 w-4" />
              I've Saved My Codes
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

