/**
 * MapCard-komponentti (WEB-versio)
 *
 * Näyttää liidin sijainnin kartalla web-alustalla.
 *
 * Toiminnallisuus:
 * - Näyttää upotettuna OpenStreetMap-kartan iframe:ssa
 * - Näyttää koordinaatit ja etäisyyden
 * - Painike ulkoisen karttasovelluksen avaamiseen
 * - Käyttää useUserLocation-hookia sijaintitietojen hakemiseen
 * - Käyttää DistanceDisplay-komponenttia etäisyyden näyttämiseen
 * - Jos lat/lng puuttuu: näytetään selkeä virheilmoitus
 *
 * Huom: Web-alustalla käytetään iframe:a OpenStreetMapin näyttämiseen
 */

import * as Linking from 'expo-linking';
import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

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

  const handleOpenMap = () => {
    if (!hasCoordinates) return;
    const mapsUrl = `https://maps.google.com/?q=${lead.lat},${lead.lng}`;
    Linking.openURL(mapsUrl).catch(() => {
      console.error('Kartan avaaminen epäonnistui');
    });
  };

  if (!hasCoordinates) {
    // Fallback: näytetään selkeä viesti, jos koordinaatteja ei ole
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

  // Web-alustalla: näytetään OpenStreetMap iframe:ssa
  // OpenStreetMap tukee suoraa iframe-upotusta koordinaateilla
  const osmIframeUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${lead.lng! - 0.01},${lead.lat! - 0.01},${lead.lng! + 0.01},${lead.lat! + 0.01}&layer=mapnik&marker=${lead.lat},${lead.lng}`;
  
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

      {/* OpenStreetMap iframe */}
      <View style={styles.mapContainer}>
        <iframe
          width="100%"
          height="100%"
          style={{ border: 0 }}
          src={osmIframeUrl}
          title="OpenStreetMap"
        />
      </View>

      <Pressable 
        onPress={handleOpenMap}
        style={({ pressed }) => [
          styles.mapButton,
          { backgroundColor: tintColor, opacity: pressed ? 0.7 : 1 }
        ]}
      >
        <ThemedText style={styles.mapButtonText}>
          Avaa ulkoisessa kartassa
        </ThemedText>
      </Pressable>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 8,
    marginVertical: 8,
    overflow: 'hidden',
  },
  header: {
    padding: 12,
    gap: 6,
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
  mapContainer: {
    width: '100%',
    height: 300,
  },
  mapButton: {
    padding: 12,
    borderRadius: 0,
    alignItems: 'center',
  },
  mapButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});
