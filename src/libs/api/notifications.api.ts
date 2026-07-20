/**
 * Notifications API
 * Typed access to the user's notification feed.
 *
 * In mock mode the fixture list is held in module state so mark-as-read
 * actions are reflected across the session (reset on reload), mirroring the
 * mock-auth engine's approach.
 */

import { httpClient } from './client';
import { endpoints } from './endpoints';
import { appConfig } from '../../configs/env';
import type { AppNotification } from '../store/types';
import type { ApiSuccess } from './types';
import mockNotifications from '../../mocks/apis/notifications.json';

const MOCK_LATENCY_MS = 300;

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Session-scoped list, seeded from the JSON fixture. */
let mockList: AppNotification[] = (mockNotifications as ApiSuccess<AppNotification[]>).data.map(
  (n) => ({ ...n }),
);

export const notificationsApi = {
  /** GET /notifications */
  list: async (): Promise<ApiSuccess<AppNotification[]>> => {
    if (appConfig.isMock) {
      await delay(MOCK_LATENCY_MS);
      return { success: true, data: mockList.map((n) => ({ ...n })) };
    }
    const response = await httpClient.get<AppNotification[]>(endpoints.notifications.list);
    return response as ApiSuccess<AppNotification[]>;
  },

  /** PATCH /notifications/:id/read */
  markAsRead: async (id: string): Promise<ApiSuccess<{ id: string }>> => {
    if (appConfig.isMock) {
      await delay(MOCK_LATENCY_MS);
      mockList = mockList.map((n) => (n.id === id ? { ...n, read: true } : n));
      return { success: true, data: { id } };
    }
    const response = await httpClient.patch<{ id: string }>(endpoints.notifications.markAsRead(id));
    return response as ApiSuccess<{ id: string }>;
  },

  /** PATCH /notifications/read-all */
  markAllAsRead: async (): Promise<ApiSuccess<null>> => {
    if (appConfig.isMock) {
      await delay(MOCK_LATENCY_MS);
      mockList = mockList.map((n) => ({ ...n, read: true }));
      return { success: true, data: null };
    }
    const response = await httpClient.patch<null>(endpoints.notifications.markAllAsRead);
    return response as ApiSuccess<null>;
  },
};
