/**
 * Piilotetut tarjouspyynnöt -näkymä
 *
 * Reitti: /hidden
 *
 * Vastuut:
 * - Listaa piilotetut liidit (soft delete)
 * - Mahdollistaa palautuksen (unhide) tai pysyvän poiston (delete)
 *
 * Miksi tämä ruutu:
 * - Käyttäjä voi "siivota" Inboxia, mutta silti tarvittaessa palauttaa liidin.
 * - Pidetään Inbox yksinkertaisena: piilotetut eivät sekoitu normaaliin listaan.
 */

import { Stack, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { Alert, FlatList, Platform, StyleSheet, View } from 'react-native';

/**
 * Webissä Alert.alert ei toimi (React Native Web). Käytetään window.confirm.
 */
function confirmAction(title: string, message: string, onConfirm: () => void) {
  if (Platform.OS === 'web') {
    if (window.confirm(`${title}\n\n${message}`)) {
      onConfirm();
    }
  } else {
    Alert.alert(title, message, [
      { text: 'Peruuta', style: 'cancel' },
      { text: 'Vahvista', style: 'destructive', onPress: onConfirm },
    ]);
  }
}

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorCard } from '@/components/ui/ErrorCard';
import { InboxSkeleton } from '@/components/ui/InboxSkeleton';
import type { Lead } from '@/models/Lead';
import { removeLeadFromCachedList, upsertLeadInCachedList } from '@/services/leads/leadsCache';
import { useLeadsRepo } from '@/services/leads/RepoProvider';

type UiState =
  | { kind: 'loading' }
  | { kind: 'error'; message: string }
  | { kind: 'empty' }
  | { kind: 'ready'; items: Lead[] };

export default function HiddenLeadsScreen() {
  const router = useRouter();
  const repo = useLeadsRepo();

  const [state, setState] = useState<UiState>({ kind: 'loading' });
  const [isMutating, setIsMutating] = useState(false);

  const refresh = useCallback(async () => {
    setState({ kind: 'loading' });
    try {
      const items = await repo.listHiddenLeads();
      setState(items.length === 0 ? { kind: 'empty' } : { kind: 'ready', items });
    } catch (error: unknown) {
      console.error('HiddenLeads: listHiddenLeads epäonnistui', error);
      const message = error instanceof Error ? error.message : 'Tuntematon virhe';
      setState({ kind: 'error', message });
    }
  }, [repo]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const handleUnhide = useCallback(
    (lead: Lead) => {
      confirmAction(
        'Palauta tarjouspyyntö?',
        'Palautettu tarjouspyyntö näkyy taas Inboxissa.',
        async () => {
          setIsMutating(true);
          try {
            await repo.unhideLead(lead.id);
            await upsertLeadInCachedList({ ...lead, isHidden: false });
            await refresh();
          } catch (error: unknown) {
            console.error('HiddenLeads: unhideLead epäonnistui', error);
            const message = error instanceof Error ? error.message : 'Virhe palautuksessa';
            if (Platform.OS === 'web') {
              window.alert(`Virhe: ${message}`);
            } else {
              Alert.alert('Virhe', message);
            }
          } finally {
            setIsMutating(false);
          }
        }
      );
    },
    [refresh, repo]
  );

  const handleDelete = useCallback(
    (lead: Lead) => {
      confirmAction(
        'Poista pysyvästi?',
        'Tämä poistaa tarjouspyynnön tietokannasta. Toimintoa ei voi perua.',
        async () => {
          setIsMutating(true);
          try {
            await repo.deleteLead(lead.id);
            await removeLeadFromCachedList(lead.id);
            await refresh();
          } catch (error: unknown) {
            console.error('HiddenLeads: deleteLead epäonnistui', error);
            const message = error instanceof Error ? error.message : 'Virhe poistossa';
            if (Platform.OS === 'web') {
              window.alert(`Virhe: ${message}`);
            } else {
              Alert.alert('Virhe', message);
            }
          } finally {
            setIsMutating(false);
          }
        }
      );
    },
    [refresh, repo]
  );

  return (
    <>
      <Stack.Screen options={{ title: 'Piilotetut tarjouspyynnöt' }} />

      {state.kind === 'loading' ? (
        <InboxSkeleton rows={6} />
      ) : state.kind === 'error' ? (
        <ErrorCard message={state.message} onRetry={refresh} />
      ) : state.kind === 'empty' ? (
        <EmptyState
          title="Ei piilotettuja"
          subtitle="Et ole piilottanut yhtään tarjouspyyntöä."
          cta="Takaisin"
          onCta={() => router.back()}
        />
      ) : (
        <ThemedView style={styles.screen}>
          <FlatList
            data={state.items}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            renderItem={({ item }) => (
              <Card style={styles.itemCard}>
                <View style={styles.itemHeader}>
                  <ThemedText type="subtitle">{item.title}</ThemedText>
                  <ThemedText style={styles.muted}>{item.createdAt}</ThemedText>
                </View>

                <View style={styles.actions}>
                  <Button
                    title={isMutating ? 'Käsitellään...' : 'Palauta'}
                    disabled={isMutating}
                    loading={isMutating}
                    onPress={() => handleUnhide(item)}
                  />
                  <Button
                    title={isMutating ? 'Käsitellään...' : 'Poista'}
                    disabled={isMutating}
                    loading={isMutating}
                    onPress={() => handleDelete(item)}
                  />
                </View>
              </Card>
            )}
          />
        </ThemedView>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  listContent: {
    padding: 16,
    gap: 12,
    paddingBottom: 24,
  },
  itemCard: {
    gap: 10,
  },
  itemHeader: {
    gap: 4,
  },
  muted: {
    opacity: 0.7,
  },
  actions: {
    gap: 10,
  },
});
