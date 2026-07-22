import { lazy, Suspense } from 'react';
import { Shield, Search, CheckCircle2, Users, TrendingUp, Lock, Award, ArrowRight, Star, ChevronRight, BarChart3, UserCheck, MessageSquare, Globe, Handshake, Fingerprint, QrCode, ScanLine, Landmark, Home } from 'lucide-react';
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
import { useIsMobile } from '../ui/use-mobile';


interface HomePageProps {
  onNavigate: (page: string) => void;
}

export function HomePage({ onNavigate }: HomePageProps) {
  const { isDarkMode, toggleTheme } = useTheme();
  const isMobile = useIsMobile();

  const features = [
    {
      icon: Shield,
      title: 'Verified Participants',
      description: 'Use identity, business, document, and liveness checks to better understand the buyers, sellers, agents, and companies involved.',
      color: 'text-blue-500',
    },
    {
      icon: Search,
      title: 'Property Transaction Room',
      description: 'Keep the property, participants, amount, terms, payment state, milestones, and supporting evidence in one shared record.',
      color: 'text-green-500',
    },
    {
      icon: MessageSquare,
      title: 'Agreement Record',
      description: 'Document the price, payment plan, responsibilities, milestones, and confirmation rules before money moves.',
      color: 'text-purple-500',
    },
    {
      icon: Award,
      title: 'Property Document Trail',
      description: 'Receipts, offers, allocation letters, inspection photos, messages, approvals, and issue reports stay attached to the transaction.',
      color: 'text-orange-500',
    },
    {
      icon: UserCheck,
      title: 'Clear Participant Roles',
      description: 'Review who you are dealing with, their claimed role, verification status, and relevant transaction history.',
      color: 'text-pink-500',
    },
    {
      icon: BarChart3,
      title: 'Funding Status',
      description: 'Track payment instructions, confirmations, agreed conditions, refund paths, and partner-led payment updates.',
      color: 'text-indigo-500',
    },
    {
      icon: Fingerprint,
      title: 'Reputation Layer',
      description: 'Completed property transactions create a history that participants can carry into future dealings.',
      color: 'text-teal-500',
    },
    {
      icon: QrCode,
      title: 'Shareable Deal Access',
      description: 'Give property transaction participants a clear link to review terms, document requirements, and current status.',
      color: 'text-cyan-500',
    },
  ];

  const howItWorks = [
    {
      step: '1',
      title: 'Create a Property Transaction',
      description: 'Record the property and invite the buyer, seller, agent, developer, or property company.',
      icon: Search,
    },
    {
      step: '2',
      title: 'Confirm the Participants',
      description: 'Record roles and use identity, business, liveness, and document checks appropriate to the transaction.',
      icon: Shield,
    },
    {
      step: '3',
      title: 'Fund the Transaction Safely',
      description: 'Payment is held in a protected account — not released to the other party until the agreed conditions are met.',
      icon: MessageSquare,
    },
    {
      step: '4',
      title: 'Release on Confirmed Evidence',
      description: 'Funds are released only once milestones, documents, receipts, and approvals confirm the conditions were met.',
      icon: CheckCircle2,
    },
  ];

    //   {
    //   step: '3',
    //   title: 'Record Terms and Payments',
    //   description: 'Keep agreements, payment instructions, confirmations, milestones, and refund conditions visible.',
    //   icon: MessageSquare,
    // },
    // {
    //   step: '4',
    //   title: 'Complete with Evidence',
    //   description: 'Attach property documents, receipts, inspection evidence, approvals, issues, and completion confirmations.',
    //   icon: CheckCircle2,
    // },

  const faqs = [
    {
      question: 'What is a Naitrust property transaction?',
      answer: 'It is a shared safe-deal transaction room where participants can see the property, roles, amount, terms, payment records, document requirements, milestones, and issue history.',
    },
    {
      question: 'Does Naitrust hold customer funds?',
      answer: 'No. Naitrust manages the transaction workflow and record. Any funding or payment movement is designed to run through the regulated financial partner identified for that transaction.',
    },
    {
      question: 'What happens if there is a problem?',
      answer: 'The property transaction room keeps terms, supporting evidence, activity, and issue reports together so participants can review what happened and follow the available dispute path.',
    },
    {
      question: 'Who is Naitrust for?',
      answer: 'Naitrust is being built for Nigerian property buyers, sellers, agents, developers, real estate companies, and transaction representatives. It is not a property-listing marketplace.',
    },
  ];

  return (
    <div className="min-h-screen relative">
      <SEOHead
        title="Naitrust | Secure Property Transactions in Nigeria"
        description="Create secure, verifiable property transaction records for buyers, sellers, agents and developers in Nigeria."
        keywords="Nigeria property transactions, real estate transaction record, property payment evidence, property agreement records, verified property participants"
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
        
        <div className="relative z-10 mx-auto max-w-[96rem] px-4 py-8 sm:px-6 sm:py-12 lg:px-8 lg:py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-12"
          >
            <div className="min-w-0 text-center lg:text-left">
              <Badge className="mb-4 inline-block bg-primary/10 px-4 py-1.5 text-sm font-semibold text-primary dark:bg-[#1a1a1a] dark:text-white">The Trust Layer for Nigerian Property Transactions</Badge>
              <AnimatedHeroText />
              
            <div className="mt-8 flex justify-center gap-2 sm:gap-4 flex-row lg:justify-start">
              {/* <Button size="lg" onClick={() => onNavigate('register')} className="group bg-primary text-white px-8 py-6 text-lg font-semibold rounded-full shadow-[0_10px_25px_rgba(37,99,235,0.3)] hover:shadow-[0_15px_35px_rgba(37,99,235,0.4)] transition-all hover:-translate-y-0.5">
                Start a Safer Deal
              </Button> */}
              <Button size={isMobile ? 'sm' : 'lg'} onClick={openWaitlistModal} className="group bg-primary text-white px-8 py-6 text-sm sm:text-lg font-semibold rounded-full shadow-[0_10px_25px_rgba(37,99,235,0.3)] hover:shadow-[0_15px_35px_rgba(37,99,235,0.4)] transition-all hover:-translate-y-0.5">
                Get Early Access
                <ArrowRight size={24} className="ml-1 md:ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button size={isMobile ? 'sm' : 'lg'} variant="outline" onClick={() => onNavigate('how-it-works')} className="px-8 py-6 text-sm sm:text-lg font-semibold rounded-full">
                See How It Works
              </Button>
            </div>

              <div className="mt-7 flex flex-wrap justify-center gap-3 text-xs font-medium sm:text-sm lg:justify-start">
                {['Every agreement documented', 'Every payment recorded', 'Every milestone verified'].map((item) => (
                  <span key={item} className="flex items-center gap-1.5 rounded-full border border-[#e5edf5] bg-white/70 px-3 py-2 dark:border-white/10 dark:bg-white/5">
                    <CheckCircle2 size={15} className="text-green-600" />
                    {item}
                  </span>
                ))}
              </div>
            </div>

            <div className="relative mx-auto w-full max-w-2xl">
              <div className="absolute -inset-6 rounded-[2.5rem] bg-primary/10 blur-3xl" />
              <Card className="relative overflow-hidden rounded-[1.75rem] border-primary/15 bg-white/90 p-0 shadow-2xl backdrop-blur dark:bg-[#08152b]/95 lg:p-6">
                <ImageWithFallback
                  src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1200"
                  alt="Modern residential property represented in a Naitrust transaction"
                  className="h-72 w-full rounded-2xl object-cover sm:h-72"
                />
                <div className="relative -mt-12 mx-0 rounded-0 lg:rounded-2xl border bg-card p-4 shadow-xl lg:mx-2 lg:p-5">
                  <div className="mb-4 flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-primary">Property transaction</p>
                      <h2 className="mt-1 text-lg font-bold sm:text-xl">Lekki residential purchase</h2>
                      <p className="mt-1 text-sm text-muted-foreground">Buyer, seller, terms, documents, and payments in one record</p>
                    </div>
                    <VerifiedBadge tier="premium" variant="small" />
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center text-xs">
                    {['Buyer', 'Seller', 'Agreement', 'Payment', 'Documents', 'Verified'].map((item) => (
                      <div key={item} className="flex items-center justify-center gap-1 rounded-xl bg-primary/5 p-3">
                        <CheckCircle2 className="text-green-600" size={14} />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
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
              <Badge className="mb-4 bg-primary text-white">Why Naitrust Exists</Badge>
              <h2 className="text-3xl sm:text-4xl mb-4 naitrust-satoshi-bold">
                Financial Infrastructure for Property Deals
              </h2>
              <p className="text-base text-muted-foreground max-w-3xl mx-auto">
                Naitrust brings bank-grade verification and record-keeping to every property transaction — so buyers, sellers, agents, and developers can move money with confidence, not guesswork.
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 xl:grid-cols-5 gap-4 mx-auto max-w-7xl py-4">
              {[
                { 
                  platform: 'Land purchases',
                  iconComponent: Landmark,
                  description: 'Record the land, participants, agreed price, documents, payment stages, and confirmations.',
                  gradient: 'from-green-500 to-emerald-700'
                },
                { 
                  platform: 'Property deposits',
                  iconComponent: Home,
                  description: 'Keep reservation terms, deposit evidence, deadlines, and refund conditions visible.',
                  gradient: 'from-pink-500 to-purple-600'
                }, 
                { 
                  platform: 'Developer instalments',
                  iconComponent: Handshake,
                  description: 'Maintain a consistent record of instalment schedules, receipts, progress, and outstanding amounts.',
                  gradient: 'from-amber-500 to-orange-700'
                },
                { 
                  platform: 'Agent-led transactions',
                  iconComponent: Handshake,
                  description: 'Identify the agent, buyer, seller, developer, and the authority each person claims to hold.',
                  gradient: 'from-blue-600 to-cyan-700'
                },
                { 
                  platform: 'Property documentation',
                  iconComponent: Globe,
                  description: 'Keep offers, receipts, allocation letters, inspections, and supporting evidence with the transaction.',
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

            <div className="text-center mt-8">
              <Button variant="outline" onClick={() => onNavigate('use-cases')}>
                See All Use Cases
                <ChevronRight size={18} className="ml-2" />
              </Button>
            </div>
          </motion.div>
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
            <Badge className="mb-4 bg-primary text-white">Property Transaction Infrastructure</Badge>
            <h2 className="text-3xl sm:text-4xl naitrust-satoshi-bold mb-4">A Clear Record from Agreement to Completion</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Naitrust creates a structured record of who is involved, what was agreed, what payments and documents exist, and what happens next in your property transaction.
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
              Four steps to create a clearer, verifiable property transaction record
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
              <Badge className="mb-4">For Property Buyers</Badge>
              <h2 className="text-3xl sm:text-4xl naitrust-satoshi-bold mb-6 text-white">
                Keep the Property, People, Terms, and Payments in View
              </h2>
              <p className="text-lg text-white mb-6">
                Buyers can document the property and participants, review agreed terms, keep payment evidence, and retain supporting records throughout the transaction.
              </p>
              
              <div className="space-y-4 mb-8">
                {[
                  'Create a property transaction before paying',
                  'Confirm the seller, agent, or developer and their role',
                  'Record the property, amount, payment plan, and timeline',
                  'Track payment confirmations and agreed conditions',
                  'Keep receipts, property documents, inspections, and approvals attached',
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
              className="relative min-w-0"
            >
              <div className="mx-auto grid w-full max-w-xl grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-4">
                  <Card className="min-w-0 overflow-hidden p-4">
                    <ImageWithFallback
                      src="https://images.unsplash.com/photo-1520528105264-de3db89485f8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600"
                      alt="Property buyer reviewing a transaction"
                      className="mb-3 h-52 w-full rounded-lg object-cover sm:h-52"
                    />
                    {/* <div className="flex items-center gap-2 mb-2">
                      <VerifiedBadge tier="premium" variant="small" />
                      <div className="flex gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} size={12} className="fill-yellow-400 text-yellow-400" />
                        ))}
                      </div>
                    </div> */}
                    <p className="text-sm font-medium">Lagos Property Purchase</p>
                    <p className="text-xs text-muted-foreground">Deposit confirmation recorded</p>
                  </Card>
                  
                  <Card className="p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                        <Shield size={20} className="text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs font-medium">Terms Accepted</p>
                        <p className="text-xs text-muted-foreground">Property documents pending</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Badge variant="outline" className="text-xs">Property purchase</Badge>
                      <Badge variant="outline" className="text-xs">Lagos</Badge>
                    </div>
                  </Card>
                </div>

                <div className="space-y-4 sm:mt-12">
                  <Card className="min-w-0 overflow-hidden p-4">
                    <ImageWithFallback
                      src="https://images.unsplash.com/photo-1637328613628-bc050ce89953?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600"
                      alt="Property professional supporting a Nigerian transaction"
                      className="mb-3 h-52 w-full rounded-lg object-cover sm:h-52"
                    />
                    {/* <div className="flex items-center gap-2 mb-2">
                      <VerifiedBadge tier="basic" variant="small" />
                      <div className="flex gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} size={12} className="fill-yellow-400 text-yellow-400" />
                        ))}
                      </div>
                    </div> */}
                    <p className="text-sm font-medium text-gray-900 dark:text-white">Verified Property Company</p>
                    <p className="text-xs text-muted-foreground">Participant details available to review</p>
                  </Card>

                  <Card className="p-4 bg-primary text-white">
                    <div className="flex items-center gap-2 mb-2">
                      <Lock size={16} />
                      <span className="text-xs font-medium">Protected Transaction</span>
                    </div>
                    <p className="text-xs leading-relaxed opacity-90">Terms, property documents, payment status, milestones, and supporting evidence stay attached to the transaction.</p>
                  </Card>
                </div>
              </div>

              <div className="absolute -bottom-4 -right-4 w-48 h-48 bg-primary/10 rounded-full blur-3xl -z-10"></div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* For Business Section - Enhanced */}
      <section className="py-20 bg-linear-to-br ">
        <div className="max-w-360 mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-start">
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
                Build Trust, Close Better Property Deals
              </h2>
              <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
                Property companies, agents, and developers should be able to give buyers a professional and transparent transaction experience. Naitrust provides a structured way to record who is involved, what was agreed, what was paid, and which evidence exists.
              </p>
              
              <div className="grid sm:grid-cols-2 gap-4 mb-8">
                {[
                  { icon: TrendingUp, text: 'Active Deal Pipeline', color: 'text-green-600 dark:text-green-400' },
                  { icon: Users, text: 'Counterparty Trust Panel', color: 'text-blue-600 dark:text-blue-400' },
                  { icon: Shield, text: 'Reusable Verification Checks', color: 'text-primary' },
                  { icon: BarChart3, text: 'Evidence & Action Insights', color: 'text-purple-600 dark:text-purple-400' },
                  { icon: MessageSquare, text: 'Deal Activity Log', color: 'text-pink-600 dark:text-pink-400' },
                  { icon: Fingerprint, text: 'Transaction Reputation', color: 'text-teal-600 dark:text-teal-400' },
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
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <Badge className="mb-4 bg-primary text-white">New Feature</Badge>
              <h2 className="text-3xl sm:text-4xl naitrust-satoshi-bold mb-6 text-white">
                Transaction Room — Your Property Deal Record
              </h2>
              <p className="text-lg text-white mb-8 leading-relaxed text-justify">
                Every property transaction gets a shared <strong className="text-white">Naitrust safe-deal room</strong> — a clear record of the property, who is involved, what was agreed, what evidence is required, and what happens next, reviewable by buyers, sellers, agents, and property companies from one place.
              </p>

              <div className="grid sm:grid-cols-2 gap-4 mb-8">
                {[
                  { icon: Fingerprint, text: 'Every action logged to the deal' },
                  { icon: QrCode, text: 'Shareable property transaction access' },
                  { icon: ScanLine, text: 'Milestone and delivery tracking' },
                  { icon: Lock, text: 'Dispute-ready from day one' },
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
                <Button size="lg" variant="outline" onClick={() => onNavigate('how-it-works')} className="border-white/30 bg-transparent text-white hover:bg-white/10 hover:text-white">
                  See How It Works
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
                  <p className="text-sm text-muted-foreground">Property Transaction Record</p>
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
            <h2 className="text-2xl sm:text-3xl naitrust-satoshi-bold mb-4 text-gray-900 dark:text-white">Regulated Fintech Behind Every Property Transaction</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Naitrust handles the trust workflow while regulated and trusted financial services support verification, payment, and intelligence around every real estate deal
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

          <div className="text-center mt-8">
            <Button variant="outline" onClick={() => onNavigate('faqs')}>
              View All FAQs
              <ChevronRight size={18} className="ml-2" />
            </Button>
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
              <p className="text-lg md:text-xl lg:text-2xl font-bold leading-tight text-[#0b2b45] text-balance">
                "Create a clear property record before money moves."
              </p>
            </div>

            <h2 className="text-lg md:text-xl lg:text-2xl font-bold mb-3 sm:mb-4 leading-tight text-[#0b2b45] text-balance">
              Ready to Approach Your Next <br/> Property Transaction with More Confidence?
            </h2>
            <p className="text-base lg:text-lg leading-7 mb-7 sm:mb-8 text-[#496274] text-pretty">
              Record the property and participants, agree the terms, verify the basics, and keep payments, documents, milestones, and supporting evidence in one trusted record.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
              <Button
                size="lg"
                variant="secondary"
                onClick={openWaitlistModal}
                className="w-full sm:w-auto bg-primary text-white hover:bg-primary/90 px-8 py-5 sm:py-6 text-base sm:text-lg font-semibold shadow-[0_14px_32px_rgba(30,144,255,0.24)]"
              >
                Join Early Access
                <ArrowRight size={22} className="ml-2" />
              </Button>
              <Button
                size="lg"
                onClick={() => window.open('/register-business', '_blank', 'noopener,noreferrer')}
                className="w-full sm:w-auto border border-primary/40 bg-white hover:bg-primary/10 hover:text-primary px-8 py-5 sm:py-6 text-base sm:text-lg font-semibold text-[#0b2b45]"
              >
                Join as a Property Company
              </Button>
            </div>

            {/* Feedback Link */}
            <div className="mt-9 sm:mt-12 pt-7 sm:pt-8 border-t border-primary/20">
              <p className="text-sm sm:text-base text-[#496274] mb-3 sm:mb-4">
                Have feedback about property transactions in Nigeria?
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
