import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
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

