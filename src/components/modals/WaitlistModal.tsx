import { type FormEvent, useRef, useState } from 'react';
import { toast } from 'sonner';
import { ArrowRight, CheckCircle2, ChevronDown } from 'lucide-react';
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
import { Checkbox } from '../ui/checkbox';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { joinWaitlist } from '../../services/publicService';
import type {
  TransactionRange,
  WaitlistPayload,
  WaitlistUserType,
} from '../../types/global';

type WaitlistFormState = {
  firstName: string;
  lastName: string;
  businessName: string;
  email: string;
  phone: string;
  userType: WaitlistUserType[];
  transactionRange: TransactionRange | '';
  transactionNeed: string;
  expectations: string;
  useCase: string[];
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
  userType: [],
  transactionRange: '',
  transactionNeed: '',
  expectations: '',
  useCase: [],
  consent: true,
};

const transactionRanges: Array<{ value: TransactionRange; label: string }> = [
  { value: 'below_100k', label: 'Below NGN 100k' },
  { value: '100k_500k', label: 'NGN 100k - 500k' },
  { value: '500k_5m', label: 'NGN 500k - 5m' },
  { value: '5m_50m', label: 'NGN 5m - 50m' },
  { value: 'above_50m', label: 'Above NGN 50m' },
];

const userTypes: Array<{ value: WaitlistUserType; label: string }> = [
  { value: 'informal_business', label: 'Market trader or stall owner' },
  { value: 'business_buyer', label: 'Shop, retail business or company' },
  { value: 'supplier_vendor', label: 'Wholesaler, supplier or distributor' },
  { value: 'marketplace_social_seller', label: 'Online or social seller' },
  { value: 'contractor_service_provider', label: 'Service business or contractor' },
  { value: 'individual_customer', label: 'Individual buying or paying a business' },
  { value: 'other', label: 'Another kind of Nigerian business' },
];

const paymentNeeds = [
  { slug: 'conversation-payments', title: 'Receive customer transfers from WhatsApp or social conversations' },
  { slug: 'payment-links-qr', title: 'Share payment links and shop QR codes' },
  { slug: 'supplier-payments', title: 'Pay suppliers and saved business contacts' },
  { slug: 'protected-transactions', title: 'Protect an important order or business transaction' },
  { slug: 'payment-reconciliation', title: 'Confirm and reconcile incoming transfers automatically' },
] as const;

