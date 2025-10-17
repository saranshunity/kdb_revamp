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
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { H1, H2, BodyText, ButtonTextPrimary } from '../components/Text';
import { COLORS } from '../constants/colors';
import OnboardingCard from '../components/OnboardingCard';
import { IGMIllustration, KosIllustration, TirthMitraIllustration } from '../components/OnboardingIllustrations';

interface OnboardingScreenProps {
  navigation: any;
}

const { width: screenWidth } = Dimensions.get('window');

const onboardingData = [
  {
    id: 1,
    title: 'International Gita Mahotsav',
    subtitle: 'Celebrate the Divine Wisdom',
    description:
      'Join the grand celebration of the Bhagavad Gita with cultural events, spiritual discourses, and divine experiences.',
    illustration: 'igm',
  },
  {
    id: 2,
    title: '48 Kos Pilgrimage',
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
  const scrollViewRef = useRef<ScrollView>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const autoScrollTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;

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
    if (isAnimating) return;
    
    clearAutoScrollTimer();
    setIsAnimating(true);
    
  
      // Navigate to main tab navigator
      navigation.replace('Main');
    
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => clearAutoScrollTimer();
  }, []);

  const currentSlide = onboardingData[currentIndex];

  const renderIllustration = (type: string) => {
    switch (type) {
      case 'igm':
        return <IGMIllustration size={120} />;
      case 'kos':
        return <KosIllustration size={120} />;
      case 'tirth-mitra':
        return <TirthMitraIllustration size={120} />;
      default:
        return <IGMIllustration size={120} />;
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle='dark-content' backgroundColor={COLORS.background.primary}/>
  
      {/* Background gradient overlay */}
      <View style={styles.backgroundOverlay} />

      {/* Content */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
      >
        {/* Illustration */}
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
          {renderIllustration(currentSlide.illustration)}
        </Animated.View>

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
          <H1
            color={COLORS.primary}
            weight='bold'
            size='3xl'
            style={styles.title}
          >
            {currentSlide.title}
          </H1>
          <H2
            color={COLORS.secondary}
            weight='medium'
            size='xl'
            style={styles.subtitle}
          >
            {currentSlide.subtitle}
          </H2>
          <BodyText
            color={COLORS.secondary}
            size='lg'
            style={styles.description}
          >
            {currentSlide.description}
          </BodyText>
        </Animated.View>

        {/* Progress Indicators */}
        <View style={styles.progressContainer}>
          {onboardingData.map((_, index) => (
            <Animated.View
              key={index}
              style={[
                styles.progressDot,
                {
                  backgroundColor:
                    index === currentIndex ? COLORS.primary : COLORS.border.light,
                },
              ]}
            />
          ))}
        </View>
      </ScrollView>

      {/* Bottom Button */}
      <View
        style={[
          styles.bottomContainer, 
          { 
            paddingBottom: insets.bottom + 16,
          }
        ]}
      >
        <TouchableOpacity 
          style={[
            styles.nextButton,
            isAnimating && styles.nextButtonDisabled
          ]} 
          onPress={handleNext}
          activeOpacity={0.7}
          disabled={isAnimating}
        >
          <ButtonTextPrimary size='lg'>
            Get Started
          </ButtonTextPrimary>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background.primary,
  },
  backgroundOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.primary + '08',
    opacity: 0.8,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 20,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 60,
    marginTop: 20,
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: 60,
    paddingHorizontal: 16,
  },
  title: {
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 40,
    letterSpacing: -0.5,
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: 28,
    lineHeight: 28,
    letterSpacing: -0.3,
  },
  description: {
    textAlign: 'center',
    lineHeight: 26,
    letterSpacing: 0.2,
    maxWidth: screenWidth * 0.8,
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
  },
  progressDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginHorizontal: 6,
    shadowColor: COLORS.primary,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  bottomContainer: {
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  nextButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
    borderWidth: 1,
    borderColor: COLORS.primary + '20',
  },
  nextButtonDisabled: {
    opacity: 0.6,
    shadowOpacity: 0.1,
    elevation: 2,
  },
});

export default OnboardingScreen;
