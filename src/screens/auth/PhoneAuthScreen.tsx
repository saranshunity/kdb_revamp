import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  Image,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  H1,
  H2,
  BodyText,
  ButtonTextPrimary,
  ButtonTextSecondary,
  ErrorText,
} from '../../components/Text';
import { COLORS } from '../../constants/colors';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { auth } from '../../firebaseConfig';

interface PhoneAuthScreenProps {
  navigation: any;
}

const PhoneAuthScreen: React.FC<PhoneAuthScreenProps> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [errors, setErrors] = useState<{ phoneNumber?: string }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [debugMode, setDebugMode] = useState(__DEV__); // Enable debug mode in development

  const validatePhoneNumber = () => {
    const newErrors: { phoneNumber?: string } = {};

    if (!phoneNumber.trim()) {
      newErrors.phoneNumber = 'Phone number is required';
    } else if (!/^\d{10}$/.test(phoneNumber.replace(/\D/g, ''))) {
      newErrors.phoneNumber = 'Please enter a valid 10-digit phone number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSendOTP = async () => {
    if (!validatePhoneNumber()) {
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      const fullPhoneNumber = `+91${phoneNumber}`;
      
      // Send OTP using Firebase Auth
      const confirmation = await auth().signInWithPhoneNumber(fullPhoneNumber);
      
      console.log('OTP sent successfully to:', fullPhoneNumber);
      console.log('Confirmation object:', confirmation);
      console.log('Confirmation verificationId:', confirmation.verificationId);
      console.log('Firebase Auth current user:', auth().currentUser);
      
      // Only navigate if we get a valid confirmation
      if (confirmation) {
        // Show success message
        Alert.alert(
          'OTP Sent!', 
          `Verification code has been sent to ${fullPhoneNumber}. Please check your SMS.`,
          [
            {
              text: 'OK',
              onPress: () => {
                // Navigate to OTP verification screen with confirmation
                navigation.navigate('OTPVerification', { 
                  phoneNumber: fullPhoneNumber,
                  confirmation: confirmation
                });
              }
            }
          ]
        );
      } else {
        throw new Error('No confirmation received from Firebase');
      }
    } catch (error: any) {
      console.error('Error sending OTP:', error);
      
      let errorMessage = 'Failed to send OTP. Please try again.';
      
      if (error.code === 'auth/invalid-phone-number') {
        errorMessage = 'Invalid phone number format.';
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Too many requests. Please try again later.';
      } else if (error.code === 'auth/network-request-failed') {
        errorMessage = 'Network error. Please check your connection.';
      } else if (error.code === 'auth/missing-phone-number') {
        errorMessage = 'Phone number is required.';
      } else if (error.code === 'auth/quota-exceeded') {
        errorMessage = 'SMS quota exceeded. Please try again later.';
      }
      
      Alert.alert('Error', errorMessage);
      setErrors({ phoneNumber: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };


  const handleRegister = () => {
    navigation.navigate('Register');
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { paddingTop: insets.top }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar barStyle='dark-content' backgroundColor={COLORS.background.primary} />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps='handled'
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color={COLORS.text.primary} />
          </TouchableOpacity>
        </View>

        {/* Content */}
        <View style={styles.content}>
          {/* Logo/Title */}
          <View style={styles.logoContainer}>
            <Image
              source={require('../../assets/images/appLogo.png')}
              style={styles.logoImage}
              resizeMode="contain"
            />
            <H2
              color={COLORS.secondary}
              weight='medium'
              size='xl'
              style={styles.subtitle}
            >
              Enter Phone Number
            </H2>
            <BodyText
              color={COLORS.tertiary}
              size='md'
              style={styles.description}
            >
              We'll send you a verification code
            </BodyText>
          </View>

          {/* Form */}
          <View style={styles.form}>
            {/* Phone Number Input */}
            <View style={styles.inputContainer}>
              <BodyText
                color={COLORS.primary}
                weight='medium'
                size='sm'
                style={styles.label}
              >
                Phone Number
              </BodyText>
              <View style={styles.phoneInputContainer}>
                <View style={styles.countryCode}>
                  <BodyText color={COLORS.text.primary} size='md'>
                    +91
                  </BodyText>
                </View>
                <TextInput
                  style={[styles.phoneInput, errors.phoneNumber && styles.inputError]}
                  placeholder='9876543210'
                  placeholderTextColor={COLORS.tertiary}
                  value={phoneNumber}
                  onChangeText={setPhoneNumber}
                  keyboardType='phone-pad'
                  maxLength={10}
                />
              </View>
              {errors.phoneNumber && <ErrorText size='sm'>{errors.phoneNumber}</ErrorText>}
            </View>

            {/* Debug Mode - Only show in development */}
            {debugMode && (
              <View style={styles.debugContainer}>
                <BodyText color={COLORS.tertiary} size='xs' style={styles.debugTitle}>
                  Debug Mode (Development Only)
                </BodyText>
                <TouchableOpacity
                  style={styles.debugButton}
                  onPress={() => {
                    setPhoneNumber('9876543210'); // Test phone number
                    Alert.alert('Debug', 'Test phone number set: 9876543210');
                  }}
                >
                  <BodyText color={COLORS.primary} size='xs'>
                    Use Test Phone: 9876543210
                  </BodyText>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.debugButton}
                  onPress={() => {
                    Alert.alert(
                      'Firebase Status',
                      `Firebase Auth Ready: ${auth().app.name}\nCurrent User: ${auth().currentUser ? 'Logged In' : 'Not Logged In'}`
                    );
                  }}
                >
                  <BodyText color={COLORS.primary} size='xs'>
                    Check Firebase Status
                  </BodyText>
                </TouchableOpacity>
              </View>
            )}

            {/* Send OTP Button */}
            <TouchableOpacity
              style={[styles.sendOTPButton, isLoading && styles.sendOTPButtonDisabled]}
              onPress={handleSendOTP}
              activeOpacity={0.8}
              disabled={isLoading}
            >
              <ButtonTextPrimary size='lg'>
                {isLoading ? 'Sending OTP...' : 'Send OTP'}
              </ButtonTextPrimary>
            </TouchableOpacity>


            {/* Register Link */}
            <View style={styles.registerContainer}>
              <BodyText color={COLORS.tertiary} size='sm'>
                Don't have an account?{' '}
              </BodyText>
              <TouchableOpacity onPress={handleRegister}>
                <BodyText color={COLORS.primary} weight='semiBold' size='sm'>
                  Register
                </BodyText>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background.primary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 48,
  },
  logoImage: {
    width: 120,
    height: 120,
    marginBottom: 16,
  },
  subtitle: {
    marginTop: 8,
    marginBottom: 8,
  },
  description: {
    textAlign: 'center',
    opacity: 0.8,
  },
  form: {
    width: '100%',
  },
  inputContainer: {
    marginBottom: 24,
  },
  label: {
    marginBottom: 8,
  },
  phoneInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background.secondary,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border.light,
    overflow: 'hidden',
  },
  countryCode: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: COLORS.background.tertiary,
    borderRightWidth: 1,
    borderRightColor: COLORS.border.light,
  },
  phoneInput: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 16,
    color: COLORS.text.primary,
  },
  inputError: {
    borderColor: COLORS.error,
  },
  sendOTPButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sendOTPButtonDisabled: {
    opacity: 0.6,
    shadowOpacity: 0.05,
    elevation: 1,
  },
  debugContainer: {
    marginBottom: 20,
    padding: 12,
    backgroundColor: COLORS.background.tertiary,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border.light,
  },
  debugTitle: {
    marginBottom: 8,
    fontWeight: 'bold',
  },
  debugButton: {
    paddingVertical: 6,
    paddingHorizontal: 8,
    backgroundColor: COLORS.background.secondary,
    borderRadius: 6,
    marginBottom: 6,
    alignItems: 'center',
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
  },
});

export default PhoneAuthScreen;
