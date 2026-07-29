/**
 * SandboxBadge
 * Visible indicator that a payment record was produced by the mock/demo
 * adapter, not a real regulated payment partner. Every screen that renders
 * an Instant Payment or wallet action must show this wherever the record is
 * mocked — a sandboxed transfer must never read as a real completed one.
 */

import { FlaskConical } from 'lucide-react';
import { Badge } from '../../ui/badge';

export function SandboxBadge({ className }: { className?: string }) {
  return (
    <Badge
      variant="secondary"
      className={`gap-1 bg-amber-500/10 text-amber-700 hover:bg-amber-500/10 dark:text-amber-400 ${className ?? ''}`}
    >
      <FlaskConical size={12} />
      Sandbox
    </Badge>
  );
}
