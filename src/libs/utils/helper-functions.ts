import { toast } from "sonner";
import { 
  Instagram, 
  Facebook, 
  Twitter, 
  Linkedin,
  Youtube,
  MessageCircle, 
  Mail, 
  Phone,
  Send,
  Music,
  Link as LinkIcon,
  type LucideIcon
} from 'lucide-react';
import { toCanvas, toPng } from 'html-to-image';
import instagramIcon from "../../src/assets/socials/Instagram.svg.webp"
import facebookIcon from "../../src/assets/socials/facebook.svg.png"
import xIcon from "../../src/assets/socials/x-white.avif"
import telegramIcon from "../../src/assets/socials/Telegram.svg.webp"

/**
 * Capitalize the first letter of a string
 */
export function capitalizeFirstLetter(str: string): string {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Normalize social input to a display handle (extract from URL if needed).
 * e.g. "https://instagram.com/naitrust_digitalsolutions" → "naitrust_digitalsolutions"
 * e.g. "@https://instagram.com/naitrust_digitalsolutions" → "naitrust_digitalsolutions"
 * e.g. "@naitrust" → "naitrust"
 * Returns the clean handle for storage; getSocialUrl builds the link.
 */
export function normalizeSocialHandle(_platform: string, input: string): string {
  let trimmed = input.trim();
  if (!trimmed) return trimmed;
  // Strip leading @ so "@https://..." is treated as a URL
  if (trimmed.startsWith('@')) trimmed = trimmed.slice(1).trim();

  try {
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
      const url = new URL(trimmed);
      const path = url.pathname.replace(/^\/+|\/+$/g, '');
      const segments = path.split('/').filter(Boolean);
      const lastSegment = segments[segments.length - 1] || '';
      const handle = lastSegment.split('?')[0];
      if (handle) return handle.replace(/^@/, '');
    }
  } catch {
    // Not a valid URL
  }
  return trimmed.replace(/^@/, '');
}

/**
 * Extract the original URL from user input, if one was pasted.
 * Returns the URL string or undefined if input is a plain handle.
 */
export function extractOriginalUrl(input: string): string | undefined {
  let trimmed = input.trim();
  if (trimmed.startsWith('@')) trimmed = trimmed.slice(1).trim();
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    try {
      new URL(trimmed); // validate
      return trimmed;
    } catch { /* not valid */ }
  }
  return undefined;
}

/**
 * Get social media URL from platform and handle.
 * Accepts full URLs (returns as-is) or raw handles.
 */
export function getSocialUrl(platform: string, value: string): string {
  if (!value) return '#';
  const v = value.trim();
  if (v.startsWith('http://') || v.startsWith('https://')) return v;

  switch (platform.toLowerCase()) {
    case "instagram":
      return `https://instagram.com/${v.replace('@', '')}`;
    case "twitter":
    case "x":
      return `https://twitter.com/${v.replace('@', '')}`;
    case "facebook":
      return `https://facebook.com/${v.replace('@', '')}`;
    case "thread":
    case "threads":
      return `https://threads.net/${v.replace('@', '')}`;
    case "whatsapp":
      return `https://wa.me/${value.replace(/[^0-9]/g, '')}`;
    case "telegram":
      return `https://t.me/${v.replace('@', '')}`;
    case "linkedin":
      return v.includes('/') ? (v.startsWith('http') ? v : `https://${v}`) : `https://linkedin.com/company/${v.replace('@', '')}`;
    case "youtube":
      return v.includes('/') ? (v.startsWith('http') ? v : `https://${v}`) : `https://youtube.com/@${v.replace('@', '')}`;
    case "tiktok":
      return `https://tiktok.com/@${v.replace('@', '')}`;
    case "phone":
      return `tel:${value}`;
    case "email":
      return `mailto:${value}`;
    case "others":
      return v.startsWith('http') ? v : (v.includes('.') ? `https://${v}` : '#');
    default:
      return v.startsWith('http') ? v : '#';
  }
}

/**
 * Handle copying text to clipboard with feedback
 */
interface HandleCopyHandleParams {
  value: string;
  platform: string;
  setCopiedHandle: (value: string | null) => void;
  form?: string;
}

export function handleCopyHandle({
  value,
  platform,
  setCopiedHandle,
  form = "socials"
}: HandleCopyHandleParams): void {
  navigator.clipboard.writeText(value);
  setCopiedHandle(platform);

  if (form === "socials") toast.success(`${platform} handle copied!`);
  if (form === "fakeReports") toast.success(`Reported fake handle for ${platform} copied!`);
  if (form === "paymentMethods") toast.success(`${platform} payment details copied!`);

  setTimeout(() => setCopiedHandle(null), 2000);
}

/**
 * Handle copying profile link to clipboard
 */
