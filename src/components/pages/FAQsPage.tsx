import React, { useState, useMemo } from 'react';
import { HelpCircle, ChevronDown, Search, Shield, CreditCard, Users, MessageCircle, Settings, Globe, ArrowRight, X } from 'lucide-react';
import { SEOHead } from '../utility/SEOHead';

interface FAQsPageProps {
  onNavigate: (page: string) => void;
  userType?: 'customer' | 'business' | 'admin' | 'business-member' | null;
  userId?: string | null;
}

export const FAQsPage: React.FC<FAQsPageProps> = ({ onNavigate }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = [
    { id: 'all', name: 'All Questions', icon: HelpCircle },
    { id: 'getting-started', name: 'Getting Started', icon: Users },
    { id: 'verification', name: 'Verification', icon: Shield },
    { id: 'payments', name: 'Protected Funding', icon: CreditCard },
    { id: 'security', name: 'Security & Privacy', icon: Settings },
    { id: 'features', name: 'Features', icon: Globe },
    { id: 'troubleshooting', name: 'Troubleshooting', icon: MessageCircle },
  ];

  const faqs = [
    {
      id: 'gs-1',
      category: 'getting-started',
      question: 'What is Naitrust and how does it work?',
      answer: 'Naitrust Market connects Nigerian individuals and businesses with verified local and Chinese suppliers. Browse products in English, request a confirmed landed-cost quote in Naira, and track the order to delivery.'
    },
    {
      id: 'gs-2',
      category: 'getting-started',
      question: 'How do I create an account?',
      answer: 'Tap "Sign Up" and select your account type. Individuals provide basic profile details, email, and phone number. Businesses provide business details and may complete CAC, ownership, identity, and document checks before joining higher-risk transactions.'
    },
    {
      id: 'gs-3',
      category: 'getting-started',
      question: 'Is Naitrust free for customers?',
      answer: 'Customers can create an account, review business profiles, and use Naitrust to understand who they are dealing with. Public package details are not shown here while the product offer is being finalised.'
    },
    {
      id: 'gs-4',
      category: 'getting-started',
      question: 'How do I find a product or supplier?',
      answer: 'Search Naitrust Market by product, supplier, category, source country, location, rating, price estimate, or minimum order quantity. Open the supplier Showcase and Trust Profile before adding products to your cart.'
    },
    {
      id: 'gs-5',
      category: 'getting-started',
      question: 'Who is eligible to use Naitrust?',
      answer: 'Naitrust is being built for Nigerian businesses and individuals: informal traders, independent contractors, suppliers, agents, developers, and registered companies. Users must be able to enter transactions and may need stronger verification for higher-risk activity.'
    },

    {
      id: 'v-1',
      category: 'verification',
      question: 'What does Naitrust verification cover?',
      answer: 'Verification may include email, phone, individual identity, facial liveness, CAC registration, owner or director identity, business address, ownership proof, and supporting documents. Naitrust asks for stronger proof when the transaction risk is higher.'
    },
    {
      id: 'v-2',
      category: 'verification',
      question: 'What documents do I need for verification?',
      answer: 'Depending on the transaction, Naitrust may request CAC registration details, TIN where available, government-issued ID, selfie or liveness capture, proof of address, CAC certificate, ownership documents, bank ownership evidence through a regulated partner, invoices, waybills, or other supporting files.'
    },
    {
      id: 'v-3',
      category: 'verification',
      question: 'How long does verification take?',
      answer: 'Some checks can complete quickly when provider data matches. Manual review may take longer if documents are unclear, ownership is hard to prove, or the deal requires stronger checks. You will receive updates as verification progresses.'
    },
    {
      id: 'v-4',
      category: 'verification',
      question: 'Can my verification be rejected or revoked?',
      answer: 'Yes. Verification can be denied if documents are incomplete, forged, or don\'t match official records, or if the business is not in good standing with CAC. Once granted, verification can be revoked if Naitrust discovers false information, receives credible fraud reports, or is directed to do so by a regulatory authority. You\'ll receive written reasons for any rejection and may appeal within 14 days.'
    },
    {
      id: 'v-5',
      category: 'verification',
      question: 'Do I need to renew my verification?',
      answer: 'Verification may need to be refreshed when it expires, when business or identity details change, when provider data conflicts, when fraud signals appear, or when a high-risk transaction requires fresh proof. Liveness may also be required after inactivity or unusual account activity.'
    },
    {
      id: 'v-6',
      category: 'verification',
      question: 'Why might Naitrust ask for fresh liveness?',
      answer: 'Identity verification can remain valid, but liveness proves the person is present right now. Naitrust may request fresh liveness after inactivity, account recovery, unusual device or location risk, high-value transactions, or dispute actions.'
    },
    {
      id: 'v-7',
      category: 'verification',
      question: 'What happens if my business information changes?',
      answer: 'You should update business changes promptly. Material changes such as legal name, address, ownership, directors, CAC details, phone, or email may require re-verification before they appear as trusted details.'
    },

    {
      id: 'p-1',
      category: 'payments',
      question: 'What does Naitrust charge for?',
      answer: 'A confirmed quote itemizes products, inspection, customs, handling, insurance and logistics where applicable. Catalogue prices are estimates until Naitrust confirms the landed cost for your quantity and Nigerian delivery address.'
    },
    {
      id: 'p-2',
      category: 'payments',
      question: 'Does Naitrust hold customer funds?',
      answer: 'No. Naitrust coordinates the workflow and shows payment status. When protected funding is used, money is handled by regulated payment or banking partners through virtual accounts issued by those partners.'
    },
    {
      id: 'p-3',
      category: 'payments',
      question: 'What is a virtual account issued by a payment partner?',
      answer: 'It is an account issued by a regulated partner for a specific transaction. The buyer funds it for that deal, and both parties can track funding status and release conditions from the deal room.'
    },
    {
      id: 'p-4',
      category: 'payments',
      question: 'Can I pay in Naira or US dollars?',
      answer: 'Yes. Quotes are shown and paid in Naira. For Chinese products, Naitrust may also display the original supplier subtotal in CNY for transparency.'
    },
    {
      id: 'p-5',
      category: 'payments',
      question: 'How are product payment and logistics handled?',
      answer: 'Supplier product funds remain protected until the agreed order stage. Buyer-paid logistics and service costs are collected separately upfront. If an order is cancelled, Naitrust refunds the unused portion and itemizes costs already committed.'
    },

    {
      id: 's-1',
      category: 'security',
      question: 'How does Naitrust protect my data?',
      answer: 'We use encryption in transit and at rest, role-based access controls, monitoring, and security reviews. We design verification and transaction data handling around Nigerian privacy requirements and only show sensitive verification evidence to authorised parties.'
    },
    {
      id: 's-2',
      category: 'security',
      question: 'What personal information do you collect?',
      answer: 'For customers: name, email, and phone number. For businesses: CAC registration number, TIN, government-issued ID details, business details, contact info, and uploaded documents. We also collect usage data (pages visited, features used) and billing records. Identity data is used solely for verification through QoreId, a NITDA-compliant provider. Full details are in our Privacy Policy.'
    },
    {
      id: 's-3',
      category: 'security',
      question: 'Can businesses see my personal information?',
      answer: 'No. Businesses can only see your display name and any information you voluntarily share in messages. Your personal ID details, payment card details, and contact information are never shared with businesses. Your personal data is protected in accordance with the NDPA 2023.'
    },
    {
      id: 's-4',
      category: 'security',
      question: 'What should I do if my account is compromised?',
      answer: 'Change your password immediately, then contact contact@naitrust.com. Review your recent account activity for anything suspicious. We\'ll investigate, secure your account, and help reverse any unauthorised changes if possible. We strongly recommend enabling two-factor authentication from your security settings.'
    },
    {
      id: 's-5',
      category: 'security',
      question: 'How do I report fraud or a suspicious business?',
      answer: 'Use the "Report" button on any business profile, visit the Report a Concern page from the menu, or email contact@naitrust.com. Include the business name or account number, screenshots, and a description of the issue. All reports are reviewed internally by the Naitrust team, typically within 24-48 hours.'
    },

    {
      id: 'f-1',
      category: 'features',
      question: 'What is the shareable profile link?',
      answer: 'A shareable profile link helps participants confirm they are dealing with the intended person or business. It can lead into a Deal Room where the roles, terms, payments, evidence, milestones, and documents are tracked.'
    },
    {
      id: 'f-2',
      category: 'features',
      question: 'How do reviews and ratings work?',
      answer: 'Only personal customers who complete a Naitrust transfer or Protected Deal with a business can rate or comment on that business. Each completed transaction can be reviewed once, and the feedback appears on the public Trust Profile. Fake or incentivised reviews are prohibited.'
    },
    {
      id: 'f-3',
      category: 'features',
      question: 'Can I message businesses on Naitrust?',
      answer: 'Yes. Use messaging to clarify participant roles, terms, payment plan, evidence, and milestones. Important messages should stay attached to the Protected Deal where possible.'
    },
    {
      id: 'f-4',
      category: 'features',
      question: 'What is AI fraud detection?',
      answer: 'AI can help surface suspicious patterns, summarise evidence, suggest risk explanations, or flag possible impersonation. AI is advisory only; final verification, dispute, and enforcement decisions require appropriate review.'
    },
    {
      id: 'f-5',
      category: 'features',
      question: 'Can I save favourite businesses?',
      answer: 'Yes. Save a business or professional profile to your Business Network for later review. A saved profile is a convenience feature and is not an endorsement, ownership confirmation, or guarantee.'
    },

    {
      id: 't-1',
      category: 'troubleshooting',
      question: 'Why was my payment declined?',
      answer: 'A funding attempt may fail because of insufficient funds, bank limits, blocked transfers, incorrect details, partner downtime, or transaction risk checks. Confirm the virtual account details in the deal room and contact support with the deal reference if the issue continues.'
    },
    {
      id: 't-2',
      category: 'troubleshooting',
      question: 'I can\'t find a business: what should I do?',
      answer: 'Check the account number, email, or phone number and try again. You can also search by business name or category. If the business should be listed, contact it directly to confirm the details registered on Naitrust.'
    },
    {
      id: 't-3',
      category: 'troubleshooting',
      question: 'My verification is taking longer than expected',
      answer: 'Delays usually happen when documents are incomplete, blurry, inconsistent, or require manual ownership review. Check your email and dashboard for requests from the verification team. If it has been longer than expected, contact contact@naitrust.com using your registered email or phone number.'
    },
    {
      id: 't-4',
      category: 'troubleshooting',
      question: 'I\'m not receiving emails from Naitrust',
      answer: 'Check your spam or junk folder first. Add contact@naitrust.com and hello@hello.naitrust.com to your contacts or safe senders list. Verify that your email address is correct in Settings. Check if you have email filters that might be redirecting our messages. If still not receiving emails, contact us with an alternative email or phone number.'
    },
    {
      id: 't-5',
      category: 'troubleshooting',
      question: 'How do I delete my account?',
      answer: 'Go to Settings → Account → Delete Account. Deletion is permanent, but Naitrust may retain records required for legal, security, transaction, dispute, fraud-prevention, or financial reporting purposes. If you want a temporary break, consider deactivating your account instead.'
    },
  ];

  const filteredFAQs = useMemo(() => {
    return faqs.filter(faq => {
      const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory;
      const matchesSearch = searchQuery === '' || 
        faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setExpandedFAQ(null);
  };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setExpandedFAQ(null);
  };

  const selectedCategoryName = categories.find((category) => category.id === selectedCategory)?.name;

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Frequently Asked Questions"
        description="Find answers about Naitrust Market, verified suppliers, landed-cost quotes, China logistics, agents, delivery, and withdrawals."
        keywords="Naitrust FAQ, business verification questions, CAC verification FAQ, fraud reporting help"
        canonicalPath="/faqs"
      />
      <section className="border-b border-border/70 bg-gradient-to-b from-primary/[0.08] to-background">
        <div className="mx-auto max-w-6xl px-4 pb-12 pt-16 sm:px-6 sm:pb-16 sm:pt-20 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-background/80 px-3 py-1.5 text-xs font-semibold text-primary shadow-sm">
              <HelpCircle className="h-3.5 w-3.5" />
              Naitrust Help
            </span>
            <h1 className="mt-5 text-3xl font-semibold tracking-tight text-foreground sm:text-5xl">How can we help?</h1>
            <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-muted-foreground sm:text-base">
              Clear answers about suppliers, quotes, orders, logistics, agents, payments, and security.
            </p>
          </div>
          <div className="relative mx-auto mt-7 max-w-2xl">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search for an answer"
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="h-14 w-full rounded-2xl border border-border bg-background pl-12 pr-12 text-base shadow-[0_12px_36px_rgba(15,23,42,0.08)] outline-none transition placeholder:text-muted-foreground/70 focus:border-primary focus:ring-4 focus:ring-primary/10"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => handleSearchChange('')}
                aria-label="Clear search"
                className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-muted-foreground transition hover:bg-muted hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
        <div className="lg:grid lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-14">
          <aside className="mb-8 lg:mb-0">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Browse topics</p>
            <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden lg:mx-0 lg:block lg:space-y-1 lg:overflow-visible lg:px-0 lg:pb-0">
            {categories.map((category) => {
              const Icon = category.icon;
              const count = category.id === 'all' 
                ? faqs.length 
                : faqs.filter(faq => faq.category === category.id).length;
              
              return (
                <button
                  key={category.id}
                  onClick={() => handleCategoryChange(category.id)}
                  className={`flex shrink-0 items-center gap-2 rounded-full px-3.5 py-2 text-sm font-medium transition lg:w-full lg:rounded-xl lg:px-3 lg:text-left ${
                    selectedCategory === category.id
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'border border-border bg-background text-muted-foreground hover:bg-muted hover:text-foreground lg:border-transparent'
                  }`}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span className="whitespace-nowrap lg:flex-1">{category.name}</span>
                  <span className={`hidden min-w-6 rounded-full px-1.5 py-0.5 text-center text-[11px] lg:inline ${selectedCategory === category.id ? 'bg-white/15' : 'bg-muted'}`}>
                    {count}
                  </span>
                </button>
              );
            })}
            </div>
          </aside>

          <div className="min-w-0">
            <div className="mb-5 flex items-end justify-between gap-4 border-b border-border pb-4">
              <div>
                <h2 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
                  {searchQuery ? 'Search results' : selectedCategoryName}
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  {filteredFAQs.length} {filteredFAQs.length === 1 ? 'answer' : 'answers'}
                  {searchQuery ? ` for “${searchQuery}”` : ''}
                </p>
              </div>
              {(searchQuery || selectedCategory !== 'all') && (
                <button type="button" onClick={() => { handleSearchChange(''); handleCategoryChange('all'); }} className="shrink-0 text-sm font-semibold text-primary hover:underline">
                  Reset
                </button>
              )}
            </div>

            {filteredFAQs.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border px-5 py-14 text-center">
              <span className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-muted text-muted-foreground"><Search className="h-5 w-5" /></span>
              <h3 className="mt-4 font-semibold text-foreground">No matching answers</h3>
              <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">Try a shorter phrase or browse another topic.</p>
              <button type="button" onClick={() => { handleSearchChange(''); handleCategoryChange('all'); }} className="mt-5 text-sm font-semibold text-primary hover:underline">View all questions</button>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {filteredFAQs.map((faq) => {
                const isExpanded = expandedFAQ === faq.id;
                
                return (
                  <div key={faq.id} className="group">
                    <button
                      onClick={() => setExpandedFAQ(isExpanded ? null : faq.id)}
                      aria-expanded={isExpanded}
                      className="flex w-full items-start justify-between gap-4 py-5 text-left sm:py-6"
                    >
                      <span className="text-[15px] font-semibold leading-6 text-foreground sm:text-base">{faq.question}</span>
                      <span className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border transition ${isExpanded ? 'border-primary bg-primary text-white' : 'border-border text-muted-foreground group-hover:border-primary/40 group-hover:text-primary'}`}>
                        <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
                      </span>
                    </button>
                    {isExpanded && (
                      <div className="max-w-3xl pb-6 pr-10 sm:pr-14">
                        <p className="whitespace-pre-line text-sm leading-7 text-muted-foreground sm:text-[15px]">{faq.answer}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
          </div>
        </div>

        <section className="mt-12 overflow-hidden rounded-3xl bg-foreground px-5 py-7 text-background sm:flex sm:items-center sm:justify-between sm:gap-8 sm:px-8 sm:py-8">
          <div>
            <h2 className="text-xl font-semibold sm:text-2xl">Still need help?</h2>
            <p className="mt-2 max-w-xl text-sm leading-6 text-background/70">Talk to support about your account, payment, or Protected Deal. Include a transaction reference when you have one.</p>
          </div>
          <button onClick={() => onNavigate('contact')} className="mt-5 inline-flex h-11 w-full items-center justify-center gap-2 rounded-full bg-primary px-5 text-sm font-semibold text-white transition hover:bg-primary/90 sm:mt-0 sm:w-auto sm:shrink-0">
            Contact support <ArrowRight className="h-4 w-4" />
          </button>
        </section>

        <nav aria-label="Helpful policies" className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-sm text-muted-foreground">
          <span className="inline-flex items-center gap-1.5 font-medium text-foreground"><Shield className="h-4 w-4 text-primary" /> Helpful policies</span>
          <button onClick={() => onNavigate('privacy')} className="hover:text-primary">Privacy</button>
          <button onClick={() => onNavigate('terms')} className="hover:text-primary">Terms</button>
          <button onClick={() => onNavigate('verification-policy')} className="hover:text-primary">Verification</button>
          <button onClick={() => onNavigate('report-fraud')} className="hover:text-primary">Report a concern</button>
        </nav>
      </main>
    </div>
  );
};
