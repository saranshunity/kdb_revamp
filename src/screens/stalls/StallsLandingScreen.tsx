import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { RootStackParamList } from '../../navigation/AppNavigator';
import { COLORS } from '../../constants/colors';
import { FONTS, FONT_SIZES } from '../../constants/fonts';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'StallsLanding'>;

const StallsLandingScreen = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp>();

  const zoneOptions = [
    { key: 'craft-fair', label: 'Craft Fair', icon: 'color-palette-outline', category: 'Craft Fair' },
    { key: 'book-fair', label: 'Book Fair', icon: 'book-outline', category: 'Book Fair' },
    { key: 'shopping', label: 'Shopping', icon: 'bag-handle-outline', category: 'Shopping' },
    { key: 'food', label: 'Food & Refreshment', icon: 'fast-food-outline', category: 'Food & Refreshment' },
  ];

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background.primary} />
      <View style={styles.headerContainer}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Ionicons name="chevron-back" size={24} color={COLORS.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Stalls</Text>
        <View style={styles.headerPlaceholder} />
      </View>

      <View style={styles.content}>
        {/* <Text style={styles.subtitle}>
          Discover over 200 stalls showcasing handicrafts, food, textiles, and more across the Mahotsav grounds.
        </Text> */}

        <TouchableOpacity
          style={styles.primaryCard}
          activeOpacity={0.85}
          onPress={() => navigation.navigate('Stalls')}
        >
          <View style={styles.cardTextWrapper}>
            <Text style={styles.cardTitle}>All Stalls Directory</Text>
            {/* <Text style={styles.cardDescription}>
              Search and filter every registered stall. Perfect when you know the name, owner, or stall number.
            </Text> */}
          </View>
          <Ionicons name="search-outline" size={28} color={COLORS.primary} />
        </TouchableOpacity>

        <View style={styles.zoneContainer}>
          <Text style={styles.zoneTitle}>Explore Zones</Text>
          <View style={styles.zoneList}>
            {zoneOptions.map((option) => (
              <TouchableOpacity
                key={option.key}
                style={styles.zoneButton}
                activeOpacity={0.85}
                onPress={() =>
                  navigation.navigate('Stalls', { initialCategory: option.category })
                }
              >
                <View style={styles.zoneButtonIcon}>
                  <Ionicons name={option.icon as any} size={18} color={COLORS.background.appColor} />
                </View>
                <Text style={styles.zoneButtonLabel}>{option.label}</Text>
                <Ionicons name="chevron-forward" size={18} color={COLORS.text.secondary} />
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background.secondary,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border.light,
    backgroundColor: COLORS.background.primary,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: FONT_SIZES.lg,
    fontFamily: FONTS.gilroy.bold,
    color: COLORS.primary,
  },
  headerPlaceholder: {
    width: 32,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 24,
    gap: 16,
  },
  subtitle: {
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.gilroy.regular,
    color: COLORS.text.secondary,
    lineHeight: 20,
  },
  primaryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.background.primary,
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: COLORS.border.light,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  cardTextWrapper: {
    flex: 1,
    marginRight: 12,
    gap: 6,
  },
  cardTitle: {
    fontSize: FONT_SIZES.md,
    fontFamily: FONTS.gilroy.semiBold,
    color: COLORS.text.primary,
  },
  cardDescription: {
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.gilroy.regular,
    color: COLORS.text.secondary,
    lineHeight: 20,
  },
  zoneContainer: {
    marginTop: 12,
    backgroundColor: COLORS.background.primary,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.border.light,
    padding: 16,
  },
  zoneTitle: {
    fontSize: FONT_SIZES.md,
    fontFamily: FONTS.gilroy.semiBold,
    color: COLORS.text.primary,
    marginBottom: 12,
  },
  zoneList: {
    gap: 10,
  },
  zoneButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border.light,
  },
  zoneButtonIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.background.tertiary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  zoneButtonLabel: {
    flex: 1,
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.gilroy.medium,
    color: COLORS.text.primary,
  },
});

export default StallsLandingScreen;

