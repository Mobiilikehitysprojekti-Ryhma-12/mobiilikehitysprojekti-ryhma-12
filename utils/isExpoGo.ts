/**
 * isExpoGo.ts
 *
 * Apuutensiiili, joka tarkistaa, onko sovellus käynnissä Expo Go -kehitysympäristössä
 * vai standalone-buildissa (APK/AAB, iOS binääri).
 *
 * Käyttö:
 *   if (isRunningInExpoGo()) {
 *     // Expo Go - push-notifikaatiot eivät toimi Androidilla
 *   } else {
 *     // Standalone build - push-notifikaatiot toimivat kaikilla alustoilla
 *   }
 */

import Constants from 'expo-constants';

/**
 * Tarkistaa, onko sovellus käynnissä Expo Go -kehitysympäristössä.
 *
 * @returns {boolean} true jos Expo Go, false muutoin
 */
export function isRunningInExpoGo(): boolean {
  return Constants.appOwnership === 'expo';
}

/**
 * Tarkistaa, onko sovellus standalone-build (APK/AAB tai iOS binääri).
 * Sisältää myös development buildit (custom client).
 *
 * @returns {boolean} true jos standalone tai development build, false jos Expo Go tai null
 */
export function isStandaloneBuild(): boolean {
  // Tämä funktio tarkistaa onko sovellus built version (ei Expo Go)
  // Palauttaa false jos appOwnership on null (development) tai 'expo' (Expo Go)
  return Constants.appOwnership !== null && Constants.appOwnership !== 'expo';
}
