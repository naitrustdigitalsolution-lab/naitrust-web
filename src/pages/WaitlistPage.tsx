import { useState, type FormEvent } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Check, CheckCircle2, FileCheck2, LockKeyhole, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { SEOHead } from '../components/utility/SEOHead';
import { NaitrustLogo } from '../components/utility/NaitrustLogo';
import { PhoneField } from '../components/pieces/general/PhoneField';
import { joinWaitlist } from '../services/publicService';
import type { TransactionRange, WaitlistPayload, WaitlistUserType } from '../types/global';
import { WAITLIST_ROLE_OPTIONS } from '../libs/waitlist/marketplace-options';

const RANGES: Array<{ value: TransactionRange; label: string }> = [
  { value: 'below_500k', label: 'Below ₦500,000' },
  { value: '500k_2m', label: '₦500,000 – ₦2 million' },
  { value: '2m_5m', label: '₦2 million – ₦5 million' },
  { value: '5m_20m', label: '₦5 million – ₦20 million' },
  { value: '20m_50m', label: '₦20 million – ₦50 million' },
  { value: 'above_50m', label: 'Above ₦50 million' },
];

export default function WaitlistPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [step, setStep] = useState<1 | 2>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [complete, setComplete] = useState(false);
  const [form, setForm] = useState({
    fullName: '', businessName: '', email: searchParams.get('email') ?? '', phone: '',
    userTypes: [] as WaitlistUserType[],
    range: '' as TransactionRange | '', note: '', suggestion: '', consent: false,
  });

  const selectedRole = WAITLIST_ROLE_OPTIONS.find((option) => option.value === form.userTypes[0]);

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
    if (!selectedRole) return toast.error('Select who is joining the waiting list.');
    if (!form.consent) return toast.error('Confirm that Naitrust can contact you.');

    const payload: WaitlistPayload = {
      fullName: form.fullName.trim(),
      businessName: form.businessName,
      email: form.email,
      phone: form.phone,
      userType: selectedRole.label,
      transactionRange: form.range,
      transactionNeed: form.note,
      expectations: form.suggestion.trim() ? `Suggestion: ${form.suggestion.trim()}` : '',
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
    <div className="nt-auth nt-waitlist min-h-screen overflow-hidden text-foreground">
      <SEOHead title="Join the Naitrust Protected Payments Waiting List" description="Join early access to secure payments for buyers and sellers in Nigeria. Agree terms, keep evidence together and control payment release." canonicalPath="/waitlist" />
      <main className="nt-waitlist-shell">
        <aside className="nt-waitlist-story hidden lg:flex">
          <button type="button" onClick={() => navigate('/')} className="nt-waitlist-logo" aria-label="Naitrust home"><NaitrustLogo size="postMd" solidN textColor="text-white" /></button>
          <div className="nt-waitlist-story-copy">
            <p className="nt-waitlist-kicker"><span /> Early access</p>
            <h1>Be early to a safer way to do the deal.</h1>
            <p>Clear terms, protected payment and shared evidence—kept together from agreement to release.</p>
          </div>
          <div className="nt-waitlist-path" aria-label="The Naitrust protected deal journey">
            <div><FileCheck2 size={19} /><span><b>Agree</b><small>Set clear terms together</small></span></div>
            <i />
            <div><LockKeyhole size={19} /><span><b>Protect</b><small>Confirm secured payment</small></span></div>
            <i />
            <div><ShieldCheck size={19} /><span><b>Release</b><small>Complete the agreed conditions</small></span></div>
          </div>
        </aside>

        <section className="nt-waitlist-form-wrap auth-balanced-form"><div className="nt-waitlist-card">
          <div className="nt-waitlist-mobile-head flex lg:hidden"><button type="button" onClick={() => navigate('/')}><ArrowLeft size={17}/>Back home</button><NaitrustLogo size="sm" showText /></div>
          {complete ? (
            <div className="grid min-h-[28rem] place-items-center text-center">
              <div>
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600"><CheckCircle2 size={32} /></div>
                <h2 className="mt-6 text-2xl font-bold">Your place is saved.</h2>
                <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-muted-foreground">We’ll keep you updated and let you know when your Naitrust early access is ready.</p>
                <Button className="mt-7 rounded-md" onClick={() => navigate('/')}>Back to Naitrust <ArrowRight size={16} /></Button>
              </div>
            </div>
          ) : (
            <form onSubmit={submit} className="space-y-6">
              <div>
                <div className="nt-waitlist-steps mb-6 grid grid-cols-2 gap-2" aria-label={`Step ${step} of 2`}>
                  <div className={`rounded-xl border p-3 ${step === 1 ? 'border-primary bg-primary/[.06]' : 'border-emerald-500/25 bg-emerald-500/[.05]'}`}><p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Step 1</p><p className="mt-1 text-xs font-semibold">Your details {step === 2 && <Check size={12} className="ml-1 inline text-emerald-600"/>}</p></div>
                  <div className={`rounded-xl border p-3 ${step === 2 ? 'border-primary bg-primary/[.06]' : 'bg-muted/20'}`}><p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Step 2</p><p className="mt-1 text-xs font-semibold">Your payment needs</p></div>
                </div>
                {step === 1 && <p className="text-sm font-bold uppercase tracking-[0.12em] text-primary">About you</p>}
                <h2 className="mt-2 text-2xl font-bold sm:text-3xl">{step === 1 ? 'Join the waiting list' : 'What payments would you like to protect?'}</h2>
                <p className="mt-2 text-base leading-6 text-muted-foreground">{step === 1 ? 'Secure payments for buyers and sellers, with clear terms, shared evidence and controlled release. Join early access for launch updates.' : 'Tell us how you buy, sell or provide services.'}</p>
              </div>

              {step === 1 ? (
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="grid gap-2 text-sm font-medium sm:col-span-2">Full name<Input required autoFocus autoComplete="name" placeholder="Enter your full name" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} /></label>
                  <label className="grid gap-2 text-sm font-medium">Email address<Input required type="email" inputMode="email" autoComplete="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></label>
                  <label className="grid gap-2 text-sm font-medium">Phone number<PhoneField required value={form.phone} onChange={(phone) => setForm({ ...form, phone })} /></label>
                  <label className="grid gap-2 text-sm font-medium sm:col-span-2">Business or company <span className="font-normal text-muted-foreground">Optional</span><Input autoComplete="organization" value={form.businessName} onChange={(e) => setForm({ ...form, businessName: e.target.value })} /></label>
                </div>
              ) : (
                <>
                  <label className="grid gap-2 text-sm font-semibold"><span>Who is joining the waiting list?</span><select required value={form.userTypes[0] ?? ''} onChange={(e) => setForm({ ...form, userTypes: e.target.value ? [e.target.value as WaitlistUserType] : [] })} className="h-12 rounded-lg border border-input-border bg-input-background px-4 text-base font-normal outline-none focus:border-primary"><option value="">Select one</option>{WAITLIST_ROLE_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label>

                  <label className="grid gap-2 text-sm font-medium"><span>Typical payment value <span className="font-normal text-muted-foreground">(optional)</span></span><select value={form.range} onChange={(e) => setForm({ ...form, range: e.target.value as TransactionRange })} className="h-12 rounded-lg border border-input-border bg-input-background px-4 text-base outline-none focus:border-primary"><option value="">Select one</option>{RANGES.map((range) => <option key={range.value} value={range.value}>{range.label}</option>)}</select></label>
                  <label className="grid gap-2 text-sm font-semibold"><span>What would you use a Protected Deal for? <span className="font-normal text-muted-foreground">(optional)</span></span><Textarea value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} className="min-h-24 text-base font-normal" placeholder="Example: buying a phone, collecting a customer payment, or paying for a repair" /></label>
                  <label className="grid gap-2 text-sm font-semibold"><span>What would you suggest for Naitrust? <span className="font-normal text-muted-foreground">(optional)</span></span><Textarea value={form.suggestion} onChange={(e) => setForm({ ...form, suggestion: e.target.value })} className="min-h-24 text-base font-normal" placeholder="Share a feature, service or improvement that would help you" /></label>
                  <label className="flex items-start gap-3 rounded-xl border bg-muted/30 p-3.5 text-sm font-normal leading-5 text-muted-foreground"><input type="checkbox" checked={form.consent} onChange={(e) => setForm({ ...form, consent: e.target.checked })} className="mt-0.5 h-4 w-4 shrink-0 accent-primary" />Naitrust may contact me about early access and relevant launch updates.</label>
                </>
              )}

              <div className="sticky bottom-0 -mx-5 border-t bg-background/95 px-5 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-4 backdrop-blur sm:static sm:mx-0 sm:border-0 sm:p-0">
                {step === 1 ? (
                  <Button type="button" size="lg" onClick={continueToPreferences} className="h-11 w-full rounded-md sm:h-12">Continue <ArrowRight size={17} /></Button>
                ) : (
                  <div className="flex gap-2">
                    <Button type="button" variant="outline" onClick={() => setStep(1)} className="h-11 flex-1 rounded-md">Back</Button>
                    <Button type="submit" disabled={isSubmitting} className="h-11 flex-[1.7] rounded-md">{isSubmitting ? 'Saving…' : 'Join the waiting list'} <ArrowRight size={17} /></Button>
                  </div>
                )}
                <p className="mt-2 text-center text-xs text-muted-foreground">No spam. Only early-access updates.</p>
              </div>
            </form>
          )}
        </div></section>
      </main>
    </div>
  );
}
