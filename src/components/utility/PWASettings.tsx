import { useState, useEffect } from 'react';
import { 
  Smartphone, 
  Bell, 
  Wifi, 
  Download, 
  Trash2, 
  RefreshCw,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Switch } from '../ui/switch';
import { Badge } from '../ui/badge';
import { 
  getPWAStatus, 
  requestNotificationPermission,
  subscribeToPushNotifications,
  unsubscribeFromPushNotifications,
  checkForUpdates,
  clearAllCaches,
  getCacheSize,
  formatBytes,
  type PWAStatus
} from '../../libs/utils/pwa';

export function PWASettings() {
  const [pwaStatus, setPWAStatus] = useState<PWAStatus | null>(null);
  const [cacheSize, setCacheSize] = useState<number>(0);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [loading, setLoading] = useState<string | null>(null);

  useEffect(() => {
    loadPWAStatus();
    loadCacheSize();
  }, []);

  const loadPWAStatus = async () => {
    const status = await getPWAStatus();
    setPWAStatus(status);
    setNotificationsEnabled(status.notificationPermission === 'granted');
  };

  const loadCacheSize = async () => {
    const size = await getCacheSize();
    setCacheSize(size);
  };

  const handleToggleNotifications = async () => {
    setLoading('notifications');
    
    if (!notificationsEnabled) {
      const permission = await requestNotificationPermission();
      
      if (permission === 'granted') {
        await subscribeToPushNotifications();
        setNotificationsEnabled(true);
      }
    } else {
      await unsubscribeFromPushNotifications();
      setNotificationsEnabled(false);
    }
    
    await loadPWAStatus();
    setLoading(null);
  };

  const handleCheckUpdates = async () => {
    setLoading('updates');
    await checkForUpdates();
    setLoading(null);
  };

  const handleClearCache = async () => {
    if (confirm('Are you sure you want to clear all cached data? This will require re-downloading resources.')) {
      setLoading('cache');
      await clearAllCaches();
      await loadCacheSize();
      setLoading(null);
    }
  };

  if (!pwaStatus) {
    return <div>Loading PWA settings...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold mb-2">Progressive Web App</h2>
        <p className="text-gray-600">
          Manage your app installation and offline features
        </p>
      </div>

      {/* Installation Status */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Smartphone className="w-5 h-5 text-[#1E90FF]" />
            <CardTitle>Installation Status</CardTitle>
          </div>
          <CardDescription>
            Install Naitrust on your device for quick access
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">App Status</p>
              <p className="text-sm text-gray-600">
                {pwaStatus.isInstalled 
                  ? 'Installed and running as standalone app' 
                  : 'Running in browser'}
              </p>
            </div>
            {pwaStatus.isInstalled ? (
              <Badge variant="default" className="bg-green-500">
                <CheckCircle className="w-3 h-3 mr-1" />
                Installed
              </Badge>
            ) : (
              <Badge variant="secondary">
                <AlertCircle className="w-3 h-3 mr-1" />
                Browser
              </Badge>
            )}
          </div>

          {pwaStatus.canInstall && (
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-900 mb-2">
                💡 Install Naitrust for a better experience with offline support and quick access!
              </p>
              <p className="text-xs text-blue-700">
                Look for the install prompt in your browser or check your browser's menu for "Install App" option.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-[#1E90FF]" />
            <CardTitle>Push Notifications</CardTitle>
          </div>
          <CardDescription>
            Get notified about verification updates and transactions
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Enable Notifications</p>
              <p className="text-sm text-gray-600">
                {pwaStatus.notificationPermission === 'granted' 
                  ? 'You will receive important updates' 
                  : pwaStatus.notificationPermission === 'denied'
                  ? 'Notifications are blocked'
                  : 'Enable to get real-time updates'}
              </p>
            </div>
            <Switch
              checked={notificationsEnabled}
              onCheckedChange={handleToggleNotifications}
              disabled={
                loading === 'notifications' || 
                pwaStatus.notificationPermission === 'denied' ||
                !pwaStatus.hasPushNotifications
              }
            />
          </div>

          {pwaStatus.notificationPermission === 'denied' && (
            <div className="p-4 bg-red-50 rounded-lg border border-red-200">
              <p className="text-sm text-red-900">
                Notifications are blocked. Please enable them in your browser settings.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Offline Support */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Wifi className="w-5 h-5 text-[#1E90FF]" />
            <CardTitle>Offline Support</CardTitle>
          </div>
          <CardDescription>
            Access features even without internet connection
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Service Worker</p>
              <p className="text-sm text-gray-600">
                {pwaStatus.hasServiceWorker 
                  ? 'Active and caching content' 
                  : 'Not available'}
              </p>
            </div>
            {pwaStatus.hasServiceWorker ? (
              <Badge variant="default" className="bg-green-500">
                <CheckCircle className="w-3 h-3 mr-1" />
                Active
              </Badge>
            ) : (
              <Badge variant="destructive">
                <XCircle className="w-3 h-3 mr-1" />
                Inactive
              </Badge>
            )}
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Connection Status</p>
              <p className="text-sm text-gray-600">
                {pwaStatus.isOnline ? 'Connected to internet' : 'Offline mode'}
              </p>
            </div>
            {pwaStatus.isOnline ? (
              <Badge variant="default" className="bg-green-500">
                <CheckCircle className="w-3 h-3 mr-1" />
                Online
              </Badge>
            ) : (
              <Badge variant="secondary">
                <AlertCircle className="w-3 h-3 mr-1" />
                Offline
              </Badge>
            )}
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Cached Data</p>
              <p className="text-sm text-gray-600">
                {formatBytes(cacheSize)} stored for offline use
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleClearCache}
              disabled={loading === 'cache' || cacheSize === 0}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Clear Cache
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Updates */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Download className="w-5 h-5 text-[#1E90FF]" />
            <CardTitle>App Updates</CardTitle>
          </div>
          <CardDescription>
            Keep your app up to date with the latest features
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Check for Updates</p>
              <p className="text-sm text-gray-600">
                Version 1.0.0 - Last checked: {new Date().toLocaleDateString()}
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleCheckUpdates}
              disabled={loading === 'updates'}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${loading === 'updates' ? 'animate-spin' : ''}`} />
              Check Now
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Features Available Offline */}
      <Card>
        <CardHeader>
          <CardTitle>Available Offline</CardTitle>
          <CardDescription>
            These features work without internet connection
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            <li className="flex items-center gap-2 text-sm">
              <CheckCircle className="w-4 h-4 text-green-500" />
              View previously loaded business profiles
            </li>
            <li className="flex items-center gap-2 text-sm">
              <CheckCircle className="w-4 h-4 text-green-500" />
              Access cached verification details
            </li>
            <li className="flex items-center gap-2 text-sm">
              <CheckCircle className="w-4 h-4 text-green-500" />
              Review your saved businesses
            </li>
            <li className="flex items-center gap-2 text-sm">
              <CheckCircle className="w-4 h-4 text-green-500" />
              Read compliance and policy pages
            </li>
            <li className="flex items-center gap-2 text-sm text-gray-500">
              <XCircle className="w-4 h-4" />
              Search for new businesses (requires internet)
            </li>
            <li className="flex items-center gap-2 text-sm text-gray-500">
              <XCircle className="w-4 h-4" />
              Make payments (requires internet)
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
