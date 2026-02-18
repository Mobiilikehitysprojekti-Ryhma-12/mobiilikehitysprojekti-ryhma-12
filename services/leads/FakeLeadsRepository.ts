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
    customerEmail: 'matti.esimerkki@example.com',
    customerPhone: '+358401234567',
    description: 'Perussiivous, omat aineet ok.',
    isHidden: false,
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
    customerEmail: 'laura.esimerkki@example.com',
    customerPhone: '+358501112233',
    description: 'Seinähylly, ruuvit löytyy.',
    isHidden: false,
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
    customerEmail: 'sari.esimerkki@example.com',
    customerPhone: '+358441234000',
    description: 'Vanha pistorasia löystynyt, uusi tilalle.',
    isHidden: false,
  },
];

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export class FakeLeadsRepository implements LeadsRepository {
  async listLeads(): Promise<Lead[]> {
    // Pieni viive, jotta skeleton näkyy demossa.
    await delay(350);
    return demoLeads.filter((l) => !l.isHidden);
  }

  async listHiddenLeads(): Promise<Lead[]> {
    await delay(250);
    return demoLeads.filter((l) => Boolean(l.isHidden));
  }

  async getLeadById(id: string): Promise<Lead | null> {
    await delay(250);
    const found = demoLeads.find((x) => x.id === id) ?? null;
    return found && !found.isHidden ? found : null;
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

  async hideLead(leadId: string): Promise<void> {
    await delay(200);
    const lead = demoLeads.find((x) => x.id === leadId);
    if (lead) {
      lead.isHidden = true;
    }
  }

  async unhideLead(leadId: string): Promise<void> {
    await delay(200);
    const lead = demoLeads.find((x) => x.id === leadId);
    if (lead) {
      lead.isHidden = false;
    }
  }

  async deleteLead(leadId: string): Promise<void> {
    await delay(200);
    demoLeads = demoLeads.filter((x) => x.id !== leadId);
  }
}
