/**
 * StatusChart
 *
 * Näyttää leadien status-jakauman vaakapalkkikaaviona (horizontal bar chart).
 *
 * Miksi tämä on hyödyllinen:
 * - Nähdään nopeasti kuinka monta liidiä on missäkin tilassa
 * - Auttaa priorisoimaan työtä (esim. montako quotea odottaa)
 */

import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Colors } from '@/constants/theme';
import type { Lead, LeadStatus } from '@/models/Lead';
import { leadStatusLabel } from '@/models/Lead';

type StatusChartProps = {
  leads: Lead[];
  colorScheme: 'light' | 'dark' | null | undefined;
};

// Statusten värit visualisointia varten
const STATUS_COLORS: Record<LeadStatus, string> = {
  new: '#3b82f6', // sininen
  quoted: '#f59e0b', // oranssi
  accepted: '#10b981', // vihreä
  rejected: '#ef4444', // punainen
};

export function StatusChart({ leads, colorScheme }: StatusChartProps) {
  const theme = colorScheme === 'dark' ? Colors.dark : Colors.light;

  // Lasketaan jakaumat
  const distribution = useMemo(() => {
    const counts: Record<LeadStatus, number> = {
      new: 0,
      quoted: 0,
      accepted: 0,
      rejected: 0,
    };

    leads.forEach((lead) => {
      counts[lead.status]++;
    });

    const total = leads.length;
    const statuses: LeadStatus[] = ['new', 'quoted', 'accepted', 'rejected'];

    return statuses.map((status) => ({
      status,
      count: counts[status],
      percentage: total > 0 ? (counts[status] / total) * 100 : 0,
      label: leadStatusLabel(status),
      color: STATUS_COLORS[status],
    }));
  }, [leads]);

  return (
    <View>
      <Text style={[styles.chartTitle, { color: theme.text }]}>Status-jakauma</Text>
      <Text style={[styles.chartSubtitle, { color: theme.tabIconDefault }]}>
        Leadien tila prosessissa
      </Text>

      <View style={styles.barsContainer}>
        {distribution.map((item) => (
          <View key={item.status} style={styles.barRow}>
            <View style={styles.labelContainer}>
              <Text style={[styles.statusLabel, { color: theme.text }]}>{item.label}</Text>
              <Text style={[styles.countText, { color: theme.tabIconDefault }]}>
                {item.count} ({item.percentage.toFixed(0)}%)
              </Text>
            </View>
            <View style={styles.barContainer}>
              <View
                style={[
                  styles.bar,
                  {
                    width: `${item.percentage}%`,
                    backgroundColor: item.color,
                  },
                ]}
              />
            </View>
          </View>
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
  barsContainer: {
    gap: 12,
  },
  barRow: {
    gap: 8,
  },
  labelContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  statusLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  countText: {
    fontSize: 12,
  },
  barContainer: {
    height: 24,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    overflow: 'hidden',
  },
  bar: {
    height: '100%',
    borderRadius: 4,
    minWidth: 2,
  },
});
