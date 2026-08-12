/**
 * Password Settings Component
 * Component piece for changing user password
 */

import { Lock, Loader2 } from 'lucide-react';
import { Button } from '../../ui/button';
import { PasswordInput } from '../../ui/input';
import { Label } from '../../ui/label';
import { Card, CardContent } from '../../ui/card';

interface PasswordSettingsProps {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
  onCurrentPasswordChange: (value: string) => void;
  onNewPasswordChange: (value: string) => void;
  onConfirmPasswordChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  isChanging: boolean;
}

export function PasswordSettings({
  currentPassword,
  newPassword,
  confirmPassword,
  onCurrentPasswordChange,
  onNewPasswordChange,
  onConfirmPasswordChange,
  onSubmit,
  isChanging,
}: PasswordSettingsProps) {
  return (
    <Card className="h-full shadow-sm">
      <CardContent className="flex h-full flex-col px-5 py-4">
        <div className="mb-4 flex items-center gap-3 border-b pb-4">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Lock size={17} />
          </span>
          <div>
            <h2 className="text-sm font-semibold text-foreground">Change password</h2>
            <p className="text-xs text-muted-foreground">Keep your sign-in secure</p>
          </div>
        </div>
        <form onSubmit={onSubmit} className="flex flex-1 flex-col gap-3">
          <div>
            <Label htmlFor="current-password">Current Password</Label>
            <PasswordInput
              id="current-password"
              value={currentPassword}
              onChange={(e) => onCurrentPasswordChange(e.target.value)}
              placeholder="Enter current password"
              required
            />
          </div>

          <div>
            <Label htmlFor="new-password">New Password</Label>
            <PasswordInput
              id="new-password"
              value={newPassword}
              onChange={(e) => onNewPasswordChange(e.target.value)}
              placeholder="Enter new password"
              required
            />
            <p className="text-xs text-muted-foreground mt-1">
              Password must be at least 8 characters
            </p>
          </div>

          <div>
            <Label htmlFor="confirm-password">Confirm New Password</Label>
            <PasswordInput
              id="confirm-password"
              value={confirmPassword}
              onChange={(e) => onConfirmPasswordChange(e.target.value)}
              placeholder="Confirm new password"
              required
            />
          </div>

          <Button type="submit" className="mt-auto w-full self-end rounded-full sm:w-44" disabled={isChanging}>
            {isChanging ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Updating...
              </>
            ) : (
              <>
                <Lock size={16} className="mr-2" />
                Update Password
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
