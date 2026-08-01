import { Alert, Platform } from 'react-native';
import PushNotification, { Importance } from 'react-native-push-notification';
import { check, request, PERMISSIONS, RESULTS } from 'react-native-permissions';

class NotificationService {
  private initialized = false;

  init() {
    if (this.initialized) return;

    // Configure callbacks (minimal local-only setup)
    PushNotification.configure({
      onRegister: () => {},
      onNotification: () => {},
      // Permissions only relevant on iOS; Android 13+ handled by manifest/runtime
      requestPermissions: Platform.OS === 'ios',
      popInitialNotification: true,
    });

    // Ensure notification channels on Android (required for FCM)
    if (Platform.OS === 'android') {
      // Android 13+ notifications runtime permission
      this.ensureAndroidPermission().catch(() => {});
      
      // Create default channel (used if FCM doesn't specify channel)
      PushNotification.createChannel(
        {
          channelId: 'default',
          channelName: 'Default Notifications',
          channelDescription: 'Default notification channel',
          importance: Importance.HIGH,
          vibrate: true,
        },
        (created: boolean) => console.log('Default channel created:', created)
      );
      
      // Create reminders channel
      PushNotification.createChannel(
        {
          channelId: 'reminders',
          channelName: 'Event Reminders',
          channelDescription: 'Notifications for scheduled event reminders',
          importance: Importance.HIGH,
          vibrate: true,
        },
        (created: boolean) => console.log('Reminders channel created:', created)
      );
    }

    this.initialized = true;
  }

  private async ensureAndroidPermission(): Promise<void> {
    try {
      // Only Android 13+ requires runtime POST_NOTIFICATIONS
      const sdk = (Platform as any).Version as number;
      if (sdk >= 33) {
        // POST_NOTIFICATIONS may not be in older versions of react-native-permissions
        const postNotifications = (PERMISSIONS.ANDROID as any).POST_NOTIFICATIONS;
        if (postNotifications) {
          const status = await check(postNotifications);
          if (status !== RESULTS.GRANTED) {
            await request(postNotifications);
          }
        }
      }
    } catch {}
  }

  async scheduleLocalNotification(params: {
    title: string;
    body: string;
    notifyAt: Date;
    androidChannelId?: string;
  }): Promise<string> {
    this.init();
    // Clamp schedule time to at least 15 seconds in the future
    const minDate = new Date(Date.now() + 15000);
    const fireDate = new Date(Date.now() + 5 * 60 * 1000);
    Alert.alert('Scheduling notification', JSON.stringify({
      fireDate: fireDate.toISOString(),
      now: new Date().toISOString(),
    }));
    const id = `${fireDate.getTime()}-${Math.floor(Math.random() * 100000)}`;
    PushNotification.localNotificationSchedule({
      channelId: params.androidChannelId || 'reminders',
      id,
      title: params.title,
      message: params.body,
      date: fireDate,
      allowWhileIdle: true,
      // Android specifics (omit smallIcon to fall back to app icon)
      priority: 'high',
      importance: Importance.HIGH,
      vibrate: true,
      visibility: 'public',
      playSound: true,
      soundName: 'default',
      // iOS
      userInfo: { id },
    });
    return id;
  }

  async pingNow(title = 'Test Notification', body = 'This is a test'): Promise<void> {
    this.init();
    PushNotification.localNotification({
      channelId: 'reminders',
      title,
      message: body,
      allowWhileIdle: true,
      // omit smallIcon to fall back to app icon
      priority: 'high',
      importance: Importance.HIGH,
      playSound: true,
      soundName: 'default',
    });
  }

  async cancelLocalNotification(notificationId?: string): Promise<void> {
    if (!notificationId) return;
    this.init();
    PushNotification.cancelLocalNotifications({ id: notificationId });
  }
}

export default new NotificationService();