interface HandleCopyLinkParams {
  profileUrl: string;
  setCopied: (value: boolean) => void;
}

export function handleCopyLink({ profileUrl, setCopied }: HandleCopyLinkParams): void {
  navigator.clipboard.writeText(profileUrl);
  setCopied(true);
  toast.success("Link copied to clipboard!");
  setTimeout(() => setCopied(false), 2000);
}

/**
 * Get payment provider logo URL
 */
export function getPaymentProviderLogo(provider?: string): string | null {
  if (!provider) return null;
  
  const logos: Record<string, string> = {
    // Payment Gateways
    paystack: 'https://paystack.com/assets/img/logo/paystack-icon-blue.png',
    flutterwave: 'https://flutterwave.com/images/logo-colored.svg',
    skrill: 'https://www.skrill.com/fileadmin/content/images/brand/skrill-logo.svg',
    
    // Nigerian Banks
    gtbank: 'https://upload.wikimedia.org/wikipedia/en/thumb/4/42/GTBank_logo.svg/200px-GTBank_logo.svg.png',
    'guaranty trust bank': 'https://upload.wikimedia.org/wikipedia/en/thumb/4/42/GTBank_logo.svg/200px-GTBank_logo.svg.png',
    
    uba: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8b/UBA_logo.svg/200px-UBA_logo.svg.png',
    'united bank of africa': 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8b/UBA_logo.svg/200px-UBA_logo.svg.png',
    'united bank for africa': 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8b/UBA_logo.svg/200px-UBA_logo.svg.png',
    
    zenith: 'https://upload.wikimedia.org/wikipedia/en/thumb/4/4f/Zenith_Bank_logo.svg/200px-Zenith_Bank_logo.svg.png',
    'zenith bank': 'https://upload.wikimedia.org/wikipedia/en/thumb/4/4f/Zenith_Bank_logo.svg/200px-Zenith_Bank_logo.svg.png',
    
    access: 'https://upload.wikimedia.org/wikipedia/en/thumb/c/cb/Access_Bank_logo.svg/200px-Access_Bank_logo.svg.png',
    'access bank': 'https://upload.wikimedia.org/wikipedia/en/thumb/c/cb/Access_Bank_logo.svg/200px-Access_Bank_logo.svg.png',
    
    'first bank': 'https://upload.wikimedia.org/wikipedia/en/thumb/a/a6/First_Bank_of_Nigeria_logo.svg/200px-First_Bank_of_Nigeria_logo.svg.png',
    'first bank of nigeria': 'https://upload.wikimedia.org/wikipedia/en/thumb/a/a6/First_Bank_of_Nigeria_logo.svg/200px-First_Bank_of_Nigeria_logo.svg.png',
    firstbank: 'https://upload.wikimedia.org/wikipedia/en/thumb/a/a6/First_Bank_of_Nigeria_logo.svg/200px-First_Bank_of_Nigeria_logo.svg.png',
    
    sterling: 'https://sterlingbank.ng/wp-content/uploads/2021/11/sterling-bank-logo.png',
    'sterling bank': 'https://sterlingbank.ng/wp-content/uploads/2021/11/sterling-bank-logo.png',
    
    opay: 'https://opayweb.com/static/media/opay-logo.svg',
    'o pay': 'https://opayweb.com/static/media/opay-logo.svg',
    
    moniepoint: 'https://moniepoint.com/assets/img/logo.svg',
    'monie point': 'https://moniepoint.com/assets/img/logo.svg',
    
    kuda: 'https://kuda.com/static/media/kuda-logo.svg',
    'kuda bank': 'https://kuda.com/static/media/kuda-logo.svg',
    
    // International
    paypal: 'https://www.paypalobjects.com/webstatic/mktg/logo/pp_cc_mark_111x69.jpg',
    stripe: 'https://stripe.com/img/v3/home/social.png',
  };
  
  // Normalize provider name
  const normalizedProvider = provider.toLowerCase().trim();
  return logos[normalizedProvider] || null;
}

export function getSocialProviderLogo(provider?: string): string | null {
  if (!provider) return null;

  const logos: Record<string, string> = {
    // Payment Gateways
    instagram: instagramIcon,
    facebook: facebookIcon,
    twitter: xIcon,
    // threads: threadsIcon,
    whatsapp: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/WhatsApp.svg/200px-WhatsApp.svg.png',
    telegram: telegramIcon
  };
  
  // Normalize provider name
  const normalizedProvider = provider.toLowerCase().trim();
  return logos[normalizedProvider] || null;
}

/**
 * Get bank logo from bank name (fallback)
 */
export function getBankLogo(bankName?: string): string | null {
  return getPaymentProviderLogo(bankName);
}

/**
 * Format currency (Nigerian Naira)
 */
