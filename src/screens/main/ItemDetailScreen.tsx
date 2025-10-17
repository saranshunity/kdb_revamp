import React from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  StatusBar,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRoute, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { H1, H2, H3, BodyText, H5 } from '../../components/Text';
import { COLORS } from '../../constants/colors';
import { FONTS, FONT_SIZES } from '../../constants/fonts';
import Ionicons from 'react-native-vector-icons/Ionicons';

type ItemDetailScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'ItemDetailScreen'>;

interface ItemDetail {
  id: number;
  title: string;
  image: string;
  description?: string;
  categories?: string[];
  rating?: number;
  time?: string;
  price?: number;
  location?: string;
  organizer?: string;
  contactInfo?: string;
  additionalInfo?: string;
}

interface ItemDetailScreenProps {
  navigation: ItemDetailScreenNavigationProp;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const ItemDetailScreen: React.FC<ItemDetailScreenProps> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const route = useRoute();
  const item = route.params as ItemDetail;

  const renderInfoRow = (icon: string, label: string, value: string, color: string = COLORS.text.secondary) => (
    <View style={styles.infoRow}>
      <View style={styles.infoIconContainer}>
        <Ionicons name={icon} size={24} color={COLORS.appColor} />
      </View>
      <View style={styles.infoContent}>
        <BodyText style={[styles.infoLabel, { fontFamily: FONTS.gilroy.medium }]} color={COLORS.text.tertiary} size='md' weight='medium'>
          {label}
        </BodyText>
        <BodyText style={[styles.infoValue, { fontFamily: FONTS.gilroy.regular }]} color={color} size='lg' weight='regular'>
          {value}
        </BodyText>
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background.primary} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.text.primary} />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.shareButton}>
          <Ionicons name="share-outline" size={24} color={COLORS.text.primary} />
        </TouchableOpacity>
      </View>

      {/* Scrollable Content */}
      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* Hero Image */}
        <View style={styles.imageContainer}>
          <Image source={{ uri: item.image }} style={styles.heroImage} />
        </View>
        {/* Title and Categories */}
        <View style={styles.titleSection}>
          <H5 
            style={[styles.title, { fontFamily: FONTS.gilroy.bold }]} 
            color={COLORS.text.primary} 
            weight='bold' 
            size='2xl'
          >
            {item.title}
          </H5>
          
          {item.categories && item.categories.length > 0 && (
            <View style={styles.categoriesContainer}>
              {item.categories.map((category, index) => (
                <View key={index} style={styles.categoryTag}>
                  <BodyText 
                    style={[styles.categoryText, { fontFamily: FONTS.gilroy.medium }]} 
                    color={COLORS.appColor} 
                    size='sm' 
                    weight='medium'
                  >
                    {category}
                  </BodyText>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Description */}
        {item.description && (
          <View style={styles.section}>
            <H5 
              style={[styles.sectionTitle, { fontFamily: FONTS.gilroy.bold }]} 
              color={COLORS.text.primary} 
              weight='bold' 
              size='xl'
            >
              About
            </H5>
            <BodyText 
              style={[styles.description, { fontFamily: FONTS.gilroy.regular }]} 
              color={COLORS.text.secondary} 
              size='lg'
            >
              {item.description}
            </BodyText>
          </View>
        )}

        {/* Event Details */}
        <View style={styles.section}>
          <H5 
            style={[styles.sectionTitle, { fontFamily: FONTS.gilroy.bold }]} 
            color={COLORS.text.primary} 
            weight='bold' 
            size='xl'
          >
            Event Details
          </H5>
          
          <View style={styles.detailsContainer}>
            {item.time && renderInfoRow('time-outline', 'Time', item.time)}
            {item.location && renderInfoRow('location-outline', 'Location', item.location)}
            {item.organizer && renderInfoRow('people-outline', 'Organizer', item.organizer)}
            {item.contactInfo && renderInfoRow('call-outline', 'Contact', item.contactInfo)}
            {item.rating && renderInfoRow('star-outline', 'Rating', `${item.rating}/5`, COLORS.warning)}
            {item.price && renderInfoRow('card-outline', 'Price', `₹${item.price}`, COLORS.appColor)}
          </View>
        </View>

        {/* Additional Information */}
        {item.additionalInfo && (
          <View style={styles.section}>
            <H5 
              style={[styles.sectionTitle, { fontFamily: FONTS.gilroy.bold }]} 
              color={COLORS.text.primary} 
              weight='bold' 
              size='xl'
            >
              Additional Information
            </H5>
            <BodyText 
              style={[styles.additionalInfo, { fontFamily: FONTS.gilroy.regular }]} 
              color={COLORS.text.secondary} 
              size='lg'
            >
              {item.additionalInfo}
            </BodyText>
          </View>
        )}

        {/* Action Button */}
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.primaryButton}>
            <Ionicons name="location-outline" size={20} color={COLORS.white} />
            <BodyText 
              style={[styles.buttonText, { fontFamily: FONTS.gilroy.semiBold }]} 
              color={COLORS.white} 
              size='lg' 
              weight='semiBold'
            >
              Get Directions
            </BodyText>
          </TouchableOpacity>
        </View>

        {/* Bottom Spacing */}
        <View style={styles.bottomSpacing} />
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border.light,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.background.tertiary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  shareButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.background.tertiary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContainer: {
    flex: 1,
  },
  imageContainer: {
    height: 250,
  },
  heroImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  titleSection: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 16,
  },
  title: {
    fontFamily: FONTS.gilroy.bold,
    fontSize: FONT_SIZES['2xl'],
    marginBottom: 16,
  },
  categoriesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  categoryTag: {
    backgroundColor: COLORS.appColor + '20',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  categoryText: {
    fontFamily: FONTS.gilroy.medium,
    fontSize: FONT_SIZES.md,
  },
  section: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  sectionTitle: {
    fontFamily: FONTS.gilroy.bold,
    fontSize: FONT_SIZES.xl,
    marginBottom: 16,
  },
  description: {
    fontFamily: FONTS.gilroy.regular,
    fontSize: FONT_SIZES.lg,
    lineHeight: 28,
  },
  detailsContainer: {
    gap: 20,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  infoIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.appColor + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontFamily: FONTS.gilroy.medium,
    fontSize: FONT_SIZES.md,
    marginBottom: 4,
  },
  infoValue: {
    fontFamily: FONTS.gilroy.regular,
    fontSize: FONT_SIZES.lg,
  },
  additionalInfo: {
    fontFamily: FONTS.gilroy.regular,
    fontSize: FONT_SIZES.lg,
    lineHeight: 28,
  },
  actionButtons: {
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  primaryButton: {
    backgroundColor: COLORS.appColor,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    borderRadius: 12,
    gap: 12,
  },
  buttonText: {
    fontFamily: FONTS.gilroy.semiBold,
    fontSize: FONT_SIZES.lg,
  },
  bottomSpacing: {
    height: 20,
  },
});

export default ItemDetailScreen;
