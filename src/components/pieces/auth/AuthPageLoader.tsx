import { NaitrustLogo } from '../../utility/NaitrustLogo';

export function AuthPageLoader() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-background" role="status" aria-live="polite">
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
