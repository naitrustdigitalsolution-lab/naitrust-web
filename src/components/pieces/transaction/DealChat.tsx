/**
 * DealChat
 * In-room chat between the deal parties: a scrollable message thread with
 * your messages right-aligned in brand blue and the counterparty's on the
 * left. Owns its own message query and send mutation. Enter sends; Shift+Enter
 * newlines. Keeps a keep-record notice — chat is part of the deal evidence.
 */

import { useEffect, useRef, useState } from 'react';
import { format } from 'date-fns';
import { Send, Lock } from 'lucide-react';
import { Button } from '../../ui/button';
import { Textarea } from '../../ui/textarea';
import { Skeleton } from '../../ui/skeleton';
import { CounterpartyAvatar } from '../dashboard/CounterpartyAvatar';
import { useDealMessages, useSendDealMessage } from '../../../hooks/useDealDetail';

interface DealChatProps {
  dealId: string;
  counterpartyName: string;
}

export function DealChat({ dealId, counterpartyName }: DealChatProps) {
  const { data: messages, isLoading } = useDealMessages(dealId, counterpartyName);
  const send = useSendDealMessage(dealId);
  const [draft, setDraft] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [messages]);

  const handleSend = () => {
    const body = draft.trim();
    if (!body || send.isPending) return;
    setDraft('');
    send.mutate(body);
  };

  return (
    <div className="flex h-[520px] flex-col">
      <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto px-1 py-2">
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-12 w-2/3 rounded-2xl" />
            <Skeleton className="ml-auto h-12 w-1/2 rounded-2xl" />
            <Skeleton className="h-12 w-3/5 rounded-2xl" />
          </div>
        ) : (
          messages?.map((m) => (
            <div key={m.id} className={`flex items-end gap-2 ${m.isYou ? 'justify-end' : 'justify-start'}`}>
              {!m.isYou && <CounterpartyAvatar name={m.senderName} className="h-7 w-7 text-[0.65rem]" />}
              <div className={`max-w-[78%] ${m.isYou ? 'items-end' : 'items-start'} flex flex-col`}>
                <div
                  className={
                    'rounded-2xl px-3.5 py-2 text-sm leading-6 ' +
                    (m.isYou
                      ? 'rounded-br-sm bg-primary text-primary-foreground'
                      : 'rounded-bl-sm bg-muted text-foreground')
                  }
                >
                  {m.body}
                </div>
                <span className="mt-1 px-1 text-[0.7rem] text-muted-foreground">
                  {m.isYou ? 'You' : m.senderName} · {format(new Date(m.createdAt), 'MMM d, h:mm a')}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="mt-3 border-t pt-3">
        <div className="flex items-end gap-2">
          <Textarea
            rows={1}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder={`Message ${counterpartyName}…`}
            className="max-h-32 min-h-[44px] flex-1 resize-none"
          />
          <Button
            type="button"
            size="icon"
            className="h-11 w-11 shrink-0 rounded-full"
            onClick={handleSend}
            disabled={!draft.trim() || send.isPending}
            aria-label="Send message"
          >
            <Send size={18} />
          </Button>
        </div>
        <p className="mt-2 flex items-center gap-1.5 text-[0.7rem] text-muted-foreground">
          <Lock size={11} />
          Messages are kept with the deal record as part of its evidence trail.
        </p>
      </div>
    </div>
  );
}
