import messaging from '@react-native-firebase/messaging';
import firestore from '@react-native-firebase/firestore';

class FCMService {
  private tokenRegistered = false;

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

  async registerToken(userId: string): Promise<string | null> {
    try {
      if (!this.tokenRegistered) {
        await this.requestPermission();
        this.tokenRegistered = true;
      }

      const token = await messaging().getToken();
      console.log('FCM Token obtained:', token ? `${token.substring(0, 20)}...` : 'null');
      
      // Store token in Firestore user document
      await firestore().collection('users').doc(userId).update({
        fcmToken: token,
        fcmTokenUpdatedAt: firestore.FieldValue.serverTimestamp(),
      });
      console.log('FCM Token stored in Firestore for user:', userId);

      // Listen for token refresh
      messaging().onTokenRefresh(async (newToken) => {
        await firestore().collection('users').doc(userId).update({
          fcmToken: newToken,
          fcmTokenUpdatedAt: firestore.FieldValue.serverTimestamp(),
        });
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

