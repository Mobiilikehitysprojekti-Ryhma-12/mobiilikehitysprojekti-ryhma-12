import React, { useEffect, useState } from 'react';
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

export default function DebugScreen() {
  const [flags, setFlags] = useState(getDebugFlags());

  useEffect(() => {
    if (!__DEV__) return;
    return subscribeDebugFlags(setFlags);
  }, []);

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

        <Button title="Reset to defaults" onPress={() => resetDebugFlags()} style={styles.resetBtn} />
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
  resetBtn: {
    marginTop: 8,
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
