/**
 * QuotesRepository -rajapinta
 *
 * Määrittää, mitä operaatioita Quote-datalle voidaan tehdä.
 * Implementointi voi olla Fake (demo) tai Api (oikea backend).
 *
 * Miksi rajapinta:
 * - UI ei riipu suoraan API:sta tai Demo-toteutuksesta
 * - Voidaan vaihtaa ilman UI-muutoksia
 */

import type { Quote, QuoteFormData } from '@/models/Quote';
import type { LeadStatus } from '@/models/Lead';

export interface QuotesRepository {
  /**
   * Luo uuden tarjouksen ja päivittää liidin statuksen.
   *
   * @param formData - Lomakkeen data
   * @returns Luotu tarjous
   */
  createQuote(formData: QuoteFormData): Promise<Quote>;

  /**
   * Hakee tarjouksen liidin ID:n perusteella.
   *
   * @param leadId - Liidin ID
   * @returns Tarjous tai null jos ei löydy
   */
  getQuoteByLeadId(leadId: string): Promise<Quote | null>;

  /**
   * Päivittää liidin statuksen.
   * Kutsutaan tarjouksen luomisen yhteydessä.
   *
   * @param leadId - Liidin ID
   * @param status - Uusi status
   */
  updateLeadStatus(leadId: string, status: LeadStatus): Promise<void>;
}
