import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Headphones, MessageCircle, Search, Send } from 'lucide-react';
import { DashboardLayout } from '../pieces/dashboard/DashboardLayout';
import { PageHero } from '../pieces/dashboard/PageHero';
import { CounterpartyAvatar } from '../pieces/dashboard/CounterpartyAvatar';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Input } from '../ui/input';

const CONVERSATIONS = [
  { id: 'general_001', name: 'Naitrust Support', preview: 'Get help with your account, payment, or Protected Deal.', time: 'Support', unread: 0, protected: false, support: true },
  { id: 'txn_mock_001', name: 'Adaeze Homes & Properties', preview: 'The delivery evidence is ready for your review.', time: '10:42', unread: 2, protected: true },
  { id: 'txn_mock_002', name: 'Emeka Trade & Logistics', preview: 'We have confirmed the updated quantity.', time: 'Yesterday', unread: 0, protected: true },
];

export function MessagesPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const filtered = useMemo(
    () => CONVERSATIONS.filter((item) => item.name.toLowerCase().includes(search.toLowerCase())),
    [search],
  );

  return (
    <DashboardLayout title="Messages">
      <div className="mx-auto w-full max-w-9xl">
        <PageHero
          eyebrow="Your conversations"
          title="Messages"
          description="Conversations with people, businesses, and Naitrust support."
          icon={MessageCircle}
          actions={<Button className="rounded-md" onClick={() => navigate('/app/support/new')}>
            <Headphones size={15} /> Create support request
          </Button>}
        />

        <Card className="overflow-hidden rounded-3xl p-0 shadow-sm">
          <div className="border-b p-4">
            <div className="relative max-w-md">
              <Search size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input value={search} onChange={(event) => setSearch(event.target.value)} className="pl-10" placeholder="Search conversations" />
            </div>
          </div>
          {filtered.map((conversation) => (
            <button
              key={conversation.id}
              type="button"
              onClick={() => conversation.support ? navigate('/app/messages/support') : conversation.protected && navigate(`/app/deals/${conversation.id}?tab=chat`)}
              className={`flex w-full items-center gap-3 border-b px-4 py-4 text-left transition hover:bg-accent/40 last:border-b-0 sm:px-5 ${conversation.support ? 'sticky top-0 z-[1] bg-primary/[0.055]' : ''}`}
            >
              <CounterpartyAvatar name={conversation.name} />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="truncate text-sm font-semibold">{conversation.name}</p>
                  {conversation.support && <Badge className="rounded-md text-[10px]">Pinned</Badge>}
                  {conversation.protected && <Badge variant="outline" className="hidden text-[10px] sm:inline-flex">Protected Deal</Badge>}
                </div>
                <p className="mt-1 truncate text-sm text-muted-foreground">{conversation.preview}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground">{conversation.time}</p>
                {conversation.unread > 0 && <span className="mt-2 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-white">{conversation.unread}</span>}
              </div>
            </button>
          ))}
          {filtered.length === 0 && (
            <div className="flex flex-col items-center p-10 text-center">
              <MessageCircle size={24} className="text-muted-foreground" />
              <p className="mt-3 font-semibold">No conversations found</p>
            </div>
          )}
        </Card>

        <div className="mt-5 flex items-start gap-2 rounded-2xl bg-primary/[0.05] p-4 text-sm text-muted-foreground">
          <Send size={16} className="mt-0.5 shrink-0 text-primary" />
          Important transaction messages remain attached to their Protected Deal so both sides keep the same record.
        </div>
      </div>
    </DashboardLayout>
  );
}
