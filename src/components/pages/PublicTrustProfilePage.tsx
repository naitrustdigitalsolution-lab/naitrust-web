import { ArrowLeft, AtSign, BadgeCheck, Bookmark, Building2, CalendarDays, CheckCircle2, ChevronDown, Copy, ExternalLink, Globe, ImagePlus, Landmark, Mail, MapPin, MessageCircle, Phone, Send, ShieldCheck, Star } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
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
  const [coverImage, setCoverImage] = useState('');
  const coverInputRef = useRef<HTMLInputElement>(null);
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

  const copyContact = async (value: string, label: string) => {
    await navigator.clipboard.writeText(value);
    toast.success(`${label} copied`);
  };

  const returnToPayment = () => {
    if (returnTo?.startsWith('/pay/')) window.location.assign(returnTo);
    else window.close();
  };

  const paymentAccount = business.paymentAccount ?? { bankName: 'Anchor Bank', accountNumber: '7012345678', accountName: `Naitrust / ${business.name}` };
  const startProtectedDeal = () => {
    const query = new URLSearchParams({ business: business.id, name: business.name, from: 'trust-profile' });
    if (business.email) query.set('email', business.email);
    if (Number(payAmount) > 0) query.set('amount', payAmount);
    const destination = `/app/deals/new?${query.toString()}`;
    navigate(isAuthenticated ? destination : `/login?returnTo=${encodeURIComponent(destination)}`);
  };

  const handleCoverImage = (file?: File) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setCoverImage(String(reader.result ?? ''));
      toast.success('Cover image updated');
    };
    reader.readAsDataURL(file);
  };

  return <div className={embedded ? 'w-full' : 'min-h-svh bg-[#f4f7f9] sm:px-4 sm:py-10 dark:bg-background'}>
    <SEOHead
      title={`${business.name} Trust Profile`}
      description={`Review available verification information, completed deal activity, and customer feedback for ${business.name} on Naitrust.`}
      canonicalPath={`/trust/${publicSlug}`}
      structuredData={{
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: business.name,
        url: `https://naitrust.com/trust/${publicSlug}`,
        description: business.description,
        address: business.address,
      }}
    />
    <div className="mx-auto max-w-5xl">
      <div className={`mb-3 flex items-center gap-3 px-3 pt-3 sm:mb-5 sm:px-0 sm:pt-0 ${embedded && !showBackToBusinesses ? 'justify-end' : 'justify-between'}`}>{embedded && showBackToBusinesses ? <Button size="sm" variant="ghost" className="h-9 rounded-full px-2 sm:px-3" onClick={() => navigate('/app/businesses')}><ArrowLeft size={16} /><span className="hidden sm:inline">Back to businesses</span></Button> : <span />} <div className="flex gap-2">{openedFromPayment && <Button size="sm" variant="ghost" className="rounded-full" onClick={returnToPayment}><ArrowLeft size={14} /> Back to payment</Button>}<Button size="icon" variant="outline" className="h-9 w-9 rounded-full bg-white sm:hidden" aria-label="Share Trust Profile" onClick={() => void copyProfile()}><Copy size={15} /></Button><Button size="sm" variant="outline" className="hidden rounded-full bg-white sm:inline-flex" onClick={() => void copyProfile()}><Copy size={14} /> Share</Button></div></div>
      <Card className="overflow-hidden rounded-none border-x-0 shadow-none sm:rounded-3xl sm:border-0 sm:shadow-[0_24px_70px_rgba(7,27,49,.12)]">
        <div className="relative min-h-24 bg-[#071b31] bg-cover bg-center p-5 text-white sm:min-h-32 sm:p-8" style={coverImage ? { backgroundImage: `linear-gradient(rgba(7,27,49,.45), rgba(7,27,49,.65)), url(${coverImage})` } : undefined}>
          {!embedded && <div className="relative z-10 flex items-center justify-between gap-3"><button type="button" onClick={() => navigate('/')} aria-label="Go to Naitrust home" className="rounded-lg transition-opacity hover:opacity-80"><NaitrustLogo size="sm" textColor="text-white" /></button><Badge className="border-white/15 bg-white/10 text-white hover:bg-white/10">Trust Profile</Badge></div>}
          {isBusinessOwner && <><input ref={coverInputRef} type="file" accept="image/*" className="hidden" onChange={(event) => handleCoverImage(event.target.files?.[0])} /><button type="button" className="absolute bottom-3 left-4 z-10 flex h-8 w-8 items-center justify-center rounded-full border border-white/20 bg-black/30 text-white backdrop-blur-sm transition hover:bg-black/50 sm:bottom-4 sm:left-8" aria-label="Upload cover image" title="Upload cover image" onClick={() => coverInputRef.current?.click()}><ImagePlus size={15} /></button></>}
          <span className="absolute -bottom-6 right-5 z-10 flex h-12 w-12 items-center justify-center rounded-full border-4 border-card bg-white text-sm font-bold text-[#071b31] shadow-sm sm:-bottom-8 sm:right-8 sm:h-16 sm:w-16 sm:text-xl">{business.name.split(' ').slice(0, 2).map((word) => word[0]).join('')}</span>
        </div>
        <div className="space-y-5 px-4 pb-4 pt-8 sm:space-y-7 sm:px-8 sm:pb-8 sm:pt-10">
          <div className="min-w-0">
            <div className="flex items-center gap-2 pr-14 sm:pr-20">
              <h1 className="min-w-0 text-xl font-bold leading-tight sm:text-3xl">{business.name}</h1>
              {business.verified && <><span className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 sm:hidden" aria-label="Verified business" title="Verified business"><BadgeCheck size={15} /></span><Badge variant="success" className="hidden shrink-0 sm:inline-flex"><BadgeCheck size={12} /> Verified</Badge></>}
            </div>
            <p className="mt-1.5 text-xs text-muted-foreground sm:text-sm">{business.category} · {business.ntId}</p>
            <p className="mt-2 line-clamp-2 max-w-2xl text-xs leading-5 text-muted-foreground sm:mt-3 sm:text-sm sm:leading-6">{business.description}</p>
            <p className="mt-2 text-[11px] text-muted-foreground sm:mt-3 sm:text-xs">Member since {new Date(business.createdAt).toLocaleDateString()}</p>
          </div>
          <div className={`grid divide-x overflow-hidden rounded-xl border bg-background ${isAuthenticated && !isBusinessOwner ? 'grid-cols-3 sm:max-w-md' : 'grid-cols-2 sm:max-w-xs'}`}>
            <button type="button" className="flex h-11 items-center justify-center gap-1.5 text-xs font-semibold text-primary transition-colors hover:bg-muted/50 sm:text-sm" onClick={() => setPayOpen(true)}><Building2 size={16} />Pay</button>
            {isAuthenticated && !isBusinessOwner && <button type="button" className="flex h-11 items-center justify-center gap-1.5 text-xs font-semibold transition-colors hover:bg-muted/50 sm:text-sm" onClick={() => toggleSavedBusiness(business.id)}><Bookmark size={16} className={savedBusinessIds.includes(business.id) ? 'fill-primary text-primary' : ''} />{savedBusinessIds.includes(business.id) ? 'Saved' : 'Save'}</button>}
            <button type="button" className="flex h-11 items-center justify-center gap-1.5 text-xs font-semibold transition-colors hover:bg-muted/50 sm:text-sm" onClick={() => setContactOpen(true)}><MessageCircle size={16} />Message</button>
          </div>
          <div className="grid grid-cols-2 overflow-hidden rounded-2xl border bg-muted/20 sm:grid-cols-4">
            {[['Deals completed', business.completedProtectedTransactions ?? 0], ['Completion rate', `${business.completionRatePercent ?? 0}%`], ['Response rate', `${business.responseRatePercent ?? 0}%`], ['Reviews', displayedReviewCount]].map(([label, value], index) => <div key={String(label)} className={`p-3 sm:p-4 ${index % 2 ? 'border-l' : ''} ${index > 1 ? 'border-t sm:border-t-0' : ''} ${index > 0 ? 'sm:border-l' : ''}`}><p className="text-lg font-bold sm:text-2xl">{value}</p><p className="mt-0.5 text-[11px] text-muted-foreground sm:mt-1 sm:text-xs">{label}</p></div>)}
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border p-4"><p className="flex items-center gap-2 font-semibold"><ShieldCheck size={17} className="text-emerald-600" /> Verification information</p><div className="mt-3 grid gap-3 text-sm text-muted-foreground"><div className="flex gap-2"><CheckCircle2 size={15} className="mt-0.5 shrink-0" /><span><strong className="block text-foreground">Business identity verified</strong>Business details were matched during verification.</span></div><div className="flex gap-2"><CheckCircle2 size={15} className="mt-0.5 shrink-0" /><span><strong className="block text-foreground">Representative verified</strong>An authorised representative completed identity checks.</span></div>{business.verificationExpiresAt && <p className="flex gap-2"><CalendarDays size={15} /> Verification current until {new Date(business.verificationExpiresAt).toLocaleDateString()}</p>}</div></div>
            <div className="rounded-2xl border p-4"><p className="flex items-center gap-2 font-semibold"><Star size={17} className="fill-amber-400 text-amber-400" /> Feedback from completed transactions</p><p className="mt-3 text-3xl font-bold">{displayedRating?.toFixed(1) ?? 'Not available'} <span className="text-sm font-normal text-muted-foreground">from {displayedReviewCount} completed transactions</span></p><p className="mt-2 text-xs leading-5 text-muted-foreground">Only customers who completed a Naitrust transfer or Protected Deal with this business can review it.</p></div>
          </div>
          <section className="rounded-2xl border p-4 sm:px-5 sm:py-4">
            <div className="sm:grid sm:grid-cols-[210px_minmax(0,1fr)] sm:items-center sm:gap-5">
              <div><h2 className="font-semibold">Contact & online presence</h2><p className="mt-1 text-xs text-muted-foreground">Public details supplied by the business.</p></div>
              <div className="mt-4 grid gap-2 text-sm sm:mt-0 sm:grid-cols-2">
                {business.email && <div className="flex min-w-0 items-start gap-2 rounded-xl bg-muted/40 px-3 py-2.5"><Mail size={15} className="mt-0.5 shrink-0 text-primary" /><a href={`mailto:${business.email}`} className="min-w-0 flex-1 break-all hover:underline">{business.email}</a><button type="button" className="shrink-0 rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground" aria-label="Copy email" onClick={() => void copyContact(business.email!, 'Email')}><Copy size={13} /></button></div>}
                {business.phone && <div className="flex min-w-0 items-start gap-2 rounded-xl bg-muted/40 px-3 py-2.5"><Phone size={15} className="mt-0.5 shrink-0 text-primary" /><a href={`tel:${business.phone}`} className="min-w-0 flex-1 break-words hover:underline">{business.phone}</a><button type="button" className="shrink-0 rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground" aria-label="Copy phone number" onClick={() => void copyContact(business.phone!, 'Phone number')}><Copy size={13} /></button></div>}
                {business.website && <div className="flex min-w-0 items-start gap-2 rounded-xl bg-muted/40 px-3 py-2.5"><Globe size={15} className="mt-0.5 shrink-0 text-primary" /><a href={business.website} target="_blank" rel="noreferrer" className="min-w-0 flex-1 break-all hover:underline">{business.website.replace(/^https?:\/\//, '')}</a><button type="button" className="shrink-0 rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground" aria-label="Copy website" onClick={() => void copyContact(business.website!, 'Website')}><Copy size={13} /></button></div>}
                {business.address && <div className="flex min-w-0 items-start gap-2 rounded-xl bg-muted/40 px-3 py-2.5"><MapPin size={15} className="mt-0.5 shrink-0 text-primary" /><span className="min-w-0 flex-1 break-words">{business.address}</span><button type="button" className="shrink-0 rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground" aria-label="Copy address" onClick={() => void copyContact(business.address!, 'Address')}><Copy size={13} /></button></div>}
              </div>
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
        <SheetHeader className="border-b px-6 py-5"><SheetTitle>Pay {business.name}</SheetTitle><SheetDescription>Protect the transaction with agreed terms, or pay directly if you already know and trust them.</SheetDescription></SheetHeader>
        <div className="space-y-5 p-6">
          {isAuthenticated && user?.name && (
            <div className="flex items-center justify-between gap-3 rounded-xl bg-muted/50 px-3 py-2.5">
              <div className="min-w-0"><p className="text-[11px] text-muted-foreground">Payer</p><p className="truncate text-sm font-semibold">{user.name}</p></div>
              <Badge variant="outline" className="shrink-0 rounded-full text-[10px]">Your account</Badge>
            </div>
          )}
          <div><Label htmlFor="profile-pay-amount">Amount to pay (NGN)</Label><Input id="profile-pay-amount" type="number" min="1" className="mt-2 h-12 text-lg font-semibold" value={payAmount} onChange={(event) => setPayAmount(event.target.value)} placeholder="0.00" /></div>
          <div className="rounded-2xl border border-primary/25 bg-primary/5 p-4">
            <p className="flex items-center gap-2 text-sm font-semibold"><ShieldCheck size={16} className="text-primary" /> Recommended: Protected Deal</p>
            <p className="mt-1 text-xs leading-5 text-muted-foreground">Keep terms, evidence, delivery, and payment status together, with the payment held until you confirm. This is how Naitrust verification actually protects you.</p>
            <Button className="mt-4 h-11 w-full rounded-full" onClick={startProtectedDeal}><ShieldCheck size={15} /> Start Protected Deal</Button>
          </div>
          <details className="group rounded-2xl border p-4">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-sm font-semibold text-foreground">
              I already know and trust them — pay directly instead
              <ChevronDown size={16} className="shrink-0 text-muted-foreground transition-transform group-open:rotate-180" />
            </summary>
            <div className="mt-4 space-y-4">
              <p className="text-xs leading-5 text-muted-foreground">A direct transfer is not protected: there is no held payment, evidence, or dispute review if something goes wrong.</p>
              <div className="rounded-2xl border bg-muted/30 p-4"><p className="flex items-center gap-2 text-sm font-semibold"><Landmark size={16} className="text-primary" /> Business payment account</p><p className="mt-4 text-xs text-muted-foreground">{paymentAccount.bankName}</p><div className="mt-1 flex items-center justify-between gap-3"><p className="font-mono text-2xl font-bold tracking-wider">{paymentAccount.accountNumber}</p><Button size="icon" variant="ghost" className="rounded-full" aria-label="Copy account number" onClick={() => void navigator.clipboard.writeText(paymentAccount.accountNumber).then(() => toast.success('Account number copied'))}><Copy size={15} /></Button></div><p className="mt-1 text-sm font-medium">{paymentAccount.accountName}</p></div>
              <Button variant="outline" className="h-11 w-full rounded-full" disabled={Number(payAmount) <= 0} onClick={() => toast.success('Transfer monitoring started. Naitrust will confirm when the provider reports payment.')}>I have made the transfer</Button>
            </div>
          </details>
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
