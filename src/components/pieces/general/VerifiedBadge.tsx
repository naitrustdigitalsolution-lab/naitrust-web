import { useTheme } from '@/hooks/useTheme';
import { Shield, Check, Star, AlertTriangle, Sparkles, Award } from 'lucide-react';
import { motion } from 'motion/react';
import { Tooltip, TooltipTrigger, TooltipContent } from '../../ui/tooltip';

interface VerifiedBadgeProps {
  trustId?: string;
  tier: 'unverified' | 'basic' | 'cac' | 'premium'; // 'cac' kept for backward compatibility
  variant?: 'default' | 'small' | 'large' | 'mini-small';
  showTrustId?: boolean;
  animated?: boolean;
  showLabel?: boolean;
  className?: string;
  /** Force dark-mode badge colors (useful when badge sits on a dark/colored background in light theme) */
  onDarkBackground?: boolean;
}

export function VerifiedBadge({ 
  trustId, 
  tier,
  variant = 'default', 
  showTrustId = false,
  animated = true,
  showLabel = true,
  className = '',
  onDarkBackground = false,
}: VerifiedBadgeProps) {
  const { isDarkMode } = useTheme();
  const useDarkColors = onDarkBackground;
  const sizes = {
    'mini-small': 'px-1 py-0.5 gap-0.5 text-xs',
    small: 'px-2 py-1 gap-1 text-xs',
    default: 'px-3 py-1.5 gap-1.5 text-xs',
    large: 'px-4 py-2 gap-2 text-sm',
  };

  const iconSizes = {
    small: 12,
    default: 16,
    large: 20,
  };

  // Different badge styles based on verification tier
  const getBadgeConfig = () => {
    switch (tier) {
      case 'premium':
        return {
          bg: '',
          icon: <Award size={iconSizes[variant]} className="text-amber-600 dark:text-amber-400" />,
          textColor: "text-amber-600 dark:text-amber-400",
          label: 'Premium',
          ring: "ring-2 ring-amber-600 dark:ring-amber-400 shadow-lg"
        };
      case 'basic':
        return {
          bg: '',
          icon: (
            <div className="relative">
              <Shield size={iconSizes[variant]} className={useDarkColors ? 'text-primary-500' : 'text-primary'} />
              <Check 
                size={iconSizes[variant] * 0.6} 
                className={`${useDarkColors ? 'text-white' : 'text-primary'} absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2`} 
                strokeWidth={3} 
              />
            </div>
          ),
          textColor: useDarkColors ? 'text-white' : 'text-primary',
          label: 'Naitrust Verified',
          ring: useDarkColors ? 'ring-2 ring-white shadow-lg' : 'ring-2 ring-primary/50 shadow-lg',
        };
      case 'unverified':
      default:
        return {
          bg: '',
          icon: <AlertTriangle size={iconSizes[variant]} className={useDarkColors ? 'text-gray-300' : 'text-gray-400'} />,
          textColor: useDarkColors ? 'text-gray-300' : 'text-gray-400',
          label: 'Not Verified',
          ring: useDarkColors ? 'ring-2 ring-gray-300 shadow-lg' : 'ring-2 ring-gray-400 shadow-lg',
        };
    }
  };

  const config = getBadgeConfig();

  const BadgeContent = (
    <div className={`inline-flex items-center ${sizes[variant]} ${config.bg} ${config.ring} rounded-full ${className}`}>
      {tier === 'premium' && (
        <Sparkles 
          size={iconSizes[variant] * 0.7} 
          className="text-white/80 absolute -top-1 -right-1 animate-pulse" 
        />
      )}
      {config.icon}
      {showLabel && (
        <span className={`${config.textColor} font-medium`}>
          {config.label}
        </span>
      )}
      {showTrustId && trustId && (
        <span className={`${config.textColor} ml-1`}>
          ({trustId})
        </span>
      )}
    </div>
  );

  const disclaimerText = tier === 'unverified'
    ? 'This business has not been verified by Naitrust.'
    : tier === 'premium'
      ? 'Verified via Qoreid (CAC registration & enhanced checks). See our Verification Policy for details.'
      : 'Verified via Qoreid (CAC registration). See our Verification Policy for details.';

  const wrapWithTooltip = (content: React.ReactNode) => (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className="cursor-help">{content}</span>
      </TooltipTrigger>
      <TooltipContent side="bottom" className="max-w-xs text-center text-xs">
        {disclaimerText}
      </TooltipContent>
    </Tooltip>
  );

  if (animated) {
    return wrapWithTooltip(
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 15 }}
        className="relative inline-block"
      >
        {BadgeContent}
      </motion.div>
    );
  }

  return wrapWithTooltip(
    <div className="relative inline-block">{BadgeContent}</div>
  );
}