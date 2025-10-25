/**
 * KDB Revamp Mobile App
 * A modern banking application built with React Native
 *
 * @format
 */

import React, { useEffect } from 'react';
import { Alert, StatusBar } from 'react-native';
import AppNavigator from './src/navigation/AppNavigator';
import { firebase } from './src/firebaseConfig';

function App(): React.JSX.Element {
  useEffect(() => {
    try {
      const app = firebase.app();
        Alert.alert('Firebase initialized', app.name);// Should log [DEFAULT]
    } catch (error) {
      Alert.alert('❌ Firebase initialization error:', (error as Error).message);
    }
  }, []);
  return (
    <>
      <StatusBar barStyle='dark-content' backgroundColor='#ffffff' />
      <AppNavigator />
    </>
  );
}

export default App;