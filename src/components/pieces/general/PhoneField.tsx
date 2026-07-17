/**
 * PhoneField
 * A phone number input with a searchable country-code selector — flag + dial
 * code on the left (Moniepoint style), the national number on the right, both
 * inside one cohesive control.
 *
 * `value` is the full E.164-ish string (e.g. "+2348012345678"). The component
 * parses the country from the leading dial code (defaulting to Nigeria) and
 * emits `${dial}${nationalDigits}` on every change, so it drops into existing
 * string-based form state unchanged.
 */

import { useMemo, useState } from 'react';
import { Check, ChevronDown } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '../../ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '../../ui/command';
import { cn } from '../../ui/utils';

interface Country {
  code: string;
  name: string;
  dial: string;
  flag: string;
}

// Nigeria first (primary market), then common corridors. Ordered so the longest
// matching dial prefix wins during parsing.
const COUNTRIES: Country[] = [
  { code: 'NG', name: 'Nigeria', dial: '+234', flag: '🇳🇬' },
  { code: 'GH', name: 'Ghana', dial: '+233', flag: '🇬🇭' },
  { code: 'KE', name: 'Kenya', dial: '+254', flag: '🇰🇪' },
  { code: 'ZA', name: 'South Africa', dial: '+27', flag: '🇿🇦' },
  { code: 'EG', name: 'Egypt', dial: '+20', flag: '🇪🇬' },
  { code: 'BJ', name: 'Benin', dial: '+229', flag: '🇧🇯' },
  { code: 'CM', name: 'Cameroon', dial: '+237', flag: '🇨🇲' },
  { code: 'CI', name: "Côte d'Ivoire", dial: '+225', flag: '🇨🇮' },
  { code: 'TG', name: 'Togo', dial: '+228', flag: '🇹🇬' },
  { code: 'SN', name: 'Senegal', dial: '+221', flag: '🇸🇳' },
  { code: 'RW', name: 'Rwanda', dial: '+250', flag: '🇷🇼' },
  { code: 'TZ', name: 'Tanzania', dial: '+255', flag: '🇹🇿' },
  { code: 'UG', name: 'Uganda', dial: '+256', flag: '🇺🇬' },
  { code: 'GB', name: 'United Kingdom', dial: '+44', flag: '🇬🇧' },
  { code: 'US', name: 'United States', dial: '+1', flag: '🇺🇸' },
  { code: 'CA', name: 'Canada', dial: '+1', flag: '🇨🇦' },
  { code: 'AE', name: 'United Arab Emirates', dial: '+971', flag: '🇦🇪' },
  { code: 'IN', name: 'India', dial: '+91', flag: '🇮🇳' },
  { code: 'CN', name: 'China', dial: '+86', flag: '🇨🇳' },
  { code: 'FR', name: 'France', dial: '+33', flag: '🇫🇷' },
  { code: 'DE', name: 'Germany', dial: '+49', flag: '🇩🇪' },
];

const DEFAULT = COUNTRIES[0];

/** Longest-prefix match of a stored value against the dial codes. */
function parse(value: string): { country: Country; national: string } {
  const v = (value || '').replace(/\s+/g, '');
  const match = [...COUNTRIES]
    .sort((a, b) => b.dial.length - a.dial.length)
    .find((c) => v.startsWith(c.dial));
  if (match) return { country: match, national: v.slice(match.dial.length) };
  // No dial code yet — keep any digits as the national part.
  return { country: DEFAULT, national: v.replace(/^\+/, '') };
}

interface PhoneFieldProps {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
}

export function PhoneField({
  id,
  value,
  onChange,
  placeholder = '801 234 5678',
  required,
  disabled,
  className,
}: PhoneFieldProps) {
  const [open, setOpen] = useState(false);
  const { country, national } = useMemo(() => parse(value), [value]);

  const setCountry = (c: Country) => {
    onChange(`${c.dial}${national}`);
    setOpen(false);
  };
  const setNational = (raw: string) => {
    const digits = raw.replace(/[^\d]/g, '');
    onChange(`${country.dial}${digits}`);
  };

  return (
    <div
      className={cn(
        // Mirror the app's Input styling exactly: pill shape, 2px border,
        // input tokens, and the same focus ring, so it sits flush with the
        // other fields in a form.
        'flex h-12 w-full items-stretch overflow-hidden rounded-full border-2 border-input-border bg-input-background transition-[border-color,box-shadow] hover:border-primary/50 focus-within:border-primary focus-within:ring-4 focus-within:ring-primary/20',
        disabled && 'cursor-not-allowed opacity-50',
        className,
      )}
    >
      <Popover open={open} onOpenChange={(o) => !disabled && setOpen(o)}>
        <PopoverTrigger asChild>
          <button
            type="button"
            disabled={disabled}
            aria-label="Select country code"
            className="flex shrink-0 items-center gap-1.5 border-r border-input-border pl-4 pr-3 text-sm outline-none hover:bg-black/[0.03] focus-visible:bg-black/[0.03] disabled:pointer-events-none dark:hover:bg-white/5 dark:focus-visible:bg-white/5"
          >
            <span className="text-base leading-none">{country.flag}</span>
            <span className="font-medium tabular-nums">{country.dial}</span>
            <ChevronDown size={14} className="text-muted-foreground" />
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-64 p-0" align="start">
          <Command>
            <CommandInput placeholder="Search country…" />
            <CommandList>
              <CommandEmpty>No country found.</CommandEmpty>
              <CommandGroup>
                {COUNTRIES.map((c) => (
                  <CommandItem
                    key={c.code}
                    value={`${c.name} ${c.dial} ${c.code}`}
                    onSelect={() => setCountry(c)}
                    className="gap-2"
                  >
                    <span className="text-base leading-none">{c.flag}</span>
                    <span className="flex-1 truncate">{c.name}</span>
                    <span className="text-xs tabular-nums text-muted-foreground">{c.dial}</span>
                    {c.code === country.code && <Check size={14} className="text-primary" />}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      <input
        id={id}
        type="tel"
        inputMode="tel"
        autoComplete="tel-national"
        required={required}
        disabled={disabled}
        placeholder={placeholder}
        value={national}
        onChange={(e) => setNational(e.target.value)}
        className="min-w-0 flex-1 bg-transparent px-4 text-base text-input outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed md:text-sm"
      />
    </div>
  );
}
