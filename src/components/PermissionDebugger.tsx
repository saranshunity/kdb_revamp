import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { H3, BodyText } from './Text';
import { COLORS } from '../constants/colors';
import { FONTS, FONT_SIZES } from '../constants/fonts';
import PermissionService from '../services/PermissionService';
import Ionicons from "react-native-vector-icons/Ionicons";

const PermissionDebugger: React.FC = () => {
  const [debugInfo, setDebugInfo] = useState<string>('');

  const runDebug = () => {
    console.log('=== Running Permission Debug ===');
    PermissionService.debugPermissions();
    
    // Test individual permissions
    PermissionService.checkLocationPermission().then(result => {
      console.log('Location permission result:', result);
    });
    
    PermissionService.checkNotificationPermission().then(result => {
      console.log('Notification permission result:', result);
    });
    
    setDebugInfo('Debug info logged to console. Check Metro logs.');
  };

  const testNotificationRequest = async () => {
    try {
      console.log('Testing notification permission request...');
      const result = await PermissionService.requestNotificationPermission();
      console.log('Notification request result:', result);
      setDebugInfo(`Notification result: ${result.status}`);
    } catch (error) {
      console.error('Notification request error:', error);
      setDebugInfo(`Error: ${error.message || error}`);
    }
  };

  return (
    <View style={styles.container}>
      <H3 style={styles.title} color={COLORS.text.primary} weight='bold' size='lg'>
        Permission Debugger
      </H3>
      
      <TouchableOpacity style={styles.button} onPress={runDebug}>
        <Ionicons name="bug-outline" size={20} color={COLORS.white} />
        <BodyText style={styles.buttonText} color={COLORS.white} size='md' weight='semiBold'>
          Run Debug
        </BodyText>
      </TouchableOpacity>
      
      <TouchableOpacity style={styles.button} onPress={testNotificationRequest}>
        <Ionicons name="notifications-outline" size={20} color={COLORS.white} />
        <BodyText style={styles.buttonText} color={COLORS.white} size='md' weight='semiBold'>
          Test Notification Request
        </BodyText>
      </TouchableOpacity>
      
      {debugInfo ? (
        <View style={styles.debugInfo}>
          <BodyText style={styles.debugText} color={COLORS.text.primary} size='sm'>
            {debugInfo}
          </BodyText>
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: COLORS.background.tertiary,
    borderRadius: 12,
    margin: 20,
  },
  title: {
    fontFamily: FONTS.gilroy.bold,
    fontSize: FONT_SIZES.lg,
    marginBottom: 16,
    textAlign: 'center',
  },
  button: {
    backgroundColor: COLORS.appColor,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginBottom: 12,
    gap: 8,
  },
  buttonText: {
    fontFamily: FONTS.gilroy.semiBold,
    fontSize: FONT_SIZES.md,
  },
  debugInfo: {
    marginTop: 16,
    padding: 12,
    backgroundColor: COLORS.background.primary,
    borderRadius: 8,
  },
  debugText: {
    fontFamily: FONTS.gilroy.regular,
    fontSize: FONT_SIZES.sm,
  },
});

export default PermissionDebugger;
