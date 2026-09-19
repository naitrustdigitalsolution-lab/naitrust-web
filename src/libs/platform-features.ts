import { useSyncExternalStore } from 'react';

export interface PlatformFeatures {
  chinaWholesaleFocus: boolean;
  marketplace: boolean;
  sourcingAgents: boolean;
  productFinder: boolean;
  logistics: boolean;
  rewards: boolean;
  bills: boolean;
  sellerShowcase: boolean;
}

const STORAGE_KEY = 'naitrust:admin:platform-features:v3-protected-payments';
export const PLATFORM_FEATURES_CHANGED = 'naitrust:platform-features-changed';

export const defaultPlatformFeatures: PlatformFeatures = {
  chinaWholesaleFocus: false,
  marketplace: false,
  sourcingAgents: false,
  productFinder: false,
  logistics: false,
  rewards: true,
  bills: true,
  sellerShowcase: false,
};

export const chinaWholesalePreset: PlatformFeatures = { ...defaultPlatformFeatures };

export function getPlatformFeatures(): PlatformFeatures {
  if (typeof window === 'undefined') return defaultPlatformFeatures;
  try {
    return { ...defaultPlatformFeatures, ...JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}'), productFinder: false };
  } catch {
    return defaultPlatformFeatures;
  }
}

export function setPlatformFeatures(features: PlatformFeatures): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(features));
  window.dispatchEvent(new CustomEvent(PLATFORM_FEATURES_CHANGED));
}

export function updatePlatformFeature<K extends keyof PlatformFeatures>(key: K, value: PlatformFeatures[K]): PlatformFeatures {
  const updated = { ...getPlatformFeatures(), [key]: value };
  setPlatformFeatures(updated);
  return updated;
}

function subscribe(callback: () => void): () => void {
  window.addEventListener(PLATFORM_FEATURES_CHANGED, callback);
  window.addEventListener('storage', callback);
  return () => {
    window.removeEventListener(PLATFORM_FEATURES_CHANGED, callback);
    window.removeEventListener('storage', callback);
  };
}

let cachedRaw = '';
let cachedFeatures = defaultPlatformFeatures;
function snapshot(): PlatformFeatures {
  const raw = typeof window === 'undefined' ? '' : localStorage.getItem(STORAGE_KEY) ?? '';
  if (raw !== cachedRaw) {
    cachedRaw = raw;
    cachedFeatures = getPlatformFeatures();
  }
  return cachedFeatures;
}

export function usePlatformFeatures(): PlatformFeatures {
  return useSyncExternalStore(subscribe, snapshot, () => defaultPlatformFeatures);
}
