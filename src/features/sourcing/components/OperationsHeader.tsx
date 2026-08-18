import type { LucideIcon } from 'lucide-react';
import { Badge } from '../../../components/ui/badge';

export function OperationsHeader({ eyebrow, title, description, icon: Icon, badge }: {
  eyebrow: string;
  title: string;
  description: string;
  icon: LucideIcon;
  badge?: string;
}) {
  return (
    <header className="overflow-hidden rounded-3xl border bg-card shadow-sm">
      <div className="h-1 bg-gradient-to-r from-primary via-sky-400 to-emerald-400" />
      <div className="flex items-start gap-4 p-5 sm:p-7">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary"><Icon size={20} /></span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2"><p className="text-[10px] font-bold uppercase tracking-[.17em] text-primary">{eyebrow}</p>{badge && <Badge variant="outline">{badge}</Badge>}</div>
          <h1 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">{title}</h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">{description}</p>
        </div>
      </div>
    </header>
  );
}
