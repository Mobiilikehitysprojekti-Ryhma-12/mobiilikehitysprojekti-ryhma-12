import React from 'react';
import { StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Card } from '@/components/ui/Card';

function formatLastSynced(value: string | null | undefined): string {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleString();
}

export function OfflineBanner({
  isOffline,
  lastSynced,
  dataSource,
}: {
  isOffline: boolean;
  lastSynced?: string | null;
  dataSource: 'cache' | 'network';
}) {
  if (!isOffline && dataSource !== 'cache') return null;

  const title = isOffline ? 'Offline – näytetään välimuistidataa' : 'Näytetään välimuistidataa';

  return (
    <Card style={styles.card}>
      <ThemedText type="subtitle">{title}</ThemedText>
      <ThemedText style={styles.meta}>Last synced: {formatLastSynced(lastSynced)}</ThemedText>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 8,
    gap: 6,
  },
  meta: {
    opacity: 0.8,
  },
});
