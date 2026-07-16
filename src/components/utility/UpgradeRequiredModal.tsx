import { X, Crown, Shield, Check } from 'lucide-react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { motion, AnimatePresence } from 'motion/react';

interface UpgradeRequiredModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpgrade: () => void;
  featureName: string;
  description?: string;
  /** Which tier the user should upgrade TO. Defaults to 'basic' */
  targetTier?: 'basic' | 'premium';
}

const BASIC_BENEFITS = [
  'Naitrust Verified badge on your profile',
  'Appear higher in search results',
  'Business analytics and insights',
  'Customer messaging and chat',
  'Payment methods on your profile',
  'Upload business documents',
  'Saved customers list (basic CRM)',
  'Team management (business owner)',
];

const PREMIUM_BENEFITS = [
  'Premium gold verification badge',
  'AI Fake Account Detection — scans social media for impersonator accounts',
  'AI Business Owner Verification — confirms you are the real owner',
  'Proactive Fraud Monitoring — alerts when new fake accounts appear',
  'AI-powered business insights and recommendations',
  'Advanced analytics and exportable reports',
  'Featured and priority search placement',
  'Manage multiple businesses',
  'Unlimited team members with role permissions',
  'Priority support (24/7) and dedicated account manager',
  'API access for integrations',
  'Fraud protection guarantee',
  'Monthly compliance re-verification',
];

export function UpgradeRequiredModal({
  isOpen,
  onClose,
  onUpgrade,
  featureName,
  description,
  targetTier = 'basic',
}: UpgradeRequiredModalProps) {
  const isBasic = targetTier === 'basic';
  const benefits = isBasic ? BASIC_BENEFITS : PREMIUM_BENEFITS;
  const tierLabel = isBasic ? 'Naitrust Verified (Basic)' : 'Premium';
  const tierQuestion = isBasic ? 'Why get verified?' : 'Why upgrade to Premium?';

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
            className="relative bg-card rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl border border-border max-h-[90vh] overflow-y-auto"
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X size={20} />
            </button>

            <div className="text-center mb-6">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
                isBasic 
                  ? '' 
                  : 'border border-amber-600 dark:border-amber-400'
              }`}>
                {isBasic ? (
                  <Shield className="text-white" size={32} />
                ) : (
                  <Crown className="text-amber-600 dark:text-amber-400" size={32} />
                )}
              </div>
              <h2 className="text-2xl font-bold mb-2">
                {isBasic ? 'Verification Required' : 'Upgrade Required'}
              </h2>
              <p className="text-muted-foreground">
                {description || `You need to ${isBasic ? 'get verified' : 'upgrade to Premium'} to access ${featureName}.`}
              </p>
            </div>

            <Card className="p-4 bg-muted/50 mb-6">
              <div className="flex items-start gap-3">
                <Shield className="text-primary mt-0.5 shrink-0" size={20} />
                <div className="text-sm text-muted-foreground">
                  <p className="font-medium text-foreground mb-2">{tierQuestion}</p>
                  <ul className="space-y-1.5">
                    {benefits.map((benefit, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <Check size={14} className="text-primary mt-0.5 shrink-0" />
                        <span>{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </Card>

            <div className="flex gap-3">
              <Button
                onClick={onClose}
                variant="outline"
                className="flex-1"
              >
                Maybe Later
              </Button>
              <Button
                variant="outline"
                onClick={onUpgrade}
                className={`flex-1 cursor-pointer ${
                  isBasic
                    ? 'bg-primary text-white hover:bg-primary/90'
                    : 'border-amber-600 dark:border-amber-400 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-500/10 bg-transparent border'
                }`}
              >
                <Crown size={20} className="text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
                {isBasic ? 'Start Verification' : 'Upgrade to Premium'}
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
