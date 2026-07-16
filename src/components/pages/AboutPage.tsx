import { Shield, Users, Target, Eye, CheckCircle, Building2, Globe, Award } from 'lucide-react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { motion } from 'motion/react';
import { SEOHead } from '../utility/SEOHead';

interface AboutPageProps {
  onNavigate: (page: string, params?: any) => void;
}

export function AboutPage({ onNavigate }: AboutPageProps) {
  return (
    <div className="min-h-screen bg-muted/30">
      <SEOHead
        title="About Us — Naitrust"
        description="Naitrust Digital Solutions Limited helps buyers and sellers in Nigeria run safer transactions with shared deal rooms, verification, evidence, and protected payment workflows."
        canonicalPath="/about"
      />

      {/* Hero Section */}
       <section className="relative overflow-hidden bg-[#031335] dark:bg-[#0A0E1A] px-4 py-20 text-white sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="relative mx-auto max-w-5xl text-center">
          <Badge className="mb-5 border border-white/15 bg-white/10 text-white hover:bg-white/10">About Naitrust</Badge>
          <h1 className="text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl">We’re Building Safer Transactions<br />for Nigerian Commerce</h1>
          <p className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-blue-100">
            Naitrust Digital Solutions Limited is a Nigerian technology company that helps two people or parties coordinate a transaction with clarity — from agreement and verification to payment status, proof of delivery, and dispute handling.
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
                text: 'To make high-value transactions in Nigeria safer by giving buyers and sellers one shared space to agree terms, verify each other, protect payment, and keep evidence in one place.',
              },
              {
                icon: Eye,
                title: 'Our Vision',
                text: 'A Nigeria where every buyer and seller can move from chat or informal agreement into a trusted transaction flow with confidence, clarity, and proof.',
              },
              {
                icon: Shield,
                title: 'Our Values',
                text: 'Clarity, integrity, and protection. We help people transact honestly, keep evidence visible, and make every step of a deal easier to understand and trust.',
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
              In Nigeria, many transactions still move through chat, social media, and informal agreements where trust is fragile. A buyer sends money, a seller sends goods or service, and both sides are left hoping the other will follow through.
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
                <li className="flex items-start gap-2"><CheckCircle size={14} className="text-primary mt-0.5 shrink-0" /> Confirm the seller, terms, delivery steps, and proof requirements</li>
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
                <li className="flex items-start gap-2"><CheckCircle size={14} className="text-primary mt-0.5 shrink-0" /> Agree terms in one place and attach proof of delivery or completion</li>
                <li className="flex items-start gap-2"><CheckCircle size={14} className="text-primary mt-0.5 shrink-0" /> Make payment release and dispute steps clearer for both sides</li>
                <li className="flex items-start gap-2"><CheckCircle size={14} className="text-primary mt-0.5 shrink-0" /> Build a reputation from completed safe deals</li>
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
              { step: '1', title: 'Create the Deal Room', desc: 'The buyer and seller open a shared transaction room with the amount, terms, timeline, and required proof.' },
              { step: '2', title: 'Verify and Align', desc: 'Each side confirms identity, business details, and transaction expectations before payment or release happens.' },
              { step: '3', title: 'Complete with Evidence', desc: 'Payment status, delivery proof, approvals, and issue steps stay attached to the deal for both parties to review.' },
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
              Ready to Build Trust?
            </h2>
            <p className="text-muted-foreground mb-8">
              Join Naitrust today if you want a clearer, safer way to coordinate a deal between two people, two businesses, or a buyer and seller in Nigeria.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button size="lg" onClick={() => onNavigate('search')}>
                Start a Safe Deal
              </Button>
              <Button size="lg" variant="outline" onClick={() => onNavigate('register-business')}>
                Join as a Seller
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
