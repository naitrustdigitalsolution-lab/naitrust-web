/**
 * NotificationsPage
 * Notification center (`/app/notifications`): type-colored icon feed with
 * unread indicators, per-item mark-read on open, and a mark-all action —
 * the old app's NotificationsPage card-feed pattern on the new domain model.
 */

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import {
  AlertTriangle,
  ArrowLeft,
  Bell,
  CheckCheck,
  ChevronLeft,
  ChevronRight,
  FileCheck,
  Handshake,
  Landmark,
  ShieldCheck,
  type LucideIcon,
} from 'lucide-react';
import { DashboardLayout } from '../pieces/dashboard/DashboardLayout';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Skeleton } from '../ui/skeleton';
import {
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  useNotifications,
} from '../../hooks/useNotifications';
import type { AppNotification, NotificationType } from '../../libs/store/types';

const TYPE_PRESENTATION: Record<NotificationType, { icon: LucideIcon; chipClass: string }> = {
  deal: { icon: Handshake, chipClass: 'bg-primary/10 text-primary' },
  funding: { icon: Landmark, chipClass: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' },
  evidence: { icon: FileCheck, chipClass: 'bg-primary/10 text-primary' },
  dispute: { icon: AlertTriangle, chipClass: 'bg-destructive/10 text-destructive' },
  verification: { icon: ShieldCheck, chipClass: 'bg-amber-500/10 text-amber-600 dark:text-amber-400' },
  system: { icon: Bell, chipClass: 'bg-muted text-muted-foreground' },
};

function LoadingRows() {
  return (
    <Card className="gap-0 p-0 shadow-sm" aria-label="Loading notifications">
      {[0, 1, 2, 3].map((i) => (
        <div key={i} className="flex items-center gap-3 border-b px-5 py-4 last:border-b-0">
          <Skeleton className="h-9 w-9 rounded-lg" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-3 w-72" />
          </div>
        </div>
      ))}
    </Card>
  );
}

function NotificationRow({
  notification,
  onOpen,
}: {
  notification: AppNotification;
  onOpen: () => void;
}) {
  const { icon: Icon, chipClass } = TYPE_PRESENTATION[notification.type] ?? TYPE_PRESENTATION.system;
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onOpen}
      onKeyDown={(e) => e.key === 'Enter' && onOpen()}
      className={
        'flex cursor-pointer items-start gap-3 border-b px-5 py-4 transition-colors last:border-b-0 hover:bg-accent/40 ' +
        (!notification.read ? 'bg-primary/[0.03]' : '')
      }
    >
      <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${chipClass}`}>
        <Icon size={18} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className={`truncate text-sm ${notification.read ? 'font-medium text-foreground' : 'font-semibold text-foreground'}`}>
            {notification.title}
          </p>
          {!notification.read && <span className="h-2 w-2 shrink-0 rounded-full bg-primary" aria-label="Unread" />}
        </div>
        <p className="mt-0.5 line-clamp-2 text-sm leading-6 text-muted-foreground">
          {notification.message}
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
        </p>
      </div>
    </div>
  );
}

const PAGE_SIZE = 10;

export function NotificationsPage() {
  const navigate = useNavigate();
  const { data: notifications, isLoading, isError } = useNotifications();
  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllNotificationsRead();
  const [page, setPage] = useState(1);

  const unreadCount = notifications?.filter((n) => !n.read).length ?? 0;
  const total = notifications?.length ?? 0;
  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const current = Math.min(page, pageCount);
  const paged = notifications?.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE);

  useEffect(() => {
    setPage(1);
  }, [total]);

  const handleOpen = (notification: AppNotification) => {
    if (!notification.read) markRead.mutate(notification.id);
    if (notification.link) navigate(notification.link);
  };

  return (
    <DashboardLayout title="Notifications">
      <div className="mx-auto w-full max-w-9xl">
        <button
          type="button"
          onClick={() => navigate('/app')}
          className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft size={16} />
          Back to dashboard
        </button>

        <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight text-foreground">Notifications</h1>
              {unreadCount > 0 && <Badge>{unreadCount} unread</Badge>}
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              Deal updates, funding confirmations, evidence, and dispute alerts.
            </p>
          </div>
          {unreadCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              className="rounded-full"
              onClick={() => markAllRead.mutate()}
              disabled={markAllRead.isPending}
            >
              <CheckCheck size={14} className="mr-1.5" />
              Mark all read
            </Button>
          )}
        </div>

        {isLoading ? (
          <LoadingRows />
        ) : isError ? (
          <Card className="p-6 text-center text-sm text-muted-foreground shadow-sm">
            We could not load your notifications. Please refresh to try again.
          </Card>
        ) : !notifications || notifications.length === 0 ? (
          <Card className="flex flex-col items-center gap-3 p-10 text-center shadow-sm">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Bell size={24} />
            </div>
            <p className="font-semibold text-foreground">You're all caught up</p>
            <p className="max-w-sm text-sm leading-6 text-muted-foreground">
              Updates about your property transactions, payments, supporting evidence, and issues will appear here.
            </p>
          </Card>
        ) : (
          <>
            <Card className="gap-0 overflow-hidden p-0 shadow-sm" aria-label="Notifications">
              {paged?.map((n) => (
                <NotificationRow key={n.id} notification={n} onOpen={() => handleOpen(n)} />
              ))}
            </Card>

            {total > PAGE_SIZE && (
              <div className="mt-4 flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Page {current} of {pageCount}
                </span>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-full"
                    disabled={current <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                  >
                    <ChevronLeft size={15} className="mr-1" />
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-full"
                    disabled={current >= pageCount}
                    onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
                  >
                    Next
                    <ChevronRight size={15} className="ml-1" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
