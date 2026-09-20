import { useState } from 'react';
import { toast } from 'sonner';
import { useAuth } from '../../libs/auth-context';
import { homeApi } from '../../libs/api/home.api';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { Link } from 'react-router-dom';
import { ArrowRight, Copy } from 'lucide-react';
import { DashboardLayout } from '../pieces/dashboard/DashboardLayout';
import { Button } from '../ui/button';
const questions = [
  ['How do I start a deal?', 'Choose Create a deal, add the goods or service, amount and release conditions, then share the invitation. The other person reviews and accepts before funding.'],
  ['When is payment released?', 'Payment follows the conditions you both accepted. Review the delivery or work and its evidence before approving release in the Deal Room.'],
  ['What if something is wrong?', 'Open the deal and choose Raise a dispute. Explain the issue and attach relevant evidence. Follow the dispute status in the same room.'],
  ['Do I need a wallet?', 'No separate wallet is needed. Funding instructions and payment status are shown inside each deal.'],
];
export function SupportChatPage() {
  const { user } = useAuth();
  const [formOpen, setFormOpen] = useState(false);
  const [reference, setReference] = useState('');
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState(user?.email ?? '');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const send = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!message.trim()) { setError('Tell us what you need help with.'); return; }
    setSending(true); setError('');
    try {
      const result = await homeApi.contactUs({ name: user?.name, email: email.trim(), subject: reference.trim() ? `Deal support · ${reference.trim()}` : 'Naitrust account support', message: message.trim() });
      if (!result.success) throw new Error('Your message could not be sent.');
      setSent(true); setMessage('');
    } catch { setError('We couldn’t send your message. Try again, or copy the email address below to contact us directly.'); }
    finally { setSending(false); }
  };
  return <DashboardLayout title="Help & support">
    <div className="nd-heading"><div><h1>A little help, when you need it.</h1><p>Find an answer or get in touch with the Naitrust team.</p></div></div>
    <section className="nd-support-card">
      <h2>Let’s work it out together.</h2>
      <p>Tell us what happened and include your deal reference. Leave out passwords and transaction PINs.</p>
      {!formOpen && <Button onClick={() => setFormOpen(true)}>Contact support <ArrowRight size={15}/></Button>}
      {formOpen && (sent ? <div role="status" className="nd-support-success"><strong>Message sent</strong><p>We’ll reply to {email}.</p><Button variant="outline" onClick={() => setSent(false)}>Send another message</Button></div> : <form onSubmit={send} className="mt-6 max-w-xl space-y-4">
        <div><Label htmlFor="support-email">Reply email</Label><Input id="support-email" type="email" required value={email} onChange={event=>setEmail(event.target.value)} className="mt-2"/></div>
        <div><Label htmlFor="support-reference">Deal reference (optional)</Label><Input id="support-reference" value={reference} onChange={event=>setReference(event.target.value)} placeholder="NT-2026-220001" className="mt-2"/></div>
        <div><Label htmlFor="support-message">How can we help?</Label><Textarea id="support-message" required rows={4} value={message} onChange={event=>setMessage(event.target.value)} className="mt-2"/></div>
        {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
        <Button type="submit" disabled={sending}>{sending ? 'Sending…' : 'Send message'}</Button>
      </form>)}
      <div className="nd-support-email"><a href="mailto:contact@naitrust.com">contact@naitrust.com</a><button type="button" aria-label="Copy support email" onClick={()=>void navigator.clipboard.writeText('contact@naitrust.com').then(()=>toast.success('Email address copied.')).catch(()=>toast.error('Select and copy contact@naitrust.com.'))}><Copy size={15}/>Copy email</button></div>
    </section>
    <div className="nd-section-title"><h2>Common questions</h2></div><div className="nd-deal-list">{questions.map(([question,answer])=><details key={question} className="border-b p-5 last:border-0"><summary className="cursor-pointer text-sm font-semibold">{question}</summary><p className="mt-3 max-w-2xl text-sm leading-7 text-muted-foreground">{answer}</p></details>)}</div><p className="nd-subtle-note">Need to update your account? <Link className="text-primary" to="/app/settings?tab=security">Open security settings.</Link></p>
  </DashboardLayout>;
}
