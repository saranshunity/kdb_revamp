import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  StatusBar,
  ImageBackground,
} from 'react-native';
import { RouteProp, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';

import { RootStackParamList } from '../../navigation/AppNavigator';
import { COLORS } from '../../constants/colors';
import { FONTS, FONT_SIZES } from '../../constants/fonts';
import { useNavigation } from '@react-navigation/native';

type UpdateDetailRouteProp = RouteProp<RootStackParamList, 'UpdateDetail'>;
type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'UpdateDetail'>;

const UpdateDetailScreen = () => {
  const insets = useSafeAreaInsets();
  const route = useRoute<UpdateDetailRouteProp>();
  const navigation = useNavigation<NavigationProp>();
  const item = route.params?.item;

  const categories = item?.categories || [];

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background.primary} />

      <View style={styles.headerContainer}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()} activeOpacity={0.8}>
          <Ionicons name="chevron-back" size={22} color={COLORS.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Updates/News</Text>
        <View style={styles.headerPlaceholder} />
      </View>

      {!item ? (
        <View style={styles.emptyState}>
          <Ionicons name="alert-circle-outline" size={40} color={COLORS.text.secondary} />
          <Text style={styles.emptyTitle}>Update unavailable</Text>
          <Text style={styles.emptySubtitle}>We couldn’t load the selected update. Please try again.</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {item.image ? (
            <ImageBackground source={{ uri: item.image }} style={styles.heroImage} imageStyle={styles.heroImageRadius}>
              <View style={styles.badgeContainer}>
                {categories.map((category) => (
                  <View key={category} style={styles.badge}>
                    <Text style={styles.badgeText}>{category}</Text>
                  </View>
                ))}
              </View>
            </ImageBackground>
          ) : (
            <View style={[styles.heroImage, styles.heroPlaceholder]}>
              <Ionicons name="image-outline" size={32} color={COLORS.text.secondary} />
            </View>
          )}

          <View style={styles.contentCard}>
            <Text style={styles.title}>{item.title}</Text>
            {item.description ? (
              <Text style={styles.description}>{item.description}</Text>
            ) : null}

            <View style={styles.metaSection}>
              {item.location ? (
                <View style={styles.metaRow}>
                  <Ionicons name="location-outline" size={18} color={COLORS.text.secondary} />
                  <Text style={styles.metaText}>{item.location}</Text>
                </View>
              ) : null}

              {item.organizer ? (
                <View style={styles.metaRow}>
                  <Ionicons name="people-outline" size={18} color={COLORS.text.secondary} />
                  <Text style={styles.metaText}>{item.organizer}</Text>
                </View>
              ) : null}

              {item.time || item.date ? (
                <View style={styles.metaRow}>
                  <Ionicons name="calendar-outline" size={18} color={COLORS.text.secondary} />
                  <Text style={styles.metaText}>
                    {[item.date, item.time].filter(Boolean).join(' • ')}
                  </Text>
                </View>
              ) : null}
            </View>
          </View>
        </ScrollView>
      )}
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
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: FONT_SIZES.lg,
    fontFamily: FONTS.gilroy.bold,
    color: COLORS.primary,
  },
  headerPlaceholder: {
    width: 40,
    height: 40,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
    gap: 20,
  },
  heroImage: {
    width: '100%',
    height: 220,
    borderRadius: 18,
    overflow: 'hidden',
    backgroundColor: COLORS.background.primary,
    justifyContent: 'flex-end',
  },
  heroImageRadius: {
    borderRadius: 18,
  },
  heroPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.border.light,
  },
  badgeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    padding: 12,
  },
  badge: {
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  badgeText: {
    color: COLORS.white,
    fontSize: FONT_SIZES.xs,
    fontFamily: FONTS.gilroy.semiBold,
    textTransform: 'uppercase',
  },
  contentCard: {
    backgroundColor: COLORS.background.primary,
    borderRadius: 18,
    padding: 20,
    borderWidth: 1,
    borderColor: COLORS.border.light,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  title: {
    fontSize: FONT_SIZES.xl,
    fontFamily: FONTS.gilroy.bold,
    color: COLORS.text.primary,
    marginBottom: 12,
  },
  description: {
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.gilroy.regular,
    color: COLORS.text.primary,
    lineHeight: 22,
  },
  metaSection: {
    marginTop: 18,
    gap: 10,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  metaText: {
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.gilroy.medium,
    color: COLORS.text.secondary,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    gap: 12,
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

export default UpdateDetailScreen;

