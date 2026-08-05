export type NaitrustIdKind = 'personal' | 'business';

export const NAITRUST_ID_PATTERN = /^NT-(PA|BIZ)-[A-Z0-9]{6}$/;

export function normalizeNaitrustId(value: string): string {
  return value.trim().toUpperCase();
}

export function isNaitrustId(value: string): boolean {
  return NAITRUST_ID_PATTERN.test(normalizeNaitrustId(value));
}

export function naitrustIdKindForRole(role: string): NaitrustIdKind {
  return role === 'business' || role === 'business-member' ? 'business' : 'personal';
}

export function generateNaitrustId(
  kind: NaitrustIdKind,
  existingIds: Iterable<string> = [],
): string {
  const prefix = kind === 'business' ? 'NT-BIZ' : 'NT-PA';
  const reserved = new Set(Array.from(existingIds, normalizeNaitrustId));

  for (let attempt = 0; attempt < 100; attempt += 1) {
    const random = new Uint32Array(1);
    crypto.getRandomValues(random);
    const suffix = String(random[0] % 1_000_000).padStart(6, '0');
    const candidate = `${prefix}-${suffix}`;
    if (!reserved.has(candidate)) return candidate;
  }

  throw new Error('Could not generate a unique Naitrust ID.');
}
