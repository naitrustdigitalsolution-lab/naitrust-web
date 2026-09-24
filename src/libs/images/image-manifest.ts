const assetModules = import.meta.glob('../../assets/**/*.{webp,png,jpg,jpeg,avif}', {
  eager: true,
  query: '?url',
  import: 'default',
}) as Record<string, string>;

export type ImageAspect = '16/9' | '4/3' | '3/2' | '1/1' | '4/5';
export type ImageFocalPoint = 'center' | 'left' | 'right' | 'top' | 'bottom';

export interface ImageAsset {
  src: string;
  alt: string;
  aspect: ImageAspect;
  focalPoint: ImageFocalPoint;
  priority?: boolean;
}

function resolveAsset(path: string): string {
  const key = `../../assets/${path}`;
  const source = assetModules[key];
  if (!source && import.meta.env.DEV) console.warn(`[images] Missing mapped asset: ${path}`);
  return source ?? '';
}

function image(path: string, alt: string, aspect: ImageAspect = '4/3', focalPoint: ImageFocalPoint = 'center', priority = false): ImageAsset {
  return { src: resolveAsset(path), alt, aspect, focalPoint, priority };
}

export const pageImages = {
  homeHero: image('home/naitrust-studio-hero-v1.webp', 'A Nigerian customer reviewing her phone in a calm blue studio', '16/9', 'right', true),
  homeImportInspection: image('pages/protected-payment-success-v1.png', 'A protected payment confirmed and released successfully'),
  aboutHero: image('pages/about-protected-payment-v1.png', 'Two Nigerian business participants reviewing a protected payment agreement'),
  customerHero: image('pages/individual-protected-payment-hero-v2.webp', 'A Nigerian woman looking at her phone at home', '4/3', 'center', true),
  customerDelivery: image('pages/protected-payment-success-v1.png', 'Protected funds released after the agreed conditions were completed'),
  businessHero: image('pages/business-protected-payment-hero-v1.png', 'A Nigerian business team reviewing a protected vendor payment', '4/3', 'center', true),
  businessFulfilment: image('pages/protected-payment-success-v1.png', 'Protected business funds released after the agreed conditions were completed'),
  marketHero: image('pages/protected-payment-success-v1.png', 'A successful transaction protected by Naitrust', '16/9', 'center', true),
  login: image('pages/naitrust-naira-payment-v2.webp', 'A Nigerian buyer and shop owner checking a protected naira payment together', '3/2'),
  registerCustomer: image('pages/agree-protect-approve-v1.png', 'A clear protected payment flow from agreement to approval'),
  registerBusiness: image('pages/protected-payment-success-v1.png', 'A protected business payment completing successfully'),
} as const;

const agentImageKeys = ['aboutHero', 'customerHero', 'registerCustomer', 'businessHero', 'customerDelivery'] as const;

export function getAgentRepresentativeImage(agentId: string): ImageAsset {
  const hash = [...agentId].reduce((total, character) => total + character.charCodeAt(0), 0);
  return pageImages[agentImageKeys[hash % agentImageKeys.length]];
}

export type PageImageKey = keyof typeof pageImages;

export const appImagePaths = {
  dashboard: 'app/dashboard-commerce-v1.webp',
  quotes: 'app/landed-cost-quote-v1.webp',
  orders: 'app/order-tracking-v1.webp',
  agents: 'app/sourcing-agent-v1.webp',
  wallet: 'app/order-wallet-v1.webp',
  messages: 'app/sourcing-messages-v1.webp',
  support: 'app/support-request-v1.webp',
  settings: 'app/account-settings-v1.webp',
  trustProfile: 'app/trust-profile-v1.webp',
  businessCommerce: 'app/business-showcase-v1.webp',
  deliveryWorkflow: 'app/workflow-delivery-v1.webp',
  serviceWorkflow: 'app/workflow-service-v1.webp',
  milestoneWorkflow: 'app/workflow-milestone-v1.webp',
  inspectionStage: 'app/stage-inspection-v1.webp',
  exportStage: 'app/stage-export-v1.webp',
  customsStage: 'app/stage-customs-v1.webp',
  deliveredStage: 'app/stage-delivered-v1.webp',
} as const;

export type AppImageKey = keyof typeof appImagePaths;

export function getAppImage(key: AppImageKey, alt: string): ImageAsset {
  return image(appImagePaths[key], alt, '16/9');
}

export const productImagePaths = {
  prd_boxes: 'market/products/shipping-boxes-v1.webp',
  prd_bags: 'market/products/carrier-bags-v1.webp',
  prd_powerbank: 'market/products/power-banks-v1.webp',
  prd_uniform: 'market/products/staff-uniforms-v1.webp',
  prd_kitchen: 'market/products/kitchen-storage-v1.webp',
  prd_solar: 'market/products/solar-lighting-v1.webp',
  prd_beauty: 'market/products/beauty-tools-v1.webp',
  prd_chair: 'market/products/commercial-chairs-v1.webp',
  prd_auto: 'market/products/auto-accessories-v1.webp',
  prd_machine: 'market/products/filling-machine-v1.webp',
  prd_shoes_cn: 'market/products/casual-sneakers-v1.webp',
  prd_cables: 'market/products/charging-cables-v1.webp',
  prd_hotel: 'market/products/hotel-amenities-v1.webp',
  prd_toys: 'market/products/educational-toys-v1.webp',
  prd_spices: 'market/products/spice-cartons-v1.webp',
  prd_leather: 'market/products/leather-bags-v1.webp',
  prd_desk: 'market/products/office-desks-v1.webp',
  prd_labels: 'market/products/product-labels-v1.webp',
  prd_soap: 'market/products/body-soap-v1.webp',
  prd_sandals: 'market/products/leather-sandals-v1.webp',
  prd_cleaning: 'market/products/cleaning-bundle-v1.webp',
  prd_luma_earbuds: 'market/products/wireless-earbuds-v1.webp',
  prd_luma_chargers: 'market/products/usb-c-wall-chargers-v1.webp',
  prd_luma_speakers: 'market/products/portable-speakers-v1.webp',
  prd_luma_strips: 'market/products/power-strips-v1.webp',
} as const;

export type ProductImageKey = keyof typeof productImagePaths;

export function getProductImage(productId: string): ImageAsset | null {
  const path = productImagePaths[productId as ProductImageKey];
  return path ? image(path, '') : null;
}

export type SupplierMediaSlot = 0 | 1 | 2 | 3;
export type SupplierMediaKey = `${string}:${SupplierMediaSlot}`;

export function getSupplierMedia(supplierId: string, slot: SupplierMediaSlot, alt: string): ImageAsset | null {
  const source = resolveAsset(`market/suppliers/${supplierId}/${slot}.webp`);
  return source ? { src: source, alt, aspect: '4/3', focalPoint: 'center' } : null;
}

export function getSupplierCover(supplierId: string, alt: string): ImageAsset | null {
  return getSupplierMedia(supplierId, 0, alt);
}
