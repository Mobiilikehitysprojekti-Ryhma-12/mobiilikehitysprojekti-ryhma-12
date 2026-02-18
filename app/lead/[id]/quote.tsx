/**
 * Quote Builder -näkymä.
 *
 * Reitti: /lead/[leadId]/quote
 *
 * Vastuut:
 * - Näyttää tarjouksen luomisen lomakkeen
 * - Validoi käyttäjän syöte
 * - Tarjoaa loading / error / success -tilat
 * - Kutsuu repo.createQuote() tarjouksen tallentamiseen
 *
 * Miksi näin:
 * - Lead detailin yhteydessä voidaan heti luoda tarjous
 * - Datalähde on vaihdettavissa QuoteProvider:in kautta ilman UI-muutoksia
 * - Tarjouksen luominen päivittää liidin statuksen automaattisesti
 */

import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, Linking, ScrollView, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Button, Card, ErrorCard, QuoteBuilderForm } from '@/components/ui';
import type { Lead } from '@/models/Lead';
import type { QuoteFormData } from '@/models/Quote';
import { businessEmail, businessName, businessPhone } from '@/services/config';
import { useLeadsRepo } from '@/services/leads/RepoProvider';
import { useQuotesRepo } from '@/services/quotes/QuoteProvider';
import { buildMailtoUrl, buildQuoteEmailMessage } from '@/utils/buildQuoteEmailMessage';

