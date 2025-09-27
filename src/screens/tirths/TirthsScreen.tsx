import React, { useState, useEffect, useCallback } from 'react';
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
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { COLORS } from '../../constants/colors';
import { FONTS, FONT_SIZES } from '../../constants/fonts';
import { H1, H2, H3, BodyText } from '../../components/Text';
import Ionicons from "react-native-vector-icons/Ionicons";
import FastImage from '@d11/react-native-fast-image';
import TirthService from '../../services/tirthService';
import { Tirth, TirthSearchParams } from '../../types/tirth';

type TirthsScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Tirths'>;

const TirthsScreen = () => {
  const [tirths, setTirths] = useState<Tirth[]>([]);
  const [filteredTirths, setFilteredTirths] = useState<Tirth[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [categories, setCategories] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<'synced' | 'syncing' | 'offline' | 'first-download'>('synced');

  const insets = useSafeAreaInsets();
  const navigation = useNavigation<TirthsScreenNavigationProp>();
  const tirthService = TirthService.getInstance();

  useEffect(() => {
    loadTirths();
  }, []);

  useEffect(() => {
    filterTirths();
  }, [tirths, searchQuery, selectedCategory]);

  const loadTirths = async () => {
    try {
      setIsLoading(true);
      
      // Check if this is first launch
      const isFirstLaunch = await tirthService.isFirstLaunch();
      if (isFirstLaunch) {
        setSyncStatus('first-download');
      }
      
      const [tirthsData, categoriesData] = await Promise.all([
        tirthService.getTirths(),
        tirthService.getCategories(),
      ]);
      
      setTirths(tirthsData);
      setCategories(categoriesData);
      setSyncStatus('synced');
    } catch (error) {
      console.error('Error loading tirths:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to load tirths data';
      Alert.alert('Error', errorMessage);
      setSyncStatus('offline');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    try {
      setIsRefreshing(true);
      setSyncStatus('syncing');
      await tirthService.forceSync();
      await loadTirths();
    } catch (error) {
      console.error('Error refreshing:', error);
      Alert.alert('Error', 'Failed to sync data');
      setSyncStatus('offline');
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
        tirth.location.city.toLowerCase().includes(query) ||
        tirth.location.state.toLowerCase().includes(query) ||
        tirth.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }

    // Apply category filter
    if (selectedCategory) {
      filtered = filtered.filter(tirth => tirth.category === selectedCategory);
    }

    setFilteredTirths(filtered);
  };

  const handleTirthPress = (tirth: Tirth) => {
    // Navigate to tirth detail screen
    // navigation.navigate('TirthDetail', { tirthId: tirth.id });
    console.log('Tirth pressed:', tirth.name);
  };

  const renderTirthCard = ({ item }: { item: Tirth }) => (
    <TouchableOpacity
      style={styles.tirthCard}
      onPress={() => handleTirthPress(item)}
    >
      <FastImage
        source={{ uri: item.images.main }}
        style={styles.tirthImage}
        resizeMode={FastImage.resizeMode.cover}
      />
      <View style={styles.tirthContent}>
        <H3 style={styles.tirthName} color={COLORS.text.primary} weight='semiBold' size='md'>
          {item.name}
        </H3>
        <BodyText style={styles.tirthLocation} color={COLORS.text.secondary} size='sm'>
          {item.location.city}, {item.location.state}
        </BodyText>
        <BodyText style={styles.tirthDescription} color={COLORS.text.tertiary} size='xs'>
          {item.description.substring(0, 100)}...
        </BodyText>
        <View style={styles.tirthTags}>
          {item.tags.slice(0, 3).map((tag, index) => (
            <View key={index} style={styles.tag}>
              <BodyText style={styles.tagText} color={COLORS.primary} size='xs'>
                {tag}
              </BodyText>
            </View>
          ))}
        </View>
      </View>
    </TouchableOpacity>
  );

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
            !selectedCategory && styles.activeCategoryText
          ]}
          color={!selectedCategory ? COLORS.white : COLORS.text.secondary}
          size='sm'
        >
          All
        </BodyText>
      </TouchableOpacity>
      {categories.map((category) => (
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
              selectedCategory === category && styles.activeCategoryText
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

  const renderSyncStatus = () => {
    if (syncStatus === 'first-download') {
      return (
        <View style={styles.syncStatus}>
          <Ionicons name="download" size={16} color={COLORS.primary} />
          <BodyText style={styles.syncText} color={COLORS.primary} size='xs'>
            Downloading 182 tirths...
          </BodyText>
        </View>
      );
    } else if (syncStatus === 'syncing') {
      return (
        <View style={styles.syncStatus}>
          <Ionicons name="sync" size={16} color={COLORS.primary} />
          <BodyText style={styles.syncText} color={COLORS.primary} size='xs'>
            Syncing...
          </BodyText>
        </View>
      );
    } else if (syncStatus === 'offline') {
      return (
        <View style={styles.syncStatus}>
          <Ionicons name="cloud-offline" size={16} color={COLORS.warning} />
          <BodyText style={styles.syncText} color={COLORS.warning} size='xs'>
            Offline
          </BodyText>
        </View>
      );
    }
    return null;
  };

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
          {renderSyncStatus()}
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
  syncStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  syncText: {
    marginLeft: 4,
    fontFamily: FONTS.gilroy.medium,
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
    paddingBottom: 16,
  },
  categoryContent: {
    paddingHorizontal: 20,
    gap: 8,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COLORS.background.secondary,
    borderWidth: 1,
    borderColor: COLORS.border.light,
  },
  activeCategoryButton: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  categoryText: {
    fontFamily: FONTS.gilroy.medium,
    fontSize: FONT_SIZES.sm,
  },
  activeCategoryText: {
    fontFamily: FONTS.gilroy.semiBold,
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
    backgroundColor: COLORS.background.secondary,
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.border.light,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  tirthImage: {
    width: '100%',
    height: 200,
  },
  tirthContent: {
    padding: 16,
  },
  tirthName: {
    fontFamily: FONTS.gilroy.semiBold,
    fontSize: FONT_SIZES.md,
    marginBottom: 4,
  },
  tirthLocation: {
    fontFamily: FONTS.gilroy.regular,
    fontSize: FONT_SIZES.sm,
    marginBottom: 8,
  },
  tirthDescription: {
    fontFamily: FONTS.gilroy.regular,
    fontSize: FONT_SIZES.xs,
    lineHeight: 16,
    marginBottom: 12,
  },
  tirthTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  tag: {
    backgroundColor: COLORS.primary + '20',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  tagText: {
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
