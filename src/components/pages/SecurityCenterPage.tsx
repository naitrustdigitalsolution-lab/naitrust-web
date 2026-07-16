/**
 * SecurityCenterPage
 * The hub where the user completes verification & account security
 * (`/app/security`): identity KYC (individual or business, per account type),
 * liveness, email, phone, authenticator 2FA, and a 4-digit transaction PIN.
 * Each action calls the security API (mocked) and updates the security store,
 * which gates deal creation and sensitive actions elsewhere.
 */

import { useRef, useState, type ComponentType } from 'react';
import { useNavigate } from 'react-router-dom';
import QRCode from 'react-qr-code';
import {
  ArrowLeft,
  BadgeCheck,
  Building2,
  FileText,
  Fingerprint,
  KeyRound,
  Loader2,
  Mail,
  Phone,
  ScanFace,
  Smartphone,
  Upload,
  X,
} from 'lucide-react';
import { toast } from 'sonner';
import { DashboardLayout } from '../pieces/dashboard/DashboardLayout';
import { LivenessCheckModal } from '../pieces/verification/LivenessCheckModal';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '../ui/input-otp';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { useAuth } from '../../libs/auth-context';
import { useSecurity } from '../../hooks/useSecurity';
import { securityApi, MOCK_OTP, type TwoFactorEnrolment } from '../../libs/api/security.api';
import { accountTypeOf } from '../../libs/utils/account';

/* ---------------------------------------------------------------- Row card */

