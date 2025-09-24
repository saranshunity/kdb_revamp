import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { COLORS } from '../constants/colors';

const { width, height } = Dimensions.get('window');

interface OnboardingCardProps {
  title: string;
  description: string;
  buttonText: string;
  skipText?: string;
  onButtonPress: () => void;
  onSkipPress?: () => void;
  currentStep: number;
  totalSteps: number;
}

const OnboardingCard: React.FC<OnboardingCardProps> = ({
  title,
  description,
  buttonText,
  skipText = 'Skip for now',
  onButtonPress,
  onSkipPress,
  currentStep,
  totalSteps,
}) => {
  const renderIllustration = () => (
    <View style={styles.illustrationContainer}>
      {/* Background wavy lines */}
      <View style={styles.wavyLine1} />
      <View style={styles.wavyLine2} />
      
      {/* Person illustration */}
      <View style={styles.personContainer}>
        {/* Person body */}
        <View style={styles.personBody}>
          {/* Head */}
          <View style={styles.head}>
            <View style={styles.eye} />
          </View>
          
          {/* Jacket */}
          <View style={styles.jacket}>
            <View style={styles.jacketCollar} />
            <View style={styles.jacketCuffs} />
          </View>
          
          {/* Backpack */}
          <View style={styles.backpack}>
            <View style={styles.backpackFlap} />
            <View style={styles.backpackHook} />
            <View style={styles.backpackPocket} />
          </View>
        </View>
        
        {/* Map */}
        <View style={styles.map}>
          <View style={styles.mapLine1} />
          <View style={styles.mapLine2} />
          <View style={styles.mapLine3} />
          <View style={styles.mapLine4} />
        </View>
      </View>
    </View>
  );

  const renderPaginationDots = () => (
    <View style={styles.paginationContainer}>
      {Array.from({ length: totalSteps }, (_, index) => (
        <View
          key={index}
          style={[
            styles.paginationDot,
            {
              backgroundColor: index === currentStep - 1 ? COLORS.warning : COLORS.gray[300],
            },
          ]}
        />
      ))}
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Top Section - Illustration */}
      <View style={styles.topSection}>
        {renderIllustration()}
      </View>

      {/* Bottom Section - Content */}
      <View style={styles.bottomSection}>
        <Text style={styles.title}>{title}</Text>
        
        <Text style={styles.description}>{description}</Text>
        
        {renderPaginationDots()}
        
        <TouchableOpacity style={styles.button} onPress={onButtonPress}>
          <Text style={styles.buttonText}>{buttonText}</Text>
        </TouchableOpacity>
        
        {onSkipPress && (
          <TouchableOpacity onPress={onSkipPress}>
            <Text style={styles.skipText}>{skipText}</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.black,
  },
  topSection: {
    flex: 0.6,
    backgroundColor: COLORS.black,
    position: 'relative',
  },
  bottomSection: {
    flex: 0.4,
    backgroundColor: COLORS.gray[50],
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 40,
    alignItems: 'center',
  },
  illustrationContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  wavyLine1: {
    position: 'absolute',
    top: 40,
    right: 20,
    width: 60,
    height: 2,
    backgroundColor: COLORS.gray[400],
    borderRadius: 1,
    transform: [{ rotate: '15deg' }],
  },
  wavyLine2: {
    position: 'absolute',
    bottom: 80,
    left: 20,
    width: 80,
    height: 2,
    backgroundColor: COLORS.gray[400],
    borderRadius: 1,
    transform: [{ rotate: '-10deg' }],
  },
  personContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  personBody: {
    alignItems: 'center',
    position: 'relative',
  },
  head: {
    width: 40,
    height: 40,
    backgroundColor: COLORS.white,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: COLORS.black,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  eye: {
    width: 4,
    height: 4,
    backgroundColor: COLORS.black,
    borderRadius: 2,
  },
  jacket: {
    width: 60,
    height: 80,
    backgroundColor: COLORS.warning,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: COLORS.black,
    position: 'relative',
  },
  jacketCollar: {
    position: 'absolute',
    top: -2,
    left: 8,
    width: 44,
    height: 12,
    backgroundColor: COLORS.black,
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
  },
  jacketCuffs: {
    position: 'absolute',
    bottom: 8,
    left: -2,
    right: -2,
    height: 8,
    backgroundColor: COLORS.black,
    borderRadius: 4,
  },
  backpack: {
    position: 'absolute',
    top: 20,
    right: -25,
    width: 30,
    height: 40,
    backgroundColor: COLORS.white,
    borderWidth: 2,
    borderColor: COLORS.black,
    borderRadius: 4,
  },
  backpackFlap: {
    position: 'absolute',
    top: -2,
    left: -2,
    right: -2,
    height: 8,
    backgroundColor: COLORS.white,
    borderWidth: 2,
    borderColor: COLORS.black,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
  },
  backpackHook: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 4,
    height: 4,
    backgroundColor: COLORS.black,
    borderRadius: 2,
  },
  backpackPocket: {
    position: 'absolute',
    top: 12,
    left: 4,
    right: 4,
    height: 8,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.black,
    borderRadius: 2,
  },
  map: {
    position: 'absolute',
    top: 50,
    left: -30,
    width: 80,
    height: 60,
    backgroundColor: COLORS.white,
    borderWidth: 2,
    borderColor: COLORS.black,
    borderRadius: 4,
    padding: 8,
  },
  mapLine1: {
    position: 'absolute',
    top: 12,
    left: 8,
    right: 8,
    height: 1,
    backgroundColor: COLORS.warning,
    borderRadius: 0.5,
  },
  mapLine2: {
    position: 'absolute',
    top: 20,
    left: 12,
    right: 12,
    height: 1,
    backgroundColor: COLORS.warning,
    borderRadius: 0.5,
  },
  mapLine3: {
    position: 'absolute',
    top: 28,
    left: 8,
    right: 8,
    height: 1,
    backgroundColor: COLORS.warning,
    borderRadius: 0.5,
  },
  mapLine4: {
    position: 'absolute',
    top: 36,
    left: 10,
    right: 10,
    height: 1,
    backgroundColor: COLORS.warning,
    borderRadius: 0.5,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.black,
    textAlign: 'center',
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    color: COLORS.gray[600],
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  paginationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 32,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  button: {
    backgroundColor: COLORS.black,
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 16,
    minWidth: 200,
    alignItems: 'center',
  },
  buttonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
  },
  skipText: {
    color: COLORS.gray[500],
    fontSize: 14,
    textAlign: 'center',
  },
});

export default OnboardingCard;
