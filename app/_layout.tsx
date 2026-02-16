import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { useColorScheme } from 'react-native';
import 'react-native-reanimated';

import { initDebugFlags } from '@/services/debugFlags';
import { RepoProvider } from '@/services/leads/RepoProvider';
import { QuoteProvider } from '@/services/quotes/QuoteProvider';

import { useRouter } from 'expo-router';
import * as Notifications from 'expo-notifications';
import { initNotifications, requestNotificationPermission } from '@/services/notifications/notificationService';

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
  const router = useRouter();
  const colorScheme = useColorScheme();

  // Debug-flägit
  useEffect(() => {
    initDebugFlags();
  }, []);

  // P0 #70 + #72: Notification setup + deep linking
  useEffect(() => {
    console.log('🔔 Initializing notifications...');
    
    // TÄRKEÄÄ: Alusta handler ensin
    initNotifications();
    
    // Sitten pyydä oikeudet
    requestNotificationPermission();

    // Kuuntele kun käyttäjä klikkaa notifikaatiota
    // P0 #72: Notif tap → deep link oikeaan liidiin
    const subscription = Notifications.addNotificationResponseReceivedListener(
      (response) => {
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
      }
    );

    return () => {
      console.log('🧹 Cleaning up notification listener');
      subscription.remove();
    };
  }, [router]);

  return (
    <RepoProvider>
      <QuoteProvider>
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
          <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
          </Stack>
          <StatusBar style="auto" />
        </ThemeProvider>
      </QuoteProvider>
    </RepoProvider>
  );
}