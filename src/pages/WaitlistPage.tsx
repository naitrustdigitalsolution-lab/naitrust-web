import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Check, CheckCircle2, ChevronDown, ShieldCheck } from 'lucide-react';
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
  const [step, setStep] = useState<1 | 2>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [complete, setComplete] = useState(false);
  const [form, setForm] = useState({
    fullName: '', businessName: '', email: '', phone: '',
    userTypes: [] as WaitlistUserType[], needs: [] as string[],
    range: '' as TransactionRange | '', note: '', consent: true,
  });

  const toggle = <T extends string>(items: T[], value: T) =>
    items.includes(value) ? items.filter((item) => item !== value) : [...items, value];

  function continueToPreferences() {
    if (!form.fullName.trim() || !form.email.trim() || !form.phone.trim()) {
      return toast.error('Add your name, email address, and phone number to continue.');
    }
    if (!/^\S+@\S+\.\S+$/.test(form.email)) return toast.error('Enter a valid email address.');
    setStep(2);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!form.userTypes.length) return toast.error('Select how you plan to use Naitrust.');
    if (!form.needs.length) return toast.error('Select what would help you most.');
    if (!form.consent) return toast.error('Confirm that Naitrust can contact you.');

    const payload: WaitlistPayload = {
      fullName: form.fullName.trim(),
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
    <div className="min-h-svh bg-background">
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
        <aside className="overflow-hidden rounded-3xl bg-gradient-to-br from-[#061a31] via-[#0a3158] to-[#087ff5] p-5 text-white shadow-xl sm:p-8 lg:sticky lg:top-24">
          <div className="flex items-center gap-3 lg:block">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white/12 lg:h-11 lg:w-11"><ShieldCheck size={21} /></div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-sky-300 lg:mt-7">Naitrust early access</p>
          </div>
          <h1 className="mt-4 text-2xl font-bold leading-tight tracking-[-0.04em] sm:text-4xl lg:mt-3">Payments built around trust.</h1>
          <p className="mt-2 text-sm leading-6 text-white/70 sm:mt-4 sm:text-base">Join early access for trusted payments and Protected Transactions.</p>
          <div className="mt-7 hidden space-y-3 text-sm text-white/80 lg:block">
            {['Trusted payment links and QR codes', 'Clear business and participant identity', 'Protected terms, evidence, and payment status'].map((item) => (
              <p key={item} className="flex items-start gap-2"><CheckCircle2 size={17} className="mt-0.5 shrink-0 text-emerald-300" />{item}</p>
            ))}
          </div>
        </aside>

        <section className="-mx-4 bg-background px-4 py-6 sm:mx-0 sm:rounded-3xl sm:border sm:p-8 sm:shadow-sm">
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
            <form onSubmit={submit} className="space-y-5">
              <div>
                <div className="mb-5 flex items-center gap-2" aria-label={`Step ${step} of 2`}>
                  <span className="h-1.5 flex-1 rounded-full bg-primary" />
                  <span className={`h-1.5 flex-1 rounded-full ${step === 2 ? 'bg-primary' : 'bg-muted'}`} />
                  <span className="ml-2 text-xs font-semibold text-muted-foreground">{step}/2</span>
                </div>
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-primary">{step === 1 ? 'About you' : 'Your early access'}</p>
                <h2 className="mt-2 text-2xl font-bold">{step === 1 ? 'Save your place' : 'What fits you best?'}</h2>
                <p className="mt-2 text-sm text-muted-foreground">{step === 1 ? 'It takes less than a minute.' : 'Choose at least one option in each group.'}</p>
              </div>

              {step === 1 ? (
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="grid gap-2 text-sm font-medium sm:col-span-2">Full name<Input required autoFocus autoComplete="name" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} /></label>
                  <label className="grid gap-2 text-sm font-medium">Email address<Input required type="email" inputMode="email" autoComplete="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></label>
                  <label className="grid gap-2 text-sm font-medium">Phone number<Input required type="tel" inputMode="tel" autoComplete="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></label>
                  <label className="grid gap-2 text-sm font-medium sm:col-span-2">Business or company <span className="font-normal text-muted-foreground">Optional</span><Input autoComplete="organization" value={form.businessName} onChange={(e) => setForm({ ...form, businessName: e.target.value })} /></label>
                </div>
              ) : (
                <>
                  <fieldset><legend className="text-sm font-semibold">I’m joining as</legend><div className="mt-3 grid gap-2 sm:grid-cols-2">{USER_TYPES.map((item) => { const active = form.userTypes.includes(item.value); return <button key={item.value} type="button" aria-pressed={active} onClick={() => setForm({ ...form, userTypes: [item.value] })} className={`flex min-h-11 items-center gap-2 rounded-xl border px-3 py-2 text-left text-xs font-medium transition ${active ? 'border-primary bg-primary/8 text-primary' : 'hover:border-primary/40'}`}><span className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${active ? 'border-primary bg-primary text-white' : ''}`}>{active && <Check size={11} />}</span>{item.label}</button>; })}</div></fieldset>

                  <fieldset><legend className="text-sm font-semibold">I’m most interested in</legend><div className="mt-3 grid gap-2 sm:grid-cols-2">{PAYMENT_NEEDS.map((item) => { const active = form.needs.includes(item.value); return <button key={item.value} type="button" aria-pressed={active} onClick={() => setForm({ ...form, needs: toggle(form.needs, item.value) })} className={`flex min-h-11 items-center gap-2 rounded-xl border px-3 py-2 text-left text-xs font-medium transition ${active ? 'border-primary bg-primary/8 text-primary' : 'hover:border-primary/40'}`}><span className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border ${active ? 'border-primary bg-primary text-white' : ''}`}>{active && <Check size={11} />}</span>{item.label}</button>; })}</div></fieldset>

                  <details className="group rounded-2xl border bg-muted/20 p-4">
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-sm font-semibold marker:hidden">
                      <span>Add more details <span className="font-normal text-muted-foreground">(optional)</span></span>
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-background text-muted-foreground shadow-sm transition group-open:rotate-180 group-open:text-primary">
                        <ChevronDown size={17} />
                      </span>
                    </summary>
                    <div className="mt-4 grid gap-4">
                      <label className="grid gap-2 text-sm font-medium">Typical transaction size<select value={form.range} onChange={(e) => setForm({ ...form, range: e.target.value as TransactionRange })} className="h-11 rounded-full border-2 border-input-border bg-input-background px-4 text-sm outline-none focus:border-primary"><option value="">Select one</option>{RANGES.map((range) => <option key={range.value} value={range.value}>{range.label}</option>)}</select></label>
                      <label className="grid gap-2 text-sm font-medium">What would make payments clearer?<Textarea value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} className="min-h-20" placeholder="Tell us in one sentence" /></label>
                    </div>
                  </details>
                  <label className="flex items-start gap-3 rounded-2xl bg-muted/60 p-3 text-xs leading-5 text-muted-foreground"><input type="checkbox" checked={form.consent} onChange={(e) => setForm({ ...form, consent: e.target.checked })} className="mt-0.5 h-4 w-4 accent-primary" />Naitrust can contact me about early access and useful product updates.</label>
                </>
              )}

              <div className="sticky bottom-0 -mx-4 border-t bg-background/95 px-4 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-4 backdrop-blur sm:static sm:mx-0 sm:border-0 sm:p-0">
                {step === 1 ? (
                  <Button type="button" size="lg" onClick={continueToPreferences} className="h-11 w-full rounded-full sm:h-12">Continue <ArrowRight size={17} /></Button>
                ) : (
                  <div className="flex gap-2">
                    <Button type="button" variant="outline" onClick={() => setStep(1)} className="h-11 flex-1 rounded-full">Back</Button>
                    <Button type="submit" disabled={isSubmitting} className="h-11 flex-[1.7] rounded-full">{isSubmitting ? 'Saving…' : 'Join waitlist'} <ArrowRight size={17} /></Button>
                  </div>
                )}
                <p className="mt-2 text-center text-xs text-muted-foreground">No spam. Only early-access updates.</p>
              </div>
            </form>
          )}
        </section>
      </main>
    </div>
  );
}
