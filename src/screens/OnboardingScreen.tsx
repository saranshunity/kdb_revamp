import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Dimensions,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { H1, H2, BodyText, ButtonTextPrimary } from '../components/Text';
import { COLORS } from '../constants/colors';

interface OnboardingScreenProps {
  navigation: any;
}

const { width: screenWidth } = Dimensions.get('window');

const onboardingData = [
  {
    id: 1,
    title: 'Welcome to KDB',
    subtitle: 'Your Financial Journey Starts Here',
    description:
      'Experience banking like never before with our innovative digital platform designed for the modern world.',
    icon: '🏦',
  },
  {
    id: 2,
    title: 'Secure & Fast',
    subtitle: 'Banking Made Simple',
    description:
      'Enjoy lightning-fast transactions with bank-grade security that keeps your money and data safe.',
    icon: '🔒',
  },
  {
    id: 3,
    title: 'Smart Features',
    subtitle: 'Intelligent Financial Tools',
    description:
      'Get insights, track spending, and make smarter financial decisions with our AI-powered features.',
    icon: '📊',
  },
  {
    id: 4,
    title: '24/7 Support',
    subtitle: 'Always Here for You',
    description:
      'Our dedicated support team is available around the clock to help you with any questions.',
    icon: '💬',
  },
];

const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleNext = () => {
    if (currentIndex < onboardingData.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      // Navigate to auth screen
      navigation.replace('Auth');
    }
  };

  const handleSkip = () => {
    navigation.replace('Auth');
  };

  const currentSlide = onboardingData[currentIndex];

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle='dark-content' backgroundColor={colors.background} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleSkip} style={styles.skipButton}>
          <BodyText color={colors.tertiary} size='md'>
            Skip
          </BodyText>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
      >
        {/* Icon */}
        <View style={styles.iconContainer}>
          <View style={styles.iconBackground}>
            <BodyText size='4xl'>{currentSlide.icon}</BodyText>
          </View>
        </View>

        {/* Text Content */}
        <View style={styles.textContainer}>
          <H1
            color={colors.primary}
            weight='bold'
            size='3xl'
            style={styles.title}
          >
            {currentSlide.title}
          </H1>
          <H2
            color={colors.secondary}
            weight='medium'
            size='xl'
            style={styles.subtitle}
          >
            {currentSlide.subtitle}
          </H2>
          <BodyText
            color={colors.secondary}
            size='lg'
            style={styles.description}
          >
            {currentSlide.description}
          </BodyText>
        </View>

        {/* Progress Indicators */}
        <View style={styles.progressContainer}>
          {onboardingData.map((_, index) => (
            <View
              key={index}
              style={[
                styles.progressDot,
                {
                  backgroundColor:
                    index === currentIndex ? colors.primary : colors.border,
                },
              ]}
            />
          ))}
        </View>
      </ScrollView>

      {/* Bottom Button */}
      <View
        style={[styles.bottomContainer, { paddingBottom: insets.bottom + 16 }]}
      >
        <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
          <ButtonTextPrimary size='lg'>
            {currentIndex === onboardingData.length - 1
              ? 'Get Started'
              : 'Next'}
          </ButtonTextPrimary>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  skipButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    flexGrow: 1,
    paddingHorizontal: 32,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 48,
    marginTop: 32,
  },
  iconBackground: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.primary + '10',
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: 48,
  },
  title: {
    textAlign: 'center',
    marginBottom: 16,
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: 24,
  },
  description: {
    textAlign: 'center',
    lineHeight: 24,
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  bottomContainer: {
    paddingHorizontal: 32,
  },
  nextButton: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: colors.primary,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
});

export default OnboardingScreen;
