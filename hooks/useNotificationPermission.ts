/**
 * useNotificationPermission.ts
 *
 * Hook joka hallinnoi notifikaatioiden käyttöoikeuksien pyytämistä.
 *
 * Ominaisuudet:
 * - Pyytää käyttäjältä käyttöoikeutta notifikaatioihin (vain kerran)
 * - Käyttää AsyncStoragea muistamaan, että käyttöoikeus on jo pyydetty
 * - Palauttaa permission status ja funktio uuden pyynnön lähettämistä varten
 * - Näyttää konsolin viestit debugille
 */

import { isRunningInExpoGo } from '@/utils/isExpoGo';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { useEffect, useState } from 'react';

const PERMISSION_STORAGE_KEY = '@quoteflow/notificationPermissionRequested';

type PermissionStatus = 'granted' | 'denied' | 'not-determined' | 'not-checked' | 'loading';

interface NotificationPermissionState {
  status: PermissionStatus;
  hasPermission: boolean;
  isFirstRequest: boolean;
}

/**
 * Hook joka hallinnoi notifikaatioiden käyttöoikeuksien pyytämistä.
 *
 * @returns {NotificationPermissionState & { requestPermission: () => Promise<void> }}
 *   - status: käyttöoikeuden status ('granted', 'denied', 'not-determined', jne)
 *   - hasPermission: boolean, onko käyttöoikeus myönnetty
 *   - isFirstRequest: onko tämä sovelluksen ensimmäinen käynnistys
 *   - requestPermission: funktio, joka pyytää käyttöoikeutta manuaalisesti
 */
export function useNotificationPermission() {
  const [status, setStatus] = useState<PermissionStatus>('not-checked');
  const [isFirstRequest, setIsFirstRequest] = useState(true);

  // Tarkista käyttöoikeuden status sovelluksen käynnistyessä
  useEffect(() => {
    checkAndRequestPermission();
  }, []);

  /**
   * Tarkistaa, onko käyttöoikeus jo pyydetty.
   * Jos ei, pyytää käyttäjältä käyttöoikeutta automaattisesti.
   *
   * Android Expo Go:ssa (kehitys) ei pyydä käyttöoikeutta, koska push-notifikaatiot
   * eivät ole tuettuja. Standalone Android-buildeissa (tuotanto/kehitys APK/AAB)
   * käyttöoikeaus pyydetään normaalisti.
   */
  async function checkAndRequestPermission(): Promise<void> {
    try {
      // Android Expo Go:ssa ohita käyttöoikeuden pyyntö
      // (push-notifikaatiot eivät tuettuja kehitysympäristössä)
      if (isRunningInExpoGo()) {
        console.log(
          '[Notification] Expo Go detected - skipping permission request. ' +
            'Notifications will work on iOS or in standalone Android build (APK/AAB).'
        );
        setStatus('denied');
        setIsFirstRequest(false);
        return;
      }

      // Tarkista, onko käyttöoikeus jo pyydetty aiemmin
      const wasRequested = await AsyncStorage.getItem(PERMISSION_STORAGE_KEY);
      setIsFirstRequest(!wasRequested);

      // Tarkista nykyinen status
      const currentStatus = await Notifications.getPermissionsAsync();
      const currentStatusValue = (currentStatus.status || 'not-determined') as PermissionStatus;
      setStatus(currentStatusValue);

      // Jos tämä on ensimmäinen käynnistys ja status on not-determined, kysy käyttöoikeutta
      if (!wasRequested && currentStatusValue === 'not-determined') {
        console.log('[Notification] First time - requesting permission...');
        await requestPermissionInternal();
      } else if (wasRequested) {
        console.log('[Notification] Permission already requested before, skipping auto-request');
      }
    } catch (error) {
      console.error('[Notification] Error checking permission:', error);
    }
  }

  /**
   * Sisäinen funktio käyttöoikeuden pyytämiselle.
   * Merkitsee pyynnön tehdyksi AsyncStoragessa.
   *
   * Toimii:
   * - iOS:llä (Expo Go ja standalone)
   * - Android standalone-buildeissa (APK/AAB, tuotanto ja kehitys)
   *
   * EI toimi:
   * - Android Expo Go:ssa (push-notifikaatiot poistettu)
   */
  async function requestPermissionInternal(): Promise<void> {
    try {
      // Expo Go:ssa ohita käyttöoikeuden pyyntö
      if (isRunningInExpoGo()) {
        console.log('[Notification] Expo Go - skipping permission request');
        return;
      }

      setStatus('loading');
      const result = await Notifications.requestPermissionsAsync();
      const resultStatus = (result.status || 'not-determined') as PermissionStatus;
      setStatus(resultStatus);

      // Merkitse, että käyttöoikeus on pyydetty
      await AsyncStorage.setItem(PERMISSION_STORAGE_KEY, 'true');

      if (resultStatus === 'granted') {
        console.log('[Notification] Permission granted');
      } else {
        console.log('[Notification] Permission denied or not-determined');
      }
    } catch (error) {
      console.error('[Notification] Error requesting permission:', error);
    }
  }

  /**
   * Funktio, jonka kautta voidaan mannuaalisesti pyytää käyttöoikeutta uudelleen.
   * Esim. jos käyttäjä halusi myöntää käyttöoikeuden myöhemmin.
   */
  async function requestPermission(): Promise<void> {
    await requestPermissionInternal();
  }

  return {
    status,
    hasPermission: status === 'granted',
    isFirstRequest,
    requestPermission,
  };
}
