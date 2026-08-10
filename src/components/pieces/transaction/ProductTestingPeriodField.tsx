import { Clock3, ShieldCheck } from 'lucide-react';
import type { ExtendedProductTestingDays } from '../../../libs/store/types';
import { EXTENDED_TESTING_OPTIONS } from '../../../libs/protected-deals/delivery-review';
import { Checkbox } from '../../ui/checkbox';

interface ProductTestingPeriodFieldProps {
  value?: ExtendedProductTestingDays;
  onChange: (value?: ExtendedProductTestingDays) => void;
}

export function ProductTestingPeriodField({ value, onChange }: ProductTestingPeriodFieldProps) {
  const enabled = value !== undefined;

  return (
    <div className="rounded-2xl border border-primary/15 bg-primary/[0.035] p-4 sm:p-5">
      <label className="flex cursor-pointer items-start gap-3">
        <Checkbox
          className="mt-0.5"
          checked={enabled}
          onCheckedChange={(checked) => onChange(checked ? 3 : undefined)}
        />
        <span className="min-w-0">
          <span className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <Clock3 size={16} className="text-primary" />
            Add an extended product testing period
          </span>
          <span className="mt-1 block text-xs leading-5 text-muted-foreground">
            Optional and agreed by both parties. It replaces the standard 24-hour delivery review period.
          </span>
        </span>
      </label>

      {enabled && (
        <div className="mt-4 border-t pt-4">
          <p className="text-xs font-medium text-foreground">Choose the negotiated period</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {EXTENDED_TESTING_OPTIONS.map((days) => (
              <button
                key={days}
                type="button"
                onClick={() => onChange(days)}
                aria-pressed={value === days}
                className={
                  'rounded-full border px-4 py-2 text-sm font-medium transition-colors ' +
                  (value === days
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-border bg-background text-muted-foreground hover:border-primary/40 hover:text-foreground')
                }
              >
                {days === 14 ? '2 weeks' : `${days} days`}
              </button>
            ))}
          </div>
          <p className="mt-3 flex items-start gap-2 text-xs leading-5 text-muted-foreground">
            <ShieldCheck size={14} className="mt-0.5 shrink-0 text-primary" />
            This sets the protected-funding release deadline. It is not a warranty and does not remove consumer rights.
          </p>
        </div>
      )}
    </div>
  );
}
