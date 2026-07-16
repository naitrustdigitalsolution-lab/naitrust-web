import React, { useState } from 'react';
import { HelpCircle, Search, Shield, CreditCard, Users, Settings, MessageCircle, FileText, ChevronDown, ChevronUp, Mail, Phone, Clock } from 'lucide-react';
import { SEOHead } from '../utility/SEOHead';

interface HelpCenterPageProps {
  onNavigate: (page: string) => void;
  userType?: 'customer' | 'business' | 'admin' | 'business-member' | null;
  userId?: string | null;
}

export const HelpCenterPage: React.FC<HelpCenterPageProps> = ({ onNavigate, userType, userId }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null);

  const categories = [
    { id: 'verification', name: 'Verification', icon: Shield, description: 'Identity, business, ownership, and risk-based verification' },
    { id: 'payments', name: 'Protected Funding', icon: CreditCard, description: 'Partner-issued virtual accounts, payment status, release, and refunds' },
    { id: 'account', name: 'Account', icon: Users, description: 'Registration, NT IDs, profile settings, and account management' },
    { id: 'security', name: 'Security', icon: Settings, description: 'Data protection, privacy, and reporting fraud' },
    { id: 'messaging', name: 'Messaging', icon: MessageCircle, description: 'In-app chat, inbox, and communication features' },
    { id: 'general', name: 'General', icon: FileText, description: 'Platform basics, features, and how Naitrust works' },
  ];

  const faqs: Record<string, Array<{ id: string; question: string; answer: string }>> = {
    verification: [
      {
        id: 'v1',
        question: 'What does Naitrust verification check?',
        answer: 'Verification can include email, phone, individual identity, facial liveness, CAC registration, owner or director identity, business address, ownership proof, and supporting documents. The exact checks depend on the risk and value of the transaction.'
      },
      {
        id: 'v2',
        question: 'How long does verification take?',
        answer: 'Some checks can complete quickly when provider data matches. Manual review may take longer if documents are unclear, ownership is hard to prove, or the deal requires stronger risk checks. You will see status updates as verification moves through review.'
      },
      {
        id: 'v3',
        question: 'What documents may be required?',
        answer: 'Depending on the transaction, Naitrust may request CAC registration details, TIN where available, government-issued ID, selfie or liveness capture, proof of address, CAC certificate, ownership documents, bank ownership evidence through a regulated partner, invoices, waybills, or other supporting files.'
      },
      {
        id: 'v4',
        question: 'Can my verification be revoked?',
        answer: 'Yes. Verification can be suspended or permanently revoked if Naitrust discovers false information, receives credible fraud reports, detects violations of the Terms of Service, or is directed by a regulatory authority. You\'ll receive written notice and may appeal within 14 days.'
      },
      {
        id: 'v5',
        question: 'How does re-verification work?',
        answer: 'Re-verification may be required when your business name, address, ownership, CAC details, directors, phone, email, or legal identity changes. It may also be required when risk signals conflict, account recovery happened recently, or a high-value deal needs fresher proof.'
      },
    ],
    payments: [
      {
        id: 'p1',
        question: 'Does Naitrust hold my money?',
        answer: 'No. Naitrust coordinates the safe deal workflow, verification, evidence, payment status, and release process. When protected funding is used, funds are handled by regulated payment or banking partners through partner-issued virtual accounts.'
      },
      {
        id: 'p2',
        question: 'What is protected funding?',
        answer: 'Protected funding is the flow where a buyer funds a partner-issued virtual account for a specific deal. Both parties can see payment status, evidence requirements, confirmation steps, and release conditions in the transaction room.'
      },
      {
        id: 'p3',
        question: 'When is payment released?',
        answer: 'Release follows the rules agreed in the safe deal. A seller may need to upload delivery evidence, the buyer may need to confirm delivery, or a dispute window may need to pass before a release instruction is sent to the regulated partner.'
      },
      {
        id: 'p4',
        question: 'What happens if there is a dispute?',
        answer: 'Either party can raise an issue from the transaction room. Naitrust keeps the agreement, messages, invoices, photos, waybills, inspection notes, and delivery proof together so the dispute can be reviewed with context.'
      },
      {
        id: 'p5',
        question: 'Is my payment information secure?',
        answer: 'Naitrust does not store full card details. Payment and banking activity for protected funding is handled by regulated partners. Platform data is protected with encryption in transit and at rest.'
      },
    ],
    account: [
      {
        id: 'a1',
        question: 'How do I create a Naitrust account?',
        answer: 'Tap "Sign Up" and choose your account type. Individuals provide basic profile details, email, and phone number. Businesses provide business details and may complete CAC, ownership, and document checks before joining higher-risk transactions.'
      },
      {
        id: 'a2',
        question: 'What is my NT ID and where do I find it?',
        answer: 'Your NT ID (format: NT-XXXXXX) is your unique Naitrust identifier, assigned at registration. Find it on your dashboard or profile page. Share it on social media so customers can easily look up your verified business. It\'s permanent and cannot be changed.'
      },
      {
        id: 'a3',
        question: 'How do I update my business information?',
        answer: 'Go to Settings → Business Profile to make updates. Minor changes can take effect immediately. Material changes such as business name, address, ownership, directors, or CAC details may require re-verification before they appear as trusted details.'
      },
      {
        id: 'a4',
        question: 'Can I have multiple accounts?',
        answer: 'No. Each individual or business entity may have only one account. Creating multiple accounts (including through aliases or bots) violates the Terms of Service and will result in suspension of all associated accounts.'
      },
      {
        id: 'a5',
        question: 'How do I delete my account?',
        answer: 'Go to Settings → Account → Delete Account. Deletion is permanent, but Naitrust may retain records required for legal, security, transaction, dispute, fraud-prevention, or financial reporting purposes. Consider deactivating temporarily if you just need a break.'
      },
    ],
    security: [
      {
        id: 's1',
        question: 'How does Naitrust protect my data?',
        answer: 'We use encryption in transit and at rest, role-based access controls, monitoring, and security reviews. We design verification and transaction data handling around Nigerian privacy requirements and only show sensitive verification evidence to authorised parties.'
      },
      {
        id: 's2',
        question: 'What should I do if my account is compromised?',
        answer: 'Change your password immediately. Contact contact@naitrust.com. Review your recent account activity. We\'ll investigate, secure your account, and reverse unauthorised changes where possible. Enable two-factor authentication from your Settings for ongoing protection.'
      },
      {
        id: 's3',
        question: 'How do I report a fraudulent business?',
        answer: 'Tap "Report" on the business profile, or visit the Report a Concern page, or email contact@naitrust.com. Include the NT ID, screenshots, and a description. All reports are reviewed internally by the Naitrust team — typically within 24-48 hours.'
      },
      {
        id: 's4',
        question: 'Does verification guarantee a business is safe to transact with?',
        answer: 'Verification confirms that a business\'s documentation has been validated (CAC registration, TIN, personal ID, etc.), but it does not guarantee quality, reliability, or eliminate all fraud risk. Always read reviews, verify details, and exercise caution. Report any concerns immediately.'
      },
    ],
    messaging: [
      {
        id: 'm1',
        question: 'How do I contact a business on Naitrust?',
        answer: 'Open the business profile or transaction room and use messaging to ask about products, confirm terms, discuss delivery, or clarify evidence before funding or release. Important messages should stay attached to the deal where possible.'
      },
      {
        id: 'm2',
        question: 'Can businesses see my personal details in chat?',
        answer: 'Businesses can only see your display name and what you choose to share in messages. Your personal ID details, payment details, and contact information are never visible to businesses.'
      },
      {
        id: 'm3',
        question: 'How do I report inappropriate messages?',
        answer: 'In the chat, tap the three-dot menu and select "Report". Describe the issue and our team will investigate. We take harassment, abuse, and scam attempts seriously. Offending accounts may be suspended or terminated.'
      },
    ],
    general: [
      {
        id: 'g1',
        question: 'What is Naitrust?',
        answer: 'Naitrust is a Nigerian safe transaction platform. We help buyers, sellers, suppliers, vendors, agents, and contractors agree terms, verify parties, protect payment through regulated partners, track evidence, confirm delivery, and handle disputes.'
      },
      {
        id: 'g2',
        question: 'How can I verify a business I found on social media?',
        answer: 'Look for the business\'s NT ID or Naitrust profile link in their social media bio. Enter the NT ID in the Naitrust search bar to review their profile and verification status. For high-value transactions, create a safe deal so terms, payment status, evidence, and confirmation are tracked.'
      },
      {
        id: 'g3',
        question: 'Does verification guarantee a successful transaction?',
        answer: 'No. Verification reduces identity and representation risk, but it does not guarantee product quality, delivery, refund, or behaviour. That is why Naitrust also uses deal terms, evidence, confirmation, and dispute records.'
      },
      {
        id: 'g4',
        question: 'How do reviews work?',
        answer: 'Customers can post reviews for businesses on the Platform. Each review includes a 1–5 star rating and written feedback. Reviews cannot be deleted by businesses but can be responded to publicly. Fake or incentivised reviews violate our policies.'
      },
      {
        id: 'g5',
        question: 'Is Naitrust available outside Nigeria?',
        answer: 'Currently, Naitrust is exclusively for Nigerian businesses registered with CAC. We verify businesses operating in Nigeria and serving Nigerian customers. International expansion may be considered in the future.'
      },
      {
        id: 'g6',
        question: 'What kinds of transactions is Naitrust for?',
        answer: 'Naitrust is for transactions where trust matters: supplier orders, contractor work, social commerce purchases, rent or agent payments, event vendors, high-value items, equipment, phones, cars, and selected customer-to-business service deals.'
      },
    ],
  };

  const filteredCategories = selectedCategory 
    ? categories.filter(cat => cat.id === selectedCategory)
    : categories;

  return (
    <div className="min-h-screen bg-linear-to-b from-muted/30 via-muted/10 to-background relative py-12">
      <SEOHead
        title="Help Center"
        description="Get help with Naitrust. Find guides on business verification, account management, fraud reporting, and payment support."
        keywords="Naitrust help, business verification help, support center, fraud reporting guide"
        canonicalPath="/help"
      />
      <div className="relative z-10 max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-full mb-4">
            <HelpCircle className="w-8 h-8 text-white" />
          </div>
          <h1 className="mb-2">Help Center</h1>
          <p className="text-gray-600 text-lg">Find answers and get the support you need</p>
        </div>

        {/* Search Bar */}
        <div className="mb-12">
          <div className="max-w-2xl mx-auto relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search for help topics..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-lg focus:border-[#1E90FF] focus:outline-none transition-colors"
            />
          </div>
        </div>

        {/* Category Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 mb-12">
          {categories.map((category) => {
            const Icon = category.icon;
            return (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(selectedCategory === category.id ? null : category.id)}
                className={`p-4 sm:p-6 bg-muted/30 rounded-lg shadow-md hover:shadow-lg transition-all text-left ${
                  selectedCategory === category.id ? 'ring-2 ring-[#1E90FF]' : ''
                }`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center flex-shrink-0">
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-base sm:text-lg">{category.name}</h3>
                </div>
                <p className="text-gray-600 text-xs sm:text-sm hidden sm:block">
                  {category.description}
                </p>
                <p className="text-gray-600 text-xs sm:text-sm mt-1">
                  {faqs[category.id]?.length || 0} articles
                </p>
              </button>
            );
          })}
        </div>

        {/* FAQs */}
        <div className="bg-muted/30 rounded-lg shadow-lg p-6 sm:p-8 mb-12">
          <h2 className="text-2xl mb-6">
            {selectedCategory 
              ? `${categories.find(c => c.id === selectedCategory)?.name} Questions`
              : 'Frequently Asked Questions'}
          </h2>
          
          {filteredCategories.map((category) => {
            const categoryFaqs = faqs[category.id] || [];
            const filtered = searchQuery
              ? categoryFaqs.filter(faq => 
                  faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
                )
              : categoryFaqs;

            if (filtered.length === 0) return null;

            return (
              <div key={category.id} className="mb-8 last:mb-0">
                {!selectedCategory && (
                  <h3 className="text-xl mb-4 flex items-center gap-2">
                    {React.createElement(category.icon, { className: 'w-5 h-5 text-[#1E90FF]' })}
                    {category.name}
                  </h3>
                )}
                
                <div className="space-y-3">
                  {filtered.map((faq) => {
                    const isExpanded = expandedFAQ === faq.id;
                    
                    return (
                      <div key={faq.id} className="border rounded-lg overflow-hidden">
                        <button
                          onClick={() => setExpandedFAQ(isExpanded ? null : faq.id)}
                          className="w-full px-4 sm:px-6 py-4 flex items-center justify-between hover:bg-muted/30 transition-colors text-left"
                        >
                          <span className="pr-4 text-sm sm:text-base">{faq.question}</span>
                          {isExpanded ? (
                            <ChevronUp className="w-5 h-5 text-[#1E90FF] flex-shrink-0" />
                          ) : (
                            <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />
                          )}
                        </button>
                        {isExpanded && (
                          <div className="px-4 sm:px-6 py-4 bg-muted/30 border-t">
                            <p className="text-muted-foreground text-sm sm:text-base">{faq.answer}</p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Contact Support */}
        <div className="bg-primary rounded-lg shadow-lg p-6 sm:p-8 text-white">
          <h2 className="text-2xl mb-4 text-center">Still need help?</h2>
          <p className="text-center mb-6 text-blue-100">
            Our support team is available to assist you with any questions or issues
          </p>
          
          <div className="grid sm:grid-cols-3 gap-4 sm:gap-6 max-w-3xl mx-auto">
            <div className="bg-white/10 backdrop-blur rounded-lg p-4 sm:p-6 text-center">
              <Mail className="w-8 h-8 mx-auto mb-3" />
              <h3 className="text-lg mb-2">Email Support</h3>
              <p className="text-sm text-blue-100 mb-3">contact@naitrust.com</p>
              <p className="text-xs text-blue-100">Response within 24 hours</p>
            </div>
            
            <div className="bg-white/10 backdrop-blur rounded-lg p-4 sm:p-6 text-center">
              <Phone className="w-8 h-8 mx-auto mb-3" />
              <h3 className="text-lg mb-2">Phone Support</h3>
              <p className="text-sm text-blue-100 mb-3">+234 707 587 3258</p>
              <p className="text-xs text-blue-100">Mon–Fri, 9AM–5PM WAT</p>
            </div>
            
            <div className="bg-white/10 backdrop-blur rounded-lg p-4 sm:p-6 text-center">
              <Clock className="w-8 h-8 mx-auto mb-3" />
              <h3 className="text-lg mb-2">Live Chat</h3>
              <p className="text-sm text-blue-100 mb-3">Available in-app</p>
              <p className="text-xs text-blue-100">Mon–Fri, 9AM–5PM WAT</p>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
            <button
              onClick={() => onNavigate('contact')}
              className="px-8 py-3 bg-white text-[#1E90FF] rounded-lg hover:bg-gray-100 transition-colors"
            >
              Contact Us
            </button>
            <button
              onClick={() => onNavigate('report-fraud')}
              className="px-8 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Report a Concern
            </button>
          </div>
        </div>

        {/* Quick Links */}
        <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4">
          <button
            onClick={() => onNavigate('privacy')}
            className="p-4 bg-muted/30 rounded-lg shadow hover:shadow-md transition-shadow text-center"
          >
            <FileText className="w-6 h-6 mx-auto mb-2 text-[#1E90FF]" />
            <p className="text-sm">Privacy Policy</p>
          </button>
          <button
            onClick={() => onNavigate('terms')}
            className="p-4 bg-muted/30 rounded-lg shadow hover:shadow-md transition-shadow text-center"
          >
            <FileText className="w-6 h-6 mx-auto mb-2 text-[#1E90FF]" />
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
            onClick={() => onNavigate('faqs')}
            className="p-4 bg-muted/30 rounded-lg shadow hover:shadow-md transition-shadow text-center"
          >
            <HelpCircle className="w-6 h-6 mx-auto mb-2 text-[#1E90FF]" />
            <p className="text-sm">FAQs</p>
          </button>
        </div>
      </div>
    </div>
  );
};
