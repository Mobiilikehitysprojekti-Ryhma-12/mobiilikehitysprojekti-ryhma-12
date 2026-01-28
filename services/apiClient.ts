/**
 * services/apiClient.ts
 *
 * Alimman tason HTTP-asiakas.
 *
 * Tärkeä periaate:
 * - UI ei kutsu tätä suoraan.
 * - Repositoriot (esim. ApiLeadsRepository) käyttävät tätä.
 *
 * Sprint 1 demo:
 * - SIMULATE_ERROR=true -> virhetila + Retry on helppo demonstroida.
 */

// TODO: lisää oikea base URL, kun backend on varmistunut.
const BASE_URL = '';

// Demoa varten: laita true -> ErrorCard + Retry näkyy varmasti videolla.
const SIMULATE_ERROR = false;

export async function getJson<T>(path: string): Promise<T> {
  if (SIMULATE_ERROR) {
    throw new Error('Simuloitu API-virhe (SIMULATE_ERROR=true)');
  }

  const url = BASE_URL ? `${BASE_URL}${path}` : path;

  const response = await fetch(url, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });

  if (!response.ok) {
    const text = await response.text().catch(() => '');
    throw new Error(`API ${response.status}: ${text || response.statusText}`);
  }

  return (await response.json()) as T;
}

// Säilytetään vanha export minimimuutoksella.
// (Jos tätä ei enää käytetä, se voidaan poistaa myöhemmin refaktorissa.)
export async function fetchLeads() {
  return [];
}
