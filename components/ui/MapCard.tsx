/**
 * MapCard-komponentti
 *
 * Näyttää liidin sijainnin kartalla.
 *
 * Toiminnallisuus:
 * - Natiiveilla alustoilla (iOS/Android): 
 *   - Jos react-native-maps saatavilla: näytetään MapView-kartta markerilla
 *   - Jos ei saatavilla (Expo Go): näytetään WebView-kartta (Leaflet + OpenStreetMap)
 * - Web-alustalla: näytetään kortti koordinaateilla ja linkki Google Mapsiin
 * - Käyttää useUserLocation-hookia sijaintitietojen hakemiseen
 * - Käyttää DistanceDisplay-komponenttia etäisyyden näyttämiseen
 * - Jos lat/lng puuttuu: näytetään selkeä virheilmoitus
 *
 * Huom:
 * - react-native-maps vaatii native compilointia (toimii EAS buildissa)
 * - Expo Go: WebView + Leaflet interaktiivisen kartan näyttämiseen
 */

import * as Linking from 'expo-linking';
import React, { useState } from 'react';
import { Platform, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { DistanceDisplay } from '@/components/ui/DistanceDisplay';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useUserLocation } from '@/hooks/useUserLocation';
import type { Lead } from '@/models/Lead';

// Tuodaan MapView ja Marker vain, kun ei olla webissä
let MapView: any;
let Marker: any;
let mapViewAvailable = false;

if (Platform.OS !== 'web') {
  try {
    const maps = require('react-native-maps');
    MapView = maps.default;
    Marker = maps.Marker;
    mapViewAvailable = true;
  } catch (e) {
    // react-native-maps ei saatavilla (Expo Go), käytetään WebView fallbackia
    mapViewAvailable = false;
  }
}

export function MapCard({ lead }: { lead: Lead }) {
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const tintColor = useThemeColor({}, 'tint');
  const [mapError, setMapError] = useState(false);
  
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

  // Jos MapView on saatavilla (native build), näytetään interaktiivinen kartta
  if (mapViewAvailable && MapView && Marker && !mapError) {
    const mapRegion = {
      latitude: lead.lat,
      longitude: lead.lng,
      latitudeDelta: 0.0922,
      longitudeDelta: 0.0421,
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

        <MapView
          style={styles.map}
          initialRegion={mapRegion}
          scrollEnabled={true}
          zoomEnabled={true}
          pitchEnabled={true}
          rotateEnabled={true}
          onError={() => setMapError(true)}
        >
          <Marker
            coordinate={{
              latitude: lead.lat,
              longitude: lead.lng,
            }}
            title={lead.title}
            description={lead.address}
          />
        </MapView>
      </ThemedView>
    );
  }

  // Fallback (Expo Go + Web): WebView-pohjainen kartta (Leaflet + OpenStreetMap)
  // Toimii kaikilla alustoilla: web, iOS, Android (ilman native compilointia)
  const leafletHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css" />
        <script src="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js"></script>
        <style>
          body { margin: 0; padding: 0; }
          #map { position: absolute; top: 0; bottom: 0; width: 100%; }
        </style>
      </head>
      <body>
        <div id="map"></div>
        <script>
          const map = L.map('map').setView([${lead.lat}, ${lead.lng}], 13);
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap',
            maxZoom: 19
          }).addTo(map);
          L.marker([${lead.lat}, ${lead.lng}]).addTo(map)
            .bindPopup('${lead.title}<br/>${lead.address || 'Sijainti'}');
        </script>
      </body>
    </html>
  `;

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

      <WebView
        style={styles.map}
        source={{ html: leafletHtml }}
        scrollEnabled={true}
        originWhitelist={['*']}
        startInLoadingState={true}
      />
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
  coordinates: {
    fontSize: 12,
    fontFamily: 'monospace',
    opacity: 0.8,
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
});