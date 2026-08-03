import { useEffect, useState } from 'react';
import { Shield, CheckCircle2, Users, Lock, ArrowRight, Star, ChevronRight, Globe, Handshake, Fingerprint, QrCode, ScanLine, Landmark, Send, ArrowDownToLine, Wallet as WalletIcon, MessageCircle, Building2 } from 'lucide-react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { motion } from 'motion/react';
import { ImageWithFallback } from '../utility/ImageWithFallback';
import { TrustHeroAnimation } from '../pieces/general/TrustHeroAnimation';
import { AnimatedHeroText } from '../pieces/general/AnimatedHeroText';
import { QoreIDLogo, AnchorLogo } from '../pieces/general/TrustedPartnerLogo';
import { FloatingFeedbackButton } from '../utility/FloatingFeedbackButton';
import { SEOHead } from '../utility/SEOHead';
import { VerifiedBadge } from '../pieces/general/VerifiedBadge';
import spiralBackground from '../../assets/spiral.svg';
import { openWaitlistModal } from '../modals/waitlist-events';
import marketTradersImage from '../../assets/hero/nigerian-market-traders.webp';
import handheldAppImage from '../../assets/hero/naitrust-handheld-exact-home-v4.webp';
import shopPaymentImage from "../images/hero/nigerian-shop-payment.webp";
import  qrPaymentImage from "../images/hero/nigerian-qr-payment.webp"

const saferDealsImage = '/images/blog/safer-deals.webp';
const deliveryEvidenceImage = '/images/blog/delivery-evidence.webp';
const businessVerificationImage = '/images/blog/business-verification.webp';

interface HomePageProps {
  onNavigate: (page: string) => void;
}

