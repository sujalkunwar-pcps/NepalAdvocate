import AsyncStorage from '@react-native-async-storage/async-storage';

// Safe in-memory storage fallback when native storage module is null or throws
const memoryStore = new Map<string, string>();

function getFallback(key: string): string | null {
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      return window.localStorage.getItem(key);
    } catch {}
  }
  return memoryStore.get(key) ?? null;
}

function setFallback(key: string, value: string): void {
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      window.localStorage.setItem(key, value);
    } catch {}
  }
  memoryStore.set(key, value);
}

function removeFallback(key: string): void {
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      window.localStorage.removeItem(key);
    } catch {}
  }
  memoryStore.delete(key);
}

function clearFallback(): void {
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      window.localStorage.clear();
    } catch {}
  }
  memoryStore.clear();
}

/**
 * Fault-tolerant storage wrapper around AsyncStorage with automatic fallback.
 * Prevents native module crashes while ensuring persistent storage is always attempted.
 */
export const safeStorage = {
  async getItem(key: string): Promise<string | null> {
    try {
      const val = await AsyncStorage.getItem(key);
      if (val !== null && val !== undefined) {
        setFallback(key, val);
        return val;
      }
    } catch {
      // Fallback
    }
    return getFallback(key);
  },

  async setItem(key: string, value: string): Promise<void> {
    setFallback(key, value);
    try {
      await AsyncStorage.setItem(key, value);
    } catch {
      // Saved in memory / localStorage fallback
    }
  },

  async removeItem(key: string): Promise<void> {
    removeFallback(key);
    try {
      await AsyncStorage.removeItem(key);
    } catch {
      // ignore
    }
  },

  async clear(): Promise<void> {
    clearFallback();
    try {
      await AsyncStorage.clear();
    } catch {
      // ignore
    }
  },

  async getAllKeys(): Promise<readonly string[]> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      if (keys && keys.length > 0) return keys;
    } catch {
      // ignore
    }
    return Array.from(memoryStore.keys());
  },
};

export default safeStorage;
