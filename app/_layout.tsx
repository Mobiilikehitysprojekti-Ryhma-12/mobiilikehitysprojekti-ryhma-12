import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';

// Supabase RN: URL + crypto polyfillit (tarvitaan usein @supabase/supabase-js:lle).
import 'react-native-get-random-values';
import 'react-native-url-polyfill/auto';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { AuthProvider, useAuth } from '@/services/auth/AuthProvider';
import { initDebugFlags } from '@/services/debugFlags';
import { RepoProvider } from '@/services/leads/RepoProvider';
import { QuoteProvider } from '@/services/quotes/QuoteProvider';

/**
 * RootLayout (Expo Router)
 *
 * Tämä on sovelluksen "juuri":
 * - `RepoProvider` injektoi leads-repositoryt (Fake/API) koko appiin (löyhä kytkentä).
 * - `QuoteProvider` injektoi quotes-repositoryt (Fake/API) koko appiin.
 * - `ThemeProvider` kytkee React Navigation -teeman (light/dark).
 * - `Stack` määrittelee pääreitit (tabs + modal).
 *
 * Tärkeä periaate: Providerit pidetään täällä, jotta yksittäiset screenit pysyy yksinkertaisina.
 */

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  useEffect(() => {
    initDebugFlags();
  }, []);

  return (
    <AuthProvider>
      <RepoProvider>
        <QuoteProvider>
          <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
            <AuthGate />
            <Stack>
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen name="login" options={{ headerShown: false }} />
              <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
            </Stack>
            <StatusBar style="auto" />
          </ThemeProvider>
        </QuoteProvider>
      </RepoProvider>
    </AuthProvider>
  );
}

/**
 * AuthGate (route guard)
 *
 * Yksinkertainen "login ↔ tabs" ohjaus:
 * - Jos käyttäjällä ei ole sessiota -> ohjataan Login-ruutuun
 * - Jos sessio on olemassa -> ohjataan (tabs)-ryhmään
 *
 * Huom:
 * - Odotetaan authin initialisointia, jotta ei tule välähdyksiä väärälle ruudulle.
 */
function AuthGate() {
  const router = useRouter();
  const segments = useSegments();
  const { session, isLoading } = useAuth();

  useEffect(() => {
    if (isLoading) return;

    // typedRoutes: `useSegments()` voi olla tiukasti tyypitetty (Expo Router generoi reittityypit).
    // Castataan stringiksi, jotta guard-logiikka toimii vaikka tyypit eivät ole vielä päivittyneet.
    const first = segments[0] as unknown as string | undefined;
    const inLogin = first === 'login';

    // Ei sessiota -> ohjataan Login-ruutuun.
    // (Tämä suojaa (tabs)-ryhmän ja muut reitit, jos lisäätte myöhemmin lisää suojattuja näkymiä.)
    if (!session && !inLogin) {
      router.replace('/login' as any);
      return;
    }

    // Sessio olemassa -> jos käyttäjä on login-ruudussa, ohjataan (tabs):iin.
    if (session && inLogin) {
      router.replace('/(tabs)' as any);
    }
  }, [segments, session, isLoading, router]);

  return null;
}

