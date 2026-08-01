/**
 * @format
 */

import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';
import messaging from '@react-native-firebase/messaging';

// Register background handler for FCM (must be outside React component)
messaging().setBackgroundMessageHandler(async (remoteMessage) => {
  console.log('FCM background message received:', JSON.stringify(remoteMessage, null, 2));
  // Background notifications are displayed automatically by FCM/OS
  // This handler is for processing data payload if needed
});

AppRegistry.registerComponent(appName, () => App);
