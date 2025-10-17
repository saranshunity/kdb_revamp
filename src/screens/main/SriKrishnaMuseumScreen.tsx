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

type SriKrishnaMuseumScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'SriKrishnaMuseum'>;

interface SriKrishnaMuseumScreenProps {
  navigation: SriKrishnaMuseumScreenNavigationProp;
}

const SriKrishnaMuseumScreen: React.FC<SriKrishnaMuseumScreenProps> = ({ navigation }) => {
  const insets = useSafeAreaInsets();

  const museumSections = [
    {
      id: 1,
      title: 'Ancient Artifacts',
      description: 'Rare sculptures and artifacts dating back to the Mahabharata era',
      image: 'https://picsum.photos/300/200?random=10',
      highlights: ['Stone sculptures', 'Bronze idols', 'Ancient manuscripts']
    },
    {
      id: 2,
      title: 'Mahabharata Gallery',
      description: 'Interactive displays showcasing the epic battle and its significance',
      image: 'https://picsum.photos/300/200?random=11',
      highlights: ['Battle scenes', 'Character depictions', 'Historical timeline']
    },
    {
      id: 3,
      title: 'Spiritual Heritage',
      description: 'Exhibition of religious texts, paintings, and spiritual artifacts',
      image: 'https://picsum.photos/300/200?random=12',
      highlights: ['Sacred texts', 'Religious paintings', 'Ritual objects']
    },
    {
      id: 4,
      title: 'Modern Interpretations',
      description: 'Contemporary art and digital presentations of Krishna\'s teachings',
      image: 'https://picsum.photos/300/200?random=13',
      highlights: ['Digital exhibits', 'Contemporary art', 'Educational displays']
    }
  ];

  const museumInfo = {
    timings: '9:00 AM - 6:00 PM',
    entryFee: '₹50 for adults, ₹25 for children',
    location: 'Near Brahma Sarovar, Kurukshetra',
    contact: '+91-1744-XXXXXX'
  };

  const renderMuseumSection = (section: any) => (
    <View key={section.id} style={styles.sectionCard}>
      <Image source={{ uri: section.image }} style={styles.sectionImage} />
      <View style={styles.sectionContent}>
        <H3 style={styles.sectionTitle} color={COLORS.text.primary} weight='bold' size='lg'>
          {section.title}
        </H3>
        <BodyText style={styles.sectionDescription} color={COLORS.text.primary} size='md'>
          {section.description}
        </BodyText>
        <View style={styles.highlightsContainer}>
          {section.highlights.map((highlight: string, index: number) => (
            <View key={index} style={styles.highlightItem}>
              <Ionicons name="checkmark-circle" size={16} color={COLORS.success} />
              <BodyText style={styles.highlightText} color={COLORS.text.primary} size='sm'>
                {highlight}
              </BodyText>
            </View>
          ))}
        </View>
      </View>
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
          Sri Krishna Museum
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
            source={{ uri: 'https://picsum.photos/400/250?random=9' }} 
            style={styles.heroImage}
          />
          <View style={styles.heroOverlay}>
            <H2 style={styles.heroTitle} color={COLORS.white} weight='bold' size='2xl'>
              Sri Krishna Museum
            </H2>
            <BodyText style={styles.heroSubtitle} color={COLORS.white} size='md'>
              Preserving the Legacy of Lord Krishna and Mahabharata
            </BodyText>
          </View>
        </View>

        {/* Museum Description */}
        <View style={styles.descriptionSection}>
          <H3 style={styles.sectionTitle} color={COLORS.text.primary} weight='bold' size='lg'>
            About the Museum
          </H3>
          <BodyText style={styles.description} color={COLORS.text.primary} size='md'>
            The Sri Krishna Museum is a treasure trove of artifacts, sculptures, and exhibits that bring to life the rich cultural and spiritual heritage of Kurukshetra. Established to preserve and showcase the legacy of Lord Krishna and the epic Mahabharata, the museum offers visitors an immersive journey through ancient history and mythology.
          </BodyText>
        </View>

        {/* Museum Sections */}
        <View style={styles.sectionsContainer}>
          <H3 style={styles.sectionsTitle} color={COLORS.text.primary} weight='bold' size='lg'>
            Museum Galleries
          </H3>
          {museumSections.map(renderMuseumSection)}
        </View>

        {/* Museum Information */}
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
                {museumInfo.timings}
              </BodyText>
            </View>
            
            <View style={styles.infoItem}>
              <Ionicons name="card-outline" size={20} color={COLORS.primary} />
              <BodyText style={styles.infoLabel} color={COLORS.text.primary} size='md' weight='semiBold'>
                Entry Fee:
              </BodyText>
              <BodyText style={styles.infoValue} color={COLORS.text.primary} size='md'>
                {museumInfo.entryFee}
              </BodyText>
            </View>
            
            <View style={styles.infoItem}>
              <Ionicons name="location-outline" size={20} color={COLORS.primary} />
              <BodyText style={styles.infoLabel} color={COLORS.text.primary} size='md' weight='semiBold'>
                Location:
              </BodyText>
              <BodyText style={styles.infoValue} color={COLORS.text.primary} size='md'>
                {museumInfo.location}
              </BodyText>
            </View>
            
            <View style={styles.infoItem}>
              <Ionicons name="call-outline" size={20} color={COLORS.primary} />
              <BodyText style={styles.infoLabel} color={COLORS.text.primary} size='md' weight='semiBold'>
                Contact:
              </BodyText>
              <BodyText style={styles.infoValue} color={COLORS.text.primary} size='md'>
                {museumInfo.contact}
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
            <Ionicons name="call-outline" size={20} color={COLORS.primary} />
            <BodyText style={styles.secondaryButtonText} color={COLORS.primary} size='md' weight='semiBold'>
              Contact Museum
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
  descriptionSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontFamily: FONTS.gilroy.bold,
    fontSize: FONT_SIZES.lg,
    marginBottom: 12,
  },
  description: {
    fontFamily: FONTS.gilroy.regular,
    fontSize: FONT_SIZES.md,
    lineHeight: 24,
  },
  sectionsContainer: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionsTitle: {
    fontFamily: FONTS.gilroy.bold,
    fontSize: FONT_SIZES.lg,
    marginBottom: 16,
  },
  sectionCard: {
    backgroundColor: COLORS.background.primary,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: COLORS.text.primary,
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
  sectionImage: {
    width: '100%',
    height: 150,
  },
  sectionContent: {
    padding: 16,
  },
  sectionDescription: {
    fontFamily: FONTS.gilroy.regular,
    fontSize: FONT_SIZES.md,
    lineHeight: 22,
    marginBottom: 12,
  },
  highlightsContainer: {
    marginTop: 8,
  },
  highlightItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  highlightText: {
    fontFamily: FONTS.gilroy.regular,
    fontSize: FONT_SIZES.sm,
    marginLeft: 8,
    flex: 1,
    lineHeight: 20,
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

export default SriKrishnaMuseumScreen;
