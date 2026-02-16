import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

/**
 * Notification Service
 * P0 #70, #71, #72: expo-notifications setup, local notif, deep linking
 * 
 * HUOM: setNotificationHandler pitää kutsua ennen kuin notifikaatioita käytetään,
 * mutta ei moduulin latauksen yhteydessä (race condition riski).
 * Kutsu initNotifications() app/_layout.tsx:ssä.
 */

let isInitialized = false;

/**
 * Alusta notification handler
 * Kutsu tämä kerran app-startupin yhteydessä (esim. RootLayout useEffect)
 */
export function initNotifications(): void {
  if (isInitialized) {
    console.log('⚠️ Notifications already initialized');
    return;
  }

  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
      shouldShowBanner: true,    // iOS notification banner
      shouldShowList: true,      // iOS notification list
    }),
  });

  isInitialized = true;
  console.log('✅ Notification handler initialized');
}

/**
 * Pyydä notifikaatio-oikeudet käyttäjältä
 * P0 #70: expo-notifications setup + permission
 */
export async function requestNotificationPermission(): Promise<boolean> {
  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.warn('❌ Notification permission denied');
      return false;
    }

    // Android vaatii notification channelin
    if (Platform.OS === 'android') {
      try {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'QuoteFlow Notifications',
          importance: Notifications.AndroidImportance.HIGH,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#FF231F7C',
        });
        console.log('✅ Android notification channel created');
      } catch (channelError) {
        console.error('❌ Failed to create Android channel:', channelError);
        // Jatka silti - channel voi olla jo olemassa
      }
    }

    console.log('✅ Notification permission granted');
    return true;
  } catch (error) {
    console.error('❌ Error requesting notification permission:', error);
    return false;
  }
}

/**
 * Lähetä notifikaatio uudesta liidistä
 * P0 #71: "Uusi liidi" → local notification
 */
export async function triggerLeadNotification(
  leadId: string,
  customerName: string
): Promise<void> {
  // Validoi input
  if (!leadId || !customerName) {
    console.error('❌ Invalid notification params:', { leadId, customerName });
    return;
  }

  if (!isInitialized) {
    console.error('❌ Notifications not initialized. Call initNotifications() first.');
    return;
  }

  try {
    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: '🔔 Uusi liidi!',
        body: `${customerName} haluaa tarjouksen`,
        data: { 
          url: `/lead/${leadId}`,
          leadId: leadId,
          type: 'new_lead'
        },
      },
      trigger: null, // Lähetä heti
    });
    
    console.log('✅ Notification sent:', notificationId, 'for lead:', leadId);
  } catch (error) {
    console.error('❌ Failed to send notification:', error);
  }
}

/**
 * Testi-notifikaatio debug-nappiin
 * P1 #73: Debug-nappi: "Trigger test notification"
 */
export async function triggerTestNotification(): Promise<void> {
  console.log('🧪 Triggering test notification...');
  await triggerLeadNotification('test-123', 'Test Customer Oy');
}