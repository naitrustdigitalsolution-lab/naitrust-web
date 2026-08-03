import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, Headphones, LockKeyhole, Paperclip, Send, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../pieces/dashboard/DashboardLayout';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Textarea } from '../ui/textarea';
import { useAuth } from '../../libs/auth-context';

interface SupportMessage {
  id: string;
  sender: 'support' | 'user';
  body: string;
  time: string;
  attachmentName?: string;
}

function currentTime() {
  return new Intl.DateTimeFormat(undefined, { hour: 'numeric', minute: '2-digit' }).format(new Date());
}

export function SupportChatPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [draft, setDraft] = useState('');
  const [attachment, setAttachment] = useState<File | null>(null);
  const [messages, setMessages] = useState<SupportMessage[]>([
    {
      id: 'support-welcome',
      sender: 'support',
      body: `Hello${user?.name ? ` ${user.name.split(' ')[0]}` : ''}. You’re chatting with Naitrust Support. Tell us what you need help with, and include a transaction reference if your question concerns a payment or Protected Deal.`,
      time: currentTime(),
    },
  ]);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = () => {
    const body = draft.trim();
    if (!body && !attachment) return;
    setMessages((current) => [
      ...current,
      {
        id: `support-message-${Date.now()}`,
        sender: 'user',
        body,
        attachmentName: attachment?.name,
        time: currentTime(),
      },
    ]);
    setDraft('');
    setAttachment(null);
  };

  return (
    <DashboardLayout title="Naitrust Support">
      <div className="mx-auto w-full max-w-6xl">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <Button variant="ghost" className="rounded-full" onClick={() => navigate('/app/messages')}><ArrowLeft size={15} /> Back to messages</Button>
          <Button variant="outline" className="rounded-full" onClick={() => navigate('/app/support/new')}><Headphones size={15} /> Create support request</Button>
        </div>

        <Card className="overflow-hidden rounded-3xl border-border/70 p-0 shadow-[0_18px_55px_rgba(10,38,68,.08)]">
          <header className="flex items-center gap-3 border-b bg-primary/[0.045] px-4 py-4 sm:px-6">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">NS</span>
            <div className="min-w-0 flex-1"><div className="flex items-center gap-2"><h1 className="truncate font-bold">Naitrust Support</h1><span className="h-2 w-2 rounded-full bg-emerald-500" /></div><p className="mt-0.5 text-xs text-muted-foreground">Official support conversation</p></div>
          </header>

          <div className="h-[min(58vh,38rem)] overflow-y-auto bg-muted/[0.18] px-4 py-6 sm:px-6">
            <div className="mx-auto max-w-3xl space-y-5">
              <div className="flex items-center gap-3 text-[11px] text-muted-foreground before:h-px before:flex-1 before:bg-border after:h-px after:flex-1 after:bg-border">Today</div>
              {messages.map((message) => (
                <div key={message.id} className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[88%] rounded-2xl px-4 py-3 shadow-sm sm:max-w-[72%] ${message.sender === 'user' ? 'rounded-br-md bg-primary text-primary-foreground' : 'rounded-bl-md border bg-background'}`}>
                    {message.body && <p className="text-sm leading-6">{message.body}</p>}
                    {message.attachmentName && <div className={`mt-2 flex items-center gap-2 rounded-lg px-2.5 py-2 text-xs ${message.sender === 'user' ? 'bg-white/10' : 'bg-muted'}`}><Paperclip size={13} /><span className="truncate">{message.attachmentName}</span></div>}
                    <p className={`mt-1.5 text-[10px] ${message.sender === 'user' ? 'text-primary-foreground/65' : 'text-muted-foreground'}`}>{message.time}</p>
                  </div>
                </div>
              ))}
              <div ref={endRef} />
            </div>
          </div>

          <footer className="border-t bg-background p-3 sm:p-4">
            <div className="mx-auto max-w-3xl">
              {attachment && <div className="mb-2 flex w-fit max-w-full items-center gap-2 rounded-full border bg-muted/30 py-1.5 pl-3 pr-1.5 text-xs"><Paperclip size={13} className="shrink-0 text-primary" /><span className="truncate">{attachment.name}</span><Button type="button" size="icon" variant="ghost" className="h-6 w-6 rounded-full" aria-label="Remove attachment" onClick={() => setAttachment(null)}><X size={12} /></Button></div>}
              <div className="flex items-end gap-2">
                <label htmlFor="support-chat-attachment" className="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-full text-muted-foreground transition hover:bg-muted hover:text-foreground" aria-label="Attach a file"><Paperclip size={18} /></label>
                <input id="support-chat-attachment" type="file" className="sr-only" accept=".pdf,.jpg,.jpeg,.png,.webp" onChange={(event) => { setAttachment(event.target.files?.[0] ?? null); event.currentTarget.value = ''; }} />
                <Textarea value={draft} onChange={(event) => setDraft(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); sendMessage(); } }} className="min-h-10 max-h-32 resize-none rounded-2xl px-4 py-2.5" placeholder="Message Naitrust Support" />
                <Button type="button" size="icon" className="h-10 w-10 shrink-0 rounded-full" disabled={!draft.trim() && !attachment} onClick={sendMessage} aria-label="Send message"><Send size={17} /></Button>
              </div>
              <p className="mt-2 flex items-center justify-center gap-1.5 text-[10px] text-muted-foreground"><LockKeyhole size={11} /> Never share your password, PIN, OTP, or recovery code in chat.</p>
            </div>
          </footer>
        </Card>
      </div>
    </DashboardLayout>
  );
}
