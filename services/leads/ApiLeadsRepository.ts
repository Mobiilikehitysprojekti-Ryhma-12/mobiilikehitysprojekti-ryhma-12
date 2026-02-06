/**
 * ApiLeadsRepository
 *
 * API-toteutus repositorylle + cache-first strategy.
 *
 * Cache-first strategia:
 * 1. Lataa cache ensin → näytä heti
 * 2. Hae API:sta taustalla → päivitä cache
 * 3. Virhetilanteessa → käytä cachea
 */

import type { Lead } from '@/models/Lead';
import { getJson } from '@/services/apiClient';
import { LeadsCacheService } from './cacheService';

import type { LeadsRepository } from './LeadsRepository';

export class ApiLeadsRepository implements LeadsRepository {
  /**
   * Hae leads-lista (cache-first)
   * 
   * Strategia:
   * - Jos cache löytyy → palauta se heti + päivitä taustalla
   * - Jos ei cachea → hae API:sta + tallenna cache
   * - Jos API-virhe → yritä palauttaa cache
   */
  async listLeads(): Promise<Lead[]> {
    try {
      // 1. Yritä ladata cachesta ensin
      const cachedLeads = await LeadsCacheService.getCachedLeadsList();
      
      if (cachedLeads) {
        // Cache löytyi! Palauta se heti ja päivitä taustalla
        console.log('📦 Returning cached leads, refreshing in background...');
        this.refreshLeadsInBackground(); // Ei odoteta
        return cachedLeads;
      }

      // 2. Ei cachea → hae API:sta
      console.log('🌐 No cache, fetching from API...');
      const leads = await getJson<Lead[]>('/leads');
      
      // 3. Tallenna cacheen
      await LeadsCacheService.cacheLeadsList(leads);
      console.log('✅ Leads cached successfully');
      
      return leads;
    } catch (error) {
      // 4. API-virhe → yritä palauttaa cache
      console.error('❌ Error fetching leads:', error);
      
      const cachedLeads = await LeadsCacheService.getCachedLeadsList();
      if (cachedLeads) {
        console.log('📦 Returning cached leads due to API error');
        return cachedLeads;
      }
      
      // Ei cachea eikä API toimi → heitä virhe
      throw error;
    }
  }

  /**
   * Päivitä leads taustalla (ei estä UI:ta)
   */
  private async refreshLeadsInBackground(): Promise<void> {
    try {
      const leads = await getJson<Lead[]>('/leads');
      await LeadsCacheService.cacheLeadsList(leads);
      console.log('🔄 Background refresh completed');
    } catch (error) {
      // Hiljainen virhe - ei haittaa jos taustapäivitys epäonnistuu
      console.warn('⚠️ Background refresh failed (non-critical):', error);
    }
  }

  /**
   * Hae yksittäinen lead (cache-first)
   * 
   * Strategia:
   * - Jos cachessa → palauta se
   * - Jos ei → hae API:sta + tallenna
   * - Jos virhe → yritä cache
   */
  async getLeadById(id: string): Promise<Lead | null> {
    try {
      // 1. Yritä cachesta ensin
      const cached = await LeadsCacheService.getCachedLeadDetail(id);
      if (cached) {
        console.log(`📦 Returning cached lead ${id}`);
        return cached;
      }

      // 2. Hae API:sta
      console.log(`🌐 Fetching lead ${id} from API...`);
      const lead = await getJson<Lead>(`/leads/${encodeURIComponent(id)}`);
      
      // 3. Tallenna cacheen
      await LeadsCacheService.cacheLeadDetail(lead);
      console.log(`✅ Lead ${id} cached successfully`);
      
      return lead;
    } catch (error) {
      // 4. Virhe → yritä cache
      console.error(`❌ Error fetching lead ${id}:`, error);
      
      const cached = await LeadsCacheService.getCachedLeadDetail(id);
      if (cached) {
        console.log(`📦 Returning cached lead ${id} due to API error`);
        return cached;
      }
      
      // Ei cachea eikä API toimi
      throw error;
    }
  }
}