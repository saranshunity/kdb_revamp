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
    const unsubscribe = FCMService.setupForegroundHandler((remoteMessage: any) => {
      console.log('🔔 FCM foreground message received!', JSON.stringify(remoteMessage, null, 2));
      Alert.alert('FCM Received', `Title: ${remoteMessage.notification?.title}\nBody: ${remoteMessage.notification?.body}`);
      
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
    messaging().onNotificationOpenedApp((remoteMessage: any) => {
      console.log('Notification opened app:', remoteMessage);
    });

    // Handle notification tap when app is opened from quit state
    messaging()
      .getInitialNotification()
      .then((remoteMessage: any) => {
        if (remoteMessage) {
          console.log('Notification opened from quit:', remoteMessage);
        }
      });

    return () => unsubscribe();
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