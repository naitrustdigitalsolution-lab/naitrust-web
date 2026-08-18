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
  homeHero: image('hero/china-sourcing-hero-v1.webp', 'A Nigerian buyer reviewing products with a Chinese supplier', '4/3', 'center', true),
  homeImportInspection: image('home/import-order-inspection-v1.webp', 'A Nigerian business owner inspecting products received from an import order'),
  aboutHero: image('pages/about-cross-border-v2.webp', 'A Nigerian commerce operator and Chinese sourcing specialist reviewing product requirements'),
  customerHero: image('pages/customer-hero-v2.webp', 'A Nigerian customer comparing product samples with a Chinese supplier representative', '4/3', 'center', true),
  customerDelivery: image('pages/customer-delivery-v1.webp', 'A Nigerian shop owner inspecting products received from an international order'),
  businessHero: image('pages/business-hero-v2.webp', 'A Nigerian manufacturer preparing products for a supplier showcase', '4/3', 'center', true),
  businessFulfilment: image('pages/business-fulfilment-v1.webp', 'A Nigerian business team packing a domestic customer order'),
  marketHero: image('pages/market-hero-v2.webp', 'A Nigerian buyer reviewing wholesale product samples with a Chinese supplier', '16/9', 'center', true),
  login: image('pages/login-sourcing-v2.webp', 'Product samples and order-planning tools on an importer desk'),
  registerCustomer: image('pages/register-customer-v1.webp', 'A Nigerian entrepreneur documenting a product sample for sourcing'),
  registerBusiness: image('pages/register-business-v1.webp', 'A Nigerian manufacturer standing beside finished products in a workshop'),
} as const;

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
