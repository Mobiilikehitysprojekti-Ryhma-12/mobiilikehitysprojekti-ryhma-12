/**
 * ApiQuotesRepository
 *
 * Oikean backendin rajapinta tarjouksille.
 *
 * Tulevaisuus-toteutus (kun API valmis):
 * - POST /quotes - Luo uuden tarjouksen
 * - GET /quotes/:id - Hae tarjous
 * - PATCH /leads/:id/status - Päivitä liidin status
 *
 * Käyttö: Vaihda RepoProvider:issa USE_FAKE_REPO = false
 */

import type { LeadStatus } from '@/models/Lead';
import type { Quote, QuoteFormData } from '@/models/Quote';
import type { QuotesRepository } from './QuotesRepository';

export class ApiQuotesRepository implements QuotesRepository {
  async createQuote(formData: QuoteFormData): Promise<Quote> {
    // TODO: Implementoi kun API valmis
    // POST /quotes
    throw new Error('ApiQuotesRepository.createQuote: ei vielä implementoitu');
  }

  async getQuoteByLeadId(leadId: string): Promise<Quote | null> {
    // TODO: Implementoi kun API valmis
    // GET /quotes?leadId=...
    throw new Error('ApiQuotesRepository.getQuoteByLeadId: ei vielä implementoitu');
  }

  async updateLeadStatus(leadId: string, status: LeadStatus): Promise<void> {
    // TODO: Implementoi kun API valmis
    // PATCH /leads/:id/status
    throw new Error('ApiQuotesRepository.updateLeadStatus: ei vielä implementoitu');
  }
}
