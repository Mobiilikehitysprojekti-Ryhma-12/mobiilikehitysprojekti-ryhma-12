// components/ui/LeadDetailView.tsx

import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet } from 'react-native';

import { ThemedView } from '@/components/themed-view';
import { LeadInfoCard } from '@/components/ui/LeadInfoCard';
import { QuoteActionsCard } from '@/components/ui/QuoteActionsCard';
import type { Lead } from '@/models/Lead';

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
export function LeadDetailView({ lead }: { lead: Lead }) {
  const router = useRouter();

  const handleCreateQuote = () => {
    router.push({
      pathname: `/lead/[id]/quote` as const,
      params: { id: lead.id, leadTitle: lead.title },
    });
  };

  return (
    <ThemedView style={styles.screen}>
      <LeadInfoCard lead={lead} />
      <QuoteActionsCard leadId={lead.id} onCreateQuote={handleCreateQuote} />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    padding: 16,
    gap: 10,
  },
});