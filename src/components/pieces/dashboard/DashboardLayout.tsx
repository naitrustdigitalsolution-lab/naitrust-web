import type { ReactNode } from 'react';
import { ProtectedDashboardLayout } from './ProtectedDashboardLayout';

export function DashboardLayout({ title, children }: { title: string; children: ReactNode }) {
  return <ProtectedDashboardLayout title={title}>{children}</ProtectedDashboardLayout>;
}
