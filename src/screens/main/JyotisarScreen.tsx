import React from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  StatusBar,
  Image,
  TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { H2, H3, BodyText, ButtonTextPrimary } from '../../components/Text';
import { COLORS } from '../../constants/colors';
import { FONTS, FONT_SIZES } from '../../constants/fonts';
import Ionicons from "react-native-vector-icons/Ionicons";

type JyotisarScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Jyotisar'>;

interface JyotisarScreenProps {
  navigation: JyotisarScreenNavigationProp;
}

const JyotisarScreen: React.FC<JyotisarScreenProps> = ({ navigation }) => {
  const insets = useSafeAreaInsets();

  const jyotisarInfo = {
    significance: 'Jyotisar is the sacred place where Lord Krishna delivered the Bhagavad Gita to Arjuna before the great battle of Mahabharata. It is considered one of the most important pilgrimage sites in Kurukshetra.',
    timings: '6:00 AM - 8:00 PM',
    entryFee: 'Free',
    location: 'Jyotisar, Kurukshetra, Haryana',
    contact: '+91-1744-XXXXXX',
    bestTimeToVisit: 'October to March'
  };

  const attractions = [
    {
      id: 1,
      title: 'Banyan Tree (Vat Vriksha)',
      description: 'The sacred banyan tree under which Lord Krishna is believed to have delivered the Gita',
      image: 'https://picsum.photos/300/200?random=20',
      significance: 'This ancient tree is said to be a witness to the divine discourse'
    },
    {
      id: 2,
      title: 'Gita Mandir',
      description: 'A beautiful temple dedicated to the Bhagavad Gita with verses inscribed on its walls',
      image: 'https://picsum.photos/300/200?random=21',
      significance: 'Houses the complete text of the Bhagavad Gita in marble'
    },
    {
      id: 3,
      title: 'Arjuna\'s Chariot',
      description: 'A replica of Arjuna\'s chariot where the divine conversation took place',
      image: 'https://picsum.photos/300/200?random=22',
      significance: 'Represents the moment when Krishna became Arjuna\'s charioteer'
    },
    {
      id: 4,
      title: 'Krishna-Arjuna Statue',
      description: 'A magnificent statue depicting Lord Krishna delivering the Gita to Arjuna',
      image: 'https://picsum.photos/300/200?random=23',
      significance: 'Symbolizes the eternal teacher-student relationship'
    }
  ];

  const gitaVerses = [
    {
      id: 1,
      verse: 'कर्मण्येवाधिकारस्ते मा फलेषु कदाचन।',
      translation: 'You have a right to perform your prescribed duty, but not to the fruits of action.',
      chapter: 'Chapter 2, Verse 47'
    },
    {
      id: 2,
      verse: 'योगस्थ: कुरु कर्माणि सङ्गं त्यक्त्वा धनञ्जय।',
      translation: 'Be steadfast in yoga, O Arjuna. Perform your duty and abandon all attachment to success or failure.',
      chapter: 'Chapter 2, Verse 48'
    },
    {
      id: 3,
      verse: 'सर्वधर्मान्परित्यज्य मामेकं शरणं व्रज।',
      translation: 'Abandon all varieties of religion and just surrender unto Me.',
      chapter: 'Chapter 18, Verse 66'
    }
  ];

  const renderAttraction = (attraction: any) => (
    <View key={attraction.id} style={styles.attractionCard}>
      <Image source={{ uri: attraction.image }} style={styles.attractionImage} />
      <View style={styles.attractionContent}>
        <H3 style={styles.attractionTitle} color={COLORS.text.primary} weight='bold' size='lg'>
          {attraction.title}
        </H3>
        <BodyText style={styles.attractionDescription} color={COLORS.text.primary} size='md'>
          {attraction.description}
        </BodyText>
        <View style={styles.significanceContainer}>
          <Ionicons name="star" size={16} color={COLORS.warning} />
          <BodyText style={styles.significanceText} color={COLORS.text.secondary} size='sm'>
            {attraction.significance}
          </BodyText>
        </View>
      </View>
    </View>
  );

  const renderGitaVerse = (verse: any) => (
    <View key={verse.id} style={styles.verseCard}>
      <BodyText style={styles.sanskritVerse} color={COLORS.primary} size='md' weight='semiBold'>
        {verse.verse}
      </BodyText>
      <BodyText style={styles.verseTranslation} color={COLORS.text.primary} size='sm'>
        {verse.translation}
      </BodyText>
      <BodyText style={styles.verseChapter} color={COLORS.text.secondary} size='xs'>
        {verse.chapter}
      </BodyText>
    </View>
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
          <Ionicons name="arrow-back-outline" size={24} color={COLORS.text.primary} />
        </TouchableOpacity>
        <H2 style={styles.headerTitle} color={COLORS.text.primary} weight='bold' size='xl'>
          Jyotisar
        </H2>
        <View style={styles.headerRight} />
      </View>

      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <Image 
            source={{ uri: 'https://picsum.photos/400/250?random=19' }} 
            style={styles.heroImage}
          />
          <View style={styles.heroOverlay}>
            <H2 style={styles.heroTitle} color={COLORS.white} weight='bold' size='2xl'>
              Jyotisar
            </H2>
            <BodyText style={styles.heroSubtitle} color={COLORS.white} size='md'>
              Where the Bhagavad Gita was Born
            </BodyText>
          </View>
        </View>

        {/* Significance Section */}
        <View style={styles.significanceSection}>
          <H3 style={styles.sectionTitle} color={COLORS.text.primary} weight='bold' size='lg'>
            Sacred Significance
          </H3>
          <BodyText style={styles.significanceText} color={COLORS.text.primary} size='md'>
            {jyotisarInfo.significance}
          </BodyText>
        </View>

        {/* Main Attractions */}
        <View style={styles.attractionsSection}>
          <H3 style={styles.sectionTitle} color={COLORS.text.primary} weight='bold' size='lg'>
            Main Attractions
          </H3>
          {attractions.map(renderAttraction)}
        </View>

        {/* Gita Verses Section */}
        <View style={styles.versesSection}>
          <H3 style={styles.sectionTitle} color={COLORS.text.primary} weight='bold' size='lg'>
            Sacred Verses from Bhagavad Gita
          </H3>
          <BodyText style={styles.versesIntro} color={COLORS.text.secondary} size='md'>
            Some of the most profound teachings delivered at this sacred place:
          </BodyText>
          {gitaVerses.map(renderGitaVerse)}
        </View>

        {/* Visitor Information */}
        <View style={styles.infoSection}>
          <H3 style={styles.infoTitle} color={COLORS.text.primary} weight='bold' size='lg'>
            Visitor Information
          </H3>
          
          <View style={styles.infoCard}>
            <View style={styles.infoItem}>
              <Ionicons name="time-outline" size={20} color={COLORS.primary} />
              <BodyText style={styles.infoLabel} color={COLORS.text.primary} size='md' weight='semiBold'>
                Timings:
              </BodyText>
              <BodyText style={styles.infoValue} color={COLORS.text.primary} size='md'>
                {jyotisarInfo.timings}
              </BodyText>
            </View>
            
            <View style={styles.infoItem}>
              <Ionicons name="card-outline" size={20} color={COLORS.primary} />
              <BodyText style={styles.infoLabel} color={COLORS.text.primary} size='md' weight='semiBold'>
                Entry Fee:
              </BodyText>
              <BodyText style={styles.infoValue} color={COLORS.text.primary} size='md'>
                {jyotisarInfo.entryFee}
              </BodyText>
            </View>
            
            <View style={styles.infoItem}>
              <Ionicons name="location-outline" size={20} color={COLORS.primary} />
              <BodyText style={styles.infoLabel} color={COLORS.text.primary} size='md' weight='semiBold'>
                Location:
              </BodyText>
              <BodyText style={styles.infoValue} color={COLORS.text.primary} size='md'>
                {jyotisarInfo.location}
              </BodyText>
            </View>
            
            <View style={styles.infoItem}>
              <Ionicons name="calendar-outline" size={20} color={COLORS.primary} />
              <BodyText style={styles.infoLabel} color={COLORS.text.primary} size='md' weight='semiBold'>
                Best Time:
              </BodyText>
              <BodyText style={styles.infoValue} color={COLORS.text.primary} size='md'>
                {jyotisarInfo.bestTimeToVisit}
              </BodyText>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.primaryButton}>
            <Ionicons name="navigate-outline" size={20} color={COLORS.white} />
            <ButtonTextPrimary size='md' style={styles.buttonText}>
              Get Directions
            </ButtonTextPrimary>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.secondaryButton}>
            <Ionicons name="book-outline" size={20} color={COLORS.primary} />
            <BodyText style={styles.secondaryButtonText} color={COLORS.primary} size='md' weight='semiBold'>
              Read Gita
            </BodyText>
          </TouchableOpacity>
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
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border.light,
  },
  backButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
  },
  headerTitle: {
    fontFamily: FONTS.gilroy.bold,
    fontSize: FONT_SIZES.xl,
  },
  headerRight: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 32,
  },
  heroSection: {
    position: 'relative',
    height: 250,
    marginBottom: 24,
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    padding: 20,
  },
  heroTitle: {
    fontFamily: FONTS.gilroy.bold,
    fontSize: FONT_SIZES['2xl'],
    marginBottom: 8,
  },
  heroSubtitle: {
    fontFamily: FONTS.gilroy.regular,
    fontSize: FONT_SIZES.md,
  },
  significanceSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontFamily: FONTS.gilroy.bold,
    fontSize: FONT_SIZES.lg,
    marginBottom: 12,
  },
  significanceText: {
    fontFamily: FONTS.gilroy.regular,
    fontSize: FONT_SIZES.md,
    lineHeight: 24,
  },
  attractionsSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  attractionCard: {
    backgroundColor: COLORS.background.primary,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: COLORS.shadow,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: COLORS.border.light,
    overflow: 'hidden',
  },
  attractionImage: {
    width: '100%',
    height: 150,
  },
  attractionContent: {
    padding: 16,
  },
  attractionTitle: {
    fontFamily: FONTS.gilroy.bold,
    fontSize: FONT_SIZES.lg,
    marginBottom: 8,
  },
  attractionDescription: {
    fontFamily: FONTS.gilroy.regular,
    fontSize: FONT_SIZES.md,
    lineHeight: 22,
    marginBottom: 8,
  },
  significanceContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 8,
  },
  versesSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  versesIntro: {
    fontFamily: FONTS.gilroy.regular,
    fontSize: FONT_SIZES.md,
    lineHeight: 22,
    marginBottom: 16,
  },
  verseCard: {
    backgroundColor: COLORS.background.tertiary,
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
  },
  sanskritVerse: {
    fontFamily: FONTS.gilroy.semiBold,
    fontSize: FONT_SIZES.md,
    marginBottom: 8,
    lineHeight: 24,
  },
  verseTranslation: {
    fontFamily: FONTS.gilroy.regular,
    fontSize: FONT_SIZES.sm,
    marginBottom: 4,
    lineHeight: 20,
  },
  verseChapter: {
    fontFamily: FONTS.gilroy.regular,
    fontSize: FONT_SIZES.xs,
  },
  infoSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  infoTitle: {
    fontFamily: FONTS.gilroy.bold,
    fontSize: FONT_SIZES.lg,
    marginBottom: 16,
  },
  infoCard: {
    backgroundColor: COLORS.background.tertiary,
    borderRadius: 12,
    padding: 20,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoLabel: {
    fontFamily: FONTS.gilroy.semiBold,
    fontSize: FONT_SIZES.md,
    marginLeft: 12,
    width: 80,
  },
  infoValue: {
    fontFamily: FONTS.gilroy.regular,
    fontSize: FONT_SIZES.md,
    flex: 1,
    marginLeft: 8,
  },
  actionButtons: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
  },
  primaryButton: {
    flex: 1,
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: COLORS.background.primary,
    borderWidth: 1,
    borderColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  buttonText: {
    color: COLORS.white,
  },
  secondaryButtonText: {
    fontFamily: FONTS.gilroy.semiBold,
    fontSize: FONT_SIZES.md,
  },
});

export default JyotisarScreen;
