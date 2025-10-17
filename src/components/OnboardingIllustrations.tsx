import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { BodyText, H2 } from './Text';
import { COLORS } from '../constants/colors';
import Ionicons from 'react-native-vector-icons/Ionicons';

interface IllustrationProps {
  size?: number;
}

const { width: screenWidth } = Dimensions.get('window');

export const IGMIllustration: React.FC<IllustrationProps> = ({ size = 140 }) => {
  return (
    <View style={[styles.container, { width: size, height: size }]}>
      {/* Main background with gradient effect */}
      <View style={[styles.gradientBackground, { width: size, height: size, borderRadius: size / 2 }]}>
        {/* Central building structure */}
        <View style={[styles.buildingStructure, { width: size * 0.5, height: size * 0.6 }]}>
          {/* Main building */}
          <View style={[styles.building, { width: size * 0.4, height: size * 0.5 }]}>
            <View style={[styles.buildingRoof, { width: size * 0.45, height: size * 0.15 }]} />
            <View style={[styles.buildingBody, { width: size * 0.4, height: size * 0.35 }]}>
              <View style={[styles.door, { width: size * 0.08, height: size * 0.2 }]} />
              <View style={[styles.window, { top: size * 0.05, left: size * 0.05, width: size * 0.06, height: size * 0.08 }]} />
              <View style={[styles.window, { top: size * 0.05, right: size * 0.05, width: size * 0.06, height: size * 0.08 }]} />
            </View>
          </View>
          
          {/* Cultural symbols around building */}
          <View style={[styles.culturalSymbol, { top: size * 0.05, left: size * 0.02 }]}>
            <Ionicons name="musical-notes" size={size * 0.08} color={COLORS.appColor} />
          </View>
          <View style={[styles.culturalSymbol, { top: size * 0.05, right: size * 0.02 }]}>
            <Ionicons name="color-palette" size={size * 0.08} color={COLORS.appColor} />
          </View>
          <View style={[styles.culturalSymbol, { bottom: size * 0.05, left: size * 0.02 }]}>
            <Ionicons name="people" size={size * 0.08} color={COLORS.appColor} />
          </View>
          <View style={[styles.culturalSymbol, { bottom: size * 0.05, right: size * 0.02 }]}>
            <Ionicons name="star" size={size * 0.08} color={COLORS.appColor} />
          </View>
        </View>
        
        {/* Decorative elements */}
        <View style={[styles.decorativeCircle, { width: size * 0.85, height: size * 0.85, borderRadius: size * 0.425 }]} />
        <View style={[styles.decorativeCircle, { width: size * 0.95, height: size * 0.95, borderRadius: size * 0.475 }]} />
      </View>
    </View>
  );
};

export const KosIllustration: React.FC<IllustrationProps> = ({ size = 140 }) => {
  return (
    <View style={[styles.container, { width: size, height: size }]}>
      {/* Main background with gradient effect */}
      <View style={[styles.gradientBackground, { width: size, height: size, borderRadius: size / 2 }]}>
        {/* Central map structure */}
        <View style={[styles.mapStructure, { width: size * 0.6, height: size * 0.6 }]}>
          {/* Map background */}
          <View style={[styles.mapBackground, { width: size * 0.5, height: size * 0.5 }]}>
            {/* Map grid lines */}
            <View style={[styles.mapGrid, { width: size * 0.5, height: size * 0.5 }]}>
              <View style={[styles.gridLine, { top: size * 0.15, width: size * 0.5, height: 1 }]} />
              <View style={[styles.gridLine, { top: size * 0.35, width: size * 0.5, height: 1 }]} />
              <View style={[styles.gridLine, { left: size * 0.15, width: 1, height: size * 0.5 }]} />
              <View style={[styles.gridLine, { left: size * 0.35, width: 1, height: size * 0.5 }]} />
            </View>
            
            {/* Temple markers */}
            <View style={[styles.templeMarker, { top: size * 0.1, left: size * 0.1 }]}>
              <Ionicons name="business" size={size * 0.06} color={COLORS.appColor} />
            </View>
            <View style={[styles.templeMarker, { top: size * 0.2, right: size * 0.1 }]}>
              <Ionicons name="home" size={size * 0.06} color={COLORS.appColor} />
            </View>
            <View style={[styles.templeMarker, { bottom: size * 0.1, left: size * 0.2 }]}>
              <Ionicons name="location" size={size * 0.06} color={COLORS.appColor} />
            </View>
            <View style={[styles.templeMarker, { bottom: size * 0.2, right: size * 0.15 }]}>
              <Ionicons name="mountain" size={size * 0.06} color={COLORS.appColor} />
            </View>
          </View>
          
          {/* Sacred count badge */}
          <View style={[styles.sacredCount, { bottom: size * 0.05 }]}>
            <H2 color={COLORS.appColor} size="sm" weight="bold">182</H2>
            <BodyText color={COLORS.text.secondary} size="xs" weight="medium">Tirths</BodyText>
          </View>
        </View>
        
        {/* Decorative elements */}
        <View style={[styles.decorativeCircle, { width: size * 0.85, height: size * 0.85, borderRadius: size * 0.425 }]} />
        <View style={[styles.decorativeCircle, { width: size * 0.95, height: size * 0.95, borderRadius: size * 0.475 }]} />
      </View>
    </View>
  );
};

