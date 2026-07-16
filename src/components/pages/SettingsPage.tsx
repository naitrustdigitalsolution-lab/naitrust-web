/**
 * SettingsPage
 * Account settings (`/app/settings`): composes the ported pieces/settings
 * components (profile info, password, notification preferences) plus an
 * appearance card, in a two-column grid so wide screens use their space.
 * Saves are mocked (toast + latency) until the settings endpoints land.
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Moon, Sun } from 'lucide-react';
import { toast } from 'sonner';
import { DashboardLayout } from '../pieces/dashboard/DashboardLayout';
import { ProfileInfoSettings } from '../pieces/settings/ProfileInfoSettings';
import { PasswordSettings } from '../pieces/settings/PasswordSettings';
import { NotificationSettings } from '../pieces/settings/NotificationSettings';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Label } from '../ui/label';
import { Switch } from '../ui/switch';
import { useAuth } from '../../libs/auth-context';
import { useTheme } from '../../hooks/useTheme';

const MOCK_SAVE_MS = 600;

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function SettingsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();

  // Profile info
  const [firstName, setFirstName] = useState(user?.firstName ?? user?.name?.split(' ')[0] ?? '');
  const [lastName, setLastName] = useState(
    user?.lastName ?? user?.name?.split(' ').slice(1).join(' ') ?? '',
  );
  const [phone, setPhone] = useState(user?.phone ?? '');
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Password
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Notification preferences
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [messageAlerts, setMessageAlerts] = useState(true);
  const [paymentUpdates, setPaymentUpdates] = useState(true);

  const handleSaveProfile = async () => {
    setIsSavingProfile(true);
    await delay(MOCK_SAVE_MS);
    setIsSavingProfile(false);
    toast.success('Profile updated.');
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) {
      toast.error('Enter your current and new password.');
      return;
    }
    if (newPassword.length < 8) {
      toast.error('New password must be at least 8 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match.');
      return;
    }
    setIsChangingPassword(true);
    await delay(MOCK_SAVE_MS);
    setIsChangingPassword(false);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    toast.success('Password changed.');
  };

  return (
    <DashboardLayout title="Settings">
      <div className="mx-auto w-full max-w-9xl">
        <button
          type="button"
          onClick={() => navigate('/app')}
          className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft size={16} />
          Back to dashboard
        </button>

        <div className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Settings</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage your profile, security, and notification preferences.
          </p>
        </div>

        <div className="grid items-start gap-6 xl:grid-cols-2">
          <div className="flex flex-col gap-6">
            <ProfileInfoSettings
              firstName={firstName}
              lastName={lastName}
              email={user?.email ?? ''}
              phone={phone}
              onFirstNameChange={setFirstName}
              onLastNameChange={setLastName}
              onPhoneChange={setPhone}
              onSave={handleSaveProfile}
              isSaving={isSavingProfile}
            />
            <PasswordSettings
              currentPassword={currentPassword}
              newPassword={newPassword}
              confirmPassword={confirmPassword}
              onCurrentPasswordChange={setCurrentPassword}
              onNewPasswordChange={setNewPassword}
              onConfirmPasswordChange={setConfirmPassword}
              onSubmit={handleChangePassword}
              isChanging={isChangingPassword}
            />
          </div>

          <div className="flex flex-col gap-6">
            <NotificationSettings
              emailNotifications={emailNotifications}
              messageAlerts={messageAlerts}
              paymentUpdates={paymentUpdates}
              isLoading={false}
              onEmailNotificationsChange={setEmailNotifications}
              onMessageAlertsChange={setMessageAlerts}
              onPaymentUpdatesChange={setPaymentUpdates}
            />

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  {isDarkMode ? <Moon size={18} /> : <Sun size={18} />}
                  Appearance
                </CardTitle>
                <CardDescription>How Naitrust looks on this device.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <Label htmlFor="dark-mode">Dark mode</Label>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      Switch between light and dark themes.
                    </p>
                  </div>
                  <Switch id="dark-mode" checked={isDarkMode} onCheckedChange={toggleTheme} />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
