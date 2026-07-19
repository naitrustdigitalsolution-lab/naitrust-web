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
const DEFAULT_DESCRIPTION = 'Naitrust is trust infrastructure for Nigerian property transactions — a structured record of participants, agreements, payments, documents, and milestones from deal to completion.';
const DEFAULT_IMAGE = `${SITE_URL}/og-image.png`;

export function SEOHead({
  title,
  description = DEFAULT_DESCRIPTION,
  keywords,
  canonicalPath,
  ogType = 'website',
  ogImage = DEFAULT_IMAGE,
  noindex = false,
}: SEOHeadProps) {
  const fullTitle = title ? `${title} | ${SITE_NAME}` : `${SITE_NAME} — Trust Infrastructure for Property Transactions`;
  const canonicalUrl = canonicalPath ? `${SITE_URL}${canonicalPath}` : undefined;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      {keywords && <meta name="keywords" content={keywords} />}
      {noindex && <meta name="robots" content="noindex, nofollow" />}

      {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}

      {/* Open Graph */}
      <meta property="og:type" content={ogType} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:site_name" content={SITE_NAME} />
      {canonicalUrl && <meta property="og:url" content={canonicalUrl} />}

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />
    </Helmet>
  );
}
