import { Lead } from '@/models/Lead';
import { StorageService, STORAGE_KEYS } from '@/services/storage';

/**
 * Cache service for leads data
 * Tallentaa ja lataa lead-dataa paikallisesti
 */
export class LeadsCacheService {
  /**
   * Tallenna leads-lista cacheen
   */
  static async cacheLeadsList(leads: Lead[]): Promise<void> {
    await StorageService.set(STORAGE_KEYS.LEADS_LIST, leads);
    await StorageService.set(STORAGE_KEYS.LEADS_LAST_SYNCED, new Date().toISOString());
  }

  /**
   * Hae leads-lista cachesta
   */
  static async getCachedLeadsList(): Promise<Lead[] | null> {
    return await StorageService.get<Lead[]>(STORAGE_KEYS.LEADS_LIST);
  }

  /**
   * Hae viimeisin synkronointiaika
   */
  static async getLastSynced(): Promise<string | null> {
    return await StorageService.get<string>(STORAGE_KEYS.LEADS_LAST_SYNCED);
  }

  /**
   * Tallenna yksittäinen lead detail cacheen
   */
  static async cacheLeadDetail(lead: Lead): Promise<void> {
    await StorageService.set(STORAGE_KEYS.LEAD_DETAIL(lead.id), lead);
  }

  /**
   * Hae yksittäinen lead detail cachesta
   */
  static async getCachedLeadDetail(id: string): Promise<Lead | null> {
    return await StorageService.get<Lead>(STORAGE_KEYS.LEAD_DETAIL(id));
  }

  /**
   * Tyhjennä koko leads cache
   */
  static async clearCache(): Promise<void> {
    await StorageService.remove(STORAGE_KEYS.LEADS_LIST);
    await StorageService.remove(STORAGE_KEYS.LEADS_LAST_SYNCED);
    // Note: Ei poisteta yksittäisiä lead detaileja automaattisesti
  }
}