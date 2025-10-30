import React, { useState, useRef, useEffect } from 'react';
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
import { useAuth } from '../../contexts/AuthContext';
import firestore from '@react-native-firebase/firestore';

interface OTPVerificationScreenProps {
  navigation: any;
  route: {
    params: {
      phoneNumber: string;
      confirmation: any;
      profile?: {
        firstName?: string;
        lastName?: string;
        email?: string;
      };
    };
  };
}

const OTPVerificationScreen: React.FC<OTPVerificationScreenProps> = ({ navigation, route }) => {
  const insets = useSafeAreaInsets();
  const { login } = useAuth();
  const { phoneNumber, confirmation, profile } = route.params;
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [errors, setErrors] = useState<{ otp?: string }>({});
  const [isResending, setIsResending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [countdown, setCountdown] = useState(30);
  const inputRefs = useRef<TextInput[]>([]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleOtpChange = (value: string, index: number) => {
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (key: string, index: number) => {
    if (key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const validateOTP = () => {
    const newErrors: { otp?: string } = {};
    const otpString = otp.join('');

    if (otpString.length !== 6) {
      newErrors.otp = 'Please enter the complete 6-digit OTP';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleVerifyOTP = async () => {
    if (!validateOTP()) {
      return;
    }

    setIsVerifying(true);
    setErrors({});

    try {
      const otpCode = otp.join('');
      
      // Verify OTP using Firebase Auth
      const result = await confirmation.confirm(otpCode);
      
      console.log('OTP verified successfully:', result);
      
      // Ensure a user profile exists in Firestore
      const uid = result.user.uid;
      const userRef = firestore().collection('users').doc(uid);
      const snap = await userRef.get();
      const baseDoc = snap.exists ? snap.data() || {} : {};
      await userRef.set({
        uid,
        phone: phoneNumber,
        email: (profile?.email || result.user.email) || (baseDoc.email || ''),
        firstName: profile?.firstName ?? baseDoc.firstName ?? '',
        lastName: profile?.lastName ?? baseDoc.lastName ?? '',
        reminders: baseDoc.reminders || [],
        createdAt: baseDoc.createdAt || firestore.FieldValue.serverTimestamp(),
      }, { merge: true });

      // Create user data for authentication
      const userData = {
        id: uid,
        email: result.user.email || '',
        name: result.user.displayName || phoneNumber,
        phoneNumber: phoneNumber,
      };
      
      // Login using auth context
      await login(userData);
      
      // Fallback navigation in case the auth listener doesn't work
      setTimeout(() => {
        navigation.reset({
          index: 0,
          routes: [{ name: 'Main' }],
        });
      }, 1000);
    } catch (error: any) {
      console.error('Error verifying OTP:', error);
      
      let errorMessage = 'Invalid OTP. Please try again.';
      
      if (error.code === 'auth/invalid-verification-code') {
        errorMessage = 'Invalid OTP code. Please check and try again.';
      } else if (error.code === 'auth/code-expired') {
        errorMessage = 'OTP has expired. Please request a new one.';
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Too many attempts. Please try again later.';
      }
      
      setErrors({ otp: errorMessage });
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendOTP = async () => {
    setIsResending(true);
    setErrors({});

    try {
      // Resend OTP using Firebase Auth
      const newConfirmation = await auth().signInWithPhoneNumber(phoneNumber);
      
      console.log('OTP resent successfully to:', phoneNumber);
      
      // Update the confirmation object
      route.params.confirmation = newConfirmation;
      
      // Reset countdown
      setCountdown(30);
      
      Alert.alert('Success', 'OTP has been resent successfully!');
    } catch (error: any) {
      console.error('Error resending OTP:', error);
      
      let errorMessage = 'Failed to resend OTP. Please try again.';
      
      if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Too many requests. Please try again later.';
      } else if (error.code === 'auth/network-request-failed') {
        errorMessage = 'Network error. Please check your connection.';
      }
      
      Alert.alert('Error', errorMessage);
    } finally {
      setIsResending(false);
    }
  };

  const handleBackToPhone = () => {
    navigation.goBack();
  };


  const maskedPhoneNumber = phoneNumber.replace(/(\d{3})\d{4}(\d{3})/, '$1****$2');

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
            onPress={handleBackToPhone}
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
              Verify OTP
            </H2>
            <BodyText
              color={COLORS.tertiary}
              size='md'
              style={styles.description}
            >
              Enter the 6-digit code sent to{'\n'} {maskedPhoneNumber}
            </BodyText>
          </View>

          {/* Form */}
          <View style={styles.form}>
            {/* OTP Input */}
            <View style={styles.otpContainer}>
              {otp.map((digit, index) => (
                <TextInput
                  key={index}
                  ref={ref => {
                    if (ref) inputRefs.current[index] = ref;
                  }}
                  style={[
                    styles.otpInput,
                    errors.otp && styles.inputError,
                    digit && styles.otpInputFilled
                  ]}
                  value={digit}
                  onChangeText={value => handleOtpChange(value, index)}
                  onKeyPress={({ nativeEvent }) => handleKeyPress(nativeEvent.key, index)}
                  keyboardType='number-pad'
                  maxLength={1}
                  selectTextOnFocus
                />
              ))}
            </View>
            {errors.otp && <ErrorText size='sm' style={styles.errorText}>{errors.otp}</ErrorText>}

            {/* Resend OTP */}
            <View style={styles.resendContainer}>
              {countdown > 0 ? (
                <BodyText color={COLORS.tertiary} size='sm'>
                  Resend OTP in {countdown}s
                </BodyText>
              ) : (
                <TouchableOpacity onPress={handleResendOTP} disabled={isResending}>
                  <BodyText color={COLORS.primary} weight='semiBold' size='sm'>
                    {isResending ? 'Sending...' : 'Resend OTP'}
                  </BodyText>
                </TouchableOpacity>
              )}
            </View>

            {/* Verify Button */}
            <TouchableOpacity
              style={[styles.verifyButton, isVerifying && styles.verifyButtonDisabled]}
              onPress={handleVerifyOTP}
              activeOpacity={0.8}
              disabled={isVerifying}
            >
              <ButtonTextPrimary size='lg'>
                {isVerifying ? 'Verifying...' : 'Verify OTP'}
              </ButtonTextPrimary>
            </TouchableOpacity>

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
    lineHeight: 22,
  },
  form: {
    width: '100%',
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  otpInput: {
    width: 45,
    height: 55,
    borderWidth: 2,
    borderColor: COLORS.border.light,
    borderRadius: 12,
    textAlign: 'center',
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text.primary,
    backgroundColor: COLORS.background.secondary,
  },
  otpInputFilled: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.background.primary,
  },
  inputError: {
    borderColor: COLORS.error,
  },
  errorText: {
    textAlign: 'center',
    marginBottom: 16,
  },
  resendContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  verifyButton: {
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
  verifyButtonDisabled: {
    opacity: 0.6,
    shadowOpacity: 0.05,
    elevation: 1,
  },
});

export default OTPVerificationScreen;
