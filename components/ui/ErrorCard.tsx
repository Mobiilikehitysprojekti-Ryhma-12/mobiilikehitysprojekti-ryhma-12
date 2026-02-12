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
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useThemeColor } from '@/hooks/use-theme-color';

export function ErrorCard({ message, onRetry }: { message: string; onRetry: () => void }) {
  const tintColor = useThemeColor({}, 'tint');

  return (
    <Card style={styles.card}>
      <ThemedText type="subtitle">Virhe</ThemedText>
      <ThemedText style={styles.msg}>{message}</ThemedText>

      <Button
        title="Yritä uudelleen"
        onPress={onRetry}
        leading={<View style={[styles.btnAccent, { backgroundColor: tintColor }]} />}
        style={styles.btn}
      />
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    margin: 16,
    gap: 8,
  },
  msg: {
    opacity: 0.9,
  },
  btn: {
    marginTop: 8,
    alignSelf: 'flex-start',
  },
  btnAccent: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
});
