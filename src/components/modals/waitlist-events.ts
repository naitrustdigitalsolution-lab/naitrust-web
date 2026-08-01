export const WAITLIST_OPEN_EVENT = 'naitrust:open-waitlist';

export function openWaitlistModal() {
  window.dispatchEvent(new CustomEvent(WAITLIST_OPEN_EVENT));
}
