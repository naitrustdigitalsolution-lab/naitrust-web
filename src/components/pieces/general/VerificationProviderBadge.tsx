import { useTheme } from '../../../hooks/useTheme';
import { Shield, ExternalLink } from 'lucide-react';
import { motion } from 'motion/react';

// Map backend verification_provider to display name
const PROVIDER_DISPLAY_NAMES: Record<string, string> = {
  qoreid: 'Qore ID',
  mono: 'Mono',
};

interface VerificationProviderBadgeProps {
  variant?: 'default' | 'small' | 'large' | 'defaultNoPadding';
  showLink?: boolean;
  animated?: boolean;
  /** CAC verification provider from backend (e.g. qoreid, mono) */
  provider?: string | null;
  className?: string;
}

export function VerificationProviderBadge({
  variant = 'default',
  showLink = true,
  animated = true,
  provider
}: VerificationProviderBadgeProps) {
  const { isDarkMode } = useTheme();
  const displayName = provider
    ? (PROVIDER_DISPLAY_NAMES[provider.toLowerCase()] ?? provider)
    : 'Qore ID';
  const sizes = {
    small: 'px-2 gap-1 text-xs',
    default: 'px-3 gap-1.5 text-xs',
    large: 'px-4 gap-2 text-sm',
    defaultNoPadding: 'px-0 text-xs gap-1.5',
  };

  const iconSizes = {
    small: 14,
    default: 16,
    large: 18,
    defaultNoPadding: 16,
  };

  const BadgeContent = (
    <a
      href="https://qoreid.com"
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center ${sizes[variant]} transition-all rounded-full ${showLink ? 'cursor-pointer' : 'pointer-events-none'}`}
    >
      <Shield size={iconSizes[variant]} className={`${isDarkMode ? 'text-white' : 'text-[#0d132a]'}`} />
      <span className={`${isDarkMode ? 'text-white' : 'text-[#0d132a]'} font-medium`}>Verified by {displayName}</span>
      {showLink && <ExternalLink size={iconSizes[variant] * 0.7} className={`${isDarkMode ? 'text-white/80' : 'text-[#0d132a]'}`} />}
    </a>
  );

  if (animated) {
    return (
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 15 }}
        className="inline-block"
      >
        {BadgeContent}
      </motion.div>
    );
  }

  return <div className="inline-block">{BadgeContent}</div>;
}
