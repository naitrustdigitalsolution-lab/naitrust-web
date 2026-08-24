export type MarketCountry = 'NG' | 'CN' | 'JP' | 'TH' | 'US';
export type DeliveryMode = 'domestic' | 'international';
export type MarketCurrency = 'NGN' | 'USD' | 'CNY';
export type CustomerPaymentCurrency = 'NGN' | 'USD';
export type PartnerPayoutCurrency = 'NGN' | 'USD' | 'CNY';

export interface ShowcaseMedia {
  id: string;
  type: 'image' | 'video';
  url?: string;
  title: string;
  caption?: string;
}

export interface Supplier {
  id: string;
  name: string;
  slug: string;
  country: MarketCountry;
  city: string;
  category: string;
  description: string;
  verified: boolean;
  managedByNaitrust: boolean;
  languages: string[];
  rating: number;
  completedOrders: number;
  responseRate: number;
  verificationSummary: string;
  fulfilmentRegions: string[];
  media: ShowcaseMedia[];
}

export interface ProductVariant { name: string; values: string[] }

export interface ProductListing {
  id: string;
  supplierId: string;
  title: string;
  description: string;
  category: string;
  country: MarketCountry;
  sourceCurrency: MarketCurrency;
  sourcePriceMinor: number;
  estimatedNgnMinor: number;
  minimumOrderQuantity: number;
  unit: string;
  variants: ProductVariant[];
  specifications: Record<string, string>;
  shippingPaidBy: 'buyer' | 'seller';
  available: boolean;
  translatedByNaitrust: boolean;
  media: ShowcaseMedia[];
}

export interface CartItem {
  productId: string;
  quantity: number;
  selections: Record<string, string>;
  customization?: string;
}

export interface MarketCart {
  /** Legacy single-supplier hint. New carts derive supplier groups from product IDs. */
  supplierId?: string;
  items: CartItem[];
  deliveryAddress?: string;
  requirements?: string;
  updatedAt: string;
}

export type QuoteStatus = 'pending' | 'ready' | 'accepted' | 'declined' | 'expired';
export interface QuoteLine { label: string; amountMinor: number; currency: 'NGN'; kind: 'products' | 'inspection' | 'customs' | 'handling' | 'insurance' | 'logistics' }
export interface LandedCostQuote {
  id: string;
  batchId?: string;
  cart: MarketCart;
  supplierId: string;
  deliveryMode: DeliveryMode;
  status: QuoteStatus;
  sourceSubtotalMinor: number;
  sourceCurrency: MarketCurrency;
  lines: QuoteLine[];
  totalNgnMinor: number;
  totalUsdMinor: number;
  exchangeRateNote: string;
  logisticsPaidBy: 'buyer' | 'seller';
  estimatedDelivery: string;
  expiresAt: string;
  createdAt: string;
}

export type OrderStatus = 'confirmed' | 'preparing' | 'inspection' | 'export_pickup' | 'international_transit' | 'customs' | 'local_delivery' | 'delivered' | 'buyer_review' | 'released' | 'cancelled';
export interface LogisticsCharge { paidMinor: number; committedMinor: number; refundableMinor: number; currency: 'NGN'; status: 'not_required' | 'paid' | 'partially_used' | 'refunded' }
/** A product link the buyer pasted from any Chinese platform when starting a custom order, before a sourcing agent or supplier is attached. */
export interface CustomOrderLink { url: string; note?: string; quantity?: number }
export interface MarketOrder {
  id: string;
  /** Rich managed room containing terms, evidence, messages and release controls. */
  roomId?: string;
  /** Compact catalogue summary used by order lists before quote details load. */
  itemSummary?: string;
  itemCount?: number;
  reference: string;
  /**
   * Present once this order is priced from an accepted catalogue quote.
   * Absent for a custom order started from pasted product links, before a
   * sourcing agent has confirmed the supplier and produced a quote.
   */
  quoteId?: string;
  supplierId?: string;
  /** Verified sourcing agent selected by the buyer when the order was created. */
  assignedAgentId?: string;
  /** All verified sourcing agents invited to cover this order across locations. */
  assignedAgentIds?: string[];
  deliveryMode: DeliveryMode;
  status: OrderStatus;
  paymentCurrency?: CustomerPaymentCurrency;
  paymentAmountMinor?: number;
  settlementCurrency?: PartnerPayoutCurrency;
  settlementAmountMinor?: number;
  settlementProvider?: 'provider_pending' | 'fincra_verto' | 'flutterwave' | 'nium';
  protectedProductAmountMinor?: number;
  logistics?: LogisticsCharge;
  createdAt: string;
  timeline?: Array<{ status: OrderStatus; label: string; detail: string; at?: string; complete: boolean }>;
  /** Buyer-pasted product links this custom order was started from. */
  customLinks?: CustomOrderLink[];
  destination?: string;
  requestNotes?: string;
}

