import marketplaceCatalogueFixture from '../../mocks/marketplace/catalogue.json';
import type { ProductListing, SourcingAgent, Supplier } from './types';

interface CatalogueOverrides {
  version: 1;
  suppliers: Supplier[];
  products: ProductListing[];
  supplierAvailability: Record<string, boolean>;
  productAvailability: Record<string, boolean>;
}

const STORAGE_KEY = 'naitrust:market:catalogue-overrides:v1';
export const CATALOGUE_CHANGED_EVENT = 'naitrust:market-catalogue-changed';

const seed = marketplaceCatalogueFixture as {
  suppliers: Supplier[];
  products: ProductListing[];
  agents: SourcingAgent[];
};

function emptyOverrides(): CatalogueOverrides {
  return { version: 1, suppliers: [], products: [], supplierAvailability: {}, productAvailability: {} };
}

function read(): CatalogueOverrides {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '') as CatalogueOverrides;
    return parsed.version === 1 ? parsed : emptyOverrides();
  } catch {
    return emptyOverrides();
  }
}

function write(value: CatalogueOverrides): CatalogueOverrides {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
  window.dispatchEvent(new CustomEvent(CATALOGUE_CHANGED_EVENT));
  return value;
}

function withSupplierAvailability(supplier: Supplier, overrides: CatalogueOverrides): Supplier {
  const available = overrides.supplierAvailability[supplier.id];
  return available === undefined ? supplier : { ...supplier, verified: available && supplier.verified };
}

function withProductAvailability(product: ProductListing, overrides: CatalogueOverrides): ProductListing {
  const available = overrides.productAvailability[product.id];
  return available === undefined ? product : { ...product, available };
}

export const catalogueRepository = {
  listSuppliers(): Supplier[] {
    const overrides = read();
    return [...overrides.suppliers, ...seed.suppliers].map((supplier) => withSupplierAvailability(supplier, overrides));
  },
  listProducts(): ProductListing[] {
    const overrides = read();
    return [...overrides.products, ...seed.products].map((product) => withProductAvailability(product, overrides));
  },
  listAgents(): SourcingAgent[] {
    return seed.agents;
  },
  createSupplier(supplier: Supplier): Supplier {
    const overrides = read();
    if (this.listSuppliers().some((candidate) => candidate.id === supplier.id || candidate.slug === supplier.slug)) throw new Error('A supplier with this ID or slug already exists.');
    write({ ...overrides, suppliers: [supplier, ...overrides.suppliers] });
    return supplier;
  },
  createProduct(product: ProductListing): ProductListing {
    const overrides = read();
    if (this.listProducts().some((candidate) => candidate.id === product.id)) throw new Error('A product with this ID already exists.');
    if (!this.listSuppliers().some((candidate) => candidate.id === product.supplierId)) throw new Error('Select a valid supplier.');
    write({ ...overrides, products: [product, ...overrides.products] });
    return product;
  },
  setSupplierAvailability(supplierId: string, available: boolean): void {
    const overrides = read();
    write({ ...overrides, supplierAvailability: { ...overrides.supplierAvailability, [supplierId]: available } });
  },
  setProductAvailability(productId: string, available: boolean): void {
    const overrides = read();
    write({ ...overrides, productAvailability: { ...overrides.productAvailability, [productId]: available } });
  },
};
