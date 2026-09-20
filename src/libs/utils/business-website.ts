/** Only ordinary web addresses can become the dashboard's external link. */
export function businessWebsiteUrl(value?: string): string | null {
  if (!value?.trim()) return null;
  const input = value.trim();
  if (/^[a-z][a-z\d+.-]*:/i.test(input) && !/^https?:\/\//i.test(input)) return null;
  try {
    const url = new URL(/^https?:\/\//i.test(input) ? input : `https://${input}`);
    if (!['http:', 'https:'].includes(url.protocol) || !url.hostname.includes('.') || url.username || url.password) return null;
    return url.href;
  } catch { return null; }
}
