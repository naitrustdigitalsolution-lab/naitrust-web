import { protectedPaymentFAQs } from '../../content/protected-payment-faqs';
import React, { useState } from 'react';
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
    { id: 'payments', name: 'Payments', icon: CreditCard },
    { id: 'security', name: 'Security & Privacy', icon: Settings },
    { id: 'features', name: 'Features', icon: Globe },
    { id: 'troubleshooting', name: 'Troubleshooting', icon: MessageCircle },
  ];

  const faqs = protectedPaymentFAQs;

  const filteredFAQs = faqs.filter(faq => {
    const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory;
    const matchesSearch = searchQuery === '' ||
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

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
        description="Answers about Protected Deals, buyer and seller payments, verification, release conditions and early access to Naitrust."
        keywords="Naitrust, protected payments, buyer protection, seller payments, Deal Room"
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
            <p className="mt-2 max-w-xl text-sm leading-6 text-background/70">Talk to support about a supplier, quote, agent, order, delivery or account. Include the order reference when you have one.</p>
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
