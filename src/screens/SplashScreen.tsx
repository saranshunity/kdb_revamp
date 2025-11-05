import React, { useEffect } from 'react';
import { View, StyleSheet, StatusBar, Image, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS } from '../constants/colors';
import { useAuth } from '../contexts/AuthContext';
import MetadataService from '../services/MetadataService';

const HAS_SEEN_ONBOARDING_KEY = '@has_seen_onboarding';

interface SplashScreenProps {
  navigation: any;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  // PHASE 1: Authentication disabled - keeping for Phase 2
  // const { isAuthenticated, isLoading } = useAuth();

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
      
      // PHASE 1: Skip authentication - go directly to onboarding or home based on onboarding status
      // TODO: Re-enable authentication check for Phase 2
      // Continue normal flow - let OnboardingScreen/HomeScreen handle update checks
      const timer = setTimeout(async () => {
        // Check if it's the first time opening the app
        try {
          const hasSeenOnboarding = await AsyncStorage.getItem(HAS_SEEN_ONBOARDING_KEY);
          
          if (hasSeenOnboarding === null) {
            // First time - show onboarding
            navigation.replace('Onboarding');
          } else {
            // Onboarding already seen - navigate directly to HomeScreen (skip auth)
            navigation.replace('Main');
          }
        } catch (error) {
          console.error('Error checking onboarding status:', error);
          // On error, navigate to Main
          navigation.replace('Main');
        }
      }, 2000);

      return () => clearTimeout(timer);
    };

    initializeApp();
  }, [navigation]); // Removed isLoading and isAuthenticated from dependencies for Phase 1


  return (
    <>
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <StatusBar barStyle='dark-content' backgroundColor={COLORS.white} />
        
        {/* Full-width and full-height image */}
        <Image 
          source={require('../assets/explainerImages/first.jpg')} 
          style={styles.fullScreenImage}
          resizeMode="cover"
        />
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  fullScreenImage: {
    width: '100%',
    height: '100%',
  },
});

export default SplashScreen;
