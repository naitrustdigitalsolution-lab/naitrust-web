import {
  ArrowRight,
  BadgeCheck,
  Building2,
  CheckCircle2,
  Handshake,
  Search,
  ReceiptText,
  PackageCheck,
  ShieldCheck,
  Store,
} from 'lucide-react';
import { motion } from 'motion/react';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { SEOHead } from '../utility/SEOHead';
import { openWaitlistModal } from '../modals/waitlist-events';
import { pageImages } from '../../libs/images/image-manifest';

interface AboutPageProps {
  onNavigate: (page: string, params?: unknown) => void;
}

const audiences = [
  'Individuals sourcing for themselves',
  'Retailers importing stock',
  'Nigerian manufacturers and sellers',
  'Wholesalers and growing companies',
];

export function AboutPage({ onNavigate }: AboutPageProps) {
  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="About Naitrust Market and Protected Commerce"
        description="Naitrust connects Nigerian buyers with verified suppliers in China and Nigeria through English listings, confirmed landed-cost quotes, protected orders, and tracked delivery."
        canonicalPath="/about"
      />

      <section className="relative overflow-hidden bg-[#04162f] px-4 py-20 text-white sm:px-6 sm:py-24 lg:px-8 lg:py-28">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65 }}
          className="relative mx-auto max-w-[90rem]"
        >
          <div className="grid items-center gap-12 lg:grid-cols-[0.92fr_1.08fr] lg:gap-16 xl:gap-20">
            <div className="max-w-2xl">
              <Badge className="mb-6 rounded-full border border-white/15 bg-white/[0.08] px-4 py-2 text-white hover:bg-white/[0.08]">
                Why Naitrust exists
              </Badge>
              <h1 className="text-5xl font-bold leading-[0.98] tracking-[-0.055em] sm:text-6xl lg:text-[4.25rem]">
                Cross-border sourcing should be clear from <span className="text-[#50adff]">supplier to doorstep.</span>
              </h1>
              <p className="mt-7 max-w-xl text-base leading-7 text-white/70 sm:text-lg sm:leading-8">
                Naitrust helps Nigerians find verified suppliers, understand foreign listings, confirm the full landed cost, protect product funds, and follow delivery in one place.
              </p>
              <Button className="mt-8 h-12 rounded-full px-7 shadow-lg shadow-primary/20" onClick={openWaitlistModal}>
                Join Naitrust
                <ArrowRight size={17} className="ml-2" />
              </Button>
            </div>
            <div className="relative">
              <div className="absolute -inset-3 rounded-[2.25rem] border border-white/10 bg-white/[0.04]" />
              <div className="relative overflow-hidden rounded-[1.75rem] border border-white/15 bg-white/5 shadow-2xl shadow-black/30">
                <img
                  src={pageImages.aboutHero.src}
                  alt={pageImages.aboutHero.alt}
                  className="aspect-[4/3] w-full object-cover object-center"
                />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#04162f]/25 via-transparent to-transparent" />
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      <section className="border-b bg-background px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <div className="mx-auto grid max-w-[90rem] gap-8 lg:grid-cols-[0.7fr_1.3fr] lg:gap-16">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">About Naitrust</p>
            <h2 className="mt-3 text-3xl font-bold tracking-[-0.03em] sm:text-4xl">Commerce built around clarity.</h2>
          </div>
          <div className="max-w-3xl space-y-4 text-base leading-7 text-muted-foreground">
              <p>
                Naitrust is a protected-commerce platform operated by Naitrust Digital Solutions Limited. It connects Nigerian customers and businesses with curated suppliers in China and verified sellers in Nigeria.
              </p>
              <p>
                Customers browse translated listings, request a confirmed landed-cost quote, fund protected orders, and track delivery. Nigerian sellers publish showcases, respond to quotes, fulfil orders, and withdraw available earnings.
              </p>
              <p>
                Each Order Room keeps the accepted quote, supplier checks, agreement, messages, logistics, evidence, disputes, refunds, and payment release together. Regulated financial partners handle money movement.
              </p>
          </div>
        </div>
      </section>

      <section className="bg-[#f5f8fc] px-4 py-20 sm:px-6 sm:py-24 lg:px-8 dark:bg-[#0d0f13]">
        <div className="mx-auto max-w-[90rem]">
          <div className="grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
            <motion.div initial={{ opacity: 0, x: -18 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <p className="mb-4 text-xs font-bold uppercase tracking-[0.18em] text-primary">The problem</p>
              <h2 className="text-4xl font-bold leading-[1.05] tracking-[-0.04em] sm:text-5xl">
                Importing is too often built on screenshots, unknown suppliers, and incomplete costs.
              </h2>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="grid gap-4 sm:grid-cols-2"
            >
              {[
                'Buyers struggle to verify an overseas supplier before committing money.',
                'Catalogue prices rarely show customs, handling, inspection, and final delivery.',
                'Product requirements and supplier updates are scattered across chats.',
                'Payment, shipment documents, evidence, and issues live in separate places.',
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
        <div className="mx-auto max-w-[90rem]">
          <div className="mb-12 max-w-3xl">
            <p className="mb-4 text-xs font-bold uppercase tracking-[0.18em] text-primary">One protected commerce flow</p>
            <h2 className="text-4xl font-bold leading-tight tracking-[-0.04em] sm:text-5xl">
              Know the supplier, the cost, and the next step before you commit.
            </h2>
          </div>
          <div className="grid gap-px overflow-hidden rounded-[2rem] border bg-border md:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: Search, title: 'Discover', text: 'Browse products, suppliers, showcases, verification, and translated specifications.' },
              { icon: ReceiptText, title: 'Confirm the cost', text: 'Accept an itemized, time-limited landed-cost quote before paying.' },
              { icon: ShieldCheck, title: 'Protect the order', text: 'Keep supplier product funds protected through the agreed order stages.' },
              { icon: PackageCheck, title: 'Track delivery', text: 'Follow inspection, export, transit, customs, local delivery, and buyer review.' },
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
        <div className="mx-auto grid max-w-[90rem] gap-12 lg:grid-cols-2 lg:items-center">
          <motion.div initial={{ opacity: 0, x: -18 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
            <p className="mb-4 text-xs font-bold uppercase tracking-[0.18em] text-[#67b7ff]">Built for people who buy and sell</p>
            <h2 className="text-4xl font-bold leading-tight tracking-[-0.04em] sm:text-5xl">
              Better sourcing should work for one product or wholesale stock.
            </h2>
            <p className="mt-6 max-w-xl text-lg leading-8 text-white/60">
              Naitrust supports individuals buying for themselves, retailers restocking, wholesalers importing at scale, and Nigerian businesses selling locally.
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
          className="mx-auto max-w-[90rem] rounded-[2rem] bg-[#eef6ff] p-8 dark:bg-card sm:p-12"
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
          <h2 className="text-4xl font-bold leading-tight tracking-[-0.04em] sm:text-5xl">Source with confidence. Follow every order.</h2>
          <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-white/60">
            Verified suppliers, confirmed landed costs, protected product funds, and delivery updates in one place.
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
