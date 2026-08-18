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
import { getAppImage } from '../../libs/images/image-manifest';

const CONVERSATIONS = [
  { id: 'general_001', name: 'Naitrust Support', preview: 'Get help with a supplier, quote, order, delivery, or account.', time: 'Support', unread: 0, order: false, support: true, link: '/app/messages/support' },
  { id: 'order_cn_001', name: 'Shenzhen Nova Electronics', preview: 'The inspection photos and packing list are ready.', time: '10:42', unread: 2, order: true, support: false, link: '/app/orders' },
  { id: 'order_ng_001', name: 'Lagos Packworks', preview: 'We have confirmed the carton size and updated quantity.', time: 'Yesterday', unread: 0, order: true, support: false, link: '/app/orders' },
];

export function MessagesPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const filtered = useMemo(
    () => CONVERSATIONS.filter((item) => item.name.toLowerCase().includes(search.toLowerCase())),
    [search],
  );

  return (
    <DashboardLayout title="Messages">
      <div className="mx-auto w-full max-w-9xl">
        <div className="mb-5 flex items-center justify-between gap-3 sm:hidden">
          <h1 className="text-lg font-bold tracking-tight">Messages</h1>
          <div className="flex gap-1">
            <Button variant="outline" size="icon" className="h-8 w-8 rounded-full" aria-label="Search conversations" onClick={() => setShowMobileSearch((value) => !value)}><Search size={14} /></Button>
            <Button size="icon" className="h-8 w-8 rounded-full" aria-label="Create support request" onClick={() => navigate('/app/support/new')}><Headphones size={14} /></Button>
          </div>
        </div>
        <div className="hidden sm:block"><PageHero
          eyebrow="Orders and support"
          title="Messages"
          description="Talk with suppliers, sourcing agents, and Naitrust support from one inbox."
          icon={MessageCircle}
          image={getAppImage('messages', 'Supplier and customer order conversations')}
          actions={<Button className="rounded-md" onClick={() => navigate('/app/support/new')}>
            <Headphones size={15} /> Create support request
          </Button>}
        /></div>

        <Card className="overflow-hidden rounded-none border-x-0 p-0 shadow-none sm:rounded-3xl sm:border-x sm:shadow-sm">
          <div className={`${showMobileSearch ? 'block' : 'hidden'} border-b pb-4 sm:block sm:p-4`}>
            <div className="relative max-w-md">
              <Search size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input value={search} onChange={(event) => setSearch(event.target.value)} className="h-11 rounded-xl pl-10 sm:h-10" placeholder="Search conversations" />
            </div>
          </div>
          {filtered.map((conversation) => (
            <button
              key={conversation.id}
              type="button"
              onClick={() => navigate(conversation.link)}
              className={`flex w-full items-center gap-4 border-b px-3 py-4 text-left transition last:border-b-0 sm:gap-3 sm:px-5 ${conversation.support ? 'sticky top-0 z-[1] border-[#071b31]/10 bg-[#c4e9fdb3] text-[#071b31] hover:bg-[#b7e3fbbf] dark:border-primary/20 dark:bg-primary/10 dark:text-foreground dark:hover:bg-primary/15' : 'hover:bg-accent/40'}`}
            >
              <CounterpartyAvatar name={conversation.name} className="h-9 w-9 text-xs sm:h-10 sm:w-10" />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="truncate text-sm font-semibold">{conversation.name}</p>
                  {conversation.support && <Badge className="rounded-md text-[10px]">Pinned</Badge>}
                  {conversation.order && <Badge variant="outline" className="hidden text-[10px] sm:inline-flex">Order</Badge>}
                </div>
                <p className={`mt-1 truncate text-xs sm:text-sm ${conversation.support ? 'text-[#35546f] dark:text-muted-foreground' : 'text-muted-foreground'}`}>{conversation.preview}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground">{conversation.time}</p>
                {conversation.unread > 0 && <span className="mt-2 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-white">{conversation.unread}</span>}
              </div>
            </button>
          ))}
          {filtered.length === 0 && (
            <div className="flex flex-col items-center bg-[#c4e9fdb3] p-10 text-center text-[#071b31] dark:bg-primary/10 dark:text-foreground">
              <MessageCircle size={24} className="text-primary" />
              <p className="mt-3 font-semibold">No conversations found</p>
            </div>
          )}
        </Card>

        <div className="mt-5 hidden items-start gap-2 rounded-2xl bg-primary/[0.05] p-4 text-sm text-muted-foreground sm:flex">
          <Send size={16} className="mt-0.5 shrink-0 text-primary" />
          Supplier and order messages remain attached to their Order Room so quotes, evidence, delivery updates, and decisions stay together.
        </div>
      </div>
    </DashboardLayout>
  );
}
