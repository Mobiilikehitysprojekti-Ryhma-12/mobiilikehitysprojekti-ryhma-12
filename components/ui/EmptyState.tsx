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
  hint,
  cta,
  onCta,
  ctaDisabled,
}: {
  title: string;
  subtitle: string;
  hint?: string;
  cta: string;
  onCta: () => void;
  ctaDisabled?: boolean;
}) {
  return (
    <Card style={styles.wrap}>
      <ThemedText type="title">{title}</ThemedText>
      <ThemedText style={styles.sub}>{subtitle}</ThemedText>
      {hint ? <ThemedText style={styles.hint}>{hint}</ThemedText> : null}

      <Button title={cta} onPress={onCta} disabled={ctaDisabled} style={styles.btn} />

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
  hint: {
    opacity: 0.75,
  },
  btn: {
    marginTop: 8,
    alignSelf: 'flex-start',
  },
  spacer: {
    height: 2,
  },
});
