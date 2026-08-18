import { marketProducts, marketSuppliers } from '../../../libs/marketplace/marketplace.api';
import type {
  AgentAssignment, AssignmentEvidence, LogisticsProvider, OrderLedgerEntry, PartnerApplication,
  ReadinessCertification, ShipmentBatch, SourcingRequest,
} from '../domain/types';
import { operationsRepository } from '../data/operations-repository';

const wait = (milliseconds = 220) => new Promise((resolve) => window.setTimeout(resolve, milliseconds));
const makeId = (prefix: string) => `${prefix}_${Date.now()}_${crypto.randomUUID().slice(0, 8)}`;
const now = () => new Date().toISOString();

function ownerId(): string {
  return operationsRepository.principal().id;
}

function normalizeServiceText(value: string): string {
  return value.trim().replace(/\s+/g, ' ');
}

function moderateText(value: string): { safeText: string; flagged: boolean } {
  const patterns = [
    /\b(?:\+?234|0)[789]\d{9}\b/g,
    /\b\+?86\s?1\d{10}\b/g,
    /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi,
    /\b(?:wechat|whatsapp|telegram|instagram|weibo)\s*(?:id|handle|number|:)?\s*[@\w.+-]+/gi,
    /https?:\/\/\S+/gi,
  ];
  let safeText = value;
  let flagged = false;
  patterns.forEach((pattern) => {
    safeText = safeText.replace(pattern, () => {
      flagged = true;
      return '[contact detail removed]';
    });
  });
  return { safeText, flagged };
}

function rankedAgents(city: string, category: string) {
  const database = operationsRepository.read();
  return database.agents
    .filter((agent) => agent.verified && agent.available)
    .map((agent) => {
      const location = agent.city.toLowerCase() === city.toLowerCase() ? 45 : 12;
      const expertise = agent.expertise.some((item) => item.toLowerCase().includes(category.toLowerCase()) || category.toLowerCase().includes(item.toLowerCase())) ? 35 : 8;
      const performance = Math.round(agent.rating * 4);
      return { agent, score: location + expertise + performance, reasons: [location > 20 ? `Operates in ${city}` : `Can travel from ${agent.city}`, expertise > 20 ? `Specializes in ${category}` : 'General sourcing experience', `${agent.rating.toFixed(1)} rating across ${agent.completedTasks} tasks`] };
    })
    .sort((left, right) => right.score - left.score);
}

