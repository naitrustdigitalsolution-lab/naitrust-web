import { useEffect, useState } from 'react';
import { remainingMs } from '../libs/protected-deals/delivery-review';

export function useCountdown(deadline?: string): number {
  const [remaining, setRemaining] = useState(() => remainingMs(deadline));

  useEffect(() => {
    const update = () => setRemaining(remainingMs(deadline));
    update();
    if (!deadline) return;
    const timer = window.setInterval(update, 1_000);
    return () => window.clearInterval(timer);
  }, [deadline]);

  return remaining;
}
