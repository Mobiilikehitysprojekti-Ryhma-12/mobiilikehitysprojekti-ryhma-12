/**
 * Inbox-tab (Sprint 1 P0 + P1)
 *
 * Minimimuutos: korvataan template Home-screen Inboxilla.
 *
 * Arkkitehtuuri:
 * - Tämä ruutu ei kutsu apiClientia suoraan.
 * - Se hakee repositoryn Contextista (RepoProvider) ja delegoi logiikan ViewModel-hookille.
 * 
 * Sprint 1 P1: Pull-to-refresh lisätty (#30)
 * Sprint 2 P1 (#43): Offline-indikaattori (Ahvko)
 */

import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { Alert, FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';

import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorCard } from '@/components/ui/ErrorCard';
import { InboxFiltersBar } from '@/components/ui/InboxFiltersBar';
import { InboxSkeleton } from '@/components/ui/InboxSkeleton';
import { LeadListItem } from '@/components/ui/LeadListItem';
import { OfflineBanner } from '@/components/ui/OfflineBanner';
import { useLeadsRepo } from '@/services/leads/RepoProvider';
import { NetworkService } from '@/services/networkService';
import { useInboxViewModel } from '@/state/inbox/useInboxViewModel';

export default function InboxTab() {
  const router = useRouter();
  const repo = useLeadsRepo();
  const vm = useInboxViewModel(repo);

  // Pull-to-refresh state
  const [refreshing, setRefreshing] = useState(false);

  // ===== START #43: Network state =====
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    NetworkService.isOnline().then(setIsOnline);
    const unsubscribe = NetworkService.subscribe(setIsOnline);
    return () => unsubscribe();
  }, []);
  // ===== END #43 =====

  // Pull-to-refresh handler
  const onRefresh = useCallback(async () => {
    // Offline-tilassa estetään refresh ja annetaan selkeä viesti.
    if (vm.state.isOffline) {
      Alert.alert('Ei internetyhteyttä', 'Olet offline-tilassa. Näytetään välimuistidataa.');
      return;
    }
    setRefreshing(true);
    await vm.refresh();
    setRefreshing(false);
  }, [vm]);

  if (vm.state.kind === 'loading') {
    return <InboxSkeleton />;
  }

  if (vm.state.kind === 'error') {
    return <ErrorCard message={vm.state.message} onRetry={vm.refresh} />;
  }

  return (
    <View style={styles.screen}>
      {/* START #43: Offline banner */}
      {!isOnline && (
        <View style={styles.offlineBanner}>
          <Text style={styles.offlineText}>📶 Offline • Välimuistidata</Text>
        </View>
      )}
      {/* END #43 */}

      <InboxFiltersBar
        query={vm.filters.query}
        status={vm.filters.status}
        onQueryChange={vm.setQuery}
        onStatusChange={vm.setStatus}
      />

      <OfflineBanner
        isOffline={vm.state.isOffline}
        dataSource={vm.state.dataSource}
        lastSynced={vm.state.lastSynced}
      />

      {vm.state.kind === 'empty' ? (
        <EmptyState
          title={vm.state.emptyKind === 'no_items' ? 'Ei liidejä' : 'Ei tuloksia'}
          subtitle={
            vm.state.emptyKind === 'no_items'
              ? 'Päivitä näkymä tai tarkista yhteys.'
              : 'Kokeile muuttaa hakua tai suodattimia.'
          }
          hint={
            vm.state.isOffline && vm.state.emptyKind === 'no_items'
              ? 'Olet offline-tilassa. Välimuistidataa ei löytynyt vielä.'
              : undefined
          }
          cta="Päivitä"
          ctaDisabled={vm.state.isOffline}
          onCta={() => {
            if (vm.state.isOffline) {
              Alert.alert('Ei internetyhteyttä', 'Olet offline-tilassa. Näytetään välimuistidataa.');
              return;
            }
            void vm.refresh();
          }}
        />
      ) : (
        <FlatList
          data={vm.state.items}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <LeadListItem lead={item} onPress={() => router.push(`/lead/${item.id}`)} />
          )}
          // Pull-to-refresh lisätty tähän
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              enabled={!vm.state.isOffline}
              tintColor="#0a7ea4" // iOS spinner väri
              colors={['#0a7ea4']} // Android spinner väri
            />
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 24,
  },
  // START #43: Offline banner
  offlineBanner: {
    backgroundColor: '#FFA500',
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  offlineText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 13,
  },
  // END #43
});
