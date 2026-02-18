/**
 * buildQuoteEmailMessage
 *
 * Tarkoitus:
 * - Rakentaa tarjouksen sähköpostipohja (otsikko + viesti), joka avataan käyttäjän oletus-sähköpostiohjelmassa.
 *
 * Miksi tämä on util:
 * - Samaa muotoilua voidaan käyttää eri ruuduissa (esim. Quote Builder, Lead detail).
 * - UI pysyy siistinä: ruutu vain kutsuu utilia ja avaa `mailto:`-linkin.
 *
 * Huom (tärkeä):
 * - Tämä EI lähetä sähköpostia automaattisesti.
 * - `mailto:` avaa luonnoksen käyttäjän sähköpostisovelluksessa, jossa käyttäjä painaa Lähetä.
 */

import type { Quote, QuoteFormData } from '@/models/Quote';

type BuildQuoteEmailMessageParams = {
  /** Asiakkaan nimi (valinnainen) */
  customerName?: string | null;
  /** Liidin otsikko (esim. työn nimi) */
  leadTitle: string;
  /** Yrityksen nimi allekirjoitukseen */
  businessName: string;
  /** Yrityksen puhelin (valinnainen, lisätään allekirjoitukseen jos annettu) */
  businessPhone?: string | null;
  /** Yrityksen sähköposti (valinnainen, lisätään allekirjoitukseen jos annettu) */
  businessEmail?: string | null;
  /** Lomakkeelta tulevat tiedot (kuvaus/hinta/ehdot) */
  formData: QuoteFormData;
  /** Luotu tarjous (valinnainen), jos halutaan lisätä ID/aikaleima */
  createdQuote?: Pick<Quote, 'id' | 'createdAt'> | null;
};

function formatOptionalLine(label: string, value?: string | null) {
  if (!value) return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  return `${label}: ${trimmed}`;
}

function normalizeBusinessValue(value?: string | null): string | null {
  // services/config.ts käyttää demossa fallback-arvoa "Ei asetettu".
  // Emme halua tulostaa sitä asiakkaalle sähköpostiin, joten käsitellään se tyhjänä.
  if (!value) return null;
  const trimmed = value.trim();
  if (!trimmed || trimmed === 'Ei asetettu') return null;
  return trimmed;
}

/**
 * Rakentaa otsikon ja viestin tarjoussähköpostiin.
 */
export function buildQuoteEmailMessage(params: BuildQuoteEmailMessageParams): {
  subject: string;
  body: string;
} {
  const customerName = params.customerName?.trim() || 'asiakas';
  const safeLeadTitle = params.leadTitle?.trim() || 'tarjous';

  const subject = `Tarjous: ${safeLeadTitle}`;

  // Miksi rivit listana:
  // - Koneella/Outlookissa mailto-body toimii parhaiten selkeällä tekstillä.
  // - Asiakas näkee nopeasti tärkeimmät tiedot (hinta, aloitus, voimassaolo).
  const lines: Array<string | null> = [
    `Hei ${customerName},`,
    '',
    `Kiitos yhteydenotosta. Tässä tarjous liidistä "${safeLeadTitle}":`,
    '',
    formatOptionalLine('Kuvaus', params.formData.description),
    formatOptionalLine(
      'Hinta',
      params.formData.price
        ? `${params.formData.price} ${params.formData.currency || 'EUR'}`
        : null
    ),
    formatOptionalLine('Arvioitu aloituspäivä', params.formData.estimatedStartDate),
    formatOptionalLine(
      'Tarjouksen voimassaoloaika',
      params.formData.quoteValidityDays ? `${params.formData.quoteValidityDays} päivää` : null
    ),
    formatOptionalLine('Lisäehdot / huomautukset', params.formData.notes),
    '',
    ...(params.createdQuote?.id
      ? [`Tarjous-ID: ${params.createdQuote.id}`]
      : []),
    '',
    'Ystävällisin terveisin,',
    params.businessName,
    formatOptionalLine('Puhelin', normalizeBusinessValue(params.businessPhone)),
    formatOptionalLine('Sähköposti', normalizeBusinessValue(params.businessEmail)),
  ];

  const body = lines.filter((l): l is string => l !== null).join('\n');
  return { subject, body };
}

/**
 * Rakentaa valmiin `mailto:` URL:n.
 *
 * Miksi erillinen funktio:
 * - URL-enkoodaus pitää tehdä aina oikein (rivinvaihdot, ääkköset).
 */
export function buildMailtoUrl(params: {
  toEmail: string;
  subject: string;
  body: string;
}): string {
  return `mailto:${encodeURIComponent(params.toEmail)}?subject=${encodeURIComponent(
    params.subject
  )}&body=${encodeURIComponent(params.body)}`;
}
