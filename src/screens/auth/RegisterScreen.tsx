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

interface RegisterScreenProps {
  navigation: any;
}

const RegisterScreen: React.FC<RegisterScreenProps> = ({ navigation }) => {
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

    if (!formData.password.trim()) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    if (!formData.confirmPassword.trim()) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = () => {
    if (validateForm()) {
      // TODO: Implement actual registration logic
      console.log('Registration attempt:', formData);
      // For now, navigate to main app
      navigation.navigate('Main');
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
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <BodyText size='lg'>←</BodyText>
          </TouchableOpacity>
        </View>

        {/* Content */}
        <View style={styles.content}>
          {/* Logo/Title */}
          <View style={styles.logoContainer}>
            <H1 color={COLORS.primary} weight='bold' size='3xl'>
              KDB
            </H1>
            <H2
              color={COLORS.secondary}
              weight='medium'
              size='xl'
              style={styles.subtitle}
            >
              Create Account
            </H2>
            <BodyText
              color={COLORS.tertiary}
              size='md'
              style={styles.description}
            >
              Join KDB and start your financial journey
            </BodyText>
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

            {/* Password Input */}
            <View style={styles.inputContainer}>
              <BodyText
                color={COLORS.primary}
                weight='medium'
                size='sm'
                style={styles.label}
              >
                Password
              </BodyText>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={[
                    styles.input,
                    styles.passwordInput,
                    errors.password && styles.inputError,
                  ]}
                  placeholder='Create a strong password'
                  placeholderTextColor={COLORS.tertiary}
                  value={formData.password}
                  onChangeText={value => updateFormData('password', value)}
                  secureTextEntry={!showPassword}
                  autoCapitalize='none'
                />
                <TouchableOpacity
                  style={styles.eyeButton}
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <BodyText color={COLORS.tertiary} size='md'>
                    {showPassword ? '👁️' : '👁️‍🗨️'}
                  </BodyText>
                </TouchableOpacity>
              </View>
              {errors.password && (
                <ErrorText size='sm'>{errors.password}</ErrorText>
              )}
            </View>

            {/* Confirm Password Input */}
            <View style={styles.inputContainer}>
              <BodyText
                color={COLORS.primary}
                weight='medium'
                size='sm'
                style={styles.label}
              >
                Confirm Password
              </BodyText>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={[
                    styles.input,
                    styles.passwordInput,
                    errors.confirmPassword && styles.inputError,
                  ]}
                  placeholder='Confirm your password'
                  placeholderTextColor={COLORS.tertiary}
                  value={formData.confirmPassword}
                  onChangeText={value =>
                    updateFormData('confirmPassword', value)
                  }
                  secureTextEntry={!showConfirmPassword}
                  autoCapitalize='none'
                />
                <TouchableOpacity
                  style={styles.eyeButton}
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  <BodyText color={COLORS.tertiary} size='md'>
                    {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
                  </BodyText>
                </TouchableOpacity>
              </View>
              {errors.confirmPassword && (
                <ErrorText size='sm'>{errors.confirmPassword}</ErrorText>
              )}
            </View>

            {/* Register Button */}
            <TouchableOpacity
              style={styles.registerButton}
              onPress={handleRegister}
            >
              <ButtonTextPrimary size='lg'>Create Account</ButtonTextPrimary>
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
