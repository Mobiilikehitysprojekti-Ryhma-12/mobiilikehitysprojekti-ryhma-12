/**
 * services/config
 *
 * Keskitetty konfigi env-arvoille (EXPO_PUBLIC_*).
 *
 * Miksi tämä tiedosto:
 * - UI ei lue suoraan process.env:stä, jotta env-luku ei leviä ympäri sovellusta.
 * - Fallback-arvot tekevät demosta "pomminvarman": ruutu ei kaadu vaikka env puuttuisi.
 *
 * Käyttö:
 * - Share/QR-ruutu lukee tästä asiakaslinkin sekä yrityksen yhteystiedot.
 */

const FALLBACK_CUSTOMER_URL = 'https://mobiilikehitysprojekti-ryhma-12-quoteflow.onrender.com/';

/**
 * Normalisoi URL: palautetaan aina stringi, ja varmistetaan että se on vähintään fallback.
 *
 * Huom: emme tee mitään "älykästä" URL-parsintaa tässä, jotta toteutus pysyy selkeänä.
 */
function getEnvOrFallback(value: string | undefined, fallback: string): string {
  const trimmed = value?.trim();
  return trimmed ? trimmed : fallback;
}

/** Asiakkaalle jaettava linkki (web). */
export const customerUrl = getEnvOrFallback(process.env.EXPO_PUBLIC_CUSTOMER_URL, FALLBACK_CUSTOMER_URL);

/** Yrityksen nimi (näkyy jaettavassa viestissä ja ruudulla). */
export const businessName = getEnvOrFallback(process.env.EXPO_PUBLIC_BUSINESS_NAME, 'Ei asetettu');

/** Yrityksen puhelin (näkyy jaettavassa viestissä ja ruudulla). */
export const businessPhone = getEnvOrFallback(process.env.EXPO_PUBLIC_BUSINESS_PHONE, 'Ei asetettu');

/** Yrityksen sähköposti (näkyy jaettavassa viestissä ja ruudulla). */
export const businessEmail = getEnvOrFallback(process.env.EXPO_PUBLIC_BUSINESS_EMAIL, 'Ei asetettu');
