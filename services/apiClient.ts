/**
 * apiClient — HTTP-kutsujen perustoteutus
 * 
 * Tarkoitus:
 * - Tarjoaa yhtenäisen tavan tehdä API-kutsuja
 * - Sisältää base URL:n ja yleiset headerit
 * - Käsittelee virheet yhdenmukaisesti
 * 
 * HUOM: UI-koodi EI käytä apiClientia suoraan!
 * - UI käyttää Repositoryjä (LeadsRepository, QuotesRepository)
 * - Repositoryt käyttävät apiClientia sisäisesti
 * 
 * Dev-flagit:
 * - SIMULATE_ERROR: simuloi virhettä (demoa varten)
 */

/**
 * BASE_URL — API:n perus-URL
 * 
 * Tuotantoa varten:
 * - Vaihda oikea backend-osoite (esim. "https://api.quoteflow.example.com")
 * - Tai käytä ympäristömuuttujaa: process.env.EXPO_PUBLIC_API_BASE_URL
 */
const BASE_URL = 'http://localhost:3000/api'; // Placeholder - päivitä oikea osoite

/**
 * Dev-flag: Simuloi virhe jokaisessa API-kutsussa
 * 
 * Käyttö demossa:
 * - Aseta `true` jotta ErrorCard + Retry näkyy luotettavasti
 * - Vaatii että USE_FAKE_REPO = false (RepoProvider.tsx)
 */
const SIMULATE_ERROR = false;

/**
 * getJson — Hakee JSON-dataa GET-requestilla
 * 
 * @param path - API-polku (esim. "/leads")
 * @returns Promise joka resolvataan JSON-dataan
 * @throws Error jos HTTP-status ei ole 200-299 tai verkkovirhe
 */
export async function getJson<T>(path: string): Promise<T> {
  if (SIMULATE_ERROR) {
    throw new Error('[SIMULOITU VIRHE] apiClient: SIMULATE_ERROR on päällä');
  }

  const url = `${BASE_URL}${path}`;
  
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        // Lisää tarvittaessa: 'Authorization': `Bearer ${token}`
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    return data as T;
  } catch (error: unknown) {
    console.error(`[apiClient] GET ${path} epäonnistui:`, error);
    throw error;
  }
}

/**
 * postJson — Lähettää JSON-dataa POST-requestilla
 * 
 * @param path - API-polku (esim. "/quotes")
 * @param body - Lähetettävä data (serialisoidaan JSON:ksi)
 * @returns Promise joka resolvataan vastaukseen (JSON)
 * @throws Error jos HTTP-status ei ole 200-299 tai verkkovirhe
 */
export async function postJson<T>(path: string, body: unknown): Promise<T> {
  if (SIMULATE_ERROR) {
    throw new Error('[SIMULOITU VIRHE] apiClient: SIMULATE_ERROR on päällä');
  }

  const url = `${BASE_URL}${path}`;
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    return data as T;
  } catch (error: unknown) {
    console.error(`[apiClient] POST ${path} epäonnistui:`, error);
    throw error;
  }
}

/**
 * patchJson — Päivittää dataa PATCH-requestilla
 * 
 * @param path - API-polku (esim. "/leads/123/status")
 * @param body - Lähetettävä data (serialisoidaan JSON:ksi)
 * @returns Promise joka resolvataan vastaukseen (JSON)
 * @throws Error jos HTTP-status ei ole 200-299 tai verkkovirhe
 */
export async function patchJson<T>(path: string, body: unknown): Promise<T> {
  if (SIMULATE_ERROR) {
    throw new Error('[SIMULOITU VIRHE] apiClient: SIMULATE_ERROR on päällä');
  }

  const url = `${BASE_URL}${path}`;
  
  try {
    const response = await fetch(url, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    return data as T;
  } catch (error: unknown) {
    console.error(`[apiClient] PATCH ${path} epäonnistui:`, error);
    throw error;
  }
}
