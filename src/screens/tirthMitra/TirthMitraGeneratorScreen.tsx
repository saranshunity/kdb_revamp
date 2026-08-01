import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  TextInput,
  Image,
  Alert,
  Modal,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { COLORS } from '../../constants/colors';
import { FONTS, FONT_SIZES } from '../../constants/fonts';
import { H2, H3, BodyText } from '../../components/Text';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { launchImageLibrary } from 'react-native-image-picker';
import tirthData from '../../../tirth.json';
import { useAuth } from '../../contexts/AuthContext';
import FileUpload from '../../components/FileUpload';
import { FileData, uploadDocumentToFirebase } from '../../utils/documentUploader';
import firestore from '@react-native-firebase/firestore';
import OTPService from '../../services/OTPService';

type TirthMitraGeneratorScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'TirthMitraGenerator'
>;

interface Tirth {
  id: string;
  name: string;
  district: string;
  location: {
    address: string;
  };
}

interface FormData {
  fullName: string;
  fatherName: string;
  dateOfBirth: string;
  gender: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  photoUri: string;
  idCardUri: string;
  idCardFile: FileData | null;
  selectedDistrict: string;
  selectedTirth: string;
  selectedTirthName: string;
}

const TirthMitraGeneratorScreen = () => {
  const { user } = useAuth();
  const [formData, setFormData] = useState<FormData>({
    fullName: '',
    fatherName: '',
    dateOfBirth: '',
    gender: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    photoUri: '',
    idCardUri: '',
    idCardFile: null,
    selectedDistrict: '',
    selectedTirth: '',
    selectedTirthName: '',
  });

  const [districts, setDistricts] = useState<string[]>([]);
  const [filteredTirthas, setFilteredTirthas] = useState<Tirth[]>([]);
  const [showDistrictPicker, setShowDistrictPicker] = useState(false);
  const [showTirthPicker, setShowTirthPicker] = useState(false);
  const [tirthSearchQuery, setTirthSearchQuery] = useState('');
  const [useLoggedInPhone, setUseLoggedInPhone] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isSendingOTP, setIsSendingOTP] = useState(false);
  const [phoneVerified, setPhoneVerified] = useState(false);

  const insets = useSafeAreaInsets();
  const navigation = useNavigation<TirthMitraGeneratorScreenNavigationProp>();

  // Set logged-in user's phone number on mount
  React.useEffect(() => {
    if (user?.phoneNumber) {
      const phoneWithoutCountryCode = user.phoneNumber.replace(/^\+91/, '');
      setFormData(prev => ({ ...prev, phone: phoneWithoutCountryCode }));
      // Auto-verify if using logged-in phone
      setPhoneVerified(true);
    }
  }, [user]);

  React.useEffect(() => {
    // Load unique districts
    const allTirthas: Tirth[] = tirthData.tirthas;
    const uniqueDistricts = [...new Set(allTirthas.map(t => t.district))];
    setDistricts(uniqueDistricts);
  }, []);

  React.useEffect(() => {
    // Filter tirthas when district changes or search query changes
    if (formData.selectedDistrict) {
      const allTirthas: Tirth[] = tirthData.tirthas;
      let filtered = allTirthas.filter(t => t.district === formData.selectedDistrict);
      
      // Apply search filter if search query exists
      if (tirthSearchQuery.trim()) {
        const query = tirthSearchQuery.toLowerCase().trim();
        filtered = filtered.filter(t => 
          t.name.toLowerCase().includes(query) ||
          t.location.address.toLowerCase().includes(query)
        );
      }
      
      setFilteredTirthas(filtered);
    } else {
      setFilteredTirthas([]);
    }
  }, [formData.selectedDistrict, tirthSearchQuery]);

  const updateField = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleDateOfBirthChange = (text: string) => {
    // Remove all non-digit characters
    const digits = text.replace(/\D/g, '');
    
    // Limit to 8 digits (DDMMYYYY)
    if (digits.length <= 8) {
      let formatted = digits;
      
      // Add slashes
      if (digits.length > 2) {
        formatted = digits.substring(0, 2) + '/' + digits.substring(2);
      }
      if (digits.length > 4) {
        formatted = digits.substring(0, 2) + '/' + digits.substring(2, 4) + '/' + digits.substring(4);
      }
      
      updateField('dateOfBirth', formatted);
    }
  };

  const handleDistrictSelect = (district: string) => {
    setFormData(prev => ({
      ...prev,
      selectedDistrict: district,
      selectedTirth: '',
      selectedTirthName: '',
    }));
    setShowDistrictPicker(false);
  };

  const handleTirthSelect = (tirth: Tirth) => {
    setFormData(prev => ({
      ...prev,
      selectedTirth: tirth.id,
      selectedTirthName: tirth.name,
    }));
    setTirthSearchQuery(''); // Clear search when selecting
    setShowTirthPicker(false);
  };

  const handleSelectPhoto = () => {
    launchImageLibrary(
      {
        mediaType: 'photo',
        quality: 0.8,
        maxWidth: 800,
        maxHeight: 1000,
        includeBase64: false,
      },
      response => {
        if (response.didCancel) {
          console.log('User cancelled image picker');
        } else if (response.errorCode) {
          Alert.alert('Error', response.errorMessage || 'Failed to select photo');
        } else if (response.assets && response.assets[0]) {
          updateField('photoUri', response.assets[0].uri || '');
        }
      }
    );
  };

  const validateForm = () => {
    if (!formData.fullName.trim()) {
      Alert.alert('Required Field', 'Please enter your full name');
      return false;
    }
    if (!formData.dateOfBirth.trim()) {
      Alert.alert('Required Field', 'Please enter your date of birth');
      return false;
    }
    if (!formData.gender.trim()) {
      Alert.alert('Required Field', 'Please select your gender');
      return false;
    }
    if (!formData.phone.trim() || formData.phone.length !== 10) {
      Alert.alert('Invalid Phone', 'Please enter a valid 10-digit phone number');
      return false;
    }
    if (!formData.email.trim() || !formData.email.includes('@')) {
      Alert.alert('Invalid Email', 'Please enter a valid email address');
      return false;
    }
    if (!formData.address.trim()) {
      Alert.alert('Required Field', 'Please enter your address');
      return false;
    }
    if (!formData.city.trim()) {
      Alert.alert('Required Field', 'Please enter your city');
      return false;
    }
    if (!formData.state.trim()) {
      Alert.alert('Required Field', 'Please enter your state');
      return false;
    }
    if (!formData.pincode.trim() || formData.pincode.length !== 6) {
      Alert.alert('Invalid Pincode', 'Please enter a valid 6-digit pincode');
      return false;
    }
    if (!formData.idCardFile) {
      Alert.alert('Required Field', 'Please upload your Aadhar card or government ID/Document');
      return false;
    }
    return true;
  };

  const sendOTPVerification = async () => {
    try {
      setIsSendingOTP(true);
      const phoneWithCountryCode = `+91${formData.phone}`;
      
      // Generate 4-digit OTP
      const otp = OTPService.generateOTP();
      console.log('Generated OTP:', otp);
      
      // Send OTP via SMS API
      const sent = await OTPService.sendOTP(phoneWithCountryCode, otp);
      
      if (sent) {
        // Navigate to OTP verification screen
        navigation.navigate('TirthMitraOTPVerification', {
          phoneNumber: phoneWithCountryCode,
          onVerified: () => {
            setPhoneVerified(true);
          },
        });
      } else {
        throw new Error('Failed to send OTP');
      }
    } catch (error: any) {
      console.error('Error sending OTP:', error);
      let errorMessage = 'Failed to send OTP. Please try again.';
      if (error.message?.includes('Invalid phone number')) {
        errorMessage = 'Invalid phone number format.';
      } else if (error.message?.includes('network') || error.message?.includes('Network')) {
        errorMessage = 'Network error. Please check your connection.';
      }
      Alert.alert('Error', errorMessage);
    } finally {
      setIsSendingOTP(false);
    }
  };


  // Check if phone needs verification
  const needsPhoneVerification = useMemo(() => {
    // If phone is already verified, skip
    if (phoneVerified) {
      return false;
    }
    // If using logged-in phone, no verification needed
    if (user?.phoneNumber) {
      const userPhone = user.phoneNumber.replace(/^\+91/, '');
      if (formData.phone === userPhone) {
        return false;
      }
    }
    // Different phone number needs verification (only if 10 digits entered)
    return formData.phone.length === 10;
  }, [phoneVerified, user?.phoneNumber, formData.phone]);

  const handleGenerateCard = async () => {
    if (!validateForm()) {
      return;
    }

    // Removed phone verification requirement - allow submission without verification
    // if (needsPhoneVerification) {
    //   Alert.alert(
    //     'Phone Verification Required',
    //     'Please verify your phone number before generating the card.',
    //     [{ text: 'OK' }]
    //   );
    //   return;
    // }

    // Proceed with upload
    await handleUploadAndSubmit();
  };

  const handleUploadAndSubmit = async () => {
    try {
      setIsUploading(true);
      setUploadProgress(0);

      // Check if phone number already exists in the collection
      const phoneWithCountryCode = `+91${formData.phone}`;
      const existingApplications = await firestore()
        .collection('tirthMitraApplications')
        .where('mobileNumber', '==', phoneWithCountryCode)
        .get();

      if (!existingApplications.empty) {
        Alert.alert(
          'Duplicate Phone Number',
          'You have already requested with the same number. Please try with a different number.',
          [{ text: 'OK' }]
        );
        setIsUploading(false);
        setUploadProgress(0);
        return;
      }

      // Upload photo to Firebase
      let photoUrl = formData.photoUri;
      if (formData.photoUri) {
        // Convert photo URI to FileData format
        const photoFile: FileData = {
          uri: formData.photoUri,
          name: `photo_${Date.now()}.jpg`,
          type: 'image/jpeg',
          size: 0,
        };
        
        const photoUploadResult = await uploadDocumentToFirebase(
          photoFile,
          'tirthMitra/photos',
          (progress) => setUploadProgress(progress * 0.5) // 50% for photo
        );
        photoUrl = photoUploadResult.url;
      }

      // Upload ID card document to Firebase
      let idCardUrl = '';
      if (formData.idCardFile) {
        const idCardUploadResult = await uploadDocumentToFirebase(
          formData.idCardFile,
          'tirthMitra/documents',
          (progress) => setUploadProgress(50 + progress * 0.5) // 50-100% for document
        );
        idCardUrl = idCardUploadResult.url;
      }

      // Update form data with Firebase URLs
      const updatedFormData = {
        ...formData,
        photoUri: photoUrl,
        idCardUri: idCardUrl,
      };

      // Save application data to Firestore
      const initialData = {
        ...updatedFormData,
        userId: user?.id || null, // Allow null userId for unauthenticated submissions
        mobileNumber: phoneWithCountryCode,
        status: 'pending',
        submittedAt: firestore.FieldValue.serverTimestamp(),
        createdAt: firestore.FieldValue.serverTimestamp(),
      };

      // Save to Firestore
      const docRef = await firestore()
        .collection('tirthMitraApplications')
        .add(initialData);

      // Get application ID and update with it
      const applicationId = docRef.id;
      await docRef.update({ applicationId: applicationId });

      const applicationData = {
        ...initialData,
        applicationId: applicationId,
      };

      // Navigate to review screen
      navigation.navigate('TirthMitraReview', {
        applicationData: applicationData,
      });
    } catch (error: any) {
      console.error('Upload error:', error);
      Alert.alert('Upload Failed', error.message || 'Failed to upload files. Please try again.');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background.primary} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text.primary} />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <H2 style={styles.headerTitle} color={COLORS.text.primary} weight="semiBold" size="lg">
            Generate Tirth Mitra Card
          </H2>
        </View>
        <View style={styles.backButton} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollView}>
        {/* Progress Indicator */}
        {/* <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View style={styles.progressFill} />
          </View>
          <BodyText style={styles.progressText} color={COLORS.text.secondary} size="xs">
            Step 2 of 3
          </BodyText>
        </View> */}

        {/* Photo Upload Section */}
        <View style={styles.section}>
        <BodyText color={COLORS.text.primary} size='sm' weight='medium' style={styles.label}>
        Upload Photo
          </BodyText>
          <TouchableOpacity style={styles.photoContainer} onPress={handleSelectPhoto}>
            {formData.photoUri ? (
              <Image source={{ uri: formData.photoUri }} style={styles.photoPreview} />
            ) : (
              <>
                <Ionicons name="camera" size={40} color={COLORS.text.tertiary} />
                <BodyText style={styles.photoText} color={COLORS.text.tertiary} size="sm">
                  Tap to upload photo
                </BodyText>
                <BodyText style={styles.photoHint} color={COLORS.text.tertiary} size="xs">
                  Passport size (max 2MB)
                </BodyText>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* ID Card/Document Upload Section */}
        <View style={styles.section}>
          <FileUpload
            label="Upload ID Card/Document"
            fileName={formData.idCardFile?.name}
            fileSize={formData.idCardFile?.size}
            onFileSelect={(file) => {
              setFormData(prev => ({ ...prev, idCardFile: file }));
              if (file) {
                // Also set idCardUri for backwards compatibility
                setFormData(prev => ({ ...prev, idCardUri: file.uri }));
              }
            }}
            error=""
            required
            maxSize={10}
            allowedTypes={['application/pdf', 'image/jpeg', 'image/png', 'image/jpg']}
            showPreview={true}
            isUploading={false}
          />
        </View>

        {/* Pilgrimage Information */}
        <View style={styles.section}>
          <H3 style={styles.sectionTitle} color={COLORS.text.primary} weight="semiBold" size="md">
            Pilgrimage Information
          </H3>

          <View style={styles.inputGroup}>
            <BodyText style={styles.label} color={COLORS.text.secondary} size="sm">
              Select District <Text style={styles.required}>*</Text>
            </BodyText>
            <TouchableOpacity
              style={styles.pickerButton}
              onPress={() => setShowDistrictPicker(true)}
            >
              <BodyText
                style={styles.pickerButtonText}
                color={formData.selectedDistrict ? COLORS.text.primary : COLORS.text.tertiary}
                size="sm"
              >
                {formData.selectedDistrict || 'Select your district'}
              </BodyText>
              <Ionicons name="chevron-down" size={20} color={COLORS.text.tertiary} />
            </TouchableOpacity>
          </View>

          {formData.selectedDistrict && (
            <View style={styles.inputGroup}>
              <BodyText style={styles.label} color={COLORS.text.secondary} size="sm">
                Select Tirth <Text style={styles.required}>*</Text>
              </BodyText>
              <TouchableOpacity
                style={styles.pickerButton}
                onPress={() => {
                  setTirthSearchQuery('');
                  setShowTirthPicker(true);
                }}
              >
                <BodyText
                  style={styles.pickerButtonText}
                  color={formData.selectedTirthName ? COLORS.text.primary : COLORS.text.tertiary}
                  size="sm"
                  numberOfLines={1}
                >
                  {formData.selectedTirthName || 'Select your tirth'}
                </BodyText>
                <Ionicons name="chevron-down" size={20} color={COLORS.text.tertiary} />
              </TouchableOpacity>
              {formData.selectedTirthName && (
                <BodyText style={styles.selectedInfo} color={COLORS.success} size="xs">
                  <Ionicons name="checkmark-circle" size={12} color={COLORS.success} />
                  {' '}Selected: {formData.selectedTirthName}
                </BodyText>
              )}
            </View>
          )}
        </View>

        {/* Personal Information */}
        <View style={styles.section}>
          <H3 style={styles.sectionTitle} color={COLORS.text.primary} weight="semiBold" size="md">
            Personal Information
          </H3>

          <View style={styles.inputGroup}>
            <BodyText style={styles.label} color={COLORS.text.secondary} size="sm">
              Full Name <Text style={styles.required}>*</Text>
            </BodyText>
            <TextInput
              style={styles.input}
              placeholder="Enter your full name"
              placeholderTextColor={COLORS.text.tertiary}
              value={formData.fullName}
              onChangeText={text => updateField('fullName', text)}
            />
          </View>

          <View style={styles.inputGroup}>
            <BodyText style={styles.label} color={COLORS.text.secondary} size="sm">
              Father's/Husband's Name
            </BodyText>
            <TextInput
              style={styles.input}
              placeholder="Enter father's/husband's name"
              placeholderTextColor={COLORS.text.tertiary}
              value={formData.fatherName}
              onChangeText={text => updateField('fatherName', text)}
            />
          </View>

          <View style={styles.row}>
            <View style={[styles.inputGroup, styles.halfWidth]}>
              <BodyText style={styles.label} color={COLORS.text.secondary} size="sm">
                Date of Birth <Text style={styles.required}>*</Text>
              </BodyText>
              <TextInput
                style={styles.input}
                placeholder="DD/MM/YYYY"
                placeholderTextColor={COLORS.text.tertiary}
                value={formData.dateOfBirth}
                onChangeText={handleDateOfBirthChange}
                keyboardType="number-pad"
                maxLength={10}
              />
            </View>

            <View style={[styles.inputGroup, styles.halfWidth]}>
              <BodyText style={styles.label} color={COLORS.text.secondary} size="sm">
                Gender <Text style={styles.required}>*</Text>
              </BodyText>
              <View style={styles.genderContainer}>
                {['Male', 'Female', 'Other'].map(gender => (
                  <TouchableOpacity
                    key={gender}
                    style={[
                      styles.genderButton,
                      formData.gender === gender && styles.genderButtonActive,
                    ]}
                    onPress={() => updateField('gender', gender)}
                  >
                    <BodyText
                      style={styles.genderText}
                      color={
                        formData.gender === gender ? COLORS.white : COLORS.text.secondary
                      }
                      size="xs"
                    >
                      {gender}
                    </BodyText>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        </View>

        {/* Contact Information */}
        <View style={styles.section}>
          <H3 style={styles.sectionTitle} color={COLORS.text.primary} weight="semiBold" size="md">
            Contact Information
          </H3>

          <View style={styles.inputGroup}>
            <View style={styles.labelRow}>
              <BodyText style={styles.label} color={COLORS.text.secondary} size="sm">
                Phone Number <Text style={styles.required}>*</Text>
              </BodyText>
              {user?.phoneNumber && (
                <TouchableOpacity
                  onPress={() => {
                    if (useLoggedInPhone) {
                      // Switch to different number - clear the field and reset verification
                      setFormData(prev => ({ ...prev, phone: '' }));
                      setPhoneVerified(false);
                    } else {
                      // Switch back to logged-in number - auto-verify
                      const phoneWithoutCountryCode = user?.phoneNumber?.replace(/^\+91/, '') || '';
                      setFormData(prev => ({ ...prev, phone: phoneWithoutCountryCode }));
                      setPhoneVerified(true);
                    }
                    setUseLoggedInPhone(!useLoggedInPhone);
                  }}
                  style={styles.switchPhoneButton}
                >
                  <BodyText style={styles.switchPhoneText} color={COLORS.background.appColor} size="xs">
                    {useLoggedInPhone ? 'Use Different Number' : 'Use My Number'}
                  </BodyText>
                </TouchableOpacity>
              )}
            </View>
            <TextInput
              style={styles.input}
              placeholder="10-digit mobile number"
              placeholderTextColor={COLORS.text.tertiary}
              value={formData.phone}
              onChangeText={text => {
                updateField('phone', text);
                // Reset verified status when phone changes
                if (phoneVerified) {
                  setPhoneVerified(false);
                }
              }}
              keyboardType="phone-pad"
              maxLength={10}
              editable={true}
            />
            {formData.phone.length === 10 && !phoneVerified && (
              <TouchableOpacity
                style={[styles.verifyOtpButton, isSendingOTP && styles.verifyOtpButtonDisabled]}
                onPress={sendOTPVerification}
                disabled={isSendingOTP}
                activeOpacity={0.8}
              >
                {isSendingOTP ? (
                  <>
                    <ActivityIndicator size="small" color={COLORS.white} />
                    <BodyText style={styles.verifyOtpButtonText} color={COLORS.white} size="sm" weight="semiBold">
                      Sending OTP...
                    </BodyText>
                  </>
                ) : (
                  <>
                    <Ionicons name="checkmark-circle-outline" size={18} color={COLORS.white} />
                    <BodyText style={styles.verifyOtpButtonText} color={COLORS.white} size="sm" weight="semiBold">
                      Verify OTP
                    </BodyText>
                  </>
                )}
              </TouchableOpacity>
            )}
            {phoneVerified && (
              <View style={styles.verifiedContainer}>
                <Ionicons name="checkmark-circle" size={16} color={COLORS.success} />
                <BodyText style={styles.verifiedText} color={COLORS.success} size="xs" weight="semiBold">
                  Phone number verified
                </BodyText>
              </View>
            )}
            {user?.phoneNumber && formData.phone && formData.phone !== user.phoneNumber.replace(/^\+91/, '') && !phoneVerified && (
              <BodyText style={styles.hintText} color={COLORS.text.secondary} size="xs">
                OTP verification will be required for this number
              </BodyText>
            )}
          </View>

          <View style={styles.inputGroup}>
            <BodyText style={styles.label} color={COLORS.text.secondary} size="sm">
              Email Address <Text style={styles.required}>*</Text>
            </BodyText>
            <TextInput
              style={styles.input}
              placeholder="your.email@example.com"
              placeholderTextColor={COLORS.text.tertiary}
              value={formData.email}
              onChangeText={text => updateField('email', text)}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>
        </View>

        {/* Address Information */}
        <View style={styles.section}>
          <H3 style={styles.sectionTitle} color={COLORS.text.primary} weight="semiBold" size="md">
            Address Information
          </H3>

          <View style={styles.inputGroup}>
            <BodyText style={styles.label} color={COLORS.text.secondary} size="sm">
              Address <Text style={styles.required}>*</Text>
            </BodyText>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Enter your complete address"
              placeholderTextColor={COLORS.text.tertiary}
              value={formData.address}
              onChangeText={text => updateField('address', text)}
              multiline
              numberOfLines={3}
            />
          </View>

          <View style={styles.row}>
            <View style={[styles.inputGroup, styles.halfWidth]}>
              <BodyText style={styles.label} color={COLORS.text.secondary} size="sm">
                City <Text style={styles.required}>*</Text>
              </BodyText>
              <TextInput
                style={styles.input}
                placeholder="City"
                placeholderTextColor={COLORS.text.tertiary}
                value={formData.city}
                onChangeText={text => updateField('city', text)}
              />
            </View>

            <View style={[styles.inputGroup, styles.halfWidth]}>
              <BodyText style={styles.label} color={COLORS.text.secondary} size="sm">
                State <Text style={styles.required}>*</Text>
              </BodyText>
              <TextInput
                style={styles.input}
                placeholder="State"
                placeholderTextColor={COLORS.text.tertiary}
                value={formData.state}
                onChangeText={text => updateField('state', text)}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <BodyText style={styles.label} color={COLORS.text.secondary} size="sm">
              Pincode <Text style={styles.required}>*</Text>
            </BodyText>
            <TextInput
              style={styles.input}
              placeholder="6-digit pincode"
              placeholderTextColor={COLORS.text.tertiary}
              value={formData.pincode}
              onChangeText={text => updateField('pincode', text)}
              keyboardType="number-pad"
              maxLength={6}
            />
          </View>
        </View>

        {/* Upload Progress */}
        {isUploading && (
          <View style={styles.uploadProgressContainer}>
            <BodyText style={styles.uploadProgressText} color={COLORS.text.secondary} size="sm">
              Submitting request... {Math.round(uploadProgress)}%
            </BodyText>
            <View style={styles.uploadProgressBar}>
              <View style={[styles.uploadProgressFill, { width: `${uploadProgress}%` }]} />
            </View>
          </View>
        )}

        {/* Generate Button */}
        <TouchableOpacity
          style={[
            styles.generateButton,
            (isUploading || isSendingOTP) && styles.generateButtonDisabled
          ]}
          onPress={handleGenerateCard}
          disabled={isUploading || isSendingOTP}
          activeOpacity={0.8}
        >
          {isUploading ? (
            <>
              <ActivityIndicator size="small" color={COLORS.white} />
              <BodyText style={styles.generateButtonText} color={COLORS.white} size="md" weight="semiBold">
                Submitting...
              </BodyText>
            </>
          ) : isSendingOTP ? (
            <>
              <ActivityIndicator size="small" color={COLORS.white} />
              <BodyText style={styles.generateButtonText} color={COLORS.white} size="md" weight="semiBold">
                Sending OTP...
              </BodyText>
            </>
          ) : (
            <>
              <BodyText style={styles.generateButtonText} color={COLORS.white} size="md" weight="semiBold">
                Submit Request
              </BodyText>
              <Ionicons name="arrow-forward" size={20} color={COLORS.white} />
            </>
          )}
        </TouchableOpacity>

        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* District Picker Modal */}
      <Modal
        visible={showDistrictPicker}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowDistrictPicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <H3 style={styles.modalTitle} color={COLORS.text.primary} weight="bold" size="md">
                Select District
              </H3>
              <TouchableOpacity onPress={() => setShowDistrictPicker(false)}>
                <Ionicons name="close" size={24} color={COLORS.text.primary} />
              </TouchableOpacity>
            </View>
            <FlatList
              data={districts}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.modalItem,
                    formData.selectedDistrict === item && styles.modalItemSelected,
                  ]}
                  onPress={() => handleDistrictSelect(item)}
                >
                  <BodyText
                    style={styles.modalItemText}
                    color={
                      formData.selectedDistrict === item
                        ? COLORS.background.appColor
                        : COLORS.text.primary
                    }
                    size="sm"
                    weight={formData.selectedDistrict === item ? 'bold' : 'regular'}
                  >
                    {item}
                  </BodyText>
                  {formData.selectedDistrict === item && (
                    <Ionicons name="checkmark" size={20} color={COLORS.background.appColor} />
                  )}
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>

      {/* Tirth Picker Modal */}
      <Modal
        visible={showTirthPicker}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowTirthPicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <H3 style={styles.modalTitle} color={COLORS.text.primary} weight="bold" size="md">
                Select Tirth - {formData.selectedDistrict}
              </H3>
              <TouchableOpacity onPress={() => {
                setTirthSearchQuery('');
                setShowTirthPicker(false);
              }}>
                <Ionicons name="close" size={24} color={COLORS.text.primary} />
              </TouchableOpacity>
            </View>
            <View style={styles.searchContainer}>
              <Ionicons name="search-outline" size={20} color={COLORS.text.tertiary} style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search tirth by name or location..."
                placeholderTextColor={COLORS.text.tertiary}
                value={tirthSearchQuery}
                onChangeText={setTirthSearchQuery}
                autoCapitalize="none"
                autoCorrect={false}
              />
              {tirthSearchQuery.length > 0 && (
                <TouchableOpacity
                  onPress={() => setTirthSearchQuery('')}
                  style={styles.clearSearchButton}
                >
                  <Ionicons name="close-circle" size={20} color={COLORS.text.tertiary} />
                </TouchableOpacity>
              )}
            </View>
            <BodyText style={styles.modalSubtitle} color={COLORS.text.secondary} size="xs">
              {filteredTirthas.length} {filteredTirthas.length === 1 ? 'tirth' : 'tirthas'} found
            </BodyText>
            <FlatList
              data={filteredTirthas}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.modalItem,
                    formData.selectedTirth === item.id && styles.modalItemSelected,
                  ]}
                  onPress={() => handleTirthSelect(item)}
                >
                  <View style={styles.tirthItemContent}>
                    <BodyText
                      style={styles.modalItemText}
                      color={
                        formData.selectedTirth === item.id
                          ? COLORS.background.appColor
                          : COLORS.text.primary
                      }
                      size="sm"
                      weight={formData.selectedTirth === item.id ? 'bold' : 'medium'}
                    >
                      {item.name}
                    </BodyText>
                    <BodyText
                      style={styles.tirthLocation}
                      color={COLORS.text.tertiary}
                      size="xs"
                    >
                      {item.location.address}
                    </BodyText>
                  </View>
                  {formData.selectedTirth === item.id && (
                    <Ionicons name="checkmark" size={20} color={COLORS.background.appColor} />
                  )}
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>

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
    width: 40,
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
  progressContainer: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: COLORS.background.secondary,
  },
  progressBar: {
    height: 6,
    backgroundColor: COLORS.border.light,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    width: '66%',
    backgroundColor: COLORS.background.appColor,
  },
  progressText: {
    fontFamily: FONTS.gilroy.medium,
    fontSize: FONT_SIZES.xs,
    textAlign: 'center',
  },
  section: {
    paddingHorizontal: 20,
    paddingVertical: 24,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border.light,
  },
  sectionTitle: {
    fontFamily: FONTS.gilroy.bold,
    fontSize: FONT_SIZES.md,
    marginBottom: 16,
  },
  photoContainer: {
    width: 150,
    height: 180,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.border.light,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    backgroundColor: COLORS.background.secondary,
  },
  photoPreview: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
  },
  photoText: {
    fontFamily: FONTS.gilroy.medium,
    fontSize: FONT_SIZES.sm,
    marginTop: 8,
  },
  photoHint: {
    fontFamily: FONTS.gilroy.regular,
    fontSize: FONT_SIZES.xs,
    marginTop: 4,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontFamily: FONTS.gilroy.medium,
    fontSize: FONT_SIZES.sm,
    marginBottom: 8,
  },
  required: {
    color: COLORS.error,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border.light,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.gilroy.regular,
    color: COLORS.text.primary,
    backgroundColor: COLORS.white,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfWidth: {
    flex: 1,
  },
  genderContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  genderButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border.light,
    alignItems: 'center',
    backgroundColor: COLORS.white,
  },
  genderButtonActive: {
    backgroundColor: COLORS.background.appColor,
    borderColor: COLORS.background.appColor,
  },
  genderText: {
    fontFamily: FONTS.gilroy.medium,
    fontSize: FONT_SIZES.xs,
  },
  generateButton: {
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
  generateButtonDisabled: {
    opacity: 0.6,
  },
  generateButtonText: {
    fontFamily: FONTS.gilroy.bold,
    fontSize: FONT_SIZES.md,
  },
  generateButtonHint: {
    fontFamily: FONTS.gilroy.regular,
    fontSize: FONT_SIZES.xs,
    textAlign: 'center',
    marginTop: 8,
    marginHorizontal: 20,
  },
  uploadProgressContainer: {
    marginHorizontal: 20,
    marginTop: 24,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: COLORS.background.secondary,
    borderRadius: 8,
    gap: 8,
  },
  uploadProgressText: {
    fontFamily: FONTS.gilroy.medium,
    fontSize: FONT_SIZES.sm,
    textAlign: 'center',
  },
  uploadProgressBar: {
    height: 4,
    backgroundColor: COLORS.border.light,
    borderRadius: 2,
    overflow: 'hidden',
  },
  uploadProgressFill: {
    height: '100%',
    backgroundColor: COLORS.background.appColor,
  },
  bottomSpacing: {
    height: 20,
  },
  pickerButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border.light,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.white,
  },
  pickerButtonText: {
    flex: 1,
    fontFamily: FONTS.gilroy.regular,
    fontSize: FONT_SIZES.sm,
  },
  selectedInfo: {
    fontFamily: FONTS.gilroy.medium,
    fontSize: FONT_SIZES.xs,
    marginTop: 6,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '70%',
    paddingBottom: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border.light,
  },
  modalTitle: {
    fontFamily: FONTS.gilroy.bold,
    fontSize: FONT_SIZES.md,
    flex: 1,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginTop: 12,
    marginBottom: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: COLORS.background.secondary,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border.light,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.gilroy.regular,
    color: COLORS.text.primary,
    padding: 0,
  },
  clearSearchButton: {
    padding: 4,
    marginLeft: 8,
  },
  modalSubtitle: {
    fontFamily: FONTS.gilroy.regular,
    fontSize: FONT_SIZES.xs,
    paddingHorizontal: 20,
    paddingVertical: 8,
    color: COLORS.text.secondary,
  },
  modalItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border.light,
  },
  modalItemSelected: {
    backgroundColor: COLORS.background.appColor + '10',
  },
  modalItemText: {
    fontFamily: FONTS.gilroy.regular,
    fontSize: FONT_SIZES.sm,
  },
  tirthItemContent: {
    flex: 1,
    marginRight: 12,
  },
  tirthLocation: {
    fontFamily: FONTS.gilroy.regular,
    fontSize: FONT_SIZES.xs,
    marginTop: 2,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  switchPhoneButton: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  switchPhoneText: {
    fontFamily: FONTS.gilroy.semiBold,
  },
  disabledInput: {
    backgroundColor: COLORS.background.secondary,
  },
  hintText: {
    marginTop: 6,
    fontStyle: 'italic',
  },
  otpModalContent: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 40,
  },
  otpDescription: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    textAlign: 'center',
    lineHeight: 20,
  },
  otpPhoneNumber: {
    fontFamily: FONTS.gilroy.bold,
    color: COLORS.text.primary,
  },
  otpInputContainer: {
    paddingHorizontal: 20,
    marginTop: 8,
  },
  otpInput: {
    borderWidth: 1,
    borderColor: COLORS.border.light,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: FONT_SIZES.lg,
    fontFamily: FONTS.gilroy.bold,
    color: COLORS.text.primary,
    backgroundColor: COLORS.white,
    textAlign: 'center',
    letterSpacing: 8,
  },
  verifyButton: {
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
  verifyButtonDisabled: {
    opacity: 0.6,
  },
  verifyButtonText: {
    fontFamily: FONTS.gilroy.bold,
    fontSize: FONT_SIZES.md,
  },
  resendButton: {
    alignItems: 'center',
    marginTop: 16,
    paddingVertical: 8,
  },
  resendButtonText: {
    fontFamily: FONTS.gilroy.semiBold,
    fontSize: FONT_SIZES.sm,
  },
  verifyOtpButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.background.appColor,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginTop: 8,
    gap: 8,
  },
  verifyOtpButtonDisabled: {
    opacity: 0.6,
  },
  verifyOtpButtonText: {
    fontFamily: FONTS.gilroy.semiBold,
    fontSize: FONT_SIZES.sm,
  },
  verifiedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 6,
  },
  verifiedText: {
    fontFamily: FONTS.gilroy.semiBold,
    fontSize: FONT_SIZES.xs,
  },
});

export default TirthMitraGeneratorScreen;

