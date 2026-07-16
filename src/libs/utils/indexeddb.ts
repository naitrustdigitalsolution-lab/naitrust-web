/**
 * IndexedDB Service for Caching Search Results
 * Provides fast local caching with TTL support
 */

interface CacheEntry<T> {
  key: string;
  data: T;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
}

class IndexedDBService {
  private dbName = 'naitrust-cache';
  private version = 1;
  private db: IDBDatabase | null = null;
  private initPromise: Promise<void> | null = null;

  private async init(): Promise<void> {
    if (this.db) return;
    if (this.initPromise) return this.initPromise;

    this.initPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => {
        console.error('❌ [IndexedDB] Failed to open database');
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Create object stores if they don't exist
        if (!db.objectStoreNames.contains('searchCache')) {
          const searchStore = db.createObjectStore('searchCache', { keyPath: 'key' });
          searchStore.createIndex('timestamp', 'timestamp', { unique: false });
        }

        if (!db.objectStoreNames.contains('businessCache')) {
          const businessStore = db.createObjectStore('businessCache', { keyPath: 'key' });
          businessStore.createIndex('timestamp', 'timestamp', { unique: false });
        }
      };
    });

    return this.initPromise;
  }

  /**
   * Generate cache key from search parameters
   */
  private generateKey(query: string, category?: string): string {
    const normalizedQuery = query.trim().toLowerCase();
    return category ? `search:${normalizedQuery}:${category}` : `search:${normalizedQuery}`;
  }

  /**
   * Get cached search results
   */
  async getSearchResults<T>(query: string, category?: string): Promise<T | null> {
    await this.init();
    if (!this.db) return null;

    const key = this.generateKey(query, category);

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['searchCache'], 'readonly');
      const store = transaction.objectStore('searchCache');
      const request = store.get(key);

      request.onsuccess = () => {
        const entry: CacheEntry<T> | undefined = request.result;
        if (!entry) {
          resolve(null);
          return;
        }

        // Check if cache is expired
        const now = Date.now();
        const age = now - entry.timestamp;
        if (age > entry.ttl) {
          // Cache expired, delete it
          this.deleteSearchResults(query, category).catch(console.error);
          resolve(null);
          return;
        }

        resolve(entry.data);
      };

      request.onerror = () => {
        console.error('❌ [IndexedDB] Error reading cache:', request.error);
        resolve(null); // Return null on error, don't block
      };
    });
  }

  /**
   * Cache search results
   */
  async setSearchResults<T>(query: string, data: T, category?: string, ttl: number = 5 * 60 * 1000): Promise<void> {
    await this.init();
    if (!this.db) return;

    const key = this.generateKey(query, category);
    const entry: CacheEntry<T> = {
      key,
      data,
      timestamp: Date.now(),
      ttl,
    };

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['searchCache'], 'readwrite');
      const store = transaction.objectStore('searchCache');
      const request = store.put(entry);

      request.onsuccess = () => resolve();
      request.onerror = () => {
        console.error('❌ [IndexedDB] Error writing cache:', request.error);
        resolve(); // Don't block on cache write errors
      };
    });
  }

  /**
   * Delete cached search results
   */
  async deleteSearchResults(query: string, category?: string): Promise<void> {
    await this.init();
    if (!this.db) return;

    const key = this.generateKey(query, category);

    return new Promise((resolve) => {
      const transaction = this.db!.transaction(['searchCache'], 'readwrite');
      const store = transaction.objectStore('searchCache');
      const request = store.delete(key);

      request.onsuccess = () => resolve();
      request.onerror = () => {
        console.error('❌ [IndexedDB] Error deleting cache:', request.error);
        resolve(); // Don't block on delete errors
      };
    });
  }

  /**
   * Clear all expired cache entries
   */
  async clearExpiredCache(): Promise<void> {
    await this.init();
    if (!this.db) return;

    return new Promise((resolve) => {
      const transaction = this.db!.transaction(['searchCache'], 'readwrite');
      const store = transaction.objectStore('searchCache');
      const index = store.index('timestamp');
      const request = index.openCursor();
      const now = Date.now();
      let deletedCount = 0;

      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result;
        if (!cursor) {
          if (deletedCount > 0) {
            console.log(`🧹 [IndexedDB] Cleared ${deletedCount} expired cache entries`);
          }
          resolve();
          return;
        }

        const entry: CacheEntry<any> = cursor.value;
        const age = now - entry.timestamp;
        if (age > entry.ttl) {
          cursor.delete();
          deletedCount++;
        }
        cursor.continue();
      };

      request.onerror = () => {
        console.error('❌ [IndexedDB] Error clearing expired cache:', request.error);
        resolve();
      };
    });
  }

  /**
   * Clear all search cache
   */
  async clearAllSearchCache(): Promise<void> {
    await this.init();
    if (!this.db) return;

    return new Promise((resolve) => {
      const transaction = this.db!.transaction(['searchCache'], 'readwrite');
      const store = transaction.objectStore('searchCache');
      const request = store.clear();

      request.onsuccess = () => {
        console.log('🧹 [IndexedDB] Cleared all search cache');
        resolve();
      };

      request.onerror = () => {
        console.error('❌ [IndexedDB] Error clearing cache:', request.error);
        resolve();
      };
    });
  }

  /**
   * Get cache statistics
   */
  async getCacheStats(): Promise<{ total: number; expired: number }> {
    await this.init();
    if (!this.db) return { total: 0, expired: 0 };

    return new Promise((resolve) => {
      const transaction = this.db!.transaction(['searchCache'], 'readonly');
      const store = transaction.objectStore('searchCache');
      const request = store.getAll();
      const now = Date.now();

      request.onsuccess = () => {
        const entries: CacheEntry<any>[] = request.result || [];
        const expired = entries.filter(entry => (now - entry.timestamp) > entry.ttl).length;
        resolve({ total: entries.length, expired });
      };

      request.onerror = () => {
        resolve({ total: 0, expired: 0 });
      };
    });
  }
}

// Export singleton instance
export const indexedDBService = new IndexedDBService();

// Clean up expired cache on initialization
if (typeof window !== 'undefined') {
  indexedDBService.clearExpiredCache().catch(console.error);
  
  // Clean up expired cache every 10 minutes
  setInterval(() => {
    indexedDBService.clearExpiredCache().catch(console.error);
  }, 10 * 60 * 1000);
}

