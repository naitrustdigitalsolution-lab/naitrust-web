/**
 * Password Settings Component
 * Component piece for changing user password
 */

import { ChevronDown, Lock, Loader2 } from 'lucide-react';
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
  expanded?: boolean;
  onToggle?: () => void;
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
  expanded = true,
  onToggle,
}: PasswordSettingsProps) {
  return (
    <Card className="h-full rounded-xl shadow-none sm:shadow-sm">
      <CardContent className="flex h-full flex-col px-4 py-4 sm:px-5">
        <button type="button" onClick={onToggle} className="flex w-full items-center gap-3 border-b pb-3 text-left sm:pointer-events-none sm:pb-4">
          <span className="hidden h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary sm:flex">
            <Lock size={17} />
          </span>
          <div>
            <h2 className="text-base font-semibold text-foreground sm:text-sm">Change password</h2>
            <p className="text-xs text-muted-foreground">Keep your sign-in secure</p>
          </div>
          <ChevronDown size={17} className={`ml-auto shrink-0 transition-transform sm:hidden ${expanded ? 'rotate-180' : ''}`} />
        </button>
        <form onSubmit={onSubmit} className={`${expanded ? 'flex' : 'hidden'} mt-4 flex-1 flex-col gap-3 sm:flex`}>
          <div>
            <Label htmlFor="current-password">Current password</Label>
            <PasswordInput
              id="current-password"
              value={currentPassword}
              onChange={(e) => onCurrentPasswordChange(e.target.value)}
              placeholder="Enter current password"
              required
            />
          </div>

          <div>
            <Label htmlFor="new-password">New password</Label>
            <PasswordInput
              id="new-password"
              value={newPassword}
              onChange={(e) => onNewPasswordChange(e.target.value)}
              placeholder="Enter new password"
              required
            />
            <p className="mt-1 text-[11px] text-muted-foreground">At least 8 characters</p>
          </div>

          <div>
            <Label htmlFor="confirm-password">Confirm new password</Label>
            <PasswordInput
              id="confirm-password"
              value={confirmPassword}
              onChange={(e) => onConfirmPasswordChange(e.target.value)}
              placeholder="Confirm new password"
              required
            />
          </div>

          <Button type="submit" className="mt-2 h-10 w-full self-end rounded-full sm:mt-auto sm:w-44" disabled={isChanging}>
            {isChanging ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Updating...
              </>
            ) : (
              <>
                <Lock size={16} className="mr-2" />
                Update password
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
