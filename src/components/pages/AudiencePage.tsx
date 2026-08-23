import { ArrowRight, CheckCircle2, Shield, Store } from 'lucide-react';
import { motion } from 'motion/react';
import { Button } from '../ui/button';
import { SEOHead } from '../utility/SEOHead';
import { ImageWithFallback } from '../utility/ImageWithFallback';
import { pageImages } from '../../libs/images/image-manifest';
import { useTranslation } from 'react-i18next';
import { audienceContent, audienceUi, type Audience } from '../../content/audience-page-content';

type AudiencePageProps = { audience: Audience; onNavigate: (page: string) => void };

export function AudiencePage({ audience, onNavigate }: AudiencePageProps) {
  const { i18n } = useTranslation();
  const isChinese = i18n.resolvedLanguage === 'zh-CN';
  const locale = isChinese ? 'zh-CN' : 'en';
  const page = audienceContent[locale][audience];
  const ui = audienceUi[locale];
  const isBusiness = audience === 'business';
  return <motion.main
    key={audience}
    initial={{ opacity: 0, y: -18 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    className="overflow-hidden bg-background"
  >
    <SEOHead title={isBusiness ? 'Naitrust for Nigerian Businesses' : 'Naitrust for Customers'} description={page.description} canonicalPath={isBusiness ? '/business' : '/customer'} />

    <section className="relative overflow-hidden bg-[#04162f] px-4 pb-16 pt-24 text-white sm:px-6 sm:pb-24 sm:pt-32 lg:px-8">
      <div className="relative mx-auto grid max-w-[90rem] items-center gap-10 lg:grid-cols-[.9fr_1.1fr] lg:gap-16">
        <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}}>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#72c1ff]">{page.eyebrow}</p>
          <h1 className="mt-5 max-w-3xl text-4xl font-bold leading-[1.04] tracking-[-0.05em] sm:text-5xl lg:text-[clamp(3.25rem,5vw,4rem)]">
            {page.title.slice(0, -page.titleHighlight.length)}
            <span className="text-[#50adff]">{page.titleHighlight}</span>
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-7 text-white/65 sm:text-lg sm:leading-8">{page.description}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button size="sm" className="h-10 rounded-full px-6 text-xs font-bold sm:h-12 sm:px-7 sm:text-sm" onClick={() => onNavigate(page.register)}>{page.primary}<ArrowRight size={16}/></Button>
            <Button variant="outline" className="h-10 rounded-full border-white/20 bg-white/[.06] px-6 text-xs text-white hover:bg-white/10 hover:text-white sm:h-12 sm:px-7 sm:text-sm" onClick={() => document.querySelector('#audience-how')?.scrollIntoView({behavior:'smooth'})}>{ui.how}</Button>
          </div>
          <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-xs text-white/60">
            <span className="inline-flex items-center gap-2"><CheckCircle2 size={15} className="text-emerald-400"/>{ui.identity}</span><span className="inline-flex items-center gap-2"><CheckCircle2 size={15} className="text-emerald-400"/>{ui.quotes}</span><span className="inline-flex items-center gap-2"><CheckCircle2 size={15} className="text-emerald-400"/>{ui.tracking}</span>
          </div>
        </motion.div>
        <motion.div initial={{opacity:0,x:24}} animate={{opacity:1,x:0}} transition={{delay:.15}} className="relative min-h-[25rem] sm:min-h-[34rem]">
          <div className="absolute -inset-3 rounded-[2.25rem] border border-white/10 bg-white/[0.04] sm:rounded-[3rem]" />
          <div className="absolute inset-0 overflow-hidden rounded-[2rem] border border-white/10 shadow-[0_35px_90px_rgba(0,0,0,.35)] sm:rounded-[2.75rem]">
            <ImageWithFallback src={page.heroImage} alt={page.heroAlt} className="h-full w-full object-cover brightness-[1.08] contrast-[1.04] saturate-[1.07]" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#04162f]/45 via-transparent to-transparent"/>
          </div>
          <div className="absolute bottom-5 left-5 right-5 rounded-2xl border border-white/15 bg-[#071b31]/85 p-4 backdrop-blur-xl sm:bottom-8 sm:left-8 sm:right-auto sm:max-w-xs sm:p-5">
            <div className="flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-400/15 text-emerald-300"><Shield size={19}/></span><div><p className="text-[10px] text-white/50">{ui.sourcing}</p><p className="text-sm font-bold">{ui.tagline}</p></div></div>
          </div>
        </motion.div>
      </div>
    </section>

    <section className="px-4 py-14 sm:px-6 sm:py-24 lg:px-8">
      <div className="mx-auto max-w-[90rem]">
        <div className="grid gap-6 lg:grid-cols-[.8fr_1.2fr] lg:items-end"><div><p className="text-xs font-bold uppercase tracking-[.18em] text-primary">{page.sectionLabel}</p><h2 className="mt-4 text-3xl font-bold tracking-[-.04em] sm:text-4xl lg:text-5xl">{page.whoTitle}</h2></div><p className="max-w-2xl text-sm leading-7 text-muted-foreground sm:text-base lg:justify-self-end lg:text-lg">{page.whoCopy}</p></div>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{page.useCases.map((item,index)=><motion.article key={item.title} initial={{opacity:0,y:18}} whileInView={{opacity:1,y:0}} viewport={{once:true}} transition={{delay:index*.06}} className="rounded-3xl border bg-card p-6 shadow-sm"><span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary"><item.icon size={22}/></span><h3 className="mt-6 text-lg font-bold">{item.title}</h3><p className="mt-3 text-sm leading-6 text-muted-foreground">{item.text}</p></motion.article>)}</div>
      </div>
    </section>

    <section id="audience-how" className="bg-[#c4e9fdb3] px-4 py-14 text-[#071b31] sm:px-6 sm:py-24 lg:px-8">
      <div className="mx-auto max-w-[90rem]"><div className="mx-auto max-w-3xl text-center"><p className="text-xs font-bold uppercase tracking-[.18em] text-primary">{ui.howLabel}</p><h2 className="mt-4 text-3xl font-bold tracking-[-.04em] sm:text-4xl lg:text-5xl">{ui.howTitle}</h2></div>
        <div className="mt-10 grid overflow-hidden rounded-3xl border border-[#071b31]/10 bg-white/45 lg:grid-cols-4">{page.steps.map((step,index)=><article key={step.title} className="border-b border-[#071b31]/10 p-6 last:border-0 lg:border-b-0 lg:border-r lg:last:border-r-0"><div className="flex items-center justify-between"><span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-primary"><step.icon size={21}/></span><span className="text-3xl font-black text-[#071b31]/15">0{index+1}</span></div><h3 className="mt-8 text-lg font-bold">{step.title}</h3><p className="mt-3 text-sm leading-6 text-[#35546f]">{step.text}</p></article>)}</div>
      </div>
    </section>

    <section className="px-4 py-14 sm:px-6 sm:py-24 lg:px-8"><div className="mx-auto grid max-w-[90rem] items-center gap-10 lg:grid-cols-2 lg:gap-16">
        <div className="relative overflow-hidden rounded-[2rem] bg-[#071b31] shadow-2xl"><ImageWithFallback src={isBusiness ? pageImages.businessFulfilment.src : pageImages.customerDelivery.src} alt={isBusiness ? pageImages.businessFulfilment.alt : pageImages.customerDelivery.alt} className="aspect-[4/3] w-full object-cover brightness-[1.12] contrast-[1.05] saturate-[1.08]" loading="lazy"/><div className="absolute inset-x-0 bottom-0 h-[46%] bg-gradient-to-t from-[#04162f]/85 via-[#04162f]/30 to-transparent"/><p className="absolute bottom-6 left-6 right-6 max-w-lg text-xl font-bold text-white drop-shadow-md sm:bottom-8 sm:left-8 sm:text-2xl">{ui.imageCaption}</p></div>
      <div><p className="text-xs font-bold uppercase tracking-[.18em] text-primary">{ui.supportLabel}</p><h2 className="mt-4 text-3xl font-bold tracking-[-.04em] sm:text-4xl lg:text-5xl">{ui.routeTitle}</h2><div className="mt-8 space-y-4"><div className="rounded-2xl border p-5"><div className="flex items-center gap-3"><Store className="text-primary" size={20}/><h3 className="font-bold">{ui.chooseTitle}</h3></div><p className="mt-3 text-sm leading-6 text-muted-foreground">{ui.chooseText}</p></div><div className="rounded-2xl border border-primary/20 bg-primary/[.04] p-5"><div className="flex items-center gap-3"><Shield className="text-primary" size={20}/><h3 className="font-bold">{ui.recordTitle}</h3></div><p className="mt-3 text-sm leading-6 text-muted-foreground">{ui.recordText}</p></div></div></div>
    </div></section>

    <section className="bg-[#071a32] px-4 py-14 text-center text-white sm:px-6 sm:py-20"><div className="mx-auto max-w-3xl"><h2 className="text-3xl font-bold tracking-[-.04em] sm:text-5xl">{ui.ready}</h2><p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-white/60 sm:text-lg">{ui.readyText}</p><Button className="mt-8 rounded-full px-6" onClick={() => onNavigate(page.register)}>{page.primary}<ArrowRight size={16}/></Button></div></section>
  </motion.main>;
}
