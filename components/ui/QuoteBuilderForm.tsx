/**
 * QuoteBuilderForm -komponentti
 *
 * Tarkoitus:
 * - Orkestroi tarjouksen luomisen lomakkeen
 * - Validoi syötteen
 * - Autotallentaa luonnoksen AsyncStorageen (debounce)
 * - Hallinnoi edit/preview -tilat
 * - Delegoi varsinaisen tarjouksen luomisen parentille (screen / viewmodel)
 *
 * Miksi näin:
 * - Keskittyy logiikkaan (validaatio, autosave, state management)
 * - Delegoi UI-renderöinnin lapsikomponenteille (QuoteFormFields, QuotePreview)
 * - Helppo testata ja muokata ilman data-kerroksen logiikkaa
 * - Autosave parantaa käyttäjäkokemusta (varmuuskopio lomakkeen sisällöstä)
 */

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { QuoteFormFields } from '@/components/ui/QuoteFormFields';
import { QuotePreview } from '@/components/ui/QuotePreview';
import { useThemeColor } from '@/hooks/use-theme-color';
import type { QuoteFormData } from '@/models/Quote';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useRef, useState } from 'react';
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
  const [savedStatus, setSavedStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [showPreview, setShowPreview] = useState(false);
  
  const autoSaveTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const draftKeyRef = useRef<string>(`quoteDraft:${leadId}`);

  /**
   * Lataa luonnos AsyncStoragesta komponentin latautuessa.
   *
   * Miksi täällä:
   * - Käyttäjä voi palata keskeneräiseen tarjoukseen
   * - Vähennetään tiedon häviö
   */
  useEffect(() => {
    const loadDraft = async () => {
      try {
        const draftKey = draftKeyRef.current;
        const savedDraft = await AsyncStorage.getItem(draftKey);
        
        if (savedDraft) {
          const draftData = JSON.parse(savedDraft) as QuoteFormData;
          setFormData(draftData);
        }
      } catch (error) {
        console.error('QuoteBuilderForm: luonnoksen lataaminen epäonnistui', error);
      }
    };

    loadDraft();
  }, [leadId]);

  /**
   * Autotallentaa lomakkeen sisällön AsyncStorageen (debounce 1000ms).
   *
   * Miksi debounce:
   * - Vähennetään AsyncStorage -kirjoitusoperaatioita
   * - Parempi suorituskyky
   * - Käyttäjä näkee "tallennettu" -indikaation vain kerran kirjoitusta kohti
   */
  const autoSaveDraft = (data: QuoteFormData) => {
    // Peruuta edellinen timeout
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }

    // Aseta "tallentaa" -tila
    setSavedStatus('saving');

    // Aseta uusi timeout
    autoSaveTimeoutRef.current = setTimeout(async () => {
      try {
        const draftKey = draftKeyRef.current;
        await AsyncStorage.setItem(draftKey, JSON.stringify(data));
        setSavedStatus('saved');

        // Piiloita "tallennettu" -viesti 2 sekunnin jälkeen
        setTimeout(() => {
          setSavedStatus('idle');
        }, 2000);
      } catch (error) {
        console.error('QuoteBuilderForm: automaattinen tallennus epäonnistui', error);
        setSavedStatus('idle');
      }
    }, 1000);
  };

  /**
   * Poista autosave-timeout kun komponentti poistetaan.
   */
  useEffect(() => {
    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, []);

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

  /**
   * Tyhjentää tallennetun luonnoksen AsyncStoragesta ja resetoi lomakkeen alkuperäiseen tilaan.
   *
   */
  const clearDraft = async () => {
    try {
      await AsyncStorage.removeItem(draftKeyRef.current);
      setFormData({
        leadId,
        description: '',
        price: '',
        currency: 'EUR',
        quoteValidityDays: '30',
        estimatedStartDate: '',
        notes: '',
      });
      setErrors({});
      setSavedStatus('idle');
    } catch (error) {
      console.error('QuoteBuilderForm: luonnoksen tyhjentäminen epäonnistui', error);
    }
  };

  /**
   * Käsittelee yksittäisen kentän muutoksen ja laukaisee autosaven.
   */
  const handleFieldChange = (field: keyof QuoteFormData, value: string) => {
    const newData = { ...formData, [field]: value };
    setFormData(newData);
    autoSaveDraft(newData);
  };

  /**
   * Poistaa validointivirheen yksittäiseltä kentältä.
   */
  const handleErrorClear = (field: keyof QuoteFormData) => {
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  /**
   * Validoidaan lomake ja näytä preview-näkymä.
   * Käyttäjä voi tästä peruuttaa ja muokata, tai lähettää tarjouksen.
   */
  const handleSubmit = () => {
    if (!validateForm()) {
      return;
    }
    // Näytä preview-näkymä
    setShowPreview(true);
  };

  /**
   * Lähettää tarjouksen previewistä.
   * Kutsutaan vasta kun käyttäjä on vahvistanut yhteenvedon.
   */
  const handleConfirmSubmit = async () => {
    try {
      await onSubmit(formData);
      // Tyhjennä luonnos onnistuneen lähetyksen jälkeen
      await AsyncStorage.removeItem(draftKeyRef.current);
      setShowPreview(false);
    } catch (error) {
      console.error('QuoteBuilderForm: lomakkeen lähetys epäonnistui', error);
      setShowPreview(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      {!showPreview ? (
        // === EDITOINTIMUOTO ===
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
                onPress={clearDraft}
                disabled={isSubmitting}
                style={styles.clearDraftButton}
              />
            </View>
          </Card>

          {/* Lomakekentät */}
          <QuoteFormFields
            formData={formData}
            errors={errors}
            isSubmitting={isSubmitting}
            onFieldChange={handleFieldChange}
            onErrorClear={handleErrorClear}
          />

          {/* Toimintopainikkeet */}
          <Card style={[styles.card, styles.buttonRow]}>
            <Button
              title="Peruuta"
              onPress={onCancel}
              disabled={isSubmitting}
              style={styles.cancelButton}
            />
            <Button
              title={isSubmitting ? 'Tarkistetaan...' : 'Tallenna tarjous'}
              onPress={handleSubmit}
              disabled={isSubmitting}
              loading={isSubmitting}
            />
          </Card>
        </>
      ) : (
        // === PREVIEW-MUOTO ===
        <>
          <QuotePreview formData={formData} />

          {/* Preview-muodon painikkeet */}
          <Card style={[styles.card, styles.buttonRow]}>
            <Button
              title="Takaisin"
              onPress={() => setShowPreview(false)}
              disabled={isSubmitting}
              style={styles.cancelButton}
            />
            <Button
              title={isSubmitting ? 'Lähetetään...' : 'Lähetä tarjous'}
              onPress={handleConfirmSubmit}
              disabled={isSubmitting}
              loading={isSubmitting}
            />
          </Card>
        </>
      )}
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
  buttonRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 12,
  },
  cancelButton: {
    flex: 1,
    opacity: 0.6,
  },
  saveIndicator: {
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
    paddingVertical: 12,
  },
});