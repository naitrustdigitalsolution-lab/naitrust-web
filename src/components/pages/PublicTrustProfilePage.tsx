import { ArrowLeft, BadgeCheck, Building2, CalendarDays, CheckCircle2, Copy, ExternalLink, MessageCircle, ShieldCheck, Star } from 'lucide-react';
import { useParams, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { usePublicBusiness } from '../../hooks/useBusinessDirectory';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import Spinner from '../ui/spinner';
import { NaitrustLogo } from '../utility/NaitrustLogo';
import { SEOHead } from '../utility/SEOHead';
import reviewFixture from '../../mocks/apis/transaction-reviews.json';

export function PublicTrustProfilePage() {
  const { businessSlug } = useParams();
  const [searchParams] = useSearchParams();
  const { data: business, isLoading } = usePublicBusiness(businessSlug);
  const paymentUrl = typeof window === 'undefined' ? '' : `${window.location.origin}/pay/${businessSlug}`;
  const reviews = reviewFixture.data.filter((review) => review.businessId === business?.id && review.status === 'published' && review.transactionCompleted);
  const openedFromPayment = searchParams.get('from') === 'payment';
  const returnTo = searchParams.get('returnTo');

  if (isLoading) return <div className="grid min-h-svh place-items-center"><Spinner size="lg" /></div>;
  if (!business) return <div className="grid min-h-svh place-items-center px-4"><Card className="max-w-md p-8 text-center"><h1 className="text-xl font-bold">Trust Profile unavailable</h1><p className="mt-2 text-sm text-muted-foreground">Check the link with the person or business that shared it.</p></Card></div>;

  const copyProfile = async () => {
    await navigator.clipboard.writeText(window.location.href);
    toast.success('Trust Profile link copied');
  };

  const returnToPayment = () => {
    if (returnTo?.startsWith('/pay/')) window.location.assign(returnTo);
    else window.close();
  };

  return <div className="min-h-svh bg-[#f4f7f9] px-4 py-6 dark:bg-background sm:py-10">
    <SEOHead title={`${business.name} Trust Profile`} description={`Review verified business and transaction activity for ${business.name} on Naitrust.`} noindex />
    <div className="mx-auto max-w-5xl">
      <div className="mb-5 flex items-center justify-between gap-3"><NaitrustLogo /> <div className="flex gap-2">{openedFromPayment && <Button size="sm" variant="ghost" className="rounded-full" onClick={returnToPayment}><ArrowLeft size={14} /> Back to payment</Button>}<Button size="sm" variant="outline" className="rounded-full bg-white" onClick={() => void copyProfile()}><Copy size={14} /> Share</Button></div></div>
      <Card className="overflow-hidden rounded-3xl border-0 shadow-[0_24px_70px_rgba(7,27,49,.12)]">
        <div className="bg-[#071b31] p-6 text-white sm:p-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
            <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-xl font-bold text-[#071b31]">{business.name.split(' ').slice(0, 2).map((word) => word[0]).join('')}</span>
            <div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><h1 className="text-2xl font-bold sm:text-3xl">{business.name}</h1>{business.verified && <Badge className="border-emerald-300/30 bg-emerald-400/15 text-emerald-200"><BadgeCheck size={13} /> Verified business</Badge>}</div><p className="mt-2 text-sm text-white/65">{business.category} · {business.ntId}</p><p className="mt-3 max-w-2xl text-sm leading-6 text-white/70">{business.description}</p><p className="mt-3 text-xs text-white/45">Naitrust member since {new Date(business.createdAt).toLocaleDateString()}</p></div>
          </div>
        </div>
        <div className="space-y-7 p-5 sm:p-8">
          <div className="grid divide-y rounded-2xl border bg-muted/20 sm:grid-cols-4 sm:divide-x sm:divide-y-0">
            {[['Protected Deals completed', business.completedProtectedTransactions ?? 0], ['Completion rate', `${business.completionRatePercent ?? 0}%`], ['Response rate', `${business.responseRatePercent ?? 0}%`], ['Transaction reviews', business.verifiedReviewCount ?? 0]].map(([label, value]) => <div key={String(label)} className="p-4"><p className="text-xl font-bold sm:text-2xl">{value}</p><p className="mt-1 text-xs text-muted-foreground">{label}</p></div>)}
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border p-4"><p className="flex items-center gap-2 font-semibold"><ShieldCheck size={17} className="text-emerald-600" /> Verification information</p><div className="mt-3 grid gap-3 text-sm text-muted-foreground"><div className="flex gap-2"><CheckCircle2 size={15} className="mt-0.5 shrink-0" /><span><strong className="block text-foreground">Business identity verified</strong>Business details were matched during verification.</span></div><div className="flex gap-2"><CheckCircle2 size={15} className="mt-0.5 shrink-0" /><span><strong className="block text-foreground">Representative verified</strong>An authorised representative completed identity checks.</span></div>{business.verificationExpiresAt && <p className="flex gap-2"><CalendarDays size={15} /> Verification current until {new Date(business.verificationExpiresAt).toLocaleDateString()}</p>}</div></div>
            <div className="rounded-2xl border p-4"><p className="flex items-center gap-2 font-semibold"><Star size={17} className="fill-amber-400 text-amber-400" /> Transaction-backed feedback</p><p className="mt-3 text-3xl font-bold">{business.ratingAverage?.toFixed(1) ?? '—'} <span className="text-sm font-normal text-muted-foreground">from {business.verifiedReviewCount ?? 0} completed transactions</span></p><p className="mt-2 text-xs leading-5 text-muted-foreground">Only eligible participants can review a completed Naitrust transaction.</p></div>
          </div>
          {reviews.length > 0 && <section>
            <div className="mb-3"><h2 className="font-semibold">Customer feedback</h2><p className="mt-1 text-xs text-muted-foreground">Reviews are available only after a completed Naitrust transaction.</p></div>
            <div className="overflow-hidden rounded-2xl border bg-card">{reviews.map((review) => <article key={review.id} className="border-b p-4 last:border-b-0 sm:p-5"><div className="flex gap-3"><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">{review.reviewerName.split(' ').map((word) => word[0]).slice(0, 2).join('')}</span><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center justify-between gap-2"><div><p className="text-sm font-semibold">{review.reviewerName}</p><p className="text-[11px] text-muted-foreground">Completed transaction · {new Date(review.createdAt).toLocaleDateString()}</p></div><span className="flex items-center gap-0.5" aria-label={`${review.rating} out of 5 stars`}>{Array.from({ length: 5 }, (_, index) => <Star key={index} size={13} className={index < review.rating ? 'fill-amber-400 text-amber-400' : 'text-muted'} />)}</span></div><p className="mt-3 text-sm leading-6 text-foreground/80">{review.comment}</p><div className="mt-3 flex flex-wrap gap-1.5">{review.tags.map((tag) => <span key={tag} className="rounded-full bg-muted px-2.5 py-1 text-[11px] text-muted-foreground">{tag}</span>)}</div></div></div></article>)}</div>
          </section>}
          <div className="rounded-2xl bg-muted/50 p-4 text-xs leading-5 text-muted-foreground">Verification confirms information checked by Naitrust or its providers at a point in time. It is not a guarantee of delivery, quality, solvency, or future behaviour.</div>
          <div className="flex flex-col gap-2 sm:flex-row"><Button className="flex-1 rounded-full" onClick={() => window.location.assign(paymentUrl)}><Building2 size={16} /> Pay with Naitrust</Button>{business.phone && <Button variant="outline" className="flex-1 rounded-full" onClick={() => window.location.assign(`tel:${business.phone}`)}><MessageCircle size={16} /> Contact business</Button>}{business.website && <Button variant="outline" className="rounded-full" onClick={() => window.open(business.website, '_blank', 'noopener,noreferrer')}><ExternalLink size={16} /></Button>}</div>
        </div>
      </Card>
    </div>
  </div>;
}
