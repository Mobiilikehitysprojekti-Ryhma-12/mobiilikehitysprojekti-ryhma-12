/**
 * FakeLeadsRepository
 *
 * Demo-/kehitystoteutus repositorylle.
 * - Mahdollistaa UI:n tekemisen ilman backendia.
 * - Sisältää pienen viiveen, jotta loading-skeleton on helppo demonstroida.
 * - Tallentaa muutokset muistiin (ei persistenssi).
 */

import type { Lead } from '@/models/Lead';

import type { LeadsRepository } from './LeadsRepository';

let demoLeads: Lead[] = [
  {
    id: '1',
    title: 'Kylpyhuoneen siivous',
    status: 'new',
    service: 'Siivous',
    address: 'Keskusta, Oulu',
    createdAt: '2026-01-28',
    customerName: 'Matti',
    description: 'Perussiivous, omat aineet ok.',
  },
  {
    id: '2',
    title: 'Hyllyn asennus',
    status: 'quoted',
    service: 'Asennus',
    address: 'Vantaa',
    createdAt: '2026-01-27',
    customerName: 'Laura',
    description: 'Seinähylly, ruuvit löytyy.',
  },
  {
    id: '3',
    title: 'Sähkörasian vaihto',
    status: 'accepted',
    service: 'Sähkötyö',
    address: 'Tampere',
    createdAt: '2026-01-25',
    customerName: 'Sari',
    description: 'Vanha pistorasia löystynyt, uusi tilalle.',
  },
];

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export class FakeLeadsRepository implements LeadsRepository {
  async listLeads(): Promise<Lead[]> {
    // Pieni viive, jotta skeleton näkyy demossa.
    await delay(350);
    return demoLeads;
  }

  async getLeadById(id: string): Promise<Lead | null> {
    await delay(250);
    return demoLeads.find((x) => x.id === id) ?? null;
  }

  /**
   * Päivittää liidin statuksen muistiin.
   * Demo-tarkoitukseen: muistiin tallennettu data päivittyy.
   */
  async updateLeadStatus(leadId: string, status: 'new' | 'quoted' | 'accepted' | 'rejected'): Promise<void> {
    await delay(200);
    const lead = demoLeads.find((x) => x.id === leadId);
    if (lead) {
      lead.status = status;
    }
  }
}
