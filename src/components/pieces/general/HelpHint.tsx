/**
 * HelpHint
 * A small "?" icon button that opens a modal explaining a piece of the UI, so
 * users can get context on the spot (charts, metrics, security steps). Keep the
 * content short and plain-language.
 */

import { useState, type ReactNode } from 'react';
import { HelpCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../../ui/dialog';

interface HelpHintProps {
  title: string;
  children: ReactNode;
  /** Accessible label for the trigger. */
  label?: string;
}

export function HelpHint({ title, children, label }: HelpHintProps) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={label ?? `What is "${title}"?`}
        className="inline-flex h-6 w-6 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
      >
        <HelpCircle size={16} />
      </button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <HelpCircle size={18} className="text-primary" />
              {title}
            </DialogTitle>
            <DialogDescription className="sr-only">Explanation of {title}</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 text-sm leading-6 text-muted-foreground">{children}</div>
        </DialogContent>
      </Dialog>
    </>
  );
}
