import { getMarketplaceAccountScope, marketplaceStorageKey } from './account-scope';
import type {
  PartnerApplication,
  PartnerRole,
  PartnerSession,
  ProductionStage,
  ProductionWorkflow,
} from './types';
import partnerNetworkFixture from '../../mocks/marketplace/partner-network.json';

const workflowKey = () => marketplaceStorageKey('production-workflows');
const applicationsKey = 'naitrust:partner-network:applications:v1';
const sessionKey = 'naitrust:partner-network:session:v1';

function read<T>(key: string, fallback: T): T {
  try { return JSON.parse(localStorage.getItem(key) ?? '') as T; } catch { return fallback; }
}

function write<T>(key: string, value: T): T {
  localStorage.setItem(key, JSON.stringify(value));
  return value;
}

const seededApplications = partnerNetworkFixture.applications as PartnerApplication[];

function listApplications(): PartnerApplication[] {
  const stored = read<PartnerApplication[] | null>(applicationsKey, null);
  if (stored) return stored;
  return write(applicationsKey, seededApplications);
}

function saveWorkflow(updated: ProductionWorkflow): ProductionWorkflow {
  const workflows = productionNetworkApi.listWorkflows();
  const exists = workflows.some((workflow) => workflow.id === updated.id);
  write(workflowKey(), exists ? workflows.map((workflow) => workflow.id === updated.id ? updated : workflow) : [updated, ...workflows]);
  return updated;
}

export const productionNetworkApi = {
  listWorkflows: (): ProductionWorkflow[] => read<ProductionWorkflow[]>(workflowKey(), []),

  createWorkflow: (input: { name: string; productBrief: string; quantity: number; targetDate?: string; destination: string }): ProductionWorkflow => {
    const now = new Date().toISOString();
    const stages: ProductionStage[] = [
      { id: `stage_product_${Date.now()}`, kind: 'product', title: 'Main product', requirement: input.productBrief, status: 'needs_supplier' },
      { id: `stage_packaging_${Date.now()}`, kind: 'packaging', title: 'Product packaging', requirement: 'Choose the carton, retail box, inserts, and packing quantity.', supplierId: 'sup_cn_pack', status: 'supplier_selected' },
      { id: `stage_labels_${Date.now()}`, kind: 'labels', title: 'Brand labels', requirement: 'Add logo labels, product information, barcode, and country-of-origin details.', status: 'needs_supplier' },
      { id: `stage_inspection_${Date.now()}`, kind: 'inspection', title: 'Final inspection', requirement: 'Check the product, branding, packaging, quantity, and shipping marks before collection.', status: 'needs_supplier' },
      { id: `stage_shipping_${Date.now()}`, kind: 'shipping', title: 'Consolidation and shipping', requirement: 'Collect every completed stage and coordinate one shipment to Nigeria.', status: 'needs_supplier' },
    ];
    const workflow: ProductionWorkflow = {
      id: `workflow_${Date.now()}`, ownerAccountId: getMarketplaceAccountScope(), name: input.name,
      productBrief: input.productBrief, quantity: input.quantity, targetDate: input.targetDate,
      destination: input.destination, stages, status: 'draft', createdAt: now, updatedAt: now,
    };
    return saveWorkflow(workflow);
  },

  updateStage: (workflowId: string, stageId: string, patch: Partial<ProductionStage>): ProductionWorkflow => {
    const workflow = productionNetworkApi.listWorkflows().find((item) => item.id === workflowId);
    if (!workflow) throw new Error('Production workflow not found.');
    const updated = { ...workflow, stages: workflow.stages.map((stage) => stage.id === stageId ? { ...stage, ...patch } : stage), status: 'sourcing' as const, updatedAt: new Date().toISOString() };
    return saveWorkflow(updated);
  },

  requestAgent: (workflowId: string, stageId: string): ProductionWorkflow => productionNetworkApi.updateStage(workflowId, stageId, {
    agentTaskId: `source_${Date.now()}`,
    status: 'needs_supplier',
  }),

  deleteWorkflow: (workflowId: string): void => {
    write(workflowKey(), productionNetworkApi.listWorkflows().filter((workflow) => workflow.id !== workflowId));
  },

  listApplications,

  submitApplication: (input: Omit<PartnerApplication, 'id' | 'status' | 'createdAt' | 'country'>): PartnerApplication => {
    const application: PartnerApplication = { ...input, id: `partner_${Date.now()}`, country: 'CN', status: 'pending', createdAt: new Date().toISOString() };
    write(applicationsKey, [application, ...listApplications()]);
    return application;
  },

  reviewApplication: (applicationId: string, status: 'approved' | 'rejected'): PartnerApplication => {
    const applications = listApplications();
    const current = applications.find((application) => application.id === applicationId);
    if (!current) throw new Error('Partner application not found.');
    const prefix = current.role === 'agent' ? 'AGENT' : 'SUPPLIER';
    const updated: PartnerApplication = { ...current, status, inviteCode: status === 'approved' ? `${prefix}-${String(Date.now()).slice(-6)}` : undefined };
    write(applicationsKey, applications.map((application) => application.id === applicationId ? updated : application));
    return updated;
  },

  loginPartner: (email: string, inviteCode: string): PartnerSession => {
    const application = listApplications().find((item) => item.email.toLowerCase() === email.trim().toLowerCase() && item.inviteCode === inviteCode.trim() && item.status === 'approved');
    if (!application) throw new Error('The email or partner access code is not valid.');
    const session: PartnerSession = { applicationId: application.id, role: application.role, name: application.companyName ?? application.contactName, email: application.email, locale: navigator.language.toLowerCase().startsWith('zh') ? 'zh-CN' : 'en' };
    return write(sessionKey, session);
  },

  getPartnerSession: (): PartnerSession | null => read<PartnerSession | null>(sessionKey, null),
  updatePartnerLocale: (locale: PartnerSession['locale']): PartnerSession | null => {
    const session = productionNetworkApi.getPartnerSession();
    return session ? write(sessionKey, { ...session, locale }) : null;
  },
  logoutPartner: (): void => localStorage.removeItem(sessionKey),

  partnerAssignments: (role: PartnerRole) => role === 'agent'
    ? partnerNetworkFixture.agentAssignments
    : partnerNetworkFixture.supplierAssignments,
};
