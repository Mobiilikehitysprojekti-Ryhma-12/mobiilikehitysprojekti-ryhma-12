/**
 * Quote Builder -näkymä.
 *
 * Reitti: /lead/[leadId]/quote
 *
 * Vastuut:
 * - Näyttää tarjouksen luomisen lomakkeen
 * - Validoi käyttäjän syöte
 * - Tarjoaa loading / error / success -tilat
 *
 * Miksi näin:
 * - Lead detailin yhteydessä voidaan heti luoda tarjous
 * - Datalähde on vaihdettavissa RepoProviderin kautta ilman UI-muutoksia
 */

import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, StyleSheet } from 'react-native';

import { ThemedView } from '@/components/themed-view';
import { ErrorCard, QuoteBuilderForm } from '@/components/ui';
import type { QuoteFormData } from '@/models/Quote';

export default function QuoteBuilderScreen() {
  const { id: leadId, leadTitle } = useLocalSearchParams<{ id?: string; leadTitle?: string }>();
  const router = useRouter();

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // TODO: Kun Quote-repositorio luodaan, integroidaan se tähän
  // const repo = useQuotesRepo();

  const handleSubmit = async (formData: QuoteFormData) => {
    // Guard: jos lead-id puuttuu, ei jatketa
    if (!leadId) {
      setErrorMessage('Virheellinen liidi-id');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      // TODO: Integroidaan repo.createQuote(leadId, formData)
      // const newQuote = await repo.createQuote(leadId, formData);
      
      // Simuloidaan onnistunut lähetys
      console.log('Tarjous luotiin:', formData);

      // Onnistumisen jälkeen navigoidaan takaisin lead-detailiin
      router.back();
    } catch (error: unknown) {
      console.error('QuoteBuilder: tarjouksen luominen epäonnistui', error);
      const message = error instanceof Error ? error.message : 'Tuntematon virhe';
      setErrorMessage(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.back();
  };

  if (errorMessage && !isSubmitting) {
    return (
      <>
        <Stack.Screen options={{ title: 'Tarjous' }} />
        <ErrorCard message={errorMessage} onRetry={() => setErrorMessage(null)} />
      </>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: 'Luo tarjous' }} />
      <ThemedView style={styles.container}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <QuoteBuilderForm
            leadId={leadId || ''}
            leadTitle={leadTitle || ''}
            isSubmitting={isSubmitting}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
          />
        </ScrollView>
      </ThemedView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
    gap: 16,
  },
});
