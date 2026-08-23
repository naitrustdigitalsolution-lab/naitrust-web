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
import { useTranslation } from 'react-i18next';

interface AboutPageProps {
  onNavigate: (page: string, params?: unknown) => void;
}

export function AboutPage({ onNavigate }: AboutPageProps) {
  const { t } = useTranslation('about');
  const audiences = [t('audience1'), t('audience2'), t('audience3'), t('audience4')];
  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title={t('seoTitle')}
        description="Naitrust helps Nigerian individuals and businesses buy from China through verified sourcing agents, clear landed costs, protected order rooms and delivery tracking."
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
                {t('eyebrow')}
              </Badge>
              <h1 className="text-5xl font-bold leading-[0.98] tracking-[-0.055em] sm:text-6xl lg:text-[4.25rem]">
                {t('titleStart')}<span className="text-[#50adff]">{t('titleHighlight')}</span>
              </h1>
              <p className="mt-7 max-w-xl text-base leading-7 text-white/70 sm:text-lg sm:leading-8">
                {t('intro')}
              </p>
              <Button className="mt-8 h-12 rounded-full px-7 shadow-lg shadow-primary/20" onClick={openWaitlistModal}>
                {t('join')}
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
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">{t('aboutLabel')}</p>
            <h2 className="mt-3 text-3xl font-bold tracking-[-0.03em] sm:text-4xl">{t('aboutTitle')}</h2>
          </div>
          <div className="max-w-3xl space-y-4 text-base leading-7 text-muted-foreground">
              <p>
                {t('paragraph1')}
              </p>
              <p>
                {t('paragraph2')}
              </p>
              <p>
                {t('paragraph3')}
              </p>
          </div>
        </div>
      </section>

      <section className="bg-[#f5f8fc] px-4 py-20 sm:px-6 sm:py-24 lg:px-8 dark:bg-[#0d0f13]">
        <div className="mx-auto max-w-[90rem]">
          <div className="grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
            <motion.div initial={{ opacity: 0, x: -18 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <p className="mb-4 text-xs font-bold uppercase tracking-[0.18em] text-primary">{t('problemLabel')}</p>
              <h2 className="text-4xl font-bold leading-[1.05] tracking-[-0.04em] sm:text-5xl">
                {t('problemTitle')}
              </h2>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="grid gap-4 sm:grid-cols-2"
            >
              {[
                t('problem1'), t('problem2'), t('problem3'), t('problem4'),
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
            <p className="mb-4 text-xs font-bold uppercase tracking-[0.18em] text-primary">{t('flowLabel')}</p>
            <h2 className="text-4xl font-bold leading-tight tracking-[-0.04em] sm:text-5xl">
              {t('flowTitle')}
            </h2>
          </div>
          <div className="grid gap-px overflow-hidden rounded-[2rem] border bg-border md:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: Search, title: t('step1Title'), text: t('step1Text') }, { icon: ReceiptText, title: t('step2Title'), text: t('step2Text') }, { icon: ShieldCheck, title: t('step3Title'), text: t('step3Text') }, { icon: PackageCheck, title: t('step4Title'), text: t('step4Text') },
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
            <p className="mb-4 text-xs font-bold uppercase tracking-[0.18em] text-[#67b7ff]">{t('buyersLabel')}</p>
            <h2 className="text-4xl font-bold leading-tight tracking-[-0.04em] sm:text-5xl">
              {t('buyersTitle')}
            </h2>
            <p className="mt-6 max-w-xl text-lg leading-8 text-white/60">
              {t('buyersText')}
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
              <p className="mb-4 text-xs font-bold uppercase tracking-[0.18em] text-primary">{t('responsibilityLabel')}</p><h2 className="text-3xl font-bold tracking-[-0.035em] sm:text-4xl">{t('responsibilityTitle')}</h2>
              <p className="mt-5 max-w-2xl leading-7 text-muted-foreground">
                {t('responsibilityText')}
              </p>
            </div>
            <div className="space-y-3">
              {[t('responsibility1'), t('responsibility2'), t('responsibility3')].map((item) => (
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
          <h2 className="text-4xl font-bold leading-tight tracking-[-0.04em] sm:text-5xl">{t('ctaTitle')}</h2>
          <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-white/60">
            {t('ctaText')}
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Button size="lg" className="rounded-full px-7" onClick={openWaitlistModal}>
              {t('ctaPrimary')}
              <ArrowRight size={18} className="ml-2" />
            </Button>
            <Button size="lg" variant="outline" className="rounded-full border-white/20 bg-white/[0.05] px-7 text-white hover:bg-white/10 hover:text-white" onClick={() => onNavigate('contact')}>
              {t('ctaSecondary')}
            </Button>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
