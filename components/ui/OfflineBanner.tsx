/**
 * OfflineBanner - Sprint 2 P1 (#43)
 * 
 * Näyttää bannerin kun:
 * 1) Laite on offline-tilassa (NetInfo), TAI
 * 2) Data tulee cachesta
 * 
 * Integroitu NetInfo:n kanssa (Ahvko)
 */

import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

function formatLastSynced(value: string | null | undefined): string {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  
  // Suomalainen muotoilu
  const time = d.toLocaleTimeString('fi-FI', { 
    hour: '2-digit', 
    minute: '2-digit' 
  });
  const date = d.toLocaleDateString('fi-FI', { 
    day: 'numeric', 
    month: 'numeric' 
  });
  return `${date} klo ${time}`;
}

export function OfflineBanner({
  isOffline,
  lastSynced,
  dataSource,
}: {
  isOffline: boolean;
  lastSynced?: string | null;
  dataSource: 'cache' | 'network';
}) {
  // Näytä banneri vain jos offline TAI data on cachesta
  if (!isOffline && dataSource !== 'cache') return null;

  // Jos oikeasti offline, käytä oranssia väriä ja selvempää tekstiä
  const isActuallyOffline = isOffline;
  
  return (
    <View style={[
      styles.banner, 
      isActuallyOffline ? styles.bannerOffline : styles.bannerCache
    ]}>
      <View style={styles.content}>
        <Text style={styles.emoji}>
          {isActuallyOffline ? '📶' : '💾'}
        </Text>
        <View style={styles.textContainer}>
          <Text style={styles.title}>
            {isActuallyOffline 
              ? 'Offline – Välimuistidata' 
              : 'Välimuistidata'}
          </Text>
          {lastSynced && (
            <Text style={styles.subtitle}>
              Päivitetty: {formatLastSynced(lastSynced)}
            </Text>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 8,
    borderRadius: 8,
  },
  bannerOffline: {
    backgroundColor: '#FF9500', // Oranssi = offline
  },
  bannerCache: {
    backgroundColor: '#007AFF', // Sininen = cache (mutta online)
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  emoji: {
    fontSize: 20,
  },
  textContainer: {
    flex: 1,
    gap: 2,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  subtitle: {
    color: '#FFFFFF',
    fontSize: 12,
    opacity: 0.9,
  },
});