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
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

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
  return (
    <Card style={styles.wrap}>
      <ThemedText type="title">{title}</ThemedText>
      <ThemedText style={styles.sub}>{subtitle}</ThemedText>

      <Button title={cta} onPress={onCta} style={styles.btn} />

      <View style={styles.spacer} />
    </Card>
  );
}

const styles = StyleSheet.create({
  wrap: {
    margin: 16,
    gap: 10,
  },
  sub: {
    opacity: 0.85,
  },
  btn: {
    marginTop: 8,
    alignSelf: 'flex-start',
  },
  spacer: {
    height: 2,
  },
});
