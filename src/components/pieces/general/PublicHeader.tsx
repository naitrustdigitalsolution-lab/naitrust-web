import { useEffect, useState } from 'react';
import { ArrowRight, Menu, X } from 'lucide-react';
import { NaitrustLogo } from '../../utility/NaitrustLogo';

export function PublicHeader({ onNavigate, currentPage }: { onNavigate: (page: string) => void; currentPage: string }) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const home = currentPage === 'home';
  useEffect(() => {
    const update = () => setScrolled(window.scrollY > 32);
    update();
    window.addEventListener('scroll', update, { passive: true });
    return () => window.removeEventListener('scroll', update);
  }, []);
  useEffect(() => { setOpen(false); }, [currentPage]);
  useEffect(() => {
    if (!open) return;
    const close = (event: KeyboardEvent) => { if (event.key === 'Escape') setOpen(false); };
    window.addEventListener('keydown', close);
    return () => window.removeEventListener('keydown', close);
  }, [open]);
  const navigate = (page: string) => { setOpen(false); onNavigate(page); };
  const links = [ ['For individuals', 'customer'], ['For businesses', 'business'], ['About us', 'about'], ['Help', 'faqs'] ];
  const inverse = home && !scrolled && !open;
  return <header className={`nt-header ${home ? 'nt-header-home' : ''} ${inverse ? 'nt-header-inverse' : ''}`}>
    <div className="nt-container nt-header-inner">
      <button onClick={() => navigate('home')} aria-label="Naitrust home"><NaitrustLogo size="md" textColor={inverse ? 'text-white' : 'text-[#142441]'} /></button>
      <nav className="nt-desktop-nav" aria-label="Main navigation">
        {links.map(([label, page]) => <button key={page} onClick={() => navigate(page)} aria-current={currentPage === page ? 'page' : undefined}>{label}</button>)}
      </nav>
      <div className="nt-header-actions"><button className="nt-signin" onClick={() => navigate('login')}>Sign in</button><button className="nt-button nt-button-small" onClick={() => navigate('/waitlist')}>Join early access <ArrowRight size={16} /></button></div>
      <button className="nt-menu-toggle" onClick={() => setOpen(!open)} aria-expanded={open} aria-controls="nt-mobile-nav" aria-label={open ? 'Close navigation menu' : 'Open navigation menu'}>{open ? <X /> : <Menu />}</button>
    </div>
    {open && <nav id="nt-mobile-nav" className="nt-mobile-nav" aria-label="Mobile navigation">{links.map(([label, page]) => <button key={page} onClick={() => navigate(page)}>{label}<ArrowRight size={18} /></button>)}<button onClick={() => navigate('login')}>Sign in<ArrowRight size={18} /></button><button className="nt-button" onClick={() => navigate('/waitlist')}>Join early access<ArrowRight size={18} /></button></nav>}
  </header>;
}
