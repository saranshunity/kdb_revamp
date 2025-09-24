import React, { useEffect } from 'react';
import { View, StyleSheet, Image, StatusBar } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { H1, BodyText } from '../components/Text';
import { COLORS } from '../constants/colors';

interface SplashScreenProps {
  navigation: any;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ navigation }) => {
  const insets = useSafeAreaInsets();

  useEffect(() => {
    // Simulate loading time
    const timer = setTimeout(() => {
      // For now, navigate to onboarding
      // In a real app, you'd check authentication state here
      navigation.replace('Onboarding');
    }, 3000);

    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar
        barStyle='dark-content'
        backgroundColor={COLORS.background.appColor}
      />

      <View style={styles.content}>
        {/* Logo placeholder - replace with actual KDB logo */}
        <View style={styles.logoContainer}>
          <View style={styles.logoPlaceholder}>
            <H1 color={COLORS.white} weight='bold'>
              KDB
            </H1>
          </View>
        </View>

        <View style={styles.textContainer}>
          <H1 color={COLORS.white} weight='bold' size='3xl'>
           48 Kos Kurukshetra
          </H1>
          {/* <BodyText
            color={COLORS.text.secondary}
            size='lg'
            style={styles.subtitle}
          >
            Your trusted financial partner
          </BodyText> */}
        </View>

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
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background.appColor
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
