/**
 * BusinessProfileCard
 * Shows the full business profile tied to a business account — everything
 * captured at registration (name, RC number, category, description, owner,
 * contact, address, and social handles) with an edit flow.
 *
 * Editing regulated business details (including the CAC/RC number) requires
 * re-verification: the user is warned, must confirm with their transaction
 * PIN, and saving resets KYC to pending.
 */

import { useEffect, useState } from 'react';
import { Building2, Globe, Loader2, Mail, MapPin, Pencil, Phone, ShieldCheck, User2 } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '../../ui/badge';
import { Button } from '../../ui/button';
import { Card } from '../../ui/card';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Textarea } from '../../ui/textarea';
import { Skeleton } from '../../ui/skeleton';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '../../ui/sheet';
import { PhoneField } from '../general/PhoneField';
import { PinPromptModal } from '../security/PinPromptModal';
import { useMyBusiness, useUpdateBusiness } from '../../../hooks/useMyBusiness';
import { useSecurity } from '../../../hooks/useSecurity';
import type { BusinessUpdate } from '../../../libs/api/business.api';

/** A single labelled detail row; renders nothing when the value is empty. */
function InfoRow({ icon: Icon, label, value }: { icon?: typeof Mail; label: string; value?: string }) {
  if (!value) return null;
  return (
    <div className="flex items-start justify-between gap-3 border-b px-4 py-3 last:border-b-0">
      <span className="flex items-center gap-2 text-sm text-muted-foreground">
        {Icon && <Icon size={14} className="shrink-0" />}
        {label}
      </span>
      <span className="min-w-0 break-words text-right text-sm font-medium text-foreground">{value}</span>
    </div>
  );
}

type FormState = {
  name: string;
  category: string;
  rcNumber: string;
  description: string;
  email: string;
  phone: string;
  website: string;
  address: string;
  city: string;
  state: string;
};

