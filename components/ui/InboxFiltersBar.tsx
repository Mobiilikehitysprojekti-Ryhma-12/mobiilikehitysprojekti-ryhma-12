/**
 * InboxFiltersBar
 *
 * Inboxin haku + statusfiltteri yhdessä palkissa.
 *
 * Tärkeä periaate:
 * - Tämä on presentational component: ei tee datahakuja.
 * - Käyttää vain propsit ja kutsuu callbackit.
 */

import React from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';
import type { LeadStatus } from '@/models/Lead';

type StatusOption = 'all' | LeadStatus;

const statusOptions: { key: StatusOption; label: string }[] = [
  { key: 'all', label: 'Kaikki' },
  { key: 'new', label: 'Uusi' },
  { key: 'quoted', label: 'Tarjottu' },
  { key: 'accepted', label: 'Hyväksytty' },
  { key: 'rejected', label: 'Hylätty' },
];

export function InboxFiltersBar({
  query,
  status,
  onQueryChange,
  onStatusChange,
}: {
  query: string;
  status: StatusOption;
  onQueryChange: (value: string) => void;
  onStatusChange: (value: StatusOption) => void;
}) {
  const textColor = useThemeColor({}, 'text');
  const borderColor = useThemeColor({}, 'icon');
  const tintColor = useThemeColor({}, 'tint');

  return (
    <View style={styles.wrap}>
      <TextInput
        value={query}
        onChangeText={onQueryChange}
        placeholder="Hae otsikosta…"
        placeholderTextColor={borderColor}
        style={[styles.input, { color: textColor, borderColor }]}
      />

      <View style={styles.row}>
        {statusOptions.map((option) => {
          const active = option.key === status;

          return (
            <Pressable
              key={option.key}
              accessibilityRole="button"
              onPress={() => onStatusChange(option.key)}
              style={[
                styles.chip,
                { borderColor: active ? tintColor : borderColor },
                active ? styles.chipActive : null,
              ]}
            >
              <ThemedText style={{ color: active ? tintColor : undefined }}>{option.label}</ThemedText>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    padding: 16,
    gap: 12,
  },
  input: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
  },
  chipActive: {
    opacity: 0.95,
  },
});
