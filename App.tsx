/**
 * KDB Revamp Mobile App
 * A modern banking application built with React Native
 *
 * @format
 */

import React, { useEffect } from 'react';
import { Alert, StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppNavigator from './src/navigation/AppNavigator';
import { firebase } from './src/firebaseConfig';
import { AuthProvider } from './src/contexts/AuthContext';
import { NoInternetProvider } from './src/contexts/NoInternetContext';
import GlobalNoInternetBottomSheet from './src/components/GlobalNoInternetBottomSheet';
import FCMService from './src/services/FCMService';
import NotificationService from './src/services/NotificationService';
import messaging from '@react-native-firebase/messaging';
import FirebaseService from './src/services/FirebaseService';
import { navigateWhenReady } from './src/navigation/navigationRef';

function App(): React.JSX.Element {
  useEffect(() => {
    try {
      const app = firebase.app();
      console.log('Firebase initialized', app.name);// Should log [DEFAULT]
        // Alert.alert('Firebase initialized', app.name);// Should log [DEFAULT]
    } catch (error) {
      Alert.alert('❌ Firebase initialization error:', (error as Error).message);
    }
  }, []);
  useEffect(() => {
    // Initialize notification service FIRST (creates Android channel)
    NotificationService.init();
    console.log('✅ NotificationService initialized - channel created');
    
    // Setup FCM foreground handler
    const resolveUpdateItemFromData = async (data: Record<string, string>) => {
      if (!data) return null;

      const jsonFields = ['item', 'payload', 'data'];
      for (const field of jsonFields) {
        if (data[field]) {
          try {
            const parsed = JSON.parse(data[field]);
            if (parsed?.id && parsed?.title) {
              return parsed;
            }
          } catch (error) {
            console.warn('Failed to parse update payload JSON:', error);
          }
        }
      }

      const normalizeCategories = (raw?: string) => {
        if (!raw) return undefined;
        try {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) {
            return parsed;
          }
        } catch {
          // ignore
        }
        return raw.split(',').map((entry) => entry.trim()).filter(Boolean);
      };

      const fallbackId = data.id || data.updateId;
      const fallbackTitle = data.title;
      if (fallbackId && fallbackTitle) {
        return {
          id: fallbackId,
          title: fallbackTitle,
          image: data.image,
          categories: normalizeCategories(data.categories) || ['Update'],
          description: data.description,
          location: data.location,
          organizer: data.organizer,
          time: data.time,
          date: data.date,
        };
      }

      if (fallbackId) {
        try {
          const updates = await FirebaseService.getMahotsavHulchal();
          return updates.find((entry) => entry.id === fallbackId) || null;
        } catch (error) {
          console.error('Error fetching updates for notification:', error);
        }
      }

      return null;
    };

    const handleNotificationNavigation = async (remoteMessage: any) => {
      const data = remoteMessage?.data;
      if (!data) {
        return;
      }
      const isUpdateNotification =
        data.type === 'update' ||
        data.updateId ||
        data.screen === 'UpdateDetail' ||
        !!data.item;

      if (!isUpdateNotification) {
        return;
      }

      const payload = await resolveUpdateItemFromData(data);
      if (payload) {
        navigateWhenReady('UpdateDetail', { item: payload });
      }
    };

    const unsubscribe = FCMService.setupForegroundHandler((remoteMessage: any) => {
      console.log('🔔 FCM foreground message received!', JSON.stringify(remoteMessage, null, 2));
      
      if (remoteMessage.notification) {
        // Display notification using local notification service (for Android foreground)
        NotificationService.pingNow(
          remoteMessage.notification.title || 'Reminder',
          remoteMessage.notification.body || ''
        ).catch((e) => {
          console.error('Error showing notification:', e);
        });
      }
    });

    // Handle notification tap when app is opened from background
    const unsubscribeNotificationOpened = messaging().onNotificationOpenedApp((remoteMessage: any) => {
      console.log('Notification opened app:', remoteMessage);
      handleNotificationNavigation(remoteMessage);
    });

    // Handle notification tap when app is opened from quit state
    messaging()
      .getInitialNotification()
      .then((remoteMessage: any) => {
        if (remoteMessage) {
          console.log('Notification opened from quit:', remoteMessage);
          handleNotificationNavigation(remoteMessage);
        }
      });

    return () => {
      unsubscribe();
      unsubscribeNotificationOpened();
    };
  }, []);

  useEffect(() => {
    FCMService.registerToken().catch((error) => {
      console.error('Anonymous FCM registration failed:', error);
    });
  }, []);
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <NoInternetProvider>
          <StatusBar barStyle='dark-content' backgroundColor='#ffffff' />
          <AppNavigator />
          <GlobalNoInternetBottomSheet />
        </NoInternetProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}

export default App;