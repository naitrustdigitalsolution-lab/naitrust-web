import {
  ArrowDownToLine,
  ArrowRight,
  BadgeCheck,
  Building2,
  CheckCircle2,
  Handshake,
  Send,
  ShieldCheck,
  Store,
} from 'lucide-react';
import { motion } from 'motion/react';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { SEOHead } from '../utility/SEOHead';
import { openWaitlistModal } from '../modals/waitlist-events';

interface AboutPageProps {
  onNavigate: (page: string, params?: unknown) => void;
}

const audiences = [
  'Everyday customers and buyers',
  'Market and shop traders',
  'Online sellers and service providers',
  'Wholesalers and growing companies',
];

export function AboutPage({ onNavigate }: AboutPageProps) {
  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="About Naitrust — Nigerian Payments and Trust Fintech"
        description="Naitrust is a Nigerian fintech platform where people and businesses can pay, get paid, verify who they are dealing with, and protect important P2P, customer and B2B transactions."
        canonicalPath="/about"
      />

      <section className="relative overflow-hidden bg-[#04162f] px-4 pb-24 pt-20 text-white sm:px-6 sm:py-28 lg:px-8">
        <div className="pointer-events-none absolute -right-28 top-0 h-[28rem] w-[28rem] rounded-full bg-primary/15 blur-[120px]" />
        <div className="pointer-events-none absolute inset-0 opacity-[0.05] [background-image:linear-gradient(rgba(255,255,255,.3)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.3)_1px,transparent_1px)] [background-size:72px_72px]" />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65 }}
          className="relative mx-auto max-w-6xl"
        >
          <Badge className="mb-6 border border-white/15 bg-white/[0.08] px-4 py-2 text-white hover:bg-white/[0.08]">
            Why Naitrust exists
          </Badge>
          <div className="grid items-end gap-10 lg:grid-cols-[1.15fr_0.85fr]">
            <h1 className="max-w-4xl text-5xl font-bold leading-[0.98] tracking-[-0.055em] sm:text-6xl lg:text-7xl">
              Nigeria’s digital economy deserves trust built into every transaction.
            </h1>
            <div>
              <p className="text-lg leading-8 text-white/68">
                Customers should know who they are paying. Businesses should be able to prove who they are. Naitrust connects verified identity, everyday payments, and Protected Transactions so both sides can move with greater confidence.
              </p>
              <Button className="mt-7 h-12 rounded-full px-6" onClick={openWaitlistModal}>
                Join Naitrust
                <ArrowRight size={17} className="ml-2" />
              </Button>
            </div>
          </div>
        </motion.div>
      </section>

      <section className="border-b bg-background px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-6xl gap-4 rounded-2xl border border-primary/15 bg-primary/[0.035] p-6 sm:grid-cols-[1fr_auto] sm:items-center sm:p-8">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">The official Naitrust brand</p>
            <h2 className="mt-2 text-2xl font-bold tracking-tight">What is Naitrust?</h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
              Naitrust is a Nigerian fintech platform operated by Naitrust Digital Solutions Limited. It brings customer and business payments, participant verification, and Protected Transactions into one clear experience.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-[#f5f8fc] px-4 py-20 sm:px-6 sm:py-24 lg:px-8 dark:bg-[#0d0f13]">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
            <motion.div initial={{ opacity: 0, x: -18 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <p className="mb-4 text-xs font-bold uppercase tracking-[0.18em] text-primary">The problem</p>
              <h2 className="text-4xl font-bold leading-[1.05] tracking-[-0.04em] sm:text-5xl">
                Money moves quickly. Trust signals rarely move with it.
              </h2>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="grid gap-4 sm:grid-cols-2"
            >
              {[
                'Customers often pay before they can confidently verify the seller.',
                'Important terms are agreed verbally or buried inside chats.',
                'Businesses struggle to turn honest work into visible credibility.',
                'Payment, delivery evidence, and issue history live in separate places.',
              ].map((problem, index) => (
                <Card key={problem} className="rounded-2xl border-0 p-6 shadow-[0_14px_40px_rgba(11,43,69,.07)]">
                  <span className="text-xs font-bold text-primary">0{index + 1}</span>
                  <p className="mt-8 text-base font-semibold leading-7">{problem}</p>
                </Card>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      <section className="px-4 py-20 sm:px-6 sm:py-24 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 max-w-3xl">
            <p className="mb-4 text-xs font-bold uppercase tracking-[0.18em] text-primary">Trust infrastructure for both sides</p>
            <h2 className="text-4xl font-bold leading-tight tracking-[-0.04em] sm:text-5xl">
              Move normally when trust exists. Add protection when it matters.
            </h2>
          </div>
          <div className="grid gap-px overflow-hidden rounded-[2rem] border bg-border md:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: BadgeCheck, title: 'Verify both sides', text: 'Give customers and businesses clearer identity signals before money moves.' },
              { icon: Send, title: 'Pay normally', text: 'Send money quickly when you already know and trust the recipient.' },
              { icon: ShieldCheck, title: 'Protect transactions', text: 'Keep terms, evidence, delivery, messages, and payment status together.' },
              { icon: ArrowDownToLine, title: 'Build confidence', text: 'Turn verified details and completed activity into a stronger platform history.' },
            ].map((item, index) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.08 }}
                className="bg-background p-7 sm:p-8"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <item.icon size={22} />
                </div>
                <h3 className="mt-10 text-xl font-bold">{item.title}</h3>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">{item.text}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#071a32] px-4 py-20 text-white sm:px-6 sm:py-24 lg:px-8">
        <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-2 lg:items-center">
          <motion.div initial={{ opacity: 0, x: -18 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
            <p className="mb-4 text-xs font-bold uppercase tracking-[0.18em] text-[#67b7ff]">Built for people who buy and sell</p>
            <h2 className="text-4xl font-bold leading-tight tracking-[-0.04em] sm:text-5xl">
              Trust should not depend on the size of the transaction or business.
            </h2>
            <p className="mt-6 max-w-xl text-lg leading-8 text-white/60">
              Naitrust supports the customer making an important purchase and the business working to earn that customer’s confidence—from informal sellers to registered companies.
            </p>
          </motion.div>
          <div className="grid gap-3 sm:grid-cols-2">
            {audiences.map((audience, index) => (
              <motion.div
                key={audience}
                initial={{ opacity: 0, scale: 0.96 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.07 }}
                className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.05] p-5"
              >
                {index === 0 ? <Store className="text-[#67b7ff]" size={20} /> : index === 3 ? <Building2 className="text-[#67b7ff]" size={20} /> : <Handshake className="text-[#67b7ff]" size={20} />}
                <span className="text-sm font-semibold">{audience}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-20 sm:px-6 sm:py-24 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mx-auto max-w-5xl rounded-[2rem] bg-[#eef6ff] p-8 dark:bg-card sm:p-12"
        >
          <div className="grid gap-10 lg:grid-cols-[1fr_0.8fr] lg:items-end">
            <div>
              <p className="mb-4 text-xs font-bold uppercase tracking-[0.18em] text-primary">Our responsibility</p>
              <h2 className="text-3xl font-bold tracking-[-0.035em] sm:text-4xl">Trust must be clear, not exaggerated.</h2>
              <p className="mt-5 max-w-2xl leading-7 text-muted-foreground">
                Naitrust manages the account experience, transaction workflow, participant record, and supporting evidence. Licensed financial partners handle regulated funding and money movement.
              </p>
            </div>
            <div className="space-y-3">
              {['Clear participant roles', 'Visible payment status', 'Evidence tied to the transaction'].map((item) => (
                <div key={item} className="flex items-center gap-3 text-sm font-semibold">
                  <CheckCircle2 size={18} className="text-emerald-600" />
                  {item}
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </section>

      <section className="bg-[#04162f] px-4 py-20 text-center text-white sm:px-6 sm:py-24 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mx-auto max-w-3xl">
          <h2 className="text-4xl font-bold leading-tight tracking-[-0.04em] sm:text-5xl">Know who you are dealing with. Protect what matters.</h2>
          <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-white/60">
            One trust layer for customers, businesses, everyday payments, and important transactions.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Button size="lg" className="rounded-full px-7" onClick={openWaitlistModal}>
              Join early access
              <ArrowRight size={18} className="ml-2" />
            </Button>
            <Button size="lg" variant="outline" className="rounded-full border-white/20 bg-white/[0.05] px-7 text-white hover:bg-white/10 hover:text-white" onClick={() => onNavigate('contact')}>
              Talk to us
            </Button>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
