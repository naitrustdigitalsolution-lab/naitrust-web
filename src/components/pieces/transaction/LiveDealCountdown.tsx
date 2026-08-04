import { Clock3 } from 'lucide-react';
import { useCountdown } from '../../../hooks/useCountdown';
import { formatCountdown } from '../../../libs/protected-deals/delivery-review';

interface LiveDealCountdownProps {
  deadline?: string;
  label: string;
  compact?: boolean;
}

export function LiveDealCountdown({ deadline, label, compact = false }: LiveDealCountdownProps) {
  const remaining = useCountdown(deadline);

  return (
    <div className={compact ? 'flex items-center gap-2' : 'rounded-2xl border bg-background/80 p-4'}>
      <div className={compact ? 'text-primary' : 'flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-primary'}>
        <Clock3 size={compact ? 14 : 15} />
        {!compact && label}
      </div>
      <p className={(compact ? 'text-sm' : 'mt-2 text-3xl') + ' font-bold tabular-nums text-foreground'}>
        {formatCountdown(remaining)}
      </p>
      {compact && <span className="text-xs text-muted-foreground">{label}</span>}
    </div>
  );
}
