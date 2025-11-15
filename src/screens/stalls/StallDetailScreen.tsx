import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  ScrollView,
  Image,
  Linking,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { RootStackParamList } from '../../navigation/AppNavigator';
import { COLORS } from '../../constants/colors';
import { FONTS, FONT_SIZES } from '../../constants/fonts';

type StallDetailRouteProp = RouteProp<RootStackParamList, 'StallDetail'>;
type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'StallDetail'>;

const StallDetailScreen = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp>();
  const { params } = useRoute<StallDetailRouteProp>();
  const stall = params?.stall;

  if (!stall) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <StatusBar barStyle="dark-content" backgroundColor={COLORS.background.primary} />
        <View style={styles.headerContainer}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()} activeOpacity={0.7}>
            <Ionicons name="chevron-back" size={24} color={COLORS.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Stall Details</Text>
          <View style={styles.headerPlaceholder} />
        </View>
        <View style={styles.emptyState}>
          <Ionicons name="storefront-outline" size={42} color={COLORS.text.secondary} />
          <Text style={styles.emptyTitle}>Stall unavailable</Text>
          <Text style={styles.emptySubtitle}>We couldn’t load this stall. Please try again.</Text>
        </View>
      </View>
    );
  }

  const handleLinkPress = (url?: string) => {
    if (url) {
      Linking.openURL(url).catch(() => {});
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background.primary} />
      <View style={styles.headerContainer}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()} activeOpacity={0.7}>
          <Ionicons name="chevron-back" size={24} color={COLORS.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{stall.stallName}</Text>
        <View style={styles.headerPlaceholder} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.heroCard}>
          <View style={styles.heroContent}>
            <Text style={styles.stallName}>{stall.stallName}</Text>
            <Text style={styles.ownerText}>by {stall.ownerName}</Text>
            <View style={styles.tagRow}>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{stall.category}</Text>
              </View>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>Stall #{stall.stallNumber}</Text>
              </View>
            </View>
            <Text style={styles.description}>{stall.description}</Text>
          </View>
        </View>

        {stall.images?.length ? (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.imageStrip}
            contentContainerStyle={{ gap: 12 }}
          >
            {stall.images.map((uri, index) => (
              <Image key={`${uri}-${index}`} source={{ uri }} style={styles.image} />
            ))}
          </ScrollView>
        ) : null}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Location</Text>
          <View style={styles.row}>
            <Ionicons name="location-outline" size={18} color={COLORS.text.secondary} />
            <Text style={styles.rowText}>
              {stall.state}, {stall.country}
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact</Text>
          {stall.phone ? (
            <TouchableOpacity style={styles.row} onPress={() => handleLinkPress(`tel:${stall.phone}`)}>
              <Ionicons name="call-outline" size={18} color={COLORS.background.appColor} />
              <Text style={[styles.rowText, styles.link]}>{stall.phone}</Text>
            </TouchableOpacity>
          ) : null}
          {stall.email ? (
            <TouchableOpacity style={styles.row} onPress={() => handleLinkPress(`mailto:${stall.email}`)}>
              <Ionicons name="mail-outline" size={18} color={COLORS.background.appColor} />
              <Text style={[styles.rowText, styles.link]}>{stall.email}</Text>
            </TouchableOpacity>
          ) : null}
          {stall.website ? (
            <TouchableOpacity style={styles.row} onPress={() => handleLinkPress(stall.website)}>
              <Ionicons name="globe-outline" size={18} color={COLORS.background.appColor} />
              <Text style={[styles.rowText, styles.link]}>{stall.website}</Text>
            </TouchableOpacity>
          ) : null}
        </View>

        {stall.tags?.length ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Highlights</Text>
            <View style={styles.tagContainer}>
              {stall.tags.map((tag) => (
                <View key={tag} style={styles.tagBadge}>
                  <Text style={styles.tagText}>{tag}</Text>
                </View>
              ))}
            </View>
          </View>
        ) : null}

        {(stall.instagram || stall.facebook) && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Social</Text>
            {stall.instagram ? (
              <TouchableOpacity style={styles.row} onPress={() => handleLinkPress(stall.instagram)}>
                <Ionicons name="logo-instagram" size={18} color={COLORS.background.appColor} />
                <Text style={[styles.rowText, styles.link]}>{stall.instagram}</Text>
              </TouchableOpacity>
            ) : null}
            {stall.facebook ? (
              <TouchableOpacity style={styles.row} onPress={() => handleLinkPress(stall.facebook)}>
                <Ionicons name="logo-facebook" size={18} color={COLORS.background.appColor} />
                <Text style={[styles.rowText, styles.link]}>{stall.facebook}</Text>
              </TouchableOpacity>
            ) : null}
          </View>
        )}
      </ScrollView>
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
    flex: 1,
    textAlign: 'center',
    fontSize: FONT_SIZES.lg,
    fontFamily: FONTS.gilroy.bold,
    color: COLORS.primary,
    paddingHorizontal: 20,
  },
  headerPlaceholder: {
    width: 32,
  },
  scrollContent: {
    padding: 20,
    gap: 16,
    paddingBottom: 80,
  },
  heroCard: {
    backgroundColor: COLORS.background.primary,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.border.light,
    padding: 18,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  heroContent: {
    gap: 8,
  },
  stallName: {
    fontSize: FONT_SIZES.xl,
    fontFamily: FONTS.gilroy.bold,
    color: COLORS.text.primary,
  },
  ownerText: {
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.gilroy.medium,
    color: COLORS.text.secondary,
  },
  tagRow: {
    flexDirection: 'row',
    gap: 8,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: COLORS.background.tertiary,
  },
  badgeText: {
    fontSize: FONT_SIZES.xs,
    fontFamily: FONTS.gilroy.semiBold,
    color: COLORS.text.primary,
  },
  description: {
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.gilroy.regular,
    color: COLORS.text.primary,
    lineHeight: 20,
  },
  imageStrip: {
    marginTop: 4,
  },
  image: {
    width: 220,
    height: 140,
    borderRadius: 12,
  },
  section: {
    backgroundColor: COLORS.background.primary,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.border.light,
    padding: 18,
    gap: 10,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.md,
    fontFamily: FONTS.gilroy.semiBold,
    color: COLORS.text.primary,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  rowText: {
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.gilroy.regular,
    color: COLORS.text.primary,
  },
  link: {
    color: COLORS.background.appColor,
    fontFamily: FONTS.gilroy.semiBold,
  },
  tagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tagBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: COLORS.background.tertiary,
  },
  tagText: {
    fontSize: FONT_SIZES.xs,
    fontFamily: FONTS.gilroy.medium,
    color: COLORS.text.primary,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    gap: 10,
  },
  emptyTitle: {
    fontSize: FONT_SIZES.lg,
    fontFamily: FONTS.gilroy.semiBold,
    color: COLORS.text.primary,
  },
  emptySubtitle: {
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.gilroy.regular,
    color: COLORS.text.secondary,
    textAlign: 'center',
  },
});

export default StallDetailScreen;

