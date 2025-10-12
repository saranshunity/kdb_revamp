import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { H1, H2, H3, BodyText } from '../../components/Text';
import { COLORS } from '../../constants/colors';
import { FONTS, FONT_SIZES } from '../../constants/fonts';
import Ionicons from 'react-native-vector-icons/Ionicons';
import CheckBox from '@react-native-community/checkbox';

interface ProfileScreenProps {
  navigation: any;
}

const ProfileScreen: React.FC<ProfileScreenProps> = ({ navigation }) => {
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const insets = useSafeAreaInsets();

  const handleContinue = () => {
    navigation.navigate('TirthMitraGenerator');
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background.primary} />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <H2 style={styles.headerTitle} color={COLORS.text.primary} weight="bold" size="lg">
            Tirth Mitra Card
          </H2>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollView}>
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <View style={styles.iconContainer}>
            <Ionicons name="card" size={60} color={COLORS.background.appColor} />
          </View>
          <H1 style={styles.heroTitle} color={COLORS.text.primary} weight="bold" size="xl">
            Welcome to Tirth Mitra
          </H1>
          <BodyText style={styles.heroSubtitle} color={COLORS.text.secondary} size="md">
            Your Official Pilgrimage Companion Card
          </BodyText>
        </View>

        {/* About Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="information-circle" size={24} color={COLORS.background.appColor} />
            <H3 style={styles.sectionTitle} color={COLORS.text.primary} weight="bold" size="md">
              What is Tirth Mitra Card?
            </H3>
          </View>
          <BodyText style={styles.sectionText} color={COLORS.text.secondary} size="sm">
            Tirth Mitra Card is an official identification card for pilgrims visiting the 48 Kos
            Parikrama of Kurukshetra. This card helps authorities identify genuine pilgrims and
            provides access to special facilities and services during your pilgrimage.
          </BodyText>
        </View>

        {/* Validity Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="calendar" size={24} color={COLORS.background.appColor} />
            <H3 style={styles.sectionTitle} color={COLORS.text.primary} weight="bold" size="md">
              Card Validity
            </H3>
          </View>
          <BodyText style={styles.sectionText} color={COLORS.text.secondary} size="sm">
            • Valid for 1 year from date of issue{'\n'}
            • Can be renewed annually{'\n'}
            • Valid across all 182 tirthas in Kurukshetra region{'\n'}
            • Digital card accepted at all locations
          </BodyText>
        </View>

        {/* Authority Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="shield-checkmark" size={24} color={COLORS.background.appColor} />
            <H3 style={styles.sectionTitle} color={COLORS.text.primary} weight="bold" size="md">
              Issued Authority
            </H3>
          </View>
          <BodyText style={styles.sectionText} color={COLORS.text.secondary} size="sm">
            This card is issued by the Kurukshetra Development Board (KDB) under the Government
            of Haryana. The card serves as an official document for pilgrims and is recognized
            by all temple authorities and local administration.
          </BodyText>
        </View>

        {/* Benefits Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="gift" size={24} color={COLORS.background.appColor} />
            <H3 style={styles.sectionTitle} color={COLORS.text.primary} weight="bold" size="md">
              Benefits & Facilities
            </H3>
          </View>
          <BodyText style={styles.sectionText} color={COLORS.text.secondary} size="sm">
            • Priority darshan at selected temples{'\n'}
            • Access to special parking facilities{'\n'}
            • Discounts at authorized accommodations{'\n'}
            • Emergency assistance during pilgrimage{'\n'}
            • Free entry to certain cultural events{'\n'}
            • Digital guide and navigation support
          </BodyText>
        </View>

        {/* Instructions Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="list" size={24} color={COLORS.background.appColor} />
            <H3 style={styles.sectionTitle} color={COLORS.text.primary} weight="bold" size="md">
              Instructions
            </H3>
          </View>
          <BodyText style={styles.sectionText} color={COLORS.text.secondary} size="sm">
            1. Fill accurate personal information{'\n'}
            2. Upload a clear passport-size photograph{'\n'}
            3. Provide valid contact details{'\n'}
            4. Review all information before submission{'\n'}
            5. Download and save your digital card{'\n'}
            6. Keep both digital and printed copy during pilgrimage{'\n'}
            7. Present card when requested by authorities
          </BodyText>
        </View>

        {/* Important Notes */}
        <View style={[styles.section, styles.warningSection]}>
          <View style={styles.sectionHeader}>
            <Ionicons name="alert-circle" size={24} color={COLORS.warning} />
            <H3 style={styles.sectionTitle} color={COLORS.warning} weight="bold" size="md">
              Important Notes
            </H3>
          </View>
          <BodyText style={styles.sectionText} color={COLORS.text.secondary} size="sm">
            • Card is non-transferable{'\n'}
            • Misuse may lead to cancellation{'\n'}
            • Report loss immediately{'\n'}
            • Carry valid government ID along with card{'\n'}
            • Follow temple rules and regulations
          </BodyText>
        </View>

        {/* Agreement Checkbox */}
        <View style={styles.agreementContainer}>
          <CheckBox
            value={agreedToTerms}
            onValueChange={setAgreedToTerms}
            tintColors={{ true: COLORS.background.appColor, false: COLORS.border.dark }}
            style={styles.checkbox}
          />
          <TouchableOpacity
            style={styles.agreementTextContainer}
            onPress={() => setAgreedToTerms(!agreedToTerms)}
            activeOpacity={0.7}
          >
            <BodyText style={styles.agreementText} color={COLORS.text.primary} size="sm">
              I have read and understood all the terms, conditions, and instructions mentioned
              above. I agree to comply with all rules and regulations during my pilgrimage.
            </BodyText>
          </TouchableOpacity>
        </View>

        {/* Continue Button */}
        <TouchableOpacity
          style={[
            styles.continueButton,
            !agreedToTerms && styles.continueButtonDisabled,
          ]}
          onPress={handleContinue}
          disabled={!agreedToTerms}
          activeOpacity={0.8}
        >
          <BodyText
            style={styles.continueButtonText}
            color={COLORS.white}
            size="md"
            weight="bold"
          >
            Continue to Generate Card
          </BodyText>
          <Ionicons name="arrow-forward" size={20} color={COLORS.white} />
        </TouchableOpacity>

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
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: COLORS.background.primary,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border.light,
  },
  headerContent: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontFamily: FONTS.gilroy.bold,
    fontSize: FONT_SIZES.lg,
  },
  scrollView: {
    flex: 1,
  },
  heroSection: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 20,
    backgroundColor: COLORS.background.secondary,
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.background.appColor + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  heroTitle: {
    fontFamily: FONTS.gilroy.bold,
    fontSize: FONT_SIZES.xl,
    textAlign: 'center',
    marginBottom: 8,
  },
  heroSubtitle: {
    fontFamily: FONTS.gilroy.medium,
    fontSize: FONT_SIZES.md,
    textAlign: 'center',
  },
  section: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border.light,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  sectionTitle: {
    fontFamily: FONTS.gilroy.bold,
    fontSize: FONT_SIZES.md,
  },
  sectionText: {
    fontFamily: FONTS.gilroy.regular,
    fontSize: FONT_SIZES.sm,
    lineHeight: 22,
  },
  warningSection: {
    backgroundColor: COLORS.warning + '10',
  },
  agreementContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: COLORS.background.secondary,
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 12,
    gap: 12,
  },
  checkbox: {
    marginTop: 2,
  },
  agreementTextContainer: {
    flex: 1,
  },
  agreementText: {
    fontFamily: FONTS.gilroy.regular,
    fontSize: FONT_SIZES.sm,
    lineHeight: 20,
  },
  continueButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.background.appColor,
    marginHorizontal: 20,
    marginTop: 24,
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  continueButtonDisabled: {
    backgroundColor: COLORS.text.tertiary,
    opacity: 0.5,
  },
  continueButtonText: {
    fontFamily: FONTS.gilroy.bold,
    fontSize: FONT_SIZES.md,
  },
  bottomSpacing: {
    height: 20,
  },
});

export default ProfileScreen;
