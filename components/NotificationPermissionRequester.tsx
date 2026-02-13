/**
 * NotificationPermissionRequester.tsx
 *
 * Komponentti, joka hallinnoi notifikaatioiden käyttöoikeuksien pyytämisen.
 *
 * Ominaisuudet:
 * - Alustaa notifikaatiopalvelun sovelluksen käynnistyessä
 * - Kuuntelee saapuvia notifikaatioita ja käyttäjän vuorovaikutusta niihin
 * - Tämä on "kontainerkomponentti" (container component) - ei renderöi näkyvää UI:ta,
 *   vaan hallinnoi notifikaatioiden logiikkaa sovelluksen taustalla
 * - Deep linking -tuki notifikaatioihin painamisesta
 *
 * Ekosysteemi:
 * - iOS: Permissio-dialogi näytetään sovelluksen ensimmäisellä käynnistämisellä (Expo Go ja standalone)
 * - Android Expo Go: Push-notifikaatiot eivät tuettuja (kehitysympäristön rajoitus)
 * - Android APK/AAB: Permissio-dialogi näytetään ja notifikaatiot toimivat (tuotanto ja kehitys)
 *
 * Käyttötapa:
 *   Aseta näiden rakentava RootLayout-komponentissa kaikkien muiden providerien ulkopuolelle:
 *   <NotificationPermissionRequester>
 *     <Stack />
 *   </NotificationPermissionRequester>
 */

import { useNotificationPermission } from '@/hooks/useNotificationPermission';
import { initializeNotifications, subscribeToNotifications } from '@/services/notificationService';
import * as Notifications from 'expo-notifications';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';

export function NotificationPermissionRequester({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { hasPermission } = useNotificationPermission();

  useEffect(() => {
    // Alusta notifikaatiopalvelu
    initializeNotifications();

    // Kuuntele notifikaatioita
    const unsubscribe = subscribeToNotifications(
      (notification) => {
        // Notifikaatio vastaanotettu sovelluksen ollessa aktiivinen
        console.log('[NotificationPermissionRequester] Notification received:', notification);
      },
      (response) => {
        // Käyttäjä painoi notifikaatiota - mahdollinen deep linking
        const data = response.notification.request.content.data;
        console.log('[NotificationPermissionRequester] Notification response:', data);

        // Esimerkki: Jos notifikaatiossa on leadId, navigoi lead-detaljiin
        if (data?.leadId) {
          router.push(`/lead/${data.leadId}`);
        }
        // Esimerkki: Jos notifikaatiossa on quoteId, navigoi quote-builderiin
        if (data?.quoteId) {
          router.push(`/lead/${data.leadId}/quote`);
        }
      }
    );

    // Tarkista myös taustasta tulevat notifikaatiot sovelluksen käynnistäessä
    (async () => {
      const notification = await Notifications.getLastNotificationResponseAsync();
      if (notification) {
        console.log('[NotificationPermissionRequester] App opened from notification:', notification);
        const data = notification.notification.request.content.data;
        if (data?.leadId) {
          router.push(`/lead/${data.leadId}`);
        }
      }
    })();

    return unsubscribe;
  }, [router]);

  // Komponenti ei renderöi mitään UI:ta - se vain hallinnoi logiikkaa taustalla
  return <>{children}</>;
}
