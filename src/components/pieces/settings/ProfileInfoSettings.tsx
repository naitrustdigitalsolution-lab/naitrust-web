/**
 * Profile Information Settings Component
 * Component piece for managing user profile information
 */

import { User, Save, Loader2 } from 'lucide-react';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { PhoneField } from '../general/PhoneField';
import { Label } from '../../ui/label';
import { Card, CardContent } from '../../ui/card';

interface ProfileInfoSettingsProps {
  firstName: string;
  lastName: string;
  email: string;
  naitrustId: string;
  phone: string;
  onFirstNameChange: (value: string) => void;
  onLastNameChange: (value: string) => void;
  onPhoneChange: (value: string) => void;
  onSave: () => void;
  isSaving: boolean;
}

export function ProfileInfoSettings({
  firstName,
  lastName,
  email,
  naitrustId,
  phone,
  onFirstNameChange,
  onLastNameChange,
  onPhoneChange,
  onSave,
  isSaving,
}: ProfileInfoSettingsProps) {
  return (
    <Card className="h-full shadow-sm">
      <CardContent className="flex h-full flex-col px-5 py-4">
        <div className="flex items-center gap-3 border-b pb-4">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
            <User size={17} />
          </span>
          <div className="min-w-0">
            <h2 className="text-sm font-semibold text-foreground">Profile information</h2>
            <p className="text-xs text-muted-foreground">Your personal account details</p>
          </div>
        </div>
        <div className="mt-4 grid gap-x-4 gap-y-3 sm:grid-cols-2">
          <div>
            <Label htmlFor="firstname">First Name</Label>
            <Input
              id="firstname"
              value={firstName}
              onChange={(e) => onFirstNameChange(e.target.value)}
              placeholder="Enter your first name"
            />
          </div>
          <div>
            <Label htmlFor="lastname">Last Name</Label>
            <Input
              id="lastname"
              value={lastName}
              onChange={(e) => onLastNameChange(e.target.value)}
              placeholder="Enter your last name"
            />
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              disabled
              className="bg-muted"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Email cannot be changed
            </p>
          </div>
          <div>
            <Label htmlFor="naitrust-id">Naitrust ID</Label>
            <Input id="naitrust-id" value={naitrustId} disabled className="bg-muted font-mono" />
            <p className="mt-1 text-xs text-muted-foreground">
              Your permanent account identifier
            </p>
          </div>
          <div>
            <Label htmlFor="phone">Phone Number</Label>
            <PhoneField
              id="phone"
              className="mt-1.5"
              value={phone}
              onChange={onPhoneChange}
            />
          </div>
        </div>
        <div className="mt-auto flex justify-end border-t pt-4">
          <Button className="w-full rounded-md sm:w-44" onClick={onSave} disabled={isSaving}>
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save size={16} className="mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
