import { useAuthStore } from '../libs/store/auth.store';
import { useEffect } from 'react';
import { LEGAL_CHANGE_EVENT } from '../features/legal/access';
/**
 * useNotifications
 * React Query hooks for the notification feed and its read-state mutations.
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { notificationsApi } from '../libs/api/notifications.api';
import type { AppNotification } from '../libs/store/types';

export const NOTIFICATIONS_QUERY_KEY = ['notifications'] as const;

export function useNotifications() {
  const userId = useAuthStore(s => s.user?.id);
  const client = useQueryClient();
  useEffect(() => { const refresh = () => { void client.invalidateQueries({queryKey: NOTIFICATIONS_QUERY_KEY}); }; window.addEventListener(LEGAL_CHANGE_EVENT, refresh); window.addEventListener("storage", refresh); return () => { window.removeEventListener(LEGAL_CHANGE_EVENT, refresh); window.removeEventListener("storage", refresh); }; }, [client, userId]);
  return useQuery<AppNotification[]>({
    queryKey: [...NOTIFICATIONS_QUERY_KEY, userId],
    enabled: !!userId,
    queryFn: async () => (await notificationsApi.list()).data,
  });
}

export function useUnreadNotificationCount(): number {
  const { data } = useNotifications();
  return data?.filter((n) => !n.read).length ?? 0;
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => notificationsApi.markAsRead(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_QUERY_KEY }),
  });
}

export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => notificationsApi.markAllAsRead(),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_QUERY_KEY }),
  });
}
