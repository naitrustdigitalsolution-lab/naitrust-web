import { Helmet } from 'react-helmet-async';

interface SEOHeadProps {
  title?: string;
  description?: string;
  keywords?: string;
  canonicalPath?: string;
  ogType?: string;
  ogImage?: string;
  noindex?: boolean;
}

const SITE_NAME = 'Naitrust';
const SITE_URL = 'https://naitrust.com';
const DEFAULT_DESCRIPTION = 'Naitrust helps Nigerian customers and businesses send and receive money, verify who they are dealing with, and protect important transactions with shared terms, evidence, and payment status.';
const DEFAULT_IMAGE = `${SITE_URL}/og-image.png`;
const DEFAULT_KEYWORDS =
  'Naitrust, payments Nigeria, send money Nigeria, receive money Nigeria, payment links Nigeria, QR payments Nigeria, protected transactions, protected payments, business payments Nigeria, customer payment protection, verified businesses Nigeria, trust infrastructure Nigeria';

export function SEOHead({
  title,
  description = DEFAULT_DESCRIPTION,
  keywords = DEFAULT_KEYWORDS,
  canonicalPath,
  ogType = 'website',
  ogImage = DEFAULT_IMAGE,
  noindex = false,
}: SEOHeadProps) {
  const fullTitle = title ? `${title} | ${SITE_NAME}` : `${SITE_NAME} — Payments and Protected Transactions`;
  const canonicalUrl = canonicalPath
    ? `${SITE_URL}${canonicalPath}`
    : typeof window !== 'undefined'
      ? `${SITE_URL}${window.location.pathname === '/' ? '/' : window.location.pathname.replace(/\/$/, '')}`
      : undefined;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta
        name="robots"
        content={noindex ? 'noindex, nofollow' : 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1'}
      />
      <meta name="googlebot" content={noindex ? 'noindex, nofollow' : 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1'} />

      {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}

      {/* Open Graph */}
      <meta property="og:type" content={ogType} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:image:alt" content="Naitrust payments and Protected Transactions for Nigerian customers and businesses" />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:locale" content="en_NG" />
      {canonicalUrl && <meta property="og:url" content={canonicalUrl} />}

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content="@naitrust14419" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />
      <meta name="twitter:image:alt" content="Naitrust payments and Protected Transactions" />
    </Helmet>
  );
}
