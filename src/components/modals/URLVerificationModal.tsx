import { useState } from 'react';
import { AlertTriangle, CheckCircle2, Shield, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '../ui/button';

interface URLVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUrl: string;
  onConfirm: () => void;
}

export function URLVerificationModal({ isOpen, onClose, currentUrl, onConfirm }: URLVerificationModalProps) {
  const [userConfirmed, setUserConfirmed] = useState(false);
  
  // Extract domain from URL
  const extractDomain = (url: string): string => {
    try {
      const urlObj = new URL(url.startsWith('http') ? url : `https://${url}`);
      return urlObj.hostname;
    } catch {
      return url;
    }
  };

  const domain = extractDomain(currentUrl);
  const isOfficialDomain = domain === 'naitrust.com' || domain.endsWith('.naitrust.com');
  
  // Check for common typosquatting patterns
  const suspiciousPatterns = [
    'truslink',
    'trustiink',
    'trustlinк', // cyrillic k
    'trustllink',
    'trustlnk',
    'naitrust.ng',
    'naitrust.net',
    'naitrust.org',
    'trust-link',
  ];

  const isSuspicious = suspiciousPatterns.some(pattern => 
    domain.toLowerCase().includes(pattern.toLowerCase())
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50"
            onClick={onClose}
          />
          
          {/* Modal */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative bg-card rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl border border-border"
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X size={20} />
            </button>

            <div className="text-center mb-6">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                className="inline-flex items-center justify-center mb-4"
              >
                {isOfficialDomain && !isSuspicious ? (
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                    <Shield size={32} className="text-primary" />
                  </div>
                ) : (
                  <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center">
                    <AlertTriangle size={32} className="text-destructive" />
                  </div>
                )}
              </motion.div>

              <h2 className="mb-2">
                URL Verification
              </h2>
              <p className="text-muted-foreground text-sm">
                Always verify you're on the official Naitrust website
              </p>
            </div>

            {/* URL Display */}
            <div className="bg-muted rounded-lg p-4 mb-4">
              <div className="text-xs text-muted-foreground mb-1">Current URL:</div>
              <div className="font-mono break-all">
                {domain}
              </div>
            </div>

            {/* Official Domain Check */}
            <div className="space-y-3 mb-6">
              <div className="flex items-start gap-3">
                {isOfficialDomain && !isSuspicious ? (
                  <>
                    <CheckCircle2 size={20} className="text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="font-medium text-primary">Official Domain</div>
                      <div className="text-sm text-muted-foreground">
                        This is the official Naitrust website
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <AlertTriangle size={20} className="text-destructive mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="font-medium text-destructive">Suspicious Domain</div>
                      <div className="text-sm text-muted-foreground">
                        This may not be the official Naitrust website. The official domain is <span className="font-mono font-medium">naitrust.com</span>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Security Tips */}
              <div className="bg-accent rounded-lg p-3 text-sm">
                <div className="font-medium mb-2">Security Tips:</div>
                <ul className="space-y-1 text-muted-foreground">
                  <li>✓ Always check the URL is <span className="font-mono">naitrust.com</span></li>
                  <li>✓ Look for the padlock icon in your browser</li>
                  <li>✓ Be wary of similar-looking domains (e.g., truslink.ng)</li>
                </ul>
              </div>
            </div>

            {/* Confirmation */}
            {!isOfficialDomain && (
              <div className="mb-4">
                <label className="flex items-start gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={userConfirmed}
                    onChange={(e) => setUserConfirmed(e.target.checked)}
                    className="mt-1"
                  />
                  <span className="text-sm">
                    I understand this may not be the official website and proceed at my own risk
                  </span>
                </label>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3">
              {isOfficialDomain && !isSuspicious ? (
                <>
                  <Button onClick={onClose} variant="outline" className="flex-1">
                    Cancel
                  </Button>
                  <Button onClick={() => { onConfirm(); onClose(); }} className="flex-1">
                    Continue Safely
                  </Button>
                </>
              ) : (
                <>
                  <Button onClick={onClose} className="flex-1">
                    Go Back
                  </Button>
                  <Button
                    onClick={() => { onConfirm(); onClose(); }}
                    variant="destructive"
                    className="flex-1"
                    disabled={!userConfirmed}
                  >
                    Proceed Anyway
                  </Button>
                </>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