export function WaitlistModal({ open, onOpenChange }: WaitlistModalProps) {
  const [formState, setFormState] = useState<WaitlistFormState>(initialFormState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [rangeOpen, setRangeOpen] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const dragStartY = useRef<number | null>(null);
  const dragDistance = useRef(0);

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) setRangeOpen(false);
    onOpenChange(nextOpen);
  };

  const resetSheetPosition = () => {
    const sheet = contentRef.current;
    if (!sheet) return;
    sheet.style.transition = 'transform 180ms ease-out';
    sheet.style.transform = 'translate3d(0, 0, 0)';
    window.setTimeout(() => {
      if (sheet) sheet.style.removeProperty('transition');
    }, 190);
  };

  const handleDragStart = (event: React.TouchEvent<HTMLDivElement>) => {
    dragStartY.current = event.touches[0]?.clientY ?? null;
    dragDistance.current = 0;
    if (contentRef.current) contentRef.current.style.transition = 'none';
  };

  const handleDragMove = (event: React.TouchEvent<HTMLDivElement>) => {
    if (dragStartY.current === null) return;
    const distance = Math.max(0, (event.touches[0]?.clientY ?? dragStartY.current) - dragStartY.current);
    dragDistance.current = distance;
    if (distance > 0) {
      event.preventDefault();
      if (contentRef.current) contentRef.current.style.transform = `translate3d(0, ${distance}px, 0)`;
    }
  };

  const handleDragEnd = () => {
    dragStartY.current = null;
    if (dragDistance.current >= 96) {
      handleOpenChange(false);
      return;
    }
    resetSheetPosition();
  };

  const updateField = <Key extends keyof WaitlistFormState>(key: Key, value: WaitlistFormState[Key]) => {
    setFormState((current) => ({ ...current, [key]: value }));
  };

  const toggleUserType = (value: WaitlistUserType) => {
    setFormState((current) => ({
      ...current,
      userType: current.userType.includes(value)
        ? current.userType.filter((item) => item !== value)
        : [...current.userType, value],
    }));
  };

  const toggleUseCase = (value: string) => {
    setFormState((current) => ({
      ...current,
      useCase: current.useCase.includes(value)
        ? current.useCase.filter((item) => item !== value)
        : [...current.useCase, value],
    }));
  };

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (formState.userType.length === 0) {
      toast.error('Please tell us how you will use Naitrust.');
      return;
    }

    if (formState.useCase.length === 0) {
      toast.error('Please choose what would help your business most.');
      return;
    }

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
      userType: formState.userType.join(', '),
      transactionRange: formState.transactionRange,
      transactionNeed: formState.transactionNeed,
      expectations: formState.useCase.join(', '),
      consent: formState.consent,
      source: 'public_header_waitlist',
      submittedAt: new Date().toISOString(),
    };

    try {
      await joinWaitlist(payload);
      toast.success('You are on the Naitrust waiting list.');
      setFormState(initialFormState);
      setIsComplete(true);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to submit waitlist request.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent ref={contentRef} className="!bottom-0 !left-0 !top-auto !max-h-[calc(100dvh-0.75rem)] !w-full !max-w-none !translate-x-0 !translate-y-0 touch-pan-y overscroll-contain gap-0 overflow-y-auto rounded-b-none rounded-t-[1.5rem] border-0 p-0 pb-[env(safe-area-inset-bottom)] shadow-[0_-20px_70px_rgba(3,19,53,.24)] sm:!bottom-auto sm:!left-1/2 sm:!top-1/2 sm:!max-h-[92vh] sm:!max-w-2xl sm:!-translate-x-1/2 sm:!-translate-y-1/2 sm:rounded-[1.75rem] sm:pb-0 sm:shadow-[0_30px_100px_rgba(3,19,53,.28)]">
        <div
          className="sticky top-0 z-20 flex h-7 touch-none items-center justify-center bg-background sm:hidden"
          onTouchStart={handleDragStart}
          onTouchMove={handleDragMove}
          onTouchEnd={handleDragEnd}
          onTouchCancel={() => {
            dragStartY.current = null;
            resetSheetPosition();
          }}
          aria-label="Swipe down to close"
        >
          <span className="h-1 w-10 rounded-full bg-muted-foreground/25" aria-hidden="true" />
        </div>
        {isComplete ? (
          <div className="grid min-h-[24rem] place-items-center p-6 text-center sm:min-h-[28rem] sm:p-12">
            <div>
              <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/12 text-emerald-600">
                <CheckCircle2 size={38} />
              </div>
              <DialogTitle className="text-2xl sm:text-3xl">Your place is saved.</DialogTitle>
              <DialogDescription className="mx-auto mt-3 max-w-md text-sm leading-6 sm:text-base sm:leading-7">
                We’ll keep you updated and let you know when your Naitrust early access is ready.
              </DialogDescription>
              <Button
                className="mt-8 h-12 rounded-md px-7"
                onClick={() => {
                  setIsComplete(false);
                  onOpenChange(false);
                }}
              >
                Back to Naitrust
                <ArrowRight size={17} className="ml-2" />
              </Button>
            </div>
          </div>
        ) : (
        <div className="px-4 pb-5 pt-2 sm:p-8">
        <DialogHeader className="pr-9 text-left">
          <div className="mb-1 inline-flex w-fit items-center rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
            Naitrust early access
          </div>
          <DialogTitle className="text-xl leading-tight tracking-tight sm:text-3xl">Payments built around trust, not guesswork.</DialogTitle>
          <DialogDescription className="text-xs leading-5 sm:text-sm">
            Join Naitrust to receive customer payments, pay businesses and protect important transactions with verified participants, clear terms and one shared record.
          </DialogDescription>
        </DialogHeader>

        <div className="my-4 grid gap-1.5 rounded-xl border border-primary/15 bg-primary/5 p-3 text-xs text-muted-foreground sm:my-6 sm:grid-cols-2 sm:gap-2 sm:rounded-2xl sm:text-sm">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={16} className="text-primary" />
            Modern business payments
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 size={16} className="text-primary" />
            Protected transaction tools
          </div>
        </div>

        <form className="grid gap-3.5 sm:gap-4" onSubmit={handleSubmit}>
          <div className="grid gap-3.5 sm:grid-cols-2 sm:gap-4">
            <label className="grid gap-2 text-sm font-medium">
              First name
              <Input
                required
                className="h-11"
                value={formState.firstName}
                onChange={(event) => updateField('firstName', event.target.value)}
                placeholder="First name"
              />
            </label>
            <label className="grid gap-2 text-sm font-medium">
              Last name
              <Input
                required
                className="h-11"
                value={formState.lastName}
                onChange={(event) => updateField('lastName', event.target.value)}
                placeholder="Last name"
              />
            </label>
          </div>
          <div className="grid gap-3.5 sm:grid-cols-2 sm:gap-4">
            <label className="grid gap-2 text-sm font-medium">
              <span className="flex items-baseline gap-1">
                Business or company <span className="text-xs font-normal text-muted-foreground">(optional)</span>
              </span>
              <Input
                className="h-11"
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
                className="h-11"
                value={formState.email}
                onChange={(event) => updateField('email', event.target.value)}
                placeholder="you@example.com"
              />
            </label>
          </div>

          <div className="grid min-w-0 gap-2 text-sm font-medium">
            How will you use Naitrust?
            <Popover>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  className="flex h-11 w-full items-center justify-between gap-2 rounded-lg border border-input-border bg-input-background px-4 text-left text-sm font-medium text-foreground outline-none transition-[border-color,box-shadow] hover:border-primary/50 focus-visible:border-primary focus-visible:ring-4 focus-visible:ring-primary/20"
                >
                  <span className="min-w-0 flex-1 truncate">
                    {formState.userType.length > 0
                      ? `${formState.userType.length} selected`
                      : 'Select all that apply'}
                  </span>
                  <ChevronDown size={14} className="shrink-0 text-muted-foreground" />
                </button>
              </PopoverTrigger>
              <PopoverContent align="start" className="w-[min(22rem,90vw)] max-h-64 overflow-y-auto p-1.5">
                <div className="grid gap-0.5">
                  {userTypes.map((type) => (
                    <label
                      key={type.value}
                      className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-xs font-medium leading-snug hover:bg-muted"
                    >
                      <Checkbox
                        checked={formState.userType.includes(type.value)}
                        onCheckedChange={() => toggleUserType(type.value)}
                      />
                      {type.label}
                    </label>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
            {formState.userType.length > 0 && (
              <div className="scrollbar-none flex gap-1 overflow-x-auto pb-0.5">
                {userTypes
                  .filter((type) => formState.userType.includes(type.value))
                  .map((type) => (
                    <span
                      key={type.value}
                      className="shrink-0 whitespace-nowrap rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-muted-foreground"
                    >
                      {type.label}
                    </span>
                  ))}
              </div>
            )}
          </div>

          <div className="grid min-w-0 gap-2 text-sm font-medium">
            What would help your business most?
            <Popover>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  className="flex h-11 w-full items-center justify-between gap-2 rounded-lg border border-input-border bg-input-background px-4 text-left text-sm font-medium text-foreground outline-none transition-[border-color,box-shadow] hover:border-primary/50 focus-visible:border-primary focus-visible:ring-4 focus-visible:ring-primary/20"
                >
                  <span className="min-w-0 flex-1 truncate">
                    {formState.useCase.length > 0
                      ? `${formState.useCase.length} selected`
                      : 'Select all that apply'}
                  </span>
                  <ChevronDown size={14} className="shrink-0 text-muted-foreground" />
                </button>
              </PopoverTrigger>
              <PopoverContent align="start" className="w-[min(22rem,90vw)] max-h-64 overflow-y-auto p-1.5">
                <div className="grid gap-0.5">
                  {paymentNeeds.map((item) => (
                    <label
                      key={item.slug}
                      className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-xs font-medium leading-snug hover:bg-muted"
                    >
                      <Checkbox
                        checked={formState.useCase.includes(item.slug)}
                        onCheckedChange={() => toggleUseCase(item.slug)}
                      />
                      {item.title}
                    </label>
                  ))}
                  <label className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-xs font-medium leading-snug hover:bg-muted">
                    <Checkbox
                      checked={formState.useCase.includes('other')}
                      onCheckedChange={() => toggleUseCase('other')}
                    />
                    Something else
                  </label>
                </div>
              </PopoverContent>
            </Popover>
            {formState.useCase.length > 0 && (
              <div className="scrollbar-none flex gap-1 overflow-x-auto pb-0.5">
                {[
                  ...paymentNeeds.filter((item) => formState.useCase.includes(item.slug)).map((item) => item.title),
                  ...(formState.useCase.includes('other') ? ['Something else'] : []),
                ].map((label) => (
                  <span
                    key={label}
                    className="shrink-0 whitespace-nowrap rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-muted-foreground"
                  >
                    {label}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="grid min-w-0 gap-2 text-sm font-medium">
            <span className="flex items-baseline gap-1">
              Typical transaction size <span className="text-xs font-normal text-muted-foreground">(optional)</span>
            </span>
            <Popover open={rangeOpen} onOpenChange={setRangeOpen}>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  className="flex h-11 w-full items-center justify-between gap-2 rounded-lg border border-input-border bg-input-background px-4 text-left text-sm font-medium text-foreground outline-none transition-[border-color,box-shadow] hover:border-primary/50 focus-visible:border-primary focus-visible:ring-4 focus-visible:ring-primary/20"
                >
                  <span className="min-w-0 flex-1 truncate">
                    {formState.transactionRange
                      ? transactionRanges.find((range) => range.value === formState.transactionRange)?.label
                      : 'Select one'}
                  </span>
                  <ChevronDown size={14} className="shrink-0 text-muted-foreground" />
                </button>
              </PopoverTrigger>
              <PopoverContent align="start" className="w-[min(22rem,90vw)] max-h-64 overflow-y-auto p-1.5">
                <div className="grid gap-0.5">
                  {transactionRanges.map((range) => (
                    <button
                      key={range.value}
                      type="button"
                      onClick={() => {
                        updateField('transactionRange', range.value);
                        setRangeOpen(false);
                      }}
                      className={`flex w-full items-center rounded-md px-2 py-1.5 text-left text-xs font-medium leading-snug transition hover:bg-muted ${
                        formState.transactionRange === range.value ? 'bg-primary/10 text-primary' : ''
                      }`}
                    >
                      {range.label}
                    </button>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
          </div>

          <label className="grid gap-2 text-sm font-medium">
            <span className="flex items-baseline gap-1">
              What would make your business payments clearer? <span className="text-xs font-normal text-muted-foreground">(optional)</span>
            </span>
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
            Naitrust can contact me about business-payments early access and product updates.
          </label>

          <Button type="submit" size="lg" disabled={isSubmitting} className="mt-1 h-12 rounded-lg">
            {isSubmitting ? 'Saving your place...' : 'Join the Naitrust waitlist'}
          </Button>
          <p className="-mt-2 text-center text-xs text-muted-foreground">
            No spam. We will only send useful launch and early-access updates.
          </p>
        </form>
        </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
