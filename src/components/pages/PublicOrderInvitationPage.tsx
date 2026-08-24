import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { AlertTriangle, ExternalLink, Link2, Loader2, LockKeyhole, ShieldCheck, UserCheck } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../../libs/auth-context';
import { useClaimOrderInvitation, usePublicOrderInvitation } from '../../hooks/useOrderInvitations';
import { NaitrustLogo } from '../utility/NaitrustLogo';
import { SEOHead } from '../utility/SEOHead';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Card } from '../ui/card';

const STATE_COPY: Record<string, [string, string]> = {
  expired: ['Invitation expired', 'Ask the buyer to send a new invitation.'],
  withdrawn: ['Invitation withdrawn', 'The buyer withdrew this invitation before it was claimed.'],
  claimed: ['Already claimed', 'This invitation has already been connected to an account.'],
  invalid: ['Invitation not found', 'This link may be incomplete, changed, or no longer available.'],
};

export function PublicOrderInvitationPage() {
  const { token } = useParams<{ token: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { data: preview, isLoading } = usePublicOrderInvitation(token);
  const claim = useClaimOrderInvitation();
  const state = preview?.status === 'pending' ? null : preview?.status ?? 'invalid';
  const stateCopy = state ? STATE_COPY[state] ?? STATE_COPY.invalid : null;

  const returnTo = `${location.pathname}${location.search}`;
  const goToAuth = (path: string) => navigate(`${path}?returnTo=${encodeURIComponent(returnTo)}`, { state: { from: location } });

  const claimInvitation = async () => {
    if (!token || !user) return;
    try {
      const result = await claim.mutateAsync({ token, user: { id: user.id, name: user.name } });
      navigate(result.destination, { replace: true });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'This invitation could not be claimed.');
    }
  };

  return (
    <div className="min-h-screen bg-[#f4f7f9] px-4 pb-10 pt-12 dark:bg-background sm:pb-16 sm:pt-20 lg:pt-24">
      <SEOHead title="Sourcing agent invitation" description="Review a Naitrust sourcing order invitation." noindex />
      <div className="mx-auto max-w-xl">
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
            <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-muted-foreground">{stateCopy?.[1] ?? STATE_COPY.invalid[1]}</p>
          </Card>
        ) : (
          <Card className="overflow-hidden rounded-3xl border-0 p-0 shadow-xl">
            <div className="bg-[#071b31] p-7 text-white">
              <div className="flex items-center justify-between gap-3">
                <button type="button" onClick={() => navigate('/')} aria-label="Go to Naitrust home" className="rounded-lg transition-opacity hover:opacity-80">
                  <NaitrustLogo size="sm" textColor="text-white" />
                </button>
                <Badge className="border-white/15 bg-white/10 text-white hover:bg-white/10">{preview.kind === 'buyer_request' ? 'Order invitation' : 'Sourcing agent invitation'}</Badge>
              </div>
              <div className="mt-5 flex items-start gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/10"><UserCheck /></div>
                <div>
                  <h1 className="text-xl font-bold">{preview.invitedByName}</h1>
                  <p className="mt-1 text-sm text-white/65">
                    {preview.kind === 'buyer_request' ? 'found products for you and invited you to review and fund this order' : 'invited you to work on an order as a sourcing agent'}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-5 p-6">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Order</p>
                <h2 className="mt-2 text-lg font-bold">{preview.orderSummary}</h2>
                <p className="mt-1 text-sm text-muted-foreground">{preview.orderReference}{preview.destination ? ` · Delivering to ${preview.destination}` : ''}</p>
              </div>

              <div className="rounded-2xl border bg-muted/40 p-4">
                <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground"><Link2 size={13} /> Product links</p>
                <div className="mt-3 space-y-2">
                  {preview.links.map((link, index) => (
                    <a key={`${link.url}-${index}`} href={link.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 truncate text-sm font-medium text-primary hover:underline">
                      {link.url} <ExternalLink size={12} className="shrink-0" />
                    </a>
                  ))}
                </div>
              </div>

              <div className="rounded-xl border border-primary/15 bg-primary/[0.04] p-4 text-sm leading-6">
                <p className="flex gap-2 font-semibold"><LockKeyhole size={17} className="mt-1 shrink-0 text-primary" /> Sign in to accept</p>
                <p className="mt-1 text-muted-foreground">
                  {preview.kind === 'buyer_request'
                    ? 'Sign in or create a buyer account to review this order and continue with your sourcing agent.'
                    : 'Sign in or create a sourcing-agent account to confirm supplier, price and specifications for this order.'}
                </p>
              </div>

              {isAuthenticated ? (
                <Button className="h-12 w-full rounded-xl" disabled={claim.isPending} onClick={() => void claimInvitation()}>
                  {claim.isPending && <Loader2 size={16} className="mr-2 animate-spin" />}
                  Accept and open order
                </Button>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2">
                  <Button className="h-12 rounded-xl" onClick={() => goToAuth('/login')}>Sign in to continue</Button>
                  <Button variant="outline" className="h-12 rounded-xl" onClick={() => goToAuth('/register')}>Create account</Button>
                </div>
              )}

              <p className="flex gap-2 text-xs leading-5 text-muted-foreground">
                <ShieldCheck size={14} className="mt-0.5 shrink-0 text-emerald-600" />
                {preview.kind === 'buyer_request'
                  ? 'Accepting does not move any payment. You review the order and pay only once you approve the confirmed quote.'
                  : 'Accepting does not move any payment. You confirm supplier, price and specifications first, and the buyer approves before anything is paid.'}
              </p>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
