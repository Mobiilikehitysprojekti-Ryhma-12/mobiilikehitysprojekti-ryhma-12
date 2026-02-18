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
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { Alert, StyleSheet } from 'react-native';

import { ThemedView } from '@/components/themed-view';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ErrorCard } from '@/components/ui/ErrorCard';
import { InboxSkeleton } from '@/components/ui/InboxSkeleton';
import { LeadDetailView } from '@/components/ui/LeadDetailView';
import type { Lead, LeadStatus } from '@/models/Lead';
import { useLeadsRepo } from '@/services/leads/RepoProvider';
import { removeLeadFromCachedList } from '@/services/leads/leadsCache';

export default function LeadDetailScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const repo = useLeadsRepo();
  const router = useRouter();

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [lead, setLead] = useState<Lead | null>(null);
  const [isStatusUpdating, setIsStatusUpdating] = useState<boolean>(false);
  const [statusUpdateError, setStatusUpdateError] = useState<string | null>(null);

  const [isManageUpdating, setIsManageUpdating] = useState<boolean>(false);
  const [manageError, setManageError] = useState<string | null>(null);

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

  /**
   * Päivittää liidin statuksen repositoryn kautta ja päivittää UI:n.
   *
   * Miksi täällä:
   * - Screen omistaa datan ja repon, joten päivitys tehdään täällä eikä UI-komponentissa.
   */
  const handleStatusChange = useCallback(
    async (status: LeadStatus) => {
      if (!lead || status === lead.status) {
        return;
      }

      setIsStatusUpdating(true);
      setStatusUpdateError(null);

      try {
        await repo.updateLeadStatus(lead.id, status);
        setLead((prev) => (prev ? { ...prev, status } : prev));
      } catch (error: unknown) {
        console.error('LeadDetail: updateLeadStatus epäonnistui', error);
        const message =
          error instanceof Error ? error.message : 'Virhe statuksen päivittämisessä';
        setStatusUpdateError(message);
      } finally {
        setIsStatusUpdating(false);
      }
    },
    [lead, repo]
  );

  /**
   * Piilota liidi: poistuu Inboxista, mutta säilyy tietokannassa.
   *
   * Miksi confirm:
   * - Piilotus on käyttäjälle "siivous"-toiminto, mutta se vaikuttaa listaukseen heti.
   */
  const handleHideLead = useCallback(() => {
    if (!lead) return;

    Alert.alert(
      'Piilota tarjouspyyntö?',
      'Piilotettu tarjouspyyntö poistuu listasta. Tätä ei voi palauttaa sovelluksesta ilman erillistä toimintoa.',
      [
        { text: 'Peruuta', style: 'cancel' },
        {
          text: 'Piilota',
          style: 'destructive',
          onPress: async () => {
            setIsManageUpdating(true);
            setManageError(null);
            try {
              await repo.hideLead(lead.id);
              await removeLeadFromCachedList(lead.id);
              router.back();
            } catch (error: unknown) {
              console.error('LeadDetail: hideLead epäonnistui', error);
              const message = error instanceof Error ? error.message : 'Virhe liidin piilottamisessa';
              setManageError(message);
            } finally {
              setIsManageUpdating(false);
            }
          },
        },
      ]
    );
  }, [lead, repo, router]);

  /**
   * Poista liidi pysyvästi: poistuu tietokannasta.
   *
   * Miksi confirm:
   * - Tämä on peruuttamaton toimenpide.
   */
  const handleDeleteLead = useCallback(() => {
    if (!lead) return;

    Alert.alert(
      'Poista tarjouspyyntö pysyvästi?',
      'Tämä poistaa tarjouspyynnön tietokannasta. Toimintoa ei voi perua.',
      [
        { text: 'Peruuta', style: 'cancel' },
        {
          text: 'Poista',
          style: 'destructive',
          onPress: async () => {
            setIsManageUpdating(true);
            setManageError(null);
            try {
              await repo.deleteLead(lead.id);
              await removeLeadFromCachedList(lead.id);
              router.back();
            } catch (error: unknown) {
              console.error('LeadDetail: deleteLead epäonnistui', error);
              const message = error instanceof Error ? error.message : 'Virhe liidin poistamisessa';
              setManageError(message);
            } finally {
              setIsManageUpdating(false);
            }
          },
        },
      ]
    );
  }, [lead, repo, router]);

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
        <LeadDetailView
          lead={lead}
          onStatusChange={handleStatusChange}
          isStatusUpdating={isStatusUpdating}
          statusUpdateError={statusUpdateError}
        />

        {/*
          Hallinta:
          - Piilota = soft delete (poistuu Inboxista)
          - Poista = hard delete (poistuu tietokannasta)
        */}
        <Card style={styles.manageCard}>
          <Button
            title={isManageUpdating ? 'Käsitellään...' : 'Piilota tarjouspyyntö'}
            onPress={handleHideLead}
            disabled={isManageUpdating}
            loading={isManageUpdating}
          />
          <Button
            title={isManageUpdating ? 'Käsitellään...' : 'Poista tarjouspyyntö'}
            onPress={handleDeleteLead}
            disabled={isManageUpdating}
            loading={isManageUpdating}
          />
          {manageError ? <ErrorCard message={manageError} onRetry={() => setManageError(null)} /> : null}
        </Card>
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
  manageCard: {
    margin: 16,
    gap: 10,
  },
  //meta: {
  //  opacity: 0.8,
  //},
});
