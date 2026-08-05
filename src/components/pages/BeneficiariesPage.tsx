/**
 * BeneficiariesPage
 * `/app/payments/beneficiaries`: saved Naitrust and bank recipients.
 */

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, AtSign, BadgeCheck, Landmark, Loader2, Plus, Star, Trash2, User as UserIcon } from 'lucide-react';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { useBeneficiaries, useCreateBeneficiary, useRemoveBeneficiary } from '../../hooks/useBeneficiaries';
import { useValidateRecipient } from '../../hooks/useInstantTransfer';
import { NIGERIAN_BANKS } from '../../libs/payments/recipient-options';
import { isNaitrustId, normalizeNaitrustId } from '../../libs/identity/naitrust-id';
import type { TransferRecipient } from '../../libs/store/types';

type NaitrustLookup = 'naitrust_account_number' | 'naitrust_id';
type RecipientKind = 'naitrust' | 'bank';

export function BeneficiariesPage() {
  const navigate = useNavigate();
  const { data: beneficiaries, isLoading } = useBeneficiaries();
  const createBeneficiary = useCreateBeneficiary();
  const removeBeneficiary = useRemoveBeneficiary();
  const validateRecipient = useValidateRecipient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [recipientKind, setRecipientKind] = useState<RecipientKind>('naitrust');
  const [lookup, setLookup] = useState<NaitrustLookup>('naitrust_account_number');
  const [handle, setHandle] = useState('');
  const [recipientBank, setRecipientBank] = useState('');
  const [resolvedRecipient, setResolvedRecipient] = useState<TransferRecipient | null>(null);
  const [lookupError, setLookupError] = useState('');
  const [isResolving, setIsResolving] = useState(false);

  const resetForm = () => {
    setRecipientKind('naitrust');
    setHandle('');
    setRecipientBank('');
    setLookup('naitrust_account_number');
    setResolvedRecipient(null);
    setLookupError('');
    setIsResolving(false);
  };

  useEffect(() => {
    const value = handle.trim();
    const ready = recipientKind === 'bank'
      ? Boolean(recipientBank) && value.length === 10
      : lookup === 'naitrust_account_number'
        ? value.length === 10
        : isNaitrustId(value);
    if (!dialogOpen || !ready) {
      setResolvedRecipient(null);
      setLookupError('');
      setIsResolving(false);
      return;
    }
    let cancelled = false;
    setResolvedRecipient(null);
    setLookupError('');
    setIsResolving(true);
    const timer = setTimeout(() => {
      const candidate: TransferRecipient = recipientKind === 'bank'
        ? { method: 'bank_transfer', identifier: value, bankName: recipientBank }
        : { method: lookup, identifier: value };
      void validateRecipient.mutateAsync(candidate)
        .then((response) => {
          if (!cancelled) setResolvedRecipient(response.data);
        })
        .catch(() => {
          if (!cancelled) {
            setLookupError(recipientKind === 'bank'
              ? 'We could not confirm that bank account. Check the bank and account number.'
              : 'We could not find that Naitrust account. Check the details and try again.');
          }
        })
        .finally(() => {
          if (!cancelled) setIsResolving(false);
        });
    }, 400);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dialogOpen, handle, lookup, recipientBank, recipientKind]);

  const handleAdd = async () => {
    if (!resolvedRecipient?.resolvedName) return;
    try {
      await createBeneficiary.mutateAsync({
        type: recipientKind === 'bank' ? 'bank_account' : 'naitrust_user',
        name: resolvedRecipient.resolvedName,
        bankName: resolvedRecipient.bankName,
        accountNumber: resolvedRecipient.method === 'bank_transfer' ? resolvedRecipient.identifier : undefined,
        naitrustAccountNumber: resolvedRecipient.naitrustAccountNumber,
        naitrustId: resolvedRecipient.naitrustId,
      });
      toast.success('Recipient saved');
      setDialogOpen(false);
      resetForm();
    } catch {
      toast.error('Could not save this recipient. Please try again.');
    }
  };

  return (
    <DashboardLayout title="Saved Recipients">
      <div className="mx-auto w-full max-w-9xl">
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
              Add a Naitrust or Nigerian bank account you pay often to send faster next time.
            </p>
          </Card>
        ) : (
          <Card className="gap-0 overflow-hidden p-0 shadow-sm">
            {beneficiaries.map((beneficiary) => (
              <div key={beneficiary.id} className="flex items-center gap-3 border-b px-4 py-3 last:border-b-0">
                <CounterpartyAvatar name={beneficiary.name} />
                <div className="min-w-0 flex-1">
                  <p className="flex items-center gap-1.5 truncate text-sm font-medium text-foreground">
                    {beneficiary.name}
                    {beneficiary.isFavourite && <Star size={12} className="fill-amber-400 text-amber-400" />}
                    {beneficiary.type === 'naitrust_user' && (
                      <BadgeCheck size={13} className="shrink-0 text-primary" aria-label="Verified Naitrust account" />
                    )}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {beneficiary.type === 'bank_account'
                      ? [beneficiary.bankName, beneficiary.accountNumber].filter(Boolean).join(' · ')
                      : [beneficiary.naitrustAccountNumber, beneficiary.naitrustId].filter(Boolean).join(' · ')}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label={`Remove ${beneficiary.name}`}
                  onClick={() => removeBeneficiary.mutate(beneficiary.id)}
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
          <div className="space-y-4">
            <Tabs
              value={recipientKind}
              onValueChange={(value) => {
                setRecipientKind(value as RecipientKind);
                setHandle('');
                setRecipientBank('');
                setResolvedRecipient(null);
                setLookupError('');
              }}
            >
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="naitrust" className="gap-1.5">
                  <AtSign size={14} /> Naitrust account
                </TabsTrigger>
                <TabsTrigger value="bank" className="gap-1.5">
                  <Landmark size={14} /> Bank account
                </TabsTrigger>
              </TabsList>
            </Tabs>
            {recipientKind === 'naitrust' ? (
              <Tabs
                value={lookup}
                onValueChange={(value) => {
                  setLookup(value as NaitrustLookup);
                  setHandle('');
                  setResolvedRecipient(null);
                  setLookupError('');
                }}
              >
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="naitrust_account_number">Account number</TabsTrigger>
                  <TabsTrigger value="naitrust_id">Naitrust ID</TabsTrigger>
                </TabsList>
              </Tabs>
            ) : (
              <div>
                <Label htmlFor="beneficiary-bank">Recipient bank</Label>
                <Select value={recipientBank} onValueChange={(value) => {
                  setRecipientBank(value);
                  setResolvedRecipient(null);
                  setLookupError('');
                }}>
                  <SelectTrigger id="beneficiary-bank" className="mt-1.5 w-full">
                    <SelectValue placeholder="Select a Nigerian bank" />
                  </SelectTrigger>
                  <SelectContent>
                    {NIGERIAN_BANKS.map((bank) => (
                      <SelectItem key={bank} value={bank}>{bank}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div>
              <Label htmlFor="ben-identifier">
                {recipientKind === 'bank'
                  ? 'Bank account number'
                  : lookup === 'naitrust_account_number'
                    ? 'Naitrust account number'
                    : 'Naitrust ID'}
              </Label>
              <Input
                id="ben-identifier"
                value={handle}
                inputMode={recipientKind === 'bank' || lookup === 'naitrust_account_number' ? 'numeric' : undefined}
                maxLength={recipientKind === 'bank' || lookup === 'naitrust_account_number' ? 10 : 13}
                onChange={(event) => setHandle(
                  recipientKind === 'bank' || lookup === 'naitrust_account_number'
                    ? event.target.value.replace(/\D/g, '').slice(0, 10)
                    : normalizeNaitrustId(event.target.value),
                )}
                placeholder={recipientKind === 'bank' || lookup === 'naitrust_account_number' ? '10-digit account number' : 'e.g. NT-PA-128842'}
                className="mt-1.5"
              />
            </div>
            {isResolving && (
              <p className="flex items-center gap-2 rounded-xl border bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
                <Loader2 size={14} className="animate-spin text-primary" />
                {recipientKind === 'bank' ? 'Confirming bank account…' : 'Finding Naitrust account…'}
              </p>
            )}
            {lookupError && (
              <p className="rounded-xl border border-destructive/20 bg-destructive/[0.04] px-4 py-3 text-sm text-destructive">
                {lookupError}
              </p>
            )}
            {resolvedRecipient && (
              <div className="flex items-center gap-3 rounded-xl border border-primary/20 bg-primary/[0.04] p-4">
                <CounterpartyAvatar name={resolvedRecipient.resolvedName ?? resolvedRecipient.identifier} />
                <div className="min-w-0">
                  <p className="flex items-center gap-1.5 truncate text-sm font-semibold text-foreground">
                    {resolvedRecipient.resolvedName}
                    {resolvedRecipient.identityVerified && <BadgeCheck size={14} className="text-primary" />}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {resolvedRecipient.method === 'bank_transfer'
                      ? [resolvedRecipient.bankName, resolvedRecipient.identifier].filter(Boolean).join(' · ')
                      : [resolvedRecipient.naitrustAccountNumber, resolvedRecipient.naitrustId].filter(Boolean).join(' · ')}
                  </p>
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              className="w-full rounded-md"
              disabled={!resolvedRecipient || createBeneficiary.isPending}
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
