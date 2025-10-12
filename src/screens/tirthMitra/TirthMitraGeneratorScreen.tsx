import React, { useState } from 'react';
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
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { COLORS } from '../../constants/colors';
import { FONTS, FONT_SIZES } from '../../constants/fonts';
import { H2, H3, BodyText } from '../../components/Text';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';

type TirthMitraGeneratorScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'TirthMitraGenerator'
>;

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
}

const TirthMitraGeneratorScreen = () => {
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
  });

  const insets = useSafeAreaInsets();
  const navigation = useNavigation<TirthMitraGeneratorScreenNavigationProp>();

  const updateField = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSelectPhoto = () => {
    Alert.alert(
      'Upload Photo',
      'Choose an option',
      [
        {
          text: 'Camera',
          onPress: () => {
            launchCamera(
              {
                mediaType: 'photo',
                quality: 0.8,
                maxWidth: 800,
                maxHeight: 1000,
                includeBase64: false,
              },
              response => {
                if (response.didCancel) {
                  console.log('User cancelled camera');
                } else if (response.errorCode) {
                  Alert.alert('Error', response.errorMessage || 'Failed to capture photo');
                } else if (response.assets && response.assets[0]) {
                  updateField('photoUri', response.assets[0].uri || '');
                }
              }
            );
          },
        },
        {
          text: 'Gallery',
          onPress: () => {
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
          },
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ]
    );
  };

  const validateForm = () => {
    if (!formData.fullName.trim()) {
      Alert.alert('Required Field', 'Please enter your full name');
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
    return true;
  };

  const handleGenerateCard = () => {
    if (validateForm()) {
      // Navigate to card preview screen
      navigation.navigate('TirthMitraCard', { cardData: formData });
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
          <H2 style={styles.headerTitle} color={COLORS.text.primary} weight="bold" size="lg">
            Generate Tirth Mitra Card
          </H2>
        </View>
        <View style={styles.backButton} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollView}>
        {/* Progress Indicator */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View style={styles.progressFill} />
          </View>
          <BodyText style={styles.progressText} color={COLORS.text.secondary} size="xs">
            Step 2 of 3
          </BodyText>
        </View>

        {/* Photo Upload Section */}
        <View style={styles.section}>
          <H3 style={styles.sectionTitle} color={COLORS.text.primary} weight="bold" size="md">
            Upload Photo
          </H3>
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

        {/* Personal Information */}
        <View style={styles.section}>
          <H3 style={styles.sectionTitle} color={COLORS.text.primary} weight="bold" size="md">
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
                Date of Birth
              </BodyText>
              <TextInput
                style={styles.input}
                placeholder="DD/MM/YYYY"
                placeholderTextColor={COLORS.text.tertiary}
                value={formData.dateOfBirth}
                onChangeText={text => updateField('dateOfBirth', text)}
              />
            </View>

            <View style={[styles.inputGroup, styles.halfWidth]}>
              <BodyText style={styles.label} color={COLORS.text.secondary} size="sm">
                Gender
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
          <H3 style={styles.sectionTitle} color={COLORS.text.primary} weight="bold" size="md">
            Contact Information
          </H3>

          <View style={styles.inputGroup}>
            <BodyText style={styles.label} color={COLORS.text.secondary} size="sm">
              Phone Number <Text style={styles.required}>*</Text>
            </BodyText>
            <TextInput
              style={styles.input}
              placeholder="10-digit mobile number"
              placeholderTextColor={COLORS.text.tertiary}
              value={formData.phone}
              onChangeText={text => updateField('phone', text)}
              keyboardType="phone-pad"
              maxLength={10}
            />
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
          <H3 style={styles.sectionTitle} color={COLORS.text.primary} weight="bold" size="md">
            Address Information
          </H3>

          <View style={styles.inputGroup}>
            <BodyText style={styles.label} color={COLORS.text.secondary} size="sm">
              Address
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
                City
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
                State
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
              Pincode
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

        {/* Generate Button */}
        <TouchableOpacity
          style={styles.generateButton}
          onPress={handleGenerateCard}
          activeOpacity={0.8}
        >
          <BodyText style={styles.generateButtonText} color={COLORS.white} size="md" weight="bold">
            Generate Card
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
  generateButtonText: {
    fontFamily: FONTS.gilroy.bold,
    fontSize: FONT_SIZES.md,
  },
  bottomSpacing: {
    height: 20,
  },
});

export default TirthMitraGeneratorScreen;

