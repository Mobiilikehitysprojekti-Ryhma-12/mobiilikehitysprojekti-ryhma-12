import React, { useCallback, useEffect, useState } from 'react';
import { StyleSheet, Switch, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import {
    getDebugFlags,
    resetDebugFlags,
    setDebugFlags,
    subscribeDebugFlags,
} from '@/services/debugFlags';
import { clearLeadsCache, loadCachedLeads } from '@/services/leads/leadsCache';

export default function DebugScreen() {
  const [flags, setFlags] = useState(getDebugFlags());
  const [cacheItemsCount, setCacheItemsCount] = useState<number | null>(null);
  const [cacheLastSynced, setCacheLastSynced] = useState<string | null>(null);

  const refreshCacheStatus = useCallback(async () => {
    const cached = await loadCachedLeads();
    setCacheItemsCount(cached.items ? cached.items.length : 0);
    setCacheLastSynced(cached.lastSynced);
  }, []);

  useEffect(() => {
    if (!__DEV__) return;
    return subscribeDebugFlags(setFlags);
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

      <Card style={styles.statusCard}>
        <ThemedText type="subtitle">{anyEnabled ? 'Simulaatio PÄÄLLÄ' : 'Simulaatio pois päältä'}</ThemedText>
        <ThemedText style={styles.statusLine}>
          SIMULATE_ERROR: {String(flags.simulateError)}
        </ThemedText>
        <ThemedText style={styles.statusLine}>
          SIMULATE_OFFLINE: {String(flags.simulateOffline)}
        </ThemedText>

        <View style={styles.divider} />

        <ThemedText type="subtitle">Cache status</ThemedText>
        <ThemedText style={styles.statusLine}>
          Cached leads: {cacheItemsCount === null ? '…' : `${cacheItemsCount} items`}
        </ThemedText>
        <ThemedText style={styles.statusLine}>Last synced: {cacheLastSynced ?? '—'}</ThemedText>

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

      <Row
        label="SIMULATE_ERROR"
        value={flags.simulateError}
        onChange={(v) => setDebugFlags({ simulateError: v })}
      />
      <Row
        label="SIMULATE_OFFLINE"
        value={flags.simulateOffline}
        onChange={(v) => setDebugFlags({ simulateOffline: v })}
      />

      <ThemedText style={styles.hint}>
        Vinkki: kytke SIMULATE_ERROR päälle ja palaa Inboxiin → ErrorCard + Retry näkyy varmasti.
      </ThemedText>
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
  statusCard: {
    marginTop: 16,
    gap: 8,
  },
  statusLine: {
    opacity: 0.8,
  },
  divider: {
    height: 1,
    opacity: 0.25,
  },
  actionsRow: {
    marginTop: 8,
    gap: 10,
  },
  actionBtn: {
    alignSelf: 'flex-start',
  },
  row: {
    marginTop: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  hint: {
    opacity: 0.7,
    marginTop: 16,
  },
});
