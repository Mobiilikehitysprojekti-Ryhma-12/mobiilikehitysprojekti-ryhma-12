/**
 * QuoteFormHeader -komponentti
 *
 * Tarkoitus:
 * - Näyttää lomakkeen otsikon ja alaotsikon
 * - Tarjoaa "Tyhjennä luonnos" -painikkeen
 * - Näyttää autosave-indikaattorin
 *
 * Miksi erillinen komponentti:
 * - Erottaa otsikko-UI lomakkeen logiikasta
 * - Helpottaa ylläpitoa
 * - Voidaan uudelleenkäyttää muissa lomakkeissa
 */

import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import React from 'react';
import { StyleSheet, View } from 'react-native';

interface QuoteFormHeaderProps {
  leadTitle: string;
  leadId: string;
  savedStatus: 'idle' | 'saving' | 'saved';
  onClearDraft: () => void;
  isSubmitting: boolean;
}

export function QuoteFormHeader({
  leadTitle,
  leadId,
  savedStatus,
  onClearDraft,
  isSubmitting,
}: QuoteFormHeaderProps) {
  return (
    <>
      {/* Autosave-indikaattori */}
      {savedStatus !== 'idle' && (
        <Card style={[styles.card, styles.saveIndicator]}>
          <ThemedText style={{ fontSize: 12, opacity: 0.8 }}>
            {savedStatus === 'saving' ? '💾 Tallennetaan...' : '✓ Luonnos tallennettu'}
          </ThemedText>
        </Card>
      )}

      {/* Otsikko */}
      <Card style={styles.card}>
        <View style={styles.headerRow}>
          <View style={{ flex: 1 }}>
            <ThemedText type="title">Uusi tarjous</ThemedText>
            <ThemedText style={styles.subtitle}>
              Luo tarjous liidille {leadTitle || leadId}
            </ThemedText>
          </View>
          <Button
            title="Tyhjennä"
            onPress={onClearDraft}
            disabled={isSubmitting}
            style={styles.clearDraftButton}
          />
        </View>
      </Card>
    </>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 14,
    gap: 8,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
  },
  clearDraftButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    opacity: 0.7,
  },
  subtitle: {
    opacity: 0.7,
    fontSize: 13,
  },
  saveIndicator: {
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
    paddingVertical: 12,
  },
});
