/**
 * QuoteBuilderForm -komponentti
 *
 * Tarkoitus:
 * - Näyttää lomakkeen tarjouksen luomiseen (kuvaus, hinta, ehdot jne.)
 * - Validoi syötteen
 * - Delegoi varsinaisen tarjouksen luomisen parentille (screen / viewmodel)
 *
 * Miksi näin:
 * - Erottaa UI-renderöinnin datavirasta ja virheenkäsittelystä
 * - Voidaan uudelleenkäyttää eri yhteyksissä
 * - Helppo testata ja muokata ilman data-kerroksen logiikkaa
 */

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { useThemeColor } from '@/hooks/use-theme-color';
import type { QuoteFormData } from '@/models/Quote';
import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';

/**
 * Props QuoteBuilderForm-komponentille
 */
interface QuoteBuilderFormProps {
  /** Liittyvän liidin ID */
  leadId: string;
  /** Liittyvän liidin nimi/otsikko */
  leadTitle: string;
  /** Onko tarjous luodaan (disable painikkeet) */
  isSubmitting: boolean;
  /** Callback: kutsutaan kun käyttäjä klikkaa "Tallenna tarjous" */
  onSubmit: (formData: QuoteFormData) => Promise<void>;
  /** Callback: kutsutaan kun käyttäjä peruuttaa */
  onCancel: () => void;
}

export function QuoteBuilderForm({
  leadId,
  leadTitle,
  isSubmitting,
  onSubmit,
  onCancel,
}: QuoteBuilderFormProps) {
  const tintColor = useThemeColor({}, 'tint');

  // Lomakkeen tila
  const [formData, setFormData] = useState<QuoteFormData>({
    leadId,
    description: '',
    price: '',
    currency: 'EUR',
    quoteValidityDays: '30',
    estimatedStartDate: '',
    notes: '',
  });

  const [errors, setErrors] = useState<Partial<QuoteFormData>>({});

  /**
   * Validoidaan lomakkeen tiedot ennen lähettämistä.
   *
   * Minimipaketti vaatii:
   * - Viesti (kuvaus) asiakkaalle
   * - Hinta
   * - Arvioitu aloituspäivä
   *
   * Valinnainen:
   * - Tarjouksen voimassaoloaika
   *
   * Miksi validaatio täällä:
   * - Voidaan antaa välitöntä feedback käyttäjälle
   * - Vältetään epäkelpon datan lähetys backendiin
   */
  const validateForm = (): boolean => {
    const newErrors: Partial<QuoteFormData> = {};

    if (!formData.description.trim()) {
      newErrors.description = 'Viesti on pakollinen';
    }

    if (!formData.price.trim()) {
      newErrors.price = 'Hinta on pakollinen';
    } else if (isNaN(Number(formData.price))) {
      newErrors.price = 'Hinta täytyy olla numero';
    }

    if (!formData.estimatedStartDate.trim()) {
      newErrors.estimatedStartDate = 'Aloituspäivä on pakollinen';
    }

    // Validoidaan voimassaoloaika jos se on annettu
    if (formData.quoteValidityDays.trim() && isNaN(Number(formData.quoteValidityDays))) {
      newErrors.quoteValidityDays = 'Päivät täytyy olla numero';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      await onSubmit(formData);
    } catch (error) {
      console.error('QuoteBuilderForm: lomakkeen lähetys epäonnistui', error);
    }
  };

  return (
    <ThemedView style={styles.container}>
      {/* Otsikko */}
      <Card style={styles.card}>
        <ThemedText type="title">Uusi tarjous</ThemedText>
        <ThemedText style={styles.subtitle}>
          Luo tarjous liidille {leadTitle || leadId}
        </ThemedText>
      </Card>

      {/* Viesti-kenttä (pakollinen) — minimipaketti edellyttää viestiä asiakkaalle */}
      <Card style={styles.card}>
        <ThemedText type="subtitle">Viesti asiakkaalle *</ThemedText>
        <Input
          placeholder="Esim: Kylpyhuoneen siivous sisältää lattian, seinien ja laitteiden puhdistuksen."
          value={formData.description}
          onChangeText={(text) => {
            setFormData({ ...formData, description: text });
            if (errors.description) {
              setErrors({ ...errors, description: undefined });
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
              setFormData({ ...formData, price: text });
              if (errors.price) {
                setErrors({ ...errors, price: undefined });
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
            setFormData({ ...formData, estimatedStartDate: text });
            if (errors.estimatedStartDate) {
              setErrors({ ...errors, estimatedStartDate: undefined });
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
            setFormData({ ...formData, quoteValidityDays: text });
            if (errors.quoteValidityDays) {
              setErrors({ ...errors, quoteValidityDays: undefined });
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
          onChangeText={(text) => setFormData({ ...formData, notes: text })}
          multiline
          numberOfLines={3}
          editable={!isSubmitting}
        />
      </Card>

      {/* Toimintopainikkeet */}
      <Card style={[styles.card, styles.buttonRow]}>
        <Button
          title="Peruuta"
          onPress={onCancel}
          disabled={isSubmitting}
          style={styles.cancelButton}
        />
        <Button
          title={isSubmitting ? 'Luodaan...' : 'Tallenna tarjous'}
          onPress={handleSubmit}
          disabled={isSubmitting}
          loading={isSubmitting}
        />
      </Card>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: 12,
  },
  card: {
    padding: 14,
    gap: 8,
  },
  subtitle: {
    opacity: 0.7,
    fontSize: 13,
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
  buttonRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 12,
  },
  cancelButton: {
    flex: 1,
    opacity: 0.6,
  },
});