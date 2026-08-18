/**
 * SettingsPage
 * Account settings (`/app/settings`): composes the ported pieces/settings
 * components (profile info, password, notification preferences) plus an
 * appearance card, in a two-column grid so wide screens use their space.
 * Saves are mocked (toast + latency) until the settings endpoints land.
 */

import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Bell, Landmark, Lock, Moon, Palette, Plus, Settings, Sun, UserRound } from 'lucide-react';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { PageHero } from '../pieces/dashboard/PageHero';
import { getAppImage } from '../../libs/images/image-manifest';
import { SecurityCenterPage } from './SecurityCenterPage';
import { useAuth } from '../../libs/auth-context';
import { useTheme } from '../../hooks/useTheme';
import { useAddLinkedBankAccount, useLinkedBankAccounts, useSetDefaultLinkedBankAccount } from '../../hooks/useWallet';

const MOCK_SAVE_MS = 600;

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function SettingsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  const { data: linkedBankAccounts } = useLinkedBankAccounts();
  const addBankAccount = useAddLinkedBankAccount();
  const setDefaultBankAccount = useSetDefaultLinkedBankAccount();

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
  const [openProfileSection, setOpenProfileSection] = useState<'profile' | 'password' | null>('profile');

  // Notification preferences
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [messageAlerts, setMessageAlerts] = useState(true);
  const [paymentUpdates, setPaymentUpdates] = useState(true);
  const [bankDialogOpen, setBankDialogOpen] = useState(false);
  const [bankForm, setBankForm] = useState({ bankName: '', accountNumber: '', accountName: '' });
  const visibleBankAccounts = linkedBankAccounts ?? [];
  const requestedTab = searchParams.get('tab');
  const activeTab = ['profile', 'security', 'notifications', 'payments', 'appearance'].includes(requestedTab ?? '')
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

  const handleAddBankAccount = async () => {
    if (!bankForm.bankName.trim() || bankForm.accountNumber.length !== 10 || !bankForm.accountName.trim()) {
      toast.error('Enter the bank, 10-digit account number, and account name.');
      return;
    }
    try {
      await addBankAccount.mutateAsync(bankForm);
      setBankForm({ bankName: '', accountNumber: '', accountName: '' });
      setBankDialogOpen(false);
      toast.success('Bank account added.');
    } catch {
      toast.error('The bank account could not be added.');
    }
  };

  const handleSetDefaultBankAccount = async (id: string) => {
    try {
      await setDefaultBankAccount.mutateAsync(id);
      toast.success('Default withdrawal account updated.');
    } catch {
      toast.error('The default account could not be updated.');
    }
  };

  return (
    <DashboardLayout title="Settings">
      <div className="mx-auto w-full max-w-9xl">
        <div className="mb-4 sm:hidden">
          <h1 className="text-lg font-semibold">Settings</h1>
          <p className="mt-0.5 text-xs text-muted-foreground">Manage your account and preferences.</p>
        </div>
        <div className="hidden sm:block">
          <PageHero
            eyebrow="Your account"
            title="Settings"
            description="Manage your profile, security, payment preferences, notifications, and appearance."
            icon={Settings}
            image={getAppImage('settings', 'Account security and payment settings')}
          />
        </div>

        <Tabs value={activeTab} onValueChange={(tab) => setSearchParams(tab === 'profile' ? {} : { tab })} className="gap-5">
          <div className="sm:hidden">
            <Select value={activeTab} onValueChange={(tab) => setSearchParams(tab === 'profile' ? {} : { tab })}>
              <SelectTrigger className="h-11 w-full rounded-xl bg-card px-3 shadow-sm">
                <SelectValue placeholder="Choose a settings section" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="profile"><span className="flex items-center gap-2"><UserRound size={15} /> Profile</span></SelectItem>
                <SelectItem value="security"><span className="flex items-center gap-2"><Lock size={15} /> Security</span></SelectItem>
                <SelectItem value="notifications"><span className="flex items-center gap-2"><Bell size={15} /> Notifications</span></SelectItem>
                <SelectItem value="payments"><span className="flex items-center gap-2"><Landmark size={15} /> Bank accounts</span></SelectItem>
                <SelectItem value="appearance"><span className="flex items-center gap-2"><Palette size={15} /> Appearance</span></SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="hidden pb-1 sm:block">
            <TabsList className="h-auto gap-1 rounded-2xl border bg-card p-1.5 shadow-sm">
              <TabsTrigger value="profile" className="gap-2 rounded-xl px-4 py-2.5"><UserRound size={15} /> Profile</TabsTrigger>
              <TabsTrigger value="security" className="gap-2 rounded-xl px-4 py-2.5"><Lock size={15} /> Security</TabsTrigger>
              <TabsTrigger value="notifications" className="gap-2 rounded-xl px-4 py-2.5"><Bell size={15} /> Notifications</TabsTrigger>
              <TabsTrigger value="payments" className="gap-2 rounded-xl px-4 py-2.5"><Landmark size={15} /> Bank accounts</TabsTrigger>
              <TabsTrigger value="appearance" className="gap-2 rounded-xl px-4 py-2.5"><Palette size={15} /> Appearance</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="profile">
              <div className="grid items-stretch gap-4 sm:gap-5 xl:grid-cols-[minmax(0,1.4fr)_minmax(320px,0.6fr)]">
                <ProfileInfoSettings
                  firstName={firstName}
                  lastName={lastName}
                  email={user?.email ?? ''}
                  naitrustId={user?.naitrustId ?? ''}
                  phone={phone}
                  onFirstNameChange={setFirstName}
                  onLastNameChange={setLastName}
                  onPhoneChange={setPhone}
                  onSave={handleSaveProfile}
                  isSaving={isSavingProfile}
                  expanded={openProfileSection === 'profile'}
                  onToggle={() => setOpenProfileSection((section) => section === 'profile' ? null : 'profile')}
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
                  expanded={openProfileSection === 'password'}
                  onToggle={() => setOpenProfileSection((section) => section === 'password' ? null : 'password')}
                />
              </div>
          </TabsContent>

          <TabsContent value="security">
            <SecurityCenterPage embedded />
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
                        {account.isDefault ? (
                          <span className="shrink-0 rounded-full bg-primary/10 px-2.5 py-1 text-[10px] font-semibold text-primary">Default</span>
                        ) : (
                          <Button type="button" variant="ghost" size="sm" className="shrink-0 rounded-full text-xs" disabled={setDefaultBankAccount.isPending} onClick={() => void handleSetDefaultBankAccount(account.id)}>Set default</Button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
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
          <DialogFooter><Button className="w-full rounded-md" disabled={addBankAccount.isPending} onClick={() => void handleAddBankAccount()}>Add bank account</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
