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

type AboutKDBScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'AboutKDB'>;

interface AboutKDBScreenProps {
  navigation: AboutKDBScreenNavigationProp;
}

const AboutKDBScreen: React.FC<AboutKDBScreenProps> = ({ navigation }) => {
  const insets = useSafeAreaInsets();

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
          About KDB
        </H2>
        <View style={styles.headerRight} />
      </View>

      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Logo Section */}
        <View style={styles.logoSection}>
          <Image 
            source={require('../../assets/images/appLogo.png')} 
            style={styles.logo}
            resizeMode="contain"
          />
          <H2 style={styles.appName} color={COLORS.primary} weight='bold' size='2xl'>
            KDB App
          </H2>
          <BodyText style={styles.version} color={COLORS.text.secondary} size='sm'>
            Version 1.0.0
          </BodyText>
        </View>

        {/* About Content */}
        <View style={styles.contentSection}>
          <H3 style={styles.sectionTitle} color={COLORS.text.primary} weight='bold' size='lg'>
            About Kurukshetra Development Board
          </H3>
          
          <BodyText style={styles.description} color={COLORS.text.primary} size='md'>
            The Kurukshetra Development Board (KDB) is a government organization dedicated to the development and promotion of Kurukshetra as a major pilgrimage and tourist destination. Established with the vision to preserve and showcase the rich cultural heritage and spiritual significance of this ancient city.
          </BodyText>

          <H3 style={styles.sectionTitle} color={COLORS.text.primary} weight='bold' size='lg'>
            Our Mission
          </H3>
          
          <BodyText style={styles.description} color={COLORS.text.primary} size='md'>
            To develop Kurukshetra as a world-class pilgrimage destination while preserving its ancient heritage, promoting religious tourism, and providing modern amenities for pilgrims and visitors from around the world.
          </BodyText>

          <H3 style={styles.sectionTitle} color={COLORS.text.primary} weight='bold' size='lg'>
            Key Initiatives
          </H3>
          
          <View style={styles.initiativesList}>
            <View style={styles.initiativeItem}>
              <Ionicons name="checkmark-circle" size={20} color={COLORS.success} />
              <BodyText style={styles.initiativeText} color={COLORS.text.primary} size='md'>
                Development of 48 Kos Parikrama circuit
              </BodyText>
            </View>
            <View style={styles.initiativeItem}>
              <Ionicons name="checkmark-circle" size={20} color={COLORS.success} />
              <BodyText style={styles.initiativeText} color={COLORS.text.primary} size='md'>
                Modernization of pilgrimage facilities
              </BodyText>
            </View>
            <View style={styles.initiativeItem}>
              <Ionicons name="checkmark-circle" size={20} color={COLORS.success} />
              <BodyText style={styles.initiativeText} color={COLORS.text.primary} size='md'>
                Cultural heritage preservation
              </BodyText>
            </View>
            <View style={styles.initiativeItem}>
              <Ionicons name="checkmark-circle" size={20} color={COLORS.success} />
              <BodyText style={styles.initiativeText} color={COLORS.text.primary} size='md'>
                Tourist information and guidance services
              </BodyText>
            </View>
            <View style={styles.initiativeItem}>
              <Ionicons name="checkmark-circle" size={20} color={COLORS.success} />
              <BodyText style={styles.initiativeText} color={COLORS.text.primary} size='md'>
                Digital initiatives for enhanced visitor experience
              </BodyText>
            </View>
          </View>

          <H3 style={styles.sectionTitle} color={COLORS.text.primary} weight='bold' size='lg'>
            Contact Information
          </H3>
          
          <View style={styles.contactInfo}>
            <View style={styles.contactItem}>
              <Ionicons name="location-outline" size={20} color={COLORS.primary} />
              <BodyText style={styles.contactText} color={COLORS.text.primary} size='md'>
                Kurukshetra Development Board, Haryana
              </BodyText>
            </View>
            <View style={styles.contactItem}>
              <Ionicons name="call-outline" size={20} color={COLORS.primary} />
              <BodyText style={styles.contactText} color={COLORS.text.primary} size='md'>
                +91-1744-XXXXXX
              </BodyText>
            </View>
            <View style={styles.contactItem}>
              <Ionicons name="mail-outline" size={20} color={COLORS.primary} />
              <BodyText style={styles.contactText} color={COLORS.text.primary} size='md'>
                info@kdb.gov.in
              </BodyText>
            </View>
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
  logoSection: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 20,
  },
  logo: {
    width: 80,
    height: 80,
    marginBottom: 16,
  },
  appName: {
    fontFamily: FONTS.gilroy.bold,
    fontSize: FONT_SIZES['2xl'],
    marginBottom: 8,
  },
  version: {
    fontFamily: FONTS.gilroy.regular,
    fontSize: FONT_SIZES.sm,
  },
  contentSection: {
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontFamily: FONTS.gilroy.bold,
    fontSize: FONT_SIZES.lg,
    marginTop: 24,
    marginBottom: 12,
  },
  description: {
    fontFamily: FONTS.gilroy.regular,
    fontSize: FONT_SIZES.md,
    lineHeight: 24,
    marginBottom: 16,
  },
  initiativesList: {
    marginBottom: 16,
  },
  initiativeItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  initiativeText: {
    fontFamily: FONTS.gilroy.regular,
    fontSize: FONT_SIZES.md,
    marginLeft: 12,
    flex: 1,
    lineHeight: 22,
  },
  contactInfo: {
    marginBottom: 32,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  contactText: {
    fontFamily: FONTS.gilroy.regular,
    fontSize: FONT_SIZES.md,
    marginLeft: 12,
  },
});

export default AboutKDBScreen;
