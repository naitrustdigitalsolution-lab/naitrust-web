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
const DEFAULT_DESCRIPTION = 'Naitrust helps people and businesses in Nigeria verify who they are dealing with, make payments, find verified businesses, and use Protected Deals for protected transactions when delivery still matters.';
const DEFAULT_IMAGE = `${SITE_URL}/og-image.png`;
const DEFAULT_KEYWORDS =
  'Naitrust, Naitrust Nigeria, Nigerian fintech, Nigerian fintech app, fintech Nigeria, finance technology Nigeria, financial technology platform, finance payment app, digital finance Nigeria, digital payment Nigeria, online payment Nigeria, payment app Nigeria, payment platform Nigeria, payment service Nigeria, payment solution Nigeria, money transfer Nigeria, send money Nigeria, receive money Nigeria, pay online Nigeria, bill payment Nigeria, pay bills Nigeria, online bill payment Nigeria, utility bill payment Nigeria, electricity bill payment Nigeria, prepaid electricity payment, postpaid electricity payment, electricity token purchase, airtime purchase Nigeria, mobile airtime recharge, data bundle payment Nigeria, mobile data subscription, cable TV payment Nigeria, TV subscription payment, internet bill payment Nigeria, broadband subscription payment, water bill payment Nigeria, school fee payment Nigeria, education bill payment, examination fee payment, government payment Nigeria, tax payment Nigeria, levy payment Nigeria, rent payment Nigeria, payroll payment Nigeria, salary payment Nigeria, supplier bill payment, vendor bill payment, logistics bill payment, transport bill payment, subscription payment Nigeria, recurring bill payment, one time bill payment, weekly bill payment, monthly bill payment, quarterly bill payment, annual bill payment, business bill management, manage business bills, bill reminder Nigeria, due bill tracking, overdue bill tracking, upcoming bill tracking, paid bill history, business payment Nigeria, customer payment Nigeria, supplier payment Nigeria, merchant payment Nigeria, vendor payment Nigeria, contractor payment Nigeria, person to person payment, P2P payment Nigeria, B2B payment Nigeria, B2C payment Nigeria, C2B payment Nigeria, business to business payment, customer to business payment, payment collection Nigeria, collect customer payments, receive business payments, trusted payment Nigeria, trusted online payment, payment confidence Nigeria, payment transparency Nigeria, transparent payment process, payment verification Nigeria, verified payment participant, verify before payment, verify before paying, know who you are paying, know who you are dealing with, verify a business before paying, business verification Nigeria, verified business Nigeria, verified businesses Nigeria, registered business search Nigeria, find verified businesses, search registered businesses, business discovery Nigeria, trusted business directory Nigeria, business Trust Profile, Naitrust Trust Profile, verified seller Nigeria, verified merchant Nigeria, verified supplier Nigeria, pay verified business, conduct payment with verified business, Protected Deal, Protected Deals Nigeria, protected payment Nigeria, protected transaction Nigeria, protected transactions Nigeria, transaction protection Nigeria, payment protection Nigeria, purchase protection Nigeria, order protection Nigeria, protect orders Nigeria, protected orders Nigeria, protect online order, order payment protection, buyer payment protection, seller payment protection, trade payment protection, supplier order protection, customer order protection, marketplace payment protection, delivery payment protection, payment before delivery protection, payment release after delivery, conditional payment release, single release payment, protected business deal, protected customer deal, protected supplier deal, protected contractor deal, protected purchase Nigeria, safe transaction Nigeria, safe online transaction, safer transaction Nigeria, safe business transaction, secure payment Nigeria, secure online payment, secure business payment, safer online payment, trusted transaction Nigeria, deal protection Nigeria, digital deal room, shared Deal Room, Naitrust Deal Room, transaction agreement record, payment evidence record, delivery evidence Nigeria, delivery tracking payment, payment and delivery tracking, business deal management, transaction record Nigeria, agreement and payment tracking, participant verification Nigeria, identity verification for deals, business identity verification, payment recipient verification, transaction participant verification, escrow alternative Nigeria, escrow payment alternative, online escrow alternative, digital escrow alternative, escrow style payment workflow, payment holding alternative, trusted payment link, business payment link, payment request link, QR payment Nigeria, fintech for small business Nigeria, SME payment Nigeria, small business payment app, online seller payment Nigeria, social commerce payment Nigeria, ecommerce payment protection Nigeria, Nigerian business payments, Nigerian customer payments, Nigerian digital payments, Lagos fintech, fintech for buyers, fintech for sellers, fintech for merchants, fintech for suppliers, fintech for contractors, Naitrust business account, business account Nigeria, open business account Nigeria, online business account, fintech business account, SME business account Nigeria, merchant business account, business payment account, receive money business account, manage business payments, manage business customers, business customer management, customer management Nigeria, manage customer payments, customer payment records, customer transaction history, business customer list, business contacts management, manage suppliers Nigeria, supplier management Nigeria, vendor management Nigeria, manage business contacts, customer and supplier management, business collections Nigeria, sales payment collection, receive sales payments, track customer payments, track supplier payments, business money activity, business transaction history, business account payment activity';

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
  const fullTitle = title ? `${title} | ${SITE_NAME}` : `${SITE_NAME}: Payments, Verification and Protected Deals`;
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
      <meta
        name="robots"
        content={noindex ? 'noindex, nofollow' : 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1'}
      />
      <meta name="googlebot" content={noindex ? 'noindex, nofollow' : 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1'} />
      <meta name="bingbot" content={noindex ? 'noindex, nofollow' : 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1'} />

      {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}
      {canonicalUrl && <link rel="alternate" hrefLang="en-NG" href={canonicalUrl} />}
      {canonicalUrl && <link rel="alternate" hrefLang="x-default" href={canonicalUrl} />}

      {/* Open Graph */}
      <meta property="og:type" content={ogType} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:image:secure_url" content={ogImage} />
      <meta property="og:image:alt" content="Naitrust payments and Protected Deals for Nigerian customers and businesses" />
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
      <meta name="twitter:image:alt" content="Naitrust payments and Protected Deals" />
      {structuredData && (Array.isArray(structuredData) ? structuredData : [structuredData]).map((data, index) => (
        <script key={index} type="application/ld+json">{JSON.stringify(data)}</script>
      ))}
    </Helmet>
  );
}
