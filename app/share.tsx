/**
 * app/share
 *
 * Share/QR-ruutu (P0): yrittäjä voi jakaa asiakaslinkin nopeasti.
 *
 * Mitä tämä ruutu tekee:
 * - Näyttää asiakaslinkin tekstinä (read-only)
 * - Näyttää QR-koodin samaan linkkiin
 * - Näyttää yrityksen yhteystiedot (nimi/puhelin/sähköposti)
 * - Tarjoaa "Jaa"-napin (native share-sheet)
 *
 * Miksi oma route eikä tab (P0):
 * - Pienempi riski navigaatioon: ei muutoksia tab-layoutiin.
 * - Helppo myöhemmin siirtää tabiksi, jos halutaan.
 */

import { File, Paths } from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';
import { Stack } from 'expo-router';
import * as Sharing from 'expo-sharing';
import React, { useCallback, useRef, useState } from 'react';
import { Platform, ScrollView, Share, StyleSheet, View } from 'react-native';
import QRCode from 'react-native-qrcode-svg';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Spacing } from '@/constants/theme';
import { useThemeColor } from '@/hooks/use-theme-color';
import { businessEmail, businessName, businessPhone, customerUrl } from '@/services/config';
import { buildShareMessage } from '@/utils/buildShareMessage';

type QrCodeRef = {
  // Huom: react-native-qrcode-svg tarjoaa toDataURL(cb), jolla saadaan PNG base64:na.
  // Tyypitys ei ole täydellinen kirjastossa, joten pidetään oma minimirajapinta.
  toDataURL: (cb: (data: string) => void) => void;
};

