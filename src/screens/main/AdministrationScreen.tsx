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
import { H2, H3, BodyText } from '../../components/Text';
import { COLORS } from '../../constants/colors';
import { FONTS, FONT_SIZES } from '../../constants/fonts';
import Ionicons from "react-native-vector-icons/Ionicons";

type AdministrationScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Administration'>;

interface AdministrationScreenProps {
  navigation: AdministrationScreenNavigationProp;
}

const AdministrationScreen: React.FC<AdministrationScreenProps> = ({ navigation }) => {
  const insets = useSafeAreaInsets();

  const officials = [
    {
      id: 1,
      name: 'Shri Rajesh Kumar',
      position: 'Chairman',
      image: 'https://picsum.photos/150/150?random=1',
      description: 'Leading the Kurukshetra Development Board with over 25 years of experience in public administration and heritage conservation.',
      achievements: [
        'Spearheaded major infrastructure development projects',
        'Established digital initiatives for pilgrim convenience',
        'Promoted cultural heritage preservation programs'
      ]
    },
    {
      id: 2,
      name: 'Dr. Priya Sharma',
      position: 'Vice Chairman',
      image: 'https://picsum.photos/150/150?random=2',
      description: 'A distinguished scholar in ancient Indian history and culture, dedicated to preserving the spiritual essence of Kurukshetra.',
      achievements: [
        'Expert in Vedic literature and ancient texts',
        'Led research initiatives on historical sites',
        'Developed educational programs for visitors'
      ]
    },
    {
      id: 3,
      name: 'Shri Amit Singh',
      position: 'Executive Director',
      image: 'https://picsum.photos/150/150?random=3',
      description: 'Overseeing day-to-day operations and ensuring smooth functioning of all development activities and pilgrim services.',
      achievements: [
        'Streamlined administrative processes',
        'Implemented modern management practices',
        'Enhanced visitor experience through technology'
      ]
    },
    {
      id: 4,
      name: 'Dr. Sunita Verma',
      position: 'Cultural Affairs Director',
      image: 'https://picsum.photos/150/150?random=4',
      description: 'Managing cultural programs, festivals, and events that showcase the rich heritage of Kurukshetra throughout the year.',
      achievements: [
        'Organized major cultural festivals',
        'Established cultural exchange programs',
        'Promoted local artisans and crafts'
      ]
    }
  ];

  const renderOfficial = (official: any) => (
    <View key={official.id} style={styles.officialCard}>
      <View style={styles.officialHeader}>
        <Image source={{ uri: official.image }} style={styles.officialImage} />
        <View style={styles.officialInfo}>
          <H3 style={styles.officialName} color={COLORS.text.primary} weight='bold' size='lg'>
            {official.name}
          </H3>
          <BodyText style={styles.officialPosition} color={COLORS.primary} size='md' weight='semiBold'>
            {official.position}
          </BodyText>
        </View>
      </View>
      
      <BodyText style={styles.officialDescription} color={COLORS.text.primary} size='md'>
        {official.description}
      </BodyText>
      
      <View style={styles.achievementsContainer}>
        <H3 style={styles.achievementsTitle} color={COLORS.text.primary} weight='bold' size='md'>
          Key Achievements:
        </H3>
        {official.achievements.map((achievement: string, index: number) => (
          <View key={index} style={styles.achievementItem}>
            <Ionicons name="checkmark-circle" size={16} color={COLORS.success} />
            <BodyText style={styles.achievementText} color={COLORS.text.primary} size='sm'>
              {achievement}
            </BodyText>
          </View>
        ))}
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
          Administration
        </H2>
        <View style={styles.headerRight} />
      </View>

      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Introduction */}
        <View style={styles.introSection}>
          <H2 style={styles.introTitle} color={COLORS.primary} weight='bold' size='xl'>
            Meet Our Leadership Team
          </H2>
          <BodyText style={styles.introDescription} color={COLORS.text.primary} size='md'>
            The Kurukshetra Development Board is led by a team of dedicated professionals who bring together expertise in administration, culture, heritage conservation, and public service to ensure the continued development and preservation of this sacred land.
          </BodyText>
        </View>

        {/* Officials List */}
        <View style={styles.officialsContainer}>
          {officials.map(renderOfficial)}
        </View>

        {/* Board Information */}
        <View style={styles.boardInfoSection}>
          <H3 style={styles.boardTitle} color={COLORS.text.primary} weight='bold' size='lg'>
            Board Information
          </H3>
          <View style={styles.boardInfoItem}>
            <Ionicons name="calendar-outline" size={20} color={COLORS.primary} />
            <BodyText style={styles.boardInfoText} color={COLORS.text.primary} size='md'>
              Established: 1985
            </BodyText>
          </View>
          <View style={styles.boardInfoItem}>
            <Ionicons name="people-outline" size={20} color={COLORS.primary} />
            <BodyText style={styles.boardInfoText} color={COLORS.text.primary} size='md'>
              Board Members: 12
            </BodyText>
          </View>
          <View style={styles.boardInfoItem}>
            <Ionicons name="location-outline" size={20} color={COLORS.primary} />
            <BodyText style={styles.boardInfoText} color={COLORS.text.primary} size='md'>
              Headquarters: Kurukshetra, Haryana
            </BodyText>
          </View>
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
  introSection: {
    paddingHorizontal: 20,
    paddingVertical: 24,
    backgroundColor: COLORS.background.tertiary,
    marginBottom: 20,
  },
  introTitle: {
    fontFamily: FONTS.gilroy.bold,
    fontSize: FONT_SIZES.xl,
    marginBottom: 12,
  },
  introDescription: {
    fontFamily: FONTS.gilroy.regular,
    fontSize: FONT_SIZES.md,
    lineHeight: 24,
  },
  officialsContainer: {
    paddingHorizontal: 20,
  },
  officialCard: {
    backgroundColor: COLORS.background.primary,
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
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
  },
  officialHeader: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  officialImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 16,
  },
  officialInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  officialName: {
    fontFamily: FONTS.gilroy.bold,
    fontSize: FONT_SIZES.lg,
    marginBottom: 4,
  },
  officialPosition: {
    fontFamily: FONTS.gilroy.semiBold,
    fontSize: FONT_SIZES.md,
  },
  officialDescription: {
    fontFamily: FONTS.gilroy.regular,
    fontSize: FONT_SIZES.md,
    lineHeight: 22,
    marginBottom: 16,
  },
  achievementsContainer: {
    marginTop: 8,
  },
  achievementsTitle: {
    fontFamily: FONTS.gilroy.bold,
    fontSize: FONT_SIZES.md,
    marginBottom: 8,
  },
  achievementItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  achievementText: {
    fontFamily: FONTS.gilroy.regular,
    fontSize: FONT_SIZES.sm,
    marginLeft: 8,
    flex: 1,
    lineHeight: 20,
  },
  boardInfoSection: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: COLORS.background.tertiary,
    marginTop: 20,
  },
  boardTitle: {
    fontFamily: FONTS.gilroy.bold,
    fontSize: FONT_SIZES.lg,
    marginBottom: 16,
  },
  boardInfoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  boardInfoText: {
    fontFamily: FONTS.gilroy.regular,
    fontSize: FONT_SIZES.md,
    marginLeft: 12,
  },
});

export default AdministrationScreen;
