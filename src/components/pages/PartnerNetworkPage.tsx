import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowRight, BadgeCheck, Building2, CheckCircle2, ClipboardList, Factory, Globe2, Languages, LockKeyhole, LogOut, MapPin, PackageCheck, Truck, UserCheck } from 'lucide-react';
import { toast } from 'sonner';
import { productionNetworkApi } from '../../libs/marketplace/production-network.api';
import type { PartnerRole, PartnerSession } from '../../libs/marketplace/types';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { NaitrustLogo } from '../utility/NaitrustLogo';

type Locale = PartnerSession['locale'];

const copy = {
  en: {
    network: 'Naitrust Partner Network', intro: 'Work with Nigerian buyers through a managed sourcing and supplier network.',
    agent: 'Become a sourcing agent', supplier: 'Register a Chinese supplier', login: 'Partner sign in',
    invite: 'Partner access is approved and issued by Naitrust.', portal: 'Partner workspace', logout: 'Sign out',
    assignments: 'Current assignments', requests: 'Buyer requests', payout: 'Payout currency',
  },
  'zh-CN': {
    network: 'Naitrust 合作伙伴网络', intro: '通过受管理的采购和供应商网络与尼日利亚买家合作。',
    agent: '申请成为采购代理', supplier: '注册中国供应商', login: '合作伙伴登录',
    invite: '合作伙伴访问权限由 Naitrust 审核并签发。', portal: '合作伙伴工作台', logout: '退出登录',
    assignments: '当前任务', requests: '买家询价', payout: '结算币种',
  },
};

function detectedLocale(): Locale {
  return navigator.language.toLowerCase().startsWith('zh') ? 'zh-CN' : 'en';
}

export function PartnerNetworkPage() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [session, setSession] = useState(() => productionNetworkApi.getPartnerSession());
  const [locale, setLocale] = useState<Locale>(() => session?.locale ?? detectedLocale());
  const t = copy[locale];
  const isPortal = pathname === '/partners/portal';
  const isLogin = pathname === '/partners/login';
  const applicationRole: PartnerRole | null = pathname.includes('/agent/') ? 'agent' : pathname.includes('/supplier/') ? 'supplier' : null;

  const changeLocale = (next: Locale) => {
    setLocale(next);
    if (session) {
      const updated = productionNetworkApi.updatePartnerLocale(next);
      setSession(updated);
    }
  };

  if (isPortal) return <PartnerPortal session={session} locale={locale} onLocale={changeLocale} onLogout={() => { productionNetworkApi.logoutPartner(); setSession(null); navigate('/partners/login'); }} />;
  if (isLogin) return <PartnerLogin locale={locale} onLocale={changeLocale} onLogin={(next) => { setSession(next); setLocale(next.locale); navigate('/partners/portal'); }} />;
  if (applicationRole) return <PartnerApplicationForm role={applicationRole} locale={locale} onLocale={changeLocale} />;

  return (
    <div className="min-h-svh bg-[#f2f6f9] px-4 py-6 dark:bg-background sm:px-6 lg:px-8">
      <PartnerTopbar locale={locale} onLocale={changeLocale} />
      <main className="mx-auto mt-6 max-w-7xl">
        <section className="relative min-h-[28rem] overflow-hidden rounded-[2rem] bg-[#061a31] p-6 text-white sm:p-10 lg:p-14">
          <div className="absolute -right-20 top-0 h-96 w-96 rounded-full bg-sky-400/15 blur-3xl" /><div className="absolute bottom-0 right-24 h-64 w-64 rounded-full bg-emerald-400/10 blur-3xl" />
          <div className="relative flex min-h-[22rem] max-w-3xl flex-col justify-center"><Badge className="w-fit border-white/15 bg-white/10 text-white"><Globe2 size={12} /> China partner programme</Badge><h1 className="mt-5 text-4xl font-bold tracking-[-.05em] sm:text-6xl">{t.network}</h1><p className="mt-5 max-w-2xl text-base leading-7 text-white/65 sm:text-lg">{t.intro}</p><div className="mt-8 flex flex-wrap gap-2"><Button className="rounded-full bg-white text-[#071b31] hover:bg-white/90" onClick={() => navigate('/partners/agent/apply')}><UserCheck size={16} /> {t.agent}</Button><Button variant="outline" className="rounded-full border-white/20 bg-white/[.07] text-white hover:bg-white/15 hover:text-white" onClick={() => navigate('/partners/supplier/apply')}><Factory size={16} /> {t.supplier}</Button><Button variant="ghost" className="rounded-full text-sky-300 hover:bg-white/10 hover:text-white" onClick={() => navigate('/partners/login')}><LockKeyhole size={15} /> {t.login}</Button></div></div>
        </section>
        <section className="mt-5 grid gap-4 md:grid-cols-3"><PartnerBenefit icon={UserCheck} title="Managed agent network" text="Agents receive only approved assignments, submit evidence, and never control supplier purchase funds." /><PartnerBenefit icon={Factory} title="Supplier workspace" text="Chinese suppliers receive translated enquiries, confirm specifications, quote, and update production." /><PartnerBenefit icon={Languages} title="English and Chinese" text="Buyer requirements can be prepared in English and presented to partners in Simplified Chinese." /></section>
      </main>
    </div>
  );
}

