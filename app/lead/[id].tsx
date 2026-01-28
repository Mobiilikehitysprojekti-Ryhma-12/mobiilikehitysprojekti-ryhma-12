/**
 * Lead detail route
 *
 * Reitti: /lead/[id]
 *
 * Sprint 1 P0 tavoite:
 * - Näytä loading (skeleton)
 * - Näytä error + retry
 * - Näytä minimikentät (title, createdAt, address, description)
 *
 * Huom: tämäkin ruutu käyttää repositorya Contextista.
 */

import { useLocalSearchParams } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { ErrorCard } from '@/components/ui/ErrorCard';
import { InboxSkeleton } from '@/components/ui/InboxSkeleton';
import type { Lead } from '@/models/Lead';
import { leadStatusLabel } from '@/models/Lead';
import { useLeadsRepo } from '@/services/leads/RepoProvider';

export default function LeadDetailScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const repo = useLeadsRepo();

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [lead, setLead] = useState<Lead | null>(null);

  const load = useCallback(async () => {
    // Miksi guard: jos route-parametri puuttuu, ei kutsuta repositorya turhaan.
    if (!id) {
      setIsLoading(false);
      setErrorMessage('Virheellinen liidi-id');
      setLead(null);
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const result = await repo.getLeadById(String(id));
      if (!result) {
        throw new Error('Liidiä ei löytynyt');
      }
      setLead(result);
    } catch (error: unknown) {
      console.error('LeadDetail: getLeadById epäonnistui', error);
      const message = error instanceof Error ? error.message : 'Tuntematon virhe';
      setErrorMessage(message);
      setLead(null);
    } finally {
      setIsLoading(false);
    }
  }, [id, repo]);

  useEffect(() => {
    load();
  }, [load]);

  if (isLoading) return <InboxSkeleton rows={5} />;
  if (errorMessage) return <ErrorCard message={errorMessage} onRetry={load} />;
  if (!lead) return <ErrorCard message="Liidiä ei löytynyt" onRetry={load} />;

  return (
    <ThemedView style={styles.screen}>
      <ThemedText type="title">{lead.title}</ThemedText>
      <ThemedText style={styles.meta}>{leadStatusLabel(lead.status)}</ThemedText>
      <ThemedText style={styles.meta}>{lead.createdAt}</ThemedText>

      {lead.customerName ? <ThemedText>Asiakas: {lead.customerName}</ThemedText> : null}
      {lead.address ? <ThemedText>Osoite: {lead.address}</ThemedText> : null}
      {lead.service ? <ThemedText>Palvelu: {lead.service}</ThemedText> : null}
      {lead.description ? <ThemedText>{lead.description}</ThemedText> : null}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    padding: 16,
    gap: 10,
  },
  meta: {
    opacity: 0.8,
  },
});
