/**
 * notificationService.ts
 *
 * Hallinnoi push-ilmoitusten asetuksia ja kuuntelijoita.
 * Vastaa:
 * - Ilmoitusten vastaanottamisesta (notification received)
 * - Käyttäjän vuorovaikutuksesta ilmoituksiin (notification response / deep linking)
 * - Notifikaation lähettämisestä (demo varten, jos tarvitaan)
 *
 * Huom: Android Expo Go ei tue push-notifikaatioita.
 * Android standalone-buildissa (APK/AAB) notifikaatiot toimivat normaalisti.
 */

import { isRunningInExpoGo } from '@/utils/isExpoGo';
import * as Notifications from 'expo-notifications';

/**
 * Alustaa notifikaatiopalvelun.
 * Asettaa oletusnotifikaatiopalautimen ja rekisteröi taustatehtävät.
 *
 * Android Expo Go:ssa tämä voi epäonnistua (push-notifikaatiot poistettu).
 * Android standalone-buildeissa (APK/AAB) toimii normaalisti.
 * Tämä funktio käsittelee virheen graatioosesti.
 */
export function initializeNotifications(): void {
  try {
    // Aseta oletuspalautin: kuinka notifikaatiot näytetään kun sovellus on aktiivinen
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,         // Näytä hälytys vaikka sovellus olisi aktiivinen
        shouldPlaySound: true,         // Soita ääni
        shouldSetBadge: false,         // Älä aseta badge-kuviota
        shouldShowBanner: true,        // Näytä banneri iOS 14+
        shouldShowList: true,          // Näytä notifikaatiolistassa
      }),
    });
    console.log('[Notification] Handler initialized successfully');
  } catch (error) {
    // Expo Go:ssa push-notifikaatiot eivät ole tuettuja
    if (isRunningInExpoGo()) {
      console.warn(
        '[Notification] Expo Go does not support push notifications. ' +
          'Notifications will work on iOS or in standalone Android build (APK/AAB).'
      );
    } else {
      console.error('[Notification] Error initializing notification handler:', error);
    }
  }
}

/**
 * Lisää kuuntelijat notifikaatioille:
 * - Notifikaation vastaanotto (sovellus aktiivinen)
 * - Notifikaatioon painaminen (avaa sovellus tai näyttää deep link)
 *
 * Android Expo Go:ssa kuuntelijat saattavat olla käyttämättömät,
 * mutta ne eivät aiheuta virheitä.
 */
export function subscribeToNotifications(
  onNotificationReceived?: (notification: Notifications.Notification) => void,
  onNotificationResponse?: (response: Notifications.NotificationResponse) => void
): (() => void) {
  try {
    // Kuuntele saapuvia notifikaatioita kun sovellus on aktiivinen
    const notificationSubscription = Notifications.addNotificationReceivedListener(
      (notification) => {
        // Voidaan käyttää deep linkingiin tai sovelluslogiikan triggeröintiin
        if (onNotificationReceived) {
          onNotificationReceived(notification);
        }
        console.log('[Notification] Received:', notification.request.content.body);
      }
    );

    // Kuuntele käyttäjän vuorovaikutusta (painaminen) notifikaatioihin
    const responseSubscription = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        // Tämä triggeroituu kun käyttäjä painaa notifikaatiota
        if (onNotificationResponse) {
          onNotificationResponse(response);
        }
        console.log('[Notification] Response:', response.notification.request.content.body);
      }
    );

    // Palauta cleanup-funktio
    return () => {
      notificationSubscription.remove();
      responseSubscription.remove();
    };
  } catch (error) {
    console.warn('[Notification] Error subscribing to notifications:', error);
    // Palauta tyhjä cleanup-funktio jos tilaus epäonnistui
    return () => {};
  }
}

/**
 * Lähettää testin notifikaation (demo/debuggaus).
 * Hyödyllinen testattaessa notifikaatioita kehityksen aikana.
 */
export async function sendTestNotification(
  title: string = 'Test Notification',
  body: string = 'This is a test notification'
): Promise<void> {
  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data: { testId: 'test-notification' },
      },
      trigger: null, // Lähetetään välittömästi
    });
    console.log('[Notification] Test notification scheduled');
  } catch (error) {
    console.error('[Notification] Error sending test notification:', error);
  }
}
