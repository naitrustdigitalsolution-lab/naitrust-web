import type { ReactNode } from 'react';
import { Building2, Database, FileCheck2, Landmark, Scale, ShieldCheck, Users } from 'lucide-react';
import { SEOHead } from '../utility/SEOHead';

interface CompliancePageProps {
  onNavigate: (page: string) => void;
  userType?: 'customer' | 'business' | 'admin' | 'business-member' | null;
  userId?: string | null;
}

function ComplianceSection({ icon, title, children }: { icon: ReactNode; title: string; children: ReactNode }) {
  return (
    <section className="rounded-2xl border border-border/70 bg-card p-6 shadow-sm sm:p-8">
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">{icon}</div>
        <h2 className="text-xl font-bold">{title}</h2>
      </div>
      <div className="space-y-4 text-sm leading-7 text-muted-foreground sm:text-base">{children}</div>
    </section>
  );
}

export function CompliancePage({ onNavigate }: CompliancePageProps) {
  return (
    <div className="min-h-screen bg-background py-12">
      <SEOHead
        title="Compliance and Trust"
        description="How Naitrust approaches privacy, verification, safe-deal records, regulated payment partners, security, and user protection in Nigeria."
        canonicalPath="/compliance"
      />

      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <header className="mb-10 rounded-3xl bg-[#031335] px-6 py-12 text-center text-white sm:px-10">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10"><Scale size={28} /></div>
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-blue-300">Compliance and trust</p>
          <h1 className="text-3xl font-bold sm:text-4xl">How Naitrust supports safer transactions</h1>
          <p className="mx-auto mt-4 max-w-3xl leading-7 text-blue-100">
            Naitrust brings identity and business checks, accepted terms, payment status, evidence, and issue records into one safe-deal workflow. This page explains the controls that apply to the product as it is currently designed.
          </p>
          <p className="mt-5 text-sm text-blue-200">Last updated: 11 July 2026</p>
        </header>

        <div className="grid gap-6">
          <ComplianceSection icon={<Users size={22} />} title="1. Individual and business verification">
            <p>Naitrust may verify an individual, a business, and the person representing a business before higher-risk activity proceeds.</p>
            <ul className="list-disc space-y-2 pl-5">
              <li>Individual checks may include contact verification, NIN or BVN-based identity checks where available, document checks, facial comparison, and liveness checks.</li>
              <li>Business checks may include CAC registration details, business contact information, ownership or representative information, and supporting documents.</li>
              <li>Checks may be completed through approved verification providers or reviewed by authorised Naitrust personnel when manual review is required.</li>
            </ul>
            <p>A verification result shows that specified information passed the checks performed. It is not proof of property ownership, authority to sell, title quality, legal validity, solvency, character, or future behaviour.</p>
          </ComplianceSection>

          <ComplianceSection icon={<FileCheck2 size={22} />} title="2. Property transaction records and user responsibilities">
            <p>A Naitrust property transaction record can hold the property description, participants, roles, amount, accepted terms, payment plan, milestones, payment status, property documents, uploaded evidence, approvals, and issue reports.</p>
            <p>Users remain responsible for accurate information, participant authority, independent property due diligence, genuine evidence, account security, and legal compliance. Uploading a document does not mean Naitrust has authenticated its legal effect or the ownership claims within it.</p>
          </ComplianceSection>

          <ComplianceSection icon={<Landmark size={22} />} title="3. Partner-led payments">
            <p>Naitrust is not a bank or deposit-taking institution. Where a property transaction includes funding, release, settlement, reversal, or refund activity, movement or custody of funds is performed by the regulated payment, banking, or financial partner identified for that transaction.</p>
            <p>Naitrust may display payment instructions and partner-supplied status updates inside the property transaction record. Partner terms, processing limits, compliance reviews, availability, settlement timing, and refund or reversal rules may also apply.</p>
          </ComplianceSection>

          <ComplianceSection icon={<Database size={22} />} title="4. Privacy and biometric data">
            <p>Naitrust processes personal data in accordance with its Privacy Policy and applicable Nigerian data-protection law, including the Nigeria Data Protection Act 2023.</p>
            <ul className="list-disc space-y-2 pl-5">
              <li>We aim to collect only the information needed for accounts, verification, property transaction workflows, support, security, and legal compliance.</li>
              <li>Camera access, facial images, facial-match results, and liveness signals are requested only when needed for a verification check.</li>
              <li>Information may be shared with contracted verification, infrastructure, communication, and regulated financial providers only as needed for their role.</li>
              <li>Users may request access, correction, deletion, restriction, objection, or portability where those rights apply and are not limited by a lawful retention obligation.</li>
            </ul>
          </ComplianceSection>

          <ComplianceSection icon={<ShieldCheck size={22} />} title="5. Security, fraud prevention, and records">
            <p>Naitrust uses access controls, encryption in transit, account-security controls, activity records, and review processes appropriate to the information and product feature involved.</p>
            <p>We may preserve verification results, accepted terms, payment-status events, evidence, account activity, and support or issue records for security, dispute handling, fraud prevention, service operation, and legal obligations. Retention depends on the record type, purpose, partner requirements, and applicable law.</p>
          </ComplianceSection>

          <ComplianceSection icon={<Building2 size={22} />} title="6. Product roles and transparency">
            <p>Naitrust provides property transaction-record and trust-workflow technology. Verification providers perform specified identity or business checks. Regulated financial partners handle applicable fund movement or custody. Property participants remain responsible for ownership, authority, legal advice, physical and document checks, statements, and performance.</p>
            <p>Naitrust is not a property marketplace, estate agent, title registry, law firm, surveyor, regulator, bank, insurer, credit-rating agency, or guarantee service. Material changes will be reflected in the relevant Terms, Privacy Policy, Verification Policy, or this page.</p>
          </ComplianceSection>
        </div>

        <div className="mt-8 rounded-2xl border border-primary/20 bg-primary/5 p-6 text-center">
          <h2 className="text-xl font-bold">Questions about compliance or your information?</h2>
          <p className="mt-2 text-sm text-muted-foreground">Contact Naitrust for privacy, verification, property transaction, or partner-payment questions.</p>
          <div className="mt-5 flex flex-col justify-center gap-3 sm:flex-row">
            <button onClick={() => onNavigate('contact')} className="rounded-full bg-primary px-6 py-3 text-sm font-semibold text-white transition hover:bg-primary/90">Contact Naitrust</button>
            <button onClick={() => onNavigate('privacy')} className="rounded-full border-2 border-primary bg-background px-6 py-3 text-sm font-semibold text-primary transition hover:bg-primary/5">Read the Privacy Policy</button>
          </div>
        </div>
      </div>
    </div>
  );
}
