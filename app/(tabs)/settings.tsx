/**
 * app/(tabs)/settings.tsx
 *
 * Profiili/Settings minimi demoa varten:
 * - Näytetään kirjautuneen käyttäjän email ja uid
 * - Logout, joka tyhjentää session ja ohjaa Login-ruutuun (AuthGate hoitaa ohjauksen)
 */

import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Spacing } from '@/constants/theme';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useAuth } from '@/services/auth/AuthProvider';

export default function SettingsTab() {
  const router = useRouter();
  const tint = useThemeColor({}, 'tint');
  const { user, signOut, isLoading, errorMessage } = useAuth();

  return (
    <ThemedView style={styles.screen}>
      <ThemedText type="title">Asetukset</ThemedText>

      <Card style={styles.card}>
        <ThemedText type="subtitle">Käyttäjä</ThemedText>

        <View style={styles.row}>
          <ThemedText style={styles.label}>Email</ThemedText>
          <ThemedText style={styles.value}>{user?.email ?? '—'}</ThemedText>
        </View>

        <View style={styles.row}>
          <ThemedText style={styles.label}>User ID</ThemedText>
          <ThemedText style={styles.value}>{user?.id ?? '—'}</ThemedText>
        </View>

        {errorMessage ? <ThemedText style={{ color: tint }}>{errorMessage}</ThemedText> : null}

        <View style={styles.actions}>
          <Button
            title="Jaa yrityksen linkki (QR)"
            disabled={!user}
            onPress={() => {
              // Huom: käytetään omaa routea (app/share.tsx), jotta muutokset tab-navigaatioon pysyy minimissä.
              // TypedRoutes voi olla eri tilanteissa tiukka, joten castataan any.
              router.push('/share' as any);
            }}
          />

          <Button
            title="Piilotetut tarjouspyynnöt"
            disabled={!user}
            onPress={() => {
              router.push('/hidden' as any);
            }}
          />

          <Button
            title="Kirjaudu ulos"
            loading={isLoading}
            disabled={!user}
            onPress={async () => {
              await signOut();
            }}
          />
        </View>
      </Card>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    padding: Spacing.md,
    gap: 16,
  },
  card: {
    gap: 10,
  },
  row: {
    gap: 4,
  },
  label: {
    opacity: 0.75,
  },
  value: {
    opacity: 0.95,
  },
  actions: {
    marginTop: 8,
    alignSelf: 'flex-start',
    gap: 10,
  },
});
