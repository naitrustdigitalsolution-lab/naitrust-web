/**
 * Analytics API
 * Handles all analytics and tracking API calls
 */

import { httpClient } from './client';
import { endpoints } from './endpoints';

export interface TrackEventData {
  eventType: string;
  eventData?: Record<string, any>;
  businessId?: string;
}

export interface TrackSearchData {
  query: string;
  category?: string;
  resultsCount?: number;
}

export const analyticsApi = {
  /**
   * Track profile view
   */
  trackView: (businessId: string) =>
    httpClient.post(endpoints.analytics.trackView(businessId)),
    
  /**
   * Track custom event
   */
  trackEvent: (data: TrackEventData) =>
    httpClient.post(endpoints.analytics.trackEvent, data),
    
  /**
   * Track search
   */
  trackSearch: (data: TrackSearchData) =>
    httpClient.post(endpoints.analytics.trackSearch, data),
    
  /**
   * Get comprehensive business analytics
   */
  getBusinessAnalytics: (businessId: string, timeRange?: '7days' | '30days' | '12months') => {
    const queryParams = new URLSearchParams();
    if (timeRange) queryParams.append('timeRange', timeRange);
    
    const queryString = queryParams.toString();
    return httpClient.get(endpoints.analytics.getBusinessAnalytics(businessId) + (queryString ? `?${queryString}` : ''));
  },
    
  /**
   * Get profile views
   */
  getProfileViews: (businessId: string, params?: { startDate?: string; endDate?: string }) => {
    const queryParams = new URLSearchParams();
    if (params?.startDate) queryParams.append('startDate', params.startDate);
    if (params?.endDate) queryParams.append('endDate', params.endDate);
    
    const queryString = queryParams.toString();
    return httpClient.get(endpoints.analytics.getProfileViews(businessId) + (queryString ? `?${queryString}` : ''));
  },
    
  /**
   * Get search analytics
   */
  getSearchAnalytics: (params?: { startDate?: string; endDate?: string; limit?: number }) => {
    const queryParams = new URLSearchParams();
    if (params?.startDate) queryParams.append('startDate', params.startDate);
    if (params?.endDate) queryParams.append('endDate', params.endDate);
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    
    const queryString = queryParams.toString();
    return httpClient.get(endpoints.analytics.getSearchAnalytics + (queryString ? `?${queryString}` : ''));
  },

  // ✅ NEW: Dashboard Analytics
  /**
   * Get business dashboard analytics (profile views, search appearances, engagement)
   */
  getDashboardAnalytics: (businessId: string) =>
    httpClient.get(endpoints.analytics.getDashboard(businessId)),
    
  /**
   * Track link click
   */
  trackLinkClick: (businessId: string) =>
    httpClient.post(endpoints.analytics.trackClick(businessId)),
};
