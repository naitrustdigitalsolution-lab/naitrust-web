import { NaitrustLogo } from '../../utility/NaitrustLogo';
import { DashboardLayout } from '../dashboard/DashboardLayout';

export function AuthPageLoader({ contained = false }: { contained?: boolean }) {
  return (
    <div
      className={`flex flex-col items-center justify-center gap-6 bg-background ${contained ? 'min-h-[calc(100vh-7.5rem)] rounded-xl' : 'min-h-screen'}`}
      role="status"
      aria-live="polite"
    >
      <NaitrustLogo size="postMd" showText />
      <div className="relative h-12 w-12">
        <div className="absolute inset-0 rounded-full border-4 border-primary/15" />
        <div className="absolute inset-0 animate-spin rounded-full border-4 border-transparent border-t-primary" />
      </div>
      <p className="text-sm font-medium text-muted-foreground">Preparing your secure experience…</p>
      <span className="sr-only">Loading</span>
    </div>
  );
}

/** Keeps authenticated navigation visible while a lazy dashboard screen loads. */
export function DashboardPageLoader() {
  return (
    <DashboardLayout title="Loading">
      <AuthPageLoader contained />
    </DashboardLayout>
  );
}