function PartnerTopbar({ locale, onLocale }: { locale: Locale; onLocale: (locale: Locale) => void }) {
  return <header className="mx-auto flex max-w-7xl items-center justify-between gap-4"><NaitrustLogo size="md" /><LanguageToggle locale={locale} onLocale={onLocale} /></header>;
}

function LanguageToggle({ locale, onLocale }: { locale: Locale; onLocale: (locale: Locale) => void }) {
  return <div className="flex items-center gap-1 rounded-full border bg-background p-1"><button type="button" onClick={() => onLocale('en')} className={`rounded-full px-3 py-1.5 text-xs font-semibold ${locale === 'en' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'}`}>English</button><button type="button" onClick={() => onLocale('zh-CN')} className={`rounded-full px-3 py-1.5 text-xs font-semibold ${locale === 'zh-CN' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'}`}>简体中文</button></div>;
}

function PartnerBenefit({ icon: Icon, title, text }: { icon: typeof UserCheck; title: string; text: string }) {
  return <Card className="rounded-3xl p-5"><span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary"><Icon size={19} /></span><h2 className="mt-4 font-bold">{title}</h2><p className="mt-2 text-sm leading-6 text-muted-foreground">{text}</p></Card>;
}

function PartnerApplicationForm({ role, locale, onLocale }: { role: PartnerRole; locale: Locale; onLocale: (locale: Locale) => void }) {
  const navigate = useNavigate();
  const [submitted, setSubmitted] = useState(false);
  const [companyName, setCompanyName] = useState(role === 'supplier' ? '' : undefined);
  const [contactName, setContactName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('+86 ');
  const [city, setCity] = useState('Guangzhou');
  const [services, setServices] = useState(role === 'agent' ? 'Market sourcing, factory visits, inspection' : 'Products, custom manufacturing, export fulfilment');
  const [experience, setExperience] = useState('');

  const submit = () => {
    if (!contactName.trim() || !email.trim() || !phone.trim() || !experience.trim() || (role === 'supplier' && !companyName?.trim())) { toast.error(locale === 'zh-CN' ? '请填写所有必填项。' : 'Complete all required fields.'); return; }
    productionNetworkApi.submitApplication({ role, companyName: companyName?.trim() || undefined, contactName: contactName.trim(), email: email.trim(), phone: phone.trim(), city: city.trim(), languages: locale === 'zh-CN' ? ['Mandarin'] : ['Mandarin', 'English'], services: services.split(',').map((item) => item.trim()).filter(Boolean), experience: experience.trim() });
    setSubmitted(true);
  };

  return <div className="min-h-svh bg-[#f2f6f9] px-4 py-6 dark:bg-background sm:px-6"><PartnerTopbar locale={locale} onLocale={onLocale} /><main className="mx-auto mt-6 max-w-2xl"><Button variant="ghost" className="mb-3 rounded-full" onClick={() => navigate('/partners')}>Back</Button>{submitted ? <Card className="rounded-3xl p-8 text-center"><CheckCircle2 className="mx-auto text-emerald-600" size={36} /><h1 className="mt-4 text-2xl font-bold">{locale === 'zh-CN' ? '申请已提交' : 'Application submitted'}</h1><p className="mt-3 text-sm leading-6 text-muted-foreground">{locale === 'zh-CN' ? 'Naitrust 将审核您的资料。批准后，访问代码将通过已验证的联系方式发送。' : 'Naitrust will review your information. If approved, a partner access code will be issued through your verified contact channel.'}</p><Button className="mt-6 rounded-full" onClick={() => navigate('/partners/login')}>Partner sign in</Button></Card> : <Card className="rounded-3xl p-5 sm:p-8"><Badge>{role === 'agent' ? 'Sourcing agent' : 'Chinese supplier'}</Badge><h1 className="mt-4 text-3xl font-bold">{role === 'agent' ? (locale === 'zh-CN' ? '采购代理申请' : 'Sourcing agent application') : (locale === 'zh-CN' ? '中国供应商注册' : 'Chinese supplier registration')}</h1><p className="mt-2 text-sm leading-6 text-muted-foreground">Applications are reviewed by Naitrust. Registration does not create immediate platform access.</p><div className="mt-6 space-y-4">{role === 'supplier' && <div><Label htmlFor="partner-company">Company legal name</Label><Input id="partner-company" className="mt-2" value={companyName ?? ''} onChange={(event) => setCompanyName(event.target.value)} /></div>}<div className="grid gap-4 sm:grid-cols-2"><div><Label htmlFor="partner-contact">Contact name</Label><Input id="partner-contact" className="mt-2" value={contactName} onChange={(event) => setContactName(event.target.value)} /></div><div><Label htmlFor="partner-city">City</Label><Input id="partner-city" className="mt-2" value={city} onChange={(event) => setCity(event.target.value)} /></div></div><div className="grid gap-4 sm:grid-cols-2"><div><Label htmlFor="partner-email">Business email</Label><Input id="partner-email" type="email" className="mt-2" value={email} onChange={(event) => setEmail(event.target.value)} /></div><div><Label htmlFor="partner-phone">Chinese phone number</Label><Input id="partner-phone" className="mt-2" value={phone} onChange={(event) => setPhone(event.target.value)} /></div></div><div><Label htmlFor="partner-services">{role === 'agent' ? 'Services offered' : 'Products and capabilities'}</Label><Input id="partner-services" className="mt-2" value={services} onChange={(event) => setServices(event.target.value)} /></div><div><Label htmlFor="partner-experience">Experience and operating background</Label><Textarea id="partner-experience" className="mt-2 min-h-28 resize-y" value={experience} onChange={(event) => setExperience(event.target.value)} placeholder={role === 'agent' ? 'Tell Naitrust about sourcing, quality control, markets, and cities you cover.' : 'Describe your factory, products, customization, production capacity, and export experience.'} /></div><Button className="h-11 w-full rounded-full" onClick={submit}>Submit for review</Button></div></Card>}</main></div>;
}

function PartnerLogin({ locale, onLocale, onLogin }: { locale: Locale; onLocale: (locale: Locale) => void; onLogin: (session: PartnerSession) => void }) {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const login = () => { try { onLogin(productionNetworkApi.loginPartner(email, code)); } catch (error) { toast.error(error instanceof Error ? error.message : 'Partner sign in failed.'); } };
  return <div className="min-h-svh bg-[#f2f6f9] px-4 py-6 dark:bg-background sm:px-6"><PartnerTopbar locale={locale} onLocale={onLocale} /><main className="mx-auto mt-12 max-w-md"><Card className="rounded-3xl p-6 sm:p-8"><span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary"><LockKeyhole size={21} /></span><h1 className="mt-5 text-2xl font-bold">{copy[locale].login}</h1><p className="mt-2 text-sm leading-6 text-muted-foreground">{copy[locale].invite}</p><div className="mt-6 space-y-4"><div><Label htmlFor="partner-login-email">Email</Label><Input id="partner-login-email" className="mt-2" type="email" value={email} onChange={(event) => setEmail(event.target.value)} /></div><div><Label htmlFor="partner-login-code">Partner access code</Label><Input id="partner-login-code" className="mt-2" type="password" value={code} onChange={(event) => setCode(event.target.value)} /></div><Button className="h-11 w-full rounded-full" onClick={login}>Sign in</Button><div className="rounded-2xl bg-muted/60 p-3 text-xs leading-5 text-muted-foreground"><p className="font-semibold text-foreground">Demo access only</p><button type="button" className="mt-1 text-left text-primary" onClick={() => { setEmail('brightpack.partner@naitrust.test'); setCode('SUPPLIER-BRIGHT-2026'); }}>Use approved supplier demo</button><br /><button type="button" className="text-left text-primary" onClick={() => { setEmail('lin.partner@naitrust.test'); setCode('AGENT-LIN-2026'); }}>Use approved agent demo</button></div><Button variant="ghost" className="w-full rounded-full" onClick={() => navigate('/partners')}>Back to partner network</Button></div></Card></main></div>;
}

function PartnerPortal({ session, locale, onLocale, onLogout }: { session: PartnerSession | null; locale: Locale; onLocale: (locale: Locale) => void; onLogout: () => void }) {
  const navigate = useNavigate();
  if (!session) return <div className="grid min-h-svh place-items-center bg-muted/30 p-4"><Card className="max-w-md rounded-3xl p-8 text-center"><LockKeyhole className="mx-auto text-primary" /><h1 className="mt-4 text-xl font-bold">Partner access required</h1><p className="mt-2 text-sm text-muted-foreground">Sign in with the email and access code issued by Naitrust.</p><Button className="mt-5 rounded-full" onClick={() => navigate('/partners/login')}>Partner sign in</Button></Card></div>;
  const assignments = productionNetworkApi.partnerAssignments(session.role);
  const t = copy[locale];
  return <div className="min-h-svh bg-[#eef3f7] dark:bg-background"><header className="border-b bg-background px-4 py-3 sm:px-6"><div className="mx-auto flex max-w-7xl items-center justify-between gap-3"><div className="flex items-center gap-3"><NaitrustLogo size="sm" /><span className="hidden text-xs font-semibold text-muted-foreground sm:inline">Partner Network</span></div><div className="flex items-center gap-2"><div className="hidden sm:block"><LanguageToggle locale={locale} onLocale={onLocale} /></div><Button variant="ghost" size="sm" className="rounded-full" onClick={onLogout}><LogOut size={14} /> {t.logout}</Button></div></div></header><main className="mx-auto w-full max-w-7xl p-4 sm:p-6"><section className="rounded-3xl bg-[#061a31] p-5 text-white sm:p-8"><div className="flex flex-wrap items-start justify-between gap-4"><div><Badge className="border-white/15 bg-white/10 text-white"><BadgeCheck size={12} /> Approved {session.role}</Badge><h1 className="mt-4 text-3xl font-bold">{session.name}</h1><p className="mt-2 text-sm text-white/60">{t.portal} · {session.role === 'supplier' ? '中国供应商' : '采购代理'}</p></div><div className="grid grid-cols-2 gap-2 text-xs"><span className="rounded-xl bg-white/10 px-4 py-3"><strong className="block text-xl">{assignments.length}</strong>{session.role === 'agent' ? t.assignments : t.requests}</span><span className="rounded-xl bg-white/10 px-4 py-3"><strong className="block text-xl">CNY / USD</strong>{t.payout}</span></div></div></section><div className="mt-5 grid gap-5 lg:grid-cols-[1fr_.34fr]"><section><div className="mb-3 flex items-center justify-between"><h2 className="text-lg font-bold">{session.role === 'agent' ? t.assignments : t.requests}</h2><Badge variant="outline">Naitrust managed</Badge></div><div className="space-y-3">{assignments.map((assignment) => <Card key={assignment.id} className="rounded-2xl p-5"><div className="flex flex-wrap items-start justify-between gap-3"><div><p className="font-semibold">{assignment.title}</p><p className="mt-1 text-xs text-muted-foreground">{assignment.buyer}</p></div><Badge>{assignment.status}</Badge></div><div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t pt-3 text-xs"><span className="flex items-center gap-1.5 text-muted-foreground">{session.role === 'agent' ? <><MapPin size={13} /> {'city' in assignment ? assignment.city : 'China'}</> : <><ClipboardList size={13} /> {'quantity' in assignment ? assignment.quantity : ''}</>}</span><span className="font-semibold">{'fee' in assignment ? assignment.fee : 'Open enquiry'}</span></div><Button variant="outline" className="mt-4 w-full rounded-full" onClick={() => toast.success(session.role === 'agent' ? 'Assignment opened.' : 'Buyer request opened.')}>{session.role === 'agent' ? 'Open assignment' : 'Review request'} <ArrowRight size={14} /></Button></Card>)}</div></section><aside className="space-y-4"><Card className="rounded-2xl p-5"><PackageCheck size={19} className="text-primary" /><h2 className="mt-4 font-bold">{session.role === 'agent' ? 'Evidence and updates' : 'Supplier experience'}</h2><p className="mt-2 text-xs leading-5 text-muted-foreground">{session.role === 'agent' ? 'Upload sourcing findings, inspection photos, factory notes, and shipping handover evidence for Naitrust review.' : 'Receive translated specifications, ask questions, submit quotes, confirm samples, and update each production stage.'}</p></Card><Card className="rounded-2xl p-5"><Truck size={19} className="text-primary" /><h2 className="mt-4 font-bold">Payment and shipping</h2><p className="mt-2 text-xs leading-5 text-muted-foreground">Naitrust admin approves assignments and settlement. Available payout currencies depend on the partner and regulated payment corridor.</p></Card></aside></div></main></div>;
}
