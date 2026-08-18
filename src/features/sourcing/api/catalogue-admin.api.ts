import { catalogueRepository } from '../../../libs/marketplace/catalogue.repository';
import { marketplaceApi } from '../../../libs/marketplace/marketplace.api';
import type { MarketCountry, ProductListing, Supplier } from '../../../libs/marketplace/types';
import { operationsRepository } from '../data/operations-repository';

export interface CreateSupplierInput {
  name: string;
  country: Extract<MarketCountry, 'CN' | 'NG'>;
  city: string;
  category: string;
  description: string;
}

export interface CreateProductInput {
  supplierId: string;
  title: string;
  category: string;
  description: string;
  minimumOrderQuantity: number;
  unit: string;
  estimatedNgnMinor: number;
}

const id = (prefix: string) => `${prefix}_${Date.now()}_${crypto.randomUUID().slice(0, 6)}`;
const slug = (value: string) => value.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

function audit(action: string, entityType: string, entityId: string, summary: string): void {
  const actor = operationsRepository.assertAdmin();
  operationsRepository.mutate((database) => ({
    ...database,
    auditEvents: [{ id: id('audit'), actorUserId: actor.id, action, entityType, entityId, summary, createdAt: new Date().toISOString() }, ...database.auditEvents],
  }));
}

export const catalogueAdminApi = {
  list() {
    operationsRepository.assertAdmin();
    return { suppliers: catalogueRepository.listSuppliers(), products: catalogueRepository.listProducts() };
  },
  createSupplier(input: CreateSupplierInput): Supplier {
    operationsRepository.assertAdmin();
    const supplier: Supplier = {
      id: id(input.country === 'CN' ? 'sup_cn' : 'sup_ng'),
      name: input.name.trim(),
      slug: `${slug(input.name)}-${String(Date.now()).slice(-5)}`,
      country: input.country,
      city: input.city.trim(),
      category: input.category.trim(),
      description: input.description.trim(),
      verified: true,
      managedByNaitrust: input.country === 'CN',
      languages: input.country === 'CN' ? ['Mandarin', 'English through Naitrust'] : ['English'],
      rating: 0,
      completedOrders: 0,
      responseRate: 0,
      verificationSummary: 'Added by Naitrust operations. Verification evidence is managed in the admin record.',
      fulfilmentRegions: ['Nigeria'],
      media: [],
    };
    catalogueRepository.createSupplier(supplier);
    marketplaceApi.refreshCatalogue();
    audit('catalogue.supplier_created', 'supplier', supplier.id, `${supplier.name} added to the managed catalogue.`);
    return supplier;
  },
  createProduct(input: CreateProductInput): ProductListing {
    operationsRepository.assertAdmin();
    const supplier = catalogueRepository.listSuppliers().find((candidate) => candidate.id === input.supplierId);
    if (!supplier) throw new Error('Supplier not found.');
    const product: ProductListing = {
      id: id('prd'),
      supplierId: supplier.id,
      title: input.title.trim(),
      description: input.description.trim(),
      category: input.category.trim(),
      country: supplier.country,
      sourceCurrency: supplier.country === 'CN' ? 'CNY' : 'NGN',
      sourcePriceMinor: 0,
      estimatedNgnMinor: input.estimatedNgnMinor,
      minimumOrderQuantity: Math.max(1, input.minimumOrderQuantity),
      unit: input.unit.trim(),
      variants: [],
      specifications: {},
      shippingPaidBy: 'buyer',
      available: false,
      translatedByNaitrust: supplier.country === 'CN',
      media: [],
    };
    catalogueRepository.createProduct(product);
    marketplaceApi.refreshCatalogue();
    audit('catalogue.product_created', 'product', product.id, `${product.title} added as an incomplete draft listing.`);
    return product;
  },
  setSupplierAvailability(supplierId: string, available: boolean): void {
    operationsRepository.assertAdmin();
    catalogueRepository.setSupplierAvailability(supplierId, available);
    marketplaceApi.refreshCatalogue();
    audit(`catalogue.supplier_${available ? 'published' : 'paused'}`, 'supplier', supplierId, `Supplier availability set to ${available}.`);
  },
  setProductAvailability(productId: string, available: boolean): void {
    operationsRepository.assertAdmin();
    const product = catalogueRepository.listProducts().find((candidate) => candidate.id === productId);
    if (!product) throw new Error('Product not found.');
    if (available && product.media.length === 0) throw new Error('Add a matching product image before publishing this listing.');
    catalogueRepository.setProductAvailability(productId, available);
    marketplaceApi.refreshCatalogue();
    audit(`catalogue.product_${available ? 'published' : 'paused'}`, 'product', productId, `Product availability set to ${available}.`);
  },
};
