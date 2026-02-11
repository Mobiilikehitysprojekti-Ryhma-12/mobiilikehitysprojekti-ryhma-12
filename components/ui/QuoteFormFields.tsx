/**
 * QuoteFormFields -komponentti
 *
 * Tarkoitus:
 * - Näyttää kaikki lomakkeen syötekentät tarjouksen luomiseen
 * - Delegoi kentän muutokset parentille
 * - Näyttää validointivirheet
 *
 * Miksi erillinen komponentti:
 * - Erottaa lomakkeen UI logiikasta (validaatio, autosave)
 * - Helpottaa ylläpitoa ja testattavuutta
 * - Vähentää QuoteBuilderForm-komponentin kokoa
 */

import { ThemedText } from '@/components/themed-text';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { useThemeColor } from '@/hooks/use-theme-color';
import type { QuoteFormData } from '@/models/Quote';
import React from 'react';
import { StyleSheet, View } from 'react-native';

interface QuoteFormFieldsProps {
  formData: QuoteFormData;
  errors: Partial<QuoteFormData>;
  isSubmitting: boolean;
  onFieldChange: (field: keyof QuoteFormData, value: string) => void;
  onErrorClear: (field: keyof QuoteFormData) => void;
}

export function QuoteFormFields({
  formData,
  errors,
  isSubmitting,
  onFieldChange,
  onErrorClear,
}: QuoteFormFieldsProps) {
  const tintColor = useThemeColor({}, 'tint');

  return (
    <>
      {/* Viesti-kenttä (pakollinen) — minimipaketti edellyttää viestiä asiakkaalle */}
      <Card style={styles.card}>
        <ThemedText type="subtitle">Viesti asiakkaalle *</ThemedText>
        <Input
          placeholder="Esim: Kylpyhuoneen siivous sisältää lattian, seinien ja laitteiden puhdistuksen."
          value={formData.description}
          onChangeText={(text) => {
            onFieldChange('description', text);
            if (errors.description) {
              onErrorClear('description');
            }
          }}
          multiline
          numberOfLines={4}
          editable={!isSubmitting}
        />
        {errors.description ? (
          <ThemedText style={[styles.errorText, { color: tintColor }]}>
            {errors.description}
          </ThemedText>
        ) : null}
      </Card>

      {/* Hinta-kenttä — minimipaketti edellyttää hintaa */}
      <Card style={styles.card}>
        <ThemedText type="subtitle">Hinta *</ThemedText>
        <View style={styles.priceRow}>
          <Input
            placeholder="Esim: 1500"
            value={formData.price}
            onChangeText={(text) => {
              onFieldChange('price', text);
              if (errors.price) {
                onErrorClear('price');
              }
            }}
            keyboardType="decimal-pad"
            style={styles.priceInput}
            editable={!isSubmitting}
          />
          <View style={styles.currencyBadge}>
            <ThemedText>{formData.currency}</ThemedText>
          </View>
        </View>
        {errors.price ? (
          <ThemedText style={[styles.errorText, { color: tintColor }]}>
            {errors.price}
          </ThemedText>
        ) : null}
      </Card>

      {/* Arvioitu aloituspäivä-kenttä (pakollinen) — minimipaketti edellyttää aloituspäivää */}
      <Card style={styles.card}>
        <ThemedText type="subtitle">Arvioitu aloituspäivä *</ThemedText>
        <Input
          placeholder="Esim: 2026-02-15"
          value={formData.estimatedStartDate}
          onChangeText={(text) => {
            onFieldChange('estimatedStartDate', text);
            if (errors.estimatedStartDate) {
              onErrorClear('estimatedStartDate');
            }
          }}
          editable={!isSubmitting}
        />
        {errors.estimatedStartDate ? (
          <ThemedText style={[styles.errorText, { color: tintColor }]}>
            {errors.estimatedStartDate}
          </ThemedText>
        ) : null}
      </Card>

      {/* Tarjouksen voimassaoloaika-kenttä (valinnainen) */}
      <Card style={styles.card}>
        <ThemedText type="subtitle">Tarjouksen voimassaoloaika (päivinä)</ThemedText>
        <Input
          placeholder="Esim: 30"
          value={formData.quoteValidityDays}
          onChangeText={(text) => {
            onFieldChange('quoteValidityDays', text);
            if (errors.quoteValidityDays) {
              onErrorClear('quoteValidityDays');
            }
          }}
          keyboardType="number-pad"
          editable={!isSubmitting}
        />
        {errors.quoteValidityDays ? (
          <ThemedText style={[styles.errorText, { color: tintColor }]}>
            {errors.quoteValidityDays}
          </ThemedText>
        ) : null}
      </Card>

      {/* Lisäehdot-kenttä */}
      <Card style={styles.card}>
        <ThemedText type="subtitle">Lisäehdot / huomautukset</ThemedText>
        <Input
          placeholder="Esim: Sisältää asennuksen..."
          value={formData.notes}
          onChangeText={(text) => {
            onFieldChange('notes', text);
          }}
          multiline
          numberOfLines={3}
          editable={!isSubmitting}
        />
      </Card>
    </>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 14,
    gap: 8,
  },
  priceRow: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
  },
  priceInput: {
    flex: 1,
  },
  currencyBadge: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 4,
  },
});
