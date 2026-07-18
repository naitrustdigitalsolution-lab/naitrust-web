/**
 * InvitationDetailPage
 * Accept flow for a single invitation (`/app/invitations/:id`): a centered
 * card state machine — loading, not-found, and the invitation detail with
 * the agreement document and Accept / Decline actions (only while pending).
 * The agreement must be explicitly consented to (checkbox) before Accept
 * enables; accepting agrees the terms and drops the user into their deals.
 */

import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { ArrowLeft, Check, Loader2, ScanFace, ShieldCheck, X } from 'lucide-react';
import { toast } from 'sonner';
import { DashboardLayout } from '../pieces/dashboard/DashboardLayout';
import { CounterpartyAvatar } from '../pieces/dashboard/CounterpartyAvatar';
import { InvitationStatusBadge } from '../pieces/invitations/InvitationStatusBadge';
import { AgreementDocument } from '../pieces/agreement/AgreementDocument';
import { LivenessCheckModal } from '../pieces/verification/LivenessCheckModal';
import { PinPromptModal } from '../pieces/security/PinPromptModal';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Checkbox } from '../ui/checkbox';
import Spinner from '../ui/spinner';
import { useInvitation, useRespondToInvitation } from '../../hooks/useInvitations';
import { useSecurity } from '../../hooks/useSecurity';
import {
  formatMinorAmount,
  partyModeLabel,
  roleLabel,
} from '../../libs/utils/safe-deal-presentation';

function CenteredCard({ children }: { children: React.ReactNode }) {
  return <div className="mx-auto w-full max-w-4xl">{children}</div>;
}

