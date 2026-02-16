import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Storage wrapper for AsyncStorage
 * Tarjoaa tyypitetyt helperit JSON-datan tallentamiseen ja hakemiseen
 */

export class StorageService {
  /**
   * Tallenna data AsyncStorageen
   * @param key - Tallennusavain
   * @param value - Tallennettava data (JSON-serialisoitavissa oleva)
   */
  static async set<T>(key: string, value: T): Promise<void> {
    try {
      const jsonValue = JSON.stringify(value);
      await AsyncStorage.setItem(key, jsonValue);
    } catch (error) {
      console.error(`Error saving data for key "${key}":`, error);
      throw error;
    }
  }

  /**
   * Hae data AsyncStoragesta
   * @param key - Haettava avain
   * @returns Palautaa datan tai null jos ei löydy
   */
  static async get<T>(key: string): Promise<T | null> {
    try {
      const jsonValue = await AsyncStorage.getItem(key);
      return jsonValue != null ? JSON.parse(jsonValue) : null;
    } catch (error) {
      console.error(`Error reading data for key "${key}":`, error);
      return null;
    }
  }

  /**
   * Poista data AsyncStoragesta
   * @param key - Poistettava avain
   */
  static async remove(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error(`Error removing data for key "${key}":`, error);
      throw error;
    }
  }

  /**
   * Tyhjennä koko AsyncStorage (käytä varoen!)
   */
  static async clear(): Promise<void> {
    try {
      await AsyncStorage.clear();
    } catch (error) {
      console.error('Error clearing storage:', error);
      throw error;
    }
  }

  /**
   * Hae kaikki avaimet
   */
  static async getAllKeys(): Promise<readonly string[]> {
    try {
      return await AsyncStorage.getAllKeys();
    } catch (error) {
      console.error('Error getting all keys:', error);
      return [];
    }
  }
}

// Storage avaimet (keskitetty hallinta)
export const STORAGE_KEYS = {
  LEADS_LIST: 'leads:list',
  LEADS_LAST_SYNCED: 'leads:lastSynced',
  LEAD_DETAIL: (id: string) => `lead:${id}`,
  QUOTE_DRAFT: (leadId: string) => `quoteDraft:${leadId}`,
} as const;