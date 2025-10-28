import React, { useEffect, useState } from 'react';
import { View, StyleSheet, StatusBar, Image, Linking, Alert, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { H1, BodyText } from '../components/Text';
import { COLORS } from '../constants/colors';
import { useAuth } from '../contexts/AuthContext';
import MetadataService from '../services/MetadataService';

interface SplashScreenProps {
  navigation: any;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    const initializeApp = async () => {
      // Check maintenance mode
      const isMaintenance = await MetadataService.isMaintenanceMode();
      if (isMaintenance) {
        const metadata = MetadataService.getMetadata();
        // Handle maintenance mode
        Alert.alert(
          'Maintenance',
          metadata?.maintenanceMessage || 'The app is currently under maintenance. Please try again later.'
        );
        return;
      }
      
      // Continue normal flow - let OnboardingScreen/HomeScreen handle update checks
      if (!isLoading) {
        const timer = setTimeout(() => {
          if (isAuthenticated) {
            navigation.replace('Main');
          } else {
            navigation.replace('Onboarding');
          }
        }, 2000);

        return () => clearTimeout(timer);
      }
    };

    initializeApp();
  }, [isLoading, isAuthenticated, navigation]);


  return (
    <>
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <StatusBar barStyle='dark-content' backgroundColor={COLORS.white} />

        <View style={styles.content}>
          {/* Logo placeholder - replace with actual KDB logo */}
          <View style={styles.logoContainer}>
            <View style={styles.logoPlaceholder}>
              <Image source={require('../assets/images/appLogo.png')} style={{width: 100, height: 100}} />
            </View>
          </View>

          {/* <View style={styles.textContainer}>
            <H1 color={COLORS.white} weight='bold'>
             48 Kos Kurukshetra
            </H1>
            {/* <BodyText
              color={COLORS.text.secondary}
              size='lg'
              style={styles.subtitle}
            >
              Your trusted financial partner
            </BodyText> */}
          {/* </View>  */}

          {/* <View style={styles.loadingContainer}>
            <View style={styles.loadingBar}>
              <View style={styles.loadingProgress} />
            </View>
            <BodyText
              color={COLORS.text.tertiary}
              size='sm'
              style={styles.loadingText}
            >
              Loading...
            </BodyText>
          </View> */}
        </View>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white
    ,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  logoContainer: {
    marginBottom: 48,
  },
  logoPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.white,
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: 64,
  },
  subtitle: {
    marginTop: 8,
    textAlign: 'center',
  },
  loadingContainer: {
    alignItems: 'center',
    width: '100%',
  },
  loadingBar: {
    width: '100%',
    height: 4,
    backgroundColor: COLORS.border.light,
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 16,
  },
  loadingProgress: {
    width: '30%',
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 2,
  },
  loadingText: {
    textAlign: 'center',
  },
});

export default SplashScreen;
