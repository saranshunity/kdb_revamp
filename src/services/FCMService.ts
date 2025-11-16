import messaging from '@react-native-firebase/messaging';
import firestore from '@react-native-firebase/firestore';
import DeviceInfo from 'react-native-device-info';
import { Platform } from 'react-native';

class FCMService {
  private tokenRegistered = false;
  private refreshUnsubscribe: (() => void) | null = null;

  async requestPermission(): Promise<boolean> {
    try {
      const authStatus = await messaging().requestPermission();
      const isAuthorized = authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
                           authStatus === messaging.AuthorizationStatus.PROVISIONAL;
      console.log('FCM Permission Status:', authStatus, 'Authorized:', isAuthorized);
      return isAuthorized;
    } catch (e) {
      console.error('FCM permission error:', e);
      return false;
    }
  }

  private getDeviceTokenRef(userId: string, deviceId: string) {
    return firestore()
      .collection('users')
      .doc(userId)
      .collection('deviceTokens')
      .doc(deviceId);
  }

  private getGlobalTokenRef(deviceId: string) {
    return firestore().collection('deviceTokens').doc(deviceId);
  }

  async registerToken(userId?: string | null): Promise<string | null> {
    try {
      if (!this.tokenRegistered) {
        await this.requestPermission();
        this.tokenRegistered = true;
      }

      const token = await messaging().getToken();
      console.log('FCM Token obtained:', token ? `${token.substring(0, 20)}...` : 'null');
      const deviceId = DeviceInfo.getUniqueId();
      const timestamp = firestore.FieldValue.serverTimestamp();
      const tokenData = {
        token,
        platform: Platform.OS,
        updatedAt: timestamp,
        deviceId,
        userId: userId || null,
      };

      let tokenDoc = this.getGlobalTokenRef(deviceId);

      if (userId) {
        tokenDoc = this.getDeviceTokenRef(userId, deviceId);

        await firestore().collection('users').doc(userId).set(
          {
            fcmToken: token,
            fcmTokenUpdatedAt: timestamp,
          },
          { merge: true }
        );
      }

      await tokenDoc.set(tokenData, { merge: true });
      console.log(
        'FCM token stored for device',
        deviceId,
        userId ? `user: ${userId}` : '(unauthenticated)'
      );

      // Listen for token refresh
      this.refreshUnsubscribe?.();
      this.refreshUnsubscribe = messaging().onTokenRefresh(async (newToken) => {
        try {
          const refreshTimestamp = firestore.FieldValue.serverTimestamp();
          if (userId) {
            await firestore().collection('users').doc(userId).set(
              {
                fcmToken: newToken,
                fcmTokenUpdatedAt: refreshTimestamp,
              },
              { merge: true }
            );
          }

          await tokenDoc.set(
            {
              token: newToken,
              platform: Platform.OS,
              updatedAt: refreshTimestamp,
              deviceId,
              userId: userId || null,
            },
            { merge: true }
          );
        } catch (refreshErr) {
          console.error('FCM token refresh update failed:', refreshErr);
        }
      });

      return token;
    } catch (e) {
      console.error('FCM token registration error:', e);
      return null;
    }
  }

  setupForegroundHandler(onMessage: (remoteMessage: any) => void) {
    return messaging().onMessage(onMessage);
  }

  setupBackgroundHandler(handler: (remoteMessage: any) => Promise<void>) {
    messaging().setBackgroundMessageHandler(handler);
  }
}

export default new FCMService();

