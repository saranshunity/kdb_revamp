import React, { useState } from "react";
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
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { COLORS } from '../../constants/colors';
import { FONTS, FONT_SIZES } from '../../constants/fonts';
import Ionicons from "react-native-vector-icons/Ionicons";

type StallsScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Stalls'>;

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

const StallsScreen = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<StallsScreenNavigationProp>();

  const stallsData: Stall[] = [
    {
      stallId: "1",
      stallName: "Artisan Crafts Corner",
      ownerName: "Priya Sharma",
      category: "Handicrafts",
      tags: ["handmade", "traditional", "artisan"],
      state: "Rajasthan",
      country: "India",
      stallNumber: "1",
      description: "Traditional Rajasthani handicrafts and handmade jewelry",
      phone: "+91 98765 43210",
      email: "priya@artisancrafts.com",
      website: "www.artisancrafts.com",
      instagram: "@artisancrafts",
      facebook: "Artisan Crafts Corner",
      images: ["https://picsum.photos/300/200", "https://picsum.photos/301/200"]
    },
    {
      stallId: "2",
      stallName: "Spice Paradise",
      ownerName: "Rajesh Kumar",
      category: "Food & Spices",
      tags: ["spices", "organic", "traditional"],
      state: "Kerala",
      country: "India",
      stallNumber: "2",
      description: "Authentic Kerala spices and organic food products",
      phone: "+91 87654 32109",
      email: "rajesh@spiceparadise.com",
      website: "www.spiceparadise.com",
      instagram: "@spiceparadise",
      facebook: "Spice Paradise",
      images: ["https://picsum.photos/302/200", "https://picsum.photos/303/200"]
    },
    {
      stallId: "3",
      stallName: "Textile Treasures",
      ownerName: "Meera Patel",
      category: "Textiles",
      tags: ["silk", "cotton", "traditional"],
      state: "Gujarat",
      country: "India",
      stallNumber: "3",
      description: "Premium silk and cotton textiles with traditional designs",
      phone: "+91 76543 21098",
      email: "meera@textiletreasures.com",
      website: "www.textiletreasures.com",
      instagram: "@textiletreasures",
      facebook: "Textile Treasures",
      images: ["https://picsum.photos/304/200", "https://picsum.photos/305/200"]
    },
    {
      stallId: "4",
      stallName: "Jewelry Junction",
      ownerName: "Amit Jain",
      category: "Jewelry",
      tags: ["gold", "silver", "precious stones"],
      state: "Delhi",
      country: "India",
      stallNumber: "4",
      description: "Exquisite gold and silver jewelry with precious stones",
      phone: "+91 65432 10987",
      email: "amit@jewelryjunction.com",
      website: "www.jewelryjunction.com",
      instagram: "@jewelryjunction",
      facebook: "Jewelry Junction",
      images: ["https://picsum.photos/306/200", "https://picsum.photos/307/200"]
    },
    {
      stallId: "5",
      stallName: "Pottery Palace",
      ownerName: "Sunita Reddy",
      category: "Pottery",
      tags: ["clay", "handmade", "decorative"],
      state: "Tamil Nadu",
      country: "India",
      stallNumber: "5",
      description: "Beautiful handmade pottery and ceramic items",
      phone: "+91 54321 09876",
      email: "sunita@potterypalace.com",
      website: "www.potterypalace.com",
      instagram: "@potterypalace",
      facebook: "Pottery Palace",
      images: ["https://picsum.photos/308/200", "https://picsum.photos/309/200"]
    }
  ];

  const categories = ["All", "Handicrafts", "Food & Spices", "Textiles", "Jewelry", "Pottery"];

  const filteredStalls = stallsData.filter(stall => {
    const matchesSearch = stall.stallName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         stall.ownerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         stall.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         stall.stallNumber.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "All" || stall.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleStallPress = (stall: Stall) => {
    // Navigate to stall detail screen
    console.log("Stall pressed:", stall.stallName);
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
        {categories.map((category) => (
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
        {filteredStalls.map((stall) => (
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
                <Text style={styles.stallInfo}>
                  {stall.category}
                </Text>
                <Text style={styles.location}>
                  {stall.state}, {stall.country}
                </Text>
              </View>
            </View>
            <View style={styles.stallRight}>
              <Ionicons name="chevron-forward" size={20} color={COLORS.text.tertiary} />
            </View>
          </TouchableOpacity>
        ))}
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
    maxHeight:60
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
