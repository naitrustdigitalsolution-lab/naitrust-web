export interface CreateOrderLinkDraft {
  url: string;
  note: string;
  quantity: string;
}

export interface CreateOrderDraft {
  orderTitle: string;
  startingFor: 'myself' | 'a-buyer';
  buyerContact: string;
  rows: CreateOrderLinkDraft[];
  destination: string;
  notes: string;
  selectedAgentIds: string[];
}

const STORAGE_KEY = 'naitrust_create_order_draft';

export function readCreateOrderDraft(): CreateOrderDraft | undefined {
  if (typeof window === 'undefined') return undefined;
  try {
    const draft = JSON.parse(window.sessionStorage.getItem(STORAGE_KEY) ?? '') as CreateOrderDraft;
    return Array.isArray(draft.rows) && Array.isArray(draft.selectedAgentIds)
      ? { ...draft, orderTitle: draft.orderTitle ?? '' }
      : undefined;
  } catch {
    return undefined;
  }
}

export function saveCreateOrderDraft(draft: CreateOrderDraft) {
  window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
}

export function selectAgentForCreateOrder(agentId: string) {
  const draft = readCreateOrderDraft();
  if (!draft) return;
  saveCreateOrderDraft({ ...draft, selectedAgentIds: [...new Set([...draft.selectedAgentIds, agentId])] });
}

export function clearCreateOrderDraft() {
  window.sessionStorage.removeItem(STORAGE_KEY);
}
