/**
 * QuoteActionsCard -komponentti
 *
 * Tarkoitus:
 * - Hallinnoi tarjoukseen liittyviä toimintoja (luo tarjous, tarkista tarjous)
 * - Näyttää tarjouksen tiedot kun ne on haettu
 * - Näyttää lataus- ja virhetilat
 *
 * Miksi erillinen komponentti:
 * - Erottaa tarjouksen toiminnot liidin tietojen näyttämisestä
 * - Keskittää tarjouksen tilan hallinnan yhteen paikkaan
 * - Helpottaa ylläpitoa ja testattavuutta
 */

import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { LeadStatusSelector } from '@/components/ui/LeadStatusSelector';
import { useThemeColor } from '@/hooks/use-theme-color';
import type { LeadStatus } from '@/models/Lead';
import type { Quote } from '@/models/Quote';
import { useQuotesRepo } from '@/services/quotes/QuoteProvider';
import React, { useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

interface QuoteActionsCardProps {
  leadId: string;
  onCreateQuote: () => void;
  leadStatus: LeadStatus;
  onStatusChange: (status: LeadStatus) => void;
  isStatusUpdating: boolean;
  statusUpdateError: string | null;
}

export function QuoteActionsCard({
  leadId,
  onCreateQuote,
  leadStatus,
  onStatusChange,
  isStatusUpdating,
  statusUpdateError,
}: QuoteActionsCardProps) {
  const quotesRepo = useQuotesRepo();
  const tintColor = useThemeColor({}, 'tint');
  const borderColor = useThemeColor({}, 'icon');

  const [checkQuoteLoading, setCheckQuoteLoading] = useState(false);
  const [checkQuoteError, setCheckQuoteError] = useState<string | null>(null);
  const [foundQuote, setFoundQuote] = useState<Quote | null>(null);
  const [showStatusSelector, setShowStatusSelector] = useState(false);

  const handleCheckQuote = async () => {
    setCheckQuoteLoading(true);
    setCheckQuoteError(null);
    setFoundQuote(null);

    try {
      const quote = await quotesRepo.getQuoteByLeadId(leadId);

      if (!quote) {
        setCheckQuoteError(
          'Tarjousta ei löytynyt tälle liidille. Luo tarjous painamalla "Luo tarjous".'
        );
      } else {
        setFoundQuote(quote);
        setCheckQuoteError(null);
      }
    } catch (error) {
      setCheckQuoteError('Virhe tarjouksen hakemisessa. Yritä uudelleen.');
      console.error('Error checking quote:', error);
    } finally {
      setCheckQuoteLoading(false);
    }
  };

  // Huom: sama nappi avaa ja sulkee sekä tarkistuksen tulokset että status-valinnan.
  const handleToggleCheck = () => {
    const isExpanded = showStatusSelector || foundQuote !== null || checkQuoteError !== null;

    if (isExpanded) {
      setShowStatusSelector(false);
      setFoundQuote(null);
      setCheckQuoteError(null);
      return;
    }

    setShowStatusSelector(true);
    void handleCheckQuote();
  };

  return (
    <Card style={styles.actionCard}>
      {/* Luo tarjous -painike */}
      <Button title="Luo tarjous" onPress={onCreateQuote} />

      {/* Tarkista tarjouksen status -painike */}
      <View style={styles.checkQuoteContainer}>
        <View style={styles.buttonWrapper}>
          <Button
            title={
              checkQuoteLoading
                ? ''
                : foundQuote
                ? 'Piilota tiedot'
                : 'Tarkista tarjouksen status'
            }
            onPress={handleToggleCheck}
            disabled={checkQuoteLoading}
          />
        </View>
        {checkQuoteLoading && (
          <ActivityIndicator
            size="small"
            color={tintColor}
            style={styles.loadingIndicator}
          />
        )}
      </View>

      {/* Virheviesti */}
      {checkQuoteError && (
        <View style={[styles.errorContainer, { backgroundColor: '#ffebee' }]}>
          <ThemedText style={{ color: '#c62828' }}>{checkQuoteError}</ThemedText>
        </View>
      )}

      {showStatusSelector && (
        <LeadStatusSelector
          value={leadStatus}
          onSelect={onStatusChange}
          isSaving={isStatusUpdating}
          errorMessage={statusUpdateError}
        />
      )}

      {/* Tarjouksen tiedot jos löytyi */}
      {foundQuote && (
        <Card style={[styles.quoteCard, { borderColor }]}>
          <ThemedText type="subtitle" style={styles.quoteTitle}>
            Tarjouksen tiedot
          </ThemedText>

          <View style={styles.quoteField}>
            <ThemedText style={styles.quoteLabel}>Kuvaus:</ThemedText>
            <ThemedText>{foundQuote.description}</ThemedText>
          </View>

          <View style={styles.quoteField}>
            <ThemedText style={styles.quoteLabel}>Hinta:</ThemedText>
            <ThemedText>
              {foundQuote.price} {foundQuote.currency}
            </ThemedText>
          </View>

          {foundQuote.estimatedStartDate && (
            <View style={styles.quoteField}>
              <ThemedText style={styles.quoteLabel}>Arvioitu aloituspäivä:</ThemedText>
              <ThemedText>{foundQuote.estimatedStartDate}</ThemedText>
            </View>
          )}

          {foundQuote.quoteValidityDays && (
            <View style={styles.quoteField}>
              <ThemedText style={styles.quoteLabel}>Tarjouksen voimassaolo:</ThemedText>
              <ThemedText>{foundQuote.quoteValidityDays} päivää</ThemedText>
            </View>
          )}

          {foundQuote.notes && (
            <View style={styles.quoteField}>
              <ThemedText style={styles.quoteLabel}>Muistiinpanot:</ThemedText>
              <ThemedText>{foundQuote.notes}</ThemedText>
            </View>
          )}

          <View style={styles.quoteField}>
            <ThemedText style={styles.quoteLabel}>Luotu:</ThemedText>
            <ThemedText>{foundQuote.createdAt}</ThemedText>
          </View>
        </Card>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  actionCard: {
    padding: 14,
    gap: 10,
    marginTop: 8,
  },
  checkQuoteContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  buttonWrapper: {
    flex: 1,
  },
  loadingIndicator: {
    position: 'absolute',
    alignSelf: 'center',
  },
  errorContainer: {
    padding: 12,
    borderRadius: 8,
    marginTop: 4,
  },
  quoteCard: {
    padding: 14,
    borderWidth: 1,
    gap: 10,
    marginTop: 4,
  },
  quoteTitle: {
    marginBottom: 8,
  },
  quoteField: {
    gap: 4,
  },
  quoteLabel: {
    fontWeight: '600',
    opacity: 0.8,
  },
});
