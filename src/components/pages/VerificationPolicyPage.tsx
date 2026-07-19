import { AlertTriangle, ArrowRight, Building2, FileCheck2, ScanFace, ShieldCheck, UserCheck } from 'lucide-react';
import { openWaitlistModal } from '../modals/WaitlistModal';
import { SEOHead } from '../utility/SEOHead';

interface VerificationPolicyPageProps {
  onNavigate: (page: string) => void;
}

const verificationTypes = [
  { icon: UserCheck, title: 'Individual verification', text: 'Identity information and supporting documents may be checked to help confirm that a person is who they claim to be.' },
  { icon: Building2, title: 'Business verification', text: 'Business registration information and the authority of a representative may be checked before a business is marked as verified.' },
  { icon: ScanFace, title: 'Liveness checks', text: 'A short camera-based check may be used to reduce impersonation and confirm that a real person is present during verification.' },
];

export function VerificationPolicyPage({ onNavigate }: VerificationPolicyPageProps) {
  return (
    <div className="min-h-screen bg-background py-12">
      <SEOHead title="Verification Policy" description="How Naitrust intends to verify individuals and businesses for safer transactions." canonicalPath="/verification-policy" />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <header className="rounded-3xl bg-[#031335] px-6 py-12 text-center text-white sm:px-10">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10"><ShieldCheck size={28} /></div>
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-blue-300">Trust with clear limits</p>
          <h1 className="text-4xl font-bold">Verification Policy</h1>
          <p className="mx-auto mt-4 max-w-2xl leading-7 text-blue-100">A simple explanation of the checks Naitrust plans to use and what a verification result will—and will not—mean.</p>
          <p className="mt-5 text-sm text-blue-200">Effective and last updated: 12 July 2026</p>
        </header>

        <div className="mt-8 rounded-2xl border border-amber-300 bg-amber-50 p-5 text-amber-950 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-100">
          <div className="flex gap-3">
            <AlertTriangle className="mt-0.5 shrink-0" size={21} />
            <div>
              <h2 className="font-bold">Naitrust is currently accepting waiting-list registrations.</h2>
              <p className="mt-1 text-sm leading-6">Verification is not yet available to the public. The final checks, providers, fees, timing, and availability will be shown before anyone is asked to submit verification information.</p>
              <button
                type="button"
                onClick={openWaitlistModal}
                className="mt-4 inline-flex items-center gap-2 rounded-full bg-amber-950 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-amber-900 dark:bg-amber-100 dark:text-amber-950 dark:hover:bg-white"
              >
                Join the waiting list <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </div>

        <section className="py-12">
          <h2 className="text-3xl font-bold">What Naitrust intends to verify</h2>
          <p className="mt-3 max-w-3xl text-muted-foreground">The check required will depend on the account and the level of risk involved. We will request only information relevant to the check being performed.</p>
          <div className="mt-7 grid gap-5 md:grid-cols-3">
            {verificationTypes.map(({ icon: Icon, title, text }) => (
              <article key={title} className="rounded-2xl border bg-card p-6 shadow-sm"><div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary"><Icon size={22} /></div><h3 className="font-bold">{title}</h3><p className="mt-2 text-sm leading-6 text-muted-foreground">{text}</p></article>
            ))}
          </div>
        </section>

        <div className="grid gap-6 md:grid-cols-2">
          <section className="rounded-2xl border bg-card p-6"><FileCheck2 className="mb-4 text-primary" /><h2 className="text-xl font-bold">Information and consent</h2><p className="mt-3 text-sm leading-7 text-muted-foreground">Applicants must provide accurate, current, and genuine information and must have authority to submit it. Before a camera, identity, business, or third-party check begins, Naitrust will explain what is required and request any consent required by law.</p></section>
          <section className="rounded-2xl border bg-card p-6"><ShieldCheck className="mb-4 text-primary" /><h2 className="text-xl font-bold">Verification decisions</h2><p className="mt-3 text-sm leading-7 text-muted-foreground">A check may pass, fail, remain pending, or require more information. Naitrust may refuse, pause, repeat, or remove verification where information cannot be confirmed, appears misleading, or later becomes inaccurate.</p></section>
        </div>

        <section className="mt-8 rounded-2xl border border-primary/20 bg-primary/5 p-6">
          <h2 className="text-xl font-bold">What verification does not mean</h2>
          <p className="mt-3 text-sm leading-7 text-muted-foreground">Verification confirms only that specified information passed particular checks at a particular time. It is not proof of property ownership, authority to sell, title quality, planning status, legal validity, honesty, creditworthiness, payment recovery, or the outcome of a transaction. Users must still review the property, participants, documents, terms, and evidence and obtain appropriate independent professional advice.</p>
        </section>

        <section className="mt-8 rounded-2xl border bg-card p-6">
          <h2 className="text-xl font-bold">Privacy and questions</h2>
          <p className="mt-3 text-sm leading-7 text-muted-foreground">Verification information will be handled under the Naitrust Privacy Policy and applicable Nigerian data-protection law. Final retention periods and any verification-provider details will be disclosed when the service becomes available.</p>
          <div className="mt-5 flex flex-wrap gap-3"><button onClick={() => onNavigate('privacy')} className="rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-white">Read Privacy Policy</button><button onClick={() => onNavigate('contact')} className="rounded-full border-2 border-primary px-5 py-2.5 text-sm font-semibold text-primary">Contact Naitrust</button></div>
        </section>
      </div>
    </div>
  );
}
