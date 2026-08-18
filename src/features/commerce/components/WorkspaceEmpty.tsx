import type { LucideIcon } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Card } from '../../../components/ui/card';

interface WorkspaceEmptyProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel: string;
  onAction: () => void;
}

export function WorkspaceEmpty({ icon: Icon, title, description, actionLabel, onAction }: WorkspaceEmptyProps) {
  return (
    <Card className="grid min-h-72 place-items-center rounded-3xl border-dashed p-8 text-center">
      <div>
        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <Icon size={22} aria-hidden="true" />
        </span>
        <h2 className="mt-4 font-bold">{title}</h2>
        <p className="mt-2 text-sm text-muted-foreground">{description}</p>
        <Button className="mt-5 rounded-full" onClick={onAction}>{actionLabel}</Button>
      </div>
    </Card>
  );
}
