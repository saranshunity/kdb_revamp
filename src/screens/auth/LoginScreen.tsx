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
import { useAuth } from '../../contexts/AuthContext';
import { Image } from 'react-native';
import { auth } from '../../firebaseConfig';
import firestore from '@react-native-firebase/firestore';

interface LoginScreenProps {
  navigation: any;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { login } = useAuth();
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ phone?: string; password?: string }>(
    {},
  );
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [showOtpSection, setShowOtpSection] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);

  const validateForm = () => {
    const newErrors: { phone?: string; password?: string } = {};

    const digits = phone.replace(/\D/g, '');
    if (!digits) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^\d{10}$/.test(digits)) {
      newErrors.phone = 'Please enter a valid 10-digit phone number';
    }

    if (!password.trim()) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validateForm()) return;
    try {
      setIsSigningIn(true);
      const digits = phone.replace(/\D/g, '');
      const syntheticEmail = `${digits}@kdb.app`;
      const cred = await auth().signInWithEmailAndPassword(syntheticEmail, password);

      // Fetch profile
      const doc = await firestore().collection('users').doc(cred.user.uid).get();
      if (!doc.exists) {
        // No profile found; sign out and redirect to Register
        await auth().signOut();
        Alert.alert('Complete Registration', 'We could not find your profile. Please register to continue.');
        navigation.navigate('Register', { prefillPhone: digits } as any);
        return;
      }
      const data = doc.data() || {} as any;

      await login({
        id: cred.user.uid,
        email: (data.email as string) || '',
        name: `${(data.firstName as string) || ''} ${(data.lastName as string) || ''}`.trim() || digits,
        phoneNumber: (data.phone as string) || `+91${digits}`,
      });

      navigation.reset({ index: 0, routes: [{ name: 'Main' }] });
    } catch (error: any) {
      console.error('Login error:', error);
      let message = 'Incorrect phone or password.';
      if (error.code === 'auth/user-not-found') message = 'Account not found. Please register.';
      if (error.code === 'auth/wrong-password') message = 'Incorrect password.';
      Alert.alert('Sign In Failed', message);
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleRegister = () => {
    navigation.navigate('Register');
  };

  const handleForgotPassword = () => {
    navigation.navigate('ForgotPassword');
  };

  const handleSkip = () => {
    // Navigate directly to Main (Home Screen) and reset navigation stack
    navigation.getParent()?.reset({
      index: 0,
      routes: [{ name: 'Main' }],
    });
  };

  const validatePhoneForOtp = () => {
    const digits = phone.replace(/\D/g, '');
    if (!/^\d{10}$/.test(digits)) {
      setErrors(prev => ({ ...prev, phone: 'Please enter a valid 10-digit phone number' }));
      return null;
    }
    return `+91${digits}`;
  };

  const handleSendOtp = async () => {
    const fullPhone = validatePhoneForOtp();
    if (!fullPhone) return;
    try {
      setIsSendingOtp(true);
      // Check Firestore for existing user with this phone before sending OTP
      const existing = await firestore()
        .collection('users')
        .where('phone', '==', fullPhone)
        .limit(1)
        .get();

      if (existing.empty) {
        Alert.alert('Not Registered', 'Please register to continue.');
        const digits = phone.replace(/\D/g, '');
        navigation.navigate('Register', { prefillPhone: digits } as any);
        return;
      }

      const confirmation = await auth().signInWithPhoneNumber(fullPhone);
      navigation.navigate('OTPVerification', { phoneNumber: fullPhone, confirmation });
    } catch (error: any) {
      console.error('Error sending OTP:', error);
      let errorMessage = 'Failed to send OTP. Please try again.';
      if (error.code === 'auth/invalid-phone-number') errorMessage = 'Invalid phone number format.';
      if (error.code === 'auth/too-many-requests') errorMessage = 'Too many requests. Try later.';
      if (error.code === 'auth/network-request-failed') errorMessage = 'Network error. Check connection.';
      Alert.alert('Error', errorMessage);
    } finally {
      setIsSendingOtp(false);
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
              Sign in to your account
            </BodyText>
          </View>
          <View style={{ width: 24 }} />
        </View>

        {/* Content */}
        <View style={styles.content}>
       
          <View style={styles.form}>
         
          
              <View>
                <View style={styles.inputContainer}>
                  <BodyText
                    color={COLORS.primary}
                    weight='medium'
                    size='sm'
                    style={styles.label}
                  >
                    Enter Phone Number
                  </BodyText>
                  <TextInput
                    style={[styles.input, errors.phone && styles.inputError]}
                    placeholder='Enter your phone number'
                    placeholderTextColor={COLORS.tertiary}
                    value={phone}
                    onChangeText={setPhone}
                    keyboardType='phone-pad'
                    autoCapitalize='none'
                    autoCorrect={false}
                  />
                  {errors.phone && <ErrorText size='sm'>{errors.phone}</ErrorText>}
                </View>
                <TouchableOpacity style={styles.loginButton} onPress={handleSendOtp} disabled={isSendingOtp}>
                  <ButtonTextPrimary size='lg'>{isSendingOtp ? 'Sending OTP...' : 'Send OTP'}</ButtonTextPrimary>
                </TouchableOpacity>
                <View style={styles.inlineRegisterRow}>
                  <BodyText color={COLORS.tertiary} size='sm'>
                    Don't have an account?{' '}
                  </BodyText>
                  <TouchableOpacity onPress={handleRegister}>
                    <BodyText color={COLORS.primary} weight='semiBold' size='sm'>
                      Register
                    </BodyText>
                  </TouchableOpacity>
                </View>
                <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
                  <BodyText color={COLORS.text.secondary} size='sm' weight='medium'>
                    Skip for now
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
    marginBottom: 24,
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
  inputContainer: {
    marginBottom: 24,
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
  forgotPasswordButton: {
    alignSelf: 'flex-end',
    marginBottom: 32,
  },
  loginButton: {
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
  registerButton: {
    borderWidth: 1,
    borderColor: COLORS.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  inlineRegisterRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  skipButton: {
    marginTop: 24,
    paddingVertical: 12,
    alignItems: 'center',
  },
});

export default LoginScreen;
