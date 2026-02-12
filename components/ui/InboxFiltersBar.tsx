/**
 * InboxFiltersBar — Suodatuspalkin komponentti
 * 
 * Tarkoitus:
 * - Näyttää statukseen perustuvat suodatinpainikkeet
 * - Hallinnoi aktiivista suodatinta
 * 
 * Käyttö:
 * - <InboxFiltersBar activeStatus="all" onStatusChange={(s) => {}} />
 */

import React from 'react';
import { ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useThemeColor } from '../../hooks/use-theme-color';
import { ThemedText } from '../themed-text';

export interface InboxFiltersBarProps {
  activeStatus: string;
  onStatusChange: (status: string) => void;
}

const STATUS_FILTERS = [
  { label: 'Kaikki', value: 'all' },
  { label: 'Uudet', value: 'new' },
  { label: 'Tarjotut', value: 'quoted' },
];

/**
 * InboxFiltersBar komponentti
 * Näyttää suodatinpainikkeet muuttaville liideille
 */
export function InboxFiltersBar({
  activeStatus,
  onStatusChange,
}: InboxFiltersBarProps) {
  const tintColor = useThemeColor({}, 'tint');
  const textColor = useThemeColor({}, 'text');

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.container}
    >
      {STATUS_FILTERS.map((filter) => (
        <TouchableOpacity
          key={filter.value}
          style={[
            styles.button,
            activeStatus === filter.value && {
              borderBottomColor: tintColor,
              borderBottomWidth: 2,
            },
          ]}
          onPress={() => onStatusChange(filter.value)}
        >
          <ThemedText
            style={[
              {
                color:
                  activeStatus === filter.value ? tintColor : textColor,
              },
            ]}
          >
            {filter.label}
          </ThemedText>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  button: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 12,
  },
});