export default function QuoteBuilderScreen() {
  const { id: leadId, leadTitle } = useLocalSearchParams<{ id?: string; leadTitle?: string }>();
  const router = useRouter();
  const leadsRepo = useLeadsRepo();
  const quotesRepo = useQuotesRepo();

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [lead, setLead] = useState<Lead | null>(null);
  const [isLeadLoading, setIsLeadLoading] = useState<boolean>(true);
  const [leadError, setLeadError] = useState<string | null>(null);

  const resolvedLeadTitle = useMemo(() => {
    // Miksi fallback:
    // - Reitti voi tulla deep linkistä ilman leadTitle-parametria.
    // - Haettu lead antaa luotettavamman otsikon sähköpostin aiheeseen.
    return lead?.title || leadTitle || '';
  }, [lead?.title, leadTitle]);

  const loadLead = useCallback(async () => {
    if (!leadId) {
      setIsLeadLoading(false);
      setLeadError('Virheellinen liidi-id');
      return;
    }

    setIsLeadLoading(true);
    setLeadError(null);

    try {
      const found = await leadsRepo.getLeadById(leadId);
      if (!found) {
        setLead(null);
        setLeadError('Liidiä ei löytynyt');
        return;
      }
      setLead(found);
    } catch (error: unknown) {
      console.error('QuoteBuilder: liidin haku epäonnistui', error);
      const message = error instanceof Error ? error.message : 'Tuntematon virhe';
      setLeadError(message);
    } finally {
      setIsLeadLoading(false);
    }
  }, [leadId, leadsRepo]);

  useEffect(() => {
    // Miksi haetaan tässä:
    // - Tarjous tarvitsee asiakkaan yhteystiedot (email/puhelin) vastaukseen.
    // - Näkymän pitää toimia myös, vaikka tänne tullaan ilman kaikkia route-parametreja.
    loadLead();
  }, [loadLead]);

  const handleEmailReply = useCallback(async () => {
    const email = lead?.customerEmail;
    if (!email) return;

    try {
      const customerName = lead?.customerName || 'asiakas';
      const title = resolvedLeadTitle || 'tarjous';

      // Miksi lyhyt viestipohja:
      // - Demo- ja P0-käyttö: käyttäjä pääsee nopeasti vastaamaan, mutta voi muokata vapaasti.
      const subject = `Tarjous: ${title}`;
      const body = `Hei ${customerName},\n\nKiitos yhteydenotosta. Tässä tarjous liidistä "${title}".\n\nYstävällisin terveisin,\n${businessName}`;

      // P0: käytetään mailto:-linkkiä, jotta toteutus ei vaadi erillistä natiivia composer-moduulia.
      // Huom: URL-enkoodaus on tärkeä, jotta rivinvaihdot ja erikoismerkit eivät riko linkkiä.
      const mailtoUrl = `mailto:${encodeURIComponent(email)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      const canOpen = await Linking.canOpenURL(mailtoUrl);
      if (!canOpen) {
        Alert.alert('Sähköposti ei käytettävissä', 'Laitteessa ei ole käytettävää sähköpostisovellusta.');
        return;
      }
      await Linking.openURL(mailtoUrl);
    } catch (error: unknown) {
      console.error('QuoteBuilder: mailto-linkin avaus epäonnistui', error);
      Alert.alert('Virhe', 'Sähköpostin avaaminen epäonnistui.');
    }
  }, [lead?.customerEmail, lead?.customerName, resolvedLeadTitle]);

  const handleCall = useCallback(async () => {
    const phone = lead?.customerPhone;
    if (!phone) return;

    const url = `tel:${phone}`;
    try {
      const canOpen = await Linking.canOpenURL(url);
      if (!canOpen) {
        Alert.alert('Soitto ei käytettävissä', 'Laitteessa ei voi avata soittoa.');
        return;
      }
      await Linking.openURL(url);
    } catch (error: unknown) {
      console.error('QuoteBuilder: tel-linkin avaus epäonnistui', error);
      Alert.alert('Virhe', 'Puhelun aloittaminen epäonnistui.');
    }
  }, [lead?.customerPhone]);

  const handleSubmit = async (formData: QuoteFormData) => {
    // Guard: jos lead-id puuttuu, ei jatketa
    if (!leadId) {
      setErrorMessage('Virheellinen liidi-id');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      // Luo tarjous repositoion kautta
      // - Tallentaa tarjouksen paikallisesti/API:ssa
      // - Päivittää liidin statuksen 'quoted':ksi
      const newQuote = await quotesRepo.createQuote(formData);
      
      console.log('Tarjous luotiin:', newQuote);

      // P0: avataan valmiiksi täytetty sähköpostiluonnos käyttäjän oletus-sähköpostiohjelmassa.
      // Huom: tämä ei lähetä viestiä automaattisesti, vaan käyttäjä vahvistaa lähetyksen sähköpostisovelluksessa.
      const email = lead?.customerEmail;
      if (email) {
        try {
          const { subject, body } = buildQuoteEmailMessage({
            customerName: lead?.customerName,
            leadTitle: resolvedLeadTitle,
            businessName,
            businessPhone,
            businessEmail,
            formData,
            createdQuote: { id: newQuote.id, createdAt: newQuote.createdAt },
          });

          const mailtoUrl = buildMailtoUrl({ toEmail: email, subject, body });
          const canOpen = await Linking.canOpenURL(mailtoUrl);
          if (!canOpen) {
            Alert.alert(
              'Sähköposti ei käytettävissä',
              'Laitteessa ei ole käytettävää sähköpostisovellusta, joten viestiä ei voitu avata.'
            );
          } else {
            await Linking.openURL(mailtoUrl);
          }
        } catch (error: unknown) {
          console.error('QuoteBuilder: sähköpostiluonnoksen avaus epäonnistui', error);
          Alert.alert('Virhe', 'Sähköpostiluonnoksen avaaminen epäonnistui.');
        }
      } else {
        Alert.alert(
          'Sähköposti puuttuu',
          'Asiakkaalle ei ole tallennettu sähköpostiosoitetta, joten sähköpostiluonnosta ei voitu avata.'
        );
      }

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
          {isLeadLoading ? (
            <Card style={styles.card}>
              <ThemedText style={styles.cardTitle}>Asiakkaan yhteystiedot</ThemedText>
              <ThemedView style={styles.loadingRow}>
                <ActivityIndicator />
                <ThemedText>Ladataan liidiä...</ThemedText>
              </ThemedView>
            </Card>
          ) : leadError ? (
            <ErrorCard message={leadError} onRetry={loadLead} />
          ) : (
            <Card style={styles.card}>
              <ThemedText style={styles.cardTitle}>Asiakkaan yhteystiedot</ThemedText>

              <ThemedView style={styles.contactRow}>
                <ThemedText style={styles.label}>Nimi</ThemedText>
                <ThemedText>{lead?.customerName || '-'}</ThemedText>
              </ThemedView>

              <ThemedView style={styles.contactRow}>
                <ThemedText style={styles.label}>Sähköposti</ThemedText>
                <ThemedText>{lead?.customerEmail || '-'}</ThemedText>
              </ThemedView>

              <ThemedView style={styles.contactRow}>
                <ThemedText style={styles.label}>Puhelin</ThemedText>
                <ThemedText>{lead?.customerPhone || '-'}</ThemedText>
              </ThemedView>

              <ThemedView style={styles.actionsRow}>
                <Button
                  title="Vastaa sähköpostilla"
                  onPress={handleEmailReply}
                  disabled={!lead?.customerEmail}
                  style={styles.actionButton}
                />
                <Button
                  title="Soita"
                  onPress={handleCall}
                  disabled={!lead?.customerPhone}
                  style={styles.actionButton}
                />
              </ThemedView>
            </Card>
          )}

          <QuoteBuilderForm
            leadId={leadId || ''}
            leadTitle={resolvedLeadTitle}
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
  card: {
    padding: 14,
    gap: 10,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  label: {
    opacity: 0.7,
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  contactRow: {
    gap: 4,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 6,
  },
  actionButton: {
    flex: 1,
  },
});
