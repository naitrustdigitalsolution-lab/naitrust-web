import { useState, useEffect } from 'react';
import { RefreshCw, X } from 'lucide-react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { motion, AnimatePresence } from 'motion/react';

export function PWAUpdatePrompt() {
  const [showPrompt, setShowPrompt] = useState(false);
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);

  useEffect(() => {
    if (!('serviceWorker' in navigator)) {
      return;
    }

    // Listen for service worker updates
    navigator.serviceWorker.ready.then((reg) => {
      setRegistration(reg);

      // Check for waiting service worker on load
      if (reg.waiting) {
        setShowPrompt(true);
      }

      // Listen for new service worker installation
      reg.addEventListener('updatefound', () => {
        const newWorker = reg.installing;
        
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // New service worker is ready
              setShowPrompt(true);
            }
          });
        }
      });
    });

    // Listen for controller change (new service worker activated)
    let refreshing = false;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (!refreshing) {
        refreshing = true;
        window.location.reload();
      }
    });
  }, []);

  const handleUpdate = () => {
    if (!registration?.waiting) {
      return;
    }

    // Tell the waiting service worker to skip waiting and become active
    registration.waiting.postMessage({ type: 'SKIP_WAITING' });
    
    // The page will reload when the new service worker takes over
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    // Store dismissal in session storage
    sessionStorage.setItem('pwa-update-dismissed', 'true');
  };

  // Don't show if user already dismissed in this session
  useEffect(() => {
    if (sessionStorage.getItem('pwa-update-dismissed')) {
      setShowPrompt(false);
    }
  }, []);

  return (
    <AnimatePresence>
      {showPrompt && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          className="fixed bottom-20 left-1/2 transform -translate-x-1/2 z-50 max-w-md w-full px-4"
        >
          <Card className="p-4 shadow-2xl border-2 border-[#1E90FF]/30 bg-white">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-10 h-10 bg-gradient-to-br from-[#1E90FF] to-[#0066CC] rounded-lg flex items-center justify-center">
                    <RefreshCw className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Update Available</h3>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-3">
                  A new version of Naitrust is available with improved features and bug fixes.
                </p>
                <div className="flex gap-2">
                  <Button 
                    onClick={handleUpdate}
                    className="bg-[#1E90FF] hover:bg-[#0066CC] text-white"
                    size="sm"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Update Now
                  </Button>
                  <Button 
                    onClick={handleDismiss}
                    variant="ghost"
                    size="sm"
                  >
                    Later
                  </Button>
                </div>
              </div>
              <button
                onClick={handleDismiss}
                className="text-gray-400 hover:text-gray-600 transition-colors"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
