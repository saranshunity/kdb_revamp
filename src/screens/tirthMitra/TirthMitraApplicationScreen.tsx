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
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { H1, H2, H3, BodyText, ButtonTextPrimary } from '../../components/Text';
import { COLORS } from '../../constants/colors';
import { FONTS, FONT_SIZES } from '../../constants/fonts';
import Ionicons from 'react-native-vector-icons/Ionicons';
import TextInput from '../../components/TextInput';
import FileUpload from '../../components/FileUpload';
import { uploadDocumentToFirebase } from '../../utils/documentUploader';
import firestore from '@react-native-firebase/firestore';

type TirthMitraApplicationScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'TirthMitraApplication'>;

interface FileData {
  name: string;
  uri: string;
  size: number;
  type: string;
}

interface TirthMitraFormData {
  fullName: string;
  fatherName: string;
  motherName: string;
  dateOfBirth: string;
  aadharNumber: string;
  mobileNumber: string;
  email: string;
  address: string;
  district: string;
  state: string;
  pinCode: string;
  occupation: string;
  experience: string;
  languages: string;
  availability: string;
  motivation: string;
  profileImage?: FileData;
  identityDocument?: FileData;
}

const TirthMitraApplicationScreen = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<TirthMitraApplicationScreenNavigationProp>();

  const [formData, setFormData] = useState<TirthMitraFormData>({
    fullName: '',
    fatherName: '',
    motherName: '',
    dateOfBirth: '',
    aadharNumber: '',
    mobileNumber: '',
    email: '',
    address: '',
    district: '',
    state: '',
    pinCode: '',
    occupation: '',
    experience: '',
    languages: '',
    availability: '',
    motivation: '',
  });

  const [errors, setErrors] = useState<Partial<Record<keyof TirthMitraFormData, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof TirthMitraFormData, string>> = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full Name is required';
    }

    if (!formData.fatherName.trim()) {
      newErrors.fatherName = 'Father\'s Name is required';
    }

    if (!formData.motherName.trim()) {
      newErrors.motherName = 'Mother\'s Name is required';
    }

    if (!formData.dateOfBirth.trim()) {
      newErrors.dateOfBirth = 'Date of Birth is required';
    }

    if (!formData.aadharNumber.trim()) {
      newErrors.aadharNumber = 'Aadhar Number is required';
    } else if (!/^\d{12}$/.test(formData.aadharNumber)) {
      newErrors.aadharNumber = 'Please enter a valid 12-digit Aadhar number';
    }

    if (!formData.mobileNumber.trim()) {
      newErrors.mobileNumber = 'Mobile Number is required';
    } else if (!/^[6-9]\d{9}$/.test(formData.mobileNumber)) {
      newErrors.mobileNumber = 'Please enter a valid 10-digit mobile number';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.address.trim()) {
      newErrors.address = 'Address is required';
    }

    if (!formData.district.trim()) {
      newErrors.district = 'District is required';
    }

    if (!formData.state.trim()) {
      newErrors.state = 'State is required';
    }

    if (!formData.pinCode.trim()) {
      newErrors.pinCode = 'Pin Code is required';
    } else if (!/^\d{6}$/.test(formData.pinCode)) {
      newErrors.pinCode = 'Please enter a valid 6-digit pin code';
    }

    if (!formData.occupation.trim()) {
      newErrors.occupation = 'Occupation is required';
    }

    if (!formData.experience.trim()) {
      newErrors.experience = 'Experience details are required';
    }

    if (!formData.languages.trim()) {
      newErrors.languages = 'Languages known is required';
    }

    if (!formData.availability.trim()) {
      newErrors.availability = 'Availability details are required';
    }

    if (!formData.motivation.trim()) {
      newErrors.motivation = 'Motivation statement is required';
    }

    if (!formData.profileImage) {
      newErrors.profileImage = 'Profile image is required';
    }

    if (!formData.identityDocument) {
      newErrors.identityDocument = 'Identity document is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof TirthMitraFormData, value: string | FileData | null) => {
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

    console.log('Starting Tirth Mitra application submission...');
    setIsSubmitting(true);

    try {
      // Upload files to Firebase Storage if they exist
      let profileImageUrl = '';
      let identityDocumentUrl = '';

      // Upload Profile Image
      if (formData.profileImage) {
        console.log('Uploading Profile Image...');
        const profileUploadResult = await uploadDocumentToFirebase(
          formData.profileImage,
          'tirthMitraApplications'
        );
        profileImageUrl = profileUploadResult.url;
        console.log('Profile Image uploaded:', profileImageUrl);
      }

      // Upload Identity Document
      if (formData.identityDocument) {
        console.log('Uploading Identity Document...');
        const identityUploadResult = await uploadDocumentToFirebase(
          formData.identityDocument,
          'tirthMitraApplications'
        );
        identityDocumentUrl = identityUploadResult.url;
        console.log('Identity Document uploaded:', identityDocumentUrl);
      }

      // Submit application to Firebase
      console.log('Submitting Tirth Mitra application to Firebase...');
      const applicationId = await firestore()
        .collection('tirthMitraApplications')
        .add({
          fullName: formData.fullName,
          fatherName: formData.fatherName,
          motherName: formData.motherName,
          dateOfBirth: formData.dateOfBirth,
          aadharNumber: formData.aadharNumber,
          mobileNumber: formData.mobileNumber,
          email: formData.email,
          address: formData.address,
          district: formData.district,
          state: formData.state,
          pinCode: formData.pinCode,
          occupation: formData.occupation,
          experience: formData.experience,
          languages: formData.languages,
          availability: formData.availability,
          motivation: formData.motivation,
          profileImage: profileImageUrl,
          identityDocument: identityDocumentUrl,
          status: 'pending',
          submittedAt: firestore.FieldValue.serverTimestamp(),
          applicationId: `TM${Date.now()}`,
        });

      console.log('Tirth Mitra application submitted successfully with ID:', applicationId.id);

      // Show success message
      Alert.alert(
        'Application Submitted Successfully!',
        'Your Tirth Mitra application has been submitted and is under review. You will receive updates via SMS/Email.',
        [
          {
            text: 'OK',
            onPress: () => {
              // Navigate to status screen
              navigation.navigate('TirthMitraStatus', {
                applicationId: applicationId.id,
                applicationData: formData,
                status: 'pending',
              });
            }
          }
        ]
      );

    } catch (error: any) {
      console.error('Error submitting Tirth Mitra application:', error);
      
      // Show specific error message
      const errorMessage = error.message || 'Failed to submit application. Please try again.';
      Alert.alert('Submission Failed', errorMessage);
    } finally {
      console.log('Tirth Mitra application submission completed, setting isSubmitting to false');
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
            Apply for Tirth Mitra
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
          {/* Info Section */}
          <View style={styles.infoSection}>
            <View style={styles.infoCard}>
              <Ionicons name="information-circle-outline" size={20} color={COLORS.primary} />
              <BodyText color={COLORS.text.tertiary} size='xs' style={styles.infoText}>
                Tirth Mitra volunteers help pilgrims with guidance, information, and support during their visit to the holy places.
              </BodyText>
            </View>
          </View>

          {/* Form Fields */}
          <View style={styles.formSection}>
            <H2 color={COLORS.text.primary} weight='semiBold' size='md' style={styles.sectionTitle}>
              Personal Information
            </H2>

            <TextInput
              label="Full Name *"
              value={formData.fullName}
              onChangeText={(value) => handleInputChange('fullName', value)}
              error={errors.fullName}
              placeholder="Enter your full name"
            />

            <TextInput
              label="Father's Name *"
              value={formData.fatherName}
              onChangeText={(value) => handleInputChange('fatherName', value)}
              error={errors.fatherName}
              placeholder="Enter father's name"
            />

            <TextInput
              label="Mother's Name *"
              value={formData.motherName}
              onChangeText={(value) => handleInputChange('motherName', value)}
              error={errors.motherName}
              placeholder="Enter mother's name"
            />

            <TextInput
              label="Date of Birth *"
              value={formData.dateOfBirth}
              onChangeText={(value) => handleInputChange('dateOfBirth', value)}
              error={errors.dateOfBirth}
              placeholder="DD/MM/YYYY"
            />

            <TextInput
              label="Aadhar Number *"
              value={formData.aadharNumber}
              onChangeText={(value) => handleInputChange('aadharNumber', value)}
              error={errors.aadharNumber}
              placeholder="Enter 12-digit Aadhar number"
              keyboardType="numeric"
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
              label="Email Address *"
              value={formData.email}
              onChangeText={(value) => handleInputChange('email', value)}
              error={errors.email}
              placeholder="Enter email address"
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <TextInput
              label="Address *"
              value={formData.address}
              onChangeText={(value) => handleInputChange('address', value)}
              error={errors.address}
              placeholder="Enter complete address"
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
              label="State *"
              value={formData.state}
              onChangeText={(value) => handleInputChange('state', value)}
              error={errors.state}
              placeholder="Enter state name"
            />

            <TextInput
              label="Pin Code *"
              value={formData.pinCode}
              onChangeText={(value) => handleInputChange('pinCode', value)}
              error={errors.pinCode}
              placeholder="Enter 6-digit pin code"
              keyboardType="numeric"
            />

            <H2 color={COLORS.text.primary} weight='semiBold' size='md' style={styles.sectionTitle}>
              Professional Information
            </H2>

            <TextInput
              label="Occupation *"
              value={formData.occupation}
              onChangeText={(value) => handleInputChange('occupation', value)}
              error={errors.occupation}
              placeholder="Enter your occupation"
            />

            <TextInput
              label="Experience in Social Work *"
              value={formData.experience}
              onChangeText={(value) => handleInputChange('experience', value)}
              error={errors.experience}
              placeholder="Describe your experience in social work or volunteering"
              multiline
              numberOfLines={3}
            />

            <TextInput
              label="Languages Known *"
              value={formData.languages}
              onChangeText={(value) => handleInputChange('languages', value)}
              error={errors.languages}
              placeholder="List languages you can speak (e.g., Hindi, English, Sanskrit)"
            />

            <TextInput
              label="Availability *"
              value={formData.availability}
              onChangeText={(value) => handleInputChange('availability', value)}
              error={errors.availability}
              placeholder="Describe your availability for volunteering"
              multiline
              numberOfLines={2}
            />

            <TextInput
              label="Motivation *"
              value={formData.motivation}
              onChangeText={(value) => handleInputChange('motivation', value)}
              error={errors.motivation}
              placeholder="Why do you want to become a Tirth Mitra?"
              multiline
              numberOfLines={3}
            />

            {/* File Upload Section */}
            <H3 color={COLORS.text.primary} weight='semiBold' size='sm' style={styles.uploadSectionTitle}>
              Document Upload
            </H3>

            <FileUpload
              label="Upload Profile Image"
              fileName={formData.profileImage?.name}
              fileSize={formData.profileImage?.size}
              onFileSelect={(file) => handleInputChange('profileImage', file)}
              error={errors.profileImage}
              required
              maxSize={5}
              allowedTypes={['image/jpeg', 'image/png', 'image/jpg']}
              showPreview={true}
              isUploading={isSubmitting}
            />

            <FileUpload
              label="Upload Identity Document (Aadhar Card/Any Authorized ID)"
              fileName={formData.identityDocument?.name}
              fileSize={formData.identityDocument?.size}
              onFileSelect={(file) => handleInputChange('identityDocument', file)}
              error={errors.identityDocument}
              required
              maxSize={10}
              allowedTypes={['application/pdf', 'image/jpeg', 'image/png', 'image/jpg']}
              showPreview={true}
              isUploading={isSubmitting}
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
              By submitting this application, you agree to the terms and conditions of the Tirth Mitra program and commit to serving pilgrims with dedication and respect.
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
  infoSection: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.background.secondary,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border.light,
  },
  infoText: {
    flex: 1,
    marginLeft: 12,
    lineHeight: 16,
  },
  formSection: {
    paddingHorizontal: 20,
  },
  sectionTitle: {
    marginBottom: 16,
    marginTop: 20,
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

export default TirthMitraApplicationScreen;
