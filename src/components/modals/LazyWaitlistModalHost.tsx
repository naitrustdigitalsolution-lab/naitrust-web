import { useEffect, useState, type ComponentType } from 'react';
import { WAITLIST_OPEN_EVENT } from './waitlist-events';

type ModalComponent = ComponentType<{
  open: boolean;
  onOpenChange: (open: boolean) => void;
}>;

let modalPromise: Promise<ModalComponent> | undefined;

function loadModal() {
  modalPromise ??= import('./WaitlistModal').then((module) => module.WaitlistModal);
  return modalPromise;
}

export function LazyWaitlistModalHost() {
  const [Modal, setModal] = useState<ModalComponent | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let active = true;
    const showModal = () => {
      void loadModal().then((component) => {
        if (!active) return;
        setModal(() => component);
        setOpen(true);
      });
    };

    window.addEventListener(WAITLIST_OPEN_EVENT, showModal);

    // Download the form after critical homepage work completes, without
    // executing or mounting its dialog/popover tree.
    const idleWindow = window as typeof window & {
      requestIdleCallback?: (callback: () => void, options?: { timeout: number }) => number;
      cancelIdleCallback?: (id: number) => void;
    };
    const idleId = idleWindow.requestIdleCallback?.(() => void loadModal(), { timeout: 3500 });

    return () => {
      active = false;
      window.removeEventListener(WAITLIST_OPEN_EVENT, showModal);
      if (idleId !== undefined) idleWindow.cancelIdleCallback?.(idleId);
    };
  }, []);

  // Dismissal fully removes the form, focus guards and scroll-lock tree.
  return Modal && open ? <Modal open onOpenChange={setOpen} /> : null;
}
