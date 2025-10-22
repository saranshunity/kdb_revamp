import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  TextInput,
  FlatList,
  RefreshControl,
  ImageBackground,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { COLORS } from '../../constants/colors';
import { FONTS, FONT_SIZES } from '../../constants/fonts';
import { H1, H2, H3, BodyText } from '../../components/Text';
import Ionicons from "react-native-vector-icons/Ionicons";

type TirthsScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Tirths'>;

// Import tirth data
import tirthData from '../../../tirth.json';

// Tirth interface matching JSON structure
interface Tirth {
  id: string;
  name: string;
  alternateName: string;
  category: string;
  district: string;
  location: {
    address: string;
    coordinates: {
      latitude: number | null;
      longitude: number | null;
    };
  };
  shortDescription: string;
  description: string;
  significance: string;
  mythology: string;
  bestTimeToVisit: string;
  facilities: string[];
  images: string[];
  nearbyTirthas: string[];
  distanceFromKurukshetra: string;
  openingHours: string;
  entryFee: string;
  historicalReferences: string[];
}

const TirthsScreen = () => {
  const [tirths, setTirths] = useState<Tirth[]>([]);
  const [filteredTirths, setFilteredTirths] = useState<Tirth[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [categories, setCategories] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const insets = useSafeAreaInsets();
  const navigation = useNavigation<TirthsScreenNavigationProp>();

  useEffect(() => {
    loadTirths();
  }, []);

  useEffect(() => {
    filterTirths();
  }, [tirths, searchQuery, selectedCategory]);

  const loadTirths = async () => {
    try {
      setIsLoading(true);
      
      // Load tirthas from JSON file
      const tirthsList: Tirth[] = tirthData.tirthas;
      
      // Extract unique districts for categories
      const districts = ['All', ...new Set(tirthsList.map(t => t.district))];
      
      setTirths(tirthsList);
      setCategories(districts);
    } catch (error) {
      console.error('Error loading tirths:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    try {
      setIsRefreshing(true);
      await loadTirths();
    } catch (error) {
      console.error('Error refreshing:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const filterTirths = () => {
    let filtered = tirths;

    // Apply search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(tirth =>
        tirth.name.toLowerCase().includes(query) ||
        tirth.description.toLowerCase().includes(query) ||
        tirth.shortDescription.toLowerCase().includes(query) ||
        tirth.location.address.toLowerCase().includes(query) ||
        tirth.district.toLowerCase().includes(query)
      );
    }

    // Apply category filter (district filter)
    if (selectedCategory && selectedCategory !== 'All') {
      filtered = filtered.filter(tirth => tirth.district === selectedCategory);
    }

    setFilteredTirths(filtered);
  };

  const handleTirthPress = (tirth: Tirth) => {
    // Navigate to tirth detail screen
    navigation.navigate('TirthDetail', { tirth });
  };

  const renderTirthCard = ({ item }: { item: Tirth }) => {
    const hasImage = item.images && item.images.length > 0;
    const imageUrl = hasImage ? item.images[0] : null;

    return (
      <TouchableOpacity
        style={styles.tirthCard}
        onPress={() => handleTirthPress(item)}
        activeOpacity={0.9}
      >
        {imageUrl ? (
          <ImageBackground
            source={{ uri: imageUrl }}
            style={styles.tirthImageBackground}
            imageStyle={styles.tirthImageStyle}
          >
            <View style={styles.imageOverlay} />
            <View style={styles.tirthContent}>
              <H3 style={styles.tirthName} color={COLORS.white} weight='semiBold' size='lg'>
                {item.name}
              </H3>
              <BodyText style={styles.tirthLocation} color={COLORS.white} size='sm'>
                <Ionicons name="location-outline" size={14} color={COLORS.white} />
                {' '}{item.location.address}, {item.district}
              </BodyText>
              {item.shortDescription && (
                <BodyText style={styles.tirthDescription} color={COLORS.white} size='sm' numberOfLines={3}>
                  {item.shortDescription}
                </BodyText>
              )}
              <View style={styles.tirthTags}>
                <View style={styles.tag}>
                  <BodyText style={styles.tagText} color={COLORS.white} size='xs' weight='semiBold'>
                    {item.district}
                  </BodyText>
                </View>
                {item.category && (
                  <View style={styles.tag}>
                    <BodyText style={styles.tagText} color={COLORS.white} size='xs' weight='semiBold'>
                      {item.category}
                    </BodyText>
                  </View>
                )}
              </View>
            </View>
          </ImageBackground>
        ) : (
          <View style={styles.tirthContentNoImage}>
            <H3 style={styles.tirthNameNoImage} color={COLORS.text.primary} weight='semiBold' size='md'>
              {item.name}
            </H3>
            <BodyText style={styles.tirthLocationNoImage} color={COLORS.text.secondary} size='sm'>
              <Ionicons name="location-outline" size={14} color={COLORS.text.secondary} />
              {' '}{item.location.address}, {item.district}
            </BodyText>
            {item.shortDescription && (
              <BodyText style={styles.tirthDescriptionNoImage} color={COLORS.text.tertiary} size='xs' numberOfLines={2}>
                {item.shortDescription}
              </BodyText>
            )}
            <View style={styles.tirthTags}>
              <View style={styles.tagNoImage}>
                <BodyText style={styles.tagTextNoImage} color={COLORS.primary} size='xs'>
                  {item.district}
                </BodyText>
              </View>
              {item.category && (
                <View style={styles.tagNoImage}>
                  <BodyText style={styles.tagTextNoImage} color={COLORS.primary} size='xs'>
                    {item.category}
                  </BodyText>
                </View>
              )}
            </View>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const renderCategoryFilter = () => (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.categoryContainer}
      contentContainerStyle={styles.categoryContent}
    >
      <TouchableOpacity
        style={[
          styles.categoryButton,
          !selectedCategory && styles.activeCategoryButton
        ]}
        onPress={() => setSelectedCategory('')}
      >
        <BodyText
          style={[
            styles.categoryText,
            !selectedCategory ? styles.activeCategoryText : {}
          ]}
          color={!selectedCategory ? COLORS.white : COLORS.text.secondary}
          size='sm'
        >
          All
        </BodyText>
      </TouchableOpacity>
   
      {categories.filter(cat => cat !== 'All').map((category) => (
        <TouchableOpacity
          key={category}
          style={[
            styles.categoryButton,
            selectedCategory === category && styles.activeCategoryButton
          ]}
          onPress={() => setSelectedCategory(category)}
        >
        <BodyText
          style={[
            styles.categoryText,
            selectedCategory === category ? styles.activeCategoryText : {}
          ]}
          color={selectedCategory === category ? COLORS.white : COLORS.text.secondary}
          size='sm'
        >
            {category.charAt(0).toUpperCase() + category.slice(1)}
          </BodyText>
        </TouchableOpacity>
      ))}
    </ScrollView>
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
          <H2 style={styles.headerTitle} color={COLORS.text.primary} weight='bold' size='lg'>
            48 Kos Tirths
          </H2>
        </View>
        <TouchableOpacity
          style={styles.syncButton}
          onPress={handleRefresh}
          disabled={isRefreshing}
        >
          <Ionicons name="refresh" size={24} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color={COLORS.text.tertiary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search tirths, cities, or tags..."
            placeholderTextColor={COLORS.text.tertiary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color={COLORS.text.tertiary} />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      {/* Category Filters */}
      {renderCategoryFilter()}

      {/* Results Count */}
      <View style={styles.resultsContainer}>
        <BodyText style={styles.resultsText} color={COLORS.text.secondary} size='sm'>
          {filteredTirths.length} tirths found
        </BodyText>
      </View>

      {/* Tirths List */}
      <FlatList
        data={filteredTirths}
        renderItem={renderTirthCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="location-outline" size={64} color={COLORS.text.tertiary} />
            <H3 style={styles.emptyTitle} color={COLORS.text.secondary} weight='medium' size='md'>
              No tirths found
            </H3>
            <BodyText style={styles.emptyText} color={COLORS.text.tertiary} size='sm'>
              Try adjusting your search or filters
            </BodyText>
          </View>
        }
      />
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
  syncButton: {
    padding: 8,
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: COLORS.background.primary,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background.secondary,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: COLORS.border.light,
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
    // maxHeight:60,
    marginBottom: 16,
    // paddingBottom: 16,
  },
  categoryContent: {
    paddingHorizontal: 20,
    paddingVertical: 4,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 2,
    borderRadius: 20,
    backgroundColor: COLORS.background.secondary,
    marginRight: 4,
    height: 32,
  },
  activeCategoryButton: {
    backgroundColor: COLORS.background.appColor,
    borderColor: COLORS.background.appColor,
  },
  categoryText: {
    fontFamily: FONTS.gilroy.semiBold,
    fontSize: FONT_SIZES.sm,
    color: COLORS.primary,
  },
  activeCategoryText: {
    fontFamily: FONTS.gilroy.bold,
    color: COLORS.white,
  },
  resultsContainer: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  resultsText: {
    fontFamily: FONTS.gilroy.medium,
    fontSize: FONT_SIZES.sm,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  tirthCard: {
    borderRadius: 20,
    marginBottom: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    backgroundColor: COLORS.background.secondary,
  },
  tirthImageBackground: {
    height: 160,
    justifyContent: 'flex-end',
  },
  tirthImageStyle: {
    borderRadius: 20,
  },
  imageOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 20,
  },
  tirthContent: {
    padding: 16,
    paddingBottom: 20,
    zIndex: 1,
  },
  tirthContentNoImage: {
    padding: 20,
    backgroundColor: COLORS.background.secondary,
  },
  tirthName: {
    fontFamily: FONTS.gilroy.bold,
    fontSize: FONT_SIZES.md,
    marginBottom: 4,
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  tirthNameNoImage: {
    fontFamily: FONTS.gilroy.semiBold,
    fontSize: FONT_SIZES.md,
    marginBottom: 4,
  },
  tirthLocation: {
    fontFamily: FONTS.gilroy.medium,
    fontSize: FONT_SIZES.sm,
    marginBottom: 10,
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  tirthLocationNoImage: {
    fontFamily: FONTS.gilroy.regular,
    fontSize: FONT_SIZES.sm,
    marginBottom: 8,
  },
  tirthDescription: {
    fontFamily: FONTS.gilroy.regular,
    fontSize: FONT_SIZES.xs,
    lineHeight: 16,
    marginBottom: 12,
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  tirthDescriptionNoImage: {
    fontFamily: FONTS.gilroy.regular,
    fontSize: FONT_SIZES.xs,
    lineHeight: 16,
    marginBottom: 12,
  },
  tirthTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  tagNoImage: {
    backgroundColor: COLORS.primary + '20',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  tagText: {
    fontFamily: FONTS.gilroy.semiBold,
    fontSize: FONT_SIZES.xs,
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  tagTextNoImage: {
    fontFamily: FONTS.gilroy.medium,
    fontSize: FONT_SIZES.xs,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontFamily: FONTS.gilroy.medium,
    fontSize: FONT_SIZES.md,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontFamily: FONTS.gilroy.regular,
    fontSize: FONT_SIZES.sm,
    textAlign: 'center',
  },
});

export default TirthsScreen;