export function BusinessProfileCard() {
  const { data: business, isLoading } = useMyBusiness();
  const update = useUpdateBusiness();
  const security = useSecurity();
  const [editing, setEditing] = useState(false);
  const [showPin, setShowPin] = useState(false);
  const [form, setForm] = useState<FormState>({
    name: '',
    category: '',
    rcNumber: '',
    description: '',
    email: '',
    phone: '',
    website: '',
    address: '',
    city: '',
    state: '',
  });

  useEffect(() => {
    if (business) {
      setForm({
        name: business.name ?? '',
        category: business.category ?? '',
        rcNumber: business.rcNumber ?? '',
        description: business.description ?? '',
        email: business.email ?? '',
        phone: business.phone ?? '',
        website: business.website ?? '',
        address: business.address ?? '',
        city: business.city ?? '',
        state: business.state ?? '',
      });
    }
  }, [business]);

  if (isLoading) {
    return (
      <Card className="gap-3 p-5 shadow-sm">
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-24 w-full rounded-lg" />
      </Card>
    );
  }
  if (!business) return null;

  const set = (key: keyof FormState) => (value: string) => setForm((f) => ({ ...f, [key]: value }));

  // Which fields actually changed → the patch we send.
  const patch: BusinessUpdate = {};
  if (form.name.trim() !== (business.name ?? '')) patch.name = form.name.trim();
  if (form.category.trim() !== (business.category ?? '')) patch.category = form.category.trim();
  if (form.rcNumber.trim() !== (business.rcNumber ?? '')) patch.rcNumber = form.rcNumber.trim();
  if (form.description.trim() !== (business.description ?? '')) patch.description = form.description.trim();
  if (form.email.trim() !== (business.email ?? '')) patch.email = form.email.trim();
  if (form.phone.trim() !== (business.phone ?? '')) patch.phone = form.phone.trim();
  if (form.website.trim() !== (business.website ?? '')) patch.website = form.website.trim();
  if (form.address.trim() !== (business.address ?? '')) patch.address = form.address.trim();
  if (form.city.trim() !== (business.city ?? '')) patch.city = form.city.trim();
  if (form.state.trim() !== (business.state ?? '')) patch.state = form.state.trim();
  const dirty = Object.keys(patch).length > 0;

  // Step 1: user clicks Save in the edit dialog → confirm with PIN.
  const requestSave = () => {
    if (!dirty) {
      setEditing(false);
      return;
    }
    setShowPin(true);
  };

  // Step 2: PIN verified → persist. The verification-critical fields (name,
  // CAC/RC number) are locked once verified, so editing contact/profile details
  // never affects verification status.
  const commitSave = () => {
    update.mutate(patch, {
      onSuccess: () => {
        setShowPin(false);
        setEditing(false);
        toast.success('Business details updated.');
      },
    });
  };

  const verified = business.verified && security.kycStatus === 'verified';
  const location = [business.city, business.state, business.country].filter(Boolean).join(', ');

  return (
    <Card className="gap-0 p-0 shadow-sm">
      <div className="flex items-center justify-between gap-2 border-b bg-muted/60 px-4 py-3">
        <div className="flex items-center gap-2">
          <Building2 size={16} className="text-primary" />
          <h2 className="text-sm font-semibold text-foreground">Business profile</h2>
          <Badge variant={verified ? 'success' : 'outline'}>{verified ? 'Verified' : 'Unverified'}</Badge>
        </div>
        <Button variant="ghost" size="sm" className="h-7 rounded-full text-xs" onClick={() => setEditing(true)}>
          <Pencil size={13} className="mr-1" />
          Edit
        </Button>
      </div>

      {!verified && (
        <div className="flex items-start gap-2 border-b bg-amber-500/10 px-4 py-3">
          <ShieldCheck size={16} className="mt-0.5 shrink-0 text-amber-600 dark:text-amber-400" />
          <p className="text-xs leading-5 text-foreground">
            Your business needs verification before you can transact.
          </p>
        </div>
      )}

      {business.description && (
        <p className="border-b px-4 py-3 text-sm leading-6 text-muted-foreground">{business.description}</p>
      )}

      <InfoRow label="Business name" value={business.name} />
      <InfoRow label="CAC / RC number" value={business.rcNumber} />
      <InfoRow label="Category" value={business.category} />
      <InfoRow icon={User2} label="Owner" value={business.ownerName} />
      <InfoRow icon={Mail} label="Email" value={business.email} />
      <InfoRow icon={Phone} label="Phone" value={business.phone} />
      <InfoRow icon={Globe} label="Website" value={business.website} />
      <InfoRow icon={MapPin} label="Address" value={business.address} />
      <InfoRow label="Location" value={location} />

      {business.socialHandles && business.socialHandles.length > 0 && (
        <div className="flex items-start justify-between gap-3 px-4 py-3">
          <span className="text-sm text-muted-foreground">Social</span>
          <div className="flex flex-wrap justify-end gap-1.5">
            {business.socialHandles.map((s) => (
              <Badge key={`${s.platform}-${s.value}`} variant="outline" className="gap-1 text-xs capitalize">
                {s.platform}: <span className="font-normal normal-case text-muted-foreground">{s.value}</span>
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Edit panel */}
      <Sheet open={editing} onOpenChange={setEditing}>
        <SheetContent side="right" className="flex w-full flex-col gap-0 p-0 sm:max-w-lg">
          <SheetHeader className="border-b">
            <SheetTitle>Edit business details</SheetTitle>
            <SheetDescription>
              Update your contact and profile details. Your registered name and CAC/RC number are
              locked once verified. You'll confirm changes with your transaction PIN.
            </SheetDescription>
          </SheetHeader>
          <div className="flex flex-1 flex-col gap-3 overflow-y-auto p-4 sm:p-6">
            <div>
              <Label htmlFor="biz-name">Business name</Label>
              <Input
                id="biz-name"
                className="mt-1.5"
                value={form.name}
                onChange={(e) => set('name')(e.target.value)}
                disabled={verified}
              />
            </div>
            <div>
              <Label htmlFor="biz-rc">CAC / RC number</Label>
              <Input
                id="biz-rc"
                className="mt-1.5"
                value={form.rcNumber}
                onChange={(e) => set('rcNumber')(e.target.value)}
                disabled={verified}
              />
              {verified ? (
                <p className="mt-1 text-xs text-muted-foreground">
                  Your business name and RC number are locked once verified and can't be changed here.
                </p>
              ) : (
                <p className="mt-1 text-xs text-muted-foreground">
                  Enter it exactly as on your CAC certificate — this is used to verify your business.
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="biz-cat">Category</Label>
              <Input id="biz-cat" className="mt-1.5" value={form.category} onChange={(e) => set('category')(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="biz-desc">Description</Label>
              <Textarea id="biz-desc" rows={3} className="mt-1.5" value={form.description} onChange={(e) => set('description')(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="biz-email">Business email</Label>
              <Input id="biz-email" type="email" className="mt-1.5" value={form.email} onChange={(e) => set('email')(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="biz-phone">Business phone</Label>
              <PhoneField id="biz-phone" className="mt-1.5" value={form.phone} onChange={set('phone')} />
            </div>
            <div>
              <Label htmlFor="biz-web">Website</Label>
              <Input id="biz-web" className="mt-1.5" value={form.website} onChange={(e) => set('website')(e.target.value)} placeholder="https://" />
            </div>
            <div>
              <Label htmlFor="biz-addr">Address</Label>
              <Input id="biz-addr" className="mt-1.5" value={form.address} onChange={(e) => set('address')(e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="biz-city">City</Label>
                <Input id="biz-city" className="mt-1.5" value={form.city} onChange={(e) => set('city')(e.target.value)} />
              </div>
              <div>
                <Label htmlFor="biz-state">State</Label>
                <Input id="biz-state" className="mt-1.5" value={form.state} onChange={(e) => set('state')(e.target.value)} />
              </div>
            </div>

            {dirty && (
              <div className="rounded-lg border border-primary/20 bg-primary/5 p-3 text-xs leading-5 text-muted-foreground">
                You'll confirm these changes with your transaction PIN.
              </div>
            )}
            <div className="flex justify-end gap-2">
              <Button variant="ghost" className="rounded-full" onClick={() => setEditing(false)}>
                Cancel
              </Button>
              <Button className="rounded-full" onClick={requestSave} disabled={!dirty || update.isPending}>
                {update.isPending ? <Loader2 size={16} className="mr-1.5 animate-spin" /> : null}
                Save changes
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* PIN confirmation for the edit */}
      <PinPromptModal
        open={showPin}
        onOpenChange={setShowPin}
        onVerified={commitSave}
        title="Confirm business changes"
        description="Enter your 4-digit transaction PIN to confirm and save your business details."
      />
    </Card>
  );
}
