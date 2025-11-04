import React, { useState, useRef } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { WebView } from 'react-native-webview';
import { H1 } from '../../components/Text';
import { COLORS } from '../../constants/colors';
import { RootStackParamList } from '../../navigation/AppNavigator';
import Ionicons from 'react-native-vector-icons/Ionicons';

type TirthWebViewScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'TirthWebView'>;
type TirthWebViewScreenRouteProp = RouteProp<RootStackParamList, 'TirthWebView'>;

const TirthWebViewScreen = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<TirthWebViewScreenNavigationProp>();
  const route = useRoute<TirthWebViewScreenRouteProp>();
  const webViewRef = useRef<WebView>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [canGoBack, setCanGoBack] = useState(false);

  const { url, title } = route.params;

  const handleBack = () => {
    if (canGoBack && webViewRef.current) {
      webViewRef.current.goBack();
    } else {
      navigation.goBack();
    }
  };

  const handleWebViewNavigationStateChange = (navState: any) => {
    setCanGoBack(navState.canGoBack);
    setIsLoading(navState.loading);
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
          {title || 'Tirth Details'}
        </H1>
        <View style={styles.headerRight} />
      </View>

      {/* WebView */}
      <WebView
        ref={webViewRef}
        source={{ uri: url }}
        style={styles.webview}
        onNavigationStateChange={handleWebViewNavigationStateChange}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={false}
        scalesPageToFit={true}
        incognito={false}
      />
      
      {/* Single Loading Indicator */}
      {isLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      )}
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
  headerRight: {
    width: 40,
  },
  webview: {
    flex: 1,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background.primary,
    zIndex: 999,
  },
});

export default TirthWebViewScreen;
