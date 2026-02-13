/**
 * DistanceDisplay-komponentti
 * 
 * Näyttää etäisyyden käyttäjän sijainnista liidiin.
 * 
 * Toiminnallisuus:
 * - Laskee etäisyyden Haversine-kaavalla kun molemmat koordinaatit ovat saatavilla
 * - Näyttää etäisyyden kilometreinä (1 desimaalin tarkkuudella)
 * - Näyttää fallback-viestit eri tilanteissa:
 *   - Sijaintilupa evätty
 *   - Haetaan sijaintia
 *   - Liidin koordinaatit puuttuvat
 * 
 * Props:
 * - userLocation: Käyttäjän GPS-sijainti (LocationObject tai null)
 * - leadLat, leadLng: Liidin koordinaatit (number tai undefined)
 * - locationPermission: Sijaintiluvan status
 * - isLoading: Ladataanko sijaintia parhaillaan
 */

import type * as Location from 'expo-location';
import React, { useMemo } from 'react';
import { StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useThemeColor } from '@/hooks/use-theme-color';
import { calculateDistance } from '@/utils/calculateDistance';

interface DistanceDisplayProps {
  userLocation: Location.LocationObject | null;
  leadLat?: number;
  leadLng?: number;
  locationPermission: Location.PermissionStatus | null;
  isLoading: boolean;
}

export function DistanceDisplay({
  userLocation,
  leadLat,
  leadLng,
  locationPermission,
  isLoading,
}: DistanceDisplayProps) {
  const tintColor = useThemeColor({}, 'tint');

  // Lasketaan etäisyys vain kun molemmat koordinaatit ovat saatavilla
  const distance = useMemo(() => {
    if (!userLocation || leadLat === undefined || leadLng === undefined) {
      return null;
    }

    return calculateDistance(
      userLocation.coords.latitude,
      userLocation.coords.longitude,
      leadLat,
      leadLng
    );
  }, [userLocation, leadLat, leadLng]);

  return (
    <ThemedView style={styles.container}>
      {/* Näytetään etäisyys jos saatavilla */}
      {distance !== null && (
        <ThemedText style={[styles.distanceText, { color: tintColor }]}>
          📏 Etäisyys: {distance.toFixed(1)} km
        </ThemedText>
      )}

      {/* Sijaintilupa evätty */}
      {locationPermission === 'denied' && (
        <ThemedText style={[styles.hint, { color: tintColor }]}>
          Sijaintilupa evätty – etäisyyttä ei voida näyttää
        </ThemedText>
      )}

      {/* Haetaan sijaintia */}
      {isLoading && locationPermission === 'granted' && (
        <ThemedText style={[styles.hint, { color: tintColor }]}>
          Haetaan sijaintia...
        </ThemedText>
      )}

      {/* Liidin koordinaatit puuttuvat */}
      {!isLoading && locationPermission === 'granted' && userLocation && (leadLat === undefined || leadLng === undefined) && (
        <ThemedText style={[styles.hint, { color: tintColor }]}>
          Liidin koordinaatit puuttuvat – etäisyyttä ei voida laskea
        </ThemedText>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 6,
    gap: 4,
  },
  distanceText: {
    fontSize: 12,
    fontWeight: '600',
  },
  hint: {
    fontSize: 11,
    marginTop: 4,
  },
});
