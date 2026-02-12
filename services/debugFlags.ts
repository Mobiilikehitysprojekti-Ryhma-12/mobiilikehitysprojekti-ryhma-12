/**
 * debugFlags — Debug-asetusten hallinta
 * 
 * Tarkoitus:
 * - Tarjoaa kehityksessä debug-liput (simulateError, simulateOffline, jne.)
 * - Persistoi liput AsyncStorageen, jotta ne säilyvät app-käynnistysten välillä
 * - Mahdollistaa liputusten kuuntelun (subscribe)
 * 
 * Käyttö:
 * - `initDebugFlags()` ladataan app-käynnistyksessä (app/_layout.tsx)
 * - `getDebugFlags()` hakee nykyiset liput
 * - `setDebugFlags({ simulateError: true })` asettaa liput
 * - `subscribeDebugFlags(callback)` kuuntelee muutoksia
 * - `resetDebugFlags()` palauttaa oletusarvot
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'qf:debug:flags';

export interface DebugFlags {
  simulateError: boolean;
  simulateOffline: boolean;
}

const DEFAULT_FLAGS: DebugFlags = {
  simulateError: false,
  simulateOffline: false,
};

// In-memory state
let currentFlags: DebugFlags = { ...DEFAULT_FLAGS };
const listeners: Set<(flags: DebugFlags) => void> = new Set();

/**
 * initDebugFlags
 * Lataa liput AsyncStoragesta sovelluksen käynnistyessä.
 * Kutsutaan app/_layout.tsx:ssä.
 */
export async function initDebugFlags(): Promise<void> {
  try {
    const stored = await AsyncStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored) as Partial<DebugFlags>;
      currentFlags = { ...DEFAULT_FLAGS, ...parsed };
    }
  } catch (err) {
    console.error('[debugFlags] initDebugFlags failed:', err);
  }
}

/**
 * getDebugFlags
 * Palauttaa nykyiset debug-liput.
 */
export function getDebugFlags(): DebugFlags {
  return { ...currentFlags };
}

/**
 * setDebugFlags
 * Asettaa debug-liput (osittainen päivitys) ja tallentaa AsyncStorageen.
 */
export async function setDebugFlags(partial: Partial<DebugFlags>): Promise<void> {
  currentFlags = { ...currentFlags, ...partial };

  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(currentFlags));
  } catch (err) {
    console.error('[debugFlags] setDebugFlags failed to persist:', err);
  }

  // Notifioi kuuntelijat
  listeners.forEach((fn) => fn(currentFlags));
}

/**
 * resetDebugFlags
 * Palauttaa debug-liput oletusarvoihin ja poistaa AsyncStoragesta.
 */
export async function resetDebugFlags(): Promise<void> {
  currentFlags = { ...DEFAULT_FLAGS };

  try {
    await AsyncStorage.removeItem(STORAGE_KEY);
  } catch (err) {
    console.error('[debugFlags] resetDebugFlags failed:', err);
  }

  // Notifioi kuuntelijat
  listeners.forEach((fn) => fn(currentFlags));
}

/**
 * subscribeDebugFlags
 * Kuuntelee debug-lippujen muutoksia.
 * Palauttaa unsubscribe-funktion.
 */
export function subscribeDebugFlags(callback: (flags: DebugFlags) => void): () => void {
  listeners.add(callback);
  return () => {
    listeners.delete(callback);
  };
}