export const TirthMitraIllustration: React.FC<IllustrationProps> = ({ size = 140 }) => {
  return (
    <View style={[styles.container, { width: size, height: size }]}>
      {/* Main background with gradient effect */}
      <View style={[styles.gradientBackground, { width: size, height: size, borderRadius: size / 2 }]}>
        {/* Central card structure */}
        <View style={[styles.cardStructure, { width: size * 0.5, height: size * 0.6 }]}>
          {/* Main card */}
          <View style={[styles.card, { width: size * 0.4, height: size * 0.5 }]}>
            {/* Card header */}
            <View style={[styles.cardHeader, { width: size * 0.4, height: size * 0.15 }]}>
              <View style={[styles.cardLogo, { width: size * 0.08, height: size * 0.08 }]} />
            </View>
            
            {/* Card body */}
            <View style={[styles.cardBody, { width: size * 0.4, height: size * 0.35 }]}>
              <View style={[styles.cardLine, { width: size * 0.3, height: 2, top: size * 0.05 }]} />
              <View style={[styles.cardLine, { width: size * 0.25, height: 2, top: size * 0.1 }]} />
              <View style={[styles.cardLine, { width: size * 0.2, height: 2, top: size * 0.15 }]} />
              <View style={[styles.cardChip, { width: size * 0.06, height: size * 0.04, top: size * 0.2, left: size * 0.05 }]} />
            </View>
          </View>
          
          {/* Digital elements around card */}
          <View style={[styles.digitalElement, { top: size * 0.05, left: size * 0.02 }]}>
            <Ionicons name="person" size={size * 0.08} color={COLORS.appColor} />
          </View>
          <View style={[styles.digitalElement, { top: size * 0.05, right: size * 0.02 }]}>
            <Ionicons name="phone-portrait" size={size * 0.08} color={COLORS.appColor} />
          </View>
          <View style={[styles.digitalElement, { bottom: size * 0.05, left: size * 0.02 }]}>
            <Ionicons name="shield-checkmark" size={size * 0.08} color={COLORS.appColor} />
          </View>
          <View style={[styles.digitalElement, { bottom: size * 0.05, right: size * 0.02 }]}>
            <Ionicons name="sparkles" size={size * 0.08} color={COLORS.appColor} />
          </View>
          
          {/* Card identifier badge */}
          <View style={[styles.cardIdentifier, { bottom: size * 0.05 }]}>
            <H2 color={COLORS.appColor} size="sm" weight="bold">TM</H2>
            <BodyText color={COLORS.text.secondary} size="xs" weight="medium">Card</BodyText>
          </View>
        </View>
        
        {/* Decorative elements */}
        <View style={[styles.decorativeCircle, { width: size * 0.85, height: size * 0.85, borderRadius: size * 0.425 }]} />
        <View style={[styles.decorativeCircle, { width: size * 0.95, height: size * 0.95, borderRadius: size * 0.475 }]} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  gradientBackground: {
    backgroundColor: COLORS.appColor + '20',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    shadowColor: COLORS.appColor,
    shadowOffset: {
      width: 0,
      height: 12,
    },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 12,
  },
  // IGM Building Styles
  buildingStructure: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  building: {
    position: 'relative',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  buildingRoof: {
    backgroundColor: COLORS.appColor,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    position: 'absolute',
    top: 0,
  },
  buildingBody: {
    backgroundColor: COLORS.white,
    borderRadius: 4,
    position: 'relative',
    borderWidth: 2,
    borderColor: COLORS.appColor,
  },
  door: {
    backgroundColor: COLORS.appColor,
    position: 'absolute',
    bottom: 0,
    left: '50%',
    marginLeft: -4,
    borderRadius: 2,
  },
  window: {
    backgroundColor: COLORS.appColor + '40',
    position: 'absolute',
    borderRadius: 2,
  },
  culturalSymbol: {
    position: 'absolute',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.appColor,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  // Kos Map Styles
  mapStructure: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  mapBackground: {
    backgroundColor: COLORS.white,
    borderRadius: 8,
    position: 'relative',
    borderWidth: 2,
    borderColor: COLORS.appColor,
    shadowColor: COLORS.appColor,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  mapGrid: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  gridLine: {
    position: 'absolute',
    backgroundColor: COLORS.appColor + '30',
  },
  templeMarker: {
    position: 'absolute',
    backgroundColor: COLORS.white,
    borderRadius: 8,
    width: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.appColor,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 2,
  },
  // TirthMitra Card Styles
  cardStructure: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 8,
    position: 'relative',
    shadowColor: COLORS.appColor,
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 6,
    borderWidth: 1,
    borderColor: COLORS.appColor + '30',
  },
  cardHeader: {
    backgroundColor: COLORS.appColor,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardLogo: {
    backgroundColor: COLORS.white,
    borderRadius: 4,
  },
  cardBody: {
    position: 'relative',
    padding: 8,
  },
  cardLine: {
    position: 'absolute',
    backgroundColor: COLORS.appColor + '60',
    borderRadius: 1,
  },
  cardChip: {
    position: 'absolute',
    backgroundColor: COLORS.appColor,
    borderRadius: 2,
  },
  digitalElement: {
    position: 'absolute',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.appColor,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  // Common Styles
  decorativeCircle: {
    position: 'absolute',
    borderWidth: 1,
    borderColor: COLORS.appColor + '40',
    backgroundColor: 'transparent',
  },
  sacredCount: {
    position: 'absolute',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    alignItems: 'center',
    shadowColor: COLORS.appColor,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: COLORS.appColor + '40',
  },
  cardIdentifier: {
    position: 'absolute',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    alignItems: 'center',
    shadowColor: COLORS.appColor,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: COLORS.appColor + '40',
  },
});