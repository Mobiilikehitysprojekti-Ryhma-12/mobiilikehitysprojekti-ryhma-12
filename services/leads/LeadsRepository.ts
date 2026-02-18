/**
 * LeadsRepository = datan lukemisen "rajapinta".
 *
 * Miksi tämä tehdään:
 * - UI ei saa olla kiinni apiClientistä tai fetchistä (löyhä kytkentä / "Hilt-ajattelu").
 * - Voidaan vaihtaa toteutus (Fake -> API) ilman että ruudut tai komponentit muuttuvat.
 */

import type { Lead, LeadStatus } from '@/models/Lead';

export interface LeadsRepository {
  /**
   * Palauttaa liidit listanäkymää varten.
   *
   * Huom: tässä Sprint 1 -vaiheessa ei vielä määritellä server-side filtteröintiä,
   * koska endpointtien spec ei ole varmistunut. Suodatus tehdään ViewModel-hookissa.
   */
  listLeads(): Promise<Lead[]>;

  /**
   * Palauttaa piilotetut liidit (soft delete).
   *
   * Käyttö:
   * - "Piilotetut tarjouspyynnöt" -näkymä, jossa käyttäjä voi palauttaa tai poistaa liidejä.
   */
  listHiddenLeads(): Promise<Lead[]>;

  /**
   * Palauttaa yhden liidin id:n perusteella.
   *
   * Palautetaan `null`, jos liidiä ei löydy.
   */
  getLeadById(id: string): Promise<Lead | null>;

  /**
   * Päivittää liidin statuksen.
   *
   * Kutsutaan esim. kun tarjous luodaan ja liidi pitää merkitä 'quoted':ksi.
   *
   * @param leadId - Liidin ID
   * @param status - Uusi status
   */
  updateLeadStatus(leadId: string, status: LeadStatus): Promise<void>;

  /**
   * Piilottaa liidin (soft delete).
   *
   * Tavoite:
   * - Liidi poistuu Inbox/UI:sta
   * - Data säilyy tietokannassa (audit / palautus myöhemmin mahdollinen)
   */
  hideLead(leadId: string): Promise<void>;

  /**
   * Palauttaa piilotetyn liidin takaisin näkyviin.
   */
  unhideLead(leadId: string): Promise<void>;

  /**
   * Poistaa liidin pysyvästi (hard delete).
   *
   * Huom:
   * - Tätä ei voi palauttaa ilman varmuuskopioita.
   */
  deleteLead(leadId: string): Promise<void>;
}
