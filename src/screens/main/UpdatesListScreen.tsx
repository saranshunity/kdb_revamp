import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  ScrollView,
  Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Ionicons from 'react-native-vector-icons/Ionicons';

import { RootStackParamList } from '../../navigation/AppNavigator';
import FirebaseService, { MahotsavHulchal as MahotsavHulchalItem } from '../../services/FirebaseService';
import { COLORS } from '../../constants/colors';
import { FONTS, FONT_SIZES } from '../../constants/fonts';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'UpdatesList'>;

const FALLBACK_SECTION = 'More Updates';

const normalizeDateKey = (raw?: string) => {
  if (!raw) return FALLBACK_SECTION;
  const sanitized = raw.replace(/\//g, '-');
  const parts = sanitized.split('-');
  if (parts.length === 3) {
    const [day, month, year] = parts;
    if (day && month && year) {
      return `${day.padStart(2, '0')}-${month.padStart(2, '0')}-${year}`;
    }
  }
  return sanitized;
};

const formatDateLabel = (key: string) => {
  if (key === FALLBACK_SECTION) return FALLBACK_SECTION;
  const [day, month, year] = key.split('-').map(Number);
  if (!day || !month || !year) return key;
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${day} ${monthNames[month - 1] || ''} ${year}`;
};

const parseDateValue = (key: string) => {
  const [day, month, year] = key.split('-').map(Number);
  if (!day || !month || !year) return null;
  return new Date(year, month - 1, day).getTime();
};

const UpdatesListScreen = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp>();
  const [updates, setUpdates] = useState<MahotsavHulchalItem[]>([]);

  useEffect(() => {
    const unsubscribe = FirebaseService.subscribeToMahotsavHulchal((items) => {
      setUpdates(items);
    });
    return () => unsubscribe();
  }, []);

  const { sections, order } = useMemo(() => {
    const grouped: Record<string, MahotsavHulchalItem[]> = {};
    updates.forEach((item) => {
      const key = normalizeDateKey((item as any)?.date);
      if (!grouped[key]) {
        grouped[key] = [];
      }
      grouped[key].push(item);
    });

    const sortedKeys = Object.keys(grouped).sort((a, b) => {
      if (a === FALLBACK_SECTION) return 1;
      if (b === FALLBACK_SECTION) return -1;
      const dateA = parseDateValue(a);
      const dateB = parseDateValue(b);
      if (dateA && dateB) {
        return dateB - dateA; // newest first
      }
      return b.localeCompare(a);
    });

    return { sections: grouped, order: sortedKeys };
  }, [updates]);

  const handleUpdatePress = (item: MahotsavHulchalItem) => {
    navigation.navigate('UpdateDetail', { item });
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background.primary} />

      <View style={styles.headerContainer}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()} activeOpacity={0.8}>
          <Ionicons name="chevron-back" size={24} color={COLORS.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Live Updates</Text>
        <View style={styles.headerPlaceholder} />
      </View>

      {updates.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="newspaper-outline" size={42} color={COLORS.text.secondary} />
          <Text style={styles.emptyTitle}>Updates will appear soon</Text>
          <Text style={styles.emptySubtitle}>
            Stay tuned for the latest announcements and Mahotsav highlights.
          </Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {order.map((key) => (
            <View key={key} style={styles.section}>
              <Text style={styles.sectionTitle}>{formatDateLabel(key)}</Text>
              <View style={styles.sectionList}>
                {sections[key].map((item) => (
                  <TouchableOpacity
                    key={item.id}
                    style={styles.updateCard}
                    activeOpacity={0.85}
                    onPress={() => handleUpdatePress(item)}
                  >
                    {item.image ? (
                      <Image source={{ uri: item.image }} style={styles.updateImage} />
                    ) : (
                      <View style={[styles.updateImage, styles.imagePlaceholder]}>
                        <Ionicons name="image-outline" size={20} color={COLORS.text.secondary} />
                      </View>
                    )}
                    <View style={styles.updateContent}>
                      <Text style={styles.updateTitle}>{item.title}</Text>
                      {item.description ? (
                        <Text style={styles.updateDescription} numberOfLines={2}>
                          {item.description}
                        </Text>
                      ) : null}
                      <Text style={styles.updateMeta}>
                        {[item.location, item.organizer].filter(Boolean).join(' • ')}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          ))}
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
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: FONT_SIZES.lg,
    fontFamily: FONTS.gilroy.bold,
    color: COLORS.primary,
  },
  headerPlaceholder: {
    width: 36,
    height: 36,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 24,
    gap: 16,
  },
  section: {
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.md,
    fontFamily: FONTS.gilroy.semiBold,
    color: COLORS.text.secondary,
    marginBottom: 8,
  },
  sectionList: {
    gap: 12,
  },
  updateCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.background.primary,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border.light,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  updateImage: {
    width: 90,
    height: 90,
  },
  imagePlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.border.light,
  },
  updateContent: {
    flex: 1,
    padding: 12,
    gap: 4,
  },
  updateTitle: {
    fontSize: FONT_SIZES.md,
    fontFamily: FONTS.gilroy.semiBold,
    color: COLORS.text.primary,
  },
  updateDescription: {
    fontSize: FONT_SIZES.xs,
    fontFamily: FONTS.gilroy.regular,
    color: COLORS.text.secondary,
    lineHeight: 18,
  },
  updateMeta: {
    fontSize: FONT_SIZES.xs,
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
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.gilroy.regular,
    color: COLORS.text.secondary,
    textAlign: 'center',
  },
});

export default UpdatesListScreen;

