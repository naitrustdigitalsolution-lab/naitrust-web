import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = process.cwd();
const marketplaceCatalogue = JSON.parse(readFileSync(resolve(root, 'src/mocks/marketplace/catalogue.json'), 'utf8'));
const manifestSource = readFileSync(resolve(root, 'src/libs/images/image-manifest.ts'), 'utf8');
const supplierIds = [...new Set(marketplaceCatalogue.suppliers.map((supplier) => supplier.id))];
const productIds = [...new Set(marketplaceCatalogue.products.map((product) => product.id))];
const productMappings = new Map([...manifestSource.matchAll(/^\s+(prd_[A-Za-z0-9_]+): '([^']+)'/gm)].map((match) => [match[1], match[2]]));
const failures = [];

const digest = (path) => createHash('sha256').update(readFileSync(path)).digest('hex');
const mappedProductFiles = [];

for (const productId of productIds) {
  const relativePath = productMappings.get(productId);
  if (!relativePath) {
    failures.push(`Missing manifest entry for product ${productId}`);
    continue;
  }
  const absolutePath = resolve(root, 'src/assets', relativePath);
  if (!existsSync(absolutePath)) failures.push(`Missing product asset ${relativePath}`);
  else mappedProductFiles.push(absolutePath);
}

for (const supplierId of supplierIds) {
  for (let slot = 0; slot < 4; slot += 1) {
    const absolutePath = resolve(root, `src/assets/market/suppliers/${supplierId}/${slot}.webp`);
    if (!existsSync(absolutePath)) failures.push(`Missing supplier asset ${supplierId}/${slot}.webp`);
  }
}

const productHashes = mappedProductFiles.map(digest);
if (new Set(productHashes).size !== productHashes.length) failures.push('Two or more mapped product images are exact duplicates');

const supplierFiles = supplierIds.flatMap((supplierId) => [0, 1, 2, 3].map((slot) => resolve(root, `src/assets/market/suppliers/${supplierId}/${slot}.webp`))).filter(existsSync);
const supplierHashes = supplierFiles.map(digest);
if (new Set(supplierHashes).size !== supplierHashes.length) failures.push('Two or more supplier gallery images are exact duplicates');

if (failures.length) {
  console.error(`Image coverage failed:\n- ${failures.join('\n- ')}`);
  process.exit(1);
}

console.log(`Image coverage passed: ${productIds.length} products and ${supplierIds.length} suppliers with ${supplierFiles.length} distinct supplier images.`);
