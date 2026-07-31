/**
 * Cookie Consent Banner
 * Displays cookie consent notice and allows users to manage preferences
 */

import { useState, useEffect } from 'react';
import { X, Cookie, Settings } from 'lucide-react';
import { Button } from '../ui/button';
import { motion, AnimatePresence } from 'motion/react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';

export function CookieConsent() {
  const preferenceCookie = 'naitrust_cookie_preferences';
  const consentCookie = 'naitrust_cookie_consent';
  const readCookie = (name: string) => document.cookie.split('; ').find((item) => item.startsWith(`${name}=`))?.split('=').slice(1).join('=');
  const writeCookie = (name: string, value: string) => {
    const secure = window.location.protocol === 'https:' ? '; Secure' : '';
    document.cookie = `${name}=${encodeURIComponent(value)}; Path=/; Max-Age=31536000; SameSite=Lax${secure}`;
  };
  const [isVisible, setIsVisible] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const [cookiePreferences, setCookiePreferences] = useState(() => {
    // Load saved preferences or use defaults
    const saved = readCookie(preferenceCookie);
    if (saved) {
      try {
        return JSON.parse(decodeURIComponent(saved));
      } catch {
        return {
          necessary: true,
          analytics: true,
          marketing: true,
          social: true,
        };
      }
    }
    return {
      necessary: true, // Always required
      analytics: true,
      marketing: true,
      social: true,
    };
  });

  useEffect(() => {
    // Check if user has already accepted cookies
    const cookieConsent = readCookie(consentCookie);
    if (!cookieConsent) {
      // Show banner after a short delay
      setTimeout(() => {
        setIsVisible(true);
      }, 1000);
    }
  }, []);

  // Expose function to open preferences from footer
  useEffect(() => {
    (window as any).openCookiePreferences = () => {
      const saved = readCookie(preferenceCookie);
      if (saved) {
        try { setCookiePreferences(JSON.parse(decodeURIComponent(saved))); } catch { /* use current values */ }
      }
      setShowPreferences(true);
    };
    return () => {
      delete (window as any).openCookiePreferences;
    };
  }, []);

  const handleAcceptAll = () => {
    const accepted = { necessary: true, analytics: true, marketing: true, social: true };
    setCookiePreferences(accepted);
    writeCookie(consentCookie, 'accepted');
    writeCookie(preferenceCookie, JSON.stringify(accepted));
    setIsVisible(false);
  };

  const handleSavePreferences = () => {
    writeCookie(consentCookie, 'accepted');
    writeCookie(preferenceCookie, JSON.stringify(cookiePreferences));
    setIsVisible(false);
    setShowPreferences(false);
  };

  const handleRejectOptional = () => {
    const minimalPreferences = {
      necessary: true,
      analytics: false,
      marketing: false,
      social: false,
    };
    setCookiePreferences(minimalPreferences);
    writeCookie(consentCookie, 'accepted');
    writeCookie(preferenceCookie, JSON.stringify(minimalPreferences));
    setIsVisible(false);
  };

  return (
    <>
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background shadow-[0_-12px_40px_rgba(3,19,53,.14)]"
          >
            <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 sm:py-4 lg:px-8">
              <div className="flex flex-col items-start gap-3 lg:flex-row lg:items-center lg:gap-4">
                <div className="flex items-start gap-3 flex-1">
                  <Cookie className="mt-0.5 shrink-0 text-primary" size={20} />
                  <div className="flex-1">
                    <h3 className="mb-0.5 text-sm font-semibold sm:text-base">We use cookies</h3>
                    <p className="text-xs leading-5 text-muted-foreground sm:text-sm">
                      We use necessary cookies and, with your permission, analytics and marketing cookies. You can change your choices anytime.
                    </p>
                  </div>
                </div>
                <div className="grid w-full grid-cols-3 gap-2 lg:flex lg:w-auto lg:shrink-0 lg:items-center">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowPreferences(true)}
                    className="min-w-0 gap-1 px-2 sm:gap-2 sm:px-3"
                  >
                    <Settings size={16} />
                    <span className="truncate">Preferences</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRejectOptional}
                  >
                    <span className="truncate">Reject optional</span>
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleAcceptAll}
                  >
                    <span className="truncate">Accept all</span>
                  </Button>
                </div>
                <button type="button" onClick={() => setIsVisible(false)} className="absolute right-2 top-2 rounded-full p-1 text-muted-foreground hover:bg-muted" aria-label="Dismiss cookie notice"><X size={15} /></button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Cookie Preferences Dialog */}
      <Dialog open={showPreferences} onOpenChange={setShowPreferences}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Cookie Preferences</DialogTitle>
            <DialogDescription>
              Manage your cookie preferences. You can enable or disable different types of cookies below.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            {/* Necessary Cookies */}
            <div className="flex items-start justify-between gap-4 p-3 bg-muted rounded-lg">
              <div className="flex-1">
                <h4 className="font-medium text-sm mb-1">Necessary Cookies</h4>
                <p className="text-xs text-muted-foreground">
                  Required for the website to function properly. These cannot be disabled.
                </p>
              </div>
              <div className="text-sm text-muted-foreground">Always Active</div>
            </div>

            {/* Analytics Cookies */}
            <div className="flex items-start justify-between gap-4 p-3 border rounded-lg">
              <div className="flex-1">
                <h4 className="font-medium text-sm mb-1">Analytics Cookies</h4>
                <p className="text-xs text-muted-foreground">
                  Help us understand how visitors interact with our website.
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={cookiePreferences.analytics}
                  onChange={(e) =>
                    setCookiePreferences({ ...cookiePreferences, analytics: e.target.checked })
                  }
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-muted peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>

            {/* Marketing Cookies */}
            <div className="flex items-start justify-between gap-4 p-3 border rounded-lg">
              <div className="flex-1">
                <h4 className="font-medium text-sm mb-1">Marketing Cookies</h4>
                <p className="text-xs text-muted-foreground">
                  Used to deliver personalized advertisements.
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={cookiePreferences.marketing}
                  onChange={(e) =>
                    setCookiePreferences({ ...cookiePreferences, marketing: e.target.checked })
                  }
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-muted peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>

            {/* Social Media Cookies */}
            <div className="flex items-start justify-between gap-4 p-3 border rounded-lg">
              <div className="flex-1">
                <h4 className="font-medium text-sm mb-1">Social Media Cookies</h4>
                <p className="text-xs text-muted-foreground">
                  Enable social media features and content sharing.
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={cookiePreferences.social}
                  onChange={(e) =>
                    setCookiePreferences({ ...cookiePreferences, social: e.target.checked })
                  }
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-muted peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>
          </div>
          <div className="flex gap-2 mt-6">
            <Button variant="outline" onClick={() => setShowPreferences(false)} className="flex-1">
              Cancel
            </Button>
            <Button onClick={handleSavePreferences} className="flex-1">
              Save Preferences
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
