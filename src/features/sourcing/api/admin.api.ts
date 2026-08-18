import type { AgentProfile, LogisticsProvider, OperationsDatabase, PartnerApplication } from '../domain/types';
import { operationsRepository } from '../data/operations-repository';

const now = () => new Date().toISOString();
const makeId = (prefix: string) => `${prefix}_${Date.now()}_${crypto.randomUUID().slice(0, 8)}`;

function audit(database: OperationsDatabase, action: string, entityType: string, entityId: string, summary: string): OperationsDatabase {
  const actor = operationsRepository.assertAdmin();
  return { ...database, auditEvents: [{ id: makeId('audit'), actorUserId: actor.id, action, entityType, entityId, summary, createdAt: now() }, ...database.auditEvents] };
}

export const adminApi = {
  dashboard() {
    operationsRepository.assertAdmin();
    const database = operationsRepository.read();
    return {
      pendingApplications: database.partnerApplications.filter((item) => item.status === 'pending').length,
      sourcingRequests: database.sourcingRequests.filter((item) => !['closed', 'quoted'].includes(item.status)).length,
      evidenceReviews: database.assignments.filter((item) => ['evidence_submitted', 'release_requested'].includes(item.status)).length,
      shipmentExceptions: database.shipments.filter((item) => item.status === 'claim_open').length,
      paymentReviews: database.assignments.flatMap((item) => item.certifications).filter((item) => item.status === 'buyer_review').length,
      moderationCases: database.moderationCases.filter((item) => item.status === 'open').length,
      newLeads: database.waitlistLeads.filter((item) => item.status === 'new').length,
    };
  },

  database(): OperationsDatabase {
    operationsRepository.assertAdmin();
    return operationsRepository.read();
  },

  reviewApplication(applicationId: string, status: 'approved' | 'rejected', note: string): PartnerApplication {
    const actor = operationsRepository.assertAdmin();
    let updated: PartnerApplication | undefined;
    operationsRepository.mutate((database) => {
      const current = database.partnerApplications.find((item) => item.id === applicationId);
      if (!current) throw new Error('Application not found.');
      updated = { ...current, status, reviewedAt: now(), reviewedBy: actor.id, reviewNote: note.trim() || undefined };
      let next = { ...database, partnerApplications: database.partnerApplications.map((item) => item.id === applicationId ? updated! : item) };
      if (status === 'approved' && current.kind === 'logistics_provider') {
        const provider: LogisticsProvider = {
          id: makeId('log'), name: current.companyName ?? current.contactName, country: current.country,
          cities: [current.city], routes: current.routes ?? [], services: current.services, cargoCategories: ['General merchandise'],
          priceFromMinor: 0, priceToMinor: 0, currency: 'NGN', verified: true, status: 'active', rating: 0,
          completedShipments: 0, insuranceSummary: current.insuranceSummary ?? 'Not provided',
          verificationSummary: 'Application approved by Naitrust operations. Service evidence requires ongoing review.',
        };
        next = { ...next, logisticsProviders: [provider, ...next.logisticsProviders] };
      }
      if (status === 'approved' && current.kind === 'sourcing_agent') {
        const agent: AgentProfile = {
          id: makeId('agt'), name: current.contactName, profileType: current.companyName ? 'company' : 'individual', businessName: current.companyName,
          nationality: 'NG', yearsBasedInChina: 0, city: current.city, country: 'CN', serviceRadiusKm: 50,
          languages: current.languages, expertise: current.services, services: current.services, logisticsCapabilities: [],
          verified: true, available: false, rating: 0, completedTasks: 0, responseMinutes: 0, feeFromMinor: 0,
          feeToMinor: 0, feeCurrency: 'NGN', verificationSummary: 'Application approved. Pricing and availability must be configured before matching.',
        };
        next = { ...next, agents: [agent, ...next.agents] };
      }
      return audit(next, `application.${status}`, 'partner_application', applicationId, `${current.kind} application ${status}.`);
    });
    return updated!;
  },

  setAgentStatus(agentId: string, available: boolean): AgentProfile {
    let updated: AgentProfile | undefined;
    operationsRepository.mutate((database) => {
      const current = database.agents.find((item) => item.id === agentId);
      if (!current) throw new Error('Agent not found.');
      updated = { ...current, available };
      return audit({ ...database, agents: database.agents.map((item) => item.id === agentId ? updated! : item) }, available ? 'agent.activated' : 'agent.paused', 'agent', agentId, `${current.name} availability changed.`);
    });
    return updated!;
  },

  setLogisticsStatus(providerId: string, status: LogisticsProvider['status']): LogisticsProvider {
    let updated: LogisticsProvider | undefined;
    operationsRepository.mutate((database) => {
      const current = database.logisticsProviders.find((item) => item.id === providerId);
      if (!current) throw new Error('Logistics provider not found.');
      updated = { ...current, status };
      return audit({ ...database, logisticsProviders: database.logisticsProviders.map((item) => item.id === providerId ? updated! : item) }, `logistics.${status}`, 'logistics_provider', providerId, `${current.name} changed to ${status}.`);
    });
    return updated!;
  },

  updateLeadStatus(leadId: string, status: OperationsDatabase['waitlistLeads'][number]['status']) {
    operationsRepository.mutate((database) => {
      const current = database.waitlistLeads.find((item) => item.id === leadId);
      if (!current) throw new Error('Lead not found.');
      const next = { ...database, waitlistLeads: database.waitlistLeads.map((item) => item.id === leadId ? { ...item, status } : item) };
      return audit(next, 'lead.status_changed', 'waitlist_lead', leadId, `${current.fullName} changed to ${status}.`);
    });
  },

  resolveModeration(caseId: string, status: 'cleared' | 'actioned') {
    operationsRepository.mutate((database) => {
      const current = database.moderationCases.find((item) => item.id === caseId);
      if (!current) throw new Error('Moderation case not found.');
      const next = { ...database, moderationCases: database.moderationCases.map((item) => item.id === caseId ? { ...item, status } : item) };
      return audit(next, `moderation.${status}`, 'moderation_case', caseId, `${current.reason}: ${status}.`);
    });
  },
};
