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

// Huom: emme importtaa expo-notifications -pakettia top-levelissä.
// Miksi?
// - Webissä paketti voi tulostaa varoituksia jo import-vaiheessa.
// - P0-demossa webille riittää “ei tee mitään” + ei virhespämmiä.
// - Natiivissa haluamme edelleen käyttää expo-notificationsia normaalisti.
type NotificationsModule = typeof import('expo-notifications');
let notificationsModule: NotificationsModule | null = null;

async function getNotifications(): Promise<NotificationsModule> {
  if (notificationsModule) return notificationsModule;
  notificationsModule = await import('expo-notifications');
  return notificationsModule;
}

function isWeb(): boolean {
  return Platform.OS === 'web';
}

/**
 * Alusta notification handler
 * Kutsu tämä kerran app-startupin yhteydessä (esim. RootLayout useEffect)
 */
export async function initNotifications(): Promise<void> {
  // Webissä expo-notifications on osittain tuettu ja osa API:sta (esim. scheduleNotificationAsync)
  // ei ole saatavilla. P0-demossa riittää että web ei kaadu tai spämmää virheitä.
  if (isWeb()) {
    return;
  }

  if (isInitialized) {
    console.log('⚠️ Notifications already initialized');
    return;
  }

  const Notifications = await getNotifications();

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
  // Webissä ei pyydetä natiivioikeuksia (ei hyötyä) -> palautetaan false hiljaisesti.
  if (isWeb()) {
    return false;
  }

  try {
    const Notifications = await getNotifications();
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
  // Webissä local notification -ajastus ei ole käytettävissä -> ei tehdä mitään.
  if (isWeb()) {
    return;
  }

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
    const Notifications = await getNotifications();
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
  if (isWeb()) {
    return;
  }

  console.log('🧪 Triggering test notification...');
  await triggerLeadNotification('test-123', 'Test Customer Oy');
}