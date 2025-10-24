import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { H1, H2, H3, BodyText, ButtonTextPrimary } from '../../components/Text';
import { COLORS } from '../../constants/colors';
import { FONTS, FONT_SIZES } from '../../constants/fonts';
import Ionicons from 'react-native-vector-icons/Ionicons';
import TextInput from '../../components/TextInput';
import FileUpload from '../../components/FileUpload';

type StallApplicationScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'StallApplication'>;
type StallApplicationScreenRouteProp = RouteProp<RootStackParamList, 'StallApplication'>;

interface ApplicationFormData {
  email: string;
  firmName: string;
  ownerName: string;
  fatherName: string;
  aadharNumber: string;
  correspondenceAddress: string;
  district: string;
  pinCode: string;
  state: string;
  mobileNumber: string;
  alternateMobileNumber: string;
  typeOfWork: string;
  awardAchievement: string;
  otherRemarks: string;
  aadharCardFile?: string;
  registrationCertificateFile?: string;
}

const StallApplicationScreen = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<StallApplicationScreenNavigationProp>();
  const route = useRoute<StallApplicationScreenRouteProp>();
  const { category } = route.params;

  const [formData, setFormData] = useState<ApplicationFormData>({
    email: '',
    firmName: '',
    ownerName: '',
    fatherName: '',
    aadharNumber: '',
    correspondenceAddress: '',
    district: '',
    pinCode: '',
    state: '',
    mobileNumber: '',
    alternateMobileNumber: '',
    typeOfWork: '',
    awardAchievement: '',
    otherRemarks: '',
  });

  const [errors, setErrors] = useState<Partial<ApplicationFormData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: Partial<ApplicationFormData> = {};

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.firmName.trim()) {
      newErrors.firmName = 'Name of Firm/NGO/Organisation is required';
    }

    if (!formData.ownerName.trim()) {
      newErrors.ownerName = 'Name of Owner/Proprietor/Representative is required';
    }

    if (!formData.fatherName.trim()) {
      newErrors.fatherName = 'Father\'s Name is required';
    }

    if (!formData.aadharNumber.trim()) {
      newErrors.aadharNumber = 'Aadhar Number is required';
    } else if (!/^\d{12}$/.test(formData.aadharNumber)) {
      newErrors.aadharNumber = 'Please enter a valid 12-digit Aadhar number';
    }

    if (!formData.correspondenceAddress.trim()) {
      newErrors.correspondenceAddress = 'Correspondence Address is required';
    }

    if (!formData.district.trim()) {
      newErrors.district = 'District is required';
    }

    if (!formData.pinCode.trim()) {
      newErrors.pinCode = 'Pin Code is required';
    } else if (!/^\d{6}$/.test(formData.pinCode)) {
      newErrors.pinCode = 'Please enter a valid 6-digit pin code';
    }

    if (!formData.state.trim()) {
      newErrors.state = 'State is required';
    }

    if (!formData.mobileNumber.trim()) {
      newErrors.mobileNumber = 'Mobile Number is required';
    } else if (!/^[6-9]\d{9}$/.test(formData.mobileNumber)) {
      newErrors.mobileNumber = 'Please enter a valid 10-digit mobile number';
    }

    if (formData.alternateMobileNumber.trim() && !/^[6-9]\d{9}$/.test(formData.alternateMobileNumber)) {
      newErrors.alternateMobileNumber = 'Please enter a valid 10-digit alternate mobile number';
    }

    if (!formData.typeOfWork.trim()) {
      newErrors.typeOfWork = 'Type of Work/Purpose is required';
    }

    if (!formData.awardAchievement.trim()) {
      newErrors.awardAchievement = 'Award/Achievement/Experience is required';
    }

    if (!formData.aadharCardFile?.trim()) {
      newErrors.aadharCardFile = 'Aadhar Card upload is required';
    }

    if (!formData.registrationCertificateFile?.trim()) {
      newErrors.registrationCertificateFile = 'Certificate of Registration upload is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof ApplicationFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      Alert.alert('Validation Error', 'Please fill all required fields correctly.');
      return;
    }

    setIsSubmitting(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Generate application ID
      const applicationId = `APP${Date.now()}`;

      // Navigate to waiting screen
      navigation.navigate('StallApplicationStatus', {
        applicationId,
        category,
        formData,
        status: 'pending',
      });

    } catch (error) {
      console.error('Error submitting application:', error);
      Alert.alert('Error', 'Failed to submit application. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
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
          <H1 style={styles.headerTitle} color={COLORS.text.primary} weight='bold' size='md'>
            Apply for Stall
          </H1>
        </View>
        <View style={styles.placeholder} />
      </View>

      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          {/* Category Info */}
          <View style={styles.categoryInfo}>
            <View style={[styles.categoryIconContainer, { backgroundColor: category.color + '20' }]}>
              <Ionicons name={category.icon} size={24} color={category.color} />
            </View>
            <View style={styles.categoryDetails}>
              <H3 color={COLORS.text.primary} weight='semiBold' size='md'>
                {category.name}
              </H3>
              <BodyText color={COLORS.text.secondary} size='sm'>
                {category.description}
              </BodyText>
            </View>
          </View>

          {/* Category-specific requirements */}
          <View style={styles.requirementsSection}>
            <H3 color={COLORS.text.primary} weight='semiBold' size='sm' style={styles.requirementsTitle}>
              Requirements for this category:
            </H3>
            <View style={styles.requirementsList}>
              {category.id === '1' && (
                <>
                  <BodyText color={COLORS.text.secondary} size='xs' style={styles.requirementItem}>
                  • Valid registration certificate of the organization
                  </BodyText>
                  <BodyText color={COLORS.text.secondary} size='xs' style={styles.requirementItem}>
                  • NGO/Social organization registration number
                  </BodyText>
                  <BodyText color={COLORS.text.secondary} size='xs' style={styles.requirementItem}>
                  • Proof of social work activities
                  </BodyText>
                </>
              )}
              {category.id === '2' && (
                <>
                  <BodyText color={COLORS.text.secondary} size='xs' style={styles.requirementItem}>
                  • Food license and hygiene certificates
                  </BodyText>
                  <BodyText color={COLORS.text.secondary} size='xs' style={styles.requirementItem}>
                  • Experience in food service industry
                  </BodyText>
                  <BodyText color={COLORS.text.secondary} size='xs' style={styles.requirementItem}>
                  • Participation in auction process required
                  </BodyText>
                </>
              )}
              {category.id === '3' && (
                <>
                  <BodyText color={COLORS.text.secondary} size='xs' style={styles.requirementItem}>
                  • Valid artisan card issued by government
                  </BodyText>
                  <BodyText color={COLORS.text.secondary} size='xs' style={styles.requirementItem}>
                  • Portfolio of traditional craft work
                  </BodyText>
                  <BodyText color={COLORS.text.secondary} size='xs' style={styles.requirementItem}>
                  • Participation in lucky draw process
                  </BodyText>
                </>
              )}
              {category.id === '4' && (
                <>
                  <BodyText color={COLORS.text.secondary} size='xs' style={styles.requirementItem}>
                  • Copy of national award certificate
                  </BodyText>
                  <BodyText color={COLORS.text.secondary} size='xs' style={styles.requirementItem}>
                  • Proof of recognition and achievements
                  </BodyText>
                  <BodyText color={COLORS.text.secondary} size='xs' style={styles.requirementItem}>
                  • Priority allocation based on award level
                  </BodyText>
                </>
              )}
              {category.id === '5' && (
                <>
                  <BodyText color={COLORS.text.secondary} size='xs' style={styles.requirementItem}>
                  • Valid business registration documents
                  </BodyText>
                  <BodyText color={COLORS.text.secondary} size='xs' style={styles.requirementItem}>
                  • Participation in auction process required
                  </BodyText>
                  <BodyText color={COLORS.text.secondary} size='xs' style={styles.requirementItem}>
                  • Minimum bid amount as per guidelines
                  </BodyText>
                </>
              )}
              {category.id === '6' && (
                <>
                  <BodyText color={COLORS.text.secondary} size='xs' style={styles.requirementItem}>
                  • Brand promotion budget: Rs. 1,00,000 - 1,50,000
                  </BodyText>
                  <BodyText color={COLORS.text.secondary} size='xs' style={styles.requirementItem}>
                  • Location-based pricing as per guidelines
                  </BodyText>
                  <BodyText color={COLORS.text.secondary} size='xs' style={styles.requirementItem}>
                  • Brand marketing strategy and materials
                  </BodyText>
                </>
              )}
              {category.id === '7' && (
                <>
                  <BodyText color={COLORS.text.secondary} size='xs' style={styles.requirementItem}>
                  • Valid business registration documents
                  </BodyText>
                  <BodyText color={COLORS.text.secondary} size='xs' style={styles.requirementItem}>
                  • Participation in lucky draw process
                  </BodyText>
                  <BodyText color={COLORS.text.secondary} size='xs' style={styles.requirementItem}>
                  • Equal opportunity for all applicants
                  </BodyText>
                </>
              )}
            </View>
          </View>

          {/* Form Fields */}
          <View style={styles.formSection}>
            <H2 color={COLORS.text.primary} weight='semiBold' size='md' style={styles.sectionTitle}>
              Application Information
            </H2>

            <TextInput
              label="Email *"
              value={formData.email}
              onChangeText={(value) => handleInputChange('email', value)}
              error={errors.email}
              placeholder="Enter email address"
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <TextInput
              label="Name of Firm/NGO/Organisation *"
              value={formData.firmName}
              onChangeText={(value) => handleInputChange('firmName', value)}
              error={errors.firmName}
              placeholder="Enter firm/NGO/organisation name"
            />

            <TextInput
              label="Name of Owner/Proprietor/Representative *"
              value={formData.ownerName}
              onChangeText={(value) => handleInputChange('ownerName', value)}
              error={errors.ownerName}
              placeholder="Enter owner/proprietor/representative name"
            />

            <TextInput
              label="Father's Name *"
              value={formData.fatherName}
              onChangeText={(value) => handleInputChange('fatherName', value)}
              error={errors.fatherName}
              placeholder="Enter father's name"
            />

            <TextInput
              label="Aadhar Number of Proprietor/Representative *"
              value={formData.aadharNumber}
              onChangeText={(value) => handleInputChange('aadharNumber', value)}
              error={errors.aadharNumber}
              placeholder="Enter 12-digit Aadhar number"
              keyboardType="numeric"
            />

            <TextInput
              label="Correspondence Address *"
              value={formData.correspondenceAddress}
              onChangeText={(value) => handleInputChange('correspondenceAddress', value)}
              error={errors.correspondenceAddress}
              placeholder="Enter complete correspondence address"
              multiline
              numberOfLines={3}
            />

            <TextInput
              label="District *"
              value={formData.district}
              onChangeText={(value) => handleInputChange('district', value)}
              error={errors.district}
              placeholder="Enter district name"
            />

            <TextInput
              label="Pin Code *"
              value={formData.pinCode}
              onChangeText={(value) => handleInputChange('pinCode', value)}
              error={errors.pinCode}
              placeholder="Enter 6-digit pin code"
              keyboardType="numeric"
            />

            <TextInput
              label="State *"
              value={formData.state}
              onChangeText={(value) => handleInputChange('state', value)}
              error={errors.state}
              placeholder="Enter state name"
            />

            <TextInput
              label="Mobile Number *"
              value={formData.mobileNumber}
              onChangeText={(value) => handleInputChange('mobileNumber', value)}
              error={errors.mobileNumber}
              placeholder="Enter 10-digit mobile number"
              keyboardType="phone-pad"
            />

            <TextInput
              label="Alternate Mobile Number"
              value={formData.alternateMobileNumber}
              onChangeText={(value) => handleInputChange('alternateMobileNumber', value)}
              error={errors.alternateMobileNumber}
              placeholder="Enter alternate mobile number (optional)"
              keyboardType="phone-pad"
            />

            <TextInput
              label="Type of Work/Purpose (Clearly Specify) *"
              value={formData.typeOfWork}
              onChangeText={(value) => handleInputChange('typeOfWork', value)}
              error={errors.typeOfWork}
              placeholder="Clearly specify the type of work/purpose"
              multiline
              numberOfLines={3}
            />

            <TextInput
              label="Award/Achievement/Experience with the field *"
              value={formData.awardAchievement}
              onChangeText={(value) => handleInputChange('awardAchievement', value)}
              error={errors.awardAchievement}
              placeholder="Enter awards, achievements, or experience details"
              multiline
              numberOfLines={3}
            />

            <TextInput
              label="Other Remarks (If any)"
              value={formData.otherRemarks}
              onChangeText={(value) => handleInputChange('otherRemarks', value)}
              error={errors.otherRemarks}
              placeholder="Enter any other remarks (optional)"
              multiline
              numberOfLines={3}
            />

            {/* File Upload Section */}
            <H3 color={COLORS.text.primary} weight='semiBold' size='sm' style={styles.uploadSectionTitle}>
              Document Upload
            </H3>

            <FileUpload
              label="Upload Aadhar Card"
              fileName={formData.aadharCardFile}
              onFileSelect={(file) => handleInputChange('aadharCardFile', file?.name || '')}
              error={errors.aadharCardFile}
              required
              maxSize={10}
            />

            <FileUpload
              label="Upload Certificate of Registration"
              fileName={formData.registrationCertificateFile}
              onFileSelect={(file) => handleInputChange('registrationCertificateFile', file?.name || '')}
              error={errors.registrationCertificateFile}
              required
              maxSize={10}
            />
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={isSubmitting}
          >
            <ButtonTextPrimary size='md'>
              {isSubmitting ? 'Submitting...' : 'Submit Application'}
            </ButtonTextPrimary>
          </TouchableOpacity>

          {/* Terms and Conditions */}
          <View style={styles.termsSection}>
            <BodyText color={COLORS.text.tertiary} size='xs' style={styles.termsText}>
              By submitting this application, you agree to the terms and conditions of the International Gita Mahotsav 2025 stall allocation policy.
            </BodyText>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
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
    fontSize: FONT_SIZES.md,
  },
  placeholder: {
    width: 40,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 20,
  },
  categoryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: COLORS.background.secondary,
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border.light,
  },
  categoryIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  categoryDetails: {
    flex: 1,
  },
  requirementsSection: {
    backgroundColor: COLORS.background.tertiary,
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border.light,
  },
  requirementsTitle: {
    marginBottom: 8,
  },
  requirementsList: {
    marginTop: 8,
  },
  requirementItem: {
    marginBottom: 4,
    lineHeight: 16,
  },
  formSection: {
    paddingHorizontal: 20,
  },
  sectionTitle: {
    marginBottom: 16,
  },
  uploadSectionTitle: {
    marginTop: 20,
    marginBottom: 12,
  },
  submitButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 16,
    marginHorizontal: 20,
    marginTop: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  submitButtonDisabled: {
    backgroundColor: COLORS.text.tertiary,
  },
  termsSection: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  termsText: {
    textAlign: 'center',
    lineHeight: 18,
  },
});

export default StallApplicationScreen;
