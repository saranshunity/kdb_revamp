import React from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { H1, H2, H3, BodyText } from '../../components/Text';
import { COLORS } from '../../constants/colors';
import { FONTS, FONT_SIZES } from '../../constants/fonts';
import Ionicons from 'react-native-vector-icons/Ionicons';

type TirthMitraReviewScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'TirthMitraReview'>;
type TirthMitraReviewScreenRouteProp = RouteProp<RootStackParamList, 'TirthMitraReview'>;

const TirthMitraReviewScreen = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<TirthMitraReviewScreenNavigationProp>();
  const route = useRoute<TirthMitraReviewScreenRouteProp>();
  const { applicationData } = route.params;

  const handleContinue = () => {
    // Navigate to status screen
    navigation.replace('TirthMitraStatus', {
      applicationId: applicationData.applicationId,
      applicationData: applicationData,
      status: 'pending',
    });
  };

  const renderDetailRow = (label: string, value: string) => (
    <View style={styles.detailRow}>
      <BodyText color={COLORS.text.secondary} size='sm' weight='medium' style={styles.detailLabel}>
        {label}
      </BodyText>
      <BodyText color={COLORS.text.primary} size='sm' weight='semiBold' style={styles.detailValue}>
        {value}
      </BodyText>
    </View>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle='dark-content' backgroundColor={COLORS.background.primary} />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <H1 style={styles.headerTitle} color={COLORS.text.primary} weight='bold' size='md'>
            Application Submitted
          </H1>
        </View>
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Success Icon */}
        <View style={styles.successContainer}>
          <View style={styles.successIconContainer}>
            <Ionicons name="checkmark-circle" size={80} color={COLORS.success} />
          </View>
          <H2 color={COLORS.success} weight='semiBold' size='lg' style={styles.successTitle}>
            Application Submitted Successfully!
          </H2>
          <BodyText color={COLORS.text.secondary} size='sm' style={styles.successMessage}>
            Your Tirth Mitra application has been submitted for review. Below are the details of your application.
          </BodyText>
        </View>

        {/* Application ID Card */}
        <View style={styles.applicationIdCard}>
          <BodyText color={COLORS.text.secondary} size='sm' weight='medium'>
            Application ID
          </BodyText>
          <H3 color={COLORS.primary} weight='bold' size='lg' style={styles.applicationId}>
            {applicationData.applicationId}
          </H3>
          <BodyText color={COLORS.text.tertiary} size='xs'>
            Save this ID for future reference
          </BodyText>
        </View>

        {/* Personal Information */}
        <View style={styles.section}>
          <H3 color={COLORS.text.primary} weight='semiBold' size='md' style={styles.sectionTitle}>
            Personal Information
          </H3>
          <View style={styles.sectionContent}>
            {applicationData.photoUri && (
              <View style={styles.photoContainer}>
                <Image source={{ uri: applicationData.photoUri }} style={styles.photo} />
              </View>
            )}
            {renderDetailRow('Full Name', applicationData.fullName)}
            {applicationData.fatherName && renderDetailRow("Father's/Husband's Name", applicationData.fatherName)}
            {renderDetailRow('Date of Birth', applicationData.dateOfBirth)}
            {renderDetailRow('Gender', applicationData.gender)}
          </View>
        </View>

        {/* Contact Information */}
        <View style={styles.section}>
          <H3 color={COLORS.text.primary} weight='semiBold' size='md' style={styles.sectionTitle}>
            Contact Information
          </H3>
          <View style={styles.sectionContent}>
            {renderDetailRow('Phone Number', applicationData.phone)}
            {renderDetailRow('Email Address', applicationData.email)}
          </View>
        </View>

        {/* Address Information */}
        <View style={styles.section}>
          <H3 color={COLORS.text.primary} weight='semiBold' size='md' style={styles.sectionTitle}>
            Address Information
          </H3>
          <View style={styles.sectionContent}>
            {renderDetailRow('Address', applicationData.address)}
            {renderDetailRow('City', applicationData.city)}
            {renderDetailRow('State', applicationData.state)}
            {renderDetailRow('Pincode', applicationData.pincode)}
          </View>
        </View>

        {/* Pilgrimage Information */}
        {applicationData.selectedDistrict && applicationData.selectedTirthName && (
          <View style={styles.section}>
            <H3 color={COLORS.text.primary} weight='semiBold' size='md' style={styles.sectionTitle}>
              Pilgrimage Information
            </H3>
            <View style={styles.sectionContent}>
              {renderDetailRow('District', applicationData.selectedDistrict)}
              {renderDetailRow('Tirth', applicationData.selectedTirthName)}
            </View>
          </View>
        )}

        {/* Documents Uploaded */}
        <View style={styles.section}>
          <H3 color={COLORS.text.primary} weight='semiBold' size='md' style={styles.sectionTitle}>
            Documents Uploaded
          </H3>
          <View style={styles.sectionContent}>
            <View style={styles.documentRow}>
              <Ionicons name="document-text" size={20} color={COLORS.success} />
              <BodyText color={COLORS.text.primary} size='sm' style={styles.documentText}>
                ID Card/Document
              </BodyText>
              <Ionicons name="checkmark-circle" size={20} color={COLORS.success} />
            </View>
            {applicationData.photoUri && (
              <View style={styles.documentRow}>
                <Ionicons name="image" size={20} color={COLORS.success} />
                <BodyText color={COLORS.text.primary} size='sm' style={styles.documentText}>
                  Photo
                </BodyText>
                <Ionicons name="checkmark-circle" size={20} color={COLORS.success} />
              </View>
            )}
          </View>
        </View>

        {/* Info Message */}
        <View style={styles.infoCard}>
          <View style={styles.infoHeader}>
            <Ionicons name="information-circle" size={24} color={COLORS.primary} />
            <H3 color={COLORS.primary} weight='semiBold' size='sm' style={styles.infoTitle}>
              What's Next?
            </H3>
          </View>
          <BodyText color={COLORS.text.secondary} size='sm' style={styles.infoText}>
            • Your application will be reviewed by our team within 2-3 business days.{'\n'}
            • You will receive a notification once the review is complete.{'\n'}
            • You can check your application status anytime using your Application ID.{'\n'}
            • Keep your phone number active for important updates.
          </BodyText>
        </View>

        {/* Continue Button */}
        <TouchableOpacity
          style={styles.continueButton}
          onPress={handleContinue}
          activeOpacity={0.8}
        >
          <BodyText color={COLORS.white} size='md' weight='semiBold'>
            Continue to Status
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
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: COLORS.background.primary,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border.light,
  },
  headerContent: {
    alignItems: 'center',
  },
  headerTitle: {
    fontFamily: FONTS.gilroy.bold,
    fontSize: FONT_SIZES.md,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 20,
  },
  successContainer: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 32,
    backgroundColor: COLORS.background.secondary,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border.light,
  },
  successIconContainer: {
    marginBottom: 16,
  },
  successTitle: {
    marginBottom: 8,
    textAlign: 'center',
  },
  successMessage: {
    textAlign: 'center',
    lineHeight: 20,
  },
  applicationIdCard: {
    backgroundColor: COLORS.primary + '10',
    borderRadius: 12,
    padding: 20,
    marginHorizontal: 20,
    marginTop: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.primary + '30',
  },
  applicationId: {
    marginVertical: 8,
    letterSpacing: 1,
  },
  section: {
    marginTop: 20,
    marginHorizontal: 20,
  },
  sectionTitle: {
    marginBottom: 12,
  },
  sectionContent: {
    backgroundColor: COLORS.background.secondary,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border.light,
  },
  photoContainer: {
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border.light,
  },
  photo: {
    width: 120,
    height: 140,
    borderRadius: 8,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border.light,
  },
  detailLabel: {
    flex: 1,
  },
  detailValue: {
    flex: 1,
    textAlign: 'right',
  },
  documentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border.light,
  },
  documentText: {
    flex: 1,
    marginLeft: 12,
  },
  infoCard: {
    backgroundColor: COLORS.background.secondary,
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 20,
    marginTop: 20,
    borderWidth: 1,
    borderColor: COLORS.primary + '30',
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoTitle: {
    marginLeft: 8,
  },
  infoText: {
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
  bottomSpacing: {
    height: 20,
  },
});

export default TirthMitraReviewScreen;

