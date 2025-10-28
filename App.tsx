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