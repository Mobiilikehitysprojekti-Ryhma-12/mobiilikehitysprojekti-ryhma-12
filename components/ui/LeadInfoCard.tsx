/**
 * LeadInfoCard -komponentti
 *
 * Tarkoitus:
 * - Näyttää liidin perustiedot (nimi, status, palvelu, asiakas, osoite, kuvaus)
 * - Puhdas presentational-komponentti
 *
 * Miksi erillinen komponentti:
 * - Erottaa liidin tietojen näyttämisen muusta logiikasta
 * - Helpottaa ylläpitoa ja testattavuutta
 * - Voidaan käyttää muuallakin tarvittaessa
 */

import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useThemeColor } from '../../hooks/use-theme-color';
import type { Lead } from '../../models/Lead';
import { leadStatusLabel } from '../../models/Lead';
import { ThemedText } from '../themed-text';
import { Card } from './Card';

interface LeadInfoCardProps {
  lead: Lead;
}

export function LeadInfoCard({ lead }: LeadInfoCardProps) {
  const borderColor = useThemeColor({}, 'icon');
  const tintColor = useThemeColor({}, 'tint');

  return (
    <Card style={[styles.card, { borderColor }]}>
      <View style={styles.top}>
        <ThemedText type="title" numberOfLines={2} style={{ flex: 1 }}>
          {lead.title}
        </ThemedText>

        {/* Status-badge */}
        <View style={[styles.badge, { borderColor: tintColor }]}>
          <ThemedText style={{ color: tintColor }}>
            {leadStatusLabel(lead.status)}
          </ThemedText>
        </View>
      </View>

      {/* Meta: aika, palvelu */}
      <ThemedText style={styles.meta}>
        {lead.service ? `${lead.service} • ` : ''}
        {lead.createdAt}
      </ThemedText>

      {/* Perustiedot: asiakas, osoite */}
      {lead.customerName ? (
        <ThemedText>Asiakas: {lead.customerName}</ThemedText>
      ) : null}
      {lead.address ? <ThemedText>Osoite: {lead.address}</ThemedText> : null}

      {/* Kuvaus */}
      {lead.description ? (
        <ThemedText style={styles.description}>{lead.description}</ThemedText>
      ) : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 14,
    borderWidth: 1,
    gap: 10,
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
  description: {
    marginTop: 6,
  },
});
