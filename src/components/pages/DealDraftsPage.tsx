import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { ChevronRight, FileClock, Plus, Trash2 } from 'lucide-react';
import { DashboardLayout } from '../pieces/dashboard/DashboardLayout';
import { CounterpartyAvatar } from '../pieces/dashboard/CounterpartyAvatar';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { useAuth } from '../../libs/auth-context';
import { clearDealDraft, listDealDrafts } from '../../libs/utils/deal-draft';

const DRAFT_STEP_LABELS = ['Deal basics', 'Terms & parties', 'Agreement', 'Review & send'] as const;

export function DealDraftsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [revision, setRevision] = useState(0);
  const drafts = useMemo(() => listDealDrafts(user?.id), [user?.id, revision]);

  const remove = (id: string) => {
    clearDealDraft(user?.id, id);
    setRevision((value) => value + 1);
  };

  return (
    <DashboardLayout title="Deal drafts">
      <div className="mx-auto w-full max-w-9xl">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Deal drafts</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Continue saved work. Drafts become abandoned after 7 days and are deleted after 30 days.
            </p>
          </div>
          <Button className="rounded-full" onClick={() => navigate('/app/deals/new')}>
            <Plus size={16} className="mr-1" /> New property transaction
          </Button>
        </div>

        {drafts.length === 0 ? (
          <Card className="flex flex-col items-center gap-3 p-10 text-center shadow-sm">
            <FileClock size={28} className="text-muted-foreground" />
            <p className="font-semibold text-foreground">No saved drafts</p>
            <p className="max-w-sm text-sm text-muted-foreground">Start a new deal and your progress will appear here.</p>
          </Card>
        ) : (
          <Card className="gap-0 overflow-hidden p-0 shadow-sm" aria-label="Deal drafts">
            {drafts.map((draft) => (
              <div
                key={draft.id}
                role="button"
                tabIndex={0}
                className="flex cursor-pointer items-center justify-between gap-4 border-b px-5 py-4 transition-colors last:border-b-0 hover:bg-accent/40"
                onKeyDown={(event) => {
                  if (event.key === 'Enter') navigate(`/app/deals/new?draft=${encodeURIComponent(draft.id)}`);
                }}
                onClick={() => navigate(`/app/deals/new?draft=${encodeURIComponent(draft.id)}`)}
              >
                <div className="flex min-w-0 items-center gap-3">
                  <CounterpartyAvatar name={draft.counterparty} />
                  <div className="min-w-0">
                    <div className="flex min-w-0 items-center gap-2">
                      <p className="truncate font-semibold text-foreground">{draft.title}</p>
                      <Badge className="shrink-0 sm:hidden" variant={draft.status === 'abandoned' ? 'destructive' : 'secondary'}>
                        {draft.status === 'abandoned' ? 'Abandoned' : 'Draft'}
                      </Badge>
                    </div>
                    <p className="mt-0.5 truncate text-xs text-muted-foreground">{draft.counterparty}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      <span className="font-medium text-foreground">
                        Step {Math.min(Math.max(draft.step, 1), DRAFT_STEP_LABELS.length)} of {DRAFT_STEP_LABELS.length}
                        {' · '}
                        {DRAFT_STEP_LABELS[Math.min(Math.max(draft.step, 1), DRAFT_STEP_LABELS.length) - 1]}
                      </span>
                      {' · '}
                      {formatDistanceToNow(new Date(draft.updatedAt), { addSuffix: true })}
                    </p>
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-3 sm:gap-4">
                  {draft.amount && (
                    <span className="hidden text-sm font-semibold tabular-nums text-foreground md:inline">
                      NGN {Number(draft.amount).toLocaleString('en-NG')}
                    </span>
                  )}
                  <Badge className="hidden sm:inline-flex" variant={draft.status === 'abandoned' ? 'destructive' : 'secondary'}>
                    {draft.status === 'abandoned' ? 'Abandoned' : 'Draft'}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label={`Delete ${draft.title}`}
                    onClick={(event) => {
                      event.stopPropagation();
                      remove(draft.id);
                    }}
                  >
                    <Trash2 size={16} />
                  </Button>
                  <ChevronRight size={16} className="text-muted-foreground" />
                </div>
              </div>
            ))}
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
