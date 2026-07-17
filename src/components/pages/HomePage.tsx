import { lazy, Suspense } from 'react';
import { Shield, Search, CheckCircle2, Users, TrendingUp, Lock, Zap, Award, ArrowRight, Star, ChevronRight, BarChart3, UserCheck, FileCheck, MessageSquare, Bell, Globe, Handshake, Fingerprint, QrCode, ScanLine, Download, Share2, ShoppingBag, Smartphone, Landmark } from 'lucide-react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { motion, AnimatePresence } from 'motion/react';
import { ImageWithFallback } from '../utility/ImageWithFallback';
import { TrustHeroAnimation } from '../pieces/general/TrustHeroAnimation';
import { AnimatedHeroText } from '../pieces/general/AnimatedHeroText';
import { CACLogo, QoreIDLogo, AnchorLogo } from '../pieces/general/TrustedPartnerLogo';
import { FloatingFeedbackButton } from '../utility/FloatingFeedbackButton';
import { SEOHead } from '../utility/SEOHead';
import { VerifiedBadge } from '../pieces/general/VerifiedBadge';
import { useTheme } from '@/hooks/useTheme';
import spiralBackground from '../../assets/spiral.svg';
import { openWaitlistModal } from '../modals/WaitlistModal';


interface HomePageProps {
  onNavigate: (page: string) => void;
}

