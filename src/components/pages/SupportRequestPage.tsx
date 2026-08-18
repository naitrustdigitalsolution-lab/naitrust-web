import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, Clock3, FileText, Headphones, MessageCircle, Paperclip, Send, ShieldCheck, Upload, X } from 'lucide-react';
import { toast } from 'sonner';
import { DashboardLayout } from '../pieces/dashboard/DashboardLayout';
import { PageHero } from '../pieces/dashboard/PageHero';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { getAppImage } from '../../libs/images/image-manifest';

const MAX_ATTACHMENTS = 3;
const MAX_ATTACHMENT_BYTES = 5 * 1024 * 1024;
const ACCEPTED_ATTACHMENT_TYPES = new Set(['application/pdf', 'image/jpeg', 'image/png', 'image/webp']);
const SUPPORT_CATEGORIES = [
  { value: 'account', label: 'Account & verification', detail: 'Profile, access or identity checks' },
  { value: 'payment', label: 'Payment or transfer', detail: 'Money sent, received or pending' },
  { value: 'protected-deal', label: 'Protected Deal', detail: 'Terms, evidence or completion' },
  { value: 'security', label: 'Security concern', detail: 'Suspicious activity or account safety' },
  { value: 'other', label: 'Something else', detail: 'Any other question for our team' },
] as const;

