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
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { H1, H2, BodyText, ButtonTextPrimary, H5 } from '../components/Text';
import { COLORS } from '../constants/colors';
import OnboardingCard from '../components/OnboardingCard';
import { IGMIllustration, KosIllustration, TirthMitraIllustration } from '../components/OnboardingIllustrations';
import PermissionBottomSheet from '../components/PermissionBottomSheet';
import { usePermissionContext } from '../contexts/PermissionContext';
import { FONT_SIZES } from '../constants/fonts';

interface OnboardingScreenProps {
  navigation: any;
}

const { width: screenWidth } = Dimensions.get('window');

const onboardingData = [
  {
    id: 1,
    title: 'International Gita Mahotsav 2025',
    subtitle: 'Celebrate the Divine Wisdom',
    description:
      'Join the grand celebration of the Bhagavad Gita with cultural events, spiritual discourses, and divine experiences.',
    illustration: 'igm',
  },
  {
    id: 2,
    title: '48 Kos Kurukshetra',
    subtitle: 'Explore 182 Sacred Tirths',
    description:
      'Discover the sacred 48 Kos area of Kurukshetra with detailed information about all 182 holy tirths and their significance.',
    illustration: 'kos',
  },
  {
    id: 3,
    title: 'Tirth Mitra',
    subtitle: 'Your Spiritual Companion',
    description:
      'Get your digital Tirth Mitra card to access exclusive facilities and services during your pilgrimage journey.',
    illustration: 'tirth-mitra',
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
    
    if (!isAnimating) {
      autoScrollTimerRef.current = setInterval(() => {
        if (currentIndex < onboardingData.length - 1) {
          setCurrentIndex(prev => prev + 1);
        } else {
          // Restart from the first screen
          setCurrentIndex(0);
        }
      }, 4000); // Auto-scroll every 4 seconds
    }

    return () => clearAutoScrollTimer();
  }, [currentIndex, isAnimating]);

  const handleNext = () => {
    // Prevent multiple rapid clicks
    if (isAnimating || isLoading) return;
    
    clearAutoScrollTimer();
    setIsAnimating(true);
    
    if (currentIndex < onboardingData.length - 1) {
      // Move to next slide
      setCurrentIndex(prev => prev + 1);
    } else {
      // On last slide, show permission sheet immediately
      setIsAnimating(false);
      setShowPermissionSheet(true);
    }
  };

  const handlePermissionGranted = () => {
    setIsLoading(true);
    setShowPermissionSheet(false);
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

  const handlePermissionSkip = () => {
    setIsLoading(true);
    setShowPermissionSheet(false);
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

  const currentSlide = onboardingData[currentIndex];

  const renderIllustration = (slide: any) => {
    // Show appropriate logo based on slide
    switch (slide.illustration) {
      case 'igm':
        return (
          <Image
            source={require('../assets/images/igmLogo.png')}
            style={styles.logoImage}
            resizeMode="contain"
          />
        );
      case 'kos':
        return (
          <Image
            source={require('../assets/images/appLogo.png')}
            style={styles.logoImage}
            resizeMode="contain"
          />
        );
      case 'tirth-mitra':
        return (
          <Image
            source={require('../assets/images/hr_logo.png')}
            style={styles.logoImage}
            resizeMode="contain"
          />
        );
      default:
        return (
          <Image
            source={require('../assets/images/igmLogo.png')}
            style={styles.logoImage}
            resizeMode="contain"
          />
        );
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle='light-content' backgroundColor={COLORS.appColor}/>
  
      {/* App Color Background */}
      <View style={styles.appColorBackground} />

      {/* Main Content Area */}
      <View style={styles.mainContent}>
        {/* Logo */}
        <Animated.View 
          style={[
            styles.iconContainer,
            {
              opacity: fadeAnim,
              transform: [
                { translateY: slideAnim }
              ]
            }
          ]}
        >
          {renderIllustration(currentSlide)}
        </Animated.View>
      </View>

      {/* Bottom Sheet */}
      <Animated.View 
        style={[
          styles.bottomSheet,
          { 
            paddingBottom: insets.bottom + 24,
          }
        ]}
      >
        {/* Progress Indicators */}
        <View style={styles.progressContainer}>
          {onboardingData.map((_, index) => (
            <Animated.View
              key={index}
              style={[
                styles.progressDot,
                {
                  backgroundColor:
                    index === currentIndex ? COLORS.appColor : COLORS.border.light,
                },
              ]}
            />
          ))}
        </View>

        {/* Text Content */}
        <Animated.View 
          style={[
            styles.textContainer,
            {
              opacity: fadeAnim,
              transform: [
                { translateY: slideAnim }
              ]
            }
          ]}
        >
          <H5
            color={COLORS.primary}
            weight='semiBold'
            size='lg'
            style={styles.title}
          >
            {currentSlide.title}
          </H5>
          {/* <H5
            color={COLORS.secondary}
            weight='medium'
            size='xl'
            style={styles.subtitle}
          >
            {currentSlide.subtitle}
          </H5> */}
          <BodyText
            color={COLORS.secondary}
            size='md'
            style={styles.description}
          >
            {currentSlide.description}
          </BodyText>
        </Animated.View>

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
            <ButtonTextPrimary size='lg'>
              {currentIndex < onboardingData.length - 1 ? 'Next' : 'Get Started'}
            </ButtonTextPrimary>
          )}
        </TouchableOpacity>
      </Animated.View>

      {/* Permission Bottom Sheet */}
      <PermissionBottomSheet
        visible={showPermissionSheet}
        onClose={handlePermissionSkip}
        onPermissionsGranted={handlePermissionGranted}
        isOnboarding={true}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.appColor,
  },
  appColorBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.appColor,
  },
  mainContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    position: 'relative',
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoImage: {
    width: 200,
    height: 200,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  bottomSheet: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 24,
    paddingTop: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  title: {
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: 32,
    letterSpacing: -0.5,
    fontSize: FONT_SIZES['2xl'],
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 24,
    letterSpacing: -0.3,
    opacity: 0.9,
  },
  description: {
    textAlign: 'center',
    lineHeight: 22,
    letterSpacing: 0.2,
    maxWidth: screenWidth * 0.8,
    opacity: 0.8,
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  nextButton: {
    backgroundColor: COLORS.appColor,
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
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
    borderColor: COLORS.appColor,
    borderTopColor: 'transparent',
    borderRadius: 10,
  },
  loadingText: {
    color: COLORS.white,
  },
});

export default OnboardingScreen;
