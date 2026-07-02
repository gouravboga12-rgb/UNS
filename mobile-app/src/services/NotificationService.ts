import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true
  }),
});

// 1. Request notifications permission
export async function registerForPushNotificationsAsync() {
  if (!Notifications) return null;
  
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#0F766E',
    });
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  
  return finalStatus === 'granted';
}

// 2. Schedule Welcome notification
export async function scheduleWelcomeNotification() {
  if (!Notifications) {
    console.log('[Notification mock] Welcome to UNS Cleaning! Clean Today... Healthy Tomorrow...');
    return;
  }

  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Welcome to UNS Cleaning! 🎉",
        body: "Get wholesale-priced, toxin-free cleaning products delivered direct from the factory.",
        data: { screen: 'HomeTab' },
      },
      trigger: { seconds: 3 } as any, // Show 3 seconds after register
    });
  } catch (err) {
    console.warn('Failed to schedule welcome notification:', err);
  }
}

// 3. Schedule Zomato/Swiggy-style marketing reminders
export async function scheduleMarketingReminders() {
  if (!Notifications) {
    console.log('[Notification mock] Zomato-style: Heavy rain outside? Keep germs away with UNS Phenyl.');
    return;
  }

  try {
    // Clear previous scheduled reminders
    await Notifications.cancelAllScheduledNotificationsAsync();

    // Welcome Alert (in 3s)
    await scheduleWelcomeNotification();

    // 1st reminder: Swiggy-style rain alert (in 30 mins)
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "💧 Heavy Rain outside?",
        body: "Keep your floors dry, sanitised, and sparkling clean. UNS Disinfectant starting at just ₹99!",
        sound: true,
      },
      trigger: { seconds: 1800 } as any,
    });

    // 2nd reminder: Re-order check (in 24 hours / daily)
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "🕒 Time for weekly cleaning?",
        body: "Check your cabinet! Re-order UNS Handwash and Toilet Cleaner now for free shipping above ₹500.",
        sound: true,
      },
      trigger: { 
        seconds: 86400,
        repeats: true 
      } as any,
    });
  } catch (err) {
    console.warn('Failed to schedule marketing notifications:', err);
  }
}

// 4. Trigger Instant Order status shift alert
export async function triggerOrderStatusNotification(orderId: string, newStatus: string) {
  if (!Notifications) {
    console.log(`[Notification mock] Order UNS-#${orderId} status shifted to: ${newStatus}`);
    return;
  }

  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: `📦 Order Update: UNS-#${orderId}`,
        body: `Your order status has changed to: ${newStatus}. Tap to track shipment progress.`,
        data: { screen: 'TrackOrderTab', orderId },
      },
      trigger: null, // Instant trigger
    });
  } catch (err) {
    console.warn('Failed to trigger order update notification:', err);
  }
}
