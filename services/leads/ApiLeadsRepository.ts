/**
 * ApiLeadsRepository
 *
 * API-toteutus repositorylle + cache-first strategy + NetInfo.
 *
 * Cache-first strategia:
 * 1. Tarkista verkkotila (NetInfo)
 * 2. Lataa cache ensin → näytä heti
 * 3. Jos online: Hae API:sta taustalla → päivitä cache
 * 4. Jos offline: Käytä vain cachea
 * 5. Virhetilanteessa → käytä cachea
 */

import type { Lead } from '@/models/Lead';
import { getJson } from '@/services/apiClient';
import { LeadsCacheService } from './cacheService';
import { NetworkService } from '@/services/networkService';

import type { LeadsRepository } from './LeadsRepository';

export class ApiLeadsRepository implements LeadsRepository {
  /**
   * Hae leads-lista (cache-first + NetInfo)
   * 
   * Strategia:
   * - Tarkista verkkotila ensin
   * - Jos cache löytyy → palauta se heti
   * - Jos online → päivitä taustalla
   * - Jos offline → käytä vain cachea
   * - Jos ei cachea ja offline → virhe
   */
  async listLeads(): Promise<Lead[]> {
    try {
      // 1. Tarkista onko online
      const isOnline = await NetworkService.isOnline();
      
      // 2. Yritä ladata cachesta ensin
      const cachedLeads = await LeadsCacheService.getCachedLeadsList();
      
      if (cachedLeads) {
        console.log('📦 Returning cached leads');
        
        // Jos online, päivitä taustalla
        if (isOnline) {
          console.log('🌐 Online - refreshing in background...');
          this.refreshLeadsInBackground();
        } else {
          console.log('📶 Offline - using cache only');
        }
        
        return cachedLeads;
      }

      // 3. Ei cachea - tarkista että ollaan online ennen API-kutsua
      if (!isOnline) {
        console.log('📶 Offline and no cache - cannot fetch leads');
        throw new Error('Ei internet-yhteyttä eikä välimuistidataa saatavilla');
      }

      // 4. Hae API:sta
      console.log('🌐 No cache, fetching from API...');
      const leads = await getJson<Lead[]>('/leads');
      
      // 5. Tallenna cacheen
      await LeadsCacheService.cacheLeadsList(leads);
      console.log('✅ Leads cached successfully');
      
      return leads;
    } catch (error) {
      // 6. API-virhe → yritä palauttaa cache
      console.error('❌ Error fetching leads:', error);
      
      const cachedLeads = await LeadsCacheService.getCachedLeadsList();
      if (cachedLeads) {
        console.log('📦 Returning cached leads due to error');
        return cachedLeads;
      }
      
      // Ei cachea eikä API toimi → heitä virhe
      throw error;
    }
  }

  /**
   * Päivitä leads taustalla (ei estä UI:ta)
   * Käyttää NetInfo:a välttääkseen turhat API-kutsut offline-tilassa
   */
  private async refreshLeadsInBackground(): Promise<void> {
    try {
      // Tarkista vielä kerran että ollaan online
      const isOnline = await NetworkService.isOnline();
      if (!isOnline) {
        console.log('📶 Skipping background refresh - offline');
        return;
      }

      const leads = await getJson<Lead[]>('/leads');
      await LeadsCacheService.cacheLeadsList(leads);
      console.log('🔄 Background refresh completed');
    } catch (error) {
      // Hiljainen virhe - ei haittaa jos taustapäivitys epäonnistuu
      console.warn('⚠️ Background refresh failed (non-critical):', error);
    }
  }

  /**
   * Hae yksittäinen lead (cache-first + NetInfo)
   * 
   * Strategia:
   * - Tarkista verkkotila
   * - Jos cachessa → palauta se
   * - Jos ei cachea ja online → hae API:sta + tallenna
   * - Jos ei cachea ja offline → virhe
   */
  async getLeadById(id: string): Promise<Lead | null> {
    try {
      // 1. Yritä cachesta ensin
      const cached = await LeadsCacheService.getCachedLeadDetail(id);
      if (cached) {
        console.log(`📦 Returning cached lead ${id}`);
        return cached;
      }

      // 2. Ei cachea - tarkista että ollaan online
      const isOnline = await NetworkService.isOnline();
      if (!isOnline) {
        console.log(`📶 Offline and no cache for lead ${id}`);
        throw new Error(`Ei internet-yhteyttä eikä välimuistidataa leadille ${id}`);
      }

      // 3. Hae API:sta
      console.log(`🌐 Fetching lead ${id} from API...`);
      const lead = await getJson<Lead>(`/leads/${encodeURIComponent(id)}`);
      
      // 4. Tallenna cacheen
      await LeadsCacheService.cacheLeadDetail(lead);
      console.log(`✅ Lead ${id} cached successfully`);
      
      return lead;
    } catch (error) {
      // 5. Virhe → yritä cache
      console.error(`❌ Error fetching lead ${id}:`, error);
      
      const cached = await LeadsCacheService.getCachedLeadDetail(id);
      if (cached) {
        console.log(`📦 Returning cached lead ${id} due to error`);
        return cached;
      }
      
      // Ei cachea eikä API toimi
      throw error;
    }
  }
}