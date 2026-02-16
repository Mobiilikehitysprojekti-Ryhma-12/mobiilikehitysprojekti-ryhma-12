/**
 * LocationChart
 *
 * Näyttää leadien maantieteellisen jakauman.
 * Ryhmittelee etäisyyden perusteella tai laskee montako liidiä sisältää sijaintitiedon.
 *
 * Miksi tämä on hyödyllinen:
 * - Nähdään kuinka monta liidiä sisältää GPS-sijaintitiedon
 * - Nähdään alueiden jakauma
 */

import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Colors } from '@/constants/theme';
import type { Lead } from '@/models/Lead';

type LocationChartProps = {
  leads: Lead[];
  colorScheme: 'light' | 'dark' | null | undefined;
};

type DistanceBucket = {
  label: string;
  count: number;
  color: string;
};

// Donut chart visualisointi aluejakaumalle
// Käyttää yksinkertaista segmentti-tekniikkaa
type SimplePieChartProps = {
  buckets: DistanceBucket[];
  total: number;
  colorScheme: 'light' | 'dark' | null | undefined;
};

// Yksittäinen donut-segmentti
type DonutSegmentProps = {
  percentage: number;
  color: string;
  rotation: number;
  size: number;
  strokeWidth: number;
};

function DonutSegment({ percentage, color, rotation, size, strokeWidth }: DonutSegmentProps) {
  // Lasketaan segmentin kulma asteet (max 360)
  const degrees = Math.min((percentage / 100) * 360, 360);
  
  // Jos segmentti on alle 1%, ei näytetä
  if (percentage < 1) return null;

  return (
    <View
      style={{
        position: 'absolute',
        width: size,
        height: size,
        transform: [{ rotate: `${rotation}deg` }],
      }}
    >
      <View
        style={{
          width: size,
          height: size,
          borderRadius: size / 2,
          borderWidth: strokeWidth,
          borderColor: 'transparent',
          borderTopColor: color,
          borderRightColor: degrees >= 90 ? color : 'transparent',
          borderBottomColor: degrees >= 180 ? color : 'transparent',
          borderLeftColor: degrees >= 270 ? color : 'transparent',
        }}
      />
    </View>
  );
}

function SimplePieChart({ buckets, total, colorScheme }: SimplePieChartProps) {
  const size = 180;
  const strokeWidth = 40;

  // Lasketaan segmenttien rotaatiot
  let currentRotation = -90; // Aloitetaan yläreunasta (12 o'clock)
  const segments = buckets.map((bucket) => {
    const percentage = (bucket.count / total) * 100;
    const degrees = (percentage / 100) * 360;
    const rotation = currentRotation;
    currentRotation += degrees;
    return {
      ...bucket,
      percentage,
      rotation,
    };
  });

  return (
    <View style={{ alignItems: 'center' }}>
      <View style={{ width: size, height: size, position: 'relative' }}>
        {/* Taustarengas */}
        <View
          style={{
            position: 'absolute',
            width: size,
            height: size,
            borderRadius: size / 2,
            borderWidth: strokeWidth,
            borderColor: colorScheme === 'dark' ? '#374151' : '#e5e7eb',
          }}
        />

        {/* Piirretään segmentit */}
        {segments.map((segment) => (
          <DonutSegment
            key={segment.label}
            percentage={segment.percentage}
            color={segment.color}
            rotation={segment.rotation}
            size={size}
            strokeWidth={strokeWidth}
          />
        ))}

        {/* Keskiympyrä - luo donut-efektin */}
        <View
          style={{
            position: 'absolute',
            width: size - strokeWidth * 2,
            height: size - strokeWidth * 2,
            borderRadius: (size - strokeWidth * 2) / 2,
            backgroundColor: colorScheme === 'dark' ? '#1f2937' : '#ffffff',
            top: strokeWidth,
            left: strokeWidth,
            alignItems: 'center',
            justifyContent: 'center',
            elevation: 3,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 3,
          }}
        >
          <Text
            style={[
              styles.pieCenterText,
              { color: colorScheme === 'dark' ? '#ECEDEE' : '#11181C' },
            ]}
          >
            {total}
          </Text>
          <Text
            style={[
              styles.pieCenterSubtext,
              { color: colorScheme === 'dark' ? '#9BA1A6' : '#687076' },
            ]}
          >
            sijaintia
          </Text>
        </View>
      </View>
    </View>
  );
}

