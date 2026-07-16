/**
 * Notification Settings Component
 * Component piece for managing notification preferences
 */

import { Bell, Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../ui/card';
import { Switch } from '../../ui/switch';

interface NotificationSettingsProps {
  emailNotifications: boolean;
  messageAlerts: boolean;
  paymentUpdates: boolean;
  isLoading: boolean;
  onEmailNotificationsChange: (value: boolean) => void;
  onMessageAlertsChange: (value: boolean) => void;
  onPaymentUpdatesChange: (value: boolean) => void;
}

export function NotificationSettings({
  emailNotifications,
  messageAlerts,
  paymentUpdates,
  isLoading,
  onEmailNotificationsChange,
  onMessageAlertsChange,
  onPaymentUpdatesChange,
}: NotificationSettingsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell size={24} />
          Notification Preferences
        </CardTitle>
        <CardDescription>
          Manage how you receive notifications about your account and business
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              <span className="ml-2 text-muted-foreground">Loading preferences...</span>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Email Notifications</div>
                  <div className="text-sm text-muted-foreground">
                    Receive updates about your transactions and account activity
                  </div>
                </div>
                <Switch
                  checked={emailNotifications}
                  onCheckedChange={onEmailNotificationsChange}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">New Message Alerts</div>
                  <div className="text-sm text-muted-foreground">
                    Get notified when you receive new messages from customers
                  </div>
                </div>
                <Switch
                  checked={messageAlerts}
                  onCheckedChange={onMessageAlertsChange}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Payment Updates</div>
                  <div className="text-sm text-muted-foreground">
                    Updates about payment status changes and subscriptions
                  </div>
                </div>
                <Switch
                  checked={paymentUpdates}
                  onCheckedChange={onPaymentUpdatesChange}
                />
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

