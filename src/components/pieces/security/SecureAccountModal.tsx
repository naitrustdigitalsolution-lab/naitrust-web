/**
 * SecureAccountModal
 * A one-per-session nudge shown after login when authenticator 2FA isn't set
 * up yet. 2FA is a soft security measure (it doesn't block using the app), so
 * this is dismissible — "Enable 2FA" routes to the Security Center, "Maybe
 * later" defers it for the session.
 */

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Smartphone } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../../ui/dialog';
import { Button } from '../../ui/button';
import { useAuth } from '../../../libs/auth-context';
import { useSecurity } from '../../../hooks/useSecurity';
import { isBusinessAccount } from '../../../libs/utils/account';

const SESSION_KEY = 'naitrust-2fa-nudge-dismissed';

export function SecureAccountModal() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const security = useSecurity();
  const [open, setOpen] = useState(false);

  // Don't compete with the business-verification prompt; nudge 2FA only once a
  // business is verified (or for customer accounts).
  const businessPending = isBusinessAccount(user) && security.kycStatus !== 'verified';

  useEffect(() => {
    const dismissed = sessionStorage.getItem(SESSION_KEY) === '1';
    if (!security.twoFactorEnabled && !dismissed && !businessPending) {
      // Small delay so it doesn't fight the dashboard's first paint.
      const t = setTimeout(() => setOpen(true), 900);
      return () => clearTimeout(t);
    }
  }, [security.twoFactorEnabled, businessPending]);

  const dismiss = () => {
    sessionStorage.setItem(SESSION_KEY, '1');
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={(o) => (o ? setOpen(true) : dismiss())}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader className="items-center text-center">
          <div className="mb-2 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Smartphone size={26} />
          </div>
          <DialogTitle>Secure your account</DialogTitle>
          <DialogDescription>
            Add an authenticator app for two-factor authentication and give your account an extra
            layer of protection at sign-in.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-2 pt-1">
          <Button
            className="w-full rounded-full"
            onClick={() => {
              dismiss();
              navigate('/app/security');
            }}
          >
            Enable 2FA
          </Button>
          <Button variant="ghost" className="w-full rounded-full" onClick={dismiss}>
            Maybe later
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