export const sourcingApi = {
  async analyseInput(input: { source: string; description: string; category: string; quantity: number; destination: string }): Promise<SourcingRequest> {
    await wait(520);
    const userId = ownerId();
    const source = input.source.trim();
    const isLink = /^https?:\/\//i.test(source);
    const sourceLower = `${source} ${input.description}`.toLowerCase();
    const footwear = /shoe|sneaker|footwear/.test(sourceLower);
    const electronics = /phone|cable|electronic|charger/.test(sourceLower);
    const category = input.category || (footwear ? 'Fashion & footwear' : electronics ? 'Electronics' : 'General wholesale');
    const city = footwear ? 'Quanzhou' : electronics ? 'Shenzhen' : 'Guangzhou';
    const title = normalizeServiceText(input.description) || (footwear ? 'Custom wholesale footwear request' : electronics ? 'Wholesale electronics request' : 'New wholesale sourcing request');
    const request: SourcingRequest = {
      id: makeId('src'), ownerUserId: userId, title, inputType: isLink ? 'link' : 'description',
      sourceUrl: isLink ? source : undefined, originalDescription: input.description || source,
      category, quantity: Math.max(1, input.quantity), destination: input.destination,
      supplierName: isLink ? (footwear ? 'Marketplace footwear supplier' : 'Marketplace supplier candidate') : undefined,
      supplierCity: city, supplierCountry: 'CN', verificationStatus: 'basic_scan',
      status: input.quantity > 0 && input.destination.trim() ? 'ready_for_verification' : 'needs_information',
      extractedFields: [
        { key: 'category', label: 'Product category', value: category, confidence: 0.94, source: input.category ? 'buyer' : 'ai' },
        { key: 'location', label: 'Likely supplier location', value: city, confidence: isLink ? 0.79 : 0.48, source: isLink ? 'link' : 'ai' },
        { key: 'quantity', label: 'Requested quantity', value: String(Math.max(1, input.quantity)), confidence: 1, source: 'buyer' },
      ],
      missingFields: input.destination.trim() ? [] : ['Delivery destination'], createdAt: now(), updatedAt: now(),
    };
    operationsRepository.mutate((database) => ({ ...database, sourcingRequests: [request, ...database.sourcingRequests] }));
    return request;
  },

  listRequests(): SourcingRequest[] {
    const userId = ownerId();
    return operationsRepository.read().sourcingRequests.filter((item) => item.ownerUserId === userId);
  },

  getRequest(requestId: string): SourcingRequest | undefined {
    return sourcingApi.listRequests().find((item) => item.id === requestId);
  },

  listAgents() {
    return operationsRepository.read().agents.filter((agent) => agent.verified);
  },

  recommendAgents(input: { city: string; category: string }) {
    return rankedAgents(input.city, input.category).slice(0, 3);
  },

  listFavouriteAgentIds(): string[] {
    const userId = ownerId();
    return operationsRepository.read().favouriteAgents.filter((item) => item.ownerUserId === userId).map((item) => item.agentId);
  },

  toggleFavouriteAgent(agentId: string): boolean {
    const userId = ownerId();
    let isFavourite = false;
    operationsRepository.mutate((database) => {
      const exists = database.favouriteAgents.some((item) => item.ownerUserId === userId && item.agentId === agentId);
      isFavourite = !exists;
      return {
        ...database,
        favouriteAgents: exists
          ? database.favouriteAgents.filter((item) => !(item.ownerUserId === userId && item.agentId === agentId))
          : [{ ownerUserId: userId, agentId, createdAt: now() }, ...database.favouriteAgents],
      };
    });
    return isFavourite;
  },

  hireAgent(input: { agentId: string; sourcingRequestId?: string; orderId?: string; supplierId?: string; supplierName: string; supplierCity: string; title: string; scope: string; deadline: string; productNames: string[] }): AgentAssignment {
    const agent = operationsRepository.read().agents.find((item) => item.id === input.agentId);
    if (!agent?.verified || !agent.available) throw new Error('This agent is not currently available.');
    const userId = ownerId();
    const assignment: AgentAssignment = {
      id: makeId('asn'), ownerUserId: userId, agentId: agent.id, supplierId: input.supplierId,
      supplierName: input.supplierName, supplierCity: input.supplierCity, relatedOrderId: input.orderId,
      relatedSourcingRequestId: input.sourcingRequestId, title: input.title, scope: normalizeServiceText(input.scope),
      deadline: input.deadline, feeMinor: agent.feeFromMinor, feeCurrency: 'NGN', status: 'invited',
      productScopes: input.productNames.map((productName, index) => ({ id: makeId(`scope${index}`), productName, requirements: ['Confirm specifications', 'Confirm quantity', 'Upload inspection evidence'], status: 'pending' })),
      messages: [{ id: makeId('msg'), senderRole: 'admin', senderName: 'Naitrust Operations', body: `Assignment created for ${agent.name}. Supplier contact remains private inside Naitrust.`, createdAt: now() }],
      evidence: [], milestones: [
        { id: makeId('mile'), label: 'Supplier deposit', percent: 20, amountMinor: 0, currency: 'NGN', requiredEvidence: ['Supplier verification', 'Approved sample or stock confirmation'], status: 'pending' },
        { id: makeId('mile'), label: 'Production progress', percent: 30, amountMinor: 0, currency: 'NGN', requiredEvidence: ['Production evidence', 'Quantity update'], status: 'pending' },
        { id: makeId('mile'), label: 'Final inspection and custody', percent: 50, amountMinor: 0, currency: 'NGN', requiredEvidence: ['Final inspection', 'Custody or warehouse receipt'], status: 'pending' },
      ], certifications: [], createdAt: now(), updatedAt: now(),
    };
    operationsRepository.mutate((database) => ({ ...database, assignments: [assignment, ...database.assignments] }));
    return assignment;
  },

  listAssignments(): AgentAssignment[] {
    const userId = ownerId();
    return operationsRepository.read().assignments.filter((item) => item.ownerUserId === userId);
  },

  getAssignment(assignmentId: string): AgentAssignment | undefined {
    return sourcingApi.listAssignments().find((item) => item.id === assignmentId);
  },

  sendMessage(assignmentId: string, body: string): { assignment: AgentAssignment; flagged: boolean } {
    const user = operationsRepository.principal();
    const moderated = moderateText(normalizeServiceText(body));
    let updated: AgentAssignment | undefined;
    operationsRepository.mutate((database) => {
      const assignment = database.assignments.find((item) => item.id === assignmentId && item.ownerUserId === user.id);
      if (!assignment) throw new Error('Assignment not found.');
      updated = { ...assignment, messages: [...assignment.messages, { id: makeId('msg'), senderRole: 'buyer', senderName: user.name, body: moderated.safeText, createdAt: now() }], updatedAt: now() };
      return {
        ...database,
        assignments: database.assignments.map((item) => item.id === assignmentId ? updated! : item),
        moderationCases: moderated.flagged ? [{ id: makeId('mod'), ownerUserId: user.id, sourceType: 'message', reason: 'Possible off-platform contact detail', excerpt: body.slice(0, 100), status: 'open', createdAt: now() }, ...database.moderationCases] : database.moderationCases,
      };
    });
    return { assignment: updated!, flagged: moderated.flagged };
  },

  addMockEvidence(assignmentId: string, input: Omit<AssignmentEvidence, 'id' | 'createdAt' | 'submittedBy'>): AgentAssignment {
    const user = operationsRepository.principal();
    let updated: AgentAssignment | undefined;
    operationsRepository.mutate((database) => {
      const assignment = database.assignments.find((item) => item.id === assignmentId && (item.ownerUserId === user.id || user.role === 'admin'));
      if (!assignment) throw new Error('Assignment not found.');
      const evidence = { ...input, id: makeId('ev'), createdAt: now(), submittedBy: user.name };
      updated = { ...assignment, evidence: [evidence, ...assignment.evidence], status: 'evidence_submitted', updatedAt: now() };
      return { ...database, assignments: database.assignments.map((item) => item.id === assignmentId ? updated! : item) };
    });
    return updated!;
  },

  reviewCertification(assignmentId: string, certificationId: string, decision: 'approve' | 'changes' | 'dispute'): AgentAssignment {
    const userId = ownerId();
    let updated: AgentAssignment | undefined;
    operationsRepository.mutate((database) => {
      const assignment = database.assignments.find((item) => item.id === assignmentId && item.ownerUserId === userId);
      if (!assignment) throw new Error('Assignment not found.');
      const certification = assignment.certifications.find((item) => item.id === certificationId);
      if (!certification) throw new Error('Release recommendation not found.');
      const certificateStatus: ReadinessCertification['status'] = decision === 'approve' ? 'approved' : decision === 'changes' ? 'changes_requested' : 'disputed';
      const milestoneStatus = decision === 'approve' ? 'approved' : decision === 'changes' ? 'changes_requested' : 'disputed';
      updated = {
        ...assignment,
        status: decision === 'approve' ? 'release_requested' : decision === 'changes' ? 'changes_requested' : assignment.status,
        certifications: assignment.certifications.map((item) => item.id === certificationId ? { ...item, status: certificateStatus, buyerDecisionAt: now() } : item),
        milestones: assignment.milestones.map((item) => item.id === certification.milestoneId ? { ...item, status: milestoneStatus } : item),
        updatedAt: now(),
      };
      return { ...database, assignments: database.assignments.map((item) => item.id === assignmentId ? updated! : item) };
    });
    return updated!;
  },

  listLogisticsProviders(): LogisticsProvider[] {
    return operationsRepository.read().logisticsProviders.filter((item) => item.verified && item.status === 'active');
  },

  listShipments(): ShipmentBatch[] {
    const userId = ownerId();
    return operationsRepository.read().shipments.filter((item) => item.ownerUserId === userId);
  },

  createShipment(input: { name: string; destination: string; orders: ShipmentBatch['orders'] }): ShipmentBatch {
    const userId = ownerId();
    if (!input.orders.some((item) => item.ready)) throw new Error('Select at least one ready order.');
    const providers = sourcingApi.listLogisticsProviders();
    const shipment: ShipmentBatch = {
      id: makeId('ship'), ownerUserId: userId, reference: `NTS-${String(Date.now()).slice(-7)}`, name: input.name,
      destination: input.destination, orders: input.orders.filter((item) => item.ready), status: 'quote_requested', custodyEvents: [],
      quotes: providers.slice(0, 2).map((provider, index) => ({ id: makeId('sq'), providerId: provider.id, amountMinor: provider.priceFromMinor + index * 8500000, currency: 'NGN', mode: index === 0 ? 'sea' : 'air', estimatedDays: index === 0 ? 38 : 12, expiresAt: new Date(Date.now() + 48 * 3600000).toISOString(), includedServices: provider.services.slice(0, 4), status: 'ready' })),
      createdAt: now(), updatedAt: now(),
    };
    operationsRepository.mutate((database) => ({ ...database, shipments: [shipment, ...database.shipments] }));
    return shipment;
  },

  acceptShippingQuote(shipmentId: string, quoteId: string): ShipmentBatch {
    const userId = ownerId();
    let updated: ShipmentBatch | undefined;
    operationsRepository.mutate((database) => {
      const shipment = database.shipments.find((item) => item.id === shipmentId && item.ownerUserId === userId);
      if (!shipment) throw new Error('Shipment not found.');
      if (!shipment.quotes.some((item) => item.id === quoteId && item.status === 'ready')) throw new Error('Shipping quote is unavailable.');
      updated = { ...shipment, selectedQuoteId: quoteId, status: 'booked', quotes: shipment.quotes.map((item) => ({ ...item, status: item.id === quoteId ? 'accepted' : 'declined' })), updatedAt: now() };
      return { ...database, shipments: database.shipments.map((item) => item.id === shipmentId ? updated! : item) };
    });
    return updated!;
  },

  listLedger(orderId?: string): OrderLedgerEntry[] {
    const userId = ownerId();
    return operationsRepository.read().ledgerEntries.filter((item) => item.ownerUserId === userId && (!orderId || item.orderId === orderId));
  },

  listRewards() {
    const userId = ownerId();
    return operationsRepository.read().rewardEntries.filter((item) => item.ownerUserId === userId);
  },

  submitPartnerApplication(input: Omit<PartnerApplication, 'id' | 'status' | 'createdAt'>): PartnerApplication {
    const application: PartnerApplication = { ...input, id: makeId('pa'), status: 'pending', createdAt: now() };
    operationsRepository.mutate((database) => ({ ...database, partnerApplications: [application, ...database.partnerApplications] }));
    return application;
  },

  catalogueContext(productIds: string[]) {
    return productIds.map((productId) => {
      const product = marketProducts.find((item) => item.id === productId);
      const supplier = marketSuppliers.find((item) => item.id === product?.supplierId);
      return { product, supplier };
    }).filter((item) => item.product && item.supplier);
  },
};
