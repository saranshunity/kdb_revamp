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
import { Image, Alert } from 'react-native';
import { auth } from '../../firebaseConfig';
import firestore from '@react-native-firebase/firestore';
import { useAuth } from '../../contexts/AuthContext';

interface RegisterScreenProps {
  navigation: any;
  route?: any;
}

const RegisterScreen: React.FC<RegisterScreenProps> = ({ navigation, route }) => {
  const insets = useSafeAreaInsets();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();
  // Prefill phone if passed from Login
  React.useEffect(() => {
    const prefill = route?.params?.prefillPhone as string | undefined;
    if (prefill && /^\d{10}$/.test(prefill)) {
      setFormData(prev => ({ ...prev, phone: prefill }));
    }
  }, [route]);

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^\d{10}$/.test(formData.phone.replace(/\D/g, ''))) {
      newErrors.phone = 'Please enter a valid 10-digit phone number';
    }

    // No password checks in phone-OTP registration

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;

    try {
      setIsSubmitting(true);
      const phoneDigits = formData.phone.replace(/\D/g, '');
      const fullPhone = `+91${phoneDigits}`;

      // Send OTP using Firebase phone auth
      const confirmation = await auth().signInWithPhoneNumber(fullPhone);

      // Navigate to OTP screen with profile info to merge on success
      navigation.navigate('OTPVerification', {
        phoneNumber: fullPhone,
        confirmation,
        profile: {
          firstName: formData.firstName.trim(),
          lastName: formData.lastName.trim(),
          email: formData.email.trim(),
        },
      } as any);
    } catch (error: any) {
      console.error('Registration OTP error:', error);
      let message = 'Failed to send OTP. Please try again.';
      if (error.code === 'auth/invalid-phone-number') message = 'Invalid phone number format.';
      if (error.code === 'auth/too-many-requests') message = 'Too many requests. Try later.';
      if (error.code === 'auth/network-request-failed') message = 'Network error. Check connection.';
      Alert.alert('Error', message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogin = () => {
    navigation.navigate('Login');
  };

  const updateFormData = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
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
        {/* Header with Back + Compact Logo + Subtitle */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <BodyText size='lg'>←</BodyText>
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Image
              source={require('../../assets/images/appLogo.png')}
              style={styles.headerLogo}
              resizeMode="contain"
            />
            <BodyText color={COLORS.text.primary} size='sm' weight='semiBold'>
              Create Account
            </BodyText>
          </View>
          <View style={{ width: 24 }} />
        </View>

        {/* Content */}
        <View style={styles.content}>
          {/* Logo/Title */}
          <View style={styles.logoContainer}>
           
            
          </View>

          {/* Form */}
          <View style={styles.form}>
            {/* Name Fields */}
            <View style={styles.row}>
              <View style={[styles.inputContainer, styles.halfWidth]}>
                <BodyText
                  color={COLORS.primary}
                  weight='medium'
                  size='sm'
                  style={styles.label}
                >
                  First Name
                </BodyText>
                <TextInput
                  style={[styles.input, errors.firstName && styles.inputError]}
                  placeholder='John'
                  placeholderTextColor={COLORS.tertiary}
                  value={formData.firstName}
                  onChangeText={value => updateFormData('firstName', value)}
                  autoCapitalize='words'
                />
                {errors.firstName && (
                  <ErrorText size='sm'>{errors.firstName}</ErrorText>
                )}
              </View>

              <View style={[styles.inputContainer, styles.halfWidth]}>
                <BodyText
                  color={COLORS.primary}
                  weight='medium'
                  size='sm'
                  style={styles.label}
                >
                  Last Name
                </BodyText>
                <TextInput
                  style={[styles.input, errors.lastName && styles.inputError]}
                  placeholder='Doe'
                  placeholderTextColor={COLORS.tertiary}
                  value={formData.lastName}
                  onChangeText={value => updateFormData('lastName', value)}
                  autoCapitalize='words'
                />
                {errors.lastName && (
                  <ErrorText size='sm'>{errors.lastName}</ErrorText>
                )}
              </View>
            </View>

            {/* Email Input */}
            <View style={styles.inputContainer}>
              <BodyText
                color={COLORS.primary}
                weight='medium'
                size='sm'
                style={styles.label}
              >
                Email Address
              </BodyText>
              <TextInput
                style={[styles.input, errors.email && styles.inputError]}
                placeholder='john.doe@example.com'
                placeholderTextColor={COLORS.tertiary}
                value={formData.email}
                onChangeText={value => updateFormData('email', value)}
                keyboardType='email-address'
                autoCapitalize='none'
                autoCorrect={false}
              />
              {errors.email && <ErrorText size='sm'>{errors.email}</ErrorText>}
            </View>

            {/* Phone Input */}
            <View style={styles.inputContainer}>
              <BodyText
                color={COLORS.primary}
                weight='medium'
                size='sm'
                style={styles.label}
              >
                Phone Number
              </BodyText>
              <TextInput
                style={[styles.input, errors.phone && styles.inputError]}
                placeholder='1234567890'
                placeholderTextColor={COLORS.tertiary}
                value={formData.phone}
                onChangeText={value => updateFormData('phone', value)}
                keyboardType='phone-pad'
                maxLength={10}
              />
              {errors.phone && <ErrorText size='sm'>{errors.phone}</ErrorText>}
            </View>

            {/* Password fields removed for phone-OTP registration */}

            {/* Register Button */}
            <TouchableOpacity
              style={styles.registerButton}
              onPress={handleRegister}
              disabled={isSubmitting}
            >
              <ButtonTextPrimary size='lg'>{isSubmitting ? 'Creating...' : 'Create Account'}</ButtonTextPrimary>
            </TouchableOpacity>

            {/* Divider */}
            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <BodyText
                color={COLORS.tertiary}
                size='sm'
                style={styles.dividerText}
              >
                OR
              </BodyText>
              <View style={styles.dividerLine} />
            </View>

            {/* Login Button */}
            <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
              <ButtonTextSecondary size='lg'>
                Already have an account? Sign In
              </ButtonTextSecondary>
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
    backgroundColor: COLORS.background.primary
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
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  backButton: {
    padding: 8,
  },
  headerCenter: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  headerLogo: {
    width: 24,
    height: 24,
    marginRight: 8,
  },
  content: {
    flex: 1,
    paddingHorizontal: 32,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 32,
    marginTop: 16,
  },
  subtitle: {
    marginTop: 8,
  },
  description: {
    marginTop: 8,
    textAlign: 'center',
  },
  form: {
    flex: 1,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  inputContainer: {
    marginBottom: 20,
  },
  halfWidth: {
    width: '48%',
  },
  label: {
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border.light,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 16,
    color: COLORS.primary,
    backgroundColor: COLORS.background.primary
  },
  inputError: {
    borderColor: COLORS.error,
  },
  passwordContainer: {
    position: 'relative',
  },
  passwordInput: {
    paddingRight: 50,
  },
  eyeButton: {
    position: 'absolute',
    right: 16,
    top: 16,
    padding: 4,
  },
  registerButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 24,
    shadowColor: COLORS.primary,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.border.light
  },
  dividerText: {
    marginHorizontal: 16,
  },
  loginButton: {
    borderWidth: 1,
    borderColor: COLORS.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
});

export default RegisterScreen;
