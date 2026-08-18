import { readFile } from 'node:fs/promises';

const root = new URL('../', import.meta.url);
const readJson = async (path) => JSON.parse(await readFile(new URL(path, root), 'utf8'));
const catalogue = await readJson('src/mocks/marketplace/catalogue.json');
const operations = await readJson('src/mocks/operations/operations-database.json');
const partnerNetwork = await readJson('src/mocks/marketplace/partner-network.json');
const accountCommerce = await readJson('src/mocks/marketplace/account-commerce.json');
const authUserRecords = await readJson('src/mocks/apis/auth-users.json');
const authUsers = authUserRecords.users.map((record) => record.user);

const errors = [];
const unique = (values, label) => {
  const duplicates = values.filter((value, index) => values.indexOf(value) !== index);
  if (duplicates.length) errors.push(`${label} contains duplicate values: ${[...new Set(duplicates)].join(', ')}`);
};

if (catalogue.suppliers.length < 20) errors.push('Marketplace requires at least 20 supplier fixtures.');
unique(catalogue.suppliers.map((item) => item.id), 'Supplier IDs');
unique(catalogue.suppliers.map((item) => item.slug), 'Supplier slugs');
unique(catalogue.products.map((item) => item.id), 'Product IDs');
unique(operations.agents.map((item) => item.id), 'Operations agent IDs');

const supplierIds = new Set(catalogue.suppliers.map((item) => item.id));
for (const product of catalogue.products) {
  if (!supplierIds.has(product.supplierId)) errors.push(`Product ${product.id} references missing supplier ${product.supplierId}.`);
  if (!Array.isArray(product.media) || product.media.length === 0) errors.push(`Product ${product.id} has no catalogue media metadata.`);
}

for (const supplier of catalogue.suppliers) {
  if (!Array.isArray(supplier.media) || supplier.media.length !== 4) errors.push(`Supplier ${supplier.id} must have four showcase media records.`);
}

const operationAgentIds = new Set(operations.agents.map((item) => item.id));
for (const agent of operations.agents) {
  if (agent.nationality !== 'NG') errors.push(`Agent ${agent.id} must be a Nigerian sourcing partner for the launch network.`);
  if (agent.country !== 'CN') errors.push(`Agent ${agent.id} must operate from China for the launch network.`);
  if (!agent.profileType || !agent.yearsBasedInChina) errors.push(`Agent ${agent.id} needs profile type and China experience metadata.`);
}
for (const assignment of operations.assignments) {
  if (!operationAgentIds.has(assignment.agentId)) errors.push(`Assignment ${assignment.id} references missing agent ${assignment.agentId}.`);
}

const seededOrderIds = [];
for (const [accountId, commerce] of Object.entries(accountCommerce)) {
  if (!authUsers.some((user) => user.id === accountId)) errors.push(`Commerce fixtures reference missing account ${accountId}.`);
  for (const order of commerce.orders ?? []) {
    seededOrderIds.push(order.id);
    if (!supplierIds.has(order.supplierId)) errors.push(`Order ${order.id} references missing supplier ${order.supplierId}.`);
  }
}
unique(seededOrderIds, 'Account commerce order IDs');

if (!authUsers.some((user) => user.email === 'sade.importer@naitrust.test')) errors.push('Mock importer test account is missing.');
if (!authUsers.some((user) => user.email === 'admin@naitrust.test' && user.role === 'admin')) errors.push('Mock admin test account is missing.');
if (!partnerNetwork.applications.some((item) => item.status === 'approved')) errors.push('Partner network needs an approved fixture for login testing.');

if (errors.length) {
  console.error(errors.map((error) => `- ${error}`).join('\n'));
  process.exit(1);
}

console.log(`Sourcing fixtures verified: ${catalogue.suppliers.length} suppliers, ${catalogue.products.length} products, ${operations.agents.length} agents.`);
