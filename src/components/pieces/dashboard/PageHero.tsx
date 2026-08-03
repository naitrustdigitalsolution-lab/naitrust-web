import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

interface PageHeroProps {
  eyebrow: string;
  title: string;
  description: string;
  icon: LucideIcon;
  actions?: ReactNode;
  tone?: 'default' | 'soft-blue';
}

export function PageHero({ eyebrow, title, description, icon: Icon, actions, tone = 'default' }: PageHeroProps) {
  const softBlue = tone === 'soft-blue';

  return (
    <div className={`mb-7 overflow-hidden rounded-3xl border px-5 py-6 shadow-sm sm:px-7 lg:px-9 lg:py-8 ${softBlue ? 'border-[#071b31]/10 bg-[#c4e9fdb3] text-[#071b31] dark:border-primary/20 dark:bg-primary/10 dark:text-foreground' : 'border-primary/15 bg-gradient-to-br from-primary/[0.09] via-background to-background'}`}>
      <div className="flex flex-wrap items-start justify-between gap-5">
        <div className="flex items-start gap-4">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-md shadow-primary/15">
            <Icon size={21} />
          </span>
          <div>
            <p className="mb-1.5 text-xs font-bold uppercase tracking-[0.15em] text-primary">{eyebrow}</p>
            <h1 className={`text-2xl font-bold tracking-tight sm:text-3xl ${softBlue ? 'text-[#071b31] dark:text-foreground' : 'text-foreground'}`}>{title}</h1>
            <p className={`mt-1.5 max-w-2xl text-sm leading-6 ${softBlue ? 'text-[#35546f] dark:text-muted-foreground' : 'text-muted-foreground'}`}>{description}</p>
          </div>
        </div>
        {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
      </div>
    </div>
  );
}
