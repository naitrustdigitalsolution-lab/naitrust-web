import { getUserData } from '../api/config';

function safeScopePart(value: unknown): string {
  return String(value ?? '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9@._-]+/g, '_')
    .slice(0, 120);
}

/**
 * Mock commerce data must be isolated in the same way a backend would scope
 * every query by its authenticated owner. Public catalogue fixtures remain
 * shared; carts, quotes, orders, tasks, and seller records never do.
 */
export function getMarketplaceAccountScope(): string {
  const user = getUserData();
  const identity = safeScopePart(user?.id || user?.email || user?.naitrustId);
  return identity || 'signed-out-preview';
}

export function marketplaceStorageKey(resource: string, version = 'v2'): string {
  return `naitrust:market:${getMarketplaceAccountScope()}:${resource}:${version}`;
}
