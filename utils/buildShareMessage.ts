/**
 * utils/buildShareMessage
 *
 * Muodostaa jaettavan tekstin yhteen paikkaan.
 *
 * Miksi tämä on oma helper:
 * - Sama viesti voidaan käyttää useassa paikassa (nyt Share-ruutu, myöhemmin esim. Lead detail).
 * - Viestin muoto on helppo muuttaa ilman että UI-komponentteja tarvitsee säätää.
 */

type ShareInfo = {
  /** Asiakkaalle jaettava URL (web). */
  url: string;

  /** Yrityksen nimi. */
  businessName: string;

  /** Yrityksen puhelin. */
  businessPhone: string;

  /** Yrityksen sähköposti. */
  businessEmail: string;
};

/**
 * buildShareMessage
 *
 * Palauttaa valmiin, ihmisluettavan viestin share-sheetiin.
 *
 * Huom:
 * - Ei heitä virheitä (P0 demo-proof): jos kenttiä puuttuu, ne näkyvät "Ei asetettu".
 */
export function buildShareMessage(info: ShareInfo): string {
  return [
    `Yritys: ${info.businessName}`,
    `Puhelin: ${info.businessPhone}`,
    `Sähköposti: ${info.businessEmail}`,
    '',
    `Linkki tarjouspyyntöön: ${info.url}`,
  ].join('\n');
}
