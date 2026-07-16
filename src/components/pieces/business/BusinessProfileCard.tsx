/**
 * BusinessProfileCard
 * Shows the business tied to a business account on the profile page, with an
 * edit flow. Editing regulated business details means the business must be
 * re-verified (compliance) — saving resets KYC to pending and warns the user.
 */

import { useEffect, useState } from 'react';
import { Building2, Loader2, Pencil, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '../../ui/badge';
import { Button } from '../../ui/button';
import { Card } from '../../ui/card';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Skeleton } from '../../ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../../ui/dialog';
import { useMyBusiness, useUpdateBusiness } from '../../../hooks/useMyBusiness';
import { useSecurity } from '../../../hooks/useSecurity';

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b px-4 py-3 last:border-b-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-medium text-foreground">{value}</span>
    </div>
  );
}

export function BusinessProfileCard() {
  const { data: business, isLoading } = useMyBusiness();
  const update = useUpdateBusiness();
  const security = useSecurity();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');

  useEffect(() => {
    if (business) {
      setName(business.name);
      setCategory(business.category);
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

  const dirty = name.trim() !== business.name || category.trim() !== business.category;

  const save = () => {
    if (!dirty) {
      setEditing(false);
      return;
    }
    update.mutate(
      { name: name.trim(), category: category.trim() },
      {
        onSuccess: () => {
          // Editing regulated details triggers re-verification.
          security.patch({ kycStatus: 'pending' });
          setEditing(false);
          toast.warning('Business details updated — your business must be re-verified.');
        },
      },
    );
  };

  const verified = business.verified && security.kycStatus === 'verified';

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
            Your business needs verification before you can transact.{' '}
            {security.kycStatus === 'pending' && 'A recent change to your details requires re-verification.'}
          </p>
        </div>
      )}

      <InfoRow label="Business name" value={business.name} />
      <InfoRow label="CAC / RC number" value={business.rcNumber} />
      <InfoRow label="Category" value={business.category} />

      <Dialog open={editing} onOpenChange={setEditing}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit business details</DialogTitle>
            <DialogDescription>
              Changing your registered details means your business will need to be re-verified before
              your next transaction.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-3">
            <div>
              <Label htmlFor="biz-name">Business name</Label>
              <Input id="biz-name" className="mt-1.5" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="biz-cat">Category</Label>
              <Input id="biz-cat" className="mt-1.5" value={category} onChange={(e) => setCategory(e.target.value)} />
            </div>
            <div>
              <Label>CAC / RC number</Label>
              <Input className="mt-1.5" value={business.rcNumber} disabled />
              <p className="mt-1 text-xs text-muted-foreground">Registration number can't be changed here.</p>
            </div>
            {dirty && (
              <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-xs leading-5 text-foreground">
                Saving these changes will mark your business as unverified and require a new
                verification.
              </div>
            )}
            <div className="flex justify-end gap-2">
              <Button variant="ghost" className="rounded-full" onClick={() => setEditing(false)}>
                Cancel
              </Button>
              <Button className="rounded-full" onClick={save} disabled={update.isPending}>
                {update.isPending ? <Loader2 size={16} className="mr-1.5 animate-spin" /> : null}
                Save changes
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
