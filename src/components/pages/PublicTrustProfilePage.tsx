import { ArrowLeft, AtSign, BadgeCheck, Bookmark, Building2, CalendarDays, CheckCircle2, Copy, ExternalLink, Globe, Landmark, Mail, MapPin, MessageCircle, Phone, Send, ShieldCheck, Star } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { usePublicBusiness } from '../../hooks/useBusinessDirectory';
import { useBusinessReviews } from '../../hooks/useBusinessReviews';
import { useAuth } from '../../libs/auth-context';
import { BusinessReviewComposer } from '../pieces/business/BusinessReviewComposer';
import { BusinessReviewFeed } from '../pieces/business/BusinessReviewFeed';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import Spinner from '../ui/spinner';
import { NaitrustLogo } from '../utility/NaitrustLogo';
import { SEOHead } from '../utility/SEOHead';
import { useSavedBusinesses } from '../../hooks/useSavedBusinesses';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '../ui/sheet';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';

const REVIEWS_PER_PAGE = 5;

function socialUrl(platform: string, value: string) {
  if (/^https?:\/\//i.test(value)) return value;
  const handle = value.replace(/^@/, '');
  const hosts: Record<string, string> = {
    facebook: 'facebook.com',
    instagram: 'instagram.com',
    linkedin: 'linkedin.com/in',
    tiktok: 'tiktok.com/@',
    twitter: 'x.com',
    x: 'x.com',
    youtube: 'youtube.com/@',
  };
  const host = hosts[platform.toLowerCase()];
  return host ? `https://${host}/${handle}` : undefined;
}

interface PublicTrustProfilePageProps {
  businessIdentifier?: string;
  embedded?: boolean;
  showBackToBusinesses?: boolean;
}

export function PublicTrustProfilePage({ businessIdentifier, embedded = false, showBackToBusinesses = true }: PublicTrustProfilePageProps = {}) {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [reviewPage, setReviewPage] = useState(1);
  const [payOpen, setPayOpen] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);
  const [payAmount, setPayAmount] = useState('');
  const [message, setMessage] = useState('');
  const { businessSlug } = useParams();
  const [searchParams] = useSearchParams();
  const profileIdentifier = businessIdentifier ?? businessSlug;
  const { data: business, isLoading } = usePublicBusiness(profileIdentifier);
  const { savedBusinessIds, toggleSavedBusiness } = useSavedBusinesses();
  const { data: reviewData, isLoading: reviewsLoading } = useBusinessReviews(business?.id, user);
  const reviews = reviewData?.reviews ?? [];
  const reviewPageStart = (reviewPage - 1) * REVIEWS_PER_PAGE;
  const openedFromPayment = searchParams.get('from') === 'payment';
  const returnTo = searchParams.get('returnTo');

  useEffect(() => {
    setReviewPage(1);
  }, [business?.id, reviews.length]);

  if (isLoading) return <div className="grid min-h-svh place-items-center"><Spinner size="lg" /></div>;
  if (!business) return <div className="grid min-h-svh place-items-center px-4"><Card className="max-w-md p-8 text-center"><h1 className="text-xl font-bold">Trust Profile unavailable</h1><p className="mt-2 text-sm text-muted-foreground">Check the link with the person or business that shared it.</p></Card></div>;

  const publicSlug = business.slug ?? business.id;
  const submittedReviews = reviews.filter((review) => review.reviewerUserId);
  const baseReviewCount = business.verifiedReviewCount ?? 0;
  const displayedReviewCount = baseReviewCount + submittedReviews.length;
  const displayedRating = displayedReviewCount > 0
    ? (((business.ratingAverage ?? 0) * baseReviewCount) + submittedReviews.reduce((sum, review) => sum + review.rating, 0)) / displayedReviewCount
    : null;
  const paymentUrl = typeof window === 'undefined' ? '' : `${window.location.origin}/pay/${publicSlug}`;
  const publicProfileUrl = typeof window === 'undefined' ? '' : `${window.location.origin}/trust/${publicSlug}`;
  const isBusinessOwner = user?.id === business.ownerUserId;

  const copyProfile = async () => {
    await navigator.clipboard.writeText(publicProfileUrl);
    toast.success('Trust Profile link copied');
  };

  const returnToPayment = () => {
    if (returnTo?.startsWith('/pay/')) window.location.assign(returnTo);
    else window.close();
  };

  const paymentAccount = business.paymentAccount ?? { bankName: 'Anchor Bank', accountNumber: '7012345678', accountName: `Naitrust / ${business.name}` };
  const startProtectedDeal = () => {
    const query = new URLSearchParams({ business: business.id, name: business.name, from: 'trust-profile' });
    if (business.email) query.set('email', business.email);
    const destination = `/app/deals/new?${query.toString()}`;
    navigate(isAuthenticated ? destination : `/login?returnTo=${encodeURIComponent(destination)}`);
  };

  return <div className={embedded ? 'w-full' : 'min-h-svh bg-[#f4f7f9] px-4 py-6 dark:bg-background sm:py-10'}>
    <SEOHead title={`${business.name} Trust Profile`} description={`Review verified business and transaction activity for ${business.name} on Naitrust.`} noindex />
    <div className="mx-auto max-w-5xl">
      <div className={`mb-5 flex items-center gap-3 ${embedded && !showBackToBusinesses ? 'justify-end' : 'justify-between'}`}>{embedded ? (showBackToBusinesses ? <Button size="sm" variant="ghost" className="rounded-full" onClick={() => navigate('/app/businesses')}><ArrowLeft size={14} /> Back to businesses</Button> : null) : <NaitrustLogo />} <div className="flex gap-2">{openedFromPayment && <Button size="sm" variant="ghost" className="rounded-full" onClick={returnToPayment}><ArrowLeft size={14} /> Back to payment</Button>}<Button size="sm" variant="outline" className="rounded-full bg-white" onClick={() => void copyProfile()}><Copy size={14} /> Share</Button></div></div>
      <Card className="overflow-hidden rounded-3xl border-0 shadow-[0_24px_70px_rgba(7,27,49,.12)]">
        <div className="bg-[#071b31] p-6 text-white sm:p-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
            <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-xl font-bold text-[#071b31]">{business.name.split(' ').slice(0, 2).map((word) => word[0]).join('')}</span>
            <div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><h1 className="text-2xl font-bold sm:text-3xl">{business.name}</h1>{business.verified && <Badge className="border-emerald-300/30 bg-emerald-400/15 text-emerald-200"><BadgeCheck size={13} /> Verified business</Badge>}</div><p className="mt-2 text-sm text-white/65">{business.category} · {business.ntId}</p><p className="mt-3 max-w-2xl text-sm leading-6 text-white/70">{business.description}</p><p className="mt-3 text-xs text-white/45">Naitrust member since {new Date(business.createdAt).toLocaleDateString()}</p></div>
          </div>
        </div>
        <div className="space-y-7 p-5 sm:p-8">
          <div className="flex flex-wrap items-center gap-2 rounded-2xl border bg-muted/20 p-2.5">
            <Button size="sm" className="rounded-full px-4" onClick={() => setPayOpen(true)}><Building2 size={15} /> Pay</Button>
            {isAuthenticated && !isBusinessOwner && <Button size="sm" variant="outline" className="rounded-full bg-background px-4" onClick={() => toggleSavedBusiness(business.id)}><Bookmark size={15} className={savedBusinessIds.includes(business.id) ? 'fill-primary text-primary' : ''} /> {savedBusinessIds.includes(business.id) ? 'Saved' : 'Save'}</Button>}
            <Button size="sm" variant="outline" className="rounded-full bg-background px-4" onClick={() => setContactOpen(true)}><MessageCircle size={15} /> Message</Button>
            {business.website && <Button size="icon" variant="outline" className="ml-auto h-9 w-9 rounded-full bg-background" aria-label={`Open ${business.name} website`} title="Open business website" onClick={() => window.open(business.website, '_blank', 'noopener,noreferrer')}><ExternalLink size={15} /></Button>}
          </div>
          <div className="grid divide-y rounded-2xl border bg-muted/20 sm:grid-cols-4 sm:divide-x sm:divide-y-0">
            {[['Protected Deals completed', business.completedProtectedTransactions ?? 0], ['Completion rate', `${business.completionRatePercent ?? 0}%`], ['Response rate', `${business.responseRatePercent ?? 0}%`], ['Transaction reviews', displayedReviewCount]].map(([label, value]) => <div key={String(label)} className="p-4"><p className="text-xl font-bold sm:text-2xl">{value}</p><p className="mt-1 text-xs text-muted-foreground">{label}</p></div>)}
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border p-4"><p className="flex items-center gap-2 font-semibold"><ShieldCheck size={17} className="text-emerald-600" /> Verification information</p><div className="mt-3 grid gap-3 text-sm text-muted-foreground"><div className="flex gap-2"><CheckCircle2 size={15} className="mt-0.5 shrink-0" /><span><strong className="block text-foreground">Business identity verified</strong>Business details were matched during verification.</span></div><div className="flex gap-2"><CheckCircle2 size={15} className="mt-0.5 shrink-0" /><span><strong className="block text-foreground">Representative verified</strong>An authorised representative completed identity checks.</span></div>{business.verificationExpiresAt && <p className="flex gap-2"><CalendarDays size={15} /> Verification current until {new Date(business.verificationExpiresAt).toLocaleDateString()}</p>}</div></div>
            <div className="rounded-2xl border p-4"><p className="flex items-center gap-2 font-semibold"><Star size={17} className="fill-amber-400 text-amber-400" /> Transaction-backed feedback</p><p className="mt-3 text-3xl font-bold">{displayedRating?.toFixed(1) ?? 'Not available'} <span className="text-sm font-normal text-muted-foreground">from {displayedReviewCount} completed transactions</span></p><p className="mt-2 text-xs leading-5 text-muted-foreground">Only customers who completed a Naitrust transfer or Protected Deal with this business can review it.</p></div>
          </div>
          <section className="rounded-2xl border p-4 sm:p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div><h2 className="font-semibold">Contact & online presence</h2><p className="mt-1 text-xs text-muted-foreground">Public details supplied by the business.</p></div>
              <Button size="sm" variant="outline" className="rounded-full" onClick={() => setContactOpen(true)}><MessageCircle size={14} /> Send a message</Button>
            </div>
            <div className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
              {business.email && <a href={`mailto:${business.email}`} className="flex min-w-0 items-center gap-3 rounded-xl bg-muted/40 p-3 hover:bg-muted"><Mail size={16} className="shrink-0 text-primary" /><span className="truncate">{business.email}</span></a>}
              {business.phone && <a href={`tel:${business.phone}`} className="flex min-w-0 items-center gap-3 rounded-xl bg-muted/40 p-3 hover:bg-muted"><Phone size={16} className="shrink-0 text-primary" /><span>{business.phone}</span></a>}
              {business.website && <a href={business.website} target="_blank" rel="noreferrer" className="flex min-w-0 items-center gap-3 rounded-xl bg-muted/40 p-3 hover:bg-muted"><Globe size={16} className="shrink-0 text-primary" /><span className="truncate">{business.website.replace(/^https?:\/\//, '')}</span><ExternalLink size={13} className="ml-auto shrink-0 text-muted-foreground" /></a>}
              {business.address && <div className="flex items-start gap-3 rounded-xl bg-muted/40 p-3"><MapPin size={16} className="mt-0.5 shrink-0 text-primary" /><span>{business.address}</span></div>}
            </div>
            {business.socialHandles && business.socialHandles.length > 0 && <div className="mt-4 border-t pt-4"><p className="mb-2 flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground"><AtSign size={14} /> Social media</p><div className="flex flex-wrap gap-2">{business.socialHandles.map((social) => { const href = socialUrl(social.platform, social.value); const content = <><span className="capitalize">{social.platform}</span><span className="font-normal text-muted-foreground">{social.value}</span>{href && <ExternalLink size={12} />}</>; return href ? <a key={`${social.platform}-${social.value}`} href={href} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 rounded-full border bg-background px-3 py-1.5 text-xs font-medium hover:bg-muted">{content}</a> : <span key={`${social.platform}-${social.value}`} className="inline-flex items-center gap-1.5 rounded-full border bg-background px-3 py-1.5 text-xs font-medium">{content}</span>; })}</div></div>}
            {!business.email && !business.phone && !business.website && !business.address && !business.socialHandles?.length && <p className="mt-4 rounded-xl bg-muted/40 p-3 text-sm text-muted-foreground">No public contact details have been added yet. You can still send an in-app message.</p>}
          </section>
          <section>
            <div className="mb-3 flex items-end justify-between gap-4"><div><h2 className="font-semibold">Customer feedback</h2><p className="mt-1 text-xs text-muted-foreground">Ratings and comments are tied to completed Naitrust transactions with this business.</p></div>{reviews.length > 0 && <p className="shrink-0 text-xs text-muted-foreground">{reviewPageStart + 1}–{Math.min(reviewPageStart + REVIEWS_PER_PAGE, reviews.length)} of {reviews.length}</p>}</div>
            {reviewsLoading ? <div className="grid min-h-28 place-items-center rounded-2xl border"><Spinner /></div> : <>
              <BusinessReviewComposer
                businessId={business.id}
                businessName={business.name}
                user={user}
                eligibleTransactions={reviewData?.eligibleTransactions ?? []}
                onSubmitted={() => setReviewPage(1)}
                onSignIn={() => navigate('/login')}
              />
              <BusinessReviewFeed
                reviews={reviews}
                page={reviewPage}
                pageSize={REVIEWS_PER_PAGE}
                onPageChange={setReviewPage}
              />
            </>}
          </section>
          <div className="rounded-2xl bg-muted/50 p-4 text-xs leading-5 text-muted-foreground">Verification confirms information checked by Naitrust or its providers at a point in time. It is not a guarantee of delivery, quality, solvency, or future behaviour.</div>
        </div>
      </Card>
    </div>
    <Sheet open={payOpen} onOpenChange={setPayOpen}>
      <SheetContent className="w-[94vw] gap-0 overflow-y-auto p-0 sm:max-w-xl">
        <SheetHeader className="border-b px-6 py-5"><SheetTitle>Pay {business.name}</SheetTitle><SheetDescription>Make a normal transfer or protect the transaction with agreed terms.</SheetDescription></SheetHeader>
        <div className="space-y-5 p-6">
          <div><Label htmlFor="profile-pay-amount">Amount to pay (NGN)</Label><Input id="profile-pay-amount" type="number" min="1" className="mt-2 h-12 text-lg font-semibold" value={payAmount} onChange={(event) => setPayAmount(event.target.value)} placeholder="0.00" /></div>
          <div className="rounded-2xl border bg-muted/30 p-4"><p className="flex items-center gap-2 text-sm font-semibold"><Landmark size={16} className="text-primary" /> Business payment account</p><p className="mt-4 text-xs text-muted-foreground">{paymentAccount.bankName}</p><div className="mt-1 flex items-center justify-between gap-3"><p className="font-mono text-2xl font-bold tracking-wider">{paymentAccount.accountNumber}</p><Button size="icon" variant="ghost" className="rounded-full" aria-label="Copy account number" onClick={() => void navigator.clipboard.writeText(paymentAccount.accountNumber).then(() => toast.success('Account number copied'))}><Copy size={15} /></Button></div><p className="mt-1 text-sm font-medium">{paymentAccount.accountName}</p></div>
          <Button className="h-11 w-full rounded-full" disabled={Number(payAmount) <= 0} onClick={() => toast.success('Transfer monitoring started. Naitrust will confirm when the provider reports payment.')}>I have made the transfer</Button>
          <div className="rounded-2xl border border-sky-200 bg-sky-50 p-4 dark:border-sky-400/15 dark:bg-sky-400/10"><p className="font-semibold">Need payment protection?</p><p className="mt-1 text-xs leading-5 text-muted-foreground">Create a Protected Deal with this business and keep terms, evidence, delivery, and payment status together.</p><Button variant="outline" className="mt-4 w-full rounded-full bg-background" onClick={startProtectedDeal}><ShieldCheck size={15} /> Start Protected Deal</Button></div>
        </div>
      </SheetContent>
    </Sheet>
    <Dialog open={contactOpen} onOpenChange={setContactOpen}>
      <DialogContent className="max-h-[90vh] gap-0 overflow-y-auto p-0 sm:max-w-xl">
        <DialogHeader className="border-b px-6 py-5 pr-14"><DialogTitle>Message {business.name}</DialogTitle><DialogDescription>Send a private message through Naitrust.</DialogDescription></DialogHeader>
        <div className="space-y-5 p-6">
          <div className="flex items-center gap-3 rounded-2xl border bg-muted/30 p-4"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 font-bold text-primary">{business.name.split(' ').slice(0, 2).map((word) => word[0]).join('')}</span><div className="min-w-0"><p className="truncate text-sm font-semibold">{business.name}</p><p className="text-xs text-muted-foreground">{business.ntId} · {business.category}</p></div></div>
          <div>
            <Label htmlFor="business-message">Message</Label>
            <Textarea
              id="business-message"
              rows={6}
              className="mt-2 resize-none"
              value={isAuthenticated ? message : ''}
              disabled={!isAuthenticated}
              onChange={(event) => setMessage(event.target.value)}
              placeholder={isAuthenticated ? 'Ask about an order, service, delivery, or payment...' : 'You must be logged in to contact this business.'}
            />
          </div>
          {isAuthenticated ? (
            <Button className="w-full rounded-full" disabled={!message.trim()} onClick={() => { toast.success(`Message sent to ${business.name}`); setMessage(''); setContactOpen(false); }}><Send size={15} /> Send message</Button>
          ) : (
            <Button className="w-full rounded-full" onClick={() => navigate(`/login?returnTo=${encodeURIComponent(window.location.pathname)}`)}>Log in to contact business</Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  </div>;
}
