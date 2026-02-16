/**
 * services/supabaseClient.ts
 *
 * Supabase-client React Native (Expo) -ympäristöön.
 *
 * Tavoite:
 * - Käytetään EXPO_PUBLIC_* env-muuttujia (ei kovakoodattuja avaimia)
 * - Sessio säilyy sovelluksen restartin yli (persistSession + AsyncStorage)
 * - UI ei "kaadu" jos env puuttuu: kirjautuminen näyttää silloin selkeän virheen
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

/**
 * Huom: palautetaan `null`, jos envit puuttuvat.
 *
 * Miksi näin?
 * - Kehityksessä on helpompi saada sovellus käyntiin ja näyttää ohjeistus Login-ruudussa.
 * - Kun envit ovat oikein, client toimii normaalisti ja sessio persistoituu.
 */
export const supabase: SupabaseClient | null = (() => {
  // Expo Router (web) voi renderöidä näkymiä Node-ympäristössä (SSR).
  // Siellä ei ole `window`-objektia, ja AsyncStorage:n web-toteutus kaatuu.
  // Palautetaan SSR:ssä `null`, jolloin UI näyttää ystävällisen virheen (ja dev server ei kaadu).
  if (typeof window === 'undefined') {
    return null;
  }

  if (!supabaseUrl || !supabaseAnonKey) {
    // Ei heitetä erroria import-aikana -> app käynnistyy ja UI voi kertoa mitä puuttuu.
    console.warn(
      '[Supabase] EXPO_PUBLIC_SUPABASE_URL tai EXPO_PUBLIC_SUPABASE_ANON_KEY puuttuu. Kirjautuminen ei toimi ennen kuin env on asetettu.'
    );
    return null;
  }

  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      // RN: Supabase tarvitsee storage-adapterin session persistointiin.
      storage: AsyncStorage,
      // Persistoidaan sessio -> käyttäjä pysyy sisällä appin restartin yli.
      persistSession: true,
      autoRefreshToken: true,
      // Expo Router / RN: ei käytetä URL callback -sessioita.
      detectSessionInUrl: false,
      // Kiinteä avain, jotta signOut varmasti siivoaa saman itemin.
      storageKey: 'quoteflow-auth',
    },
  });
})();

export function getSupabaseEnvStatus(): {
  hasUrl: boolean;
  hasAnonKey: boolean;
} {
  return {
    hasUrl: Boolean(supabaseUrl),
    hasAnonKey: Boolean(supabaseAnonKey),
  };
}
