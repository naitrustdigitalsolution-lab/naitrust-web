import icon from '../../assets/naitrust-logo/naitrust-icon-3.png';
interface NaitrustLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'xxl' | 'postMd' | 'postMd2';
  showText?: boolean;
  className?: string;
  textColor?: string;
}

export function NaitrustLogo({ size = 'md', showText = true, className = '', textColor = 'text-primary' }: NaitrustLogoProps) {
  const sizeClasses = {
    sm: { container: 'w-8 h-8', text: 'text-lg' },
    md: { container: 'w-10 h-10', text: 'text-xl' },
    postMd: { container: 'w-10 h-10', text: 'text-2xl' },
    postMd2: { container: 'w-12 h-12', text: 'text-2xl' },
    lg: { container: 'w-16 h-16', text: 'text-2xl' },
    xl: { container: 'w-24 h-24', text: 'text-2xl' },
    xxl: { container: 'w-32 h-32', text: 'text-2xl' },
  };

  const currentSize = sizeClasses[size];

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Logo Icon - Shield with Nigerian colors and security elements */}
      <div className={`${currentSize.container} relative shrink-0`}>
        <img src={icon} alt="logo" className="h-full w-full object-contain" />
      </div>
      
      {showText && (
        <span className={`${currentSize.text} font-bold ${textColor}`}>
          Naitrust
        </span>
      )}
    </div>
  );
}
