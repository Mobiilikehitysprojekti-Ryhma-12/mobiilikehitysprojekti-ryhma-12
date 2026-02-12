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
 * Sprint 2 P1 (#43): Offline-indikaattori (Ahvko) - integroitu NetInfo
 */

import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { Alert, FlatList, RefreshControl, StyleSheet, View } from 'react-native';

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

  // ===== START #43: Network state (NetInfo integration) =====
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
    // Käytetään NetInfo:n isOnline-tilaa, koska se on reaaliaikainen
    if (!isOnline) {
      Alert.alert('Ei internetyhteyttä', 'Olet offline-tilassa. Näytetään välimuistidataa.');
      return;
    }
    setRefreshing(true);
    await vm.refresh();
    setRefreshing(false);
  }, [vm, isOnline]);

  if (vm.state.kind === 'loading') {
    return <InboxSkeleton />;
  }

  if (vm.state.kind === 'error') {
    return <ErrorCard message={vm.state.message} onRetry={vm.refresh} />;
  }

  return (
    <View style={styles.screen}>
      <InboxFiltersBar
        query={vm.filters.query}
        status={vm.filters.status}
        onQueryChange={vm.setQuery}
        onStatusChange={vm.setStatus}
      />

      {/* 
        OfflineBanner: Käytetään tiimin olemassa olevaa komponenttia,
        mutta päivitetty NetInfo-integraatiolla.
        Näyttää bannerin kun:
        1) NetInfo havaitsee offline-tilan (!isOnline), TAI
        2) Data tulee cachesta (vm.state.dataSource === 'cache')
      */}
      <OfflineBanner
        isOffline={!isOnline}
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
            !isOnline && vm.state.emptyKind === 'no_items'
              ? 'Olet offline-tilassa. Välimuistidataa ei löytynyt vielä.'
              : undefined
          }
          cta="Päivitä"
          ctaDisabled={!isOnline}
          onCta={() => {
            if (!isOnline) {
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
          // Pull-to-refresh: disabled kun offline
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              enabled={isOnline}
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
});