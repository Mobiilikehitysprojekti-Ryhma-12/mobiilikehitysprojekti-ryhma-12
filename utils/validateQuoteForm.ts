/**
 * validateQuoteForm -funktio
 *
 * Tarkoitus:
 * - Validoi tarjouslomakkeen kentät
 * - Palauttaa validointivirheet tai tyhjän objektin
 *
 * Miksi erillinen funktio:
 * - Erottaa validointilogiikan UI-komponenteista
 * - Helpottaa testattavuutta
 * - Voidaan uudelleenkäyttää muissa yhteyksissä
 *
 * Minimipaketti vaatii:
 * - Viesti (kuvaus) asiakkaalle
 * - Hinta (numero)
 * - Arvioitu aloituspäivä
 *
 * Valinnainen:
 * - Tarjouksen voimassaoloaika (jos annettu, täytyy olla numero)
 */

import type { QuoteFormData } from '@/models/Quote';

export function validateQuoteForm(formData: QuoteFormData): Partial<QuoteFormData> {
  const errors: Partial<QuoteFormData> = {};

  if (!formData.description.trim()) {
    errors.description = 'Viesti on pakollinen';
  }

  if (!formData.price.trim()) {
    errors.price = 'Hinta on pakollinen';
  } else if (isNaN(Number(formData.price))) {
    errors.price = 'Hinta täytyy olla numero';
  }

  if (!formData.estimatedStartDate.trim()) {
    errors.estimatedStartDate = 'Aloituspäivä on pakollinen';
  }

  // Validoidaan voimassaoloaika jos se on annettu
  if (formData.quoteValidityDays.trim() && isNaN(Number(formData.quoteValidityDays))) {
    errors.quoteValidityDays = 'Päivät täytyy olla numero';
  }

  return errors;
}
