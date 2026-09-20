import { FileText, ShieldCheck } from 'lucide-react';
import { SEOHead } from '../utility/SEOHead';

interface TermsOfServicePageProps { onNavigate: (page: string) => void }

const sections = [
  ['1. About these terms', 'These Terms govern access to the Naitrust website and protected-payment early-access list operated by Naitrust Digital Solutions Limited. Naitrust is currently preparing protected-payment workflows for buyers and sellers in Nigeria. Joining early access does not create a customer account, guarantee access, or require a purchase.'],
  ['2. Early-access information', 'You must provide accurate information that belongs to you. We may use submitted contact details to confirm your request and send relevant launch or early-access updates. You may unsubscribe or ask us to remove your early-access information.'],
  ['3. Intended Naitrust product', 'Naitrust is being developed to help buyers, sellers, businesses, freelancers, and service providers create structured Protected Deals, document terms, review verification information, track payment status and release conditions, and retain transaction documents and supporting evidence. Features may change before launch and will be governed by updated terms presented before use.'],
  ['4. Payment and verification boundaries', 'Naitrust is not a bank, deposit-taking institution, insurer, licensed escrow trustee, or guarantor of a transaction. Verification records specified checks at a point in time and does not guarantee delivery, quality, payment recovery, or future conduct. Participants remain responsible for accurate terms, genuine evidence, and checks appropriate to their transaction. When regulated payment or verification providers are involved, they will be identified and their applicable terms may also apply.'],
  ['5. Acceptable use', 'You must not misuse the website, submit false or unlawful information, impersonate another person or business, misrepresent ownership or authority, interfere with security, attempt unauthorised access, introduce malicious code, or use Naitrust in connection with fraud or illegal activity.'],
  ['6. Intellectual property', 'The Naitrust name, logo, website design, copy, and original materials belong to Naitrust or its licensors. You may use the website for personal evaluation but may not copy, resell, or exploit its materials without permission.'],
  ['7. Availability and liability', 'The website and protected-payment early-access list are provided on an as-available basis. We work to keep them accurate and secure but cannot promise uninterrupted access. To the extent permitted by law, Naitrust is not liable for purchase or service decisions or transactions made outside a launched Naitrust service, or for losses caused by information supplied by users or third parties.'],
  ['8. Privacy', 'Our Privacy Policy explains how we collect, use, share, protect, and retain personal information. It forms part of these Terms.'],
  ['9. Planned legal review', 'Both parties must read and accept the legal review agreement to appoint a named Naitrust-approved reviewer. The appointment covers the room’s agreement, existing evidence and future document uploads automatically, for the agreed purpose. The deal payer pays the displayed percentage fee; document access starts after payment. Additional uploads do not require another approval or fee. Either party may request deactivation, but access continues until both confirm, including access to the retained record after deal completion. Naitrust may restrict access for provider revocation, account suspension or an urgent access review. Deactivation cannot recall copies already obtained. Reviewers cannot release funds or decide disputes; findings do not certify authenticity. Legal review payments are unavailable until launch. Final service terms require legal review before launch.'],
  ['10. Changes and governing law', 'We may update these Terms as the product develops. Material terms for a launched service will be presented before they apply. These Terms are governed by the laws of the Federal Republic of Nigeria.'],
];

export function TermsOfServicePage({ onNavigate }: TermsOfServicePageProps) {
  return (
    <div className="nt-information min-h-screen bg-background py-12">
      <SEOHead title="Terms of Service" description="Terms governing the Naitrust website and protected-payment early-access list." canonicalPath="/terms" />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <header className="rounded-3xl bg-[#031335] px-6 py-12 text-center text-white">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10"><FileText size={27} /></div>
          <h1 className="text-4xl font-bold">Terms of Service</h1>
          <p className="mx-auto mt-4 max-w-2xl text-blue-100">Clear terms for using Naitrust and joining protected-payment early access.</p>
          <p className="mt-5 text-sm text-blue-200">Effective and last updated: 20 September 2026</p>
        </header>
        <div className="mt-8 rounded-2xl border border-primary/20 bg-primary/5 p-5">
          <div className="flex gap-3"><ShieldCheck className="mt-0.5 shrink-0 text-primary" /><p className="text-sm leading-6 text-muted-foreground"><strong className="text-foreground">Current status:</strong> Naitrust is accepting protected-payment early-access registrations. Product accounts, verification, Protected Deal workflows, and partner-led payment features are not yet publicly available.</p></div>
        </div>
        <div className="mt-8 space-y-5">{sections.map(([title, text]) => <section key={title} className="rounded-2xl border bg-card p-6"><h2 className="text-xl font-bold">{title}</h2><p className="mt-3 text-sm leading-7 text-muted-foreground">{text}</p></section>)}</div>
        <div className="mt-8 flex flex-wrap justify-center gap-3"><button onClick={() => onNavigate('privacy')} className="rounded-full bg-primary px-6 py-3 text-sm font-semibold text-white">Privacy Policy</button><button onClick={() => onNavigate('contact')} className="rounded-full border-2 border-primary px-6 py-3 text-sm font-semibold text-primary">Contact Naitrust</button></div>
      </div>
    </div>
  );
}