export function InvitationDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: invitation, isLoading, isError } = useInvitation(id);
  const respond = useRespondToInvitation();
  const security = useSecurity();
  const [agreementAccepted, setAgreementAccepted] = useState(false);
  const [livenessOk, setLivenessOk] = useState(security.livenessFresh);
  const [showLiveness, setShowLiveness] = useState(false);
  const [showPin, setShowPin] = useState(false);

  // Prompt a liveness check when the user opens a live invitation without a
  // fresh check — a photo of who is accepting, for the counterparty's records.
  useEffect(() => {
    if (invitation?.status === 'pending' && !livenessOk) setShowLiveness(true);
  }, [invitation?.status, livenessOk]);

  const runResponse = async (action: 'accepted' | 'declined') => {
    if (!id) return;
    try {
      await respond.mutateAsync({ id, action });
      if (action === 'accepted') {
        toast.success('Invitation accepted — the property transaction is now in your dashboard.');
        navigate('/app');
      } else {
        toast.info('Invitation declined.');
        navigate('/app/invitations');
      }
    } catch {
      toast.error('Could not update the invitation. Please try again.');
    }
  };

  // Accepting is a commitment → gate it behind the transaction PIN.
  const handleRespond = (action: 'accepted' | 'declined') => {
    if (action === 'accepted') {
      setShowPin(true);
      return;
    }
    void runResponse('declined');
  };

  return (
    <DashboardLayout title="Invitation">
      <LivenessCheckModal
        open={showLiveness}
        onOpenChange={setShowLiveness}
        onVerified={() => {
          setLivenessOk(true);
          setShowLiveness(false);
        }}
        reason="You have a new invitation. We'll take a live photo to confirm it is really you — this is shared with the counterparty for their records."
      />
      <PinPromptModal
        open={showPin}
        onOpenChange={setShowPin}
        onVerified={() => runResponse('accepted')}
        title="Confirm with your PIN"
        description="Enter your 4-digit transaction PIN to accept this deal."
      />
      <CenteredCard>
        <button
          type="button"
          onClick={() => navigate('/app/invitations')}
          className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft size={16} />
          All invitations
        </button>

        {isLoading ? (
          <Card className="flex items-center justify-center p-12 shadow-sm">
            <Spinner size="lg" />
          </Card>
        ) : isError || !invitation ? (
          <Card className="flex flex-col items-center gap-3 p-10 text-center shadow-sm">
            <p className="font-semibold text-foreground">Invitation not found</p>
            <p className="max-w-sm text-sm text-muted-foreground">
              This invitation may have been withdrawn or the link is no longer valid.
            </p>
            <Button variant="outline" className="mt-2 rounded-full" onClick={() => navigate('/app/invitations')}>
              Back to invitations
            </Button>
          </Card>
        ) : (
          <Card className="gap-5 p-6 shadow-sm" aria-label="Invitation details">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <CounterpartyAvatar name={invitation.fromName} className="h-11 w-11 text-sm" />
                <div>
                  <p className="font-semibold text-foreground">{invitation.fromName}</p>
                  <p className="text-sm text-muted-foreground">invited you to a property transaction</p>
                </div>
              </div>
              <InvitationStatusBadge status={invitation.status} />
            </div>

            <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
              <div className="mb-1 flex flex-wrap items-center gap-2">
                <Badge variant="outline">{partyModeLabel(invitation.partyMode)}</Badge>
                <Badge variant="outline">You join as {roleLabel(invitation.yourRole)}</Badge>
              </div>
              <p className="text-sm font-semibold text-foreground">{invitation.title}</p>
              <p className="mt-1 text-2xl font-bold text-foreground tabular-nums">
                {formatMinorAmount(invitation.amountMinor, invitation.currency)}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">Reference {invitation.reference}</p>
            </div>

            {invitation.message && (
              <div>
                <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Message
                </p>
                <p className="text-sm leading-6 text-foreground">{invitation.message}</p>
              </div>
            )}

            <AgreementDocument agreement={invitation.agreement} scrollable />

            {invitation.status === 'pending' ? (
              <>
                <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-primary/20 bg-primary/5 p-4">
                  <Checkbox
                    checked={agreementAccepted}
                    onCheckedChange={(checked) => setAgreementAccepted(checked === true)}
                    className="mt-0.5"
                  />
                  <span className="text-sm leading-6 text-foreground">
                    I have read the Naitrust safe-deal agreement above and agree to its terms as
                    the {roleLabel(invitation.yourRole)}.
                  </span>
                </label>

                {!livenessOk && (
                  <button
                    type="button"
                    onClick={() => setShowLiveness(true)}
                    className="flex w-full items-center gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-left"
                  >
                    <ScanFace size={18} className="shrink-0 text-amber-600 dark:text-amber-400" />
                    <span className="text-sm leading-5 text-foreground">
                      Complete a quick liveness check to accept this invitation.
                      <span className="ml-1 font-semibold text-primary underline">Start check</span>
                    </span>
                  </button>
                )}

                <p className="text-xs text-muted-foreground">
                  Expires {formatDistanceToNow(new Date(invitation.expiresAt), { addSuffix: true })}.
                  Accepting agrees to these terms; payment is protected through a regulated partner.
                </p>
                <div className="flex flex-col gap-3 sm:flex-row">
                  <Button
                    className="flex-1 rounded-full"
                    onClick={() => handleRespond('accepted')}
                    disabled={respond.isPending || !agreementAccepted || !livenessOk}
                  >
                    {respond.isPending && respond.variables?.action === 'accepted' ? (
                      <Loader2 size={16} className="mr-1.5 animate-spin" />
                    ) : (
                      <Check size={16} className="mr-1.5" />
                    )}
                    Accept invitation
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1 rounded-full"
                    onClick={() => handleRespond('declined')}
                    disabled={respond.isPending}
                  >
                    {respond.isPending && respond.variables?.action === 'declined' ? (
                      <Loader2 size={16} className="mr-1.5 animate-spin" />
                    ) : (
                      <X size={16} className="mr-1.5" />
                    )}
                    Decline
                  </Button>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2 rounded-lg bg-muted px-4 py-3 text-sm text-muted-foreground">
                <ShieldCheck size={16} />
                {invitation.status === 'expired'
                  ? 'This invitation has expired and can no longer be accepted.'
                  : `This invitation was ${invitation.status}.`}
              </div>
            )}
          </Card>
        )}
      </CenteredCard>
    </DashboardLayout>
  );
}
