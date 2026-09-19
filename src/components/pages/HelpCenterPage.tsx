import { protectedPaymentFAQs } from '../../content/protected-payment-faqs';
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
    { id: 'payments', name: 'Payments', icon: CreditCard, description: 'Protected funding, payment release, fees, refunds and payment status' },
    { id: 'account', name: 'Account', icon: Users, description: 'Registration, account details, profile settings, and account management' },
    { id: 'security', name: 'Security', icon: Settings, description: 'Data protection, privacy, and reporting fraud' },
    { id: 'messaging', name: 'Messaging', icon: MessageCircle, description: 'In-app chat, inbox, and communication features' },
    { id: 'general', name: 'General', icon: FileText, description: 'Platform basics, features, and how Naitrust works' },
  ];

  const faqs: Record<string, typeof protectedPaymentFAQs> = Object.fromEntries(
    categories.map(({ id }) => [id, protectedPaymentFAQs.filter((faq) => faq.helpCategory === id)]),
  );

  const filteredCategories = selectedCategory 
    ? categories.filter(cat => cat.id === selectedCategory)
    : categories;

  return (
    <div className="nt-information min-h-screen bg-linear-to-b from-muted/30 via-muted/10 to-background relative py-12">
      <SEOHead
        title="Help Center"
        description="Answers about Protected Deals, buyer and seller payments, verification, release conditions and early access to Naitrust."
        keywords="Naitrust, protected payments, buyer protection, seller payments, Deal Room"
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
