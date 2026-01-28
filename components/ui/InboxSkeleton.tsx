/**
 * InboxSkeleton
 *
 * Yksinkertainen skeleton-lista lataustilaan.
 *
 * Huom:
 * - Käytetään teeman värejä (useThemeColor), ei kovakoodattuja "uusia" värejä.
 * - Tämä on tarkoituksella geneerinen, jotta sitä voi käyttää myös detail-näkymässä.
 */

import React from 'react';
import { StyleSheet, View } from 'react-native';

import { useThemeColor } from '@/hooks/use-theme-color';

export function InboxSkeleton({ rows = 6 }: { rows?: number }) {
  const borderColor = useThemeColor({}, 'icon');

  return (
    <View style={styles.wrap}>
      {Array.from({ length: rows }).map((_, index) => (
        <View
          key={`skeleton-row-${index}`}
          style={[styles.row, { borderColor }]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    padding: 16,
    gap: 12,
  },
  row: {
    height: 56,
    borderRadius: 12,
    borderWidth: 1,
    opacity: 0.35,
  },
});
