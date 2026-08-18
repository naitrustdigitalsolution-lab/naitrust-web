/**
 * NotificationsPage
 * Notification center (`/app/notifications`): type-colored icon feed with
 * unread indicators, per-item mark-read on open, and a mark-all action , 
 * the old app's NotificationsPage card-feed pattern on the new domain model.
 */

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import {
  AlertTriangle,
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
import { PageHero } from '../pieces/dashboard/PageHero';
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

const DEMO_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'demo-funding-confirmed',
    type: 'funding',
    title: 'Order funding confirmed',
    message: '₦6,000,000.00 has been confirmed for your supplier order.',
    read: false,
    createdAt: '2026-08-14T08:45:00Z',
    link: '/app/orders',
  },
  {
    id: 'demo-evidence-added',
    type: 'evidence',
    title: 'Inspection evidence ready',
    message: 'Your sourcing agent added product inspection photos and notes.',
    read: false,
    createdAt: '2026-08-14T06:10:00Z',
    link: '/app/orders',
  },
  {
    id: 'demo-deal-action',
    type: 'deal',
    title: 'Your review is needed',
    message: 'Review the delivered products before the supplier payment is released.',
    read: false,
    createdAt: '2026-08-13T15:30:00Z',
    link: '/app/orders',
  },
  {
    id: 'demo-payment-released',
    type: 'funding',
    title: 'Payment released',
    message: '₦600,000.00 was released to the supplier after delivery approval.',
    read: true,
    createdAt: '2026-08-12T22:07:00Z',
    link: '/app/transactions',
  },
];

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
        'flex cursor-pointer items-start gap-3 border-b px-3 py-4 transition-colors last:border-b-0 hover:bg-accent/40 sm:px-5 ' +
        (!notification.read ? 'bg-primary/[0.03]' : '')
      }
    >
      <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg sm:h-9 sm:w-9 ${chipClass}`}>
        <Icon size={16} className="sm:h-[18px] sm:w-[18px]" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className={`truncate text-sm ${notification.read ? 'font-medium text-foreground' : 'font-semibold text-foreground'}`}>
            {notification.title}
          </p>
          {!notification.read && <span className="h-2 w-2 shrink-0 rounded-full bg-primary" aria-label="Unread" />}
        </div>
        <p className="mt-1 line-clamp-2 text-xs leading-5 text-muted-foreground sm:mt-0.5 sm:text-sm sm:leading-6">
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
  const [readDemoIds, setReadDemoIds] = useState<string[]>([]);

  const usingDemoNotifications = !isLoading && !isError && (!notifications || notifications.length === 0);
  const displayedNotifications = usingDemoNotifications
    ? DEMO_NOTIFICATIONS.map((notification) => ({
        ...notification,
        read: notification.read || readDemoIds.includes(notification.id),
      }))
    : notifications ?? [];
  const unreadCount = displayedNotifications.filter((n) => !n.read).length;
  const total = displayedNotifications.length;
  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const current = Math.min(page, pageCount);
  const paged = displayedNotifications.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE);

  useEffect(() => {
    setPage(1);
  }, [total]);

  const handleOpen = (notification: AppNotification) => {
    if (!notification.read) {
      if (usingDemoNotifications) {
        setReadDemoIds((ids) => [...ids, notification.id]);
      } else {
        markRead.mutate(notification.id);
      }
    }
    if (notification.link) navigate(notification.link);
  };

  const handleMarkAllRead = () => {
    if (usingDemoNotifications) {
      setReadDemoIds(DEMO_NOTIFICATIONS.map((notification) => notification.id));
    } else {
      markAllRead.mutate();
    }
  };

  return (
    <DashboardLayout title="Notifications">
      <div className="mx-auto w-full max-w-9xl">
        <div className="mb-4 flex items-center justify-between sm:hidden">
          <div>
            <h1 className="text-lg font-semibold text-foreground">Notifications</h1>
            {unreadCount > 0 && <p className="mt-0.5 text-xs text-muted-foreground">{unreadCount} unread</p>}
          </div>
          {unreadCount > 0 && (
            <Button
              variant="outline"
              size="icon"
              className="h-9 w-9 rounded-full"
              onClick={handleMarkAllRead}
              disabled={markAllRead.isPending}
              aria-label="Mark all notifications as read"
            >
              <CheckCheck size={16} />
            </Button>
          )}
        </div>
        <div className="hidden sm:block">
          <PageHero
            eyebrow={unreadCount > 0 ? `${unreadCount} unread` : 'You are up to date'}
            title="Notifications"
            description="Order updates, quote readiness, inspections, delivery, refunds, and wallet activity."
            icon={Bell}
            actions={unreadCount > 0 ? (
              <Button
                variant="outline"
                size="sm"
                className="rounded-full"
                onClick={handleMarkAllRead}
                disabled={markAllRead.isPending}
              >
                <CheckCheck size={14} className="mr-1.5" />
                Mark all read
              </Button>
            ) : undefined}
          />
        </div>

        {isLoading ? (
          <LoadingRows />
        ) : isError ? (
          <Card className="p-6 text-center text-sm text-muted-foreground shadow-sm">
            We could not load your notifications. Please refresh to try again.
          </Card>
        ) : displayedNotifications.length === 0 ? (
          <Card className="flex flex-col items-center gap-3 p-10 text-center shadow-sm">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Bell size={24} />
            </div>
            <p className="font-semibold text-foreground">You're all caught up</p>
            <p className="max-w-sm text-sm leading-6 text-muted-foreground">
              Updates about suppliers, quotes, protected orders, delivery, supporting evidence, refunds, and issues will appear here.
            </p>
          </Card>
        ) : (
          <>
            <Card className="gap-0 overflow-hidden rounded-none border-x-0 p-0 shadow-none sm:rounded-xl sm:border-x sm:shadow-sm" aria-label="Notifications">
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
