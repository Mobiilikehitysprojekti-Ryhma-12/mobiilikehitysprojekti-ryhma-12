/**
 * ApiLeadsRepository
 *
 * API-toteutus repositorylle.
 *
 * Huom: teidän `services/apiClient.ts` oli alun perin stub.
 * Tämä luokka on tarkoituksella "ohut adapteri":
 * - Kun endpointit ja response-muoto varmistuu, muutokset tehdään vain tänne.
 * - UI (Inbox/Detail) ei muutu.
 */

import type { Lead } from '@/models/Lead';
import { getJson } from '@/services/apiClient';

import type { LeadsRepository } from './LeadsRepository';

export class ApiLeadsRepository implements LeadsRepository {
  /** Oletus: GET /leads -> Lead[] */
  async listLeads(): Promise<Lead[]> {
    return await getJson<Lead[]>('/leads');
  }

  /**
   * Oletus: GET /leads/:id -> Lead
   *
   * Huom: Repository-rajapinta sallii `null` ("ei löytynyt").
   * Tässä sprintissä `getJson` heittää virheen kaikista non-2xx vastauksista,
   * joten "404 -> null" -mapitus voidaan lisätä myöhemmin kun API-spec varmistuu.
   */
  async getLeadById(id: string): Promise<Lead | null> {
    // Miksi encodeURIComponent: jos id sisältää erikoismerkkejä, URL pysyy validina.
    return await getJson<Lead>(`/leads/${encodeURIComponent(id)}`);
  }

  /**
   * Päivittää liidin statuksen.
   * TODO: Implementoi kun PATCH /leads/:id/status endpointti valmis
   */
  async updateLeadStatus(leadId: string, status: 'new' | 'quoted' | 'accepted' | 'rejected'): Promise<void> {
    // Placeholder for API integration
    // await patchJson(`/leads/${encodeURIComponent(leadId)}/status`, { status });
    throw new Error('ApiLeadsRepository.updateLeadStatus: ei vielä implementoitu');
  }
}
