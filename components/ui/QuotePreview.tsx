/**
 * QuotePreview -komponentti
 *
 * Tarkoitus:
 * - Näyttää tarjouksen yhteenvedon ennen lopullista lähetystä
 * - Antaa käyttäjälle mahdollisuuden tarkistaa tiedot
 *
 * Miksi erillinen komponentti:
 * - Erottaa preview-UI lomakkeen logiikasta
 * - Helpottaa ylläpitoa ja testattavuutta
 * - Voidaan käyttää muuallakin (esim. tarjouksen detaljinäkymä)
 */

import { ThemedText } from '@/components/themed-text';
import { Card } from '@/components/ui/Card';
import type { QuoteFormData } from '@/models/Quote';
import React from 'react';
import { StyleSheet, View } from 'react-native';

interface QuotePreviewProps {
  formData: QuoteFormData;
}

export function QuotePreview({ formData }: QuotePreviewProps) {
  return (
    <>
      <Card style={styles.card}>
        <ThemedText type="title">Tarkista tarjous</ThemedText>
        <ThemedText style={styles.subtitle}>
          Varmista tiedot ennen lähettämistä
        </ThemedText>
      </Card>

      <Card style={[styles.card, styles.previewCard]}>
        <ThemedText type="subtitle" style={styles.previewTitle}>
          📋 Tarjouksen tiedot
        </ThemedText>

        <View style={styles.previewRow}>
          <ThemedText style={styles.previewLabel}>Viesti:</ThemedText>
          <ThemedText style={styles.previewValue}>{formData.description}</ThemedText>
        </View>

        <View style={styles.previewDivider} />

        <View style={styles.previewRow}>
          <ThemedText style={styles.previewLabel}>Hinta:</ThemedText>
          <ThemedText style={styles.previewValue}>
            {formData.price} {formData.currency}
          </ThemedText>
        </View>

        <View style={styles.previewDivider} />

        <View style={styles.previewRow}>
          <ThemedText style={styles.previewLabel}>Aloituspäivä:</ThemedText>
          <ThemedText style={styles.previewValue}>{formData.estimatedStartDate}</ThemedText>
        </View>

        {formData.quoteValidityDays.trim() && (
          <>
            <View style={styles.previewDivider} />
            <View style={styles.previewRow}>
              <ThemedText style={styles.previewLabel}>Voimassaoloaika:</ThemedText>
              <ThemedText style={styles.previewValue}>{formData.quoteValidityDays} päivää</ThemedText>
            </View>
          </>
        )}

        {formData.notes.trim() && (
          <>
            <View style={styles.previewDivider} />
            <View style={styles.previewRow}>
              <ThemedText style={styles.previewLabel}>Ehdot:</ThemedText>
              <ThemedText style={styles.previewValue}>{formData.notes}</ThemedText>
            </View>
          </>
        )}
      </Card>
    </>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 14,
    gap: 8,
  },
  subtitle: {
    opacity: 0.7,
    fontSize: 13,
  },
  previewCard: {
    backgroundColor: 'rgba(76, 175, 80, 0.05)',
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  previewTitle: {
    marginBottom: 12,
    fontWeight: '600',
  },
  previewRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: 8,
    gap: 12,
  },
  previewLabel: {
    fontWeight: '600',
    fontSize: 13,
    opacity: 0.8,
    flex: 0.35,
  },
  previewValue: {
    fontSize: 13,
    flex: 0.65,
    textAlign: 'right',
  },
  previewDivider: {
    height: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    marginVertical: 4,
  },
});
