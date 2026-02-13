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

// Demo-liidien data: sisältää osoite- ja sijaintitiedot kartanäkymää varten.
let demoLeads: Lead[] = [
  {
    id: '1',
    title: 'Kylpyhuoneen siivous',
    status: 'new',
    service: 'Siivous',
    address: 'Saaristonkatu 12, 90100 Oulu',
    lat: 65.01077616940464,
    lng: 25.469646007384362,
    createdAt: '2026-01-28',
    customerName: 'Matti',
    description: 'Perussiivous, omat aineet ok.',
  },
  {
    id: '2',
    title: 'Hyllyn asennus',
    status: 'quoted',
    service: 'Asennus',
    address: 'Unikkotie 12, 01300 Vantaa',
    lat: 60.29259868978628,
    lng: 25.036432506159674,
    createdAt: '2026-01-27',
    customerName: 'Laura',
    description: 'Seinähylly, ruuvit löytyy.',
  },
  {
    id: '3',
    title: 'Sähkörasian vaihto',
    status: 'accepted',
    service: 'Sähkötyö',
    address: 'Hallituskatu 19, 33200 Tampere',
    lat: 61.49614269061879,
    lng: 23.751770176601983,
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
