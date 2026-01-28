/**
 * EmptyState
 *
 * Yhtenäinen tyhjätila (ei dataa / ei hakutuloksia) + CTA.
 *
 * Huom:
 * - CTA:n toteutus on tarkoituksella kevyt (Pressable), jotta ei lisätä uutta design-systeemiä.
 * - Värit otetaan teemasta (useThemeColor).
 */

import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useThemeColor } from '@/hooks/use-theme-color';

export function EmptyState({
  title,
  subtitle,
  cta,
  onCta,
}: {
  title: string;
  subtitle: string;
  cta: string;
  onCta: () => void;
}) {
  const borderColor = useThemeColor({}, 'icon');

  return (
    <ThemedView style={[styles.wrap, { borderColor }]}>
      <ThemedText type="title">{title}</ThemedText>
      <ThemedText style={styles.sub}>{subtitle}</ThemedText>

      <Pressable accessibilityRole="button" onPress={onCta} style={[styles.btn, { borderColor }]}>
        <ThemedText type="defaultSemiBold">{cta}</ThemedText>
      </Pressable>

      <View style={styles.spacer} />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  wrap: {
    margin: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    gap: 10,
  },
  sub: {
    opacity: 0.85,
  },
  btn: {
    marginTop: 8,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  spacer: {
    height: 2,
  },
});
