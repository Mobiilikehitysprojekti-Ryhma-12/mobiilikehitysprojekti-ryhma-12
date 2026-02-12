/**
 * LeadListItem — Liidin listakohde-komponentti
 * 
 * Tarkoitus:
 * - Näyttää yhden liidin listana
 * - Näyttää tärkeimmät tiedot (otsikko, status, aika)
 * - Klikkautuva navigoidakseen detaljeihin
 * 
 * Käyttö:
 * - <LeadListItem lead={lead} onPress={() => navigation.push(id)} />
 */

import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { useThemeColor } from '../../hooks/use-theme-color';
import type { Lead } from '../../models/Lead';
import { leadStatusLabel } from '../../models/Lead';
import { ThemedText } from '../themed-text';

export interface LeadListItemProps {
  lead: Lead;
  onPress: () => void;
}

/**
 * LeadListItem komponentti
 * Näyttää liidin tiedot listakohteena, klikkautuva
 */
export function LeadListItem({ lead, onPress }: LeadListItemProps) {
  const tintColor = useThemeColor({}, 'tint');
  const borderColor = useThemeColor({}, 'icon');

  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <View style={[styles.row, { borderBottomColor: borderColor }]}>
        <View style={{ flex: 1 }}>
          <ThemedText numberOfLines={1} style={{ fontWeight: '600' }}>
            {lead.title}
          </ThemedText>
          {lead.service && (
            <ThemedText style={styles.secondary}>{lead.service}</ThemedText>
          )}
        </View>
        <View style={[styles.badge, { borderColor: tintColor }]}>
          <ThemedText style={[{ color: tintColor }, styles.badgeText]}>
            {leadStatusLabel(lead.status)}
          </ThemedText>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  secondary: {
    opacity: 0.6,
    fontSize: 12,
    marginTop: 4,
  },
  badge: {
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginLeft: 12,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
});
