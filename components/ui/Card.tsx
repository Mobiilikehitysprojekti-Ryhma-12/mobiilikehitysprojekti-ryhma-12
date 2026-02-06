import React from 'react';
import { StyleSheet, type StyleProp, type ViewStyle } from 'react-native';

import { ThemedView } from '@/components/themed-view';
import { Radii, Spacing } from '@/constants/theme';
import { useThemeColor } from '@/hooks/use-theme-color';

export function Card({
  style,
  children,
}: {
  style?: StyleProp<ViewStyle>;
  children: React.ReactNode;
}) {
  const borderColor = useThemeColor({}, 'icon');

  return <ThemedView style={[styles.base, { borderColor }, style]}>{children}</ThemedView>;
}

const styles = StyleSheet.create({
  base: {
    borderWidth: 1,
    borderRadius: Radii.md,
    padding: Spacing.md,
  },
});
