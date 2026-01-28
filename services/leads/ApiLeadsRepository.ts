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

  /** Oletus: GET /leads/:id -> Lead */
  async getLeadById(id: string): Promise<Lead | null> {
    // Miksi encodeURIComponent: jos id sisältää erikoismerkkejä, URL pysyy validina.
    return await getJson<Lead>(`/leads/${encodeURIComponent(id)}`);
  }
}
