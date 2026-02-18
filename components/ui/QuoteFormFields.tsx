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
import { Radii, Spacing } from '@/constants/theme';
import { useThemeColor } from '@/hooks/use-theme-color';
import type { QuoteFormData } from '@/models/Quote';
import React from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';
import { Calendar } from 'react-native-calendars';

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
  const textColor = useThemeColor({}, 'text');
  const backgroundColor = useThemeColor({}, 'background');
  const iconColor = useThemeColor({}, 'icon');
  const [isDatePickerOpen, setIsDatePickerOpen] = React.useState(false);

  const openDatePicker = () => {
    if (isSubmitting) return;
    setIsDatePickerOpen(true);
  };

  const closeDatePicker = () => {
    setIsDatePickerOpen(false);
  };

  const handleDateSelected = (dateString: string) => {
    // react-native-calendars antaa muodon YYYY-MM-DD, joka sopii suoraan meidän lomakkeen kenttään.
    onFieldChange('estimatedStartDate', dateString);
    if (errors.estimatedStartDate) {
      onErrorClear('estimatedStartDate');
    }
    closeDatePicker();
  };

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
        {/*
          Kalenteri-widget (P0 UX):
          - Natiivissa (iOS/Android) ja webissä avataan modal, jossa on kalenteri.
          - Webissä Inputin voi myös halutessaan kirjoittaa (fallback), mutta painamalla avautuu kalenteri.
        */}
        <Pressable onPress={openDatePicker} disabled={isSubmitting}>
          {/*
            Huom: pointerEvents="none" tekee Inputista "vain näyttö" -kentän.
            Näin painallus osuu Pressableen ja avaa kalenterin.
          */}
          <View pointerEvents="none">
            <Input
              placeholder="Valitse päivä kalenterista (YYYY-MM-DD)"
              value={formData.estimatedStartDate}
              onChangeText={() => {
                // Ei käytössä: päivämäärä valitaan kalenterista.
              }}
              editable={false}
            />
          </View>
        </Pressable>
        {errors.estimatedStartDate ? (
          <ThemedText style={[styles.errorText, { color: tintColor }]}>
            {errors.estimatedStartDate}
          </ThemedText>
        ) : null}
      </Card>

      {/*
        Modal-kalenteri:
        - Pidetään UI yksinkertaisena ja demo-varmana.
        - Ei lisätä uusia värejä: käytetään theme tintColor valittuun päivään.
      */}
      <Modal
        visible={isDatePickerOpen}
        animationType="slide"
        transparent
        onRequestClose={closeDatePicker}
      >
        <Pressable style={styles.modalRoot} onPress={closeDatePicker}>
          {/*
            Backdrop erillisenä elementtinä:
            - opacity ei vaikuta modalin sisältöön
            - väri tulee teemasta (ei kovakoodattuja värejä)
          */}
          <View style={[styles.backdrop, { backgroundColor: textColor, opacity: 0.35 }]} />

          <Pressable style={styles.modalSheet} onPress={() => {}}>
            <Card style={styles.modalCard}>
              <ThemedText type="subtitle">Valitse aloituspäivä</ThemedText>
              <Calendar
                markedDates={
                  formData.estimatedStartDate
                    ? {
                        [formData.estimatedStartDate]: {
                          selected: true,
                          selectedColor: tintColor,
                          selectedTextColor: backgroundColor,
                        },
                      }
                    : undefined
                }
                onDayPress={(day) => handleDateSelected(day.dateString)}
                firstDay={1}
                theme={{
                  calendarBackground: backgroundColor,
                  dayTextColor: textColor,
                  monthTextColor: textColor,
                  textSectionTitleColor: iconColor,
                  todayTextColor: tintColor,
                  selectedDayBackgroundColor: tintColor,
                  selectedDayTextColor: backgroundColor,
                  arrowColor: tintColor,
                }}
                style={styles.calendar}
              />
            </Card>
          </Pressable>
        </Pressable>
      </Modal>

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
  modalRoot: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  modalSheet: {
    padding: Spacing.md,
  },
  modalCard: {
    gap: 12,
    borderRadius: Radii.md,
  },
  calendar: {
    borderRadius: Radii.md,
    overflow: 'hidden',
  },
});
