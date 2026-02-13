/**
 * Haversine-kaava: laskee etäisyyden (km) kahden koordinaatin välillä.
 *
 * Käyttö:
 * - Laskee "great circle distance" eli lyhimmän etäisyyden maapallon pinnalla
 * - Palauttaa etäisyyden kilometreinä
 *
 * Parametrit:
 * @param lat1 - Ensimmäisen pisteen leveys (latitude)
 * @param lon1 - Ensimmäisen pisteen pituus (longitude)
 * @param lat2 - Toisen pisteen leveys (latitude)
 * @param lon2 - Toisen pisteen pituus (longitude)
 * @returns Etäisyys kilometreinä
 */
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  // Muutetaan asteet radiaaneiksi
  const toRadians = (degrees: number) => degrees * (Math.PI / 180);

  const lat1Rad = toRadians(lat1);
  const lon1Rad = toRadians(lon1);
  const lat2Rad = toRadians(lat2);
  const lon2Rad = toRadians(lon2);

  // Haversine-kaava
  const dlon = lon2Rad - lon1Rad;
  const dlat = lat2Rad - lat1Rad;

  const a =
    Math.sin(dlat / 2) ** 2 +
    Math.cos(lat1Rad) * Math.cos(lat2Rad) * Math.sin(dlon / 2) ** 2;

  const c = 2 * Math.asin(Math.sqrt(a));

  // Maapallon säde kilometreinä
  const radiusKm = 6371;

  return c * radiusKm;
}
