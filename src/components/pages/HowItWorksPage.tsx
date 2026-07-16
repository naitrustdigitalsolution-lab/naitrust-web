import { ArrowRight, CheckCircle2, FileCheck2, Handshake, ShieldCheck, UserCheck } from 'lucide-react';
import { motion } from 'motion/react';
import { SEOHead } from '../utility/SEOHead';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { openWaitlistModal } from '../modals/WaitlistModal';

interface HowItWorksPageProps { onNavigate: (page: string) => void }

const steps = [
  { number: '01', icon: Handshake, title: 'Create the deal record', text: 'Bring the buyer and seller into one place and record the amount, roles, timeline, and what each side expects.' },
  { number: '02', icon: UserCheck, title: 'Know who is involved', text: 'Use the appropriate individual or business verification when it becomes available, based on the account and transaction risk.' },
  { number: '03', icon: FileCheck2, title: 'Agree before moving forward', text: 'Both sides review the terms, delivery conditions, required evidence, and what completion should look like.' },
  { number: '04', icon: CheckCircle2, title: 'Keep one clear record', text: 'Payment status, receipts, delivery evidence, approvals, and issues remain connected to the transaction.' },
];

export function HowItWorksPage({ onNavigate }: HowItWorksPageProps) {
  return (
    <div className="min-h-screen bg-background">
      <SEOHead title="How Naitrust Works" description="See the simple transaction workflow Naitrust is building for safer deals between individuals and businesses." canonicalPath="/how-it-works" />

      <section className="relative overflow-hidden bg-[#031335] dark:bg-[#0A0E1A] px-4 py-20 text-white sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="relative mx-auto max-w-5xl text-center">
          <Badge className="mb-5 border border-white/15 bg-white/10 text-white hover:bg-white/10">Experience</Badge>
          <h1 className="text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl">A clearer way to complete serious deals</h1>
          <p className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-blue-100">Naitrust is building one shared transaction record for identity, agreed terms, payment status, evidence, and completion—so buyers and businesses do not have to rely on scattered chats and screenshots.</p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row"><Button size="lg" onClick={openWaitlistModal} className="h-12 px-7">Join the waiting list <ArrowRight /></Button><Button size="lg" variant="outline" onClick={() => onNavigate('about')} className="h-12 border-white/30 bg-transparent px-7 text-white hover:bg-white/10 hover:text-white">Why Naitrust</Button></div>
        </motion.div>
      </section>

      <section className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-3xl"><p className="font-semibold text-primary">The intended workflow</p><h2 className="mt-3 text-3xl font-bold sm:text-4xl">Four steps. One trusted record.</h2><p className="mt-4 text-lg leading-8 text-muted-foreground">The final product is still being prepared for launch. This is the simple experience Naitrust is working toward.</p></div>
          <div className="mt-10 grid gap-5 md:grid-cols-2">
            {steps.map(({ number, icon: Icon, title, text }, index) => (
              <motion.article key={number} initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.06 }} className="group relative overflow-hidden rounded-3xl border bg-card p-7 shadow-sm transition hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg">
                <span className="absolute right-5 top-3 text-6xl font-black text-primary/5">{number}</span><div className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary"><Icon size={24} /></div><h3 className="relative mt-6 text-xl font-bold">{title}</h3><p className="relative mt-3 max-w-md text-sm leading-7 text-muted-foreground">{text}</p>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-muted/40 px-4 py-20 sm:px-6 lg:px-8"><div className="mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-[1fr_1.1fr]"><div><div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-white"><ShieldCheck size={28} /></div><h2 className="mt-6 text-3xl font-bold">Built for both sides of the deal</h2><p className="mt-4 leading-7 text-muted-foreground">Buyers need confidence before paying. Honest businesses need a better way to prove reliability. Naitrust is designed to give both sides the same clear record.</p></div><div className="grid gap-4 sm:grid-cols-2"><div className="rounded-2xl border bg-background p-6"><h3 className="font-bold">For individuals</h3><ul className="mt-4 space-y-3 text-sm text-muted-foreground"><li>Know who you are dealing with</li><li>See what was agreed</li><li>Keep payment and delivery evidence</li></ul></div><div className="rounded-2xl border bg-background p-6"><h3 className="font-bold">For businesses</h3><ul className="mt-4 space-y-3 text-sm text-muted-foreground"><li>Show a verified business identity</li><li>Set clear expectations</li><li>Build reputation from completed deals</li></ul></div></div></div></section>

      <section className="px-4 py-20 text-center sm:px-6"><div className="mx-auto max-w-3xl rounded-3xl bg-primary px-6 py-12 text-white sm:px-10"><h2 className="text-3xl font-bold">Help shape Naitrust before launch</h2><p className="mx-auto mt-4 max-w-xl text-blue-50">Tell us how you buy, sell, or work with new counterparties. Early feedback will help us prioritise the safest and most useful launch experience.</p><Button size="lg" onClick={openWaitlistModal} className="mt-7 h-12 bg-white px-7 text-primary hover:bg-blue-50">Join the waiting list <ArrowRight /></Button></div></section>
    </div>
  );
}
