import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  RefreshControl,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { H1, H2, H3, BodyText } from '../../components/Text';
import { COLORS } from '../../constants/colors';
import { FONTS, FONT_SIZES } from '../../constants/fonts';
import Ionicons from 'react-native-vector-icons/Ionicons';

type StallCategoriesScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'StallCategories'>;

interface StallCategory {
  id: string;
  name: string;
  description: string;
  totalShops: number;
  totalApplications: number;
  icon: string;
  color: string;
  availableShops: number;
}

const StallCategoriesScreen = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<StallCategoriesScreenNavigationProp>();
  const [categories, setCategories] = useState<StallCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setIsLoading(true);
      // Simulate API call - replace with actual data fetching
      const mockCategories: StallCategory[] = [
        {
          id: '1',
          name: 'Social Organizations (Registered)',
          description: 'Registered social organizations and NGOs',
          totalShops: 25,
          totalApplications: 45,
          icon: 'people-outline',
          color: '#FF6B6B',
          availableShops: 12,
        },
        {
          id: '2',
          name: 'Refreshment Stalls through Auction',
          description: 'Food and beverage stalls allocated through auction process',
          totalShops: 40,
          totalApplications: 89,
          icon: 'restaurant-outline',
          color: '#4ECDC4',
          availableShops: 18,
        },
        {
          id: '3',
          name: 'Artisan (Card Holder) through Draw',
          description: 'Traditional artisans with valid artisan cards',
          totalShops: 30,
          totalApplications: 67,
          icon: 'brush-outline',
          color: '#45B7D1',
          availableShops: 15,
        },
        {
          id: '4',
          name: 'National Awardees',
          description: 'Recipients of national awards and recognition',
          totalShops: 15,
          totalApplications: 23,
          icon: 'trophy-outline',
          color: '#96CEB4',
          availableShops: 8,
        },
        {
          id: '5',
          name: 'Shops Through Auction',
          description: 'General shops allocated through auction process',
          totalShops: 50,
          totalApplications: 125,
          icon: 'storefront-outline',
          color: '#FECA57',
          availableShops: 22,
        },
        {
          id: '6',
          name: 'Brand Promotion',
          description: 'Brand promotion stalls (Rs. 1,00,000 - 1,50,000)',
          totalShops: 20,
          totalApplications: 34,
          icon: 'megaphone-outline',
          color: '#FF9FF3',
          availableShops: 9,
        },
        {
          id: '7',
          name: 'Shops through Lucky Draw',
          description: 'Shops allocated through lucky draw system',
          totalShops: 35,
          totalApplications: 78,
          icon: 'gift-outline',
          color: '#54A0FF',
          availableShops: 16,
        },
      ];
      
      setCategories(mockCategories);
    } catch (error) {
      console.error('Error loading categories:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadCategories();
    setIsRefreshing(false);
  };

  const handleCategoryPress = (category: StallCategory) => {
    navigation.navigate('StallApplication', { category });
  };

  const renderCategoryCard = (category: StallCategory) => (
    <TouchableOpacity
      key={category.id}
      style={styles.categoryCard}
      onPress={() => handleCategoryPress(category)}
      activeOpacity={0.8}
    >
      <View style={[styles.categoryIconContainer, { backgroundColor: category.color + '20' }]}>
        <Ionicons name={category.icon} size={32} color={category.color} />
      </View>
      
      <View style={styles.categoryContent}>
        <H3 color={COLORS.text.primary} weight='semiBold' size='md'>
          {category.name}
        </H3>
        <BodyText color={COLORS.text.secondary} size='sm' style={styles.categoryDescription}>
          {category.description}
        </BodyText>
        
        <View style={styles.categoryStats}>
          <View style={styles.statItem}>
            <BodyText color={COLORS.text.primary} size='xs' weight='semiBold'>
              Total Shops
            </BodyText>
            <BodyText color={COLORS.primary} size='sm' weight='bold'>
              {category.totalShops}
            </BodyText>
          </View>
          
          <View style={styles.statItem}>
            <BodyText color={COLORS.text.primary} size='xs' weight='semiBold'>
              Applications
            </BodyText>
            <BodyText color={COLORS.secondary} size='sm' weight='bold'>
              {category.totalApplications}
            </BodyText>
          </View>
        </View>
        
        <View style={styles.categoryFooter}>
          <Ionicons name="chevron-forward" size={20} color={COLORS.text.tertiary} />
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle='dark-content' backgroundColor={COLORS.background.primary} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.text.primary} />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <H1 style={styles.headerTitle} color={COLORS.text.primary} weight='bold' size='lg'>
            Stall Categories
          </H1>
        </View>
        <TouchableOpacity
          style={styles.refreshButton}
          onPress={handleRefresh}
          disabled={isRefreshing}
        >
          <Ionicons name="refresh" size={24} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
      >
        {/* Info Section */}
        <View style={styles.infoSection}>
          <View style={styles.infoCard}>
            <Ionicons name="information-circle-outline" size={24} color={COLORS.primary} />
            <View style={styles.infoContent}>
              <BodyText color={COLORS.text.primary} size='sm' weight='semiBold'>
                International Gita Mahotsav 2025
              </BodyText>
              <BodyText color={COLORS.text.secondary} size='xs'>
                Select a category to apply for your stall. Applications are reviewed by the administration team.
              </BodyText>
            </View>
          </View>
        </View>

        {/* Categories List */}
        <View style={styles.categoriesSection}>
          <H2 color={COLORS.text.primary} weight='semiBold' size='md' style={styles.sectionTitle}>
            Available Categories
          </H2>
          
          {categories.map(renderCategoryCard)}
        </View>

        {/* Footer Info */}
        <View style={styles.footerInfo}>
          <BodyText color={COLORS.text.tertiary} size='xs' style={styles.footerText}>
            All applications are subject to approval by the administration team.
            You will be notified about the status of your application.
          </BodyText>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background.primary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: COLORS.background.primary,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border.light,
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  headerContent: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontFamily: FONTS.gilroy.bold,
    fontSize: FONT_SIZES.lg,
  },
  refreshButton: {
    padding: 8,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 20,
  },
  infoSection: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background.secondary,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border.light,
  },
  infoContent: {
    flex: 1,
    marginLeft: 12,
  },
  categoriesSection: {
    paddingHorizontal: 20,
  },
  sectionTitle: {
    marginBottom: 16,
  },
  categoryCard: {
    backgroundColor: COLORS.background.secondary,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border.light,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  categoryIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryContent: {
    flex: 1,
  },
  categoryDescription: {
    marginTop: 4,
    marginBottom: 12,
    lineHeight: 18,
  },
  categoryStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 12,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  categoryFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  availabilityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  footerInfo: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  footerText: {
    textAlign: 'center',
    lineHeight: 18,
  },
});

export default StallCategoriesScreen;
