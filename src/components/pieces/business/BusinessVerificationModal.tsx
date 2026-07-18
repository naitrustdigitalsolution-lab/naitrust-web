/**
 * BusinessVerificationModal
 * Shown every time a business account lands on the dashboard without completed
 * business verification. Prompts them to verify their business (CAC, a
 * director, ownership) before transacting — the same flow as the Security
 * Center, in our UI. They can close it to use the page, but it reappears on the
 * next dashboard visit until verification is done.
 */

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BadgeCheck, Building2, FileCheck, ShieldCheck } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../../ui/dialog';
import { Button } from '../../ui/button';
import { useAuth } from '../../../libs/auth-context';
import { useSecurity } from '../../../hooks/useSecurity';
import { isBusinessAccount } from '../../../libs/utils/account';

const POINTS = [
  { icon: Building2, text: 'Confirm your CAC registration and business details.' },
  { icon: FileCheck, text: 'Upload your certificate and supporting documents.' },
  { icon: ShieldCheck, text: 'Confirm business ownership to protect your account.' },
];

export function BusinessVerificationModal() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const security = useSecurity();
  const [open, setOpen] = useState(false);

  const needsVerification = isBusinessAccount(user) && security.kycStatus !== 'verified';

  // Reappears on every dashboard visit until the business is verified.
  useEffect(() => {
    if (needsVerification) {
      const t = setTimeout(() => setOpen(true), 500);
      return () => clearTimeout(t);
    }
    setOpen(false);
  }, [needsVerification]);

  const dismiss = () => setOpen(false);

  return (
    <Dialog open={open} onOpenChange={(o) => (o ? setOpen(true) : dismiss())}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="items-center text-center">
          <div className="mb-2 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <BadgeCheck size={26} />
          </div>
          <DialogTitle>Verify your business to start</DialogTitle>
          <DialogDescription>
            Before you can create property transactions, verify your business or professional profile. It only takes a few minutes.
          </DialogDescription>
        </DialogHeader>

        <ul className="space-y-2.5 py-1">
          {POINTS.map((p) => {
            const Icon = p.icon;
            return (
              <li key={p.text} className="flex items-start gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Icon size={16} />
                </div>
                <p className="text-sm leading-8 text-foreground">{p.text}</p>
              </li>
            );
          })}
        </ul>

        <div className="flex flex-col gap-2 pt-1">
          <Button
            className="w-full rounded-full"
            onClick={() => {
              dismiss();
              navigate('/app/security');
            }}
          >
            Start business verification
          </Button>
          <Button variant="ghost" className="w-full rounded-full" onClick={dismiss}>
            Later
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
