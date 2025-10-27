import React, { useState, useRef } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { WebView } from 'react-native-webview';
import { H1, ButtonTextPrimary } from '../../components/Text';
import { COLORS } from '../../constants/colors';
import Ionicons from 'react-native-vector-icons/Ionicons';

const PaymentWebViewScreen = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const webViewRef = useRef<WebView>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [canGoBack, setCanGoBack] = useState(false);

  const PAYMENT_URL = 'https://thanesarinfo.com/payment';

  const handleBack = () => {
    if (canGoBack && webViewRef.current) {
      webViewRef.current.goBack();
    } else {
      handleClose();
    }
  };

  const handleClose = () => {
    Alert.alert(
      'Cancel Payment?',
      'Are you sure you want to cancel the payment?',
      [
        { text: 'Continue Payment', style: 'cancel' },
        {
          text: 'Cancel',
          style: 'destructive',
          onPress: () => navigation.goBack(),
        },
      ]
    );
  };

  const handleWebViewNavigationStateChange = (navState: any) => {
    setCanGoBack(navState.canGoBack);
    setIsLoading(navState.loading);
  };

  const handleWebViewMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      
      // Handle payment success/failure messages from the payment gateway
      if (data.type === 'payment_success') {
        Alert.alert(
          'Payment Successful!',
          'Your payment has been processed successfully. You will receive a confirmation email shortly.',
          [
            {
              text: 'OK',
              onPress: () => navigation.goBack(),
            },
          ]
        );
      } else if (data.type === 'payment_failure') {
        Alert.alert(
          'Payment Failed',
          data.message || 'Payment could not be processed. Please try again.',
          [
            { text: 'OK' },
          ]
        );
      }
    } catch (error) {
      // Not a JSON message, ignore
    }
  };

  // Check for payment completion by monitoring URL changes
  const handleShouldStartLoadWithRequest = (request: any) => {
    const url = request.url;
    
    // Check if URL indicates payment completion
    if (url.includes('success') || url.includes('payment-success')) {
      // Payment success detected
      Alert.alert(
        'Payment Successful!',
        'Your payment has been processed successfully.',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
      return false; // Prevent navigation
    } else if (url.includes('failure') || url.includes('cancel')) {
      // Payment failure/cancel detected
      Alert.alert(
        'Payment Cancelled',
        'Your payment was cancelled. You can try again.',
        [
          { text: 'OK' },
        ]
      );
      return false; // Prevent navigation
    }
    
    return true; // Allow navigation
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle='dark-content' backgroundColor={COLORS.background.primary} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={handleBack}
        >
          <Ionicons 
            name="arrow-back" 
            size={24} 
            color={COLORS.text.primary} 
          />
        </TouchableOpacity>
        <H1 color={COLORS.text.primary} weight='bold' size='lg'>
          Payment Gateway
        </H1>
        <TouchableOpacity 
          style={styles.closeButton}
          onPress={handleClose}
        >
          <Ionicons name="close" size={24} color={COLORS.text.primary} />
        </TouchableOpacity>
      </View>

      {/* Loading Indicator */}
      {isLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      )}

      {/* WebView */}
      <WebView
        ref={webViewRef}
        source={{ uri: PAYMENT_URL }}
        style={styles.webview}
        onNavigationStateChange={handleWebViewNavigationStateChange}
        onMessage={handleWebViewMessage}
        onShouldStartLoadWithRequest={handleShouldStartLoadWithRequest}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={true}
        scalesPageToFit={true}
        incognito={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background.primary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.background.tertiary,
  },
  backButton: {
    padding: 8,
  },
  closeButton: {
    padding: 8,
  },
  loadingContainer: {
    position: 'absolute',
    top: 70,
    left: 0,
    right: 0,
    height: 4,
    zIndex: 10,
  },
  webview: {
    flex: 1,
  },
});

export default PaymentWebViewScreen;