export function HomePage({ onNavigate }: HomePageProps) {
  const [allowAmbientMotion, setAllowAmbientMotion] = useState(false);
  const [useHeroViewportHeight, setUseHeroViewportHeight] = useState(true);

  useEffect(() => {
    const media = window.matchMedia('(min-width: 1024px) and (prefers-reduced-motion: no-preference)');
    const updateMotionPreference = () => setAllowAmbientMotion(media.matches);
    updateMotionPreference();
    media.addEventListener('change', updateMotionPreference);
    return () => media.removeEventListener('change', updateMotionPreference);
  }, []);

  useEffect(() => {
    const updateHeroHeight = () => {
      if (!window.outerWidth) return;
      const zoomRatio = window.outerWidth / window.innerWidth;
      setUseHeroViewportHeight(zoomRatio > 0.77);
    };

    updateHeroHeight();
    window.addEventListener('resize', updateHeroHeight);
    return () => window.removeEventListener('resize', updateHeroHeight);
  }, []);

  const howItWorks = [
    {
      step: '1',
      title: 'Request Payment from Any Conversation',
      description: 'Share your account through WhatsApp, a payment link or a QR code so anyone can pay you.',
      icon: ArrowDownToLine,
    },
    {
      step: '2',
      title: 'Pay Regular Suppliers',
      description: 'Send instantly to people, suppliers, and businesses you already know and trust.',
      icon: Send,
    },
    {
      step: '3',
      title: 'Protect Important Orders',
      description: 'For an important deal, record the terms and protect the payment until both sides complete what they agreed.',
      icon: Shield,
    },
    {
      step: '4',
      title: 'Build a Trusted History',
      description: 'Completed payments and Protected Deals strengthen the business record you carry into the next transaction.',
      icon: CheckCircle2,
    },
  ];

  const faqs = [
    {
      question: 'What is a Naitrust Protected Deal?',
      answer: 'It is a shared transaction room where participants can see the deal, roles, amount, terms, payment records, document requirements, milestones, and issue history.',
    },
    {
      question: 'What is the difference between Instant and Protected payments?',
      answer: 'Send Money for people and businesses you already trust — it moves like a normal transfer. Protect a Payment when you are dealing with a new supplier, contractor, agent, or large order — funds are held until the agreed conditions are met.',
    },
    {
      question: 'Does Naitrust hold customer funds?',
      answer: 'No. Naitrust manages the transaction workflow and record. Funding and payment movement run through the regulated payment partners identified for that transaction.',
    },
    {
      question: 'Who is Naitrust for?',
      answer: 'Naitrust is for people and businesses across Nigeria—from everyday customers to traders, shops, wholesalers, service providers, and online sellers.',
    },
  ];

  return (
    <div className="home-page relative min-h-screen">
      <SEOHead
        title="Payments, Verification and Protected Transactions"
        description="Naitrust is a Nigerian fintech platform for payments and Protected Transactions. Check who you are dealing with, pay, get paid, or protect P2P, customer and business trades."
        keywords="Naitrust, Nigerian fintech app, payments Nigeria, Protected Transactions Nigeria, verify business before paying, P2P payments, customer payments, business payments, B2B payments"
        canonicalPath="/"
      />
      
      {/* Floating Feedback Button */}
      <FloatingFeedbackButton onNavigate={onNavigate} />
      
      {/* Hero — a deliberately loose collage of real business moments and product UI */}
      <section className={`relative overflow-hidden bg-[#04162f] text-white ${useHeroViewportHeight ? 'xl:min-h-[94vh]' : ''}`}>
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-40 top-1/4 h-[30rem] w-[30rem] rounded-full bg-[#087ff5]/20 blur-[55px] sm:blur-[110px]" />
          <div className="absolute -right-32 -top-16 h-[35rem] w-[35rem] rounded-full bg-[#18b6a4]/15 blur-[60px] sm:blur-[130px]" />
          <div className="absolute inset-0 opacity-[0.08] [background-image:linear-gradient(rgba(255,255,255,.35)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.35)_1px,transparent_1px)] [background-size:72px_72px]" />
          <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#04162f] to-transparent" />
        </div>

        <div className={`relative z-10 mx-auto grid w-full max-w-440 grid-cols-[minmax(0,1fr)] items-center gap-14 px-4 pb-16 pt-22 sm:gap-9 sm:px-6 sm:pb-14 sm:pt-28 md:pt-30 xl:grid-cols-[minmax(0,.88fr)_minmax(0,1.12fr)] xl:gap-8 xl:px-8 ${useHeroViewportHeight ? 'xl:min-h-[100vh] xl:pb-20 xl:pt-28' : 'xl:pb-32 xl:pt-36'}`}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="relative z-20 mx-auto min-w-0 max-w-2xl text-center xl:mx-0 xl:text-left"
          >
            <Badge className="mb-1 inline-flex max-w-full whitespace-nowrap rounded-full border border-white/15 bg-white/[0.08] px-2.5 py-1.5 text-center text-[7px] font-semibold uppercase leading-4 tracking-[0.04em] text-white shadow-sm backdrop-blur hover:bg-white/[0.08] min-[360px]:text-[8px] sm:mb-3 sm:px-4 sm:py-2 sm:text-xs sm:tracking-[0.12em]">
              Verified payments for Nigerian people and businesses
            </Badge>
            <AnimatedHeroText compact={!useHeroViewportHeight} />

            <div className="mt-10 flex w-full flex-wrap items-center justify-center gap-2 sm:mt-7 sm:gap-3 xl:justify-start">
              <Button size="sm" onClick={openWaitlistModal} className="group h-9 w-auto rounded-full bg-[#1e90ff] px-4 text-[10px] font-bold text-white shadow-[0_8px_22px_rgba(30,144,255,.24)] transition-all hover:-translate-y-0.5 hover:bg-[#42a2ff] sm:h-14 sm:px-7 sm:text-base">
                Join the waitlist
                <ArrowRight size={18} className="ml-1 transition-transform group-hover:translate-x-1 sm:ml-2 sm:h-6 sm:w-6" />
              </Button>
              <button
                type="button"
                onClick={() => document.querySelector('#how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
                className="inline-flex h-9 w-auto items-center justify-center gap-1 rounded-full border border-white/20 bg-white/[0.06] px-4 text-[10px] font-semibold text-white backdrop-blur transition hover:bg-white/10 sm:h-14 sm:gap-2 sm:px-6 sm:text-sm"
              >
                See how it works
                <ChevronRight size={18} />
              </button>
            </div>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-x-2.5 gap-y-2 text-[9px] font-medium text-white/65 sm:mt-7 sm:gap-x-4 sm:text-xs xl:justify-start">
              <span className="inline-flex items-center gap-1.5"><CheckCircle2 size={15} className="text-emerald-400" /> Pay people and businesses</span>
              <span className="inline-flex items-center gap-1.5"><CheckCircle2 size={15} className="text-emerald-400" /> Get paid by any customer</span>
              <span className="inline-flex items-center gap-1.5 font-semibold text-white"><Shield size={15} className="text-[#53b0ff]" /> Protect important transactions</span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.25 }}
            className="relative mx-auto h-[22rem] min-w-0 w-full max-w-[25rem] sm:h-[34rem] sm:max-w-[44rem] md:h-[38rem] xl:h-[42rem]"
          >
            <motion.div
              animate={allowAmbientMotion ? { y: [0, -8, 0], rotate: [-5, -4, -5] } : undefined}
              transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute left-[1%] top-[4%] z-10 h-[34%] w-[37%] overflow-hidden rounded-xl border-[3px] border-white shadow-xl sm:h-[36%] sm:w-[38%] sm:rounded-[1.7rem] sm:border-[6px] sm:shadow-2xl"
            >
              <ImageWithFallback
                src={businessVerificationImage}
                alt="A verified Nigerian business owner serving a customer"
                className="h-full w-full object-cover"
                decoding="async"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#04162f]/65 via-transparent to-transparent" />
              <span className="absolute bottom-4 left-4 hidden text-xs font-bold text-white sm:block">Verified to trade</span>
            </motion.div>

            <motion.div
              animate={allowAmbientMotion ? { y: [0, 10, 0], rotate: [4, 3, 4] } : undefined}
              transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut', delay: 0.8 }}
              className="absolute right-[1%] top-[1%] z-0 block h-[30%] w-[35%] overflow-hidden rounded-xl border-[3px] border-white/90 shadow-xl sm:h-[31%] sm:w-[36%] sm:rounded-[1.6rem] sm:border-[6px] sm:shadow-2xl"
            >
              <ImageWithFallback
                src={deliveryEvidenceImage}
                alt="A Nigerian business recording delivery evidence"
                className="h-full w-full object-cover"
                decoding="async"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#04162f]/55 via-transparent to-transparent" />
              <span className="absolute bottom-4 left-4 text-xs font-bold text-white">Delivery recorded</span>
            </motion.div>

            <motion.div
              whileHover={{ y: -6, rotate: 0 }}
              className="absolute left-[14%] top-[25%] z-30 w-[72%] rotate-[-1deg] overflow-hidden rounded-xl border border-white/80 bg-white p-3 text-[#0b203b] shadow-[0_20px_48px_rgba(0,0,0,.36)] sm:left-[18%] sm:top-[24%] sm:w-[66%] sm:rounded-[2rem] sm:p-7 sm:shadow-[0_35px_90px_rgba(0,0,0,.42)]"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[8px] font-bold uppercase tracking-[0.13em] text-slate-400 sm:text-[10px] sm:tracking-[0.16em]">Available balance</p>
                  <p className="mt-0.5 text-lg font-black tracking-[-0.04em] sm:mt-1 sm:text-4xl">₦842,500</p>
                </div>
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#eaf5ff] text-[#1e90ff] sm:h-11 sm:w-11 sm:rounded-2xl"><WalletIcon size={15} className="sm:h-[21px] sm:w-[21px]" /></div>
              </div>

              <div className="mt-2.5 grid grid-cols-2 gap-1.5 sm:mt-6 sm:gap-2">
                <span className="inline-flex items-center justify-center gap-1 rounded-md bg-[#1e90ff] px-1.5 py-1.5 text-[7.5px] font-bold text-white sm:gap-1.5 sm:rounded-xl sm:px-3 sm:py-3 sm:text-xs"><Send size={10} className="sm:h-3.5 sm:w-3.5" /> Send instantly</span>
                <span className="inline-flex items-center justify-center gap-1 rounded-md bg-[#eaf5ff] px-1.5 py-1.5 text-[7.5px] font-bold text-[#0877db] sm:gap-1.5 sm:rounded-xl sm:px-3 sm:py-3 sm:text-xs"><Shield size={10} className="sm:h-3.5 sm:w-3.5" /> Protect payment</span>
              </div>

              <div className="mt-2 rounded-lg border border-slate-100 bg-slate-50 p-2 sm:mt-5 sm:rounded-2xl sm:p-3.5">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-[10px] font-bold text-emerald-700 sm:h-10 sm:w-10 sm:text-xs">
                  CE
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[9px] font-bold sm:text-sm">Chioma Electronics</p>
                    <p className="mt-0.5 text-[7.5px] text-slate-500 sm:text-xs">Protected deal · fully funded</p>
                  </div>
                  <VerifiedBadge tier="premium" variant="small" />
                </div>
              </div>
            </motion.div>

            <motion.div
              animate={allowAmbientMotion ? { y: [0, -9, 0], rotate: [5, 6, 5] } : undefined}
              transition={{ duration: 6.5, repeat: Infinity, ease: 'easeInOut', delay: 1.2 }}
              className="absolute bottom-[1%] right-[1%] top-auto z-20 h-[32%] w-[38%] overflow-hidden rounded-xl border-[3px] border-white shadow-xl sm:h-[33%] sm:w-[39%] sm:rounded-[1.7rem] sm:border-[6px] sm:shadow-2xl"
            >
              <ImageWithFallback
                src={saferDealsImage}
                alt="A customer and Nigerian business completing a safer deal"
                className="h-full w-full object-cover"
                decoding="async"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#04162f]/70 via-transparent to-transparent" />
              <span className="absolute bottom-4 left-4 hidden text-xs font-bold text-white sm:block">Trade with confidence</span>
            </motion.div>

            <motion.div
              animate={allowAmbientMotion ? { y: [0, 7, 0], rotate: [-4, -5, -4] } : undefined}
              transition={{ duration: 7.5, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute bottom-[7%] left-[1%] z-40 hidden rounded-2xl border border-white/20 bg-[#0d2b4f]/90 p-4 shadow-2xl backdrop-blur-xl sm:block"
            >
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-400/15 text-emerald-300"><CheckCircle2 size={19} /></span>
                <div><p className="text-[10px] text-white/55">Milestone confirmed</p><p className="text-xs font-bold text-white">Payment protected</p></div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Clear customer/business positioning */}
      <section className="relative overflow-hidden border-b bg-background py-12 sm:py-20">
        <div className="mx-auto max-w-[90rem] px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">One platform, both sides of the deal</p>
            <h2 className="mt-3 text-2xl font-bold tracking-[-0.04em] sm:mt-4 sm:text-5xl">
              Built for customers. Built for business.
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-sm leading-6 text-muted-foreground sm:mt-5 sm:text-lg sm:leading-7">
              Pay and get paid normally when trust already exists. When the transaction matters more, bring both sides into one Protected Deal.
            </p>
          </div>

          <div className="mt-8 grid gap-4 sm:mt-10 lg:grid-cols-[1fr_.9fr_1fr]">
            <Card className="group rounded-3xl border-primary/10 p-5 shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl sm:p-8">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary"><Users size={23} /></span>
              <p className="mt-6 text-xs font-bold uppercase tracking-[0.15em] text-primary">For customers</p>
              <h3 className="mt-2 text-xl font-bold sm:text-2xl">Buy, pay, and follow every important purchase.</h3>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">Send money to people you trust, pay verified businesses, and protect a purchase when delivery still needs to be proven.</p>
              <Button variant="outline" className="mt-6 rounded-full" onClick={() => onNavigate('register-customer')}>Open a customer account <ArrowRight size={15} /></Button>
            </Card>

            <Card className="relative overflow-hidden rounded-3xl border-0 bg-gradient-to-br from-[#071b31] via-[#0a3158] to-[#071b31] p-5 text-white shadow-[0_24px_60px_rgba(7,49,88,.24)] sm:p-8">
              <div className="absolute -right-16 -top-16 h-44 w-44 rounded-full bg-white/10 blur-2xl" />
              <span className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 text-white"><Shield size={23} /></span>
              <p className="relative mt-6 text-xs font-bold uppercase tracking-[0.15em] text-sky-300">Protected Transactions</p>
              <h3 className="relative mt-2 text-xl font-bold sm:text-2xl">One shared record. Clear terms. Protected payment.</h3>
              <p className="relative mt-3 text-sm leading-6 text-white/70">Customers and businesses see the same agreement, milestones, messages, evidence, payment status, and issue history.</p>
              <Button className="relative mt-6 rounded-full bg-white text-[#071b31] hover:bg-white/90" onClick={() => onNavigate('register')}>Protect a transaction <ArrowRight size={15} /></Button>
            </Card>

            <Card className="group rounded-3xl border-emerald-500/15 p-5 shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl sm:p-8">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600"><Landmark size={23} /></span>
              <p className="mt-6 text-xs font-bold uppercase tracking-[0.15em] text-emerald-600">For businesses</p>
              <h3 className="mt-2 text-xl font-bold sm:text-2xl">Collect sales, pay suppliers, and trade with confidence.</h3>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">Share an account, link, or QR code with customers. Use Protected Deals for new suppliers, contractors, and high-value orders.</p>
              <Button variant="outline" className="mt-6 rounded-full" onClick={() => onNavigate('register-business')}>Open a business account <ArrowRight size={15} /></Button>
            </Card>
          </div>
        </div>
      </section>

      {/* Customer journey */}
      <section className="bg-[#071a32] px-4 py-12 text-white sm:px-6 sm:py-24 lg:px-8">
        <div className="mx-auto max-w-[90rem]">
          <div className="grid gap-6 lg:grid-cols-[.8fr_1.2fr] lg:items-end">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#67b7ff]">Customer journey</p>
              <h2 className="mt-3 text-2xl font-bold tracking-[-0.04em] sm:mt-4 sm:text-5xl">From “Can I trust them?” to a transaction you can follow.</h2>
            </div>
            <p className="max-w-2xl text-sm leading-6 text-white/60 sm:text-lg sm:leading-7 lg:justify-self-end">
              Naitrust helps a customer move from discovery to payment with clearer identity, shared terms, and a visible record when the purchase needs protection.
            </p>
          </div>

          <div className="mt-10 grid overflow-hidden rounded-3xl border border-white/10 md:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: Fingerprint, step: '01', title: 'Create and verify', text: 'Set up your customer account and confirm the details that identify you.' },
              { icon: Building2, step: '02', title: 'Check the business', text: 'Review the business identity and profile before deciding how to pay.' },
              { icon: Shield, step: '03', title: 'Choose the right protection', text: 'Send normally when you trust them, or create a Protected Transaction for an important purchase.' },
              { icon: CheckCircle2, step: '04', title: 'Follow it to completion', text: 'Keep the agreement, messages, evidence, payment status, and outcome in one place.' },
            ].map((item, index) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.08 }}
                className="border-b border-white/10 p-5 last:border-b-0 sm:p-7 md:[&:nth-child(odd)]:border-r lg:border-b-0 lg:border-r lg:last:border-r-0"
              >
                <div className="flex items-center justify-between">
                  <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 text-[#67b7ff]"><item.icon size={21} /></span>
                  <span className="text-2xl font-black text-white/10">{item.step}</span>
                </div>
                <h3 className="mt-8 text-lg font-bold">{item.title}</h3>
                <p className="mt-3 text-sm leading-6 text-white/55">{item.text}</p>
              </motion.div>
            ))}
          </div>
          <div className="mt-8 text-center">
            <Button className="h-9 rounded-full px-4 text-xs sm:h-10 sm:px-5 sm:text-sm" onClick={() => onNavigate('register-customer')}>Start as a customer <ArrowRight size={14} /></Button>
          </div>
        </div>
      </section>


      {/* Product pillars */}
      <section className="relative overflow-hidden bg-[#f5f8fc] px-4 py-12 sm:px-6 sm:py-20 lg:px-8 lg:py-24 dark:bg-[#0d0f13]">
        <div className="pointer-events-none absolute -right-32 top-0 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />
      
          {/* Platform-Focused Trust Blocks */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="relative mx-auto max-w-[90rem]"
          >
            <div className="mb-9 grid items-end gap-4 sm:mb-12 sm:gap-6 lg:grid-cols-[1fr_0.8fr]">
              <div>
                <p className="mb-4 text-xs font-bold uppercase tracking-[0.18em] text-primary">One trusted platform</p>
                <h2 className="max-w-3xl text-2xl leading-[1.08] tracking-[-0.04em] sm:text-5xl sm:leading-[1.03] lg:text-6xl naitrust-satoshi-bold">
                  Money moves fast.<br /><span className="text-muted-foreground">Trust should keep up.</span>
                </h2>
              </div>
              <p className="max-w-2xl text-base leading-7 text-muted-foreground lg:justify-self-end lg:text-lg">
                Naitrust connects verified identity, everyday payments, protected transactions, and reputation for people and businesses.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-12">
              {[
                {
                  platform: 'Get Paid',
                  kicker: 'Bring money in',
                  iconComponent: Landmark,
                  description: 'Receive money and payment requests whether you sell as a business or collect as an individual.',
                  gradient: 'from-emerald-400 to-emerald-600',
                  className: 'lg:col-span-7 bg-[#09243b] text-white'
                },
                {
                  platform: 'Pay Suppliers',
                  kicker: 'Keep business moving',
                  iconComponent: Shield,
                  description: 'Send money instantly to people, suppliers, and businesses you already know.',
                  gradient: 'from-blue-400 to-blue-600',
                  className: 'lg:col-span-5 bg-[#1e90ff] text-white'
                },
                {
                  platform: 'Protect Important Orders',
                  kicker: 'When trust is still new',
                  iconComponent: Handshake,
                  description: 'Use a shared protected transaction for B2B, person-to-person, or business-to-person deals.',
                  gradient: 'from-amber-400 to-orange-500',
                  className: 'lg:col-span-5 bg-white dark:bg-card'
                },
                {
                  platform: 'Build Business History',
                  kicker: 'Proof that grows',
                  iconComponent: Fingerprint,
                  description: 'Turn verified details and completed transactions into a stronger, reusable reputation.',
                  gradient: 'from-violet-400 to-indigo-600',
                  className: 'lg:col-span-7 bg-white dark:bg-card'
                },
              ].map((platform, index) => (
                <motion.div
                  key={platform.platform}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.08 * index }}
                  whileHover={{ y: -5 }}
                  className={`group relative min-h-[190px] overflow-hidden rounded-[1.5rem] border border-black/5 p-5 shadow-[0_18px_50px_rgba(11,43,69,.07)] sm:min-h-[240px] sm:rounded-[2rem] sm:p-8 lg:p-9 ${platform.className}`}
                >
                  <div className={`absolute -bottom-20 -right-16 h-56 w-56 rounded-full bg-gradient-to-br opacity-20 blur-2xl ${platform.gradient}`} />
                  <div className="relative flex h-full flex-col">
                    <div className={`mb-6 flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-lg sm:mb-12 sm:h-12 sm:w-12 sm:rounded-2xl ${platform.gradient}`}>
                      <platform.iconComponent size={23} />
                    </div>
                    <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.16em] opacity-55">{platform.kicker}</p>
                    <h3 className="text-xl font-bold tracking-tight sm:text-3xl">{platform.platform}</h3>
                    <p className="mt-3 max-w-xl text-sm leading-6 opacity-70 sm:text-base">{platform.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="relative overflow-hidden bg-[#071a32] py-12 text-white sm:py-20 lg:py-28">
        <div className="pointer-events-none absolute right-[-10%] top-[-25%] h-[34rem] w-[34rem] rounded-full bg-primary/20 blur-[120px]" />
        <div className="max-w-[90rem] mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative mb-10 grid items-end gap-4 sm:mb-14 sm:gap-6 lg:grid-cols-2 lg:text-left"
          >
            <div>
              <p className="mb-4 text-xs font-bold uppercase tracking-[0.18em] text-[#53b0ff]">Simple by design</p>
              <h2 className="text-2xl leading-[1.08] tracking-[-0.04em] sm:text-5xl sm:leading-[1.05]">From today’s sale<br />to tomorrow’s stock.</h2>
            </div>
            <p className="max-w-xl text-sm leading-6 text-white/60 sm:text-lg sm:leading-8 lg:justify-self-end">
              One account connects what you receive, who you pay, and the important transactions you choose to protect.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.08 }}
            className="relative mb-10 hidden justify-center rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-3 backdrop-blur sm:mb-16 sm:flex sm:rounded-[2rem] sm:p-8"
          >
            {allowAmbientMotion && <TrustHeroAnimation />}
          </motion.div>

          <div className="relative grid gap-0 overflow-hidden rounded-[1.5rem] border border-white/10 sm:rounded-[2rem] md:grid-cols-2 lg:grid-cols-4">
            {howItWorks.map((item, index) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={item.step}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="relative border-b border-white/10 p-5 last:border-b-0 sm:p-7 md:[&:nth-child(odd)]:border-r lg:border-b-0 lg:border-r lg:last:border-r-0"
                >
                  <div className="h-full">
                    <div className="mb-6 flex items-center justify-between sm:mb-10">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/15 text-[#53b0ff]">
                        <Icon size={23} />
                      </div>
                      <span className="text-3xl font-black text-white/10">0{item.step}</span>
                    </div>
                    <h3 className="mb-3 text-lg text-white">{item.title}</h3>
                    <p className="text-sm leading-6 text-white/55">{item.description}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-12 text-center"
          >
            <Button className="h-9 rounded-full px-4 text-xs shadow-[0_10px_26px_rgba(30,144,255,.2)] sm:h-10 sm:px-5 sm:text-sm" onClick={openWaitlistModal}>
              Get Early Access
              <ArrowRight size={14} className="ml-1" />
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Instant Payments Showcase — mirrors the actual Wallet/Dashboard screens, not stock photography */}
      <section className="bg-[#f5f8fc] py-12 dark:bg-[#0d0f13] sm:py-20 lg:py-28">
        <div className="max-w-360 mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid items-center gap-9 lg:grid-cols-2 lg:gap-12">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="order-2 lg:order-1 relative"
            >
              <div className="relative mx-auto w-full max-w-2xl overflow-hidden rounded-[2rem] shadow-[0_30px_80px_rgba(4,22,47,.18)]">
                <ImageWithFallback
                  src={handheldAppImage}
                  alt="Naitrust mobile app displayed on a phone held in hand"
                  className="h-auto w-full object-cover"
                  loading="lazy"
                  decoding="async"
                />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="order-1 lg:order-2"
            >
              <p className="mb-4 text-xs font-bold uppercase tracking-[0.18em] text-primary">Everyday payments</p>
              <h2 className="mb-4 text-2xl leading-tight tracking-[-0.04em] sm:mb-5 sm:text-5xl">
                Everyday money movement for the people who keep your business running.
              </h2>
              <p className="mb-7 text-sm leading-6 text-muted-foreground sm:mb-8 sm:text-lg sm:leading-relaxed">
                Receive customer money and pay regular suppliers quickly through one simple account. Save the people you trade with and make the next payment easier.
              </p>

              <div className="grid sm:grid-cols-2 gap-4 mb-8">
                {[
                  { icon: ArrowDownToLine, text: 'Receive sales and customer payments' },
                  { icon: Send, text: 'Pay suppliers by account number, email, or phone' },
                  { icon: MessageCircle, text: 'Request payment directly from a conversation' },
                  { icon: Users, text: 'Save regular recipients for faster payments' },
                ].map((item, index) => {
                  const Icon = item.icon;
                  return (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.08 }}
                      className="flex items-center gap-3 rounded-2xl border bg-card p-4"
                    >
                      <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Icon size={20} className="text-primary" />
                      </div>
                      <span className="text-sm font-medium">{item.text}</span>
                    </motion.div>
                  );
                })}
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button className="h-9 w-auto self-start rounded-full px-4 text-xs sm:h-10 sm:px-5 sm:text-sm" onClick={openWaitlistModal}>
                  Get Early Access
                  <ArrowRight size={14} className="ml-1" />
                </Button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Digital Print Highlight */}
      <section className="relative overflow-hidden bg-[#071a32] py-12 sm:py-20 lg:py-28"

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
          <div className="grid items-start gap-9 lg:grid-cols-2 lg:gap-12">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <p className="mb-4 text-xs font-bold uppercase tracking-[0.18em] text-[#53b0ff]">Protected deal room</p>
              <h2 className="mb-4 text-2xl leading-tight tracking-[-0.04em] text-white sm:mb-5 sm:text-5xl">
                Protect the orders your business cannot afford to get wrong.
              </h2>
              <p className="mb-7 text-sm leading-6 text-white/65 sm:mb-8 sm:text-lg sm:leading-8">
                When you are ordering from a new supplier or committing more money than usual, a <strong className="text-white">Naitrust Protected Deal</strong> keeps the order, supplier, amount, delivery terms, evidence, and payment status in one shared record.
              </p>

              <div className="mb-6 grid gap-3 sm:grid-cols-2 sm:gap-4">
                {[
                  { icon: Fingerprint, text: 'Order actions and delivery evidence kept together' },
                  { icon: Lock, text: 'Shareable access with a dispute-ready record' },
                ].map((item, index) => {
                  const Icon = item.icon;
                  return (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.08 }}
                      className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-4 transition-colors hover:bg-white/[0.07]"
                    >
                      <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Icon size={20} className="text-primary" />
                      </div>
                      <span className="text-sm font-medium text-white">{item.text}</span>
                    </motion.div>
                  );
                })}
              </div>

              <div className="flex">
                <Button size="sm" className="w-auto rounded-full px-5" onClick={() => onNavigate('register-business')}>
                  Create a Protected Deal
                  <ArrowRight size={15} className="ml-1.5" />
                </Button>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative min-h-[31rem] sm:min-h-[34rem]"
            >
              {allowAmbientMotion && <motion.div
                aria-hidden="true"
                animate={{ rotate: 360, scale: [1, 1.08, 1] }}
                transition={{ rotate: { duration: 28, repeat: Infinity, ease: 'linear' }, scale: { duration: 6, repeat: Infinity, ease: 'easeInOut' } }}
                className="pointer-events-none absolute -inset-8 rounded-full border border-[#53b0ff]/15"
              />}
              {allowAmbientMotion && <motion.div
                aria-hidden="true"
                animate={{ rotate: -360 }}
                transition={{ duration: 38, repeat: Infinity, ease: 'linear' }}
                className="pointer-events-none absolute -inset-3 rounded-[3rem] border border-dashed border-white/10"
              />}
              <div className="absolute inset-x-0 top-0 h-[22rem] overflow-hidden rounded-[1.5rem] border border-white/15 shadow-[0_35px_90px_rgba(0,0,0,.4)] sm:inset-x-8 sm:h-[27rem] sm:rounded-[2rem]">
                <motion.div
                  animate={allowAmbientMotion ? { scale: [1, 1.045, 1], x: [0, -5, 0] } : undefined}
                  transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
                  className="absolute inset-0"
                >
                  <ImageWithFallback
                    src={saferDealsImage}
                    alt="Customer and business reviewing a protected transaction"
                    className="h-full w-full object-cover"
                    loading="lazy"
                    decoding="async"
                  />
                </motion.div>
                <div className="absolute inset-0 bg-gradient-to-t from-[#04162f] via-[#04162f]/10 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 px-5 pb-12 pt-6 text-white sm:p-8">
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#7fc5ff]">A shared record for both sides</p>
                  <p className="mt-2 max-w-sm text-lg font-bold leading-snug sm:text-xl">The order, evidence, payment status, and next action stay together.</p>
                </div>
              </div>

              <motion.div
                animate={allowAmbientMotion ? { y: [0, -8, 0] } : undefined}
                transition={{ duration: 5.5, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute bottom-0 left-0 z-10 w-[82%] sm:w-[68%]"
              >
              <Card className="gap-0 rounded-[1.25rem] border-0 bg-white p-4 text-[#071b31] shadow-2xl sm:rounded-[1.5rem] sm:p-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
                    <CheckCircle2 size={21} />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Protected Deal</p>
                    <p className="font-bold text-[#071b31]">Delivery evidence added</p>
                  </div>
                </div>
                <div className="mt-5 h-1.5 overflow-hidden rounded-full bg-slate-100">
                  <div className="h-full w-3/4 rounded-full bg-emerald-500" />
                </div>
                <div className="mt-2 flex justify-between text-[10px] font-semibold text-slate-500">
                  <span>Terms agreed</span>
                  <span>Awaiting confirmation</span>
                </div>
              </Card>
              </motion.div>

              <motion.div
                animate={allowAmbientMotion ? { y: [0, 7, 0], rotate: [0, 0.6, 0] } : undefined}
                transition={{ duration: 4.8, repeat: Infinity, ease: 'easeInOut', delay: 0.6 }}
                className="absolute bottom-8 right-0 z-20 w-[47%] sm:bottom-10 sm:w-[38%]"
              >
              <Card className="gap-0 rounded-[1.15rem] border border-white/70 bg-white/95 p-3 shadow-2xl backdrop-blur sm:rounded-[1.4rem] sm:p-4">
                <div className="flex items-center gap-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#eaf5ff] text-primary">
                    <Shield size={17} />
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground">Payment status</p>
                    <p className="text-xs font-bold text-emerald-700">Protected</p>
                  </div>
                </div>
              </Card>
              </motion.div>

              <div className="absolute -bottom-4 -left-4 w-48 h-48 bg-primary/10 rounded-full blur-3xl -z-10"></div>
              <div className="absolute -top-4 -right-4 w-32 h-32 bg-primary/5 rounded-full blur-3xl -z-10"></div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Partners Section */}
      <section className="border-b bg-background py-12 sm:py-20">
        <div className="max-w-360 mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <p className="mb-4 text-xs font-bold uppercase tracking-[0.18em] text-primary">Infrastructure partners</p>
            <h2 className="mb-4 text-2xl tracking-tight text-gray-900 sm:text-4xl dark:text-white">Trust in front. Regulated rails underneath.</h2>
            <p className="mx-auto max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
              Naitrust is being built on regulated banking infrastructure from Anchor for account, collection, transfer, and verification services. Naitrust provides the customer experience and trust workflow while regulated infrastructure handles fund movement.
            </p>
          </motion.div>

          <div className="mx-auto grid max-w-3xl grid-cols-2 gap-3 py-4 sm:gap-4">
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
              className="block"
            >
              <Card className="flex h-full min-h-40 items-center justify-center rounded-[1.5rem] p-6 transition-all hover:-translate-y-1 hover:shadow-xl dark:from-card dark:to-gray-900/50">
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
              className="block"
            >
              <Card className="flex h-full min-h-32 items-center justify-center rounded-[1.25rem] p-4 transition-all hover:-translate-y-1 hover:shadow-xl sm:min-h-40 sm:rounded-[1.5rem] sm:p-6 dark:from-card dark:to-gray-900/50">
                <QoreIDLogo className="h-12 w-12 rounded-full bg-[#141414] p-2 sm:h-16 sm:w-16" />
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
              className="block"
            >
              <Card className="flex h-full min-h-32 items-center justify-center rounded-[1.25rem] p-4 transition-all hover:-translate-y-1 hover:border-primary/50 hover:shadow-xl sm:min-h-40 sm:rounded-[1.5rem] sm:p-6 dark:from-card dark:to-gray-900/50">
                <AnchorLogo className="h-12 w-12 rounded-full object-contain sm:h-16 sm:w-16" />
                <p className="font-semibold text-sm group-hover:text-primary transition-colors">Anchor</p>
                <p className="text-xs text-gray-600 dark:text-gray-400 text-center">Payment infrastructure</p>
              </Card>
            </motion.a>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="bg-[#f5f8fc] py-12 dark:bg-[#0d0f13] sm:py-20 lg:py-28">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-12 grid gap-5 text-left md:grid-cols-[0.7fr_1fr] md:items-end"
          >
            <div><p className="mb-4 text-xs font-bold uppercase tracking-[0.18em] text-primary">Questions, answered</p><h2 className="text-2xl tracking-[-0.04em] text-gray-900 sm:text-5xl dark:text-white">The important stuff.</h2></div>
            <p className="text-sm leading-6 text-muted-foreground sm:text-lg md:justify-self-end">Clear answers about receiving money, paying suppliers, and protecting important transactions.</p>
          </motion.div>

          <div className="overflow-hidden rounded-[1.5rem] border bg-background sm:rounded-[2rem]">
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="grid gap-3 border-b p-5 last:border-b-0 sm:grid-cols-[3rem_0.8fr_1.2fr] sm:gap-5 sm:p-8">
                  <span className="text-sm font-bold text-primary">0{index + 1}</span>
                  <h4>{faq.question}</h4>
                  <p className="text-sm leading-6 text-muted-foreground">{faq.answer}</p>
                </div>
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
      <section className="relative overflow-hidden bg-[#04162f] py-10 text-white sm:pb-20 sm:pt-24">
        <div className="pointer-events-none absolute left-1/2 top-[38%] h-44 w-[38rem] max-w-[85vw] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/10 blur-[95px]" />

        <div className="max-w-3xl lg:max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            {/* Slogan - Prominent */}
            <div className="mb-5 inline-flex max-w-full rounded-full border border-white/15 bg-white/[0.06] px-3 py-2 backdrop-blur sm:mb-8 sm:px-5 sm:py-2.5">
              <p className="text-[9px] font-bold uppercase leading-4 tracking-[0.08em] text-[#7dc1ff] sm:text-xs sm:tracking-[0.14em]">
                Send instantly when you trust them. Protect it when you don't.
              </p>
            </div>

            <h2 className="mb-4 text-2xl font-bold leading-[1.1] tracking-[-0.04em] text-white sm:mb-5 sm:text-5xl sm:leading-[1.02] lg:text-6xl">
              Run today’s business.<br />Build tomorrow’s trust.
            </h2>
            <p className="mx-auto mb-6 max-w-2xl text-sm leading-6 text-white/60 sm:mb-9 sm:text-base sm:leading-7 lg:text-lg">
              Receive sales, pay trusted suppliers instantly, and protect important orders—all from one business account.
            </p>

            <div className="flex flex-row justify-center gap-2 sm:gap-4">
              <Button
                size="lg"
                variant="secondary"
                onClick={openWaitlistModal}
                className="h-12 min-w-0 flex-1 rounded-full bg-primary px-5 text-sm font-bold text-white shadow-[0_16px_38px_rgba(30,144,255,0.34)] ring-1 ring-white/15 hover:-translate-y-0.5 hover:bg-primary/90 sm:h-14 sm:flex-none sm:px-10 sm:text-lg"
              >
                Join Early Access
                <ArrowRight size={16} className="ml-1.5 sm:h-5 sm:w-5" />
              </Button>
              <Button
                size="lg"
                onClick={() => window.open('/register-business', '_blank', 'noopener,noreferrer')}
                className="h-12 min-w-0 flex-1 rounded-full border border-white/30 bg-white/[0.1] px-5 text-sm font-bold text-white shadow-[0_12px_30px_rgba(0,0,0,0.18)] backdrop-blur hover:-translate-y-0.5 hover:bg-white/15 hover:text-white sm:h-14 sm:flex-none sm:px-10 sm:text-lg"
              >
                Join as a Business
              </Button>
            </div>

            {/* Feedback Link */}
            <div className="mt-9 border-t border-white/10 pt-7 sm:mt-12 sm:pt-8">
              <p className="mb-3 text-sm text-white/45 sm:mb-4 sm:text-base">
                Have feedback about business payments in Nigeria?
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
