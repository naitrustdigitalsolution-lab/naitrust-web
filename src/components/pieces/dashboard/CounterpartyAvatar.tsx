/**
 * CounterpartyAvatar
 * Small rounded initials badge for a deal's counterparty — gives deal rows a
 * scannable identity anchor (echoes the "asset icon" column of dense fintech
 * tables) without needing uploaded avatars. Pure presentation.
 */

interface CounterpartyAvatarProps {
  name: string;
  className?: string;
}

function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function CounterpartyAvatar({ name, className }: CounterpartyAvatarProps) {
  return (
    <div
      aria-hidden="true"
      className={
        'flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary ' +
        (className ?? '')
      }
    >
      {initialsOf(name)}
    </div>
  );
}
