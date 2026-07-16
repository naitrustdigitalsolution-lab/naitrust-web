/**
 * PWA Utilities for Naitrust
 * Helper functions for Progressive Web App features
 */

// Check if the app is running as a PWA
export function isPWA(): boolean {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as any).standalone === true ||
    document.referrer.includes('android-app://')
  );
}

// Check if service worker is supported
export function isServiceWorkerSupported(): boolean {
  return 'serviceWorker' in navigator;
}

// Check if push notifications are supported
export function isPushNotificationSupported(): boolean {
  return 'PushManager' in window && 'serviceWorker' in navigator;
}

// Request notification permission
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!('Notification' in window)) {
    console.warn('This browser does not support notifications');
    return 'denied';
  }

  if (Notification.permission === 'granted') {
    return 'granted';
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission;
  }

  return Notification.permission;
}

// Show a local notification
export async function showNotification(
  title: string,
  options?: NotificationOptions
): Promise<void> {
  if (!isServiceWorkerSupported()) {
    console.warn('Service workers not supported');
    return;
  }

  const permission = await requestNotificationPermission();

  if (permission === 'granted') {
    const registration = await navigator.serviceWorker.ready;
    
    await registration.showNotification(title, {
      icon: '/naitrust-icon.svg',
      badge: '/naitrust-icon.svg',
      ...options,
    } as NotificationOptions);
  }
}

// Subscribe to push notifications
export async function subscribeToPushNotifications(): Promise<PushSubscription | null> {
  if (!isPushNotificationSupported()) {
    console.warn('Push notifications not supported');
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    
    // Check if already subscribed
    let subscription = await registration.pushManager.getSubscription();
    
    if (subscription) {
      return subscription;
    }

    // Subscribe to push notifications
    // Note: You'll need to replace this with your VAPID public key
    subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(
        // Replace with your VAPID public key
        'YOUR_VAPID_PUBLIC_KEY_HERE'
      ) as BufferSource,
    });

    return subscription;
  } catch (error) {
    console.error('Failed to subscribe to push notifications:', error);
    return null;
  }
}

// Unsubscribe from push notifications
export async function unsubscribeFromPushNotifications(): Promise<boolean> {
  if (!isPushNotificationSupported()) {
    return false;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();
    
    if (subscription) {
      return await subscription.unsubscribe();
    }
    
    return false;
  } catch (error) {
    console.error('Failed to unsubscribe from push notifications:', error);
    return false;
  }
}

// Check if app needs update
export async function checkForUpdates(): Promise<boolean> {
  if (!isServiceWorkerSupported()) {
    return false;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    await registration.update();
    return true;
  } catch (error) {
    console.error('Failed to check for updates:', error);
    return false;
  }
}

// Clear all caches
export async function clearAllCaches(): Promise<void> {
  if (!('caches' in window)) {
    return;
  }

  try {
    const cacheNames = await caches.keys();
    await Promise.all(cacheNames.map((cacheName) => caches.delete(cacheName)));
    console.log('All caches cleared');
  } catch (error) {
    console.error('Failed to clear caches:', error);
  }
}

// Get cache size
export async function getCacheSize(): Promise<number> {
  if (!('caches' in window)) {
    return 0;
  }

  try {
    const cacheNames = await caches.keys();
    let totalSize = 0;

    for (const cacheName of cacheNames) {
      const cache = await caches.open(cacheName);
      const keys = await cache.keys();
      
      for (const request of keys) {
        const response = await cache.match(request);
        if (response) {
          const blob = await response.blob();
          totalSize += blob.size;
        }
      }
    }

    return totalSize;
  } catch (error) {
    console.error('Failed to calculate cache size:', error);
    return 0;
  }
}

// Format bytes to human readable
export function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

// Check online status
export function isOnline(): boolean {
  return navigator.onLine;
}

// Add online/offline event listeners
export function onConnectionChange(callback: (isOnline: boolean) => void): () => void {
  const handleOnline = () => callback(true);
  const handleOffline = () => callback(false);

  window.addEventListener('online', handleOnline);
  window.addEventListener('offline', handleOffline);

  // Return cleanup function
  return () => {
    window.removeEventListener('online', handleOnline);
    window.removeEventListener('offline', handleOffline);
  };
}

// Share via Web Share API
export async function shareContent(data: ShareData): Promise<boolean> {
  if (!('share' in navigator)) {
    console.warn('Web Share API not supported');
    return false;
  }

  try {
    await navigator.share(data);
    return true;
  } catch (error) {
    if ((error as Error).name !== 'AbortError') {
      console.error('Error sharing:', error);
    }
    return false;
  }
}

// Install app prompt
export function canInstallApp(): boolean {
  return !isPWA() && isServiceWorkerSupported();
}

// Background sync
export async function registerBackgroundSync(tag: string): Promise<void> {
  if (!isServiceWorkerSupported()) {
    return;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    
    if ('sync' in registration) {
      await (registration as any).sync.register(tag);
      console.log(`Background sync registered: ${tag}`);
    }
  } catch (error) {
    console.error('Failed to register background sync:', error);
  }
}

// Periodic background sync (experimental)
export async function registerPeriodicSync(
  tag: string,
  minInterval: number
): Promise<void> {
  if (!isServiceWorkerSupported()) {
    return;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    
    if ('periodicSync' in registration) {
      await (registration as any).periodicSync.register(tag, {
        minInterval,
      });
      console.log(`Periodic sync registered: ${tag}`);
    }
  } catch (error) {
    console.error('Failed to register periodic sync:', error);
  }
}

// Helper function to convert VAPID key
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }

  return outputArray;
}

// Get installation status
export interface PWAStatus {
  isInstalled: boolean;
  canInstall: boolean;
  hasServiceWorker: boolean;
  hasPushNotifications: boolean;
  notificationPermission: NotificationPermission;
  isOnline: boolean;
}

export async function getPWAStatus(): Promise<PWAStatus> {
  return {
    isInstalled: isPWA(),
    canInstall: canInstallApp(),
    hasServiceWorker: isServiceWorkerSupported(),
    hasPushNotifications: isPushNotificationSupported(),
    notificationPermission: Notification?.permission || 'denied',
    isOnline: isOnline(),
  };
}
