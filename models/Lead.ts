/**
 * Domain-tyyppi: Lead ("liidi").
 *
 * Miksi tämä on tärkeä:
 * - UI ja data-kerros jakaa saman "kielen" (tyypit), jolloin virheitä tulee vähemmän.
 * - Kun myöhemmin vaihdetaan datalähde (Fake -> API), UI ei muutu jos tyypit pysyy.
 */

/**
 * Liidin status.
 *
 * Huom: käytetään union-tyyppiä, jotta status-arvot pysyy rajattuna ja tyypitettynä.
 */
export type LeadStatus = 'new' | 'quoted' | 'accepted' | 'rejected';

export type Lead = {
  id: string;
  title: string;

  /** Vapaa kuvaus/taustatieto (valinnainen). */
  description?: string;

  /** Prosessin tila. */
  status: LeadStatus;

  /** Palveluluokka / työn tyyppi (valinnainen). */
  service?: string;

  /** Osoite tai alue (valinnainen). */
  address?: string;

  /** Sijainnin leveys (latitude). Käytetään kartanäkymään. */
  lat?: number;

  /** Sijainnin pituus (longitude). Käytetään kartanäkymään. */
  lng?: number;

  /** ISO-muotoinen pvm/aikaleima (demo: "2026-01-28"). */
  createdAt: string;

  /** Asiakkaan nimi (valinnainen). */
  customerName?: string | null;

  /** Asiakkaan sähköposti (valinnainen). */
  customerEmail?: string | null;

  /** Asiakkaan puhelin (valinnainen). */
  customerPhone?: string | null;

  /** Omistava business/user id (RLS: business_id = auth.uid()). */
  businessId?: string;

  /**
   * Onko liidi piilotettu (soft delete).
   *
   * Miksi tämä kenttä:
   * - Käyttäjä voi siivota Inboxia poistamatta dataa lopullisesti.
   * - Piilotetut liidit suodatetaan pois listauksista repository-tasolla.
   */
  isHidden?: boolean;
};

/**
 * UI-helper: muuntaa statuskoodin käyttäjäystävälliseksi tekstiksi.
 *
 * Miksi helper erikseen:
 * - Sama muunnos tarvitaan useassa näkymässä (Inbox list item, detail jne.)
 * - Yksi lähde totuudelle -> vähemmän kopiointia ja ristiriitoja.
 */
export function leadStatusLabel(status: LeadStatus): string {
  switch (status) {
    case 'new':
      return 'Uusi';
    case 'quoted':
      return 'Tarjottu';
    case 'accepted':
      return 'Hyväksytty';
    case 'rejected':
      return 'Hylätty';
  }
}