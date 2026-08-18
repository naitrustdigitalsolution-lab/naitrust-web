import type { LucideIcon } from 'lucide-react';
import type { ImageAsset } from '../../../libs/images/image-manifest';

interface WorkspaceHeaderProps {
  eyebrow: string;
  title: string;
  description: string;
  icon?: LucideIcon;
  image?: ImageAsset;
}

export function WorkspaceHeader({ eyebrow, title, description, icon: Icon, image }: WorkspaceHeaderProps) {
  return (
    <header className="mb-6 flex items-start justify-between gap-6">
      <div className="min-w-0">
        <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[.16em] text-primary">
          {Icon && <Icon size={14} aria-hidden="true" />}
          {eyebrow}
        </p>
        <h1 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">{title}</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">{description}</p>
      </div>
      {image?.src && (
        <img
          src={image.src}
          alt={image.alt}
          loading={image.priority ? 'eager' : 'lazy'}
          className="hidden h-24 w-40 shrink-0 rounded-2xl object-cover shadow-sm sm:block"
        />
      )}
    </header>
  );
}
