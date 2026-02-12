/**
 * QuoteBuilderForm -komponentti
 *
 * Tarkoitus:
 * - Orkestroi tarjouksen luomisen lomakkeen
 * - Hallinnoi edit/preview -tilat
 * - Delegoi validoinnin, autosaven ja UI-renderöinnin erikoistuneille komponenteille/hookeille
 *
 * Miksi näin:
 * - Keskittyy koordinointiin ja tilanhallintaan
 * - Delegoi yksityiskohdat lapsikomponenteille ja hookeille
 * - Helppo testata ja muokata
 */

import React, { useState } from 'react';
import { StyleSheet } from 'react-native';
import { useQuoteDraft } from '../../hooks/useQuoteDraft';
import type { QuoteFormData } from '../../models/Quote';
import { validateQuoteForm } from '../../utils/validateQuoteForm';
import { ThemedView } from '../themed-view';
import { Button } from './Button';
import { Card } from './Card';
import { QuoteFormFields } from './QuoteFormFields';
import { QuoteFormHeader } from './QuoteFormHeader';
import { QuotePreview } from './QuotePreview';

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
  // Lomakkeen alkutila
  const initialFormData: QuoteFormData = {
    leadId,
    description: '',
    price: '',
    currency: 'EUR',
    quoteValidityDays: '30',
    estimatedStartDate: '',
    notes: '',
  };

  // Draft-hallinta hookilla
  const { formData, setFormData, savedStatus, autoSave, clearDraft, removeDraft } =
    useQuoteDraft({
      leadId,
      initialFormData,
    });

  // Lomakkeen state
  const [errors, setErrors] = useState<Partial<QuoteFormData>>({});
  const [showPreview, setShowPreview] = useState(false);

  /**
   * Käsittelee yksittäisen kentän muutoksen ja laukaisee autosaven.
   */
  const handleFieldChange = (field: keyof QuoteFormData, value: string) => {
    const newData = { ...formData, [field]: value };
    setFormData(newData);
    autoSave(newData);
  };

  /**
   * Poistaa validointivirheen yksittäiseltä kentältä.
   */
  const handleErrorClear = (field: keyof QuoteFormData) => {
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  /**
   * Validoidaan lomake ja näytetään preview-näkymä.
   */
  const handleSubmit = () => {
    const validationErrors = validateQuoteForm(formData);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length === 0) {
      setShowPreview(true);
    }
  };

  /**
   * Lähettää tarjouksen previewistä.
   */
  const handleConfirmSubmit = async () => {
    try {
      await onSubmit(formData);
      await removeDraft();
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
          <QuoteFormHeader
            leadTitle={leadTitle}
            leadId={leadId}
            savedStatus={savedStatus}
            onClearDraft={clearDraft}
            isSubmitting={isSubmitting}
          />

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
