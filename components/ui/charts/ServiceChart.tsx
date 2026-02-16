/**
 * ServiceChart
 *
 * Näyttää palvelutyyppien jakauman ympyräkaaviona (pie chart).
 *
 * Miksi tämä on hyödyllinen:
 * - Nähdään mitkä palvelutyypit ovat suosituimpia
 * - Auttaa resurssien kohdentamisessa
 */

import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Colors } from '@/constants/theme';
import type { Lead } from '@/models/Lead';

type ServiceChartProps = {
  leads: Lead[];
  colorScheme: 'light' | 'dark' | null | undefined;
};

// Väripaletti palvelutyyppejä varten
const SERVICE_COLORS = [
  '#3b82f6', // sininen
  '#10b981', // vihreä
  '#f59e0b', // oranssi
  '#ef4444', // punainen
  '#8b5cf6', // violetti
  '#ec4899', // pinkki
  '#14b8a6', // turkoosi
  '#f97316', // tumma oranssi
];

export function ServiceChart({ leads, colorScheme }: ServiceChartProps) {
  const theme = colorScheme === 'dark' ? Colors.dark : Colors.light;

  // Lasketaan palvelutyyppien jakauma
  const distribution = useMemo(() => {
    const serviceCounts: Record<string, number> = {};

    leads.forEach((lead) => {
      const service = lead.service || 'Ei määritelty';
      serviceCounts[service] = (serviceCounts[service] || 0) + 1;
    });

    const total = leads.length;
    const entries = Object.entries(serviceCounts)
      .map(([service, count], index) => ({
        service,
        count,
        percentage: total > 0 ? (count / total) * 100 : 0,
        color: SERVICE_COLORS[index % SERVICE_COLORS.length],
      }))
      .sort((a, b) => b.count - a.count); // Suurimmasta pienimpään

    return entries;
  }, [leads]);

  if (distribution.length === 0) {
    return (
      <View>
        <Text style={[styles.chartTitle, { color: theme.text }]}>Palvelutyypit</Text>
        <Text style={[styles.emptyText, { color: theme.tabIconDefault }]}>
          Ei palvelutyyppi-dataa
        </Text>
      </View>
    );
  }

  return (
    <View>
      <Text style={[styles.chartTitle, { color: theme.text }]}>Palvelutyypit</Text>
      <Text style={[styles.chartSubtitle, { color: theme.tabIconDefault }]}>
        Leadien jakauma palvelutyypeittäin
      </Text>

      {/* Yksinkertainen "pie chart" legendana */}
      <View style={styles.pieContainer}>
        {distribution.map((item) => (
          <View key={item.service} style={styles.pieRow}>
            <View style={styles.pieRowLeft}>
              <View style={[styles.colorDot, { backgroundColor: item.color }]} />
              <Text style={[styles.serviceLabel, { color: theme.text }]} numberOfLines={1}>
                {item.service}
              </Text>
            </View>
            <View style={styles.pieRowRight}>
              <Text style={[styles.countText, { color: theme.text }]}>{item.count}</Text>
              <Text style={[styles.percentageText, { color: theme.tabIconDefault }]}>
                ({item.percentage.toFixed(0)}%)
              </Text>
            </View>
          </View>
        ))}
      </View>

      {/* Visuaalinen palkki kokonaiskuvaa varten */}
      <View style={styles.visualBar}>
        {distribution.map((item) => (
          <View
            key={item.service}
            style={[
              styles.visualSegment,
              {
                width: `${item.percentage}%`,
                backgroundColor: item.color,
              },
            ]}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  chartTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  chartSubtitle: {
    fontSize: 14,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 14,
    fontStyle: 'italic',
    marginTop: 8,
  },
  pieContainer: {
    gap: 10,
    marginBottom: 16,
  },
  pieRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pieRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 8,
  },
  pieRowRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  colorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  serviceLabel: {
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
  countText: {
    fontSize: 14,
    fontWeight: '600',
  },
  percentageText: {
    fontSize: 12,
  },
  visualBar: {
    height: 12,
    flexDirection: 'row',
    borderRadius: 6,
    overflow: 'hidden',
    backgroundColor: '#e5e7eb',
  },
  visualSegment: {
    height: '100%',
  },
});
