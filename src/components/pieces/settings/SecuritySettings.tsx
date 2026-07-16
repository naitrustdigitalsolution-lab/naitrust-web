/**
 * Security Settings Component
 * Component piece for managing security settings
 */

import { Shield, Loader2 } from 'lucide-react';
import { Button } from '../../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../ui/card';
import { Switch } from '../../ui/switch';

interface SecuritySettingsProps {
  twoFactorEnabled: boolean;
  isSaving: boolean;
  onTwoFactorChange: (value: boolean) => void;
  onViewLoginHistory: () => void;
}

export function SecuritySettings({
  twoFactorEnabled,
  isSaving,
  onTwoFactorChange,
  onViewLoginHistory,
}: SecuritySettingsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield size={24} />
          Security Settings
        </CardTitle>
        <CardDescription>
          Manage your account security and access settings
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="font-medium">Two-Factor Authentication</div>
            <div className="text-sm text-muted-foreground">
              Add an extra layer of security to your account
            </div>
          </div>
          <Switch
            checked={twoFactorEnabled}
            onCheckedChange={onTwoFactorChange}
            disabled={isSaving}
          />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <div className="font-medium">Login History</div>
            <div className="text-sm text-muted-foreground">
              View recent login activity and sessions
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={onViewLoginHistory}
          >
            View
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

