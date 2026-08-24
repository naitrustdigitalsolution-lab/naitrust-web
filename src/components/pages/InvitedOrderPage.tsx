import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ExternalLink, Link2, ShieldCheck } from 'lucide-react';
import { DashboardLayout } from '../pieces/dashboard/DashboardLayout';
import { PageHero } from '../pieces/dashboard/PageHero';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { usePublicOrderInvitation } from '../../hooks/useOrderInvitations';

export function InvitedOrderPage() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { data: invitation, isLoading } = usePublicOrderInvitation(token);

  return (
    <DashboardLayout title="Order invitation">
      <div className="mx-auto w-full max-w-3xl">
        <PageHero
          eyebrow="Sourcing agent invitation"
          title={invitation?.orderSummary ?? 'Order invitation'}
          description={`Invited by ${invitation?.invitedByName ?? 'a Naitrust buyer'}. Confirm supplier, price and specifications for these products before the buyer pays.`}
          icon={ShieldCheck}
          actions={
            <Button variant="outline" className="rounded-full bg-background/80" onClick={() => navigate('/app/orders')}>
              <ArrowLeft size={15} /> Orders
            </Button>
          }
        />

        {!isLoading && invitation && (
          <Card className="mt-5 rounded-2xl p-5 sm:p-6">
            <p className="text-xs text-muted-foreground">{invitation.orderReference}{invitation.destination ? ` · Delivering to ${invitation.destination}` : ''}</p>
            <p className="mt-4 flex items-center gap-2 text-sm font-semibold"><Link2 size={15} className="text-primary" /> Product links</p>
            <div className="mt-3 divide-y">
              {invitation.links.map((link, index) => (
                <div key={`${link.url}-${index}`} className="py-3">
                  <a href={link.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 truncate text-sm font-semibold text-primary hover:underline">{link.url} <ExternalLink size={12} className="shrink-0" /></a>
                  {link.note && <p className="mt-1 text-xs text-muted-foreground">{link.note}</p>}
                </div>
              ))}
            </div>
            <div className="mt-5 rounded-xl border border-primary/15 bg-primary/5 p-4 text-xs leading-5 text-muted-foreground">
              Message the buyer through Naitrust to confirm scope, then share your supplier findings and pricing. No payment moves until the buyer approves your quote.
            </div>
            <Button className="mt-5 rounded-full" onClick={() => navigate('/app/messages')}>Message the buyer</Button>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
