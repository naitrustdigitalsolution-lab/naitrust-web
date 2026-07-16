import { type FormEvent, useState } from 'react';
import { Instagram, Twitter, Linkedin, Mail, MapPin, Phone, Send, ShieldCheck, Landmark, FileCheck, Heart, Apple, Play } from 'lucide-react';
import { NaitrustLogo } from '../../utility/NaitrustLogo';
import { useHomeStore } from '../../../libs/store/home.store';
import { toast } from 'sonner';

interface FooterProps {
  onNavigate: (page: string) => void;
}

export function Footer({ onNavigate }: FooterProps) {
  const submitPublicForm = useHomeStore((state) => state.submit);
  const [isSubscribing, setIsSubscribing] = useState(false);
  async function handleSubscribe(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const email = String(formData.get('subscriberEmail') || '').trim();

    if (!email) return;

    setIsSubscribing(true);
    try {
      await submitPublicForm({ type: 'subscription', email, consent: true, source: 'footer_newsletter' });
      event.currentTarget.reset();
      toast.success('You are subscribed to Naitrust updates.');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Could not subscribe.');
    } finally {
      setIsSubscribing(false);
    }
  }

  const footerGroups = [
    {
      title: 'Platform',
      links: [
        { label: 'How It Works', page: 'how-it-works' },
        { label: 'Use Cases', page: 'use-cases' },
        { label: 'Start a Safe Deal', page: 'register' },
        { label: 'Register Your Business', page: 'register-business' },
      ],
    },
    {
      title: 'Use Cases',
      links: [
        { label: 'Supplier orders', page: '/use-cases/supplier-orders' },
        { label: 'Contractor work', page: '/use-cases/contractor-projects' },
        { label: 'Social storefront sales', page: '/use-cases/social-commerce' },
        { label: 'High-value purchases', page: '/use-cases/high-value-personal-purchases' },
        { label: 'Freelance and agency work', page: '/use-cases/freelance-agency-work' },
      ],
    },
    {
      title: 'Company',
      links: [
        { label: 'About Us', page: 'about' },
        { label: 'Help Center', page: 'help' },
        { label: 'FAQs', page: 'faqs' },
        { label: 'Report a Concern', page: 'report-fraud' },
        { label: 'Give Feedback', page: 'feedback' },
        { label: 'Contact Us', page: 'contact' },
      ],
    },
    {
      title: 'Legal',
      links: [
        { label: 'Terms of Service', page: 'terms' },
        { label: 'Privacy Policy', page: 'privacy' },
        { label: 'Verification Policy', page: 'verification-policy' },
        { label: 'NDPR Compliance', page: 'compliance' },
      ],
    },
  ];

  const trustNotes = [
    {
      icon: ShieldCheck,
      title: 'Verified transaction identity',
      text: 'Business, buyer, and deal information are checked before money or goods move.',
    },
    {
      icon: Landmark,
      title: 'Regulated payment rails',
      text: 'Payment flows are designed to work through licensed financial partners, with clear release and refund instructions.',
    },
    {
      icon: FileCheck,
      title: 'Evidence for every deal',
      text: 'Agreements, receipts, delivery proof, chat records, and dispute notes stay tied to the transaction.',
    },
  ];

  const appStoreLinks = [
    {
      label: 'App Store',
      eyebrow: 'Get it from',
      href: '#',
      icon: Apple,
    },
    {
      label: 'Google Play',
      eyebrow: 'Get it on',
      href: '#',
      icon: Play,
    },
  ];

  return (
    <footer 
      className="bg-[#031335] dark:bg-[#0A0E1A] text-white py-12 border-t border-border/50"
      // className="relative bg-linear-to-br from-blue-10 via-background to-primary/5 pt-4 pb-8 sm:pb-12 overflow-hidden"
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='1200' height='800' viewBox='0 0 1200 800' xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3Cpattern id='nigeria-verification' x='0' y='0' width='300' height='300' patternUnits='userSpaceOnUse'%3E%3Cpath d='M50 50 L100 100 L150 50 L200 100' stroke='%231e90ff' stroke-width='2' stroke-opacity='0.04' fill='none'/%3E%3Cpath d='M100 150 L150 200 L200 150 L250 200' stroke='%230b2b45' stroke-width='2' stroke-opacity='0.04' fill='none'/%3E%3Ccircle cx='150' cy='150' r='30' fill='%231e90ff' fill-opacity='0.03'/%3E%3Cpath d='M120 120 L150 150 L180 120' stroke='%231e90ff' stroke-width='3' stroke-opacity='0.05' fill='none'/%3E%3Cpath d='M50 200 L100 250 L150 200 L200 250' stroke='%231e90ff' stroke-width='2' stroke-opacity='0.04' fill='none'/%3E%3Cpath d='M100 50 L150 100 L200 50 L250 100' stroke='%230b2b45' stroke-width='2' stroke-opacity='0.04' fill='none'/%3E%3Cpath d='M150 50 L200 100 L250 50 L300 100' stroke='%231e90ff' stroke-width='2' stroke-opacity='0.04' fill='none'/%3E%3Cpath d='M50 100 L100 150 L150 100 L200 150' stroke='%230b2b45' stroke-width='2' stroke-opacity='0.04' fill='none'/%3E%3C/pattern%3E%3C/defs%3E%3Crect width='100%25' height='100%25' fill='url(%23nigeria-verification)'/%3E%3Cpath d='M200 200 L250 250 L300 200' stroke='%231e90ff' stroke-width='3' stroke-opacity='0.06' fill='none'/%3E%3Cpath d='M400 300 L450 350 L500 300' stroke='%231e90ff' stroke-width='3' stroke-opacity='0.06' fill='none'/%3E%3Cpath d='M600 200 L650 250 L700 200' stroke='%231e90ff' stroke-width='3' stroke-opacity='0.06' fill='none'/%3E%3Cpath d='M800 400 L850 450 L900 400' stroke='%231e90ff' stroke-width='3' stroke-opacity='0.06' fill='none'/%3E%3Cpath d='M1000 250 L1050 300 L1100 250' stroke='%231e90ff' stroke-width='3' stroke-opacity='0.06' fill='none'/%3E%3Ccircle cx='300' cy='400' r='40' fill='%231e90ff' fill-opacity='0.03'/%3E%3Ccircle cx='600' cy='500' r='40' fill='%230b2b45' fill-opacity='0.03'/%3E%3Ccircle cx='900' cy='300' r='40' fill='%231e90ff' fill-opacity='0.03'/%3E%3C/svg%3E")`,
        backgroundSize: '800px 800px',
        backgroundPosition: 'center',
        backgroundRepeat: 'repeat',
        opacity: 1,
      }}
    >
      <div className="max-w-440 mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[1.35fr_2.65fr] mb-10 h-[550px]">
          {/* Brand */}
          <div className="max-w-md">
            <div className="mb-4">
              <NaitrustLogo size="postMd" showText={true} textColor="text-white" />
            </div>
            <div className="mb-4 space-y-3 text-md leading-7 text-white/80">
              <p>
                Naitrust is the safer way for Nigerians to buy, sell, pay, and deliver with confidence. We help businesses and customers move beyond blind transfers by putting every deal inside a shared, traceable transaction room.
              </p>
              <p>
                From seller verification to clear terms, payment tracking, delivery evidence, and dispute-ready records, Naitrust gives both sides the confidence to say yes to bigger deals with less worry.
              </p>
            </div>
            <div className="space-y-3 text-sm text-white/70 mb-5">
              <div className="flex items-start gap-3">
                <MapPin size={18} className="mt-0.5 shrink-0 text-primary" />
                <span>Lagos, Nigeria</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone size={18} className="shrink-0 text-primary" />
                <a href="tel:+2347075873258" className="hover:text-white transition-colors">
                  +234 707 587 3258
                </a>
              </div>
              <div className="flex items-center gap-3">
                <Mail size={18} className="shrink-0 text-primary" />
                <a href="mailto:contact@naitrust.com" className="hover:text-white transition-colors">
                  contact@naitrust.com
                </a>
              </div>
            </div>
            <div className="mb-5 flex flex-wrap gap-3">
              {appStoreLinks.map((store) => {
                const Icon = store.icon;

                return (
                  <a
                    key={store.label}
                    href={store.href}
                    aria-label={`${store.eyebrow} ${store.label}`}
                    className="inline-flex min-h-12 items-center gap-3 rounded-md border border-white/15 bg-black px-4 py-2 text-white shadow-sm transition hover:-translate-y-0.5 hover:border-white/30 hover:bg-zinc-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  >
                    <Icon size={24} className="shrink-0" fill={store.label === 'App Store' ? 'currentColor' : 'none'} />
                    <span className="leading-none">
                      <span className="block text-[10px] font-medium uppercase tracking-[0.08em] text-white/70">
                        {store.eyebrow}
                      </span>
                      <span className="mt-1 block text-sm font-semibold text-white">
                        {store.label}
                      </span>
                    </span>
                  </a>
                );
              })}
            </div>
            <div className="flex gap-3">
              <a href="https://instagram.com/naitrust_digitalsolutions" target="_blank" rel="noopener noreferrer" className="w-8 h-8 bg-white/10 hover:bg-white/20 rounded-lg flex items-center justify-center transition-colors">
                <Instagram size={16} />
              </a>
              <a href="https://x.com/naitrust14419" target="_blank" rel="noopener noreferrer" className="w-8 h-8 bg-white/10 hover:bg-white/20 rounded-lg flex items-center justify-center transition-colors">
                <Twitter size={16} />
              </a>
              <a href="https://www.linkedin.com/in/naitrust-digital-solutions" target="_blank" rel="noopener noreferrer" className="w-8 h-8 bg-white/10 hover:bg-white/20 rounded-lg flex items-center justify-center transition-colors">
                <Linkedin size={16} />
              </a>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {footerGroups.map((group) => (
              <div key={group.title}>
                <h4 className="font-semibold text-lg mb-4">{group.title}</h4>
                <ul className="space-y-2 text-md text-white/80">
                  {group.links.map((link) => (
                    <li key={`${group.title}-${link.label}`}>
                      <button onClick={() => onNavigate(link.page)} className="text-left hover:text-white transition-colors">
                        {link.label}
                      </button>
                    </li>
                  ))}
                  {group.title === 'Legal' && (
                    <li>
                      <button 
                        onClick={() => {
                          if ((window as any).openCookiePreferences) {
                            (window as any).openCookiePreferences();
                          }
                        }} 
                        className="text-left hover:text-white transition-colors"
                      >
                        Cookie Preferences
                      </button>
                    </li>
                  )}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mb-8 grid gap-6 py-6 lg:grid-cols-[1.6fr_1fr] lg:items-start">
          <div>
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-primary">
              Trust infrastructure
            </p>
            <div className="grid gap-4 md:grid-cols-3">
              {trustNotes.map((note) => {
                const Icon = note.icon;

                return (
                  <div key={note.title} className="flex gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-primary/25 text-primary">
                      <Icon size={16} />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-white">{note.title}</h4>
                      <p className="mt-1 text-xs leading-5 text-white/60">{note.text}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="lg:border-l lg:border-white/10 lg:pl-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between lg:block">
              <div>
                <h4 className="text-base font-semibold">Subscribe to Naitrust updates</h4>
                <p className="mt-1 max-w-sm text-xs leading-5 text-white/60">
                  Product updates, safer-commerce guides, and early access notes.
                </p>
              </div>
            </div>
            <form onSubmit={handleSubscribe} className="mt-4 flex flex-col gap-2 sm:flex-row lg:flex-col xl:flex-row">
              <label className="sr-only" htmlFor="footer-subscriber-email">Email address</label>
              <input
                id="footer-subscriber-email"
                name="subscriberEmail"
                type="email"
                required
                placeholder="you@example.com"
                className="min-h-10 flex-1 rounded-full border border-white/15 bg-white px-3 text-sm text-[#0b2b45] outline-none placeholder:text-slate-400 focus:border-primary focus:ring-4 focus:ring-primary/20"
              />
              <button
                type="submit"
                disabled={isSubscribing}
                className="inline-flex min-h-10 items-center justify-center gap-2 rounded-full bg-primary px-4 text-sm font-semibold text-white transition hover:bg-primary/90"
              >
                {isSubscribing ? 'Subscribing…' : 'Subscribe'}
                <Send size={16} />
              </button>
            </form>
          </div>
        </div>

        <div className="pt-6 pb-2 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-center md:text-left">
            <p className="text-md text-white/60">
              © {new Date().getFullYear()} Naitrust Digital Solutions Ltd. All rights reserved.
            </p>
            <p className="mt-1 flex flex-wrap items-center justify-center gap-1 text-sm text-white/40 md:justify-start">
              RC Number: 9001392 &middot; Registered in Nigeria under CAMA 2020
              <span className="hidden sm:inline">&middot;</span>
              <span className="inline-flex items-center gap-1">
                Made with <Heart size={13} className="fill-primary text-primary" /> from Nigeria
              </span>
            </p>
          </div>
          <div className="flex items-center gap-2 text-md text-white/60">
            <Mail size={16} />
            <a href="mailto:contact@naitrust.com" className="hover:text-white transition-colors">
              contact@naitrust.com
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
