import React, { useState, useMemo } from 'react';
import { HelpCircle, ChevronDown, ChevronUp, Search, Shield, CreditCard, Users, MessageCircle, Settings, Globe, ChevronLeft, ChevronRight } from 'lucide-react';
import { SEOHead } from '../utility/SEOHead';

interface FAQsPageProps {
  onNavigate: (page: string) => void;
  userType?: 'customer' | 'business' | 'admin' | 'business-member' | null;
  userId?: string | null;
}

const ITEMS_PER_PAGE = 8;

export const FAQsPage: React.FC<FAQsPageProps> = ({ onNavigate, userType, userId }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);

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
      answer: 'Naitrust is trust infrastructure for Nigerian real estate transactions. It helps property buyers, sellers, agents, developers, and companies create a shared safe-deal room for participants, terms, payments, property documents, milestones, evidence, and issues. Naitrust does not list or sell properties.'
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
      question: 'What is an NT ID and how do I use it?',
      answer: 'Your NT ID is a unique Naitrust identifier assigned at registration. Property businesses and professionals can share it so participants can confirm they are dealing with the intended profile before starting a property transaction.'
    },
    {
      id: 'gs-5',
      category: 'getting-started',
      question: 'Who is eligible to use Naitrust?',
      answer: 'Naitrust is being built first for Nigerian property buyers, sellers, agents, developers, real estate companies, and professional transaction representatives. Users must be able to enter transactions and may need stronger verification for higher-risk activity.'
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
      answer: 'Public package details are not shown while the launch offer is being finalised. The core product is property transaction coordination: participant verification, documented terms, partner-led payment status, supporting evidence, confirmation, and issues.'
    },
    {
      id: 'p-2',
      category: 'payments',
      question: 'Does Naitrust hold customer funds?',
      answer: 'No. Naitrust coordinates the workflow and shows payment status. When protected funding is used, money is handled by regulated payment or banking partners through partner-issued virtual accounts.'
    },
    {
      id: 'p-3',
      category: 'payments',
      question: 'What is a partner-issued virtual account?',
      answer: 'It is an account issued by a regulated partner for a specific transaction. The buyer funds it for that deal, and both parties can track funding status and release conditions from the transaction room.'
    },
    {
      id: 'p-4',
      category: 'payments',
      question: 'Does Naitrust handle payments between customers and businesses?',
      answer: 'Naitrust coordinates protected transaction workflows and payment status, but it does not present itself as a bank or wallet. Regulated partners handle payment or banking activity where protected funding is used.'
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
      answer: 'Use the "Report" button on any business profile, visit the Report a Concern page from the menu, or email contact@naitrust.com. Include as much detail as possible: the business\'s NT ID, screenshots, and a description of the issue. All reports are reviewed internally by the Naitrust team, typically within 24-48 hours.'
    },

    {
      id: 'f-1',
      category: 'features',
      question: 'What is the shareable profile link?',
      answer: 'A shareable profile link helps property participants confirm they are dealing with the intended person or business. It can lead into a property transaction room where the property, roles, terms, payments, documents, milestones, and evidence are tracked.'
    },
    {
      id: 'f-2',
      category: 'features',
      question: 'How do reviews and ratings work?',
      answer: 'Reputation should come from real transaction activity and honest feedback. Fake or incentivised reviews are prohibited, and Naitrust may investigate review patterns that look manipulated.'
    },
    {
      id: 'f-3',
      category: 'features',
      question: 'Can I message businesses on Naitrust?',
      answer: 'Yes. Use messaging to clarify the property, participant roles, terms, payment plan, documents, milestones, and evidence. Important messages should stay attached to the property transaction where possible.'
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
      answer: 'Yes. Save a property business or professional profile for later review. A saved profile is a convenience feature and is not an endorsement, ownership confirmation, or guarantee.'
    },

    {
      id: 't-1',
      category: 'troubleshooting',
      question: 'Why was my payment declined?',
      answer: 'A funding attempt may fail because of insufficient funds, bank limits, blocked transfers, incorrect details, partner downtime, or transaction risk checks. Confirm the virtual account details in the transaction room and contact support with the deal reference if the issue continues.'
    },
    {
      id: 't-2',
      category: 'troubleshooting',
      question: 'I can\'t find a business by NT ID — what should I do?',
      answer: 'Make sure you\'re using the correct format (NT-XXXXXX, with the "NT-" prefix). The business may not yet be registered or verified on Naitrust, or their account may be suspended. Try searching by business name or category instead. If you believe the business should be listed, contact the business directly to confirm their NT ID or ask them to register.'
    },
    {
      id: 't-3',
      category: 'troubleshooting',
      question: 'My verification is taking longer than expected',
      answer: 'Delays usually happen when documents are incomplete, blurry, inconsistent, or require manual ownership review. Check your email and dashboard for requests from the verification team. If it has been longer than expected, contact contact@naitrust.com with your NT ID.'
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

  const totalPages = Math.ceil(filteredFAQs.length / ITEMS_PER_PAGE);
  const paginatedFAQs = filteredFAQs.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setCurrentPage(1);
    setExpandedFAQ(null);
  };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setCurrentPage(1);
    setExpandedFAQ(null);
  };

  return (
    <div className="min-h-screen bg-background relative py-12">
      <SEOHead
        title="Frequently Asked Questions"
        description="Find answers about Naitrust property transactions, participant verification, payment records, supporting evidence, issues, and account management."
        keywords="Naitrust FAQ, business verification questions, CAC verification FAQ, fraud reporting help"
        canonicalPath="/faqs"
      />
      <div className="relative z-10 max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-full mb-4">
            <HelpCircle className="w-8 h-8 text-white" />
          </div>
          <h1 className="mb-2">Frequently Asked Questions</h1>
          <p className="text-gray-600 text-lg">
            Find quick answers to common questions about Naitrust
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative max-w-2xl mx-auto">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search FAQs..."
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-lg focus:border-[#1E90FF] focus:outline-none transition-colors"
            />
          </div>
        </div>

        {/* Category Tabs */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-2 justify-center">
            {categories.map((category) => {
              const Icon = category.icon;
              const count = category.id === 'all' 
                ? faqs.length 
                : faqs.filter(faq => faq.category === category.id).length;
              
              return (
                <button
                  key={category.id}
                  onClick={() => handleCategoryChange(category.id)}
                  className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all ${
                    selectedCategory === category.id
                      ? 'bg-gradient-to-r from-[#1E90FF] to-blue-600 text-white shadow-md'
                      : 'bg-muted/30 text-muted-foreground hover:bg-muted/50 border-2'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-sm">{category.name}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    selectedCategory === category.id
                      ? 'bg-white/20'
                      : 'bg-white/20'
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* FAQ List */}
        <div className="bg-muted/30 rounded-lg shadow-lg">
          {paginatedFAQs.length === 0 ? (
            <div className="p-12 text-center">
              <HelpCircle className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p className="text-gray-600 mb-2">No FAQs found</p>
              <p className="text-sm text-gray-500">Try adjusting your search or category filter</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {paginatedFAQs.map((faq) => {
                const isExpanded = expandedFAQ === faq.id;
                
                return (
                  <div key={faq.id}>
                    <button
                      onClick={() => setExpandedFAQ(isExpanded ? null : faq.id)}
                      className="w-full px-6 py-5 flex items-start justify-between hover:bg-muted/30 transition-colors text-left"
                    >
                      <div className="flex-1 pr-4">
                        <h3 className="mb-1">{faq.question}</h3>
                        {!isExpanded && (
                          <p className="text-sm text-gray-500 line-clamp-1">
                            {faq.answer}
                          </p>
                        )}
                      </div>
                      {isExpanded ? (
                        <ChevronUp className="w-5 h-5 text-[#1E90FF] flex-shrink-0 mt-1" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0 mt-1" />
                      )}
                    </button>
                    {isExpanded && (
                      <div className="px-6 pb-5">
                        <p className="text-muted-foreground whitespace-pre-line">{faq.answer}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-6 flex items-center justify-between">
            <button
              onClick={() => { setCurrentPage(p => Math.max(1, p - 1)); setExpandedFAQ(null); }}
              disabled={currentPage === 1}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:bg-muted/30"
            >
              <ChevronLeft className="w-4 h-4" />
              <span className="text-sm">Previous</span>
            </button>

            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => { setCurrentPage(page); setExpandedFAQ(null); }}
                  className={`w-9 h-9 rounded-lg text-sm font-medium transition-all ${
                    currentPage === page
                      ? 'bg-gradient-to-r from-[#1E90FF] to-blue-600 text-white shadow-md'
                      : 'hover:bg-muted/30'
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>

            <button
              onClick={() => { setCurrentPage(p => Math.min(totalPages, p + 1)); setExpandedFAQ(null); }}
              disabled={currentPage === totalPages}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:bg-muted/30"
            >
              <span className="text-sm">Next</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Page info */}
        {totalPages > 1 && (
          <p className="text-center text-sm text-muted-foreground mt-2">
            Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1}–{Math.min(currentPage * ITEMS_PER_PAGE, filteredFAQs.length)} of {filteredFAQs.length} questions
          </p>
        )}

        {/* Still Need Help */}
        <div className="mt-12 bg-primary rounded-lg shadow-lg p-8 text-white text-center">
          <h2 className="text-2xl mb-3">Still have questions?</h2>
          <p className="text-blue-100 mb-6">
            Can't find what you're looking for? Our support team is here to help.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => onNavigate('help')}
              className="px-8 py-3 bg-white text-[#1E90FF] rounded-lg hover:bg-gray-100 transition-colors"
            >
              Visit Help Center
            </button>
            <button
              onClick={() => onNavigate('contact')}
              className="px-8 py-3 bg-white/10 backdrop-blur text-white rounded-lg hover:bg-white/20 transition-colors border-2 border-white/30"
            >
              Contact Support
            </button>
          </div>
        </div>

        {/* Quick Links */}
        <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
          <button
            onClick={() => onNavigate('privacy')}
            className="p-4 bg-muted/30 rounded-lg shadow hover:shadow-md transition-shadow text-center"
          >
            <Shield className="w-6 h-6 mx-auto mb-2 text-[#1E90FF]" />
            <p className="text-sm">Privacy Policy</p>
          </button>
          <button
            onClick={() => onNavigate('terms')}
            className="p-4 bg-muted/30 rounded-lg shadow hover:shadow-md transition-shadow text-center"
          >
            <Shield className="w-6 h-6 mx-auto mb-2 text-[#1E90FF]" />
            <p className="text-sm">Terms of Service</p>
          </button>
          <button
            onClick={() => onNavigate('verification-policy')}
            className="p-4 bg-muted/30 rounded-lg shadow hover:shadow-md transition-shadow text-center"
          >
            <Shield className="w-6 h-6 mx-auto mb-2 text-[#1E90FF]" />
            <p className="text-sm">Verification Policy</p>
          </button>
          <button
            onClick={() => onNavigate('report-fraud')}
            className="p-4 bg-muted/30 rounded-lg shadow hover:shadow-md transition-shadow text-center"
          >
            <Shield className="w-6 h-6 mx-auto mb-2 text-[#1E90FF]" />
            <p className="text-sm">Report a Concern</p>
          </button>
        </div>
      </div>
    </div>
  );
};