function formatFileSize(bytes: number) {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function SupportRequestPage() {
  const navigate = useNavigate();
  const [category, setCategory] = useState('');
  const [subject, setSubject] = useState('');
  const [reference, setReference] = useState('');
  const [message, setMessage] = useState('');
  const [attachments, setAttachments] = useState<File[]>([]);
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

  const addAttachments = (files: File[]) => {
    const availableSlots = MAX_ATTACHMENTS - attachments.length;
    if (availableSlots <= 0) {
      toast.error(`You can attach up to ${MAX_ATTACHMENTS} files.`);
      return;
    }

    const validFiles: File[] = [];
    for (const file of files) {
      if (!ACCEPTED_ATTACHMENT_TYPES.has(file.type)) {
        toast.error(`${file.name} is not a supported PDF or image.`);
        continue;
      }
      if (file.size > MAX_ATTACHMENT_BYTES) {
        toast.error(`${file.name} is larger than 5 MB.`);
        continue;
      }
      if (attachments.some((current) => current.name === file.name && current.size === file.size)) continue;
      validFiles.push(file);
    }

    if (validFiles.length > availableSlots) toast.error(`Only ${availableSlots} more file${availableSlots === 1 ? '' : 's'} can be attached.`);
    setAttachments((current) => [...current, ...validFiles.slice(0, availableSlots)]);
  };

  return (
    <DashboardLayout title="Support">
      <div className="mx-auto w-full max-w-7xl">
        <div className="mb-5 flex items-center gap-2 sm:hidden">
          <Button variant="outline" size="icon" className="h-8 w-8 shrink-0 rounded-full" aria-label="Back to Messages" onClick={() => navigate('/app/messages')}><ArrowLeft size={14} /></Button>
          <h1 className="text-lg font-bold tracking-tight">Support request</h1>
        </div>
        <div className="hidden sm:block"><PageHero
          eyebrow="Naitrust support"
          title="How can we help?"
          description="Send your question directly to Naitrust. Include a transaction reference when your request concerns a payment or Protected Deal."
          icon={Headphones}
          image={getAppImage('support', 'A Naitrust support specialist reviewing a customer request')}
          actions={<Button variant="outline" className="rounded-md bg-background" onClick={() => navigate('/app/messages')}><MessageCircle size={15} /> Messages</Button>}
        /></div>

        {submitted ? (
          <Card className="rounded-[2rem] border-border/70 p-6 shadow-[0_18px_50px_rgba(10,38,68,.07)] sm:p-10">
            <div className="mx-auto max-w-xl py-10 text-center"><span className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600"><CheckCircle2 size={31} /></span><h2 className="mt-5 text-2xl font-bold">Request received</h2><p className="mt-2 text-sm leading-6 text-muted-foreground">Your support reference is <strong className="text-foreground">{ticket}</strong>. We’ll keep updates in Messages.</p>{attachments.length > 0 && <p className="mt-2 text-xs text-muted-foreground">{attachments.length} attachment{attachments.length === 1 ? '' : 's'} included.</p>}<div className="mt-7 flex flex-col justify-center gap-2 sm:flex-row"><Button variant="outline" className="rounded-xl" onClick={() => { setSubmitted(false); setCategory(''); setSubject(''); setReference(''); setMessage(''); setAttachments([]); }}>Create another</Button><Button className="rounded-xl" onClick={() => navigate('/app/messages')}>Open messages</Button></div></div>
          </Card>
        ) : (
          <form onSubmit={submit} className="grid items-start gap-5 lg:grid-cols-[minmax(0,1.55fr)_minmax(20rem,.75fr)]">
            <Card className="rounded-none border-x-0 border-border/70 p-0 pb-5 shadow-none sm:rounded-[2rem] sm:border-x sm:p-8 sm:shadow-[0_18px_50px_rgba(10,38,68,.07)]">
              <div className="border-b pb-4 sm:pb-5"><h2 className="text-base font-bold sm:text-xl">Tell us what happened</h2><p className="mt-1 hidden text-sm text-muted-foreground sm:block">The more relevant detail you provide, the faster we can route and investigate your request.</p></div>

              <div className="mt-6">
                <Label>What do you need help with?</Label>
                <div className="mt-2 sm:hidden"><Select value={category || undefined} onValueChange={setCategory}><SelectTrigger className="h-11 w-full rounded-xl"><SelectValue placeholder="Choose a topic" /></SelectTrigger><SelectContent>{SUPPORT_CATEGORIES.map((option) => <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>)}</SelectContent></Select></div>
                <div className="mt-3 hidden gap-3 sm:grid sm:grid-cols-2">{SUPPORT_CATEGORIES.map((option, index) => <button key={option.value} type="button" aria-pressed={category === option.value} onClick={() => setCategory(option.value)} className={`rounded-2xl border p-4 text-left transition ${category === option.value ? 'border-primary bg-primary/[0.07] ring-1 ring-primary/20' : 'border-border/70 hover:border-primary/35 hover:bg-muted/30'} ${index === SUPPORT_CATEGORIES.length - 1 ? 'sm:col-span-2' : ''}`}><span className="flex items-start justify-between gap-3"><span><span className="block text-sm font-semibold">{option.label}</span><span className="mt-1 block text-xs leading-5 text-muted-foreground">{option.detail}</span></span><span className={`mt-0.5 h-4 w-4 shrink-0 rounded-full border-2 ${category === option.value ? 'border-primary bg-primary shadow-[inset_0_0_0_3px_white]' : 'border-muted-foreground/30'}`} /></span></button>)}</div>
              </div>

              <div className="mt-6 grid gap-5 sm:grid-cols-2">
                <div><Label htmlFor="support-subject">Subject</Label><Input id="support-subject" className="mt-2 h-11" value={subject} onChange={(event) => setSubject(event.target.value)} placeholder="Briefly describe the issue" /></div>
                <div><Label htmlFor="support-reference">Transaction reference <span className="font-normal text-muted-foreground">(optional)</span></Label><Input id="support-reference" className="mt-2 h-11" value={reference} onChange={(event) => setReference(event.target.value)} placeholder="For example, NT-PD-10284" /></div>
              </div>

              <div className="mt-5"><Label htmlFor="support-message">Message</Label><Textarea id="support-message" className="mt-2 min-h-36 resize-y sm:min-h-52" value={message} onChange={(event) => setMessage(event.target.value)} placeholder="What happened and what outcome were you expecting?" /><p className="mt-2 hidden text-xs text-muted-foreground sm:block">Include dates, amounts, and names when they help explain the issue.</p></div>
            </Card>

            <aside className="grid gap-4 lg:sticky lg:top-20">
              <Card className="rounded-xl border-border/70 p-3 shadow-none sm:rounded-[1.75rem] sm:p-6 sm:shadow-sm">
                <div className="flex items-center justify-between gap-3"><div className="flex items-center gap-2"><Paperclip size={17} className="text-primary" /><h2 className="font-semibold">Supporting files</h2></div><span className="text-xs text-muted-foreground">{attachments.length}/{MAX_ATTACHMENTS}</span></div>
                <label htmlFor="support-attachments" className="mt-3 flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-primary/35 bg-primary/[0.035] px-4 py-3 text-center transition hover:border-primary/60 hover:bg-primary/[0.06] sm:mt-4 sm:min-h-44 sm:flex-col sm:py-6"><span className="hidden h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary sm:flex"><Upload size={20} /></span><Upload size={15} className="text-primary sm:hidden" /><span className="text-xs font-semibold sm:mt-3 sm:text-sm">Choose files</span><span className="hidden text-xs leading-5 text-muted-foreground sm:block">PDF, JPG, PNG or WebP<br />5 MB maximum per file</span></label>
                <input id="support-attachments" type="file" className="sr-only" accept=".pdf,.jpg,.jpeg,.png,.webp,application/pdf,image/jpeg,image/png,image/webp" multiple onChange={(event) => { addAttachments(Array.from(event.target.files ?? [])); event.currentTarget.value = ''; }} />
                {attachments.length > 0 && <div className="mt-3 grid gap-2">{attachments.map((file) => <div key={`${file.name}-${file.size}`} className="flex items-center gap-2.5 rounded-xl border bg-muted/20 px-3 py-2.5"><FileText size={16} className="shrink-0 text-primary" /><div className="min-w-0 flex-1"><p className="truncate text-xs font-medium">{file.name}</p><p className="text-[11px] text-muted-foreground">{formatFileSize(file.size)}</p></div><Button type="button" variant="ghost" size="icon" className="h-7 w-7 rounded-full" aria-label={`Remove ${file.name}`} onClick={() => setAttachments((current) => current.filter((item) => item !== file))}><X size={14} /></Button></div>)}</div>}
              </Card>

              <div className="rounded-xl border border-emerald-500/15 bg-emerald-500/[0.045] p-3 sm:rounded-2xl sm:p-4"><div className="flex gap-2 sm:gap-3"><ShieldCheck size={16} className="mt-0.5 shrink-0 text-emerald-600 sm:h-[18px] sm:w-[18px]" /><div><p className="text-xs font-semibold sm:text-sm">Keep sensitive details private</p><p className="mt-1 hidden text-xs leading-5 text-muted-foreground sm:block">Never send your password, PIN, OTP, full card number, or recovery code.</p></div></div></div>
              <div className="hidden gap-3 rounded-2xl border bg-muted/20 p-4 sm:flex"><Clock3 size={18} className="mt-0.5 shrink-0 text-primary" /><div><p className="text-sm font-semibold">What happens next?</p><p className="mt-1 text-xs leading-5 text-muted-foreground">We create a reference and continue the conversation in Messages.</p></div></div>
              <Button type="submit" className="h-10 w-full rounded-full text-xs sm:h-12 sm:rounded-xl sm:text-sm"><Send size={15} /> Submit request</Button>
            </aside>
          </form>
        )}
      </div>
    </DashboardLayout>
  );
}
