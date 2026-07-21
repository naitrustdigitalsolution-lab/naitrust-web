import { type FormEvent, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { CheckCircle2 } from 'lucide-react';
import { Button } from '../ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { joinWaitlist } from '../../services/publicService';
import type {
  TransactionRange,
  WaitlistPayload,
  WaitlistUserType,
} from '../../types/global';
import { useCases } from '../../libs/use-cases';

type WaitlistFormState = {
  firstName: string;
  lastName: string;
  businessName: string;
  email: string;
  phone: string;
  userType: WaitlistUserType | '';
  transactionRange: TransactionRange | '';
  transactionNeed: string;
  expectations: string;
  useCase: string;
  consent: boolean;
};

interface WaitlistModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const initialFormState: WaitlistFormState = {
  firstName: '',
  lastName: '',
  businessName: '',
  email: '',
  phone: '',
  userType: '',
  transactionRange: '',
  transactionNeed: '',
  expectations: '',
  useCase: '',
  consent: true,
};

const userTypes: Array<{ value: WaitlistUserType; label: string }> = [
  { value: 'property_buyer', label: 'Property buyer' },
  { value: 'property_seller', label: 'Property seller or owner' },
  { value: 'real_estate_agent', label: 'Real estate agent' },
  { value: 'real_estate_company', label: 'Real estate company' },
  { value: 'property_developer', label: 'Property developer' },
  { value: 'contractor_service_provider', label: 'Contractor or property service provider' },
  { value: 'legal_transaction_representative', label: 'Legal or transaction representative' },
  { value: 'partner', label: 'Payment, verification, or technology partner' },
  { value: 'other', label: 'Other' },
];

export function openWaitlistModal() {
  window.dispatchEvent(new CustomEvent('naitrust:open-waitlist'));
}

export function WaitlistModal({ open, onOpenChange }: WaitlistModalProps) {
  const [formState, setFormState] = useState<WaitlistFormState>(initialFormState);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateField = <Key extends keyof WaitlistFormState>(key: Key, value: WaitlistFormState[Key]) => {
    setFormState((current) => ({ ...current, [key]: value }));
  };

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!formState.consent) {
      toast.error('Please confirm that Naitrust can contact you about early access.');
      return;
    }

    setIsSubmitting(true);

    const payload: WaitlistPayload = {
      fullName: `${formState.firstName} ${formState.lastName}`.trim(),
      businessName: formState.businessName,
      email: formState.email,
      phone: formState.phone,
      userType: formState.userType,
      transactionRange: formState.transactionRange,
      transactionNeed: formState.transactionNeed,
      expectations: formState.useCase,
      consent: formState.consent,
      source: 'public_header_waitlist',
      submittedAt: new Date().toISOString(),
    };

    try {
      await joinWaitlist(payload);
      toast.success('You are on the Naitrust waiting list.');
      setFormState(initialFormState);
      onOpenChange(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to submit waitlist request.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] gap-6 overflow-y-auto p-6 sm:max-w-2xl sm:p-8 lg:max-w-3xl">
        <DialogHeader>
          <div className="mb-1 inline-flex w-fit items-center rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
            Get early access
          </div>
          <DialogTitle className="text-2xl sm:text-3xl">Make your next property transaction clearer</DialogTitle>
          <DialogDescription>
            Join for early access to clearer participant records, agreements, payments, property documents, and transaction evidence in one place.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-2 rounded-full border border-primary/15 bg-primary/5 p-3 text-sm text-muted-foreground sm:grid-cols-2">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={16} className="text-primary" />
            Early-access priority
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 size={16} className="text-primary" />
            Built around your needs
          </div>
        </div>

        <form className="grid gap-5" onSubmit={handleSubmit}>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="grid gap-2 text-sm font-medium">
              First name
              <Input
                required
                value={formState.firstName}
                onChange={(event) => updateField('firstName', event.target.value)}
                placeholder="First name"
              />
            </label>
            <label className="grid gap-2 text-sm font-medium">
              Last name
              <Input
                required
                value={formState.lastName}
                onChange={(event) => updateField('lastName', event.target.value)}
                placeholder="Last name"
              />
            </label>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="grid gap-2 text-sm font-medium">
              Business or company <span className="text-xs font-normal text-muted-foreground">(optional)</span>
              <Input
                value={formState.businessName}
                onChange={(event) => updateField('businessName', event.target.value)}
                placeholder="Company name"
              />
            </label>
            <label className="grid gap-2 text-sm font-medium">
              Email address
              <Input
                required
                type="email"
                value={formState.email}
                onChange={(event) => updateField('email', event.target.value)}
                placeholder="you@example.com"
              />
            </label>
          </div>

          <label className="grid min-w-0 gap-2 text-sm font-medium">
              How will you use Naitrust?
              <select
                required
                value={formState.userType}
                onChange={(event) => updateField('userType', event.target.value as WaitlistFormState['userType'])}
                className="h-12 w-full min-w-0 rounded-full border-2 border-input-border bg-input-background px-4 text-sm outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/20"
              >
                <option value="">Select one</option>
                {userTypes.map((type) => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
          </label>

          <label className="grid min-w-0 gap-2 text-sm font-medium">
            Which property transaction is closest to your needs?
            <select
              required
              value={formState.useCase}
              onChange={(event) => updateField('useCase', event.target.value)}
              className="h-12 w-full min-w-0 rounded-full border-2 border-input-border bg-input-background px-4 text-sm outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/20"
            >
              <option value="">Choose a use case</option>
              {useCases.map((item) => <option key={item.slug} value={item.slug}>{item.title}</option>)}
              <option value="other">Something else</option>
            </select>
          </label>

          <label className="grid gap-2 text-sm font-medium">
            What would make property transactions clearer for you? <span className="text-xs font-normal text-muted-foreground">(optional)</span>
            <Textarea
              value={formState.transactionNeed}
              onChange={(event) => updateField('transactionNeed', event.target.value)}
              placeholder="Tell us in one sentence"
              className="min-h-20"
            />
          </label>

          <label className="flex items-start gap-3 text-sm text-muted-foreground">
            <input
              checked={formState.consent}
              className="mt-1 h-4 w-4 accent-primary"
              type="checkbox"
              onChange={(event) => updateField('consent', event.target.checked)}
            />
            Naitrust can contact me about property-transaction early access and product updates.
          </label>

          <Button type="submit" size="lg" disabled={isSubmitting} className="rounded-full">
            {isSubmitting ? 'Saving your place...' : 'Join property early access'}
          </Button>
          <p className="-mt-2 text-center text-xs text-muted-foreground">
            No spam. We will only send useful launch and early-access updates.
          </p>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function WaitlistModalHost() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handleOpen = () => setOpen(true);

    window.addEventListener('naitrust:open-waitlist', handleOpen);
    return () => window.removeEventListener('naitrust:open-waitlist', handleOpen);
  }, []);

  return <WaitlistModal open={open} onOpenChange={setOpen} />;
}
