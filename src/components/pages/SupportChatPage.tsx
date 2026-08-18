import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, BadgeCheck, Headphones, LockKeyhole, Paperclip, Send, X } from 'lucide-react';
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
      body: `Hello${user?.name ? ` ${user.name.split(' ')[0]}` : ''}. You’re chatting with Naitrust Support. Tell us what you need help with, and include the quote or order reference when relevant.`,
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
      <div className="mx-auto w-full max-w-5xl">
        <Card className="flex h-[calc(100svh-5rem)] flex-col overflow-hidden rounded-2xl border-border/70 p-0 shadow-[0_20px_60px_rgba(10,38,68,.10)] sm:h-auto sm:rounded-3xl">
          <header className="flex items-center gap-3 border-b bg-gradient-to-r from-primary/[0.08] via-background to-background px-3 py-3 sm:px-5 sm:py-4">
            <Button variant="ghost" size="icon" className="h-9 w-9 shrink-0 rounded-full" aria-label="Back to messages" onClick={() => navigate('/app/messages')}><ArrowLeft size={17} /></Button>
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-sm shadow-primary/20 sm:h-11 sm:w-11"><Headphones size={19} /></span>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5"><h1 className="truncate text-sm font-bold sm:text-base">Naitrust Support</h1><BadgeCheck size={15} className="shrink-0 fill-primary text-primary-foreground" /></div>
              <p className="mt-0.5 truncate text-[11px] text-muted-foreground sm:text-xs">Official support conversation</p>
            </div>
            <Button variant="outline" size="icon" className="h-9 w-9 shrink-0 rounded-full bg-background sm:hidden" aria-label="Create support request" title="Create support request" onClick={() => navigate('/app/support/new')}><Headphones size={15} /></Button>
            <Button variant="outline" size="sm" className="hidden h-9 shrink-0 rounded-full bg-background px-3 sm:inline-flex" onClick={() => navigate('/app/support/new')}><Headphones size={14} /> Create support request</Button>
          </header>

          <div className="min-h-0 flex-1 overflow-y-auto bg-gradient-to-b from-muted/25 to-background px-3 py-5 sm:h-[min(60vh,40rem)] sm:min-h-[24rem] sm:flex-none sm:px-6 sm:py-7">
            <div className="mx-auto max-w-3xl space-y-5">
              <div className="flex items-center gap-3 text-[11px] text-muted-foreground before:h-px before:flex-1 before:bg-border after:h-px after:flex-1 after:bg-border">Today</div>
              {messages.map((message) => (
                <div key={message.id} className={`flex items-end gap-2 ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {message.sender === 'support' && <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground"><Headphones size={13} /></span>}
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

          <footer className="shrink-0 border-t bg-background/95 p-3 backdrop-blur sm:p-4">
            <div className="mx-auto max-w-3xl">
              {attachment && <div className="mb-2 flex w-fit max-w-full items-center gap-2 rounded-full border bg-muted/30 py-1.5 pl-3 pr-1.5 text-xs"><Paperclip size={13} className="shrink-0 text-primary" /><span className="truncate">{attachment.name}</span><Button type="button" size="icon" variant="ghost" className="h-6 w-6 rounded-full" aria-label="Remove attachment" onClick={() => setAttachment(null)}><X size={12} /></Button></div>}
              <div className="flex items-end gap-1 rounded-2xl border bg-muted/20 p-1.5 shadow-sm focus-within:border-primary/40 focus-within:ring-2 focus-within:ring-primary/10">
                <label htmlFor="support-chat-attachment" className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-xl text-muted-foreground transition hover:bg-background hover:text-foreground" aria-label="Attach a file"><Paperclip size={17} /></label>
                <input id="support-chat-attachment" type="file" hidden accept=".pdf,.jpg,.jpeg,.png,.webp" onChange={(event) => { setAttachment(event.target.files?.[0] ?? null); event.currentTarget.value = ''; }} />
                <Textarea value={draft} onChange={(event) => setDraft(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); sendMessage(); } }} className="min-h-9 max-h-32 resize-none border-0 bg-transparent px-2 py-2 shadow-none focus-visible:ring-0" placeholder="Message Naitrust Support" />
                <Button type="button" size="icon" className="h-9 w-9 shrink-0 rounded-xl" disabled={!draft.trim() && !attachment} onClick={sendMessage} aria-label="Send message"><Send size={16} /></Button>
              </div>
              <p className="mt-2.5 flex items-start justify-center gap-1.5 text-center text-[10px] leading-4 text-muted-foreground"><LockKeyhole size={11} className="mt-0.5 shrink-0" /> Naitrust will never ask for your password, PIN, OTP, or recovery code.</p>
            </div>
          </footer>
        </Card>
      </div>
    </DashboardLayout>
  );
}
