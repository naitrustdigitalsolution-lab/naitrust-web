import { Helmet } from 'react-helmet-async';

interface SEOHeadProps {
  title?: string;
  description?: string;
  keywords?: string;
  canonicalPath?: string;
  ogType?: string;
  ogImage?: string;
  noindex?: boolean;
  structuredData?: Record<string, unknown> | Record<string, unknown>[];
}

const SITE_NAME = 'Naitrust';
const SITE_URL = 'https://naitrust.com';
const DEFAULT_DESCRIPTION = 'Naitrust helps Nigerians discover verified suppliers in China and Nigeria, browse products in English, receive confirmed landed-cost quotes, pay through protected orders, and track delivery.';
const DEFAULT_IMAGE = `${SITE_URL}/og-image.png`;
const DEFAULT_KEYWORDS = 'Naitrust Market, source products from China to Nigeria, verified China suppliers, Nigerian marketplace, China sourcing Nigeria, landed cost quote, import from China, protected supplier payment, international order tracking, product inspection China, sourcing agents China, customs and delivery Nigeria, domestic suppliers Nigeria, supplier showcase, Trust Profile';

export function SEOHead({
  title,
  description = DEFAULT_DESCRIPTION,
  keywords = DEFAULT_KEYWORDS,
  canonicalPath,
  ogType = 'website',
  ogImage = DEFAULT_IMAGE,
  noindex = false,
  structuredData,
}: SEOHeadProps) {
  const fullTitle = title ? `${title} | ${SITE_NAME}` : `${SITE_NAME}: Source from China with Confidence`;
  const canonicalUrl = noindex ? undefined : canonicalPath
    ? `${SITE_URL}${canonicalPath}`
    : typeof window !== 'undefined'
      ? `${SITE_URL}${window.location.pathname === '/' ? '/' : window.location.pathname.replace(/\/$/, '')}`
      : undefined;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="author" content="Naitrust Digital Solutions Limited" />
      <meta name="keywords" content={keywords} />
      <meta name="robots" content={noindex ? 'noindex, nofollow' : 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1'} />
      <meta name="googlebot" content={noindex ? 'noindex, nofollow' : 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1'} />
      <meta name="bingbot" content={noindex ? 'noindex, nofollow' : 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1'} />

      {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}
      {canonicalUrl && <link rel="alternate" hrefLang="en-NG" href={canonicalUrl} />}
      {canonicalUrl && <link rel="alternate" hrefLang="x-default" href={canonicalUrl} />}

      <meta property="og:type" content={ogType} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:image:secure_url" content={ogImage} />
      <meta property="og:image:alt" content="Naitrust verified suppliers, landed-cost quotes and protected delivery to Nigeria" />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:locale" content="en_NG" />
      {canonicalUrl && <meta property="og:url" content={canonicalUrl} />}

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content="@naitrust14419" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />
      <meta name="twitter:image:alt" content="Source from China with confidence through Naitrust" />
      {structuredData && (Array.isArray(structuredData) ? structuredData : [structuredData]).map((data, index) => (
        <script key={index} type="application/ld+json">{JSON.stringify(data)}</script>
      ))}
    </Helmet>
  );
}