export function LocationChart({ leads, colorScheme }: LocationChartProps) {
  const theme = colorScheme === 'dark' ? Colors.dark : Colors.light;

  // Analysoi sijaintitiedot
  const locationStats = useMemo(() => {
    const withLocation = leads.filter((lead) => lead.lat !== undefined && lead.lng !== undefined);
    const withoutLocation = leads.length - withLocation.length;

    // Jos ei ole tarpeeksi sijaintitietoja, näytetään vain perustilasto
    if (withLocation.length === 0) {
      return {
        hasData: false,
        withLocation: 0,
        withoutLocation,
        buckets: [],
      };
    }

    // Jos on sijaintitietoja, voidaan tehdä yksinkertainen aluejakauma
    // Tässä esimerkissä ryhmitellään leveyspiirin mukaan (yksinkertaistettu)
    const buckets: DistanceBucket[] = [
      { label: 'Pohjoinen', count: 0, color: '#3b82f6' },
      { label: 'Keskinen', count: 0, color: '#10b981' },
      { label: 'Eteläinen', count: 0, color: '#f59e0b' },
    ];

    withLocation.forEach((lead) => {
      const lat = lead.lat!;
      if (lat > 64) {
        buckets[0].count++; // Pohjoinen
      } else if (lat > 62) {
        buckets[1].count++; // Keskinen
      } else {
        buckets[2].count++; // Eteläinen
      }
    });

    return {
      hasData: true,
      withLocation: withLocation.length,
      withoutLocation,
      buckets: buckets.filter((b) => b.count > 0),
    };
  }, [leads]);

  const totalLeads = leads.length;

  return (
    <View>
      <Text style={[styles.chartTitle, { color: theme.text }]}>Maantieteellinen jakauma</Text>
      <Text style={[styles.chartSubtitle, { color: theme.tabIconDefault }]}>
        Leadien sijainnit ja alueet
      </Text>

      {/* Perustilastot */}
      <View style={styles.statsContainer}>
        <View style={styles.statBox}>
          <Text style={[styles.statNumber, { color: theme.tint }]}>
            {locationStats.withLocation}
          </Text>
          <Text style={[styles.statLabel, { color: theme.tabIconDefault }]}>
            Sisältää sijainnin
          </Text>
        </View>
        <View style={styles.statBox}>
          <Text style={[styles.statNumber, { color: theme.tabIconDefault }]}>
            {locationStats.withoutLocation}
          </Text>
          <Text style={[styles.statLabel, { color: theme.tabIconDefault }]}>
            Ei sijaintia
          </Text>
        </View>
      </View>

      {/* Jos on sijaintidataa, näytetään aluejakauma */}
      {locationStats.hasData && locationStats.buckets.length > 0 && (
        <>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Aluejakauma</Text>
          
          {/* Pie Chart visualisointi - yksinkertainen donut-tyyli */}
          <View style={styles.pieChartContainer}>
            <SimplePieChart 
              buckets={locationStats.buckets} 
              total={locationStats.withLocation}
              colorScheme={colorScheme}
            />
          </View>

          <View style={styles.regionContainer}>
            {locationStats.buckets.map((bucket) => {
              const percentage =
                totalLeads > 0 ? ((bucket.count / totalLeads) * 100).toFixed(0) : 0;
              return (
                <View key={bucket.label} style={styles.regionRow}>
                  <View style={styles.regionLeft}>
                    <View style={[styles.regionDot, { backgroundColor: bucket.color }]} />
                    <Text style={[styles.regionLabel, { color: theme.text }]}>{bucket.label}</Text>
                  </View>
                  <Text style={[styles.regionCount, { color: theme.text }]}>
                    {bucket.count} ({percentage}%)
                  </Text>
                </View>
              );
            })}
          </View>
        </>
      )}

      {!locationStats.hasData && (
        <Text style={[styles.emptyText, { color: theme.tabIconDefault }]}>
          Ei sijaintitietoja visualisoitavaksi
        </Text>
      )}
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
  statsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  statBox: {
    flex: 1,
    padding: 12,
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  pieChartContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  pieCenterText: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  pieCenterSubtext: {
    fontSize: 12,
    marginTop: 4,
  },
  regionContainer: {
    gap: 10,
  },
  regionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  regionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  regionDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  regionLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  regionCount: {
    fontSize: 14,
    fontWeight: '600',
  },
  emptyText: {
    fontSize: 14,
    fontStyle: 'italic',
    marginTop: 8,
  },
});
