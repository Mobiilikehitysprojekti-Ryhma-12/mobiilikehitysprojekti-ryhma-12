/**
 * Charts-tab
 *
 * Näyttää 4 yksinkertaista visualisointia leadien datasta:
 * 1. Status-jakauma (bar chart)
 * 2. Leadit ajan mukaan (timeline chart)
 * 3. Service-tyyppien jakauma
 * 4. Maantieteellinen jakauma
 *
 * Arkkitehtuuri:
 * - Käytetään samaa LeadsRepository-rakennetta kuin Inbox-tab
 * - Kaikki kaaviot renderöidään custom-komponentteina (ei ulkoisia kirjastoja)
 * - Responsiivinen: sopii eri näyttöko'oille
 */

import { useFocusEffect } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, View, useColorScheme } from 'react-native';

import { ErrorCard } from '@/components/ui/ErrorCard';
import { InboxSkeleton } from '@/components/ui/InboxSkeleton';
import { Colors } from '@/constants/theme';
import type { Lead } from '@/models/Lead';
import { useLeadsRepo } from '@/services/leads/RepoProvider';

// Chart komponetteja
import { LocationChart } from '@/components/ui/charts/LocationChart';
import { ServiceChart } from '@/components/ui/charts/ServiceChart';
import { StatusChart } from '@/components/ui/charts/StatusChart';
import { TimelineChart } from '@/components/ui/charts/TimelineChart';

export default function ChartsTab() {
  const colorScheme = useColorScheme();
  const repo = useLeadsRepo();

  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // Funktio leadien lataamiseen
  const loadLeads = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await repo.listLeads();
      setLeads(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Virhe ladattaessa dataa');
    } finally {
      setIsLoading(false);
    }
  }, [repo]);

  // Lataa leadit kun komponentti mountataan tai kun tab tulee fokukseen
  useFocusEffect(
    useCallback(() => {
      loadLeads();
    }, [loadLeads])
  );

  // Retry-toiminto virhetilanteessa
  const handleRetry = useCallback(() => {
    loadLeads();
  }, [loadLeads]);

  // Pull-to-refresh handler
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadLeads();
    setRefreshing(false);
  }, [loadLeads]);

  const styles = makeStyles(colorScheme);

  // Loading state
  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Tilastot</Text>
          <Text style={styles.subtitle}>Ladataan...</Text>
        </View>
        <InboxSkeleton />
      </View>
    );
  }

  // Error state
  if (error) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Tilastot</Text>
        </View>
        <ErrorCard message={error} onRetry={handleRetry} />
      </View>
    );
  }

  // Empty state
  if (leads.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Tilastot</Text>
        </View>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Ei dataa visualisoitavaksi</Text>
          <Text style={styles.emptySubtext}>Lisää ensin liidejä nähdäksesi tilastot</Text>
        </View>
      </View>
    );
  }

  // Ready state - näytetään kaaviot
  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={colorScheme === 'dark' ? Colors.dark.tint : Colors.light.tint}
        />
      }
    >
      <View style={styles.header}>
        <Text style={styles.title}>Tilastot</Text>
        <Text style={styles.subtitle}>{leads.length} liidiä</Text>
      </View>

      <View style={styles.chartsContainer}>
        {/* Kaavio 1: Status-jakauma */}
        <View style={styles.chartCard}>
          <StatusChart leads={leads} colorScheme={colorScheme} />
        </View>

        {/* Kaavio 2: Leadit ajan mukaan */}
        <View style={styles.chartCard}>
          <TimelineChart leads={leads} colorScheme={colorScheme} />
        </View>

        {/* Kaavio 3: Service-tyypit */}
        <View style={styles.chartCard}>
          <ServiceChart leads={leads} colorScheme={colorScheme} />
        </View>

        {/* Kaavio 4: Maantieteellinen jakauma */}
        <View style={styles.chartCard}>
          <LocationChart leads={leads} colorScheme={colorScheme} />
        </View>
      </View>
    </ScrollView>
  );
}

function makeStyles(colorScheme: 'light' | 'dark' | null | undefined) {
  const theme = colorScheme === 'dark' ? Colors.dark : Colors.light;

  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    header: {
      padding: 20,
      paddingTop: 60,
      backgroundColor: theme.background,
    },
    title: {
      fontSize: 32,
      fontWeight: 'bold',
      color: theme.text,
      marginBottom: 4,
    },
    subtitle: {
      fontSize: 16,
      color: theme.tabIconDefault,
    },
    chartsContainer: {
      padding: 16,
      gap: 16,
    },
    chartCard: {
      backgroundColor: colorScheme === 'dark' ? '#1f2937' : '#ffffff',
      borderRadius: 12,
      padding: 16,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingTop: 100,
    },
    emptyText: {
      fontSize: 18,
      fontWeight: '600',
      color: theme.text,
      marginBottom: 8,
    },
    emptySubtext: {
      fontSize: 14,
      color: theme.tabIconDefault,
    },
  });
}
