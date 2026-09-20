import { appConfig } from '../../configs/env';
import { useAuthStore } from '../../libs/store/auth.store';
export const LEGAL_CHANGE_EVENT = 'naitrust:legal-change';
export function readLocal<T>(key: string, fallback: T): T {
  if (typeof localStorage === 'undefined') return fallback;
  try { return JSON.parse(localStorage.getItem(key) ?? 'null') ?? fallback; } catch { return fallback; }
}
export function writeLocal(key: string, value: unknown) {
  localStorage.setItem(key, JSON.stringify(value));
  window.dispatchEvent(new Event(LEGAL_CHANGE_EVENT));
}
export function accountSuspended(id?: string) {
  return appConfig.isMock && !!id && readLocal(`naitrust:account-control:${id}`, { suspended: false }).suspended;
}
export function assertActiveAccount() {
  const state = useAuthStore.getState();
  if (!state.isAuthenticated || !state.user) throw new Error('Sign in to continue.');
  if (accountSuspended(state.user.id)) throw new Error('This account is suspended. Contact Naitrust support.');
  return state.user;
}
export function mockActor() {
  if (!appConfig.isMock) throw new Error('Legal review is a mock preview. Production services are not connected.');
  return assertActiveAccount();
}
export function adminActor() {
  const actor = mockActor();
  if (actor.role !== 'admin') throw new Error('Naitrust administrator access is required.');
  return actor;
}
