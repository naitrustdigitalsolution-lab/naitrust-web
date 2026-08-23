/**
 * Frontend contract for the future ASP.NET Core sourcing orchestrator.
 * The deterministic mock does not call these endpoints. Production adapters
 * must preserve the application's standard response envelope and keep model,
 * marketplace and payment credentials on the server.
 */
export const sourcingAgentEndpoints = {
  createSession: '/api/sourcing/sessions',
  getSession: (sessionId: string) => `/api/sourcing/sessions/${sessionId}`,
  sendMessage: (sessionId: string) => `/api/sourcing/sessions/${sessionId}/messages`,
  uploadAttachment: (sessionId: string) => `/api/sourcing/sessions/${sessionId}/attachments`,
  updateBrief: (briefId: string) => `/api/sourcing/briefs/${briefId}`,
  compareQuotes: '/api/sourcing/quotes/compare',
  recommendAgents: (sessionId: string) => `/api/sourcing/sessions/${sessionId}/agent-recommendations`,
  approveDraft: (draftId: string) => `/api/sourcing/drafts/${draftId}/approve`,
  convertToOrder: (sessionId: string) => `/api/sourcing/sessions/${sessionId}/convert-to-order`,
  runEvents: (runId: string) => `/api/sourcing/runs/${runId}/events`,
} as const;

export const sourcingApprovalActions = [
  'supplier_outreach', 'negotiation_commitment', 'create_order', 'beneficiary_change',
  'inspection_acceptance', 'milestone_release',
] as const;

export const productionSourcingModelEnvironmentKey = 'OPENAI_SOURCING_MODEL' as const;
export const recommendedInitialSourcingModel = 'gpt-5.4-mini' as const;
