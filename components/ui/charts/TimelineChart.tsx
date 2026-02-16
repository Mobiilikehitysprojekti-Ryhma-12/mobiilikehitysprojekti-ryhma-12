/**
 * TimelineChart
 *
 * Näyttää leadien määrän ajan suhteen.
 * Ryhmittelee leadit viikon tai kuukauden mukaan ja näyttää trendin.
 *
 * Miksi tämä on hyödyllinen:
 * - Nähdään miten leadien määrä kehittyy ajan myötä
 * - Voidaan tunnistaa kiireisimmät ajanjaksot
 */

import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Colors } from '@/constants/theme';
import type { Lead } from '@/models/Lead';

type TimelineChartProps = {
  leads: Lead[];
  colorScheme: 'light' | 'dark' | null | undefined;
};

export function TimelineChart({ leads, colorScheme }: TimelineChartProps) {
  const theme = colorScheme === 'dark' ? Colors.dark : Colors.light;

  // Ryhmitellään leadit viikon mukaan
  const timeline = useMemo(() => {
    const weeklyData: Record<string, number> = {};

    leads.forEach((lead) => {
      const date = new Date(lead.createdAt);
      // Lasketaan viikon numero (yksinkertaistettu)
      const weekStart = new Date(date);
      weekStart.setDate(date.getDate() - date.getDay()); // Sunnuntai viikon alku
      const weekKey = weekStart.toISOString().split('T')[0];

      weeklyData[weekKey] = (weeklyData[weekKey] || 0) + 1;
    });

    // Muunnetaan objektiksi ja järjestetään
    const entries = Object.entries(weeklyData)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(-8); // Näytetään viimeiset 8 viikkoa

    const maxCount = Math.max(...entries.map((e) => e.count), 1);

    return entries.map((entry) => ({
      ...entry,
      percentage: (entry.count / maxCount) * 100,
      label: formatWeekLabel(entry.date),
    }));
  }, [leads]);

  if (timeline.length === 0) {
    return (
      <View>
        <Text style={[styles.chartTitle, { color: theme.text }]}>Leadit ajan mukaan</Text>
        <Text style={[styles.emptyText, { color: theme.tabIconDefault }]}>
          Ei tarpeeksi dataa aikajanalle
        </Text>
      </View>
    );
  }

  return (
    <View>
      <Text style={[styles.chartTitle, { color: theme.text }]}>Leadit ajan mukaan</Text>
      <Text style={[styles.chartSubtitle, { color: theme.tabIconDefault }]}>
        Viimeisten 8 viikon aikana
      </Text>

      <View style={styles.chartContainer}>
        <View style={styles.barsContainer}>
          {timeline.map((item, index) => (
            <View key={item.date} style={styles.barColumn}>
              <View style={styles.barWrapper}>
                <View
                  style={[
                    styles.bar,
                    {
                      height: `${item.percentage}%`,
                      backgroundColor: theme.tint,
                    },
                  ]}
                >
                  <Text style={styles.countLabel}>{item.count}</Text>
                </View>
              </View>
              <Text style={[styles.dateLabel, { color: theme.tabIconDefault }]}>{item.label}</Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

// Formatoidaan viikon alku päivämäärä helppoon muotoon
function formatWeekLabel(dateString: string): string {
  const date = new Date(dateString);
  const day = date.getDate();
  const month = date.getMonth() + 1;
  return `${day}.${month}`;
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
  chartContainer: {
    height: 200,
    justifyContent: 'flex-end',
  },
  barsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 180,
    gap: 4,
  },
  barColumn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  barWrapper: {
    width: '100%',
    height: 140,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  bar: {
    width: '80%',
    minHeight: 20,
    borderRadius: 4,
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingTop: 4,
  },
  countLabel: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  dateLabel: {
    fontSize: 11,
    marginTop: 4,
    textAlign: 'center',
  },
});
