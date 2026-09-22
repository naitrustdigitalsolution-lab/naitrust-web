import koraLogo from '../../assets/partners/kora.svg';
import qoreidLogo from '../../assets/partners/qoreid.svg';
import { ArrowRight, Check, CheckCheck, ChevronDown, FileText, Fingerprint, LockKeyhole, Scale, ShieldCheck } from 'lucide-react';
import { SEOHead } from '../utility/SEOHead';
import { pageImages } from '../../libs/images/image-manifest';
import studioHero from '../../assets/home/naitrust-warm-hero-v2.webp';
import { protectedPaymentFAQs } from '../../content/protected-payment-faqs';

interface HomePageProps { onNavigate: (page: string) => void }

export function HomePage({ onNavigate }: HomePageProps) {
  const join = () => onNavigate('/waitlist');
  return <div className="nt-marketing">
    <SEOHead title="Secure payments. Better peace of mind." description="A safer way to buy and sell. Naitrust brings clear terms, shared evidence and controlled payment release into one Protected Deal. Join early access." canonicalPath="/" />
    <section className="nt-hero">
      <div className="nt-container nt-hero-layout">
        <div className="nt-hero-content">
          <p className="nt-eyebrow nt-hero-eyebrow"><span /> For the deals that matter</p>
          <h1>A safer way<br />to pay for<br /><em>what matters.</em></h1>
          <p className="nt-hero-description">Whether you’re buying, selling or paying for a service, Naitrust keeps the terms, payment and proof in one place—so both sides can move forward with confidence.</p>
          <div className="nt-hero-actions"><button className="nt-button" onClick={join}>Join early access <ArrowRight size={18} /></button><button className="nt-hero-secondary" onClick={() => document.getElementById('payment-journey')?.scrollIntoView({ behavior: 'smooth' })}>See how it works</button></div>
          <div className="nt-hero-journey" aria-label="The Naitrust protected deal journey"><span><b>01</b> Agree</span><i /><span><b>02</b> Protect</span><i /><span><b>03</b> Confirm</span><i /><span><b>04</b> Release</span></div>
        </div>
        <div className="nt-hero-visual">
          <img className="nt-hero-photo" src={studioHero} alt="A woman reviewing a protected deal on her phone" fetchPriority="high" />
          <div className="nt-hero-deal-card"><span className="nt-caption-icon"><ShieldCheck size={20} /></span><div><small>PROTECTED DEAL</small><strong>Payment is secured</strong><span>Release follows your agreed terms</span></div><CheckCheck size={18} /></div>
        </div>
      </div>
    </section>

    <section className="nt-container nt-partners" aria-labelledby="partners-heading">
      <div><p className="nt-eyebrow" id="partners-heading">BUILT ON TRUSTED TECHNOLOGY</p><p className="nt-partners-copy">Our planned payment and identity integrations.</p></div>
      <div className="nt-partner-logos">
        <a href="https://www.korahq.com/" target="_blank" rel="noopener noreferrer" aria-label="Kora — payment integration"><img src={koraLogo} alt="Kora" width="130" height="40" loading="lazy" /><span>Payments</span></a>
        <a href="https://qoreid.com/" target="_blank" rel="noopener noreferrer" aria-label="QoreID — identity verification"><img src={qoreidLogo} alt="QoreID" width="130" height="40" loading="lazy" /><span>Identity verification</span></a>
      </div>
    </section>

    <section className="nt-intro nt-container" id="payment-journey">
      <p className="nt-eyebrow">LESS GUESSWORK. MORE GOOD DEALS.</p>
      <h2>Trust is good.<br /><span className="nt-text-muted">A clear agreement is better.</span></h2>
      <p>From that first “is this available?” to the final payment,<br className="nt-desktop-break" /> keep everyone on the same page.</p>
      <div className="nt-principles"><span><Fingerprint size={19} /> Know who’s involved</span><span><FileText size={19} /> Agree before you pay</span><span><ShieldCheck size={19} /> Release with clear conditions</span></div>
    </section>

    <section className="nt-container nt-feature-grid" aria-label="Payment protection for both sides">
      <article className="nt-feature nt-feature-buyer">
        <div className="nt-feature-copy"><p className="nt-eyebrow">FOR BUYERS</p><h2>Love the purchase.<br />Feel good about<br />the payment.</h2><p>Know what you’re getting, who you’re paying and what happens next. Review the evidence before payment is released under your agreed terms.</p><button className="nt-text-link" onClick={() => onNavigate('customer')}>Explore buyer protection <ArrowRight size={19} /></button></div>
        <div className="nt-buyer-visual"><img src={pageImages.customerHero.src} alt="A buyer using her phone to review a deal" loading="lazy" /><div className="nt-floating-note"><span className="nt-success-icon"><CheckCheck size={19} /></span><div><strong>The terms? All agreed.</strong><small>Clarity before commitment.</small></div></div></div>
      </article>
      <article className="nt-feature nt-feature-seller">
        <div className="nt-feature-copy"><p className="nt-eyebrow">FOR SELLERS & BUSINESSES</p><h2>Your hard work.<br />A clearer path<br />to getting paid.</h2><p>See confirmed funding before fulfilment. Keep delivery or work evidence together, so both sides know when payment can be released.</p><button className="nt-text-link" onClick={() => onNavigate('business')}>Explore business payments <ArrowRight size={19} /></button></div>
        <div className="nt-seller-visual"><div className="nt-mini-deal"><div className="nt-mini-deal-heading"><span className="nt-success-icon"><ShieldCheck size={24} /></span><span>Protected Deal</span><span className="nt-status-pill">Agreed</span></div><h3>A deal you can follow.</h3><div className="nt-mini-step"><Check size={16} /><span>Terms accepted by both sides</span></div><div className="nt-mini-step"><LockKeyhole size={16} /><span>Funding status in one place</span></div><div className="nt-mini-step"><FileText size={16} /><span>Evidence attached to the agreement</span></div><div className="nt-mini-footer">Your work. Documented.<ArrowRight size={18} /></div></div></div>
      </article>
    </section>

    <section className="nt-room-section nt-container">
      <div className="nt-room-visual"><div className="nt-room-app"><div className="nt-room-top"><span className="nt-app-mark">n.</span><span>Deal Room</span></div><div className="nt-room-body"><span className="nt-eyebrow">YOU’RE ON THE SAME PAGE</span><h3>Website design project</h3><p>Buyer + service provider</p><div className="nt-room-tabs"><span>Overview</span><span>Evidence</span><span>Messages</span></div><div className="nt-document"><FileText size={27} /><div><strong>Our agreement</strong><small>Scope, deadline & release conditions</small></div><CheckCheck size={19} /></div><div className="nt-chat nt-chat-left">The final files are ready for your review.<small>Service provider</small></div><div className="nt-chat nt-chat-right">Thanks! Everything is here in one place.<small>Buyer</small></div><div className="nt-room-action"><ShieldCheck size={18} /> Clear evidence. An informed decision.</div></div></div><span className="nt-orbit nt-orbit-one" aria-hidden="true" /><span className="nt-orbit nt-orbit-two" aria-hidden="true" /></div>
      <div className="nt-section-copy"><p className="nt-eyebrow">ONE DEAL. ONE SHARED SPACE.</p><h2>All the details.<br />None of the<br />back-and-forth.</h2><p>No more piecing together messages, receipts and promises. Your Deal Room brings the agreement, conversations, evidence and payment status into one clear view.</p><ul className="nt-check-list"><li><Check size={18} /> Terms everyone can refer to</li><li><Check size={18} /> Evidence connected to the payment</li><li><Check size={18} /> A documented path if there’s an issue</li></ul><button className="nt-button" onClick={join}>Get early access <ArrowRight size={18} /></button></div>
    </section>

    <section className="nt-container nt-legal-section" aria-labelledby="legal-support-heading">
      <div className="nt-legal-copy"><p className="nt-eyebrow">LEGAL SUPPORT, IN THE LOOP</p><h2 id="legal-support-heading">An extra pair of eyes.<br />Right where it matters.</h2><p>Bring an approved legal reviewer into your Deal Room. Agree once together, and keep your agreement and future uploads ready for review.</p><button className="nt-text-link" onClick={join}>Join early access <ArrowRight size={18} /></button><small>Planned for early access. Optional service; additional fee applies.</small></div>
      <div className="nt-legal-preview"><span className="nt-legal-icon"><Scale size={30} strokeWidth={1.5} /></span><h3>Your legal reviewer</h3><p>Part of the room. There when you need them.</p><ul><li><Check size={18} /> Both parties agree</li><li><FileText size={18} /> Documents shared automatically</li><li><ShieldCheck size={18} /> Both parties confirm deactivation</li></ul></div>
    </section>

    <section className="nt-steps-section"><div className="nt-container"><div className="nt-section-heading"><div><p className="nt-eyebrow">A BETTER WAY TO DO THE DEAL</p><h2>Agree. Protect.<br />Move forward.</h2></div><p>A little clarity at the start makes<br />a big difference at the finish.</p></div><div className="nt-steps-grid">{[
      ['01', 'Make it clear.', 'Agree who’s involved, what’s being delivered, the amount and when payment can be released.', FileText],
      ['02', 'Keep it connected.', 'Confirm funding through an approved provider. Keep updates and evidence in your shared Deal Room.', LockKeyhole],
      ['03', 'Review the outcome.', 'Check the goods or completed work. Approve release or report an issue under the agreed process.', ShieldCheck],
    ].map(([number, title, copy, Icon]) => { const StepIcon = Icon as typeof FileText; return <article key={String(number)}><div className="nt-step-top"><span>{String(number)} —</span><StepIcon size={25} strokeWidth={1.5} /></div><h3>{String(title)}</h3><p>{String(copy)}</p></article>; })}</div><p className="nt-launch-note">The planned pilot supports a single payment release. Live funding, release and refunds are subject to provider approval and launch readiness.</p></div></section>

    <section className="nt-container nt-faq-section"><div><p className="nt-eyebrow">GOOD QUESTIONS. CLEAR ANSWERS.</p><h2>A little clarity<br />goes a long way.</h2><button className="nt-text-link" onClick={() => onNavigate('faqs')}>Visit our help centre <ArrowRight size={18} /></button></div><div className="nt-faq-list">{[protectedPaymentFAQs[0], protectedPaymentFAQs[1], protectedPaymentFAQs[4], protectedPaymentFAQs[6]].map(faq => <details key={faq.id}><summary>{faq.question}<ChevronDown size={19} /></summary><p>{faq.answer}</p></details>)}</div></section>

    <section className="nt-container nt-final-wrap"><div className="nt-final-cta"><div><p className="nt-eyebrow">YOUR NEXT GOOD DEAL STARTS HERE</p><h2>A little more trust.<br />A whole lot of possibility.</h2><button className="nt-button nt-button-white" onClick={join}>Join the waiting list <ArrowRight size={18} /></button><p className="nt-final-note">Be among the first to hear when Naitrust is ready.</p></div><div className="nt-final-symbol" aria-hidden="true"><ShieldCheck strokeWidth={1} /></div></div></section>
  </div>;
}
