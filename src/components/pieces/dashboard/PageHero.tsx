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

export function PageHero({ eyebrow, title, description, actions }: PageHeroProps) {
  return <div className="nd-page-hero"><div><small>{eyebrow}</small><h1>{title}</h1><p>{description}</p></div>{actions && <div>{actions}</div>}</div>;
}
