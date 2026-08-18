import type { AgentTask, CustomerPaymentCurrency, LandedCostQuote, MarketCart, MarketOrder, ProductListing, SourcingAgent, Supplier } from './types';
import { getMarketplaceAccountScope, marketplaceStorageKey } from './account-scope';
import { catalogueRepository } from './catalogue.repository';
import accountCommerceFixture from '../../mocks/marketplace/account-commerce.json';

const key = (resource: 'cart' | 'quotes' | 'orders' | 'agent-tasks') => marketplaceStorageKey(resource);

export const marketSuppliers = catalogueRepository.listSuppliers();
export const marketProducts = catalogueRepository.listProducts();
export const sourcingAgents = catalogueRepository.listAgents();

function refreshCatalogue(): void {
  marketSuppliers.splice(0, marketSuppliers.length, ...catalogueRepository.listSuppliers());
  marketProducts.splice(0, marketProducts.length, ...catalogueRepository.listProducts());
}

function read<T>(key: string, fallback: T): T { try { return JSON.parse(localStorage.getItem(key) ?? '') as T; } catch { return fallback; } }
function write<T>(key: string, value: T): T { localStorage.setItem(key, JSON.stringify(value)); return value; }
const wait = () => new Promise((resolve) => setTimeout(resolve, 250));
export const MARKET_CART_UPDATED_EVENT = 'naitrust:market-cart-updated';
function notifyCartUpdated(): void { window.dispatchEvent(new CustomEvent(MARKET_CART_UPDATED_EVENT)); }

const demoAccounts = accountCommerceFixture as Record<string, { orders?: MarketOrder[]; quotes?: LandedCostQuote[] }>;
function demoSeed<T>(resource: 'quotes' | 'orders', fallback: T): T {
  const account = demoAccounts[getMarketplaceAccountScope()];
  return (account?.[resource] as T | undefined) ?? fallback;
}

function readDemoList<T extends { id: string }>(resource: 'quotes' | 'orders'): T[] {
  const stored = read<T[]>(key(resource), []);
  const storedIds = new Set(stored.map((item) => item.id));
  return [...stored, ...demoSeed<T[]>(resource, []).filter((item) => !storedIds.has(item.id))];
}

function buildQuote(cart: MarketCart, supplierId: string, batchId?: string): LandedCostQuote {
  const supplier = marketSuppliers.find((item) => item.id === supplierId);
  if (!supplier) throw new Error('Supplier not found.');
  const products = cart.items
    .map((item) => ({ item, product: marketProducts.find((product) => product.id === item.productId) }))
    .filter((row): row is { item: MarketCart['items'][number]; product: ProductListing } => Boolean(row.product));
  const productNgn = products.reduce((sum, row) => sum + row.product.estimatedNgnMinor * row.item.quantity, 0);
  const sourceSubtotalMinor = products.reduce((sum, row) => sum + row.product.sourcePriceMinor * row.item.quantity, 0);
  const international = supplier.country !== 'NG';
  const lines = [
    { label: 'Products', amountMinor: productNgn, currency: 'NGN' as const, kind: 'products' as const },
    ...(international ? [
      { label: 'Inspection and verification', amountMinor: Math.max(2500000, Math.round(productNgn * .025)), currency: 'NGN' as const, kind: 'inspection' as const },
      { label: 'Customs estimate', amountMinor: Math.round(productNgn * .08), currency: 'NGN' as const, kind: 'customs' as const },
      { label: 'Handling and insurance', amountMinor: Math.round(productNgn * .035), currency: 'NGN' as const, kind: 'handling' as const },
      { label: 'International and local logistics', amountMinor: Math.max(4500000, Math.round(productNgn * .12)), currency: 'NGN' as const, kind: 'logistics' as const },
    ] : supplier.id === 'sup_ng_textile' ? [] : [{ label: 'Domestic logistics', amountMinor: 2500000, currency: 'NGN' as const, kind: 'logistics' as const }]),
  ];
  const totalNgnMinor = lines.reduce((sum, line) => sum + line.amountMinor, 0);
  return {
    id: `quote_${supplierId}_${Date.now()}`, batchId, cart: { ...cart, supplierId, items: products.map((row) => row.item) },
    supplierId, deliveryMode: international ? 'international' : 'domestic', status: 'ready', sourceSubtotalMinor,
    sourceCurrency: supplier.country === 'CN' ? 'CNY' : 'NGN', lines, totalNgnMinor,
    totalUsdMinor: Math.round(totalNgnMinor / 1600), exchangeRateNote: 'Rate locked for this quote until expiry.',
    logisticsPaidBy: products.every(({ product }) => product.shippingPaidBy === 'seller') ? 'seller' : 'buyer',
    estimatedDelivery: international ? '28–42 days after supplier confirmation' : '3–7 working days',
    expiresAt: new Date(Date.now() + 48 * 3600000).toISOString(), createdAt: new Date().toISOString(),
  };
}

