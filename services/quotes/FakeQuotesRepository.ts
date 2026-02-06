/**
 * FakeQuotesRepository
 *
 * Demo-/kehitystoteutus tarjouksille.
 * - Tallentaa tarjoukset muistiin (ei persistenssi)
 * - Päivittää liidin statuksen paikallisesti
 * - Simuloi pientä viivettä kuten oikea API
 *
 * Kun oikea API valmis:
 * - Korvaa tämän ApiQuotesRepository:lla
 * - Muutos tehdään vain RepoProvider:issa (USE_FAKE_REPO = false)
 */

import type { LeadStatus } from '@/models/Lead';
import type { Quote, QuoteFormData } from '@/models/Quote';
import type { LeadsRepository } from '@/services/leads/LeadsRepository';
import type { QuotesRepository } from './QuotesRepository';

// In-memory storage: quote ID -> Quote
const quotesStore = new Map<string, Quote>();

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Generoi uniikki ID tarjoukselle.
 * Demo-tarkoitukseen riittävä yksinkertainen toteutus.
 */
function generateQuoteId(): string {
  return `quote-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export class FakeQuotesRepository implements QuotesRepository {
  /**
   * FakeQuotesRepository tarvitsee LeadsRepositoryn päivittääkseen liidin statuksen.
   * Injektoidaan konstruktorissa (ei React hookeja class-metodeissa).
   */
  constructor(private leadsRepo: LeadsRepository) {}
  async createQuote(formData: QuoteFormData): Promise<Quote> {
    // Simuloi pientä viivettä (kuten oikea API)
    await delay(400);

    // Muunna QuoteFormData -> Quote
    const quote: Quote = {
      id: generateQuoteId(),
      leadId: formData.leadId,
      description: formData.description,
      price: formData.price ? Number(formData.price) : undefined,
      currency: formData.currency,
      quoteValidityDays: formData.quoteValidityDays ? Number(formData.quoteValidityDays) : undefined,
      estimatedStartDate: formData.estimatedStartDate || undefined,
      notes: formData.notes || undefined,
      createdAt: new Date().toISOString(),
    };

    // Tallenna muistiin
    quotesStore.set(quote.id, quote);

    // Päivitä liidin status 'quoted':ksi
    // Huom: Tämä on demo-toiminta. Oikeassa API:ssa backend hoitaisi tämän.
    try {
      await this.leadsRepo.updateLeadStatus(formData.leadId, 'quoted');
    } catch (error) {
      console.error('FakeQuotesRepository: liidin statuksen päivitys epäonnistui', error);
      // Älä heittää virhettä, vaan jatka - quote luotiin silti
    }

    return quote;
  }

  async getQuoteByLeadId(leadId: string): Promise<Quote | null> {
    await delay(200);
    // Etsi tarjous, joka vastaa leadId:tä
    for (const quote of quotesStore.values()) {
      if (quote.leadId === leadId) {
        return quote;
      }
    }
    return null;
  }

  async updateLeadStatus(leadId: string, status: LeadStatus): Promise<void> {
    await delay(200);
    try {
      await this.leadsRepo.updateLeadStatus(leadId, status);
    } catch (error) {
      console.error('FakeQuotesRepository: liidin statuksen päivitys epäonnistui', error);
    }
  }
}
