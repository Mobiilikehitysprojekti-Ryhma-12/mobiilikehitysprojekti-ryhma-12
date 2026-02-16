/**
 * MapCard-komponentti
 *
 * Näyttää liidin sijainnin kartalla käyttäen react-native-maps natiivia karttakomponenttia.
 *
 * Toiminnallisuus:
 * - Natiiveilla alustoilla (iOS/Android): Näyttää MapView-kartan markerilla
 * - Web-alustalla: Näyttää yksinkertaistetun kortin koordinaateilla (MapView ei toimi webissä)
 * - Käyttää useUserLocation-hookia sijaintitietojen hakemiseen
 * - Käyttää DistanceDisplay-komponenttia etäisyyden näyttämiseen
 * - Jos lat/lng puuttuu: näytetään selkeä virheilmoitus
 *
 * Huom:
 * - react-native-maps toimii Expo Go:ssa (sisältyy Expo Go runtimeen)
 * - Web-alustalla MapView ei ole tuettu, näytetään staattinen kortti
 */

import * as Linking from 'expo-linking';
import React from 'react';
import { Platform, Pressable, StyleSheet } from 'react-native';
import MapView, { Marker, Region } from 'react-native-maps';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { DistanceDisplay } from '@/components/ui/DistanceDisplay';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useUserLocation } from '@/hooks/useUserLocation';
import type { Lead } from '@/models/Lead';

export function MapCard({ lead }: { lead: Lead }) {
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const tintColor = useThemeColor({}, 'tint');
  
  // Käytetään custom hookia sijaintitietojen hakemiseen
  const { userLocation, locationPermission, isLoading } = useUserLocation();

  // Tarkistetaan, onko koordinaatit saatavilla
  const hasCoordinates = lead.lat !== undefined && lead.lng !== undefined;

  /**
   * Avaa sijainnin ulkoisessa kartassa (Google Maps)
   */
  const handleOpenMap = () => {
    if (!hasCoordinates) return;
    const mapsUrl = `https://maps.google.com/?q=${lead.lat},${lead.lng}`;
    Linking.openURL(mapsUrl).catch(() => {
      console.error('Kartan avaaminen epäonnistui');
    });
  };

  // Jos koordinaatteja ei ole, näytetään varoituskortti
  if (!hasCoordinates) {
    return (
      <ThemedView style={[styles.card, { backgroundColor }]}>
        <ThemedText style={[styles.label, { color: textColor }]}>
          📍 Sijainti
        </ThemedText>
        <ThemedText style={[styles.address, { color: textColor }]}>
          {lead.address || 'Osoitetta ei saatavilla'}
        </ThemedText>
        <ThemedView style={styles.warningContainer}>
          <ThemedText style={[styles.warningText, { color: tintColor }]}>
            ⚠️ Liidin koordinaatit puuttuvat
          </ThemedText>
          <ThemedText style={[styles.hint, { color: tintColor }]}>
            Karttaa ei voida näyttää ilman GPS-koordinaatteja
          </ThemedText>
        </ThemedView>
      </ThemedView>
    );
  }

  // Web-alustalla: näytetään yksinkertainen kortti koordinaateilla ja linkki
  // (MapView ei toimi webissä)
  if (Platform.OS === 'web') {
    return (
      <ThemedView style={[styles.card, { backgroundColor }]}>
        <ThemedText style={[styles.label, { color: textColor }]}>
          📍 Sijainti
        </ThemedText>
        <ThemedText style={[styles.address, { color: textColor }]}>
          {lead.address || 'Osoitetta ei saatavilla'}
        </ThemedText>
        <ThemedView style={styles.coordinatesContainer}>
          <ThemedText style={[styles.coordinatesLabel, { color: tintColor }]}>
            Koordinaatit: {lead.lat?.toFixed(6)}, {lead.lng?.toFixed(6)}
          </ThemedText>
        </ThemedView>
        <DistanceDisplay
          userLocation={userLocation}
          leadLat={lead.lat}
          leadLng={lead.lng}
          locationPermission={locationPermission}
          isLoading={isLoading}
        />
        <Pressable 
          onPress={handleOpenMap}
          style={({ pressed }) => [
            styles.mapButton,
            { backgroundColor: tintColor, opacity: pressed ? 0.7 : 1 }
          ]}
        >
          <ThemedText style={styles.mapButtonText}>
            Avaa kartalla
          </ThemedText>
        </Pressable>
      </ThemedView>
    );
  }

  // iOS/Android: näytetään natiivikartta (MapView)
  // Kartta-alueen määritys liidin koordinaateilla
  const mapRegion: Region = {
    latitude: lead.lat!,
    longitude: lead.lng!,
    latitudeDelta: 0.015,
    longitudeDelta: 0.01,
  };

  return (
    <ThemedView style={[styles.container, { backgroundColor }]}>
      <ThemedView style={styles.header}>
        <ThemedText style={[styles.label, { color: textColor }]}>
          📍 Sijainti
        </ThemedText>
        <ThemedText style={[styles.address, { color: textColor }]}>
          {lead.address || 'Osoitetta ei saatavilla'}
        </ThemedText>
        <ThemedView style={styles.coordinatesContainer}>
          <ThemedText style={[styles.coordinatesLabel, { color: tintColor }]}>
            Koordinaatit: {lead.lat?.toFixed(6)}, {lead.lng?.toFixed(6)}
          </ThemedText>
        </ThemedView>
        {/* Etäisyyskomponentti */}
        <DistanceDisplay
          userLocation={userLocation}
          leadLat={lead.lat}
          leadLng={lead.lng}
          locationPermission={locationPermission}
          isLoading={isLoading}
        />
      </ThemedView>

      {/* Natiivikartta react-native-mapsilla */}
      <MapView
        style={styles.map}
        region={mapRegion}
        scrollEnabled={true}
        zoomEnabled={true}
        pitchEnabled={true}
        rotateEnabled={true}
      >
        <Marker
          coordinate={{
            latitude: lead.lat!,
            longitude: lead.lng!,
          }}
          title={lead.title}
          description={lead.address}
          pinColor="red"
        />
      </MapView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 8,
    marginVertical: 8,
    overflow: 'hidden',
    height: 300,
  },
  header: {
    padding: 12,
    gap: 6,
    zIndex: 10,
  },
  card: {
    padding: 12,
    borderRadius: 8,
    marginVertical: 8,
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
  },
  address: {
    fontSize: 14,
    fontWeight: '500',
  },
  coordinatesContainer: {
    gap: 4,
    marginTop: 2,
  },
  coordinatesLabel: {
    fontSize: 11,
    fontWeight: '500',
  },
  warningContainer: {
    marginTop: 8,
    gap: 4,
  },
  warningText: {
    fontSize: 13,
    fontWeight: '600',
  },
  hint: {
    fontSize: 11,
    marginTop: 4,
  },
  map: {
    flex: 1,
  },
  mapButton: {
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  mapButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});