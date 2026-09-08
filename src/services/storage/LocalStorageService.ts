import { IStorageService } from './IStorageService';

export class LocalStorageService implements IStorageService {
  getItem<T>(key: string, defaultValue: T): T {
    try {
      const saved = localStorage.getItem(key);
      if (!saved) return defaultValue;
      return JSON.parse(saved) as T;
    } catch (e) {
      console.error(`[LocalStorageService] Failed to load key: ${key}`, e);
      return defaultValue;
    }
  }

  setItem<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.error(`[LocalStorageService] Failed to save key: ${key}`, e);
    }
  }

  removeItem(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch (e) {
      console.error(`[LocalStorageService] Failed to remove key: ${key}`, e);
    }
  }

  clear(): void {
    try {
      localStorage.clear();
    } catch (e) {
      console.error('[LocalStorageService] Failed to clear storage', e);
    }
  }
}

export const storageService = new LocalStorageService();
