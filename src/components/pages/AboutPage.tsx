import { Shield, Users, Target, Eye, CheckCircle, Building2, Globe, Award } from 'lucide-react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { motion } from 'motion/react';
import { SEOHead } from '../utility/SEOHead';
import { openWaitlistModal } from '../modals/WaitlistModal';

interface AboutPageProps {
  onNavigate: (page: string, params?: any) => void;
}

export function AboutPage({ onNavigate }: AboutPageProps) {
  return (
    <div className="min-h-screen bg-muted/30">
      <SEOHead
        title="About Us — Naitrust"
        description="Naitrust is building trust infrastructure for Nigerian property transactions, with shared records for participants, agreements, payments, documents, and milestones."
        canonicalPath="/about"
      />

      {/* Hero Section */}
       <section className="relative overflow-hidden bg-[#031335] dark:bg-[#0A0E1A] px-4 py-20 text-white sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="relative mx-auto max-w-5xl text-center">
          <Badge className="mb-5 border border-white/15 bg-white/10 text-white hover:bg-white/10">About Naitrust</Badge>
          <h1 className="text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl">Trust Infrastructure for<br />Nigerian Real Estate</h1>
          <p className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-blue-100">
            Naitrust Digital Solutions Limited is building a clearer way for property buyers, sellers, agents, developers, and real estate companies to record agreements, payments, documents, milestones, and issues in one place.
          </p>
        </motion.div>
      </section>

      {/* Mission, Vision, Values */}
      <section className="py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Target,
                title: 'Our Mission',
                text: 'To support safer Nigerian property transactions by giving participants one shared place to record terms, identities, payments, documents, milestones, and evidence.',
              },
              {
                icon: Eye,
                title: 'Our Vision',
                text: 'A Nigeria where property participants can move from informal conversations into a clear, accessible, and verifiable transaction record.',
              },
              {
                icon: Shield,
                title: 'Our Values',
                text: 'Clarity, integrity, and responsible protection. We help participants keep evidence visible and make each stage of a property transaction easier to understand.',
              },
            ].map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className="p-8 h-full text-center hover:shadow-lg transition-shadow">
                  <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <item.icon size={28} className="text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold mb-3">{item.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{item.text}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* The Problem We Solve */}
      <section className="py-16 bg-muted/30">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-2xl sm:text-3xl font-bold mb-4">The Problem We Solve</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Nigerian property transactions can involve large payments, multiple representatives, informal conversations, and documents spread across chats and email. That makes it difficult to prove who said what, what was paid, and what should happen next.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6">
            <Card className="p-6">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Users size={20} className="text-primary" />
                For Buyers
              </h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2"><CheckCircle size={14} className="text-primary mt-0.5 shrink-0" /> Start a shared deal room before money moves</li>
                <li className="flex items-start gap-2"><CheckCircle size={14} className="text-primary mt-0.5 shrink-0" /> Confirm the seller, agent, or developer, the terms, milestones, and document requirements</li>
                <li className="flex items-start gap-2"><CheckCircle size={14} className="text-primary mt-0.5 shrink-0" /> Track payment status and release conditions with clear evidence</li>
                <li className="flex items-start gap-2"><CheckCircle size={14} className="text-primary mt-0.5 shrink-0" /> Raise an issue with structured records instead of scattered chats</li>
              </ul>
            </Card>
            <Card className="p-6">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Building2 size={20} className="text-primary" />
                For Sellers
              </h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2"><CheckCircle size={14} className="text-primary mt-0.5 shrink-0" /> Show readiness with verified identity, business information, and deal history</li>
                <li className="flex items-start gap-2"><CheckCircle size={14} className="text-primary mt-0.5 shrink-0" /> Agree terms in one place and attach property documents, milestone evidence, and completion records</li>
                <li className="flex items-start gap-2"><CheckCircle size={14} className="text-primary mt-0.5 shrink-0" /> Make payment release and dispute steps clearer for both sides</li>
                <li className="flex items-start gap-2"><CheckCircle size={14} className="text-primary mt-0.5 shrink-0" /> Build a history from completed property transactions</li>
              </ul>
            </Card>
          </div>
        </div>
      </section>

      {/* How Verification Works */}
      <section className="py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-2xl sm:text-3xl font-bold mb-4">How a Safer Transaction Works</h2>
            <p className="text-muted-foreground">
              A simple 3-step flow that helps two parties move from agreement to completion with clarity.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: '1', title: 'Create the Property Transaction', desc: 'Record the property, participants, amount, terms, timeline, documents, and required evidence.' },
              { step: '2', title: 'Verify and Align', desc: 'Each side confirms identity, business details, and transaction expectations before payment or release happens.' },
              { step: '3', title: 'Complete with Evidence', desc: 'Payments, property documents, milestones, approvals, and issue records stay attached to the transaction for participants to review.' },
            ].map((item, i) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center"
              >
                <div className="w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center mx-auto mb-4 text-lg font-bold">
                  {item.step}
                </div>
                <h3 className="font-semibold mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Company Info */}
      <section className="py-16 bg-muted/30">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-2xl sm:text-3xl font-bold mb-4">Company Information</h2>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <Building2 size={20} className="text-primary" />
                <h3 className="font-semibold">Legal Details</h3>
              </div>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p><strong>Company:</strong> Naitrust Digital Solutions Limited</p>
                <p><strong>RC Number:</strong> 9001392</p>
                <p><strong>Registered under:</strong> CAMA 2020, Nigeria</p>
                <p><strong>Headquarters:</strong> Lagos, Nigeria</p>
              </div>
            </Card>
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <Globe size={20} className="text-primary" />
                <h3 className="font-semibold">Get in Touch</h3>
              </div>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p><strong>Email:</strong> contact@naitrust.com</p>
                <p><strong>Phone:</strong> +234 707 587 3258</p>
                <p><strong>Website:</strong> <a href="https://www.naitrust.com" className="text-primary hover:underline">www.naitrust.com</a></p>
                <p><strong>Hours:</strong> Mon–Fri, 9 AM – 5 PM WAT</p>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Award size={48} className="text-primary mx-auto mb-4" />
            <h2 className="text-2xl sm:text-3xl font-bold mb-4">
              Help Shape Better Property Transactions
            </h2>
            <p className="text-muted-foreground mb-8">
              Join Naitrust early access if you want a clearer way to record property participants, agreements, payments, documents, milestones, and supporting evidence in Nigeria.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button size="lg" onClick={openWaitlistModal}>
                Join Property Early Access
              </Button>
              <Button size="lg" variant="outline" onClick={() => onNavigate('register-business')}>
                Join as a Property Company
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
