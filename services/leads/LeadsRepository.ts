/**
 * LeadsRepository = datan lukemisen "rajapinta".
 *
 * Miksi tämä tehdään:
 * - UI ei saa olla kiinni apiClientistä tai fetchistä (löyhä kytkentä / "Hilt-ajattelu").
 * - Voidaan vaihtaa toteutus (Fake -> API) ilman että ruudut tai komponentit muuttuvat.
 */

import type { Lead } from '@/models/Lead';

export interface LeadsRepository {
  /**
   * Palauttaa liidit listanäkymää varten.
   *
   * Huom: tässä Sprint 1 -vaiheessa ei vielä määritellä server-side filtteröintiä,
   * koska endpointtien spec ei ole varmistunut. Suodatus tehdään ViewModel-hookissa.
   */
  listLeads(): Promise<Lead[]>;

  /**
   * Palauttaa yhden liidin id:n perusteella.
   *
   * Palautetaan `null`, jos liidiä ei löydy.
   */
  getLeadById(id: string): Promise<Lead | null>;
}
