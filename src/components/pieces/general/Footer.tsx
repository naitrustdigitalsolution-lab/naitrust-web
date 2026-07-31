import { type FormEvent, useState } from 'react';
import { Instagram, Twitter, Linkedin, Mail, MapPin, Phone, Send, ShieldCheck, Landmark, FileCheck, Heart } from 'lucide-react';
import { NaitrustLogo } from '../../utility/NaitrustLogo';
import { subscribe } from '../../../services/publicService';
import { openWaitlistModal } from '../../modals/WaitlistModal';
import { toast } from 'sonner';

interface FooterProps {
  onNavigate: (page: string) => void;
}

export function Footer({ onNavigate }: FooterProps) {
  const [isSubscribing, setIsSubscribing] = useState(false);
  async function handleSubscribe(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const email = String(formData.get('subscriberEmail') || '').trim();

    if (!email) return;

    setIsSubscribing(true);
    try {
      await subscribe({ email });
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
        { label: 'Send Money', page: 'register', modal: true },
        { label: 'Protect a Payment', page: 'register', modal: true },
        { label: 'Join Early Access', page: 'register', modal: true },
        { label: 'For Businesses', page: 'register-business', modal: true },
      ],
    },
    {
      title: 'Company',
      links: [
        { label: 'About Us', page: 'about' },
        { label: 'Blog', page: 'blog' },
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
      title: 'Know who you trade with',
      text: 'Review customer, supplier, and participant details before an important payment moves.',
    },
    {
      icon: Landmark,
      title: 'Regulated money movement',
      text: 'Licensed financial partners handle payment movement while Naitrust manages the business workflow.',
    },
    {
      icon: FileCheck,
      title: 'Order and payment evidence',
      text: 'Terms, invoices, receipts, delivery evidence, and issue notes stay connected to the transaction.',
    },
  ];

  return (
    <footer className="relative overflow-hidden bg-[#04162f] pb-10 pt-8 text-white">
      <div className="relative z-10 mx-auto max-w-440 px-4 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[1.35fr_2.65fr] mb-10">
          {/* Brand */}
          <div className="lg:max-w-lg">
            <div className="mb-4">
              <NaitrustLogo size="postMd" showText={true} textColor="text-white" />
            </div>
            <div className="mb-4 text-sm leading-7 text-white/80 lg:text-md">
              <p>
                Naitrust is the everyday business account for Nigerian traders and growing businesses—receive sales, pay trusted suppliers instantly, protect important orders, and build a stronger payment history in one place.
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

          <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
            {footerGroups.map((group) => (
              <div key={group.title}>
                <h4 className="font-semibold text-md lg:text-lg mb-4">{group.title}</h4>
                <ul className="space-y-2 text-sm lg:text-md text-white/80">
                  {group.links.map((link) => (
                    <li key={`${group.title}-${link.label}`}>
                      <button
                        onClick={() => ('modal' in link && link.modal ? openWaitlistModal() : onNavigate(link.page))}
                        className="text-left hover:text-white transition-colors"
                      >
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
                  Practical payment guidance, product updates, and early-access news for Nigerian businesses.
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
