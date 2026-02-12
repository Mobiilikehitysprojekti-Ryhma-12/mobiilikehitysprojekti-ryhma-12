/**
 * Lead model — Liidin (lead) data-malli
 * 
 * Tarkoitus:
 * - Määrittää liidin rakenne ja tyypit
 * - Sisältää apufunktioita statuksen formatoinnille
 * 
 * Liidit ovat asiakashakemuksia / myyntipotentiaaleja
 */

export type LeadStatus = 'new' | 'quoted' | 'won' | 'lost';

export interface Lead {
  id: string;
  title: string;
  status: LeadStatus;
  service?: string;
  customerName?: string;
  address?: string;
  description?: string;
  createdAt: string;
}

/**
 * Palauttaa suomalaisen statuksen nimen
 */
export function leadStatusLabel(status: LeadStatus): string {
  const labels: Record<LeadStatus, string> = {
    new: 'Uusi',
    quoted: 'Tarjottu',
    won: 'Voitettu',
    lost: 'Menetetty',
  };
  return labels[status];
}
