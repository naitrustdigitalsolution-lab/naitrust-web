import type { AgentTask, CustomerPaymentCurrency, LandedCostQuote, MarketCart, MarketOrder, ProductListing, SourcingAgent, Supplier } from './types';
import { getMarketplaceAccountScope, marketplaceStorageKey } from './account-scope';
import { catalogueRepository } from './catalogue.repository';
import accountCommerceFixture from '../../mocks/marketplace/account-commerce.json';
import { transactionsApi } from '../api/transactions.api';
import { appConfig } from '../../configs/env';
import { patchMockDealRuntime } from '../api/mock-protected-deal-store';
import { useAuthStore } from '../store/auth.store';

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
  const accountScope = getMarketplaceAccountScope();
  const account = demoAccounts[accountScope];
  const seeded = (account?.[resource] as T | undefined) ?? fallback;
  if (resource !== 'orders' || accountScope !== 'usr_mock_007' || !Array.isArray(seeded) || !seeded[0]) return seeded;
  const base = seeded[0] as MarketOrder;
  const additional: MarketOrder[] = [
    { ...base, id: 'order_aisha_usb_c', roomId: 'market_room_aisha_usb_c', quoteId: 'quote_aisha_usb_c', reference: 'NTM-4418219', itemSummary: 'Branded USB-C fast-charging cables', status: 'preparing', paymentAmountMinor: 126400000, protectedProductAmountMinor: 98000000, settlementAmountMinor: 438000, createdAt: '2026-08-16T08:30:00.000Z' },
    { ...base, id: 'order_aisha_beauty_pack', roomId: 'market_room_aisha_beauty_pack', quoteId: 'quote_aisha_beauty_pack', reference: 'NTM-4418231', itemSummary: 'Custom cosmetic jars and printed cartons', status: 'confirmed', paymentAmountMinor: 218600000, protectedProductAmountMinor: 172000000, settlementAmountMinor: 762000, createdAt: '2026-08-18T11:15:00.000Z' },
    { ...base, id: 'order_aisha_shop_lights', roomId: 'market_room_aisha_shop_lights', quoteId: 'quote_aisha_shop_lights', reference: 'NTM-4418244', itemSummary: 'Rechargeable LED shop display lights', status: 'inspection', paymentAmountMinor: 164200000, protectedProductAmountMinor: 121000000, settlementAmountMinor: 571000, createdAt: '2026-08-20T06:45:00.000Z' },
  ];
  return [...seeded, ...additional] as T;
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
  acceptQuote: async (quoteId: string, paymentCurrency: CustomerPaymentCurrency): Promise<MarketOrder> => {
    const quotes = marketplaceApi.listQuotes();
    const quote = quotes.find((item) => item.id === quoteId)!;
    if (!quote) throw new Error('Quote not found.');
    const logisticsPaidMinor = quote.logisticsPaidBy === 'buyer' ? quote.lines.filter((line) => line.kind !== 'products').reduce((sum, line) => sum + line.amountMinor, 0) : 0;
    const internationalSteps: MarketOrder['timeline'] = [
      ['confirmed', 'Quote accepted', 'Your order and logistics payment have been recorded.'], ['preparing', 'Supplier confirmed', 'Naitrust confirms the order and production details with the supplier.'], ['inspection', 'Inspection', 'Product and quantity evidence is collected before export.'], ['export_pickup', 'Export pickup', 'The shipment is collected from the supplier.'], ['international_transit', 'International transit', 'The shipment is travelling to Nigeria.'], ['customs', 'Customs clearance', 'Import documents and clearance are being processed.'], ['local_delivery', 'Delivery to your address', 'The cleared shipment is with the local delivery partner.'], ['buyer_review', 'Review your order', 'Confirm the goods match the accepted quote.'], ['released', 'Supplier paid', 'The supplier payment has been completed.'],
    ].map(([status, label, detail], index) => ({ status: status as MarketOrder['status'], label, detail, complete: index === 0, at: index === 0 ? new Date().toISOString() : undefined }));
    const domesticSteps: MarketOrder['timeline'] = [
      ['confirmed', 'Order confirmed', 'Your order payment has been recorded.'], ['preparing', 'Seller preparing', 'The seller is preparing the order.'], ['local_delivery', 'Dispatched', 'The order is moving to your address.'], ['buyer_review', 'Review your order', 'Confirm quantity and condition.'], ['released', 'Seller paid', 'The seller payment has been completed.'],
    ].map(([status, label, detail], index) => ({ status: status as MarketOrder['status'], label, detail, complete: index === 0, at: index === 0 ? new Date().toISOString() : undefined }));
    const productAmountMinor = quote.lines.find((line) => line.kind === 'products')?.amountMinor ?? quote.totalNgnMinor;
    const supplier = marketSuppliers.find((item) => item.id === quote.supplierId);
    if (!supplier) throw new Error('Supplier not found.');
    const productRows = quote.cart.items.map((item) => ({ item, product: marketProducts.find((candidate) => candidate.id === item.productId) })).filter((row): row is { item: MarketCart['items'][number]; product: ProductListing } => Boolean(row.product));
    const productNames = productRows.map(({ product }) => product.title);
    const buyerIsBusiness = ['business', 'business-member'].includes(useAuthStore.getState().user?.role ?? '');
    const roomResult = await transactionsApi.createTransaction({
      useCase: quote.deliveryMode === 'international' ? 'import-export' : 'supplier-purchase',
      workflowMode: 'delivery',
      deliveryMode: quote.deliveryMode,
      logisticsFeeMinor: logisticsPaidMinor,
      logisticsPaidBy: quote.logisticsPaidBy,
      dealType: 'single',
      partyMode: buyerIsBusiness ? 'b2b' : 'b2c',
      role: 'buyer',
      participants: [{ name: supplier.name, identifier: supplier.id, allocationMinor: productAmountMinor }],
      title: productNames.length === 1 ? productNames[0] : `${productNames.length} products from ${supplier.name}`,
      description: [productNames.join(', '), quote.cart.requirements].filter(Boolean).join('. '),
      amountMinor: productAmountMinor,
      currency: 'NGN',
      deliveryDueDate: new Date(Date.now() + (quote.deliveryMode === 'international' ? 42 : 7) * 86400000).toISOString().slice(0, 10),
      releaseConditions: quote.deliveryMode === 'international'
        ? 'The assigned agent submits satisfactory product, quantity and readiness evidence, and the buyer approves the eligible supplier release.'
        : 'The buyer receives the complete order in the agreed condition and approves the eligible supplier release.',
      expiresInDays: 7,
      agreement: {
        version: 1,
        generatedByAi: false,
        sections: [
          { heading: 'Products and specifications', body: `This order covers ${productNames.join(', ')} in the quantities and specifications recorded in the accepted quote.` },
          { heading: 'Supplier payment', body: 'Product funds are released only after the recorded inspection, readiness or receipt conditions are satisfied.' },
          { heading: 'Logistics', body: quote.deliveryMode === 'international' ? 'Inspection, export, international transit, customs and Nigerian delivery updates remain attached to this order.' : 'Domestic dispatch and delivery updates remain attached to this order.' },
        ],
      },
    });
    const roomId = roomResult.data.id;
    if (appConfig.isMock) {
      patchMockDealRuntime(roomId, {
        status: 'in_progress',
        invitationStatus: 'accepted',
        activity: [{ id: `order_${roomId}`, kind: 'created', message: 'Supplier quote accepted and managed Order Room opened.', createdAt: new Date().toISOString() }],
      });
    }
    write(key('quotes'), quotes.map((item) => item.id === quoteId ? { ...item, status: 'accepted' } : item));
    const order: MarketOrder = { id: `order_${Date.now()}`, roomId, itemSummary: productNames.join(', '), itemCount: productRows.length, reference: `NTM-${String(Date.now()).slice(-7)}`, quoteId, supplierId: quote.supplierId, deliveryMode: quote.deliveryMode, status: 'confirmed', paymentCurrency, paymentAmountMinor: paymentCurrency === 'USD' ? quote.totalUsdMinor : quote.totalNgnMinor, settlementCurrency: quote.sourceCurrency === 'CNY' ? 'CNY' : 'NGN', settlementAmountMinor: quote.sourceCurrency === 'CNY' ? quote.sourceSubtotalMinor : productAmountMinor, settlementProvider: 'provider_pending', protectedProductAmountMinor: productAmountMinor, logistics: { paidMinor: logisticsPaidMinor, committedMinor: 0, refundableMinor: logisticsPaidMinor, currency: 'NGN', status: logisticsPaidMinor ? 'paid' : 'not_required' }, createdAt: new Date().toISOString(), timeline: quote.deliveryMode === 'international' ? internationalSteps : domesticSteps };
    write(key('orders'), [order, ...marketplaceApi.listOrders()]);
    marketplaceApi.clearCart();
    return order;
  },
  /**
   * Start an order directly from pasted product links, before any supplier
   * or sourcing agent is attached. The buyer assigns an agent afterward from
   * the order room; pricing and supplier details are confirmed once the
   * agent reviews the links.
   */
  createCustomOrder: async (input: { links: { url: string; note?: string; quantity?: number }[]; destination: string; notes?: string }): Promise<MarketOrder> => {
    await wait();
    if (!input.links.length) throw new Error('Add at least one product link.');
    const order: MarketOrder = {
      id: `order_${Date.now()}`,
      reference: `NTM-${String(Date.now()).slice(-7)}`,
      itemSummary: `${input.links.length} product link${input.links.length === 1 ? '' : 's'} to review`,
      itemCount: input.links.length,
      deliveryMode: 'international',
      status: 'confirmed',
      createdAt: new Date().toISOString(),
      customLinks: input.links,
      destination: input.destination,
      requestNotes: input.notes,
    };
    write(key('orders'), [order, ...marketplaceApi.listOrders()]);
    return order;
  },
  listOrders: () => readDemoList<MarketOrder>('orders').map((order) => ({
    ...order,
    // Quoted catalogue orders created before rich rooms were introduced are
    // migrated at read time so old localStorage records follow the same
    // modern interface. Custom orders with no quote/agent yet have no room
    // to migrate to and correctly stay roomless until one is created.
    roomId: order.roomId ?? (order.quoteId ? `market_room_${order.id}` : undefined),
  })),
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
