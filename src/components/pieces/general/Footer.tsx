import { type FormEvent } from 'react';
import { Instagram, Twitter, Linkedin, Mail, Send } from 'lucide-react';
import { NaitrustLogo } from '../../utility/NaitrustLogo';
import { openWaitlistModal } from '../../modals/waitlist-events';
import { useTranslation } from 'react-i18next';

interface FooterProps {
  onNavigate: (page: string) => void;
}

export function Footer({ onNavigate }: FooterProps) {
  const { t } = useTranslation('common');
  function handleSubscribe(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const email = String(formData.get('subscriberEmail') || '').trim();

    onNavigate(email ? `/waitlist?email=${encodeURIComponent(email)}` : '/waitlist');
  }

  const footerGroups = [
    {
      id: 'platform', title: t('platform'),
      links: [
        { label: t('exploreChina'), page: 'market' }, { label: t('sourceYourself'), page: 'customer' }, { label: t('protectedOrders'), page: 'register', modal: true }, { label: t('verifiedAgents'), page: '/partners' }, { label: t('earlyAccess'), page: 'register', modal: true },
      ],
    },
    {
      id: 'partners', title: t('partners'),
      links: [
        { label: t('becomeAgent'), page: '/partners/agent/apply' }, { label: t('registerSupplier'), page: '/partners/supplier/apply' }, { label: t('becomeLogistics'), page: '/partners/logistics/apply' }, { label: t('partnerLogin'), page: '/partners/login' },
      ],
    },
    {
      id: 'company', title: t('company'),
      links: [
        { label: t('aboutUs'), page: 'about' }, { label: t('blog'), page: 'blog' }, { label: t('help'), page: 'help' }, { label: t('faqs'), page: 'faqs' }, { label: t('report'), page: 'report-fraud' }, { label: t('giveFeedback'), page: 'feedback' }, { label: t('contactUs'), page: 'contact' },
      ],
    },
    {
      id: 'legal', title: t('legal'),
      links: [
        { label: t('terms'), page: 'terms' }, { label: t('privacy'), page: 'privacy' }, { label: t('verification'), page: 'verification-policy' }, { label: t('compliance'), page: 'compliance' },
      ],
    },
  ];

  return (
    <footer className="relative border-t border-white/10 bg-[#04162f] py-8 text-white">
      <div className="relative z-10 mx-auto max-w-[90rem] px-4 sm:px-6 lg:px-8">
        <div className="grid gap-7 lg:grid-cols-[1.15fr_2fr]">
          <div className="max-w-sm">
            <div className="mb-3">
              <NaitrustLogo size="sm" showText={true} textColor="text-white" />
            </div>
            <p className="max-w-xs text-sm leading-6 text-white/60">{t('footerText')}</p>
            <div className="mt-4 flex gap-2">
              <a aria-label="Naitrust on Instagram" href="https://instagram.com/naitrust_digitalsolutions" target="_blank" rel="noopener noreferrer" className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-white/60 transition-colors hover:bg-white/10 hover:text-white">
                <Instagram size={16} />
              </a>
              <a aria-label="Naitrust on X" href="https://x.com/naitrust14419" target="_blank" rel="noopener noreferrer" className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-white/60 transition-colors hover:bg-white/10 hover:text-white">
                <Twitter size={16} />
              </a>
              <a aria-label="Naitrust on LinkedIn" href="https://www.linkedin.com/in/naitrust-digital-solutions" target="_blank" rel="noopener noreferrer" className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-white/60 transition-colors hover:bg-white/10 hover:text-white">
                <Linkedin size={16} />
              </a>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-x-6 gap-y-5 sm:grid-cols-4">
            {footerGroups.map((group) => (
              <div key={group.title}>
                <h4 className="mb-3 text-xs font-bold uppercase tracking-wider text-white">{group.title}</h4>
                <ul className="space-y-2 text-sm text-white/60">
                  {group.links.map((link) => (
                    <li key={`${group.title}-${link.label}`}>
                      <button
                        onClick={() => ('modal' in link && link.modal ? openWaitlistModal() : onNavigate(link.page))}
                        className="text-left transition-colors hover:text-white"
                      >
                        {link.label}
                      </button>
                    </li>
                  ))}
                  {group.id === 'legal' && (
                    <li>
                      <button 
                        onClick={() => {
                          if ((window as any).openCookiePreferences) {
                            (window as any).openCookiePreferences();
                          }
                        }} 
                        className="text-left transition-colors hover:text-white"
                      >
                        {t('cookiePreferences')}
                      </button>
                    </li>
                  )}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-7 flex flex-col gap-4 border-t border-white/10 pt-5 lg:flex-row lg:items-center lg:justify-between">
          <div><h4 className="text-sm font-semibold text-white">{t('updatesTitle')}</h4><p className="mt-1 text-xs text-white/50">{t('updatesText')}</p></div>
            <form onSubmit={handleSubscribe} className="flex w-full max-w-md gap-2">
              <label className="sr-only" htmlFor="footer-subscriber-email">{t('email')}</label>
              <input
                id="footer-subscriber-email"
                name="subscriberEmail"
                type="email"
                required
                placeholder="you@example.com"
                className="min-h-10 min-w-0 flex-1 rounded-lg border border-white/15 bg-white px-4 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-primary focus:ring-4 focus:ring-primary/20"
              />
              <button
                type="submit"
                className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md bg-primary px-4 text-sm font-semibold text-white transition hover:bg-primary/90"
              >
                {t('waitlist')}
                <Send size={16} />
              </button>
            </form>
        </div>

        <div className="mt-5 flex flex-col gap-2 border-t border-white/10 pt-4 text-xs text-white/45 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p>
              © {new Date().getFullYear()} Naitrust Digital Solutions Ltd. {t('rights')}
            </p>
            <p className="mt-1">RC 9001392 · {t('registered')}</p>
          </div>
          <div className="flex items-center gap-2">
            <Mail size={14} />
            <a href="mailto:contact@naitrust.com" className="transition-colors hover:text-primary">
              contact@naitrust.com
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
