import { useParams, useLocation, useNavigate } from 'react-router-dom';
import {
  AlertTriangle,
  BadgeCheck,
  Building2,
  Clock3,
  Loader2,
  LockKeyhole,
  ShieldCheck,
  UserRound,
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../../libs/auth-context';
import { useClaimInvitation, usePublicInvitation } from '../../hooks/useInvitations';
import { formatMinorAmount, roleLabel } from '../../libs/utils/safe-deal-presentation';
import { NaitrustLogo } from '../utility/NaitrustLogo';
import { SEOHead } from '../utility/SEOHead';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Card } from '../ui/card';

const STATE_COPY = {
  expired: ['Invitation expired', 'Ask the sender to create and share a new invitation.'],
  withdrawn: ['Invitation withdrawn', 'The sender withdrew this invitation before it was accepted.'],
  already_claimed: ['Already claimed', 'This invitation has already been connected to an account.'],
  wrong_recipient: ['Different recipient', 'Sign in with the account this invitation was sent to.'],
  invalid: ['Invitation not found', 'This link may be incomplete, changed, or no longer available.'],
} as const;

export function PublicInvitationPreviewPage() {
  const { token } = useParams<{ token: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { data: preview, isLoading } = usePublicInvitation(token);
  const claim = useClaimInvitation();
  const state = preview?.status === 'pending' ? null : preview?.status ?? 'invalid';
  const stateCopy = state ? STATE_COPY[state as keyof typeof STATE_COPY] ?? STATE_COPY.invalid : null;

  const returnTo = `${location.pathname}${location.search}`;
  const goToAuth = (path: string) =>
    navigate(`${path}?returnTo=${encodeURIComponent(returnTo)}`, {
      state: { from: location },
    });

  const claimInvitation = async () => {
    if (!token || !user) return;
    try {
      const result = await claim.mutateAsync({ token, user });
      navigate(result.data.destination, { replace: true });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'This invitation could not be claimed.');
    }
  };

  return (
    <div className="min-h-screen bg-[#f4f7f9] px-4 py-6 dark:bg-background sm:py-10">
      <SEOHead title="Protected Deal invitation" description="Review a Naitrust Protected Deal invitation." noindex />
      <div className="mx-auto max-w-xl">
        <button type="button" onClick={() => navigate('/')} className="mx-auto mb-7 block">
          <NaitrustLogo />
        </button>

        {isLoading ? (
          <Card className="flex min-h-72 items-center justify-center rounded-3xl border-0 shadow-xl">
            <Loader2 className="animate-spin text-primary" />
          </Card>
        ) : !preview || stateCopy ? (
          <Card className="items-center rounded-3xl border-0 p-8 text-center shadow-xl">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-100 text-amber-700">
              <AlertTriangle size={25} />
            </div>
            <h1 className="mt-5 text-2xl font-bold">{stateCopy?.[0] ?? STATE_COPY.invalid[0]}</h1>
            <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-muted-foreground">
              {stateCopy?.[1] ?? STATE_COPY.invalid[1]}
            </p>
            {preview?.status === 'wrong_recipient' && (
              <Button className="mt-6 rounded-full" onClick={() => goToAuth('/login')}>Sign in with another account</Button>
            )}
          </Card>
        ) : (
          <Card className="overflow-hidden rounded-3xl border-0 p-0 shadow-xl">
            <div className="bg-[#071b31] p-7 text-white">
              <Badge className="border-white/15 bg-white/10 text-white hover:bg-white/10">Protected Deal invitation</Badge>
              <div className="mt-5 flex items-start gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/10">
                  {preview.inviterAccountType === 'business' ? <Building2 /> : <UserRound />}
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h1 className="text-xl font-bold">{preview.inviterName}</h1>
                    {preview.inviterVerified && <BadgeCheck size={18} className="text-emerald-400" />}
                  </div>
                  <p className="mt-1 text-sm text-white/65">invited you to a protected transaction</p>
                </div>
              </div>
            </div>

            <div className="space-y-5 p-6">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Proposed transaction</p>
                <h2 className="mt-2 text-lg font-bold">{preview.title}</h2>
                <p className="mt-2 text-3xl font-bold tabular-nums">{formatMinorAmount(preview.amountMinor, preview.currency)}</p>
              </div>

              <div className="grid gap-3 rounded-2xl bg-muted/60 p-4 text-sm sm:grid-cols-2">
                <div><p className="text-xs text-muted-foreground">Your role</p><p className="mt-1 font-semibold">{roleLabel(preview.yourRole)}</p></div>
                <div><p className="text-xs text-muted-foreground">Reference</p><p className="mt-1 font-semibold">{preview.reference}</p></div>
                <div className="sm:col-span-2">
                  <p className="flex items-center gap-1.5 text-xs text-muted-foreground"><Clock3 size={13} /> Invitation expiry</p>
                  <p className="mt-1 font-semibold">{new Date(preview.expiresAt).toLocaleString()}</p>
                </div>
              </div>

              <div className="rounded-xl border border-primary/15 bg-primary/[0.04] p-4 text-sm leading-6">
                <p className="flex gap-2 font-semibold"><LockKeyhole size={17} className="mt-1 shrink-0 text-primary" /> Limited preview</p>
                <p className="mt-1 text-muted-foreground">Sign in to verify the intended recipient and review the full agreement, evidence requirements, and payment conditions.</p>
                {preview.maskedContact && <p className="mt-2 text-xs text-muted-foreground">Sent to {preview.maskedContact}</p>}
              </div>

              {isAuthenticated ? (
                <Button className="h-12 w-full rounded-xl" disabled={claim.isPending} onClick={() => void claimInvitation()}>
                  {claim.isPending && <Loader2 size={16} className="mr-2 animate-spin" />}
                  Claim and review invitation
                </Button>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2">
                  <Button className="h-12 rounded-xl" onClick={() => goToAuth('/login')}>Sign in to continue</Button>
                  <Button variant="outline" className="h-12 rounded-xl" onClick={() => goToAuth(preview.intendedAccountType === 'business' ? '/register-business' : '/register-customer')}>
                    Create {preview.intendedAccountType} account
                  </Button>
                </div>
              )}

              <p className="flex gap-2 text-xs leading-5 text-muted-foreground">
                <ShieldCheck size={14} className="mt-0.5 shrink-0 text-emerald-600" />
                Opening this link does not accept the deal or move money. Acceptance requires verified contact details, agreement consent, liveness, and your transaction PIN.
              </p>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
