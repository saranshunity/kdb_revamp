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

interface ForgotPasswordScreenProps {
  navigation: any;
}

const ForgotPasswordScreen: React.FC<ForgotPasswordScreenProps> = ({
  navigation,
}) => {
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState('');
  const [isEmailSent, setIsEmailSent] = useState(false);
  const [errors, setErrors] = useState<{ email?: string }>({});

  const validateEmail = () => {
    const newErrors: { email?: string } = {};

    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSendResetEmail = () => {
    if (validateEmail()) {
      // TODO: Implement actual password reset logic
      console.log('Password reset email sent to:', email);
      setIsEmailSent(true);
    }
  };

  const handleBackToLogin = () => {
    navigation.navigate('Login');
  };

  const handleResendEmail = () => {
    // TODO: Implement resend logic
    console.log('Resending password reset email to:', email);
  };

  if (isEmailSent) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <StatusBar
          barStyle='dark-content'
          backgroundColor={COLORS.background.primary}
        />

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
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

          {/* Success Content */}
          <View style={styles.content}>
            <View style={styles.iconContainer}>
              <View style={styles.successIcon}>
                <BodyText size='4xl'>📧</BodyText>
              </View>
            </View>

            <View style={styles.textContainer}>
              <H1
                color={COLORS.primary}
                weight='bold'
                size='2xl'
                style={styles.title}
              >
                Check Your Email
              </H1>
              <BodyText
                color={COLORS.secondary}
                size='lg'
                style={styles.description}
              >
                We've sent a password reset link to
              </BodyText>
              <BodyText
                color={COLORS.primary}
                weight='medium'
                size='lg'
                style={styles.email}
              >
                {email}
              </BodyText>
              <BodyText
                color={COLORS.secondary}
                size='md'
                style={styles.instruction}
              >
                Please check your email and follow the instructions to reset
                your password.
              </BodyText>
            </View>

            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={styles.resendButton}
                onPress={handleResendEmail}
              >
                <ButtonTextSecondary size='lg'>
                  Resend Email
                </ButtonTextSecondary>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.backToLoginButton}
                onPress={handleBackToLogin}
              >
                <ButtonTextPrimary size='lg'>Back to Sign In</ButtonTextPrimary>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </View>
    );
  }

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
              Forgot Password?
            </H2>
            <BodyText
              color={COLORS.tertiary}
              size='md'
              style={styles.description}
            >
              Don't worry! Enter your email address and we'll send you a link to
              reset your password.
            </BodyText>
          </View>

          {/* Form */}
          <View style={styles.form}>
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
                placeholder='Enter your email address'
                placeholderTextColor={COLORS.tertiary}
                value={email}
                onChangeText={setEmail}
                keyboardType='email-address'
                autoCapitalize='none'
                autoCorrect={false}
                autoFocus
              />
              {errors.email && <ErrorText size='sm'>{errors.email}</ErrorText>}
            </View>

            {/* Send Button */}
            <TouchableOpacity
              style={styles.sendButton}
              onPress={handleSendResetEmail}
            >
              <ButtonTextPrimary size='lg'>Send Reset Link</ButtonTextPrimary>
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

            {/* Back to Login Button */}
            <TouchableOpacity
              style={styles.backToLoginButton}
              onPress={handleBackToLogin}
            >
              <ButtonTextSecondary size='lg'>
                Back to Sign In
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
    marginBottom: 48,
    marginTop: 32,
  },
  subtitle: {
    marginTop: 8,
  },
  description: {
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 22,
  },
  form: {
    flex: 1,
  },
  inputContainer: {
    marginBottom: 32,
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
  sendButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
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
  backToLoginButton: {
    borderWidth: 1,
    borderColor: COLORS.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  // Success screen styles
  iconContainer: {
    alignItems: 'center',
    marginBottom: 32,
    marginTop: 32,
  },
  successIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.success + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: 48,
  },
  title: {
    textAlign: 'center',
    marginBottom: 16,
  },
  email: {
    textAlign: 'center',
    marginVertical: 8,
  },
  instruction: {
    textAlign: 'center',
    lineHeight: 22,
    marginTop: 16,
  },
  buttonContainer: {
    width: '100%',
  },
  resendButton: {
    borderWidth: 1,
    borderColor: COLORS.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
});

export default ForgotPasswordScreen;
