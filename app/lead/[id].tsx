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

/**
 *
 * Vastuut:
 * - Hakee liidin repositoryn kautta (Fake/API valitaan RepoProviderissa).
 * - Näyttää lataus-, virhe- ja "ei löytynyt" -tilat.
 * - Delegoi varsinaisen UI-renderöinnin LeadDetailView-komponentille.
 * - Päivittää liidin tiedot kun näkymä tulee takaisin fokukseen (esim. quote luomisen jälkeen).
 *
 * Miksi näin:
 * - UI pysyy ohuena ja uudelleenkäytettävänä.
 * - Datalähde on vaihdettavissa RepoProviderin lipulla ilman UI-muutoksia.
 * - useFocusEffect varmistaa, että liidin status päivittyy kun palaamme quote-näkymästä.
 */


import { useFocusEffect } from '@react-navigation/native';
import { Stack, useLocalSearchParams } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { StyleSheet } from 'react-native';

import { ThemedView } from '@/components/themed-view';
import { ErrorCard } from '@/components/ui/ErrorCard';
import { InboxSkeleton } from '@/components/ui/InboxSkeleton';
import { LeadDetailView } from '@/components/ui/LeadDetailView';
import type { Lead } from '@/models/Lead';
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

  /**
   * Päivitä liidin tiedot kun näkymä tulee fokukseen.
   * 
   * Käyttötapaus: Kun käyttäjä luoo tarjouksen ja palaa takaisin,
   * liidin status päivittyy "new" -> "quoted" välittömästi.
   */
  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const interimTitle = id ? `Lead ${id}` : 'Lead';


  if (isLoading) {
    return (
      <>
        <Stack.Screen options={{ title: interimTitle }} />
        <InboxSkeleton rows={5} />
      </>
    );
  }

  if (errorMessage) {
    return (
      <>
        <Stack.Screen options={{ title: interimTitle }} />
        <ErrorCard message={errorMessage} onRetry={load} />
      </>
    );
  }

  if (!lead) {
    return (
      <>
        <Stack.Screen options={{ title: interimTitle }} />
        <ErrorCard message="Liidiä ei löytynyt" onRetry={load} />
      </>
    );
  }


  return (
    <>
      {/* Kun lead on tiedossa, päivitetään otsikko tarkasti lead-id:n mukaan.
         Halutessasi voit näyttää otsikossa myös nimen: `title: lead.title` */}
      <Stack.Screen options={{ title: `Lead ${lead.id}` }} />

      <ThemedView style={styles.screen}>
        <LeadDetailView lead={lead} />
      </ThemedView>
    </>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    //padding: 16,
    //gap: 10,
  },
  //meta: {
  //  opacity: 0.8,
  //},
});
