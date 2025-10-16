import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { BodyText, H2 } from './Text';
import { COLORS } from '../constants/colors';

interface IllustrationProps {
  size?: number;
}

const { width: screenWidth } = Dimensions.get('window');

export const IGMIllustration: React.FC<IllustrationProps> = ({ size = 140 }) => {
  return (
    <View style={[styles.container, { width: size, height: size }]}>
      {/* Outer glow ring */}
      <View style={[styles.outerGlow, { width: size, height: size, borderRadius: size / 2 }]}>
        {/* Main circle with gradient effect */}
        <View style={[styles.mainCircle, { width: size * 0.9, height: size * 0.9, borderRadius: size * 0.45 }]}>
          {/* Inner decorative ring */}
          <View style={[styles.innerRing, { width: size * 0.7, height: size * 0.7, borderRadius: size * 0.35 }]}>
            {/* Center content */}
            <View style={styles.centerContent}>
              <BodyText size="5xl" style={styles.mainIcon}>🕉️</BodyText>
              <View style={styles.floatingElements}>
                <View style={[styles.floatingIcon, { top: -15, left: -20 }]}>
                  <BodyText size="lg">🎭</BodyText>
                </View>
                <View style={[styles.floatingIcon, { top: -15, right: -20 }]}>
                  <BodyText size="lg">🎪</BodyText>
                </View>
                <View style={[styles.floatingIcon, { bottom: -15, left: -20 }]}>
                  <BodyText size="lg">🎨</BodyText>
                </View>
                <View style={[styles.floatingIcon, { bottom: -15, right: -20 }]}>
                  <BodyText size="lg">🎵</BodyText>
                </View>
              </View>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
};

export const KosIllustration: React.FC<IllustrationProps> = ({ size = 140 }) => {
  return (
    <View style={[styles.container, { width: size, height: size }]}>
      {/* Outer glow ring */}
      <View style={[styles.outerGlow, { width: size, height: size, borderRadius: size / 2 }]}>
        {/* Main circle with gradient effect */}
        <View style={[styles.mainCircle, { width: size * 0.9, height: size * 0.9, borderRadius: size * 0.45 }]}>
          {/* Inner decorative ring */}
          <View style={[styles.innerRing, { width: size * 0.7, height: size * 0.7, borderRadius: size * 0.35 }]}>
            {/* Center content */}
            <View style={styles.centerContent}>
              <BodyText size="5xl" style={styles.mainIcon}>🗺️</BodyText>
              <View style={styles.floatingElements}>
                <View style={[styles.floatingIcon, { top: -10, left: -15 }]}>
                  <BodyText size="sm">⛩️</BodyText>
                </View>
                <View style={[styles.floatingIcon, { top: -10, right: -15 }]}>
                  <BodyText size="sm">🏛️</BodyText>
                </View>
                <View style={[styles.floatingIcon, { bottom: -10, left: -15 }]}>
                  <BodyText size="sm">🕍</BodyText>
                </View>
                <View style={[styles.floatingIcon, { bottom: -10, right: -15 }]}>
                  <BodyText size="sm">⛰️</BodyText>
                </View>
              </View>
              {/* Sacred count */}
              <View style={styles.sacredCount}>
                <H2 color={COLORS.primary} size="sm" weight="bold">182</H2>
                <BodyText color={COLORS.secondary} size="xs" weight="medium">Tirths</BodyText>
              </View>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
};

export const TirthMitraIllustration: React.FC<IllustrationProps> = ({ size = 140 }) => {
  return (
    <View style={[styles.container, { width: size, height: size }]}>
      {/* Outer glow ring */}
      <View style={[styles.outerGlow, { width: size, height: size, borderRadius: size / 2 }]}>
        {/* Main circle with gradient effect */}
        <View style={[styles.mainCircle, { width: size * 0.9, height: size * 0.9, borderRadius: size * 0.45 }]}>
          {/* Inner decorative ring */}
          <View style={[styles.innerRing, { width: size * 0.7, height: size * 0.7, borderRadius: size * 0.35 }]}>
            {/* Center content */}
            <View style={styles.centerContent}>
              <BodyText size="5xl" style={styles.mainIcon}>🎫</BodyText>
              <View style={styles.floatingElements}>
                <View style={[styles.floatingIcon, { top: -15, left: -20 }]}>
                  <BodyText size="lg">👤</BodyText>
                </View>
                <View style={[styles.floatingIcon, { top: -15, right: -20 }]}>
                  <BodyText size="lg">📱</BodyText>
                </View>
                <View style={[styles.floatingIcon, { bottom: -15, left: -20 }]}>
                  <BodyText size="lg">🔐</BodyText>
                </View>
                <View style={[styles.floatingIcon, { bottom: -15, right: -20 }]}>
                  <BodyText size="lg">✨</BodyText>
                </View>
              </View>
              {/* Card identifier */}
              <View style={styles.cardIdentifier}>
                <H2 color={COLORS.primary} size="sm" weight="bold">TM</H2>
                <BodyText color={COLORS.secondary} size="xs" weight="medium">Card</BodyText>
              </View>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  outerGlow: {
    backgroundColor: COLORS.primary + '08',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
  },
  mainCircle: {
    backgroundColor: COLORS.primary + '12',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.primary + '25',
    shadowColor: COLORS.primary,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  innerRing: {
    backgroundColor: COLORS.primary + '18',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.primary + '30',
    position: 'relative',
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    width: '100%',
    height: '100%',
  },
  mainIcon: {
    zIndex: 3,
    textShadowColor: COLORS.primary + '40',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  floatingElements: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    zIndex: 2,
  },
  floatingIcon: {
    position: 'absolute',
    backgroundColor: COLORS.background.primary,
    borderRadius: 20,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sacredCount: {
    position: 'absolute',
    bottom: -8,
    backgroundColor: COLORS.background.primary,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    alignItems: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: COLORS.primary + '20',
  },
  cardIdentifier: {
    position: 'absolute',
    bottom: -8,
    backgroundColor: COLORS.background.primary,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    alignItems: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: COLORS.primary + '20',
  },
});