export default function ShareScreen() {
  const tint = useThemeColor({}, 'tint');
  const qrColor = useThemeColor({}, 'text');
  const qrBackground = useThemeColor({}, 'background');

  const qrRef = useRef<QrCodeRef | null>(null);

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);

  // Rakennetaan jaettava viesti yhden helperin kautta (ei duplikaatiota).
  // Huom: nämä arvot tulevat env-konfigista ja ovat käytännössä vakioita appin ajon ajan,
  // joten memoointi ei tuo hyötyä ja aiheuttaa lint-varoituksia.
  const message = buildShareMessage({
    url: customerUrl,
    businessName,
    businessPhone,
    businessEmail,
  });

  const onShareLink = async () => {
    setErrorMessage(null);
    setInfoMessage(null);

    // Webissä Share.share ei avaa jakoikkunaa — käytetään Clipboard API:a ja ilmoitetaan käyttäjälle.
    if (Platform.OS === 'web') {
      try {
        await navigator.clipboard.writeText(customerUrl);
        setInfoMessage('Linkki kopioitu leikepöydälle!');
      } catch {
        // Clipboard API voi vaatia HTTPS / käyttöluvan — fallback: näytetään linkki promptissa.
        window.prompt('Kopioi linkki:', customerUrl);
      }
      return;
    }

    try {
      await Share.share({ message });
    } catch (error: unknown) {
      // P0: näytetään käyttäjälle ystävällinen virhe, mutta säilytetään ruutu silti käyttökelpoisena.
      console.error('ShareScreen: Share.share epäonnistui', error);
      const msg = error instanceof Error ? error.message : 'Jakaminen epäonnistui.';
      setErrorMessage(msg);
    }
  };

  const getQrBase64Png = useCallback(async (): Promise<string> => {
    // Miksi Promise-wrapper:
    // - toDataURL käyttää callbackia, mutta muissa toiminnoissa (share/save) on luontevaa awaitata.
    return new Promise((resolve, reject) => {
      if (!qrRef.current) {
        reject(new Error('QR-koodi ei ole vielä valmis.'));
        return;
      }

      try {
        qrRef.current.toDataURL((data) => {
          if (!data) {
            reject(new Error('QR-PNG:n generointi epäonnistui.'));
            return;
          }
          resolve(data);
        });
      } catch (error: unknown) {
        reject(error instanceof Error ? error : new Error('QR-PNG:n generointi epäonnistui.'));
      }
    });
  }, []);

  const writeQrPngToCache = useCallback(async (base64Png: string): Promise<string> => {
    // Miksi uusi expo-file-system API (Paths + File):
    // - SDK 54 käyttää uutta File/Directory-mallia ja vanhat cacheDirectory/writeAsStringAsync-polut aiheuttavat helposti tyyppi- ja runtime-ongelmia.
    // - File.write tukee base64-enkoodausta suoraan, joten emme tarvitse erillistä base64->bytes-muunnosta.
    const file = new File(Paths.cache, `quoteflow-qr-${Date.now()}.png`);

    // Huom: create + overwrite tekee tästä idempotentin (ei jää vanhoja tiedostoja “lukkoon”).
    file.create({ intermediates: true, overwrite: true });
    file.write(base64Png, { encoding: 'base64' });
    return file.uri;
  }, []);

  const onShareQrPng = useCallback(async () => {
    setErrorMessage(null);
    setInfoMessage(null);

    // Webissä riittää että QR näkyy, koska natiivin tiedostojako ei ole luotettava/tuettu.
    if (Platform.OS === 'web') {
      window.alert('QR-koodi näkyy ruudulla. PNG-jakaminen on tuettu vain iOS/Androidissa.');
      return;
    }

    try {
      const isAvailable = await Sharing.isAvailableAsync();
      if (!isAvailable) {
        setErrorMessage('Jakaminen ei ole käytettävissä tällä laitteella.');
        return;
      }

      const base64 = await getQrBase64Png();
      const fileUri = await writeQrPngToCache(base64);
      await Sharing.shareAsync(fileUri, { mimeType: 'image/png', dialogTitle: 'Jaa QR-koodi' });
    } catch (error: unknown) {
      console.error('ShareScreen: QR PNG jakaminen epäonnistui', error);
      const msg = error instanceof Error ? error.message : 'QR PNG jakaminen epäonnistui.';
      setErrorMessage(msg);
    }
  }, [getQrBase64Png, writeQrPngToCache]);

  const onSaveQrPng = useCallback(async () => {
    setErrorMessage(null);
    setInfoMessage(null);

    if (Platform.OS === 'web') {
      window.alert('QR-koodi näkyy ruudulla. PNG-tallennus on tuettu vain iOS/Androidissa.');
      return;
    }

    try {
      const permission = await MediaLibrary.requestPermissionsAsync();
      if (!permission.granted) {
        setErrorMessage('Tallennus vaatii oikeuden mediakirjastoon.');
        return;
      }

      const base64 = await getQrBase64Png();
      const fileUri = await writeQrPngToCache(base64);
      await MediaLibrary.saveToLibraryAsync(fileUri);
      setInfoMessage('QR-koodi tallennettu galleriaan.');
    } catch (error: unknown) {
      console.error('ShareScreen: QR PNG tallennus epäonnistui', error);
      const msg = error instanceof Error ? error.message : 'QR PNG tallennus epäonnistui.';
      setErrorMessage(msg);
    }
  }, [getQrBase64Png, writeQrPngToCache]);

  return (
    <>
      <Stack.Screen options={{ title: 'Jaa asiakaslinkki' }} />

      <ThemedView style={styles.screen}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <ThemedText type="title">Jaa asiakaslinkki</ThemedText>

          {infoMessage ? <ThemedText style={{ color: tint }}>{infoMessage}</ThemedText> : null}
          {errorMessage ? <ThemedText style={{ color: tint }}>{errorMessage}</ThemedText> : null}

          <Card style={styles.card}>
            <ThemedText type="subtitle">Linkki tarjouspyyntöön</ThemedText>
            <Input value={customerUrl} editable={false} selectTextOnFocus />

            <View style={styles.actionsRow}>
              <Button title="Jaa linkki" onPress={onShareLink} />
            </View>
          </Card>

          <Card style={styles.card}>
            <ThemedText type="subtitle">QR-koodi</ThemedText>
            <View style={styles.qrWrap}>
              <QRCode
                value={customerUrl}
                size={220}
                color={qrColor}
                backgroundColor={qrBackground}
                getRef={(ref) => {
                  qrRef.current = ref as unknown as QrCodeRef;
                }}
              />
            </View>

            <View style={styles.actionsRow}>
              <Button title="Jaa QR kuvana (PNG)" onPress={onShareQrPng} />
              <Button title="Tallenna QR (PNG)" onPress={onSaveQrPng} />
            </View>
          </Card>

          <Card style={styles.card}>
            <ThemedText type="subtitle">Yrityksen tiedot</ThemedText>
            <ThemedText>Nimi: {businessName}</ThemedText>
            <ThemedText>Puhelin: {businessPhone}</ThemedText>
            <ThemedText>Sähköposti: {businessEmail}</ThemedText>
          </Card>
        </ScrollView>
      </ThemedView>
    </>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    padding: Spacing.md,
  },
  content: {
    gap: 16,
    paddingBottom: Spacing.lg,
  },
  card: {
    gap: 10,
  },
  actionsRow: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    gap: 10,
  },
  qrWrap: {
    alignItems: 'center',
    paddingTop: 8,
    paddingBottom: 4,
  },
});
