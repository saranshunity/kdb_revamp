import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  TextInput,
} from "react-native";
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { COLORS } from '../../constants/colors';
import { FONTS, FONT_SIZES } from '../../constants/fonts';
import Ionicons from "react-native-vector-icons/Ionicons";

type StallsScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Stalls'>;
type StallsScreenRouteProp = RouteProp<RootStackParamList, 'Stalls'>;

interface Stall {
  stallId: string;
  stallName: string;
  ownerName: string;
  category: string;
  tags: string[];
  state: string;
  country: string;
  stallNumber: string;
  description: string;
  phone: string;
  email: string;
  website: string;
  instagram: string;
  facebook: string;
  images: string[];
}

const STALLS_ENDPOINT = 'https://firebasestorage.googleapis.com/v0/b/kdbrevampnew.firebasestorage.app/o/stalls.json?alt=media&token=c1780ec1-aff0-4fe6-a027-05193e237e33';
const CATEGORY_OPTIONS = ["All", "Craft Fair", "Book Fair", "Shopping", "Food & Refreshment"];

const StallsScreen = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [stallsData, setStallsData] = useState<Stall[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<StallsScreenNavigationProp>();
  const route = useRoute<StallsScreenRouteProp>();
  const initialCategory = route.params?.initialCategory;

  useEffect(() => {
    if (initialCategory && CATEGORY_OPTIONS.includes(initialCategory)) {
      setSelectedCategory(initialCategory);
    }
  }, [initialCategory]);

  useEffect(() => {
    let isMounted = true;
    const fetchStalls = async () => {
      try {
        setLoading(true);
        const response = await fetch(STALLS_ENDPOINT);
        if (!response.ok) {
          throw new Error('Failed to load stalls');
        }
        const data = await response.json();
        if (isMounted) {
          setStallsData(Array.isArray(data) ? data : []);
          setError(null);
        }
      } catch (err: any) {
        if (isMounted) {
          setError('Unable to load stalls right now. Please try again.');
          setStallsData([]);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchStalls();
    return () => {
      isMounted = false;
    };
  }, []);

  const filteredStalls = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();
    const normalizedCategory = selectedCategory.toLowerCase();
    return stallsData.filter((stall) => {
      const matchesSearch =
        !normalizedQuery ||
        stall.stallName?.toLowerCase().includes(normalizedQuery) ||
        stall.ownerName?.toLowerCase().includes(normalizedQuery) ||
        stall.description?.toLowerCase().includes(normalizedQuery) ||
        stall.stallNumber?.toLowerCase().includes(normalizedQuery);

      const matchesCategory =
        selectedCategory === 'All' ||
        stall.category?.toLowerCase() === normalizedCategory ||
        stall.tags?.some((tag) => tag.toLowerCase() === normalizedCategory);

      return matchesSearch && matchesCategory;
    });
  }, [stallsData, searchQuery, selectedCategory]);

  const handleStallPress = (stall: Stall) => {
    navigation.navigate('StallDetail', { stall });
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle='dark-content' backgroundColor={COLORS.background.primary} />
      
      {/* Header */}
      <View style={styles.headerContainer}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.header}>Stalls</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color={COLORS.text.secondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search stalls, owners, numbers, or categories..."
            placeholderTextColor={COLORS.text.tertiary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {/* Category Filter */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.categoryContainer}
        contentContainerStyle={styles.categoryContent}
      >
        {CATEGORY_OPTIONS.map((category) => (
          <TouchableOpacity
            key={category}
            style={[
              styles.categoryButton,
              selectedCategory === category && styles.selectedCategoryButton
            ]}
            onPress={() => setSelectedCategory(category)}
          >
            <Text
              style={[
                styles.categoryText,
                selectedCategory === category && styles.selectedCategoryText
              ]}
            >
              {category}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Stalls List */}
      <ScrollView style={styles.stallsListContainer} contentContainerStyle={styles.stallsList} showsVerticalScrollIndicator={false}>
        {loading ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>Loading stalls...</Text>
          </View>
        ) : error ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>{error}</Text>
          </View>
        ) : filteredStalls.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No stalls found for this selection.</Text>
          </View>
        ) : (
          filteredStalls.map((stall) => (
            <TouchableOpacity
              key={stall.stallId}
              style={styles.stallItem}
              onPress={() => handleStallPress(stall)}
            >
              <View style={styles.stallLeft}>
                <View style={styles.stallNumberBadge}>
                  <Text style={styles.stallNumberText}>{stall.stallNumber}</Text>
                </View>
                <View style={styles.stallDetails}>
                  <Text style={styles.stallName}>{stall.stallName}</Text>
                  <Text style={styles.ownerName}>by {stall.ownerName}</Text>
                  <Text style={styles.stallInfo}>{stall.category}</Text>
                  <Text style={styles.location}>
                    {stall.state}, {stall.country}
                  </Text>
                </View>
              </View>
              <View style={styles.stallRight}>
                <Ionicons name="chevron-forward" size={20} color={COLORS.text.tertiary} />
              </View>
            </TouchableOpacity>
          ))
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
    backgroundColor: COLORS.background.primary,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border.light,
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    fontSize: 24,
    color: COLORS.primary,
    fontFamily: FONTS.gilroy.bold,
  },
  header: {
    fontSize: FONT_SIZES.lg,
    fontFamily: FONTS.gilroy.bold,
    color: COLORS.text.primary,
  },
  placeholder: {
    width: 40,
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: COLORS.background.primary,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background.secondary,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.gilroy.regular,
    color: COLORS.text.primary,
  },
  categoryContainer: {
    backgroundColor: COLORS.background.primary,
    maxHeight: 60,
    // paddingBottom: 4,
  },
  categoryContent: {
    paddingHorizontal: 20,
    paddingVertical: 4,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COLORS.background.secondary,
    marginRight: 8,
    height: 32,
  },
  selectedCategoryButton: {
    backgroundColor: COLORS.background.appColor,
  },
  categoryText: {
    fontSize: FONT_SIZES.xs,
    fontFamily: FONTS.gilroy.medium,
    color: COLORS.text.secondary,
  },
  selectedCategoryText: {
    color: COLORS.white,
    fontFamily: FONTS.gilroy.semiBold,
    height: 32,
  },
  stallsListContainer: {
    flex: 1,
  },
  stallsList: {
    paddingHorizontal: 20,
    paddingTop: 0,
  },
  emptyState: {
    paddingVertical: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyStateText: {
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.gilroy.medium,
    color: COLORS.text.secondary,
    textAlign: 'center',
  },
  stallItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border.light,
    backgroundColor: COLORS.background.primary,
    marginBottom: 8,
    borderRadius: 12,
    paddingHorizontal: 16,
  },
  stallLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  stallNumberBadge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.background.appColor,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  stallNumberText: {
    fontSize: FONT_SIZES.md,
    fontFamily: FONTS.gilroy.bold,
    color: COLORS.white,
  },
  stallDetails: {
    flex: 1,
  },
  stallName: {
    fontSize: FONT_SIZES.md,
    fontFamily: FONTS.gilroy.semiBold,
    color: COLORS.text.primary,
    marginBottom: 2,
  },
  ownerName: {
    fontSize: FONT_SIZES.xs,
    fontFamily: FONTS.gilroy.regular,
    color: COLORS.text.secondary,
    marginBottom: 4,
  },
  stallInfo: {
    fontSize: FONT_SIZES.xs,
    fontFamily: FONTS.gilroy.medium,
    color: COLORS.text.tertiary,
    marginBottom: 2,
  },
  location: {
    fontSize: FONT_SIZES.xs,
    fontFamily: FONTS.gilroy.regular,
    color: COLORS.text.tertiary,
  },
  stallRight: {
    padding: 8,
  },
});

export default StallsScreen;