function SecurityCard({
  icon: Icon,
  title,
  description,
  done,
  doneLabel = 'Done',
  actionLabel,
  onAction,
  accent,
}: {
  icon: ComponentType<{ size?: number; className?: string }>;
  title: string;
  description: string;
  done: boolean;
  doneLabel?: string;
  actionLabel: string;
  onAction: () => void;
  accent?: boolean;
}) {
  return (
    <Card className="gap-3 p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div
          className={
            'flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ' +
            (done ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-primary/10 text-primary')
          }
        >
          {done ? <BadgeCheck size={20} /> : <Icon size={20} />}
        </div>
        {done ? (
          <Badge variant="success">{doneLabel}</Badge>
        ) : (
          <Badge variant={accent ? 'default' : 'outline'}>Required</Badge>
        )}
      </div>
      <div>
        <p className="font-semibold text-foreground">{title}</p>
        <p className="mt-0.5 text-sm leading-6 text-muted-foreground">{description}</p>
      </div>
      <Button
        variant={done ? 'outline' : 'default'}
        className="mt-1 w-fit rounded-full"
        onClick={onAction}
      >
        {actionLabel}
      </Button>
    </Card>
  );
}

/* ------------------------------------------------------------- OTP modal */

function OtpModal({
  open,
  onOpenChange,
  title,
  channelLabel,
  onSend,
  onVerify,
  onSuccess,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  title: string;
  channelLabel: string;
  onSend: () => Promise<void>;
  onVerify: (code: string) => Promise<boolean>;
  onSuccess: () => void;
}) {
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [code, setCode] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState('');

  const reset = () => {
    setSent(false);
    setSending(false);
    setCode('');
    setVerifying(false);
    setError('');
  };

  const send = async () => {
    setSending(true);
    await onSend();
    setSending(false);
    setSent(true);
    toast.success(`Code sent (${channelLabel}). Use ${MOCK_OTP} in this demo.`);
  };

  const verify = async (value: string) => {
    setVerifying(true);
    setError('');
    const ok = await onVerify(value);
    setVerifying(false);
    if (ok) {
      onSuccess();
      onOpenChange(false);
      reset();
    } else {
      setError('Incorrect code. Please try again.');
      setCode('');
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        onOpenChange(o);
        if (!o) reset();
      }}
    >
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>We'll send a 6-digit code to {channelLabel}.</DialogDescription>
        </DialogHeader>
        {!sent ? (
          <Button className="w-full rounded-full" onClick={send} disabled={sending}>
            {sending ? <Loader2 size={16} className="mr-1.5 animate-spin" /> : null}
            Send code
          </Button>
        ) : (
          <div className="flex flex-col items-center gap-4 py-2">
            <InputOTP
              maxLength={6}
              value={code}
              onChange={(v) => {
                setCode(v);
                setError('');
                if (v.length === 6) void verify(v);
              }}
              disabled={verifying}
            >
              <InputOTPGroup>
                {[0, 1, 2, 3, 4, 5].map((i) => (
                  <InputOTPSlot key={i} index={i} />
                ))}
              </InputOTPGroup>
            </InputOTP>
            {verifying && <p className="text-xs text-muted-foreground">Verifying…</p>}
            {error && <p className="text-xs text-destructive">{error}</p>}
            <button type="button" className="text-xs text-primary hover:underline" onClick={send}>
              Resend code
            </button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

/* --------------------------------------------------------- 2FA modal */

function TwoFactorModal({
  open,
  onOpenChange,
  email,
  onSuccess,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  email: string;
  onSuccess: () => void;
}) {
  const [enrol, setEnrol] = useState<TwoFactorEnrolment | null>(null);
  const [loading, setLoading] = useState(false);
  const [code, setCode] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState('');

  const begin = async () => {
    setLoading(true);
    const res = await securityApi.start2FA(email);
    setEnrol(res.data);
    setLoading(false);
  };

  const verify = async (value: string) => {
    setVerifying(true);
    setError('');
    const res = await securityApi.verify2FA(value);
    setVerifying(false);
    if (res.data.enabled) {
      onSuccess();
      onOpenChange(false);
      setEnrol(null);
      setCode('');
    } else {
      setError('Enter the 6-digit code from your authenticator app.');
      setCode('');
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        onOpenChange(o);
        if (!o) {
          setEnrol(null);
          setCode('');
          setError('');
        }
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Set up authenticator app</DialogTitle>
          <DialogDescription>
            Add an extra layer with Google Authenticator, Authy, or 1Password.
          </DialogDescription>
        </DialogHeader>

        {!enrol ? (
          <Button className="w-full rounded-full" onClick={begin} disabled={loading}>
            {loading ? <Loader2 size={16} className="mr-1.5 animate-spin" /> : null}
            Generate setup key
          </Button>
        ) : (
          <div className="flex flex-col items-center gap-4 py-2">
            <div className="rounded-xl bg-white p-3">
              <QRCode value={enrol.otpauthUri} size={148} />
            </div>
            <div className="w-full rounded-lg bg-muted/60 px-3 py-2 text-center">
              <p className="text-xs text-muted-foreground">Or enter this key manually</p>
              <p className="font-mono text-sm font-semibold tracking-wider text-foreground">
                {enrol.secret}
              </p>
            </div>
            <p className="text-sm text-muted-foreground">Enter the 6-digit code to confirm</p>
            <InputOTP
              maxLength={6}
              value={code}
              onChange={(v) => {
                setCode(v);
                setError('');
                if (v.length === 6) void verify(v);
              }}
              disabled={verifying}
            >
              <InputOTPGroup>
                {[0, 1, 2, 3, 4, 5].map((i) => (
                  <InputOTPSlot key={i} index={i} />
                ))}
              </InputOTPGroup>
            </InputOTP>
            {verifying && <p className="text-xs text-muted-foreground">Verifying…</p>}
            {error && <p className="text-xs text-destructive">{error}</p>}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

/* --------------------------------------------------------- KYC modal */

function KycModal({
  open,
  onOpenChange,
  isBusiness,
  onSuccess,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  isBusiness: boolean;
  onSuccess: () => void;
}) {
  const MAX_DOCS = 3;
  const [fields, setFields] = useState<Record<string, string>>({});
  const [docNames, setDocNames] = useState<string[]>([]);
  const [ownerEmail, setOwnerEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const setField = (k: string, v: string) => setFields((p) => ({ ...p, [k]: v }));

  const reset = () => {
    setFields({});
    setDocNames([]);
    setOwnerEmail('');
  };

  const addDocs = (files: FileList | null) => {
    if (!files) return;
    const incoming = Array.from(files).map((f) => f.name);
    setDocNames((prev) => [...prev, ...incoming].slice(0, MAX_DOCS));
  };

  const spec = isBusiness
    ? [
        { key: 'businessName', label: 'Registered business name' },
        { key: 'rcNumber', label: 'CAC / RC number' },
        { key: 'directorName', label: 'Director full name' },
        { key: 'directorNin', label: "Director's NIN" },
      ]
    : [
        { key: 'fullName', label: 'Full legal name' },
        { key: 'nin', label: 'NIN (National Identity Number)' },
        { key: 'dob', label: 'Date of birth', type: 'date' },
      ];

  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(ownerEmail);
  const fieldsFilled = spec.every((f) => (fields[f.key] ?? '').trim().length > 0);
  const complete = isBusiness
    ? fieldsFilled && docNames.length > 0 && emailValid
    : fieldsFilled;

  const submit = async () => {
    setSubmitting(true);
    await securityApi.submitKyc(isBusiness ? 'business' : 'individual', {
      ...fields,
      ...(isBusiness ? { ownerEmail, documents: docNames.join(', ') } : {}),
    });
    setSubmitting(false);
    onSuccess();
    onOpenChange(false);
    reset();
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        onOpenChange(o);
        if (!o) reset();
      }}
    >
      <DialogContent className="max-h-[88vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isBusiness ? <Building2 size={18} /> : <Fingerprint size={18} />}
            {isBusiness ? 'Business verification' : 'Identity verification'}
          </DialogTitle>
          <DialogDescription>
            {isBusiness
              ? 'Verify your business (CAC), a director, and confirm business ownership before transacting.'
              : 'Verify your identity before transacting. Your details are checked against official records.'}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <div className="grid gap-3 sm:grid-cols-2">
            {spec.map((f) => (
              <div key={f.key} className={f.key === 'businessName' ? 'sm:col-span-2' : ''}>
                <Label htmlFor={f.key}>{f.label}</Label>
                <Input
                  id={f.key}
                  type={f.type ?? 'text'}
                  className="mt-1.5"
                  value={fields[f.key] ?? ''}
                  onChange={(e) => setField(f.key, e.target.value)}
                />
              </div>
            ))}
          </div>

          {isBusiness && (
            <>
              {/* Document upload — up to 3 */}
              <div>
                <div className="flex items-center justify-between">
                  <Label>CAC certificate &amp; business documents</Label>
                  <span className="text-xs text-muted-foreground">{docNames.length}/{MAX_DOCS}</span>
                </div>
                <input
                  ref={fileRef}
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  multiple
                  className="hidden"
                  onChange={(e) => {
                    addDocs(e.target.files);
                    e.currentTarget.value = '';
                  }}
                />
                {docNames.length > 0 && (
                  <ul className="mt-1.5 space-y-1.5">
                    {docNames.map((name, i) => (
                      <li key={`${name}-${i}`} className="flex items-center gap-2 rounded-lg border bg-muted/40 px-3 py-2">
                        <FileText size={16} className="shrink-0 text-primary" />
                        <span className="min-w-0 flex-1 truncate text-sm text-foreground">{name}</span>
                        <button
                          type="button"
                          aria-label="Remove document"
                          onClick={() => setDocNames((prev) => prev.filter((_, idx) => idx !== i))}
                          className="text-muted-foreground transition-colors hover:text-destructive"
                        >
                          <X size={15} />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
                {docNames.length < MAX_DOCS && (
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    className="mt-1.5 flex w-full items-center gap-3 rounded-xl border border-dashed p-3 text-left transition-colors hover:bg-accent/40"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Upload size={18} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground">
                        {docNames.length === 0 ? 'Upload documents' : 'Add another document'}
                      </p>
                      <p className="text-xs text-muted-foreground">PDF, JPG or PNG · up to {MAX_DOCS} files</p>
                    </div>
                  </button>
                )}
              </div>

              {/* Ownership email — the OTP is sent by the backend after review */}
              <div className="rounded-xl border p-3">
                <div className="flex items-center gap-2">
                  <Mail size={15} className="text-primary" />
                  <p className="text-sm font-semibold text-foreground">Business ownership email</p>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  Enter the business, director, or owner email registered with the CAC. After you
                  submit, we send a one-time code there to confirm you own this business.
                </p>
                <Input
                  type="email"
                  className="mt-2"
                  placeholder="owner@business.com"
                  value={ownerEmail}
                  onChange={(e) => setOwnerEmail(e.target.value)}
                />
              </div>
            </>
          )}

          <Button className="w-full rounded-full" onClick={submit} disabled={!complete || submitting}>
            {submitting ? (
              <>
                <Loader2 size={16} className="mr-1.5 animate-spin" />
                Verifying…
              </>
            ) : (
              'Submit for verification'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/* --------------------------------------------------------- PIN modal */

function SetPinModal({
  open,
  onOpenChange,
  onSuccess,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  onSuccess: (pin: string) => void;
}) {
  const [pin, setPin] = useState('');
  const [confirm, setConfirm] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const reset = () => {
    setPin('');
    setConfirm('');
    setError('');
    setSaving(false);
  };

  const save = async () => {
    if (pin.length !== 4) return;
    if (pin !== confirm) {
      setError('PINs do not match.');
      setConfirm('');
      return;
    }
    setSaving(true);
    await securityApi.setPin(pin);
    setSaving(false);
    onSuccess(pin);
    onOpenChange(false);
    reset();
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        onOpenChange(o);
        if (!o) reset();
      }}
    >
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <KeyRound size={18} className="text-primary" />
            Set your transaction PIN
          </DialogTitle>
          <DialogDescription>
            A 4-digit PIN confirms every money-moving action. Don't reuse an obvious code.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center gap-4 py-2">
          <div className="flex flex-col items-center gap-1.5">
            <Label className="text-xs">Enter PIN</Label>
            <InputOTP maxLength={4} value={pin} onChange={setPin}>
              <InputOTPGroup>
                {[0, 1, 2, 3].map((i) => (
                  <InputOTPSlot key={i} index={i} className="h-11 w-11" />
                ))}
              </InputOTPGroup>
            </InputOTP>
          </div>
          <div className="flex flex-col items-center gap-1.5">
            <Label className="text-xs">Confirm PIN</Label>
            <InputOTP
              maxLength={4}
              value={confirm}
              onChange={(v) => {
                setConfirm(v);
                setError('');
              }}
            >
              <InputOTPGroup>
                {[0, 1, 2, 3].map((i) => (
                  <InputOTPSlot key={i} index={i} className="h-11 w-11" />
                ))}
              </InputOTPGroup>
            </InputOTP>
          </div>
          {error && <p className="text-xs text-destructive">{error}</p>}
          <Button
            className="w-full rounded-full"
            onClick={save}
            disabled={pin.length !== 4 || confirm.length !== 4 || saving}
          >
            {saving ? <Loader2 size={16} className="mr-1.5 animate-spin" /> : null}
            Save PIN
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/* --------------------------------------------------------- Page */

export function SecurityCenterPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const security = useSecurity();
  const isBusiness = accountTypeOf(user) === 'business';

  const [modal, setModal] = useState<
    null | 'email' | 'phone' | '2fa' | 'kyc' | 'pin' | 'liveness'
  >(null);
  const close = () => setModal(null);

  return (
    <DashboardLayout title="Security Center">
      <div className="mx-auto w-full max-w-9xl">
        <button
          type="button"
          onClick={() => navigate('/app')}
          className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft size={16} />
          Back to dashboard
        </button>

        <div className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Security Center</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Complete verification and lock down your account. Identity, email, and a transaction PIN
            are required before you can create a deal.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <SecurityCard
            icon={isBusiness ? Building2 : Fingerprint}
            title={isBusiness ? 'Business verification (KYC)' : 'Identity verification (KYC)'}
            description={
              isBusiness
                ? 'Verify your CAC registration and a director.'
                : 'Verify your identity with your NIN.'
            }
            done={security.kycStatus === 'verified'}
            doneLabel="Verified"
            actionLabel={security.kycStatus === 'verified' ? 'View' : 'Start verification'}
            onAction={() => setModal('kyc')}
            accent
          />
          <SecurityCard
            icon={ScanFace}
            title="Liveness check"
            description="A live photo confirms you're really present. Valid for 30 days."
            done={security.livenessFresh}
            doneLabel="Fresh"
            actionLabel={security.livenessFresh ? 'Redo check' : 'Run check'}
            onAction={() => setModal('liveness')}
          />
          <SecurityCard
            icon={Mail}
            title="Email address"
            description="Confirm your email to secure account recovery."
            done={security.emailVerified}
            doneLabel="Verified"
            actionLabel="Verify email"
            onAction={() => setModal('email')}
            accent
          />
          <SecurityCard
            icon={KeyRound}
            title="Transaction PIN"
            description="A 4-digit PIN confirms every money-moving action."
            done={security.pinSet}
            doneLabel="Set"
            actionLabel={security.pinSet ? 'Change PIN' : 'Set PIN'}
            onAction={() => setModal('pin')}
            accent
          />
          <SecurityCard
            icon={Phone}
            title="Phone number"
            description="Add a phone for recovery and SMS security alerts."
            done={security.phoneVerified}
            doneLabel="Verified"
            actionLabel="Verify phone"
            onAction={() => setModal('phone')}
          />
          <SecurityCard
            icon={Smartphone}
            title="Two-factor (authenticator)"
            description="Protect sign-in with a time-based code from an app."
            done={security.twoFactorEnabled}
            doneLabel="Enabled"
            actionLabel="Enable 2FA"
            onAction={() => setModal('2fa')}
          />
        </div>
      </div>

      {/* Flows */}
      <OtpModal
        open={modal === 'email'}
        onOpenChange={(o) => !o && close()}
        title="Verify your email"
        channelLabel={user?.email ?? 'your email'}
        onSend={async () => {
          await securityApi.sendEmailOtp(user?.email ?? '');
        }}
        onVerify={async (code) => (await securityApi.verifyEmail(code)).data.verified}
        onSuccess={() => {
          security.patch({ emailVerified: true });
          toast.success('Email verified.');
        }}
      />
      <OtpModal
        open={modal === 'phone'}
        onOpenChange={(o) => !o && close()}
        title="Verify your phone"
        channelLabel={user?.phone ?? 'your phone'}
        onSend={async () => {
          await securityApi.sendPhoneOtp(user?.phone ?? '');
        }}
        onVerify={async (code) => (await securityApi.verifyPhone(code)).data.verified}
        onSuccess={() => {
          security.patch({ phoneVerified: true });
          toast.success('Phone verified.');
        }}
      />
      <TwoFactorModal
        open={modal === '2fa'}
        onOpenChange={(o) => !o && close()}
        email={user?.email ?? ''}
        onSuccess={() => {
          security.patch({ twoFactorEnabled: true });
          toast.success('Two-factor authentication enabled.');
        }}
      />
      <KycModal
        open={modal === 'kyc'}
        onOpenChange={(o) => !o && close()}
        isBusiness={isBusiness}
        onSuccess={() => {
          security.patch({ kycStatus: 'verified' });
          toast.success('Verification complete.');
        }}
      />
      <SetPinModal
        open={modal === 'pin'}
        onOpenChange={(o) => !o && close()}
        onSuccess={(pin) => {
          security.patch({ pinSet: true, pin });
          toast.success('Transaction PIN set.');
        }}
      />
      <LivenessCheckModal
        open={modal === 'liveness'}
        onOpenChange={(o) => !o && close()}
        onVerified={() => {
          toast.success('Liveness check complete.');
          close();
        }}
      />
    </DashboardLayout>
  );
}
