import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, Headphones, Send } from 'lucide-react';
import { toast } from 'sonner';
import { DashboardLayout } from '../pieces/dashboard/DashboardLayout';
import { PageHero } from '../pieces/dashboard/PageHero';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

export function SupportRequestPage() {
  const navigate = useNavigate();
  const [category, setCategory] = useState('');
  const [subject, setSubject] = useState('');
  const [reference, setReference] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [ticket] = useState(() => `NT-SUP-${Math.floor(100000 + Math.random() * 900000)}`);

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!category || !subject.trim() || !message.trim()) {
      toast.error('Choose an issue type and describe how we can help.');
      return;
    }
    setSubmitted(true);
    toast.success('Support request created');
  };

  return (
    <DashboardLayout title="Support">
      <div className="mx-auto w-full max-w-4xl">
        <PageHero
          eyebrow="Naitrust support"
          title="How can we help?"
          description="Send your question directly to Naitrust. Include a transaction reference when your request concerns a payment or Protected Deal."
          icon={Headphones}
          actions={<Button variant="outline" className="rounded-md bg-background" onClick={() => navigate('/app/messages')}><ArrowLeft size={15} /> Back to messages</Button>}
        />

        <Card className="mx-auto max-w-2xl rounded-2xl p-5 shadow-sm sm:p-7">
          {submitted ? (
            <div className="py-8 text-center">
              <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600"><CheckCircle2 size={28} /></span>
              <h2 className="mt-5 text-xl font-bold">Request received</h2>
              <p className="mt-2 text-sm text-muted-foreground">Your support reference is <strong className="text-foreground">{ticket}</strong>. We’ll keep updates in Messages.</p>
              <div className="mt-6 flex flex-col justify-center gap-2 sm:flex-row">
                <Button variant="outline" className="rounded-md" onClick={() => { setSubmitted(false); setCategory(''); setSubject(''); setReference(''); setMessage(''); }}>Create another</Button>
                <Button className="rounded-md" onClick={() => navigate('/app/messages')}>Return to messages</Button>
              </div>
            </div>
          ) : (
            <form onSubmit={submit} className="space-y-5">
              <div>
                <Label>What do you need help with?</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger className="mt-2"><SelectValue placeholder="Choose an issue type" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="account">Account and verification</SelectItem>
                    <SelectItem value="payment">Payment or transfer</SelectItem>
                    <SelectItem value="protected-deal">Protected Deal</SelectItem>
                    <SelectItem value="security">Security concern</SelectItem>
                    <SelectItem value="other">Something else</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="support-subject">Subject</Label>
                <Input id="support-subject" className="mt-2" value={subject} onChange={(event) => setSubject(event.target.value)} placeholder="Briefly describe the issue" />
              </div>
              <div>
                <Label htmlFor="support-reference">Transaction reference <span className="font-normal text-muted-foreground">(optional)</span></Label>
                <Input id="support-reference" className="mt-2" value={reference} onChange={(event) => setReference(event.target.value)} placeholder="For example, NT-PD-10284" />
              </div>
              <div>
                <Label htmlFor="support-message">Tell us what happened</Label>
                <Textarea id="support-message" className="mt-2 min-h-32" value={message} onChange={(event) => setMessage(event.target.value)} placeholder="Share the important details. Do not include your password, PIN, or OTP." />
                <p className="mt-2 text-xs text-muted-foreground">Naitrust support will never ask for your password, transaction PIN, or one-time code.</p>
              </div>
              <Button type="submit" className="w-full rounded-lg"><Send size={16} /> Submit support request</Button>
            </form>
          )}
        </Card>
      </div>
    </DashboardLayout>
  );
}
