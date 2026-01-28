/**
 * ErrorCard
 *
 * Yhtenäinen virhetila-komponentti, jossa on Retry-nappi.
 *
 * Miksi tämä on oma komponentti:
 * - Sama virhe-UI toistuu useissa ruuduissa (Inbox, Detail).
 * - Yhdenmukainen UX ja helpompi ylläpito.
 */

import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useThemeColor } from '@/hooks/use-theme-color';

export function ErrorCard({ message, onRetry }: { message: string; onRetry: () => void }) {
  const borderColor = useThemeColor({}, 'icon');
  const tintColor = useThemeColor({}, 'tint');

  return (
    <ThemedView style={[styles.card, { borderColor }]}>
      <ThemedText type="subtitle">Virhe</ThemedText>
      <ThemedText style={styles.msg}>{message}</ThemedText>

      <Pressable accessibilityRole="button" onPress={onRetry} style={[styles.btn, { borderColor }]}>
        <View style={[styles.btnAccent, { backgroundColor: tintColor }]} />
        <ThemedText type="defaultSemiBold">Yritä uudelleen</ThemedText>
      </Pressable>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 16,
    margin: 16,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
  },
  msg: {
    opacity: 0.9,
  },
  btn: {
    marginTop: 8,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  btnAccent: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
});
