/**
 * LeadStatusSelector -komponentti
 *
 * Tarkoitus:
 * - Tarjoaa yksinkertaisen UI:n liidin statuksen vaihtamiseen
 * - Näyttää nykyisen statuksen sekä valittavat vaihtoehdot
 * - Näyttää tallennuksen tilan ja mahdollisen virheviestin
 *
 * Miksi erillinen komponentti:
 * - Statuspäivitys pysyy selkeänä ja uudelleenkäytettävänä osana
 * - LeadDetailView pysyy ohuena ja keskittyy näkymän koostamiseen
 */

import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Card } from '@/components/ui/Card';
import { useThemeColor } from '@/hooks/use-theme-color';
import type { LeadStatus } from '@/models/Lead';
import { leadStatusLabel } from '@/models/Lead';

const STATUS_OPTIONS: LeadStatus[] = ['quoted', 'accepted', 'rejected'];

interface LeadStatusSelectorProps {
  value: LeadStatus;
  onSelect: (status: LeadStatus) => void;
  disabled?: boolean;
  isSaving?: boolean;
  errorMessage?: string | null;
}

/**
 * LeadStatusSelector
 *
 * @param value - Nykyinen liidin status
 * @param onSelect - Kutsutaan, kun käyttäjä valitsee uuden statuksen
 * @param disabled - Estää valinnat (esim. kun dataa ladataan)
 * @param isSaving - Näyttää tallennuksen tilan
 * @param errorMessage - Näytetään käyttäjälle, jos päivitys epäonnistuu
 */
export function LeadStatusSelector({
  value,
  onSelect,
  disabled,
  isSaving,
  errorMessage,
}: LeadStatusSelectorProps) {
  const tintColor = useThemeColor({}, 'tint');
  const borderColor = useThemeColor({}, 'icon');

  return (
    <Card style={styles.card}>
      <View style={styles.headerRow}>
        <ThemedText type="subtitle">Status</ThemedText>
        {isSaving ? <ActivityIndicator size="small" color={tintColor} /> : null}
      </View>

      <ThemedText style={styles.currentText}>
        Nykyinen: {leadStatusLabel(value)}
      </ThemedText>

      <View style={styles.optionsRow}>
        {STATUS_OPTIONS.map((status) => {
          const isSelected = value === status;
          return (
            <Pressable
              key={status}
              accessibilityRole="button"
              accessibilityState={{ selected: isSelected, disabled: disabled || isSaving }}
              onPress={() => (isSelected || disabled || isSaving ? null : onSelect(status))}
              style={({ pressed }) => [
                styles.option,
                { borderColor: isSelected ? tintColor : borderColor },
                pressed && !(disabled || isSaving) ? styles.optionPressed : null,
                isSelected ? styles.optionSelected : null,
                disabled || isSaving ? styles.optionDisabled : null,
              ]}
            >
              <ThemedText style={{ color: isSelected ? tintColor : undefined }}>
                {leadStatusLabel(status)}
              </ThemedText>
            </Pressable>
          );
        })}
      </View>

      {errorMessage ? (
        <View style={styles.errorContainer}>
          <ThemedText style={styles.errorText}>{errorMessage}</ThemedText>
        </View>
      ) : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 14,
    gap: 10,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  currentText: {
    opacity: 0.8,
  },
  optionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  option: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 999,
    borderWidth: 1,
  },
  optionSelected: {
    borderWidth: 2,
  },
  optionPressed: {
    opacity: 0.85,
  },
  optionDisabled: {
    opacity: 0.55,
  },
  errorContainer: {
    padding: 10,
    borderRadius: 8,
    backgroundColor: '#ffebee',
  },
  errorText: {
    color: '#c62828',
  },
});
