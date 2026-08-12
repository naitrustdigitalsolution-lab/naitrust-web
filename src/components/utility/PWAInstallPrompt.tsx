import { useState, useEffect } from 'react';
import { Download, Share, X } from 'lucide-react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const isIOS = /iphone|ipad|ipod/i.test(window.navigator.userAgent);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      return;
    }

    // Check if user has previously dismissed the prompt
    const dismissed = localStorage.getItem('pwa-prompt-dismissed');
    if (dismissed) {
      const dismissedDate = new Date(dismissed);
      const daysSinceDismissed = Math.floor((Date.now() - dismissedDate.getTime()) / (1000 * 60 * 60 * 24));
      
      // Show again after 7 days
      if (daysSinceDismissed < 7) {
        return;
      }
    }

    let promptTimer: number | undefined;

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);

      promptTimer = window.setTimeout(() => {
        setShowPrompt(true);
      }, 8000);
    };

    const installedHandler = () => {
      setIsInstalled(true);
      setShowPrompt(false);
    };

    window.addEventListener('beforeinstallprompt', handler);
    window.addEventListener('appinstalled', installedHandler);

    // Safari does not expose beforeinstallprompt. Give iPhone and iPad users
    // the native Add to Home Screen instructions instead.
    if (/iphone|ipad|ipod/i.test(window.navigator.userAgent)) {
      promptTimer = window.setTimeout(() => setShowPrompt(true), 8000);
    }

    return () => {
      if (promptTimer) window.clearTimeout(promptTimer);
      window.removeEventListener('beforeinstallprompt', handler);
      window.removeEventListener('appinstalled', installedHandler);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      return;
    }

    // Show the install prompt
    deferredPrompt.prompt();

    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;
    
    console.log(`User response to install prompt: ${outcome}`);

    // Clear the deferredPrompt
    setDeferredPrompt(null);
    setShowPrompt(false);

    // Track analytics if needed
    if (outcome === 'accepted') {
      console.log('User accepted the install prompt');
    } else {
      localStorage.setItem('pwa-prompt-dismissed', new Date().toISOString());
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('pwa-prompt-dismissed', new Date().toISOString());
  };

  if (isInstalled || !showPrompt || (!deferredPrompt && !isIOS)) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm animate-in slide-in-from-bottom-5">
      <Card className="p-4 shadow-lg border-2 border-[#1E90FF]/20 bg-background">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-10 h-10 bg-gradient-to-br from-[#1E90FF] to-[#0066CC] rounded-lg flex items-center justify-center">
                {isIOS ? <Share className="w-6 h-6 text-white" /> : <Download className="w-6 h-6 text-white" />}
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Install Naitrust</h3>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mb-3">
              {isIOS
                ? 'For app-like access, tap Share in Safari, then choose Add to Home Screen.'
                : 'Install Naitrust for quick access and a smooth, full-screen mobile experience.'}
            </p>
            <div className="flex gap-2">
              {!isIOS && (
                <Button
                  onClick={handleInstallClick}
                  className="bg-[#1E90FF] hover:bg-[#0066CC] text-white"
                  size="sm"
                >
                  Install App
                </Button>
              )}
              <Button 
                onClick={handleDismiss}
                variant="ghost"
                size="sm"
              >
                Not Now
              </Button>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            className="text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </Card>
    </div>
  );
}
