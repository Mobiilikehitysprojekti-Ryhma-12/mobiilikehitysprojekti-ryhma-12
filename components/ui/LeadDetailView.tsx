// components/ui/LeadDetailView.tsx

import { useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedView } from '@/components/themed-view';
import { LeadInfoCard } from '@/components/ui/LeadInfoCard';
import { MapCard } from '@/components/ui/MapCard';
import { QuoteActionsCard } from '@/components/ui/QuoteActionsCard';
import type { Lead, LeadStatus } from '@/models/Lead';

/**
 * LeadDetailView (container)
 *
 * Tarkoitus:
 * - Orkestroi liidin detaljinäkymän komponentit
 * - Hallinnoi navigoinnin Quote Builder -näkymään
 * - Ei hae dataa itse -> saa Lead-propin parentilta (screen / viewmodel)
 *
 * Miksi näin:
 * - Erottaa vastuut: tämä komponentti koordinoi lapsikomponentteja
 * - LeadInfoCard näyttää liidin tiedot
 * - QuoteActionsCard hallinnoi tarjoukseen liittyvät toiminnot
 * - Helpottaa testattavuutta ja uudelleenkäyttöä
 */
export function LeadDetailView({
  lead,
  onStatusChange,
  isStatusUpdating,
  statusUpdateError,
}: {
  lead: Lead;
  onStatusChange: (status: LeadStatus) => void;
  isStatusUpdating: boolean;
  statusUpdateError: string | null;
}) {
  const router = useRouter();

  const handleCreateQuote = () => {
    router.push({
      pathname: `/lead/[id]/quote` as const,
      params: { id: lead.id, leadTitle: lead.title },
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ThemedView style={styles.screen}>
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={true}
        >
          <LeadInfoCard lead={lead} />
          <MapCard lead={lead} />
          <QuoteActionsCard
            leadId={lead.id}
            onCreateQuote={handleCreateQuote}
            leadStatus={lead.status}
            onStatusChange={onStatusChange}
            isStatusUpdating={isStatusUpdating}
            statusUpdateError={statusUpdateError}
          />
        </ScrollView>
      </ThemedView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  screen: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    gap: 10,
  },
});