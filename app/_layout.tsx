import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { Platform } from 'react-native';
import 'react-native-reanimated';

// Supabase RN: URL + crypto polyfillit (tarvitaan usein @supabase/supabase-js:lle).
import 'react-native-get-random-values';
import 'react-native-url-polyfill/auto';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { AuthProvider, useAuth } from '@/services/auth/AuthProvider';
import { initDebugFlags } from '@/services/debugFlags';
import { RepoProvider } from '@/services/leads/RepoProvider';
import { initNotifications, requestNotificationPermission } from '@/services/notifications/notificationService';
import { QuoteProvider } from '@/services/quotes/QuoteProvider';

// Web dev: react-navigation käyttää edelleen pointerEvents-proppia, ja react-native-web varoittaa siitä.
// Suodatetaan vain tämä yksittäinen varoitus mahdollisimman aikaisin (ennen ensimmäistä renderiä).
if (Platform.OS === 'web') {
  const originalWarn = console.warn;
  console.warn = (...args: unknown[]) => {
    const first = args[0];
    if (typeof first === 'string' && first.includes('props.pointerEvents is deprecated')) {
      return;
    }
    originalWarn(...(args as any[]));
  };
}

/**
 * RootLayout (Expo Router)
 *
 * Tämä on sovelluksen "juuri":
 * - `AuthProvider` hallinnoi Supabase-palvelun sessioita ja autentikointia.
 * - `RepoProvider` injektoi leads-repositoryt (Fake/API) koko appiin (löyhä kytkentä).
 * - `QuoteProvider` injektoi quotes-repositoryt (Fake/API) koko appiin.
 * - `ThemeProvider` kytkee React Navigation -teeman (light/dark).
 * - `Stack` määrittelee pääreitit (tabs + login).
 * - `AuthGate` suojaa reitit: jos ei sessiota → login, jos sessio → (tabs).
 *
 * Tärkeä periaate: Providerit pidetään täällä, jotta yksittäiset screenit pysyy yksinkertaisina.
 */

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const segments = useSegments();

  // Debug-flägit
  useEffect(() => {
    initDebugFlags();
  }, []);

  // Webissä React Navigation merkitsee taustaruudut aria-hidden="true"-attribuutilla.
  // Jos fokusoitu elementti on tässä puussa, selain varoittaa "Blocked aria-hidden... retained focus".
  // Korjaus: MutationObserver kuuntelee aria-hidden -muutoksia ja blurraa fokuksen välittömästi.
  useEffect(() => {
    if (Platform.OS !== 'web') return;

    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.type !== 'attributes' || mutation.attributeName !== 'aria-hidden') continue;
        const target = mutation.target as HTMLElement;
        if (target.getAttribute('aria-hidden') !== 'true') continue;
        const active = document.activeElement as HTMLElement | null;
        if (active && target.contains(active)) {
          // Elementti jäi fokukseen aria-hidden-alipuuhun -> blurrataan heti.
          active.blur();
        }
      }
    });

    observer.observe(document.body, { subtree: true, attributes: true, attributeFilter: ['aria-hidden'] });

    return () => observer.disconnect();
  }, []);

  // P0 #70 + #72: Notification setup + deep linking
  useEffect(() => {
    // Webissä expo-notifications ei tarjoa samaa natiivikäyttäytymistä.
    // P0: tärkeintä on ettei web kaadu tai spämmää virheilmoituksia.
    if (Platform.OS === 'web') {
      return;
    }

    let cancelled = false;
    let subscription: { remove: () => void } | null = null;

    (async () => {
      try {
        console.log('🔔 Initializing notifications...');

        // TÄRKEÄÄ: Alusta handler ensin
        await initNotifications();

        // Sitten pyydä oikeudet
        await requestNotificationPermission();

        // Kuuntele kun käyttäjä klikkaa notifikaatiota
        // P0 #72: Notif tap → deep link oikeaan liidiin
        const Notifications = await import('expo-notifications');
        if (cancelled) return;

        subscription = Notifications.addNotificationResponseReceivedListener((response) => {
          const data = response.notification.request.content.data;
          const url = data.url as string;

          console.log('🔗 Notification tapped, deep linking to:', url);
          console.log('📦 Notification data:', data);

          if (url) {
            // Pieni viive varmistaa että app on varmasti auki
            setTimeout(() => {
              router.push(url as any);
            }, 100);
          }
        });
      } catch (error: unknown) {
        // P0: notifikaatiot eivät saa kaataa appia.
        console.error('❌ Notification init failed', error);
      }
    })();

    return () => {
      cancelled = true;
      subscription?.remove();
    };
  }, [router]);

  return (
    <AuthProvider>
      <RepoProvider>
        <QuoteProvider>
          <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
            <AuthGate />
            <Stack>
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen name="login" options={{ headerShown: false }} />
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
 * - useSegments() heittää tyypin "unknown" joissain tapauksissa, castataan stringiksi.
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