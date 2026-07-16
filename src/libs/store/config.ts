/**
 * Store Configuration
 * API-only mode - Demo mode removed
 */

export type DataMode = 'api';

interface StoreConfig {
  dataMode: DataMode;
}

const DEFAULT_CONFIG: StoreConfig = {
  dataMode: 'api', // Always use API
};

class StoreConfigManager {
  private config: StoreConfig = DEFAULT_CONFIG;

  getDataMode(): DataMode {
    return this.config.dataMode;
  }

  isApiMode(): boolean {
    return true; // Always API mode
  }

  isDemoMode(): boolean {
    return false; // Never demo mode
  }
}

// Singleton instance
export const storeConfig = new StoreConfigManager();

// Helper function for logging
export function logDataMode(feature: string, usingDemo: boolean = false): void {
  const mode = '🔷 API';
  console.log(`${mode} [${feature}]`);
}
