import { NaitrustLogo } from '../../utility/NaitrustLogo';

export function Footer({ onNavigate }: { onNavigate: (page: string) => void }) {
  const groups = [
    { title: 'EXPLORE', links: [['For individuals', 'customer'], ['For businesses', 'business'], ['About Naitrust', 'about'], ['Our journal', 'blog'], ['Join early access', '/waitlist']] },
    { title: 'LET’S TALK', links: [['Contact us', 'contact'], ['Help centre', 'help'], ['FAQs', 'faqs'], ['Report a concern', '/report-concern'], ['Partnerships', 'contact']] },
    { title: 'THE DETAILS', links: [['Terms of service', 'terms'], ['Privacy policy', 'privacy'], ['Verification', 'verification-policy'], ['Compliance & trust', 'compliance']] },
  ];
  return <footer className="nt-footer"><div className="nt-container"><div className="nt-footer-top"><div className="nt-footer-brand"><button onClick={() => onNavigate('home')} aria-label="Naitrust home"><NaitrustLogo size="md" textColor="text-[#142441]" /></button><p>A little more confidence in every deal.<br />Secure payments, built around buyers and sellers.</p><a href="mailto:contact@naitrust.com">contact@naitrust.com ↗</a></div><div className="nt-footer-links">{groups.map(group => <div key={group.title}><h3>{group.title}</h3><ul>{group.links.map(([label, page]) => <li key={label}><button onClick={() => onNavigate(page)}>{label}</button></li>)}{group.title === 'THE DETAILS' && <li><button onClick={() => (window as Window & { openCookiePreferences?: () => void }).openCookiePreferences?.()}>Cookie preferences</button></li>}</ul></div>)}</div></div><div className="nt-footer-addresses" aria-label="Naitrust addresses">
    <address><p>Eden’s Court, Bera Estate, Chevron Drive.</p><p>Lagos, Nigeria.</p></address>
    <address><p>Parafield Gardens, South Australia.</p><p>Adelaide, Australia.</p></address>
  </div><div className="nt-footer-bottom"><p>Naitrust is a technology platform, not a bank. Live payments will depend on approved, appropriately licensed payment partners. Naitrust does not directly hold customer funds. We are currently accepting early-access interest.</p><div>© {new Date().getFullYear()} Naitrust Digital Solutions Limited.<br />RC 9001392 · Registered in Nigeria.</div></div></div></footer>;
}
