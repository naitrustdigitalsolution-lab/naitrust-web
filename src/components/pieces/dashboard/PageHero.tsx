import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import type { ImageAsset } from '../../../libs/images/image-manifest';

interface PageHeroProps {
  eyebrow: string;
  title: string;
  description: string;
  icon: LucideIcon;
  actions?: ReactNode;
  tone?: 'default' | 'soft-blue';
  image?: ImageAsset;
}

export function PageHero({ eyebrow, title, description, icon: Icon, actions, tone = 'default', image }: PageHeroProps) {
  const softBlue = tone === 'soft-blue';

  return (
    <div className={`mb-5 overflow-hidden rounded-2xl border px-4 py-4 shadow-sm sm:mb-7 sm:rounded-3xl sm:px-7 sm:py-6 lg:px-9 lg:py-8 ${softBlue ? 'border-[#071b31]/10 bg-[#c4e9fdb3] text-[#071b31] dark:border-primary/20 dark:bg-primary/10 dark:text-foreground' : 'border-primary/15 bg-gradient-to-br from-primary/[0.09] via-background to-background'}`}>
      <div className="flex flex-wrap items-start justify-between gap-3 sm:gap-5">
        <div className="flex min-w-0 items-start gap-4">
          <span className="hidden h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-md shadow-primary/15 sm:flex">
            <Icon size={21} />
          </span>
          <div className="min-w-0">
            <p className="mb-1.5 hidden text-xs font-bold uppercase tracking-[0.15em] text-primary sm:block">{eyebrow}</p>
            <h1 className={`text-xl font-bold tracking-tight sm:text-3xl ${softBlue ? 'text-[#071b31] dark:text-foreground' : 'text-foreground'}`}>{title}</h1>
            <p className={`mt-1 max-w-2xl text-xs leading-5 sm:mt-1.5 sm:text-sm sm:leading-6 ${softBlue ? 'text-[#35546f] dark:text-muted-foreground' : 'text-muted-foreground'}`}>{description}</p>
          </div>
        </div>
        <div className="flex w-full flex-wrap items-center gap-3 sm:w-auto sm:shrink-0">
          {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
          {image?.src && <img src={image.src} alt={image.alt} loading="lazy" className="hidden h-24 w-40 rounded-2xl border border-white/20 object-cover shadow-sm lg:block" />}
        </div>
      </div>
    </div>
  );
}