export const marketplaceApi = {
  refreshCatalogue,
  listSuppliers: async () => { await wait(); return marketSuppliers; },
  listProducts: async () => { await wait(); return marketProducts; },
  listAgents: async () => { await wait(); return sourcingAgents; },
  getCart: () => read<MarketCart | null>(key('cart'), null),
  saveCart: (cart: MarketCart) => { const saved = write(key('cart'), cart); notifyCartUpdated(); return saved; },
  clearCart: () => { localStorage.removeItem(key('cart')); notifyCartUpdated(); },
  listQuotes: () => readDemoList<LandedCostQuote>('quotes'),
  declineQuote: (quoteId: string) => write(key('quotes'), marketplaceApi.listQuotes().map((quote) => quote.id === quoteId ? { ...quote, status: 'declined' as const } : quote)),
  createQuote: async (cart: MarketCart): Promise<LandedCostQuote> => {
    await wait();
    const firstProduct = marketProducts.find((product) => product.id === cart.items[0]?.productId);
    const supplierId = cart.supplierId ?? firstProduct?.supplierId;
    if (!supplierId) throw new Error('Cart has no supplier products.');
    const quote = buildQuote(cart, supplierId);
    write(key('quotes'), [quote, ...marketplaceApi.listQuotes()]);
    return quote;
  },
  createQuoteBatch: async (cart: MarketCart): Promise<LandedCostQuote[]> => {
    await wait();
    const batchId = `quote_batch_${Date.now()}`;
    const groups = new Map<string, MarketCart['items']>();
    cart.items.forEach((item) => {
      const supplierId = marketProducts.find((product) => product.id === item.productId)?.supplierId;
      if (!supplierId) return;
      groups.set(supplierId, [...(groups.get(supplierId) ?? []), item]);
    });
    const quotes = [...groups.entries()].map(([supplierId, items]) => buildQuote({ ...cart, supplierId, items }, supplierId, batchId));
    write(key('quotes'), [...quotes, ...marketplaceApi.listQuotes()]);
    marketplaceApi.clearCart();
    return quotes;
  },
  acceptQuote: (quoteId: string, paymentCurrency: CustomerPaymentCurrency): MarketOrder => {
    const quotes = marketplaceApi.listQuotes();
    const quote = quotes.find((item) => item.id === quoteId)!;
    write(key('quotes'), quotes.map((item) => item.id === quoteId ? { ...item, status: 'accepted' } : item));
    const logisticsPaidMinor = quote.logisticsPaidBy === 'buyer' ? quote.lines.filter((line) => line.kind !== 'products').reduce((sum, line) => sum + line.amountMinor, 0) : 0;
    const internationalSteps: MarketOrder['timeline'] = [
      ['confirmed', 'Quote accepted', 'Your order and logistics payment have been recorded.'], ['preparing', 'Supplier confirmed', 'Naitrust confirms the order and production details with the supplier.'], ['inspection', 'Inspection', 'Product and quantity evidence is collected before export.'], ['export_pickup', 'Export pickup', 'The shipment is collected from the supplier.'], ['international_transit', 'International transit', 'The shipment is travelling to Nigeria.'], ['customs', 'Customs clearance', 'Import documents and clearance are being processed.'], ['local_delivery', 'Delivery to your address', 'The cleared shipment is with the local delivery partner.'], ['buyer_review', 'Review your order', 'Confirm the goods match the accepted quote.'], ['released', 'Supplier paid', 'The supplier payment has been completed.'],
    ].map(([status, label, detail], index) => ({ status: status as MarketOrder['status'], label, detail, complete: index === 0, at: index === 0 ? new Date().toISOString() : undefined }));
    const domesticSteps: MarketOrder['timeline'] = [
      ['confirmed', 'Order confirmed', 'Your order payment has been recorded.'], ['preparing', 'Seller preparing', 'The seller is preparing the order.'], ['local_delivery', 'Dispatched', 'The order is moving to your address.'], ['buyer_review', 'Review your order', 'Confirm quantity and condition.'], ['released', 'Seller paid', 'The seller payment has been completed.'],
    ].map(([status, label, detail], index) => ({ status: status as MarketOrder['status'], label, detail, complete: index === 0, at: index === 0 ? new Date().toISOString() : undefined }));
    const productAmountMinor = quote.lines.find((line) => line.kind === 'products')?.amountMinor ?? quote.totalNgnMinor;
    const order: MarketOrder = { id: `order_${Date.now()}`, reference: `NTM-${String(Date.now()).slice(-7)}`, quoteId, supplierId: quote.supplierId, deliveryMode: quote.deliveryMode, status: 'confirmed', paymentCurrency, paymentAmountMinor: paymentCurrency === 'USD' ? quote.totalUsdMinor : quote.totalNgnMinor, settlementCurrency: quote.sourceCurrency === 'CNY' ? 'CNY' : 'NGN', settlementAmountMinor: quote.sourceCurrency === 'CNY' ? quote.sourceSubtotalMinor : productAmountMinor, settlementProvider: 'provider_pending', protectedProductAmountMinor: productAmountMinor, logistics: { paidMinor: logisticsPaidMinor, committedMinor: 0, refundableMinor: logisticsPaidMinor, currency: 'NGN', status: logisticsPaidMinor ? 'paid' : 'not_required' }, createdAt: new Date().toISOString(), timeline: quote.deliveryMode === 'international' ? internationalSteps : domesticSteps };
    write(key('orders'), [order, ...marketplaceApi.listOrders()]);
    marketplaceApi.clearCart();
    return order;
  },
  listOrders: () => readDemoList<MarketOrder>('orders'),
  advanceOrder: (orderId: string): MarketOrder => {
    const orders = marketplaceApi.listOrders();
    const current = orders.find((order) => order.id === orderId)!;
    const pendingIndex = current.timeline.findIndex((step) => !step.complete);
    const nextIndex = pendingIndex < 0 ? current.timeline.length - 1 : pendingIndex;
    const nextStep = current.timeline[nextIndex];
    const updated: MarketOrder = { ...current, status: nextStep.status, timeline: current.timeline.map((step, index) => index <= nextIndex ? { ...step, complete: true, at: step.at ?? new Date().toISOString() } : step) };
    write(key('orders'), orders.map((order) => order.id === orderId ? updated : order));
    return updated;
  },
  cancelOrder: (orderId: string, committedLogisticsMinor: number): MarketOrder => {
    const orders = marketplaceApi.listOrders();
    const current = orders.find((order) => order.id === orderId)!;
    const committed = Math.min(Math.max(0, committedLogisticsMinor), current.logistics.paidMinor);
    const updated: MarketOrder = { ...current, status: 'cancelled', logistics: { ...current.logistics, committedMinor: committed, refundableMinor: current.logistics.paidMinor - committed, status: current.logistics.paidMinor ? 'partially_used' : 'not_required' } };
    write(key('orders'), orders.map((order) => order.id === orderId ? updated : order));
    return updated;
  },
  listAgentTasks: () => read<AgentTask[]>(key('agent-tasks'), []),
  hireAgent: (input: Omit<AgentTask, 'id' | 'status'>) => { const task: AgentTask = { ...input, id: `task_${Date.now()}`, status: 'invited' }; write(key('agent-tasks'), [task, ...marketplaceApi.listAgentTasks()]); return task; },
  updateAgentTask: (taskId: string, status: AgentTask['status']) => write(key('agent-tasks'), marketplaceApi.listAgentTasks().map((task) => task.id === taskId ? { ...task, status } : task)),
};