/**
 * An invitation connecting a buyer's order with a sourcing agent, sent by
 * email or phone. Works whether or not the recipient already has a Naitrust
 * account: unregistered invitees register via the invite link, then land on
 * the order once they claim it. Carries its own snapshot of the order
 * because the invitee's account cannot read the inviter's private order
 * record directly.
 *
 * `agent_invite`: a buyer already has an order and invites an agent to it
 * (`orderId` is a real order the buyer owns).
 * `buyer_request`: an agent has found products for a buyer who has no order
 * yet; claiming it creates the order in the buyer's own account.
 */
export interface OrderAgentInvitation {
  token: string;
  kind: 'agent_invite' | 'buyer_request';
  orderId: string;
  orderReference: string;
  orderSummary: string;
  destination?: string;
  links: CustomOrderLink[];
  contact: string;
  invitedByName: string;
  createdAt: string;
  expiresAt: string;
  status: 'pending' | 'claimed' | 'expired' | 'withdrawn';
  claimedByUserId?: string;
  claimedByName?: string;
}

export interface SourcingAgent {
  id: string;
  name: string;
  city: string;
  country: 'CN';
  languages: string[];
  services: string[];
  verified: boolean;
  rating: number;
  completedTasks: number;
  feeFromNgnMinor: number;
}

export interface AgentTask {
  id: string;
  agentId: string;
  title: string;
  scope: string;
  deadline: string;
  feeNgnMinor: number;
  customerPaymentCurrency?: CustomerPaymentCurrency;
  agentPayoutCurrency?: PartnerPayoutCurrency;
  status: 'draft' | 'invited' | 'in_progress' | 'evidence_submitted' | 'approved' | 'paid';
  relatedOrderId?: string;
}

export type ProductionStageKind = 'product' | 'packaging' | 'labels' | 'inspection' | 'shipping';
export type ProductionStageStatus = 'needs_supplier' | 'supplier_selected' | 'quoted' | 'in_progress' | 'complete';

export interface ProductionStage {
  id: string;
  kind: ProductionStageKind;
  title: string;
  requirement: string;
  supplierId?: string;
  agentTaskId?: string;
  status: ProductionStageStatus;
}

export interface ProductionWorkflow {
  id: string;
  ownerAccountId: string;
  name: string;
  productBrief: string;
  quantity: number;
  targetDate?: string;
  destination: string;
  stages: ProductionStage[];
  status: 'draft' | 'sourcing' | 'quoted' | 'production' | 'shipping' | 'complete';
  createdAt: string;
  updatedAt: string;
}

export type PartnerRole = 'agent' | 'supplier' | 'logistics';
export type PartnerApplicationStatus = 'pending' | 'approved' | 'rejected';

export interface PartnerApplication {
  id: string;
  role: PartnerRole;
  companyName?: string;
  contactName: string;
  email: string;
  phone: string;
  country: 'CN';
  city: string;
  languages: string[];
  services: string[];
  experience: string;
  verificationDocumentName?: string;
  verificationDocumentType?: string;
  verificationDocumentSize?: number;
  status: PartnerApplicationStatus;
  inviteCode?: string;
  createdAt: string;
}

export interface PartnerSession {
  applicationId: string;
  role: PartnerRole;
  name: string;
  email: string;
  locale: 'en' | 'zh-CN';
}