export function HomePage({ onNavigate }: HomePageProps) {
  const { isDarkMode, toggleTheme } = useTheme();
  const stats = [
    { value: 'B2B+B2C', label: 'Safe Deal Flows', icon: CheckCircle2 },
    { value: '24/7', label: 'Transaction Rooms', icon: Lock },
    { value: 'Proof', label: 'Evidence Trail', icon: Users },
    { value: '4-Step', label: 'Deal Workflow', icon: TrendingUp },
  ];

  const features = [
    {
      icon: Shield,
      title: 'Party Verification',
      description: 'Use identity, business, document, and liveness checks so buyers and sellers can proceed with clearer confidence.',
      color: 'text-blue-500',
    },
    {
      icon: Search,
      title: 'Transaction Room',
      description: 'Keep amount, roles, terms, delivery rules, funding state, evidence, and release decisions in one shared room.',
      color: 'text-green-500',
    },
    {
      icon: MessageSquare,
      title: 'Agreement Record',
      description: 'Set acceptance rules, milestones, delivery expectations, and required proof before money moves.',
      color: 'text-purple-500',
    },
    {
      icon: Award,
      title: 'Evidence Trail',
      description: 'Invoices, photos, waybills, messages, approvals, and issue reports stay attached to the deal.',
      color: 'text-orange-500',
    },
    {
      icon: UserCheck,
      title: 'Counterparty Trust',
      description: 'Review who you are dealing with, their role in the deal, verification status, and transaction history.',
      color: 'text-pink-500',
    },
    {
      icon: BarChart3,
      title: 'Funding Status',
      description: 'Track payment instructions, funding confirmation, release conditions, refund paths, and partner-led payment updates.',
      color: 'text-indigo-500',
    },
    {
      icon: Fingerprint,
      title: 'Reputation Layer',
      description: 'Completed safe deals become proof that honest businesses can carry into future transactions.',
      color: 'text-teal-500',
    },
    {
      icon: QrCode,
      title: 'Shareable Deal Access',
      description: 'Give counterparties a clear link or scan path to review terms, evidence requirements, and deal status.',
      color: 'text-cyan-500',
    },
  ];

  const howItWorks = [
    {
      step: '1',
      title: 'Create Safe Deal',
      description: 'Invite the buyer, supplier, contractor, or client into one transaction room with amount, roles, timeline, and terms.',
      icon: Search,
    },
    {
      step: '2',
      title: 'Verify Both Sides',
      description: 'Confirm identity, business details, liveness, and documents based on the risk and value of the transaction.',
      icon: Shield,
    },
    {
      step: '3',
      title: 'Protect Payment',
      description: 'Route funding, confirmations, release, and refund instructions through regulated financial partners.',
      icon: MessageSquare,
    },
    {
      step: '4',
      title: 'Complete with Proof',
      description: 'Track invoices, delivery photos, waybills, approvals, issues, release decisions, and reputation from one record.',
      icon: CheckCircle2,
    },
  ];

  const valueProps = [
    {
      title: 'For Buyers',
      icon: '🛡️',
      text: 'Create safe B2C or B2B deals, confirm terms, review evidence, track funding status, and know what to do if something goes wrong.',
    },
    {
      title: 'For Sellers',
      icon: '✅',
      text: 'Show seriousness, agree terms upfront, submit proof, respond to issues, and build transaction reputation with completed safe deals.',
    },
    {
      title: 'For Partners',
      icon: '🤖',
      text: 'Plug verification, banking, payment, intelligence, logistics, and marketplace services into safer commerce workflows.',
    },
  ];

  const categories = [
    { name: 'Supplier Orders', icon: '📦' },
    { name: 'Electronics Deals', icon: '📱' },
    { name: 'Service Projects', icon: '💼' },
    { name: 'Event Vendors', icon: '🎪' },
    { name: 'Home Delivery', icon: '🛋️' },
    { name: 'Vehicle Payments', icon: '🚗' },
    { name: 'Property Deposits', icon: '🏠' },
    { name: 'Contractor Work', icon: '🧾' },
  ];

  const faqs = [
    {
      question: 'What is a safe deal?',
      answer: 'A safe deal is a shared transaction room where both sides can see the amount, roles, terms, payment status, evidence requirements, activity, release conditions, and dispute steps.',
    },
    {
      question: 'Does Naitrust hold customer funds?',
      answer: 'Naitrust manages the transaction workflow and record. Funding and payment movement are designed to run through regulated financial partners.',
    },
    {
      question: 'What happens if there is a problem?',
      answer: 'The transaction room keeps terms, proof uploads, activity, and issue reports together so both sides can review what happened and follow the dispute path.',
    },
    {
      question: 'Who is Naitrust for?',
      answer: 'Naitrust is built for Nigerian SMEs, suppliers, contractors, vendors, service providers, buyers, and high-value B2C transactions where blind transfers are too risky.',
    },
  ];

  return (
    <div className="min-h-screen relative">
      <SEOHead
        title="Safe High-Value Transaction Platform"
        description="Create safe deals, agree terms, protect payments through regulated partners, keep evidence in one transaction room, and handle release or disputes clearly."
        keywords="safe transactions, protected payments, transaction room, evidence trail, B2B deals, B2C safe deals, dispute evidence, trust platform"
        canonicalPath="/"
      />
      
      {/* Floating Feedback Button */}
      <FloatingFeedbackButton onNavigate={onNavigate} />
      
      {/* Hero Section - Emotional Trust-First Marketing */}
      <section
        className="relative pt-4 pb-8 sm:pb-12 overflow-hidden"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='1200' height='800' viewBox='0 0 1200 800' xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3Cpattern id='nigeria-verification' x='0' y='0' width='300' height='300' patternUnits='userSpaceOnUse'%3E%3Cpath d='M50 50 L100 100 L150 50 L200 100' stroke='%231e90ff' stroke-width='2' stroke-opacity='0.04' fill='none'/%3E%3Cpath d='M100 150 L150 200 L200 150 L250 200' stroke='%230b2b45' stroke-width='2' stroke-opacity='0.04' fill='none'/%3E%3Ccircle cx='150' cy='150' r='30' fill='%231e90ff' fill-opacity='0.03'/%3E%3Cpath d='M120 120 L150 150 L180 120' stroke='%231e90ff' stroke-width='3' stroke-opacity='0.05' fill='none'/%3E%3Cpath d='M50 200 L100 250 L150 200 L200 250' stroke='%231e90ff' stroke-width='2' stroke-opacity='0.04' fill='none'/%3E%3Cpath d='M100 50 L150 100 L200 50 L250 100' stroke='%230b2b45' stroke-width='2' stroke-opacity='0.04' fill='none'/%3E%3Cpath d='M150 50 L200 100 L250 50 L300 100' stroke='%231e90ff' stroke-width='2' stroke-opacity='0.04' fill='none'/%3E%3Cpath d='M50 100 L100 150 L150 100 L200 150' stroke='%230b2b45' stroke-width='2' stroke-opacity='0.04' fill='none'/%3E%3C/pattern%3E%3C/defs%3E%3Crect width='100%25' height='100%25' fill='url(%23nigeria-verification)'/%3E%3Cpath d='M200 200 L250 250 L300 200' stroke='%231e90ff' stroke-width='3' stroke-opacity='0.06' fill='none'/%3E%3Cpath d='M400 300 L450 350 L500 300' stroke='%231e90ff' stroke-width='3' stroke-opacity='0.06' fill='none'/%3E%3Cpath d='M600 200 L650 250 L700 200' stroke='%231e90ff' stroke-width='3' stroke-opacity='0.06' fill='none'/%3E%3Cpath d='M800 400 L850 450 L900 400' stroke='%231e90ff' stroke-width='3' stroke-opacity='0.06' fill='none'/%3E%3Cpath d='M1000 250 L1050 300 L1100 250' stroke='%231e90ff' stroke-width='3' stroke-opacity='0.06' fill='none'/%3E%3Ccircle cx='300' cy='400' r='40' fill='%231e90ff' fill-opacity='0.03'/%3E%3Ccircle cx='600' cy='500' r='40' fill='%230b2b45' fill-opacity='0.03'/%3E%3Ccircle cx='900' cy='300' r='40' fill='%231e90ff' fill-opacity='0.03'/%3E%3C/svg%3E")`,
          backgroundSize: '800px 800px',
          backgroundPosition: 'center',
          backgroundRepeat: 'repeat',
          opacity: 1
        }}
      >
        
        <div className="max-w-5xl mx-auto relative z-10 py-8 sm:py-8">
          {/* Hero Content - Centered */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-4xl mx-auto"
          >
            <Badge className="bg-primary/10 dark:bg-[#1a1a1a] text-primary dark:text-white text-sm font-semibold px-4 py-1.5 mb-6 inline-block">A safer way to pay, receive, and deliver in Nigeria</Badge>
            
            {/* Animated Hero Text */}
            <div className="px-4 sm:px-6 lg:px-8">
              <AnimatedHeroText />
            </div>
              
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8 mt-14 px-4 sm:px-6 lg:px-8">
              {/* <Button size="lg" onClick={() => onNavigate('register')} className="group bg-primary text-white px-8 py-6 text-lg font-semibold rounded-full shadow-[0_10px_25px_rgba(37,99,235,0.3)] hover:shadow-[0_15px_35px_rgba(37,99,235,0.4)] transition-all hover:-translate-y-0.5">
                Start a Safer Deal
              </Button> */}
              <Button size="lg" onClick={openWaitlistModal} className="group bg-primary text-white px-8 py-6 text-lg font-semibold rounded-full shadow-[0_10px_25px_rgba(37,99,235,0.3)] hover:shadow-[0_15px_35px_rgba(37,99,235,0.4)] transition-all hover:-translate-y-0.5">
                Join the waiting list
                <ArrowRight size={24} className="ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button size="lg" variant="outline" onClick={() => onNavigate('how-it-works')} className="px-8 py-6 text-lg font-semibold rounded-full">
                See How It Works
              </Button>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="my-10 px-4 sm:px-6 lg:px-8"
            >
              <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-6 text-xs sm:text-sm font-medium">
                <div className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-primary/5 dark:bg-transparent border border-[#eef3f8] dark:border-[#0A0E1A]">
                  <Lock size={16} className="text-green-600" />
                  <span className=" ">Bank-level security</span>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-primary/5 dark:bg-transparent border border-[#eef3f8] dark:border-[#0A0E1A]">
                  <CheckCircle2 size={16} className="text-blue-600" />
                  <span className="">Identity verified</span>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-primary/5 dark:bg-transparent border border-[#eef3f8] dark:border-[#0A0E1A]">
                  <Shield size={16} className="text-purple-600" />
                  <span className="">Protected funding</span>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-primary/5 dark:bg-transparent border border-[#eef3f8] dark:border-[#0A0E1A]">
                  <Award size={16} className="text-amber-600" />
                  <span className="">Built for Nigeria</span>
                </div>
              </div>
            </motion.div>

            <div className="flex items-center justify-center gap-4 sm:gap-8 text-sm flex-wrap">
              <div className="flex items-center gap-2">
                <CheckCircle2 size={20} className="text-green-600 dark:text-green-400" />
                <span className="font-medium">B2B and B2C safe deals</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 size={20} className="text-green-600 dark:text-green-400" />
                <span className="font-medium">Reusable verification</span>
              </div>
            </div>
          </motion.div>
          
        </div>
      </section>


      {/* Hero Section - Emotional Trust-First Marketing */}
      <section className="relative px-4 sm:px-6 lg:px-8 pb-4 pt-10 sm:pt-5 overflow-hidden">
      
          {/* Platform-Focused Trust Blocks */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="mt-4"
          >
            <div className="text-center mb-8 pt-8">
              <Badge className="mb-4 bg-primary text-white">Commerce Rails</Badge>
              <h2 className="text-3xl sm:text-4xl mb-4 naitrust-satoshi-bold">
                Built for Nigerian Deals With Global Ambition
              </h2>
              <p className="text-base text-muted-foreground max-w-3xl mx-auto">
                Naitrust fits around the places serious transactions already begin, then adds the structure needed for verification, payment confidence, delivery proof, and release decisions.
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 xl:grid-cols-5 gap-4 mx-auto max-w-7xl py-4">
              {[
                { 
                  platform: 'Chat-led orders',
                  iconComponent: Smartphone,
                  description: 'Move WhatsApp-style negotiations into a deal room with accepted terms and proof.',
                  gradient: 'from-green-500 to-emerald-700'
                },
                { 
                  platform: 'Social storefronts',
                  iconComponent: ShoppingBag,
                  description: 'Give Instagram and Facebook sellers a more serious way to close high-value orders.',
                  gradient: 'from-pink-500 to-purple-600'
                }, 
                { 
                  platform: 'Supplier deals',
                  iconComponent: Handshake,
                  description: 'Structure referrals, bulk orders, procurement, contractor work, and vendor sourcing.',
                  gradient: 'from-amber-500 to-orange-700'
                },
                { 
                  platform: 'Bank transfers',
                  iconComponent: Landmark,
                  description: 'Keep transfer status, payment instructions, release rules, and refund paths visible.',
                  gradient: 'from-blue-600 to-cyan-700'
                },
                { 
                  platform: 'Cross-border trade',
                  iconComponent: Globe,
                  description: 'Support Nigerian suppliers, diaspora buyers, and international customers with clearer records.',
                  gradient: 'from-indigo-500 to-violet-700'
                },
              ].map((platform, index) => (
                <motion.div
                  key={platform.platform}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1 * index }}
                  whileHover={{ y: -4 }}
                >
                  <Card className="relative overflow-hidden rounded-lg p-5 min-h-[172px] h-full border-2 bg-card hover:shadow-xl transition-all hover:border-primary/50">
                    <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${platform.gradient}`} />
                    <div className="flex items-start gap-3 mb-4">
                      <div className={`w-11 h-11 shrink-0 bg-gradient-to-br ${platform.gradient} rounded-lg flex items-center justify-center shadow-lg`}>
                        <platform.iconComponent size={24} className="text-white" />
                      </div>
                      <h3 className="text-base font-bold leading-tight pt-1">
                        {platform.platform}
                      </h3>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {platform.description}
                    </p>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
      </section>

      {/* Stats Section */}
      <section style={{display: 'none'}} className="py-16 bg-card ">
        <div className="max-w-[90rem] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="text-center"
                >
                  <div className="flex justify-center mb-3">
                    <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                      <Icon size={24} className="text-primary" />
                    </div>
                  </div>
                  <div className="text-3xl font-bold text-primary mb-1">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features Section - Enhanced with Brighter Colors */}
      <section className="py-20 bg-background dark:from-background dark:to-blue-950/20">
        <div className="max-w-360 mx-auto px-4 sm:px-6 lg:px-8">
        
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <Badge className="mb-4 bg-primary text-white">Platform Features</Badge>
            <h2 className="text-3xl sm:text-4xl naitrust-satoshi-bold mb-4">Everything You Need to Complete a Safe Deal</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Naitrust is not only a payment screen. It is the record of who is involved, what both sides agreed, what proof exists, and what happens next.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="p-6 h-full hover:shadow-xl transition-all border-2 hover:border-primary/50 bg-white dark:bg-card">
                    <div className={`w-14 h-14 bg-accent rounded-2xl flex items-center justify-center mb-4 shadow-lg`}>
                      <Icon size={28} className={`${feature.color}`} />
                    </div>
                    <h3 className="mb-3 text-lg font-bold ">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-[90rem] mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <Badge className="mb-4">Simple Process</Badge>
            <h2 className="text-3xl sm:text-4xl naitrust-satoshi-bold mb-4 ">How Naitrust Works</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Four steps to move from uncertainty to a transaction both sides can trust
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.08 }}
            className="mb-12 flex justify-center"
          >
            <TrustHeroAnimation />
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {howItWorks.map((item, index) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={item.step}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="relative"
                >
                  <Card className="p-6 h-full">
                    <div className="relative mb-6">
                      <div className="w-16 h-16 bg-accent rounded-2xl flex items-center justify-center mx-auto shadow-lg">
                        <Icon size={28} className="text-primary" />
                      </div>
                      <div className="absolute -top-2 -right-2 w-8 h-8 bg-accent rounded-full flex items-center justify-center font-bold text-primary">
                        {item.step}
                      </div>
                    </div>
                    <h3 className="text-center mb-2">{item.title}</h3>
                    <p className="text-sm text-muted-foreground text-center">{item.description}</p>
                  </Card>
                  
                  {index < howItWorks.length - 1 && (
                    <div className="hidden lg:block absolute top-1/2 -right-4 transform -translate-y-1/2">
                      <ChevronRight size={24} className="text-muted-foreground" />
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mt-12"
          >
            <Button className='rounded-full' size="lg" onClick={() => onNavigate('how-it-works')}>
              Learn More Details
              <ArrowRight size={20} className="ml-2" />
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Visual Trust Section */}
      <section className="relative overflow-hidden py-20 bg-[#031335] dark:bg-[#0A0E1A]">
        <div className="pointer-events-none absolute inset-0 mx-auto max-w-520 px-4 sm:px-6 lg:px-8 ">
          <img
            src={spiralBackground}
            alt=""
            aria-hidden="true"
            className="absolute left-4 top-1/2 bottom-0 h-[1000px] w-[1000px] max-w-none -translate-y-1/2 rotate-180 opacity-100 sm:left-6 lg:left-8"
          />
        </div>
        <div className="relative z-10 max-w-360 mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <Badge className="mb-4">For Buyers</Badge>
              <h2 className="text-3xl sm:text-4xl naitrust-satoshi-bold mb-6 text-white">
                Pay with Confidence Before Money Leaves Your Account
              </h2>
              <p className="text-lg text-white mb-6">
                Buyers can ask the right questions, verify the seller, fund through an approved partner flow, and keep proof of the agreement before release.
              </p>
              
              <div className="space-y-4 mb-8">
                {[
                  'Create a safe deal before paying',
                  'Confirm seller identity and role',
                  'Review terms, amount, and delivery timeline',
                  'Track funding and release conditions',
                  'Keep invoices, photos, and approvals attached',
                  'Raise an issue with structured evidence',
                  'Build a reusable list of trusted counterparties'
                ].map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center gap-3"
                  >
                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <CheckCircle2 size={16} className="text-white" />
                    </div>
                    <span className="text-white">{item}</span>
                  </motion.div>
                ))}
              </div>

              <Button className='rounded-full' onClick={() => onNavigate('register-customer')}>
                Create Buyer Account
                <ArrowRight size={18} className="ml-2" />
              </Button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-4">
                  <Card className="p-4">
                    <ImageWithFallback
                      src="https://images.unsplash.com/photo-1520528105264-de3db89485f8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600"
                      alt="African small shop with smiling customer"
                      className="w-full h-40 object-cover rounded-lg mb-3"
                    />
                    <div className="flex items-center gap-2 mb-2">
                      <VerifiedBadge tier="premium" variant="small" />
                      <div className="flex gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} size={12} className="fill-yellow-400 text-yellow-400" />
                        ))}
                      </div>
                    </div>
                    <p className="text-xs font-medium">Fashion Hub Lagos</p>
                    <p className="text-xs text-muted-foreground">Payment funded through partner</p>
                  </Card>
                  
                  <Card className="p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                        <Shield size={20} className="text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs font-medium">Terms Accepted</p>
                        <p className="text-xs text-muted-foreground">Delivery evidence pending</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Badge variant="outline" className="text-xs">Electronics</Badge>
                      <Badge variant="outline" className="text-xs">Lagos</Badge>
                    </div>
                  </Card>
                </div>

                <div className="space-y-4 mt-12">
                  <Card className="p-4">
                    <ImageWithFallback
                      src="https://images.unsplash.com/photo-1637328613628-bc050ce89953?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600"
                      alt="Lagos shop vendor with happy customer interaction"
                      className="w-full h-40 object-cover rounded-lg mb-3"
                    />
                    <div className="flex items-center gap-2 mb-2">
                      <VerifiedBadge tier="basic" variant="small" />
                      <div className="flex gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} size={12} className="fill-yellow-400 text-yellow-400" />
                        ))}
                      </div>
                    </div>
                    <p className="text-xs font-medium text-gray-900 dark:text-white">Beauty Essentials NG</p>
                    <p className="text-xs text-muted-foreground">Safe deal ready</p>
                  </Card>

                  <Card className="p-4 bg-primary text-white">
                    <div className="flex items-center gap-2 mb-2">
                      <Lock size={16} />
                      <span className="text-xs font-medium">Protected Transaction</span>
                    </div>
                    <p className="text-xs opacity-90">Terms, evidence, funding status, and release conditions stay attached to the deal</p>
                  </Card>
                </div>
              </div>

              <div className="absolute -bottom-4 -right-4 w-48 h-48 bg-primary/10 rounded-full blur-3xl -z-10"></div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Transaction Intelligence + Transaction Fit Section */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-360 mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid gap-6 lg:grid-cols-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <Card className="h-full border-2 bg-card p-8 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <BarChart3 size={24} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-semibold">Transaction intelligence</h3>
                    <p className="text-sm text-muted-foreground">Risk signals before release</p>
                  </div>
                </div>

                <p className="mt-6 text-base leading-7 text-muted-foreground">
                  Naitrust can guide customers through the evidence that matters: identity, liveness, business documents, terms, proof uploads, payment status, and issue reports.
                </p>

                <div className="mt-8 space-y-3">
                  {[
                    'Identity and business verification',
                    'Terms and delivery proof',
                    'Payment and funding status',
                    'Issue reports and dispute trail',
                  ].map((item, index) => (
                    <div key={item} className={`flex items-center gap-3 rounded-2xl border px-4 py-4 ${index === 0 ? 'border-primary bg-primary text-white' : 'border-border bg-background/70'}`}>
                      <div className={`flex h-9 w-9 items-center justify-center rounded-full ${index === 0 ? 'bg-white/15' : 'bg-primary/10 text-primary'}`}>
                        {index % 2 === 0 ? <Shield size={16} /> : <CheckCircle2 size={16} />}
                      </div>
                      <span className="text-sm font-medium">{item}</span>
                    </div>
                  ))}
                </div>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
            >
              <Card className="h-full border-2 bg-card p-8 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <Handshake size={24} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-semibold">Built for Nigerian B2B and B2C transactions.</h3>
                    <p className="text-sm text-muted-foreground">B2B + B2C transaction flows</p>
                  </div>
                </div>

                <div className="mt-8 space-y-4">
                  {[
                    {
                      title: 'Built for suppliers, contractors, agencies, social sellers, and high-value consumer trades.',
                      label: 'Use cases',
                    },
                    {
                      title: 'NGN 500k+ high-value deal focus',
                      label: 'Deal focus',
                    },
                    {
                      title: 'Designed for moments where blind transfers are too risky.',
                      label: 'Why it matters',
                    },
                    {
                      title: '1 record for every transaction',
                      label: 'Single record',
                    },
                    {
                      title: 'Terms, verification, evidence, payment status, approvals, and disputes stay together.',
                      label: 'Record depth',
                    },
                    {
                      title: 'Partner-led payment movement',
                      label: 'Payments',
                    },
                    {
                      title: 'Regulated financial partners handle money movement while Naitrust manages the trust workflow.',
                      label: 'How it works',
                    },
                  ].map((item) => (
                    <div key={item.title} className="rounded-2xl border border-border bg-background/70 p-4">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-primary">{item.label}</p>
                      <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.title}</p>
                    </div>
                  ))}
                </div>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* For Business Section - Enhanced */}
      <section className="py-20 bg-linear-to-br ">
        <div className="max-w-360 mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="order-2 lg:order-1"
            >
              <ImageWithFallback
                src="https://images.unsplash.com/photo-1657448721969-b42c9bd2e03a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1200"
                alt="Young Nigerian entrepreneur smiling in business setting"
                className="w-full h-[500px] object-cover rounded-2xl shadow-2xl"
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="order-1 lg:order-2"
            >
              <Badge className="mb-4 bg-primary text-white text-base px-4 py-2">For Businesses</Badge>
              <h2 className="text-3xl sm:text-4xl naitrust-satoshi-bold mb-6">
                Build Trust, Close Better Transactions
              </h2>
              <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
                Good sellers and contractors should not lose deals because the buyer is afraid. Naitrust gives them a structured way to prove who they are, agree the work, submit evidence, and earn reputation.
              </p>
              
              {/* Premium Feature Description - Analytics */}
              <div className="mb-6 p-4 flex gap-4 border bg-card rounded-xl">
                <div className="flex items-start gap-3">
                  <BarChart3 className="w-6 h-6 text-primary shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold  mb-2">Transaction Intelligence:</p>
                    <p className="text-sm text-muted-foreground">
                      See which deals need action, which evidence is pending, which payments are funded, and which issues need a response before release.
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Additional Business Features */}
              <div className="mb-6 p-4 flex gap-4 border bg-card rounded-xl">
                <p className="text-sm  mb-3">
                  <strong className="">Perfect for small, medium, and digital businesses </strong> 
                  <span className="text-muted-foreground">
                    that sell through referrals, social channels, marketplaces, and direct B2B relationships. Naitrust gives each transaction a clear record before money moves.
                  </span>
                </p>
              </div>
              
              <div className="grid sm:grid-cols-2 gap-4 mb-8">
                {[
                  { icon: TrendingUp, text: 'Active Deal Pipeline', color: 'text-green-600 dark:text-green-400' },
                  { icon: Users, text: 'Counterparty Trust Panel', color: 'text-blue-600 dark:text-blue-400' },
                  { icon: Shield, text: 'Reusable Verification Checks', color: 'text-primary' },
                  { icon: BarChart3, text: 'Evidence & Action Insights', color: 'text-purple-600 dark:text-purple-400' },
                  { icon: MessageSquare, text: 'Deal Activity Log', color: 'text-pink-600 dark:text-pink-400' },
                  { icon: Fingerprint, text: 'Transaction Reputation', color: 'text-teal-600 dark:text-teal-400' },
                  { icon: QrCode, text: 'Shareable Safe Deal Link', color: 'text-cyan-600 dark:text-cyan-400' },
                  { icon: Globe, text: 'Partner Payment Status', color: 'text-indigo-600 dark:text-indigo-400' }
                ].map((item, index) => {
                  const Icon = item.icon;
                  return (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center gap-3 p-3 border bg-card rounded-xl"
                    >
                      <div className="w-12 h-12 bg-accent rounded-xl flex items-center justify-center flex-shrink-0">
                        <Icon size={24} className={item.color} />
                      </div>
                      <span className="text-sm font-medium">{item.text}</span>
                    </motion.div>
                  );
                })}
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" onClick={() => onNavigate('register-business')}>
                  Start as Seller
                  <ArrowRight size={18} className="ml-2" />
                </Button>
                <Button size="lg" variant="outline" onClick={() => onNavigate('use-cases')}>
                  Explore Use Cases
                </Button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Digital Print Highlight */}
      <section className="py-20 bg-[#031335] dark:bg-[#0A0E1A] overflow-hidden relative"
 
      >
          <div className="pointer-events-none absolute inset-0 mx-auto max-w-520 px-4 sm:px-6 lg:px-8 ">
          <img
            src={spiralBackground}
            alt=""
            aria-hidden="true"
            className="absolute right-4 top-1/2 bottom-0 h-[1000px] w-[1000px] max-w-none -translate-y-1/2 opacity-100 sm:right-6 lg:right-8"
          />
        </div>
        <div className="max-w-360 mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <Badge className="mb-4 bg-primary text-white">New Feature</Badge>
              <h2 className="text-3xl sm:text-4xl naitrust-satoshi-bold mb-6 text-white">
                Transaction Room — Your Deal Record
              </h2>
              <p className="text-lg text-white mb-6 leading-relaxed text-justify">
                Every safe deal gets a shared <strong className="text-white">transaction room</strong> — a clear record of who is involved, what was agreed, what evidence is required, and what happens next.
              </p>
              <p className="text-lg text-white mb-8 leading-relaxed text-justify">
                Buyers and sellers can use a link or QR-style access point to review terms, payment status, proof uploads, activity, release conditions, and issue reports.
              </p>

              <div className="grid sm:grid-cols-2 gap-4 mb-8">
                {[
                  { icon: Fingerprint, text: 'Reusable identity and business checks' },
                  { icon: QrCode, text: 'Shareable safe deal access' },
                  { icon: ScanLine, text: 'Review terms and evidence quickly' },
                  { icon: Shield, text: 'Linked to the transaction record' },
                  { icon: Download, text: 'Keep proof for later review' },
                  { icon: Share2, text: 'Share via link, email, or chat' },
                ].map((item, index) => {
                  const Icon = item.icon;
                  return (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.08 }}
                      className="flex items-center gap-3 p-3 dark:bg-card/80 rounded-xl border border-white/20 transition-colors"
                    >
                      <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Icon size={20} className="text-primary" />
                      </div>
                      <span className="text-sm font-medium text-white">{item.text}</span>
                    </motion.div>
                  );
                })}
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" onClick={() => onNavigate('register-business')}>
                  Create Transaction Room
                  <ArrowRight size={18} className="ml-2" />
                </Button>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative"
            >
              <Card className="p-8 max-w-md mx-auto bg-white dark:bg-card border-2 shadow-2xl">
                <div className="text-center mb-6">
                  <div className="w-20 h-20 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Fingerprint size={40} className="text-primary" />
                  </div>
                  <h3 className="text-xl font-bold">Transaction Room</h3>
                  <p className="text-sm text-muted-foreground">Safe Deal Record</p>
                </div>

                <div className="space-y-4 mb-6">
                  <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                    <Shield size={18} className="text-green-600 shrink-0" />
                    <div>
                      <p className="text-sm font-medium">Party Verified</p>
                      <p className="text-xs text-muted-foreground">Buyer and seller checks complete</p>
                    </div>
                    <Badge variant="outline" className="ml-auto text-xs text-green-600 border-green-200">Done</Badge>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                    <Star size={18} className="text-yellow-500 shrink-0" />
                    <div>
                      <p className="text-sm font-medium">Risk Readiness</p>
                      <p className="text-xs text-muted-foreground">Based on terms and evidence</p>
                    </div>
                    <span className="ml-auto font-bold text-sm">4.8/5</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                    <Globe size={18} className="text-blue-500 shrink-0" />
                    <div>
                      <p className="text-sm font-medium">Proof Items</p>
                      <p className="text-xs text-muted-foreground">4 required before release</p>
                    </div>
                  </div>
                </div>

                <div className="border-t pt-6 text-center">
                  <div className="w-32 h-32 mx-auto bg-muted rounded-xl flex items-center justify-center mb-3">
                    <QrCode size={64} className="text-muted-foreground/60" />
                  </div>
                  <p className="text-xs text-muted-foreground">Scan to verify this business</p>
                </div>
              </Card>

              <div className="absolute -bottom-4 -left-4 w-48 h-48 bg-primary/10 rounded-full blur-3xl -z-10"></div>
              <div className="absolute -top-4 -right-4 w-32 h-32 bg-primary/5 rounded-full blur-3xl -z-10"></div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-20">
        <div className="max-w-[90rem] mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <Badge className="mb-4">Use Cases</Badge>
            <h2 className="text-3xl sm:text-4xl naitrust-satoshi-bold mb-4 ">Safe Deals Across Nigerian Commerce</h2>
            <p className="text-lg text-muted-foreground">
              Start with the transaction types where blind transfers are too risky
            </p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {categories.map((category, index) => (
              <motion.div
                key={category.name}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="p-6 text-center hover:shadow-lg transition-all cursor-pointer hover:scale-105">
                  <div className="text-4xl mb-3">{category.icon}</div>
                  <h4 className="mb-1">{category.name}</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Create safe deal</p>
                </Card>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mt-8"
          >
            <Button variant="outline" onClick={() => onNavigate('search')}>
              Explore Safe Deal Flows
              <ChevronRight size={18} className="ml-2" />
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Testimonials - Horizontal Carousel */}
      <section className="py-20 bg-card">
        <div className="max-w-[90rem] mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <Badge className="mb-4">Why Naitrust</Badge>
            <h2 className="text-3xl sm:text-4xl naitrust-satoshi-bold mb-4">Built for Trust in Nigerian Commerce</h2>
            <p className="text-lg text-muted-foreground">
              Whether you're buying or selling, Naitrust gives you the tools to transact with confidence
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {valueProps.map((prop, index) => (
              <motion.div
                key={prop.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="p-8 h-full bg-card/80 backdrop-blur-sm border-2 hover:border-primary/30 transition-colors text-center">
                  <div className="text-5xl mb-5">{prop.icon}</div>
                  <h3 className="text-xl font-semibold mb-3">{prop.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {prop.text}
                  </p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Partners Section */}
      <section className="py-16">
        <div className="max-w-360 mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <Badge className="mb-4">Trusted Partners</Badge>
            <h2 className="text-2xl sm:text-3xl naitrust-satoshi-bold mb-4 text-gray-900 dark:text-white">Powered by Industry Leaders</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Naitrust handles the trust workflow while regulated and trusted services support verification, payment, and intelligence around the deal
            </p>
          </motion.div>

          <div className="flex flex-wrap gap-4 justify-center mx-auto overflow-x-auto py-4">
            {/* <motion.a
              href="https://www.cac.gov.ng/"
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ scale: 1.05 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 * 1 }}
              className="flex-shrink-0"
              style={{ minWidth: '190px', maxWidth: '80px' }}
            >
              <Card className="p-4 h-full flex justify-center items-center hover:shadow-xl transition-all hoverborder-2 hover:border-primary/50 dark:from-card dark:to-gray-900/50">
                <CACLogo className="w-16 h-16"/>
                <p className="font-semibold text-sm text-center">CAC Nigeria</p>
                <p className="text-xs text-gray-600 dark:text-gray-400 text-center">Official Registry</p>
              </Card>
            </motion.a> */}

            <motion.a
              href="https://qoreid.com"
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ scale: 1.05 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 * 1 }}
              className="flex-shrink-0"
              style={{ minWidth: '190px', maxWidth: '80px' }}
            >
              <Card className="p-4 h-full flex justify-center items-center hover:shadow-xl transition-all hoverborder-2 hover:border-primary/50 dark:from-card dark:to-gray-900/50">
                <QoreIDLogo className="w-16 h-16 bg-[#141414] rounded-full p-2" />
                <p className="font-semibold text-sm group-hover:text-primary transition-colors">QoreID</p>
                <p className="text-xs text-gray-600 dark:text-gray-400 text-center">Identity and business checks</p>
              </Card>
            </motion.a>

            <motion.a
              href="https://getanchor.co"
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ scale: 1.05 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 * 1 }}
              className="flex-shrink-0"
              style={{ minWidth: '190px', maxWidth: '80px' }}
            >
              <Card className="p-4 h-full flex justify-center items-center hover:shadow-xl transition-all hoverborder-2 hover:border-primary/50 dark:from-card dark:to-gray-900/50">
                <AnchorLogo className="w-16 h-16 object-contain rounded-full" />
                <p className="font-semibold text-sm group-hover:text-primary transition-colors">Anchor</p>
                <p className="text-xs text-gray-600 dark:text-gray-400 text-center">Payment infrastructure</p>
              </Card>
            </motion.a>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <Badge className="mb-4">FAQ</Badge>
            <h2 className="text-3xl sm:text-4xl naitrust-satoshi-bold mb-4 text-gray-900 dark:text-white">Frequently Asked Questions</h2>
            <p className="text-lg text-muted-foreground">
              Everything you need to know about Naitrust
            </p>
          </motion.div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="p-6">
                  <h4 className="mb-2">{faq.question}</h4>
                  <p className="text-sm text-muted-foreground">{faq.answer}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA - Enhanced with Slogan */}
      <section className={`py-14 sm:py-20 ${isDarkMode ? "bg-card-foreground" : "bg-[#eef3f8]"} text-[#0b2b45] relative overflow-hidden`}>

        <div className="max-w-3xl lg:max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            {/* Slogan - Prominent */}
            <div className="mb-7 sm:mb-8 p-4 lg:p-4 xl:p-6 bg-white/75 backdrop-blur-sm rounded-full border-2 border-primary/20 shadow-[0_18px_50px_rgba(11,43,69,0.08)]">
              <p className="text-lg md:text-2xl lg:text-3xl font-bold leading-tight text-[#0b2b45] text-balance">
                "Secure every deal before money moves."
              </p>
            </div>

            <h2 className="text-lg md:text-2xl lg:text-3xl font-bold mb-3 sm:mb-4 leading-tight text-[#0b2b45] text-balance">
              Ready to Move Your Next <br/> Deal With More Confidence?
            </h2>
            <p className="text-base lg:text-xl leading-7 mb-7 sm:mb-8 text-[#496274] text-pretty">
              Invite the other party, agree the terms, verify the basics, and keep payment status and delivery proof in one trusted record.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
              <Button
                size="lg"
                variant="secondary"
                onClick={() => onNavigate('register-customer')}
                className="w-full sm:w-auto bg-primary text-white hover:bg-primary/90 px-8 py-5 sm:py-6 text-base sm:text-lg font-semibold shadow-[0_14px_32px_rgba(30,144,255,0.24)]"
              >
                Start a Safe Deal
                <ArrowRight size={22} className="ml-2" />
              </Button>
              <Button
                size="lg"
                onClick={() => window.open('/register-business', '_blank', 'noopener,noreferrer')}
                className="w-full sm:w-auto border border-primary/40 bg-white hover:bg-primary/10 hover:text-primary px-8 py-5 sm:py-6 text-base sm:text-lg font-semibold text-[#0b2b45]"
              >
                Join as a Verified Seller
              </Button>
            </div>

            {/* Feedback Link */}
            <div className="mt-9 sm:mt-12 pt-7 sm:pt-8 border-t border-primary/20">
              <p className="text-sm sm:text-base text-[#496274] mb-3 sm:mb-4">
                Have feedback or suggestions?
              </p>
              <Button
                variant="ghost"
                onClick={() => onNavigate('feedback')}
                className="text-primary hover:bg-primary/10 hover:text-primary"
              >
                Share Your Feedback
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
