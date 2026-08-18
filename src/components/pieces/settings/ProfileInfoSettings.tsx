/**
 * Profile Information Settings Component
 * Component piece for managing user profile information
 */

import { ChevronDown, User, Save, Loader2 } from 'lucide-react';
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
  expanded?: boolean;
  onToggle?: () => void;
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
  expanded = true,
  onToggle,
}: ProfileInfoSettingsProps) {
  return (
    <Card className="h-full rounded-xl shadow-none sm:shadow-sm">
      <CardContent className="flex h-full flex-col px-4 py-4 sm:px-5">
        <button type="button" onClick={onToggle} className="flex w-full items-center gap-3 border-b pb-3 text-left sm:pointer-events-none sm:pb-4">
          <span className="hidden h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary sm:flex">
            <User size={17} />
          </span>
          <div className="min-w-0">
            <h2 className="text-base font-semibold text-foreground sm:text-sm">Profile information</h2>
            <p className="text-xs text-muted-foreground">Your personal account details</p>
          </div>
          <ChevronDown size={17} className={`ml-auto shrink-0 transition-transform sm:hidden ${expanded ? 'rotate-180' : ''}`} />
        </button>
        <div className={`${expanded ? 'grid' : 'hidden'} mt-4 gap-x-4 gap-y-4 sm:grid sm:grid-cols-2`}>
          <div>
            <Label htmlFor="firstname">First name</Label>
            <Input
              id="firstname"
              value={firstName}
              onChange={(e) => onFirstNameChange(e.target.value)}
              placeholder="Enter your first name"
            />
          </div>
          <div>
            <Label htmlFor="lastname">Last name</Label>
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
              className="bg-muted/60"
            />
            <p className="mt-1 text-[11px] text-muted-foreground">Cannot be changed</p>
          </div>
          <div>
            <Label htmlFor="naitrust-id">Naitrust ID</Label>
            <Input id="naitrust-id" value={naitrustId} disabled className="bg-muted/60 font-mono" />
            <p className="mt-1 text-[11px] text-muted-foreground">Permanent account ID</p>
          </div>
          <div>
            <Label htmlFor="phone">Phone number</Label>
            <PhoneField
              id="phone"
              className="mt-1.5"
              value={phone}
              onChange={onPhoneChange}
            />
          </div>
        </div>
        <div className={`${expanded ? 'flex' : 'hidden'} mt-5 justify-end border-t pt-4 sm:flex`}>
          <Button className="h-10 w-full rounded-full sm:w-44" onClick={onSave} disabled={isSaving}>
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save size={16} className="mr-2" />
                Save changes
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
