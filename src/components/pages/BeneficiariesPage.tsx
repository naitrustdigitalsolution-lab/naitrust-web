/**
 * BeneficiariesPage
 * `/app/payments/beneficiaries` — saved Instant Payment recipients: add,
 * favourite, and remove NaiTrust users or bank accounts you pay often.
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Landmark, Loader2, Plus, Star, Trash2, User as UserIcon } from 'lucide-react';
import { toast } from 'sonner';
import { DashboardLayout } from '../pieces/dashboard/DashboardLayout';
import { CounterpartyAvatar } from '../pieces/dashboard/CounterpartyAvatar';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Skeleton } from '../ui/skeleton';
import { Tabs, TabsList, TabsTrigger } from '../ui/tabs';
import { useBeneficiaries, useCreateBeneficiary, useRemoveBeneficiary } from '../../hooks/useBeneficiaries';
import type { BeneficiaryType } from '../../libs/store/types';

export function BeneficiariesPage() {
  const navigate = useNavigate();
  const { data: beneficiaries, isLoading } = useBeneficiaries();
  const createBeneficiary = useCreateBeneficiary();
  const removeBeneficiary = useRemoveBeneficiary();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [type, setType] = useState<BeneficiaryType>('naitrust_user');
  const [name, setName] = useState('');
  const [handle, setHandle] = useState('');
  const [bankName, setBankName] = useState('');

  const resetForm = () => {
    setName('');
    setHandle('');
    setBankName('');
    setType('naitrust_user');
  };

  const handleAdd = async () => {
    try {
      await createBeneficiary.mutateAsync(
        type === 'naitrust_user'
          ? { type, name, username: handle }
          : { type, name, bankName, accountNumber: handle },
      );
      toast.success('Recipient saved');
      setDialogOpen(false);
      resetForm();
    } catch {
      toast.error('Could not save this recipient. Please try again.');
    }
  };

  return (
    <DashboardLayout title="Saved Recipients">
      <div className="mx-auto w-full max-w-2xl">
        <button
          type="button"
          onClick={() => navigate('/app/payments')}
          className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft size={16} />
          Back to Payments
        </button>

        <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Saved Recipients</h1>
            <p className="mt-1 text-sm text-muted-foreground">People and businesses you pay regularly.</p>
          </div>
          <Button className="rounded-full" onClick={() => setDialogOpen(true)}>
            <Plus size={15} className="mr-1.5" />
            Add recipient
          </Button>
        </div>

        {isLoading ? (
          <div className="space-y-2">
            {[0, 1, 2].map((i) => (
              <Skeleton key={i} className="h-16 w-full rounded-xl" />
            ))}
          </div>
        ) : !beneficiaries || beneficiaries.length === 0 ? (
          <Card className="flex flex-col items-center gap-3 p-10 text-center shadow-sm">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <UserIcon size={22} />
            </div>
            <p className="font-semibold text-foreground">No saved recipients yet</p>
            <p className="max-w-sm text-sm text-muted-foreground">
              Add a NaiTrust user or bank account you pay often to send to them faster next time.
            </p>
          </Card>
        ) : (
          <Card className="gap-0 overflow-hidden p-0 shadow-sm">
            {beneficiaries.map((b) => (
              <div key={b.id} className="flex items-center gap-3 border-b px-4 py-3 last:border-b-0">
                <CounterpartyAvatar name={b.name} />
                <div className="min-w-0 flex-1">
                  <p className="flex items-center gap-1.5 truncate text-sm font-medium text-foreground">
                    {b.name}
                    {b.isFavourite && <Star size={12} className="fill-amber-400 text-amber-400" />}
                  </p>
                  <p className="flex items-center gap-1 truncate text-xs text-muted-foreground">
                    {b.type === 'naitrust_user' ? (
                      <>@{b.username}</>
                    ) : (
                      <>
                        <Landmark size={11} />
                        {b.bankName} · {b.accountNumber}
                      </>
                    )}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label={`Remove ${b.name}`}
                  onClick={() => removeBeneficiary.mutate(b.id)}
                  disabled={removeBeneficiary.isPending}
                >
                  <Trash2 size={16} className="text-muted-foreground" />
                </Button>
              </div>
            ))}
          </Card>
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm(); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add recipient</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Tabs value={type} onValueChange={(v) => setType(v as BeneficiaryType)}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="naitrust_user">NaiTrust user</TabsTrigger>
                <TabsTrigger value="bank_account">Bank account</TabsTrigger>
              </TabsList>
            </Tabs>
            <div>
              <Label htmlFor="ben-name">Name</Label>
              <Input id="ben-name" value={name} onChange={(e) => setName(e.target.value)} className="mt-1.5" />
            </div>
            {type === 'naitrust_user' ? (
              <div>
                <Label htmlFor="ben-username">Username</Label>
                <Input id="ben-username" value={handle} onChange={(e) => setHandle(e.target.value)} className="mt-1.5" />
              </div>
            ) : (
              <>
                <div>
                  <Label htmlFor="ben-bank">Bank name</Label>
                  <Input id="ben-bank" value={bankName} onChange={(e) => setBankName(e.target.value)} className="mt-1.5" />
                </div>
                <div>
                  <Label htmlFor="ben-account">Account number</Label>
                  <Input id="ben-account" value={handle} onChange={(e) => setHandle(e.target.value)} className="mt-1.5" />
                </div>
              </>
            )}
          </div>
          <DialogFooter>
            <Button
              className="w-full rounded-full"
              disabled={!name || !handle || createBeneficiary.isPending}
              onClick={() => void handleAdd()}
            >
              {createBeneficiary.isPending && <Loader2 size={15} className="mr-1.5 animate-spin" />}
              Save recipient
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
