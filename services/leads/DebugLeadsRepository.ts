import { getDebugFlags } from '@/services/debugFlags';

import type { Lead } from '@/models/Lead';

import type { LeadsRepository } from './LeadsRepository';

export class DebugLeadsRepository implements LeadsRepository {
  constructor(private inner: LeadsRepository) {}

  private maybeThrow() {
    const f = getDebugFlags();

    if (f.simulateOffline) {
      throw new Error('Ei verkkoyhteyttä (simuloitu)');
    }

    if (f.simulateError) {
      throw new Error('Simuloitu virhe (DEBUG)');
    }
  }

  async listLeads(): Promise<Lead[]> {
    this.maybeThrow();
    return this.inner.listLeads();
  }

  async listHiddenLeads(): Promise<Lead[]> {
    this.maybeThrow();
    return this.inner.listHiddenLeads();
  }

  async getLeadById(id: string): Promise<Lead | null> {
    this.maybeThrow();
    return this.inner.getLeadById(id);
  }

  async updateLeadStatus(leadId: string, status: 'new' | 'quoted' | 'accepted' | 'rejected'): Promise<void> {
    this.maybeThrow();
    return this.inner.updateLeadStatus(leadId, status);
  }

  async hideLead(leadId: string): Promise<void> {
    this.maybeThrow();
    return this.inner.hideLead(leadId);
  }

  async unhideLead(leadId: string): Promise<void> {
    this.maybeThrow();
    return this.inner.unhideLead(leadId);
  }

  async deleteLead(leadId: string): Promise<void> {
    this.maybeThrow();
    return this.inner.deleteLead(leadId);
  }
}
