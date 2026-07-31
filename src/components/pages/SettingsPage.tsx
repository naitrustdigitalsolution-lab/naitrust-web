/**
 * SettingsPage
 * Account settings (`/app/settings`): composes the ported pieces/settings
 * components (profile info, password, notification preferences) plus an
 * appearance card, in a two-column grid so wide screens use their space.
 * Saves are mocked (toast + latency) until the settings endpoints land.
 */

import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { BadgeCheck, Bell, Landmark, Lock, Moon, Palette, Plus, Settings, Sun, UserRound } from 'lucide-react';
import { toast } from 'sonner';
import { DashboardLayout } from '../pieces/dashboard/DashboardLayout';
import { ProfileInfoSettings } from '../pieces/settings/ProfileInfoSettings';
import { PasswordSettings } from '../pieces/settings/PasswordSettings';
import { NotificationSettings } from '../pieces/settings/NotificationSettings';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Label } from '../ui/label';
import { Switch } from '../ui/switch';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';
import { Input } from '../ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { PageHero } from '../pieces/dashboard/PageHero';
import { TrustProfileSummary } from './TrustProfilePage';
import { AccountProfileOverview } from './ProfilePage';
import { useAuth } from '../../libs/auth-context';
import { useTheme } from '../../hooks/useTheme';
import { useLinkedBankAccounts } from '../../hooks/useWallet';

const MOCK_SAVE_MS = 600;

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function SettingsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  const { data: linkedBankAccounts } = useLinkedBankAccounts();

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
  const [bankDialogOpen, setBankDialogOpen] = useState(false);
  const [addedBankAccounts, setAddedBankAccounts] = useState<Array<{ id: string; bankName: string; accountNumber: string; accountName: string }>>([]);
  const [bankForm, setBankForm] = useState({ bankName: '', accountNumber: '', accountName: '' });
  const visibleBankAccounts = [...(linkedBankAccounts ?? []), ...addedBankAccounts];
  const requestedTab = searchParams.get('tab');
  const activeTab = ['profile', 'security', 'notifications', 'payments', 'trust', 'appearance'].includes(requestedTab ?? '')
    ? requestedTab!
    : 'profile';

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

  const handleAddBankAccount = () => {
    if (!bankForm.bankName.trim() || bankForm.accountNumber.length !== 10 || !bankForm.accountName.trim()) {
      toast.error('Enter the bank, 10-digit account number, and account name.');
      return;
    }
    setAddedBankAccounts((current) => [...current, { id: `local-${Date.now()}`, ...bankForm }]);
    setBankForm({ bankName: '', accountNumber: '', accountName: '' });
    setBankDialogOpen(false);
    toast.success('Bank account added.');
  };

  return (
    <DashboardLayout title="Settings">
      <div className="mx-auto w-full max-w-9xl">
        <PageHero
          eyebrow="Your account"
          title="Settings"
          description="Manage your profile, security, payment preferences, notifications, and Trust Profile."
          icon={Settings}
        />

        <Tabs value={activeTab} onValueChange={(tab) => setSearchParams(tab === 'profile' ? {} : { tab })} className="gap-5">
          <div className="overflow-x-auto pb-1">
            <TabsList className="h-auto min-w-max gap-1 rounded-2xl border bg-card p-1.5 shadow-sm">
              <TabsTrigger value="profile" className="gap-2 rounded-xl px-4 py-2.5"><UserRound size={15} /> Profile</TabsTrigger>
              <TabsTrigger value="security" className="gap-2 rounded-xl px-4 py-2.5"><Lock size={15} /> Security</TabsTrigger>
              <TabsTrigger value="notifications" className="gap-2 rounded-xl px-4 py-2.5"><Bell size={15} /> Notifications</TabsTrigger>
              <TabsTrigger value="payments" className="gap-2 rounded-xl px-4 py-2.5"><Landmark size={15} /> Bank accounts</TabsTrigger>
              <TabsTrigger value="trust" className="gap-2 rounded-xl px-4 py-2.5"><BadgeCheck size={15} /> Trust Profile</TabsTrigger>
              <TabsTrigger value="appearance" className="gap-2 rounded-xl px-4 py-2.5"><Palette size={15} /> Appearance</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="profile">
            <AccountProfileOverview
              profileEditor={
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
              }
            />
          </TabsContent>

          <TabsContent value="security" className="max-w-3xl">
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
          </TabsContent>

          <TabsContent value="notifications" className="max-w-3xl">
            <NotificationSettings
              emailNotifications={emailNotifications}
              messageAlerts={messageAlerts}
              paymentUpdates={paymentUpdates}
              isLoading={false}
              onEmailNotificationsChange={setEmailNotifications}
              onMessageAlertsChange={setMessageAlerts}
              onPaymentUpdatesChange={setPaymentUpdates}
            />
          </TabsContent>

          <TabsContent value="payments" className="max-w-3xl">
            <Card>
              <CardHeader className="flex-row items-start justify-between gap-3">
                <div>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Landmark size={18} /> Other bank accounts
                  </CardTitle>
                  <CardDescription className="mt-1">
                    Save accounts you use for withdrawals, settlements, or business records.
                  </CardDescription>
                </div>
                <Button size="sm" className="rounded-full" onClick={() => setBankDialogOpen(true)}>
                  <Plus size={14} /> Add
                </Button>
              </CardHeader>
              <CardContent>
                {visibleBankAccounts.length === 0 ? (
                  <p className="rounded-xl border border-dashed p-5 text-center text-sm text-muted-foreground">
                    No other bank accounts added yet.
                  </p>
                ) : (
                  <div className="divide-y rounded-xl border">
                    {visibleBankAccounts.map((account) => (
                      <div key={account.id} className="flex items-center gap-3 p-3">
                        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted text-muted-foreground"><Landmark size={16} /></span>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium">{account.accountName}</p>
                          <p className="truncate text-xs text-muted-foreground">{account.bankName} · {account.accountNumber}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="trust" className="max-w-3xl">
            <TrustProfileSummary />
          </TabsContent>

          <TabsContent value="appearance" className="max-w-3xl">
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
          </TabsContent>
        </Tabs>
      </div>

      <Dialog open={bankDialogOpen} onOpenChange={setBankDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>Add another bank account</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label htmlFor="linked-bank-name">Bank</Label><Input id="linked-bank-name" value={bankForm.bankName} onChange={(e) => setBankForm({ ...bankForm, bankName: e.target.value })} placeholder="e.g. Zenith Bank" className="mt-1.5" /></div>
            <div><Label htmlFor="linked-account-number">Account number</Label><Input id="linked-account-number" inputMode="numeric" maxLength={10} value={bankForm.accountNumber} onChange={(e) => setBankForm({ ...bankForm, accountNumber: e.target.value.replace(/\D/g, '').slice(0, 10) })} placeholder="10-digit account number" className="mt-1.5" /></div>
            <div><Label htmlFor="linked-account-name">Account name</Label><Input id="linked-account-name" value={bankForm.accountName} onChange={(e) => setBankForm({ ...bankForm, accountName: e.target.value })} placeholder="Name on the account" className="mt-1.5" /></div>
          </div>
          <DialogFooter><Button className="w-full rounded-full" onClick={handleAddBankAccount}>Add bank account</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
