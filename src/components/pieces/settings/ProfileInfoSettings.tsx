/**
 * Profile Information Settings Component
 * Component piece for managing user profile information
 */

import { User, Save, Loader2 } from 'lucide-react';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../ui/card';

interface ProfileInfoSettingsProps {
  firstName: string;
  lastName: string;
  email: string;
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
  phone,
  onFirstNameChange,
  onLastNameChange,
  onPhoneChange,
  onSave,
  isSaving,
}: ProfileInfoSettingsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User size={24} />
          Profile Information
        </CardTitle>
        <CardDescription>
          Update your personal account information
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
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
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              type="tel"
              value={phone}
              onChange={(e) => onPhoneChange(e.target.value)}
              placeholder="+234 800 000 0000"
            />
          </div>
        </div>
        <Button onClick={onSave} disabled={isSaving}>
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
      </CardContent>
    </Card>
  );
}

