/**
 * App API
 * Handles app-related API calls
 */

import { httpClient } from './client';
import { endpoints } from './endpoints';

export const generalApi = {
  /**
   * Get app version
   */
  getVersion: async () => {
    return await httpClient.get(endpoints.app.version);
  },
};