export function formatCurrency(amount: number | string, currency: string = 'NGN'): string {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  if (currency === 'NGN') {
    return `₦${numAmount.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }
  
  return `${currency} ${numAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

/**
 * Format date to readable string
 */
export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

/**
 * Format time to readable string
 */
export function formatTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  });
}

/**
 * Format date and time
 */
export function formatDateTime(date: Date | string): string {
  return `${formatDate(date)} at ${formatTime(date)}`;
}

/**
 * Truncate text with ellipsis
 */
export function truncateText(text: string, maxLength: number = 100): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

/**
 * Get initials from name
 */
export function getInitials(firstName: string, lastName?: string): string {
  if (!firstName) return '?';
  if (!lastName) return firstName.charAt(0).toUpperCase();
  return `${firstName.charAt(0).toUpperCase()}${lastName.charAt(0).toUpperCase()}`;
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate phone number (Nigerian format)
 */
export function isValidPhone(phone: string): boolean {
  const phoneRegex = /^\+?234[0-9]{10}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
}

/**
 * Generate shorter Trust ID
 */
export function generateShortTrustId(): string {
  // Generate 6-digit random number
  const randomNum = Math.floor(100000 + Math.random() * 900000);
  return `NT-${randomNum}`;
}

/**
 * Generate unique Trust ID with check for duplicates
 */
export function generateUniqueTrustId(existingIds: string[] = []): string {
  let trustId = generateShortTrustId();
  let attempts = 0;
  const maxAttempts = 100;
  
  // Keep generating until we get a unique one or hit max attempts
  while (existingIds.includes(trustId) && attempts < maxAttempts) {
    trustId = generateShortTrustId();
    attempts++;
  }
  
  if (attempts >= maxAttempts) {
    // Fallback to timestamp-based ID if we can't generate unique
    trustId = `NT-${Date.now().toString().slice(-6)}${Math.random().toString(36).substr(2, 3).toUpperCase()}`;
  }
  
  return trustId;
}

/**
 * Get social media icon component
 */
export function getSocialIcon(platform: string): LucideIcon {
  switch (platform.toLowerCase()) {
    case 'instagram':
      return Instagram;
    case 'facebook':
      return Facebook;
    case 'twitter':
    case 'x':
      return Twitter;
    case 'linkedin':
      return Linkedin;
    case 'youtube':
      return Youtube;
    case 'tiktok':
      return Music;
    case 'whatsapp':
      return MessageCircle;
    case 'telegram':
      return Send;
    case 'email':
      return Mail;
    case 'phone':
      return Phone;
    default:
      return LinkIcon;
  }
}

/**
 * Get social media color (Tailwind classes)
 */
export function getSocialColor(platform: string): string {
  switch (platform.toLowerCase()) {
    case 'instagram':
      return 'bg-gradient-to-br from-purple-600 via-pink-600 to-orange-500';
    case 'facebook':
      return 'bg-blue-600';
    case 'twitter':
    case 'x':
      return 'bg-blue-400';
    case 'linkedin':
      return 'bg-blue-700';
    case 'youtube':
      return 'bg-red-600';
    case 'tiktok':
      return 'bg-black';
    case 'whatsapp':
      return 'bg-green-600';
    case 'telegram':
      return 'bg-blue-500';
    case 'email':
      return 'bg-gray-600';
    case 'phone':
      return 'bg-blue-600';
    default:
      return 'bg-gray-500';
  }
}

export async function exportLogo() {
  const node = document.getElementById("logo-export");

  const dataUrl = await toPng(node, {
    pixelRatio: 2,   // << this is the quality fix
    quality: 1,      // force max
    cacheBust: true,
    backgroundColor: null,
  });

  const link = document.createElement("a");
  link.download = "naitrust-logo.png";
  link.href = dataUrl;
  link.click();
}

// export async function exportLogo() {
//   const node = document.getElementById("logo-export");

//   // Render to a raw canvas (may be clipped)
//   const rawCanvas = await toCanvas(node, {
//     pixelRatio: 2,
//     cacheBust: true,
//   });

//   // Create a bigger canvas (padding around)
//   const padding = 40; // adjust if shadows still clip
//   const finalCanvas = document.createElement("canvas");

//   finalCanvas.width = rawCanvas.width + padding * 2;
//   finalCanvas.height = rawCanvas.height + padding * 2;

//   const ctx = finalCanvas.getContext("2d");

//   // Fill transparent or white, your choice
//   ctx.fillStyle = "rgba(0,0,0,0)";
//   ctx.fillRect(0, 0, finalCanvas.width, finalCanvas.height);

//   // Draw the original canvas centered
//   ctx.drawImage(rawCanvas, padding, padding);

//   // Convert to PNG
//   const pngUrl = finalCanvas.toDataURL("image/png");

//   const link = document.createElement("a");
//   link.download = "naitrust-logo.png";
//   link.href = pngUrl;
//   link.click();
// }