/**
 * LeadListItem
 *
 * Yksi rivi (kortti) Inbox-listassa.
 *
 * Huom:
 * - Ei navigoi itse; se delegoi onPressin parentille.
 * - Näyttää vain tärkeimmät tiedot P0-demon kannalta.
 */

import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Card } from '@/components/ui/Card';
import { useThemeColor } from '@/hooks/use-theme-color';
import type { Lead } from '@/models/Lead';
import { leadStatusLabel } from '@/models/Lead';

export function LeadListItem({ lead, onPress }: { lead: Lead; onPress: () => void }) {
  const borderColor = useThemeColor({}, 'icon');
  const tintColor = useThemeColor({}, 'tint');

  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={styles.outer}>
      <Card style={[styles.card, { borderColor }]}>
        <View style={styles.top}>
          <ThemedText type="subtitle" numberOfLines={1} style={{ flex: 1 }}>
            {lead.title}
          </ThemedText>

          <View style={[styles.badge, { borderColor: tintColor }]}>
            <ThemedText style={{ color: tintColor }}>{leadStatusLabel(lead.status)}</ThemedText>
          </View>
        </View>

        <ThemedText style={styles.meta}>
          {lead.service ? `${lead.service} • ` : ''}
          {lead.createdAt}
        </ThemedText>
      </Card>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  outer: {
    marginHorizontal: 16,
    marginBottom: 12,
  },
  card: {
    padding: 14,
    borderWidth: 1,
    gap: 8,
  },
  top: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
  },
  meta: {
    opacity: 0.75,
  },
});
