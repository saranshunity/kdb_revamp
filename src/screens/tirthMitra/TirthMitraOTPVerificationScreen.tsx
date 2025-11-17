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
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { H2, H3, BodyText } from '../../components/Text';
import { COLORS } from '../../constants/colors';
import { FONTS, FONT_SIZES } from '../../constants/fonts';
import Ionicons from 'react-native-vector-icons/Ionicons';
import OTPService from '../../services/OTPService';

type TirthMitraOTPVerificationScreenRouteProp = RouteProp<RootStackParamList, 'TirthMitraOTPVerification'>;
type TirthMitraOTPVerificationScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'TirthMitraOTPVerification'
>;

const TirthMitraOTPVerificationScreen = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<TirthMitraOTPVerificationScreenNavigationProp>();
  const route = useRoute<TirthMitraOTPVerificationScreenRouteProp>();
  const { phoneNumber, onVerified } = route.params;

  const [otp, setOtp] = useState(['', '', '', '']); // 4-digit OTP
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
    // Only allow single digit
    if (value.length > 1) {
      return;
    }

    const newOtp = [...otp];
    newOtp[index] = value.replace(/[^0-9]/g, '');
    setOtp(newOtp);
    setErrors({});

    // Auto-focus next input (4-digit OTP, so index < 3)
    if (value && index < 3) {
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

    if (otpString.length !== 4) {
      newErrors.otp = 'Please enter the complete 4-digit OTP';
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

      // Verify OTP using OTPService
      const isValid = await OTPService.verifyOTP(phoneNumber, otpCode);

      if (isValid) {
        console.log('OTP verified successfully');

        // Call the callback if provided
        if (onVerified) {
          onVerified();
        }

        // Navigate back to generator screen
        navigation.goBack();
        Alert.alert('Success', 'Phone number verified successfully!');
      } else {
        setErrors({ otp: 'Invalid OTP code. Please check and try again.' });
      }
    } catch (error: any) {
      console.error('Error verifying OTP:', error);
      setErrors({ otp: 'Invalid OTP. Please try again.' });
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendOTP = async () => {
    setIsResending(true);
    setErrors({});

    try {
      // Generate new 4-digit OTP
      const newOtp = OTPService.generateOTP();
      console.log('Resending OTP:', newOtp);

      // Send OTP via SMS API
      const sent = await OTPService.sendOTP(phoneNumber, newOtp);

      if (sent) {
        console.log('OTP resent successfully to:', phoneNumber);
        
        // Reset countdown
        setCountdown(30);
        
        // Clear current OTP input
        setOtp(['', '', '', '']);
        
        Alert.alert('Success', 'OTP has been resent successfully!');
      } else {
        throw new Error('Failed to resend OTP');
      }
    } catch (error: any) {
      console.error('Error resending OTP:', error);
      
      let errorMessage = 'Failed to resend OTP. Please try again.';
      if (error.message?.includes('network') || error.message?.includes('Network')) {
        errorMessage = 'Network error. Please check your connection.';
      }
      
      Alert.alert('Error', errorMessage);
    } finally {
      setIsResending(false);
    }
  };

  const phoneDisplay = phoneNumber.replace(/^\+91/, '');

  return (
    <KeyboardAvoidingView
      style={[styles.container, { paddingTop: insets.top }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background.primary} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text.primary} />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <H2 style={styles.headerTitle} color={COLORS.text.primary} weight="semiBold" size="lg">
            Verify Phone Number
          </H2>
        </View>
        <View style={styles.backButton} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.content}>
          <View style={styles.iconContainer}>
            <View style={styles.iconCircle}>
              <Ionicons name="phone-portrait-outline" size={48} color={COLORS.background.appColor} />
            </View>
          </View>

          <H3 style={styles.title} color={COLORS.text.primary} weight="bold" size="lg">
            Enter Verification Code
          </H3>

          <BodyText style={styles.description} color={COLORS.text.secondary} size="sm">
            We've sent a 4-digit verification code to{'\n'}
            <BodyText style={styles.phoneNumber} color={COLORS.text.primary} size="sm" weight="semiBold">
              +91 {phoneDisplay}
            </BodyText>
          </BodyText>

          {/* OTP Input Fields */}
          <View style={styles.otpContainer}>
            {otp.map((digit, index) => (
              <TextInput
                key={index}
                ref={ref => {
                  if (ref) {
                    inputRefs.current[index] = ref;
                  }
                }}
                style={[
                  styles.otpInput,
                  otp[index] && styles.otpInputFilled,
                  errors.otp && styles.otpInputError,
                ]}
                value={digit}
                onChangeText={value => handleOtpChange(value, index)}
                onKeyPress={({ nativeEvent }) => handleKeyPress(nativeEvent.key, index)}
                keyboardType="number-pad"
                maxLength={1}
                selectTextOnFocus
                autoFocus={index === 0}
              />
            ))}
          </View>

          {errors.otp && (
            <BodyText style={styles.errorText} color={COLORS.error} size="xs">
              {errors.otp}
            </BodyText>
          )}

          {/* Verify Button */}
          <TouchableOpacity
            style={[styles.verifyButton, isVerifying && styles.verifyButtonDisabled]}
            onPress={handleVerifyOTP}
            disabled={isVerifying}
            activeOpacity={0.8}
          >
            {isVerifying ? (
              <>
                <ActivityIndicator size="small" color={COLORS.white} />
                <BodyText style={styles.verifyButtonText} color={COLORS.white} size="md" weight="semiBold">
                  Verifying...
                </BodyText>
              </>
            ) : (
              <BodyText style={styles.verifyButtonText} color={COLORS.white} size="md" weight="semiBold">
                Verify & Continue
              </BodyText>
            )}
          </TouchableOpacity>

          {/* Resend OTP */}
          <View style={styles.resendContainer}>
            <BodyText style={styles.resendText} color={COLORS.text.secondary} size="sm">
              Didn't receive the code?{' '}
            </BodyText>
            {countdown > 0 ? (
              <BodyText style={styles.countdownText} color={COLORS.text.secondary} size="sm" weight="semiBold">
                Resend in {countdown}s
              </BodyText>
            ) : (
              <TouchableOpacity
                onPress={handleResendOTP}
                disabled={isResending}
                style={styles.resendButton}
              >
                <BodyText style={styles.resendButtonText} color={COLORS.background.appColor} size="sm" weight="semiBold">
                  {isResending ? 'Sending...' : 'Resend OTP'}
                </BodyText>
              </TouchableOpacity>
            )}
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
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 20,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  iconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.background.appColor + '15',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontFamily: FONTS.gilroy.bold,
    fontSize: FONT_SIZES.lg,
    textAlign: 'center',
    marginBottom: 12,
  },
  description: {
    fontFamily: FONTS.gilroy.regular,
    fontSize: FONT_SIZES.sm,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 20,
  },
  phoneNumber: {
    fontFamily: FONTS.gilroy.semiBold,
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    gap: 12,
  },
  otpInput: {
    flex: 1,
    height: 56,
    borderWidth: 2,
    borderColor: COLORS.border.light,
    borderRadius: 12,
    fontSize: FONT_SIZES.xl,
    fontFamily: FONTS.gilroy.bold,
    color: COLORS.text.primary,
    textAlign: 'center',
    backgroundColor: COLORS.white,
  },
  otpInputFilled: {
    borderColor: COLORS.background.appColor,
    backgroundColor: COLORS.background.appColor + '10',
  },
  otpInputError: {
    borderColor: COLORS.error,
  },
  errorText: {
    fontFamily: FONTS.gilroy.medium,
    fontSize: FONT_SIZES.xs,
    textAlign: 'center',
    marginBottom: 16,
  },
  verifyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.background.appColor,
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 8,
    gap: 8,
  },
  verifyButtonDisabled: {
    opacity: 0.6,
  },
  verifyButtonText: {
    fontFamily: FONTS.gilroy.bold,
    fontSize: FONT_SIZES.md,
  },
  resendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
    flexWrap: 'wrap',
  },
  resendText: {
    fontFamily: FONTS.gilroy.regular,
    fontSize: FONT_SIZES.sm,
  },
  countdownText: {
    fontFamily: FONTS.gilroy.semiBold,
    fontSize: FONT_SIZES.sm,
  },
  resendButton: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  resendButtonText: {
    fontFamily: FONTS.gilroy.semiBold,
    fontSize: FONT_SIZES.sm,
  },
});

export default TirthMitraOTPVerificationScreen;

