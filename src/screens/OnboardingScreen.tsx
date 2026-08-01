import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Dimensions,
  TouchableOpacity,
  StatusBar,
  Animated,
  Easing,
  Image,
  Linking,
  Platform,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { H1, H2, BodyText, ButtonTextPrimary, H5 } from '../components/Text';
import { COLORS } from '../constants/colors';
import OnboardingCard from '../components/OnboardingCard';
import { IGMIllustration, KosIllustration, TirthMitraIllustration } from '../components/OnboardingIllustrations';
import PermissionBottomSheet from '../components/PermissionBottomSheet';
import { usePermissionContext } from '../contexts/PermissionContext';
import { FONT_SIZES } from '../constants/fonts';
import MetadataService from '../services/MetadataService';
import UpdateBottomSheet from '../components/UpdateBottomSheet';

const HAS_SEEN_ONBOARDING_KEY = '@has_seen_onboarding';

interface OnboardingScreenProps {
  navigation: any;
}

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const onboardingData = [
  {
    id: 1,
    image: require('../assets/explainerImages/second.jpg'),
  },
  {
    id: 2,
    image: require('../assets/explainerImages/third.jpg'),
  },
];

const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showPermissionSheet, setShowPermissionSheet] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const autoScrollTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const { allGranted, checkPermissions } = usePermissionContext();
  
  // Update check state
  const [showUpdateSheet, setShowUpdateSheet] = useState(false);
  const [updateData, setUpdateData] = useState<{
    title: string;
    message: string;
    forceUpdate: boolean;
  } | null>(null);
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;
  const spinAnim = useRef(new Animated.Value(0)).current;

  // Clear auto-scroll timer
  const clearAutoScrollTimer = () => {
    if (autoScrollTimerRef.current) {
      clearInterval(autoScrollTimerRef.current);
      autoScrollTimerRef.current = null;
    }
  };

  // Animation on slide change
  useEffect(() => {
    setIsAnimating(true);
    
    // Reset animation values
    fadeAnim.setValue(0);
    slideAnim.setValue(15);

    // Animate in with staggered timing
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 250,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 250,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
    ]).start(() => {
      setIsAnimating(false);
    });
  }, [currentIndex]);

  // Auto-scroll functionality
  useEffect(() => {
    clearAutoScrollTimer();
    
    if (!isAnimating && currentIndex < onboardingData.length - 1) {
      autoScrollTimerRef.current = setInterval(() => {
        setCurrentIndex(prev => prev + 1);
      }, 3000); // Auto-scroll every 3 seconds
    }

    return () => clearAutoScrollTimer();
  }, [currentIndex, isAnimating]);

  const handleNext = async () => {
    // Prevent multiple rapid clicks
    if (isAnimating || isLoading) return;
    
    clearAutoScrollTimer();
    setIsAnimating(true);
    
    if (currentIndex < onboardingData.length - 1) {
      // Move to next slide
      setCurrentIndex(prev => prev + 1);
      setIsAnimating(false);
    } else {
      // On last slide, mark onboarding as completed and navigate to Main
      try {
        await AsyncStorage.setItem(HAS_SEEN_ONBOARDING_KEY, 'true');
      } catch (error) {
        console.error('Error saving onboarding status:', error);
      }
      setIsAnimating(false);
      navigation.replace('Main');
    }
  };

  const handlePermissionGranted = async () => {
    setIsLoading(true);
    setShowPermissionSheet(false);
    // Mark onboarding as completed
    try {
      await AsyncStorage.setItem(HAS_SEEN_ONBOARDING_KEY, 'true');
    } catch (error) {
      console.error('Error saving onboarding status:', error);
    }
    // Start spinning animation
    Animated.loop(
      Animated.timing(spinAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      })
    ).start();
    // Small delay to show loading state
    setTimeout(() => {
      navigation.replace('Auth');
    }, 300);
  };

  const handlePermissionSkip = async () => {
    setIsLoading(true);
    setShowPermissionSheet(false);
    // Mark onboarding as completed
    try {
      await AsyncStorage.setItem(HAS_SEEN_ONBOARDING_KEY, 'true');
    } catch (error) {
      console.error('Error saving onboarding status:', error);
    }
    // Start spinning animation
    Animated.loop(
      Animated.timing(spinAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      })
    ).start();
    // Small delay to show loading state
    setTimeout(() => {
      navigation.replace('Auth');
    }, 300);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearAutoScrollTimer();
      spinAnim.stopAnimation();
    };
  }, []);

  // Check for app updates on screen mount
  useEffect(() => {
    const checkForUpdates = async () => {
      try {
        // Fetch metadata
        await MetadataService.fetchMetadata(true);
        
        // Check if update is required
        const needsUpdate = await MetadataService.checkForUpdate();
        const metadata = MetadataService.getMetadata();
        
        if (needsUpdate && metadata) {
          console.log('🔔 Update available for new user');
          setUpdateData({
            title: metadata.updateTitle,
            message: metadata.updateMessage,
            forceUpdate: metadata.updateRequired,
          });
          setShowUpdateSheet(true);
        }
      } catch (error) {
        console.error('Error checking for updates:', error);
      }
    };

    checkForUpdates();
  }, []);

  const handleUpdatePress = () => {
    // Open app store
    if (Platform.OS === 'ios') {
      Linking.openURL('https://apps.apple.com/app/your-app-id');
    } else {
      Linking.openURL('https://play.google.com/store/apps/details?id=com.yourapp');
    }
  };

  const handleDismissUpdate = () => {
    // Only allow dismiss if NOT a force update
    if (!updateData?.forceUpdate) {
      console.log('✅ Non-force update dismissed - continuing onboarding');
      setShowUpdateSheet(false);
    } else {
      console.log('🚫 Force update - dismiss blocked');
      // Don't allow dismiss on force update
    }
  };

  const currentSlide = onboardingData[currentIndex];

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle='light-content' backgroundColor={COLORS.black}/>
  
      {/* Full Screen Image */}
      <Image 
        source={currentSlide.image} 
        style={styles.fullScreenImage}
        resizeMode="cover"
      />

      {/* Overlay Content */}
      <View style={[styles.overlay, { paddingBottom: insets.bottom + 24 }]}>
        {/* Progress Indicators */}
        <View style={styles.progressContainer}>
          {onboardingData.map((_, index) => (
            <View
              key={index}
              style={[
                styles.progressDot,
                {
                  backgroundColor:
                    index === currentIndex ? COLORS.white : 'rgba(255, 255, 255, 0.5)',
                },
              ]}
            />
          ))}
        </View>

        {/* Button */}
        <TouchableOpacity 
          style={[
            styles.nextButton,
            (isAnimating || isLoading) && styles.nextButtonDisabled
          ]} 
          onPress={handleNext}
          activeOpacity={0.7}
          disabled={isAnimating || isLoading}
        >
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <Animated.View 
                style={[
                  styles.loadingSpinner,
                  {
                    transform: [{
                      rotate: spinAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: ['0deg', '360deg'],
                      })
                    }]
                  }
                ]} 
              />
              <ButtonTextPrimary size='lg' style={styles.loadingText}>
                Loading...
              </ButtonTextPrimary>
            </View>
          ) : (
            <ButtonTextPrimary size='lg' style={{ color: COLORS.white }}>
              {currentIndex < onboardingData.length - 1 ? 'Next' : 'Get Started'}
            </ButtonTextPrimary>
          )}
        </TouchableOpacity>
      </View>

      {/* Update Bottom Sheet */}
      {updateData && (
        <UpdateBottomSheet
          visible={showUpdateSheet}
          forceUpdate={updateData.forceUpdate}
          title={updateData.title}
          message={updateData.message}
          onUpdatePress={handleUpdatePress}
          onDismiss={handleDismissUpdate}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.black,
  },
  fullScreenImage: {
    width: screenWidth,
    height: screenHeight,
    position: 'absolute',
    top: 0,
    left: 0,
  },
  overlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 24,
    paddingTop: 24,
    backgroundColor: 'transparent',
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  nextButton: {
    backgroundColor: COLORS.black,
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
    opacity: 0.9,
  },
  nextButtonDisabled: {
    opacity: 0.6,
    shadowOpacity: 0.05,
    elevation: 2,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loadingSpinner: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: COLORS.white,
    borderTopColor: 'transparent',
    borderRadius: 10,
  },
  loadingText: {
    color: COLORS.white,
  },
});

export default OnboardingScreen;
