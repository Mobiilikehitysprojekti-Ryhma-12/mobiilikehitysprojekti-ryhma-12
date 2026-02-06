/**
 * Domain-tyyppi: Quote ("tarjous").
 *
 * Miksi tämä on tärkeä:
 * - UI ja data-kerros jakaa saman "kielen" (tyypit), jolloin virheitä tulee vähemmän.
 * - Tarjouksella on selkeä rakenne: liidin ID, kuvaus hinnasta ja ehdoista.
 */

export type Quote = {
  /** Liittyvän liidin ID */
  leadId: string;

  /** Tarjouksen kuvaus (esim. "2 päivää työtä + materiaalit") */
  description: string;

  /** Kokonais hinta (valinnainen, voi olla "pyynnöllä hintaa") */
  price?: number;

  /** Valuutta (default: EUR) */
  currency?: string;

  /** Tarjouksen voimassaoloaika päivinä (valinnainen) */
  quoteValidityDays?: number;

  /** Arvioitu työn aloituspäivä (valinnainen, ISO-muoto: YYYY-MM-DD) */
  estimatedStartDate?: string;

  /** Lisäehdot/huomautukset */
  notes?: string;
};

/**
 * Uuden tarjouksen luomisen lomakkeen tila.
 *
 * Käytetään Quote Builder -näkymässä asiakkaan syötteen keräämiseen
 * ennen tarjouksen lähettämistä.
 */
export type QuoteFormData = {
  leadId: string;
  description: string;
  price: string;
  currency: string;
  quoteValidityDays: string;
  estimatedStartDate: string;
  notes: string;
};
