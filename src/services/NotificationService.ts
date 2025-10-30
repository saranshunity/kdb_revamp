import { Platform } from 'react-native';
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

    // Ensure a default reminders channel on Android
    if (Platform.OS === 'android') {
      // Android 13+ notifications runtime permission
      this.ensureAndroidPermission().catch(() => {});
      PushNotification.createChannel(
        {
          channelId: 'reminders',
          channelName: 'Event Reminders',
          channelDescription: 'Notifications for scheduled event reminders',
          importance: Importance.HIGH,
          vibrate: true,
        },
        () => {}
      );
    }

    this.initialized = true;
  }

  private async ensureAndroidPermission(): Promise<void> {
    try {
      // Only Android 13+ requires runtime POST_NOTIFICATIONS
      const sdk = (Platform as any).Version as number;
      if (sdk >= 33) {
        const status = await check(PERMISSIONS.ANDROID.POST_NOTIFICATIONS);
        if (status !== RESULTS.GRANTED) {
          await request(PERMISSIONS.ANDROID.POST_NOTIFICATIONS);
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
    const id = `${params.notifyAt.getTime()}-${Math.floor(Math.random() * 100000)}`;
    PushNotification.localNotificationSchedule({
      channelId: params.androidChannelId || 'reminders',
      id,
      title: params.title,
      message: params.body,
      date: params.notifyAt,
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


