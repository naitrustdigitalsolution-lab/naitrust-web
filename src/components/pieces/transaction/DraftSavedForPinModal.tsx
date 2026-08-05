import { FileClock, KeyRound } from 'lucide-react';
import { Button } from '../../ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../ui/dialog';

interface DraftSavedForPinModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onViewDrafts: () => void;
  onSetPin: () => void;
}

export function DraftSavedForPinModal({
  open,
  onOpenChange,
  onViewDrafts,
  onSetPin,
}: DraftSavedForPinModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="mb-1 flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <FileClock size={22} />
          </div>
          <DialogTitle>Your deal is saved</DialogTitle>
          <DialogDescription className="leading-6">
            You have not set a transaction PIN yet, so we saved this deal to Drafts. No invitation has been sent.
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-start gap-3 rounded-xl border bg-muted/30 p-3.5">
          <KeyRound size={17} className="mt-0.5 shrink-0 text-primary" />
          <p className="text-sm leading-6 text-muted-foreground">
            Set your PIN, then reopen this draft to create the deal and share the invitation.
          </p>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onViewDrafts}>
            View drafts
          </Button>
          <Button type="button" onClick={onSetPin}>
            Set transaction PIN
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
