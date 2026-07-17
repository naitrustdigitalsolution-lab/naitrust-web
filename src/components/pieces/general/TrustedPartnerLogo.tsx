// Actual payment provider logos using real images
import { ImageWithFallback } from '../../utility/ImageWithFallback';
import flutterwaveLogo from 'figma:asset/7f5d6df5d7c8cc6439ec1a9a924166c1d5a08cb5.png';
// Anchor brand mark (getanchor.co) — colored icon with its own background, so it
// reads on both the light and dark partner cards.
import anchorMark from '../../../assets/partners/anchor-mark.svg';

export function PaystackLogo({ className = "h-6" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect x="40" y="20" width="120" height="20" rx="6" fill="#11B7E6" />
      <rect x="40" y="50" width="120" height="20" rx="6" fill="#11B7E6" />
      <rect x="40" y="80" width="120" height="20" rx="6" fill="#11B7E6" />
      <rect x="40" y="110" width="80" height="20" rx="6" fill="#11B7E6" />
    </svg>
  );
}

export function CACLogo({ className = "h-16" }: { className?: string }) {
  return (
    <ImageWithFallback
      src="https://bor.cac.gov.ng/static/media/Test.e531c24e977be870325a.png"
      alt="CAC Nigeria Logo"
      className={className}
    />
  );
}

export function QoreIDLogo({ className = "h-16" }: { className?: string }) {
  return (
    <ImageWithFallback
      src="https://qoreid.com/web-images/qoreid-logo.svg"
      alt="QoreID Logo"
      className={className}
    />
  );
}

export function AnchorLogo({ className = "h-16" }: { className?: string }) {
  return (
    <img
      src={anchorMark}
      alt="Anchor Logo"
      className={className}
    />
  );
}

export function FlutterwaveLogo({ className = "h-16" }: { className?: string }) {
  return (
    <img
      src={flutterwaveLogo}
      alt="Flutterwave Logo"
      className={className}
    />
  );
}

export function BankLogo({ bankName, className = "h-6" }: { bankName: string; className?: string }) {
  const colors: Record<string, string> = {
    'GTBank': '#FF6B00',
    'UBA': '#C8102E',
    'Access': '#E31837',
    'Zenith': '#ED1C24',
    'First Bank': '#0033A0',
    'default': '#1E90FF'
  };

  const color = colors[bankName] || colors.default;

  return (
    <svg className={className} viewBox="0 0 200 50" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="200" height="50" fill="white" rx="4"/>
      <rect x="10" y="12" width="30" height="26" fill={color} rx="2"/>
      <rect x="15" y="17" width="4" height="16" fill="white"/>
      <rect x="22" y="17" width="4" height="16" fill="white"/>
      <rect x="29" y="17" width="4" height="16" fill="white"/>
      <text x="48" y="32" fontFamily="Arial, sans-serif" fontSize="16" fontWeight="600" fill="#001C33">
        {bankName}
      </text>
    </svg>
  );
}

export function getPaymentLogo(provider?: string, label?: string) {
  if (provider === 'paystack') return PaystackLogo;
  if (provider === 'anchor') return AnchorLogo;
  if (provider === 'flutterwave') return FlutterwaveLogo;
  if (provider === 'cac') return CACLogo;
  if (label) return () => <BankLogo bankName={label} />;
  return null;
}
