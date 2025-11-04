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
import FirebaseService, { StallApplication, StallCategory } from '../../services/FirebaseService';

type AdminCategoriesScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'AdminCategories'>;

interface CategoryWithStats {
  category: StallCategory;
  totalApplications: number;
  pendingApplications: number;
  approvedApplications: number;
  rejectedApplications: number;
}

const AdminCategoriesScreen = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<AdminCategoriesScreenNavigationProp>();
  const [categoriesWithStats, setCategoriesWithStats] = useState<CategoryWithStats[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    loadCategoriesWithStats();
  }, []);

  const loadCategoriesWithStats = async () => {
    try {
      setIsLoading(true);
      
      // Get all applications
      const applications = await FirebaseService.getAllApplications();
      
      // Get categories (for now, we'll use mock data since we don't have categories in Firebase yet)
      const mockCategories: StallCategory[] = [
        {
          id: '1',
          name: 'Social Organizations (Registered)',
          description: 'Registered social organizations and NGOs',
          totalShops: 25,
          availableShops: 12,
          icon: 'people-outline',
          color: '#FF6B6B',
        },
        {
          id: '2',
          name: 'Refreshment Stalls through Auction',
          description: 'Food and beverage stalls allocated through auction process',
          totalShops: 40,
          availableShops: 18,
          icon: 'restaurant-outline',
          color: '#4ECDC4',
        },
        {
          id: '3',
          name: 'Artisan (Card Holder) through Draw',
          description: 'Traditional artisans with valid artisan cards',
          totalShops: 30,
          availableShops: 15,
          icon: 'brush-outline',
          color: '#45B7D1',
        },
        {
          id: '4',
          name: 'National Awardees',
          description: 'Recipients of national awards and recognition',
          totalShops: 15,
          availableShops: 8,
          icon: 'trophy-outline',
          color: '#96CEB4',
        },
        {
          id: '5',
          name: 'Shops Through Auction',
          description: 'General shops allocated through auction process',
          totalShops: 50,
          availableShops: 22,
          icon: 'storefront-outline',
          color: '#FECA57',
        },
        {
          id: '6',
          name: 'Brand Promotion',
          description: 'Brand promotion stalls (Rs. 1,00,000 - 1,50,000)',
          totalShops: 20,
          availableShops: 9,
          icon: 'megaphone-outline',
          color: '#FF9FF3',
        },
        {
          id: '7',
          name: 'Shops through Lucky Draw',
          description: 'Shops allocated through lucky draw system',
          totalShops: 35,
          availableShops: 16,
          icon: 'gift-outline',
          color: '#54A0FF',
        },
      ];

      // Calculate stats for each category
      const categoriesWithStatsData = mockCategories.map(category => {
        const categoryApplications = applications.filter(app => app.categoryId === category.id);
        
        return {
          category,
          totalApplications: categoryApplications.length,
          pendingApplications: categoryApplications.filter(app => app.status === 'pending').length,
          approvedApplications: categoryApplications.filter(app => app.status === 'approved').length,
          rejectedApplications: categoryApplications.filter(app => app.status === 'rejected').length,
        };
      });

      setCategoriesWithStats(categoriesWithStatsData);
    } catch (error) {
      console.error('Error loading categories with stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadCategoriesWithStats();
    setIsRefreshing(false);
  };

  const handleCategoryPress = (categoryId: string) => {
    navigation.navigate('AdminApplications', { categoryFilter: categoryId });
  };

  const renderCategoryCard = (categoryWithStats: CategoryWithStats) => (
    <TouchableOpacity
      key={categoryWithStats.category.id}
      style={styles.categoryCard}
      onPress={() => handleCategoryPress(categoryWithStats.category.id)}
      activeOpacity={0.8}
    >
      <View style={styles.categoryHeader}>
        <View style={[styles.categoryIcon, { backgroundColor: categoryWithStats.category.color + '20' }]}>
          <Ionicons name={categoryWithStats.category.icon} size={24} color={categoryWithStats.category.color} />
        </View>
        <View style={styles.categoryInfo}>
          <H3 color={COLORS.text.primary} weight='semiBold' size='md'>
            {categoryWithStats.category.name}
          </H3>
          <BodyText color={COLORS.text.secondary} size='sm' style={styles.categoryDescription}>
            {categoryWithStats.category.description}
          </BodyText>
        </View>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <BodyText color={COLORS.text.primary} size='xs' weight='semiBold'>
            Total Applications
          </BodyText>
          <H2 color={COLORS.primary} weight='bold' size='lg'>
            {categoryWithStats.totalApplications}
          </H2>
        </View>
        
        <View style={styles.statItem}>
          <BodyText color={COLORS.text.primary} size='xs' weight='semiBold'>
            Pending
          </BodyText>
          <H2 color={COLORS.warning} weight='bold' size='lg'>
            {categoryWithStats.pendingApplications}
          </H2>
        </View>
        
        <View style={styles.statItem}>
          <BodyText color={COLORS.text.primary} size='xs' weight='semiBold'>
            Approved
          </BodyText>
          <H2 color={COLORS.success} weight='bold' size='lg'>
            {categoryWithStats.approvedApplications}
          </H2>
        </View>
        
        <View style={styles.statItem}>
          <BodyText color={COLORS.text.primary} size='xs' weight='semiBold'>
            Rejected
          </BodyText>
          <H2 color={COLORS.error} weight='bold' size='lg'>
            {categoryWithStats.rejectedApplications}
          </H2>
        </View>
      </View>

      <View style={styles.categoryFooter}>
        <BodyText color={COLORS.text.tertiary} size='xs'>
          Tap to view applications
        </BodyText>
        <Ionicons name="chevron-forward" size={16} color={COLORS.text.tertiary} />
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
            Applications by Category
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
        {categoriesWithStats.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="grid-outline" size={48} color={COLORS.text.tertiary} />
            <H3 color={COLORS.text.tertiary} weight='semiBold' size='md' style={styles.emptyTitle}>
              No Categories Found
            </H3>
            <BodyText color={COLORS.text.tertiary} size='sm' style={styles.emptyDescription}>
              No stall categories are available at the moment.
            </BodyText>
          </View>
        ) : (
          categoriesWithStats.map(renderCategoryCard)
        )}
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
  categoryCard: {
    backgroundColor: COLORS.background.secondary,
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 20,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: COLORS.border.light,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  categoryIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  categoryInfo: {
    flex: 1,
  },
  categoryDescription: {
    marginTop: 4,
    lineHeight: 18,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  categoryFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.border.light,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    marginTop: 16,
    marginBottom: 8,
  },
  emptyDescription: {
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default AdminCategoriesScreen;













