import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Check, CheckCircle2, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { SEOHead } from '../components/utility/SEOHead';
import { NaitrustLogo } from '../components/utility/NaitrustLogo';
import { joinWaitlist } from '../services/publicService';
import type { TransactionRange, WaitlistPayload, WaitlistUserType } from '../types/global';

const USER_TYPES: Array<{ value: WaitlistUserType; label: string }> = [
  { value: 'informal_business', label: 'Market trader or stall owner' },
  { value: 'business_buyer', label: 'Shop, retail business or company' },
  { value: 'supplier_vendor', label: 'Wholesaler, supplier or distributor' },
  { value: 'marketplace_social_seller', label: 'Online or social seller' },
  { value: 'contractor_service_provider', label: 'Service business or contractor' },
  { value: 'individual_customer', label: 'Individual customer' },
  { value: 'other', label: 'Something else' },
];

const PAYMENT_NEEDS = [
  { value: 'conversation-payments', label: 'Receive payments from conversations' },
  { value: 'payment-links-qr', label: 'Share payment links and QR codes' },
  { value: 'supplier-payments', label: 'Pay suppliers and saved businesses' },
  { value: 'protected-transactions', label: 'Protect important transactions' },
  { value: 'payment-reconciliation', label: 'Confirm and reconcile payments' },
  { value: 'other', label: 'Something else' },
];

const RANGES: Array<{ value: TransactionRange; label: string }> = [
  { value: 'below_100k', label: 'Below NGN 100k' },
  { value: '100k_500k', label: 'NGN 100k – 500k' },
  { value: '500k_5m', label: 'NGN 500k – 5m' },
  { value: '5m_50m', label: 'NGN 5m – 50m' },
  { value: 'above_50m', label: 'Above NGN 50m' },
];

