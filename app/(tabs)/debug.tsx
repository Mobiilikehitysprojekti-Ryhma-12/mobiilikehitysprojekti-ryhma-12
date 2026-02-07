import React, { useCallback, useEffect, useState } from 'react';
import { StyleSheet, Switch, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { getDebugFlags, resetDebugFlags, setDebugFlags, subscribeDebugFlags } from '@/services/debugFlags';
import { clearLeadsCache, loadCachedLeads } from '@/services/leads/leadsCache';

export default function DebugTab() {
  const [flags, setFlagsState] = useState(getDebugFlags());
  const [cacheItemsCount, setCacheItemsCount] = useState<number | null>(null);
  const [cacheLastSynced, setCacheLastSynced] = useState<string | null>(null);

  const refreshCacheStatus = useCallback(async () => {
    const cached = await loadCachedLeads();
    setCacheItemsCount(cached.items ? cached.items.length : 0);
    setCacheLastSynced(cached.lastSynced);
  }, []);

  useEffect(() => {
    if (!__DEV__) return;
    return subscribeDebugFlags(setFlagsState);
  }, []);

  useEffect(() => {
    if (!__DEV__) return;
    void refreshCacheStatus();
  }, [refreshCacheStatus]);

  if (!__DEV__) {
    return (
      <ThemedView style={styles.screen}>
        <ThemedText>Debug ei ole käytössä production-buildissä.</ThemedText>
      </ThemedView>
    );
  }

  const anyEnabled = flags.simulateError || flags.simulateOffline;

  return (
    <ThemedView style={styles.screen}>
      <ThemedText type="title">Debug</ThemedText>

      <Card style={styles.card}>
        <ThemedText type="subtitle">{anyEnabled ? 'Simulaatio PÄÄLLÄ' : 'Simulaatio pois päältä'}</ThemedText>

        <Row label="SIMULATE_ERROR" value={flags.simulateError} onChange={(v) => setDebugFlags({ simulateError: v })} />
        <Row
          label="SIMULATE_OFFLINE"
          value={flags.simulateOffline}
          onChange={(v) => setDebugFlags({ simulateOffline: v })}
        />

        <View style={styles.divider} />

        <ThemedText type="subtitle">Cache status</ThemedText>
        <ThemedText style={styles.meta}>Cached leads: {cacheItemsCount === null ? '…' : `${cacheItemsCount} items`}</ThemedText>
        <ThemedText style={styles.meta}>Last synced: {cacheLastSynced ?? '—'}</ThemedText>

        <View style={styles.actionsRow}>
          <Button title="Reset debug flags" onPress={() => resetDebugFlags()} style={styles.actionBtn} />
          <Button
            title="Clear cached leads"
            onPress={async () => {
              await clearLeadsCache();
              await refreshCacheStatus();
            }}
            style={styles.actionBtn}
          />
          <Button title="Refresh cache status" onPress={() => refreshCacheStatus()} style={styles.actionBtn} />
        </View>
      </Card>

      <ThemedText style={styles.hint}>Demo: täytä cache kerran online → kytke SIMULATE_OFFLINE → palaa Inboxiin.</ThemedText>
    </ThemedView>
  );
}

function Row(props: { label: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <View style={styles.row}>
      <ThemedText>{props.label}</ThemedText>
      <Switch value={props.value} onValueChange={props.onChange} />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    padding: 16,
  },
  card: {
    marginTop: 16,
    gap: 10,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  divider: {
    height: 1,
    opacity: 0.25,
  },
  meta: {
    opacity: 0.8,
  },
  actionsRow: {
    marginTop: 8,
    gap: 10,
  },
  actionBtn: {
    alignSelf: 'flex-start',
  },
  hint: {
    opacity: 0.7,
    marginTop: 16,
  },
});