export default function WaitlistPage() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [complete, setComplete] = useState(false);
  const [form, setForm] = useState({
    firstName: '', lastName: '', businessName: '', email: '', phone: '',
    userTypes: [] as WaitlistUserType[], needs: [] as string[],
    range: '' as TransactionRange | '', note: '', consent: true,
  });

  const toggle = <T extends string>(items: T[], value: T) =>
    items.includes(value) ? items.filter((item) => item !== value) : [...items, value];

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!form.userTypes.length) return toast.error('Select how you plan to use Naitrust.');
    if (!form.needs.length) return toast.error('Select what would help you most.');
    if (!form.consent) return toast.error('Confirm that Naitrust can contact you.');

    const payload: WaitlistPayload = {
      fullName: `${form.firstName} ${form.lastName}`.trim(),
      businessName: form.businessName,
      email: form.email,
      phone: form.phone,
      userType: form.userTypes.join(', '),
      transactionRange: form.range,
      transactionNeed: form.note,
      expectations: form.needs.join(', '),
      consent: form.consent,
      source: 'public_waitlist_page',
      submittedAt: new Date().toISOString(),
    };

    setIsSubmitting(true);
    try {
      await joinWaitlist(payload);
      setComplete(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to save your place right now.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-svh bg-[#f4f8fc] dark:bg-background">
      <SEOHead title="Join the Naitrust Waitlist" description="Join Naitrust early access for trusted payment links, business payments, and Protected Transactions." canonicalPath="/waitlist" />
      <header className="sticky top-0 z-20 border-b bg-background/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4 sm:px-6">
          <button type="button" onClick={() => navigate('/')} className="inline-flex h-10 items-center gap-2 rounded-full px-2 text-sm font-semibold text-muted-foreground transition hover:bg-muted hover:text-foreground">
            <ArrowLeft size={18} /> <span>Back home</span>
          </button>
          <NaitrustLogo size="sm" showText />
        </div>
      </header>

      <main className="mx-auto grid max-w-5xl gap-6 px-4 py-6 sm:px-6 sm:py-10 lg:grid-cols-[.78fr_1.22fr] lg:items-start">
        <aside className="overflow-hidden rounded-3xl bg-gradient-to-br from-[#061a31] via-[#0a3158] to-[#087ff5] p-6 text-white shadow-xl sm:p-8 lg:sticky lg:top-24">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/12"><ShieldCheck size={22} /></div>
          <p className="mt-7 text-xs font-bold uppercase tracking-[0.16em] text-sky-300">Naitrust early access</p>
          <h1 className="mt-3 text-3xl font-bold leading-tight tracking-[-0.04em] sm:text-4xl">Payments built around trust.</h1>
          <p className="mt-4 text-sm leading-6 text-white/70 sm:text-base">Be among the first to receive customer payments, verify who you are paying, and protect important transactions in one clear record.</p>
          <div className="mt-7 space-y-3 text-sm text-white/80">
            {['Trusted payment links and QR codes', 'Clear business and participant identity', 'Protected terms, evidence, and payment status'].map((item) => (
              <p key={item} className="flex items-start gap-2"><CheckCircle2 size={17} className="mt-0.5 shrink-0 text-emerald-300" />{item}</p>
            ))}
          </div>
        </aside>

        <section className="rounded-3xl border bg-background p-5 shadow-sm sm:p-8">
          {complete ? (
            <div className="grid min-h-[28rem] place-items-center text-center">
              <div>
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600"><CheckCircle2 size={32} /></div>
                <h2 className="mt-6 text-2xl font-bold">Your place is saved.</h2>
                <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-muted-foreground">We’ll keep you updated and let you know when your Naitrust early access is ready.</p>
                <Button className="mt-7 rounded-full" onClick={() => navigate('/')}>Back to Naitrust <ArrowRight size={16} /></Button>
              </div>
            </div>
          ) : (
            <form onSubmit={submit} className="space-y-6">
              <div><p className="text-xs font-bold uppercase tracking-[0.14em] text-primary">Tell us about you</p><h2 className="mt-2 text-2xl font-bold">Join the waiting list</h2><p className="mt-2 text-sm text-muted-foreground">Fields marked required help us prepare the right early-access experience.</p></div>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="grid gap-2 text-sm font-medium">First name<Input required autoComplete="given-name" value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} /></label>
                <label className="grid gap-2 text-sm font-medium">Last name<Input required autoComplete="family-name" value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} /></label>
                <label className="grid gap-2 text-sm font-medium">Email address<Input required type="email" inputMode="email" autoComplete="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></label>
                <label className="grid gap-2 text-sm font-medium">Phone number<Input required type="tel" inputMode="tel" autoComplete="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></label>
                <label className="grid gap-2 text-sm font-medium sm:col-span-2">Business or company <span className="font-normal text-muted-foreground">Optional</span><Input autoComplete="organization" value={form.businessName} onChange={(e) => setForm({ ...form, businessName: e.target.value })} /></label>
              </div>

              <fieldset><legend className="text-sm font-semibold">How will you use Naitrust?</legend><div className="mt-3 grid gap-2 sm:grid-cols-2">{USER_TYPES.map((item) => { const active = form.userTypes.includes(item.value); return <button key={item.value} type="button" aria-pressed={active} onClick={() => setForm({ ...form, userTypes: toggle(form.userTypes, item.value) })} className={`flex min-h-11 items-center gap-2 rounded-xl border px-3 py-2 text-left text-xs font-medium transition ${active ? 'border-primary bg-primary/8 text-primary' : 'hover:border-primary/40'}`}><span className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border ${active ? 'border-primary bg-primary text-white' : ''}`}>{active && <Check size={11} />}</span>{item.label}</button>; })}</div></fieldset>

              <fieldset><legend className="text-sm font-semibold">What would help you most?</legend><div className="mt-3 grid gap-2 sm:grid-cols-2">{PAYMENT_NEEDS.map((item) => { const active = form.needs.includes(item.value); return <button key={item.value} type="button" aria-pressed={active} onClick={() => setForm({ ...form, needs: toggle(form.needs, item.value) })} className={`flex min-h-11 items-center gap-2 rounded-xl border px-3 py-2 text-left text-xs font-medium transition ${active ? 'border-primary bg-primary/8 text-primary' : 'hover:border-primary/40'}`}><span className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border ${active ? 'border-primary bg-primary text-white' : ''}`}>{active && <Check size={11} />}</span>{item.label}</button>; })}</div></fieldset>

              <label className="grid gap-2 text-sm font-medium">Typical transaction size <span className="font-normal text-muted-foreground">Optional</span><select value={form.range} onChange={(e) => setForm({ ...form, range: e.target.value as TransactionRange })} className="h-11 rounded-full border-2 border-input-border bg-input-background px-4 text-sm outline-none focus:border-primary"><option value="">Select one</option>{RANGES.map((range) => <option key={range.value} value={range.value}>{range.label}</option>)}</select></label>
              <label className="grid gap-2 text-sm font-medium">What would make your payments clearer? <span className="font-normal text-muted-foreground">Optional</span><Textarea value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} className="min-h-24" placeholder="Tell us in one sentence" /></label>
              <label className="flex items-start gap-3 rounded-2xl bg-muted/60 p-4 text-sm text-muted-foreground"><input type="checkbox" checked={form.consent} onChange={(e) => setForm({ ...form, consent: e.target.checked })} className="mt-0.5 h-4 w-4 accent-primary" />Naitrust can contact me about early access and useful product updates.</label>

              <div className="sticky bottom-0 -mx-5 border-t bg-background/95 px-5 pb-[max(0.25rem,env(safe-area-inset-bottom))] pt-4 backdrop-blur sm:static sm:mx-0 sm:border-0 sm:p-0">
                <Button type="submit" size="lg" disabled={isSubmitting} className="h-12 w-full rounded-full">{isSubmitting ? 'Saving your place…' : 'Join the Naitrust waitlist'} <ArrowRight size={17} /></Button>
                <p className="mt-2 text-center text-xs text-muted-foreground">No spam. Only launch and early-access updates.</p>
              </div>
            </form>
          )}
        </section>
      </main>
    </div>
  );
}
