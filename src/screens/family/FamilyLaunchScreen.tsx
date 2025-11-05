import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
  ScrollView,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { COLORS } from '../../constants/colors';
import { FONTS, FONT_SIZES } from '../../constants/fonts';
import Ionicons from "react-native-vector-icons/Ionicons";
import FamilyService from '../../services/FamilyService';
import { useAuth } from '../../contexts/AuthContext';

type FamilyLaunchScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'FamilyLaunch'>;

const FamilyLaunchScreen = () => {
  const [isChecking, setIsChecking] = useState(true);
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<FamilyLaunchScreenNavigationProp>();
  const { user } = useAuth();

  useEffect(() => {
    checkUserFamily();
  }, [user?.id]);


  const checkUserFamily = async () => {
    if (!user?.id) {
      setIsChecking(false);
      return;
    }

    try {
      setIsChecking(true);
      const family = await FamilyService.getUserFamily(user.id);
      
      if (family) {
        // User has a family - navigate to dashboard
        navigation.replace('FamilyDashboard', { familyId: family.id } as any);
      } else {
        // No family - show create/join options
        setIsChecking(false);
      }
    } catch (error) {
      console.error('Error checking user family:', error);
      setIsChecking(false);
    }
  };

  if (isChecking) {
    return (
      <View style={[styles.container, { paddingTop: insets.top, justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Checking family status...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle='dark-content' backgroundColor={COLORS.background.primary} />
      
      {/* Header with Back Button */}
      <View style={styles.headerContainer}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.text.primary} />
        </TouchableOpacity>
        <View style={styles.headerSpacer} />
      </View>
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Alert Banner */}
        <View style={styles.alertBanner}>
          <Ionicons name="information-circle" size={20} color={COLORS.white} />
          <Text style={styles.alertText}>This feature will be enabled from 15th November</Text>
        </View>

        {/* Header */}
        <View style={styles.header}>
          <Ionicons name="people" size={64} color={COLORS.primary} />
          <Text style={styles.title}>Family Location Tracking</Text>
          <Text style={styles.subtitle}>
            Stay connected with your family members and share your location in real-time
          </Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={[styles.primaryButton, styles.disabledButton]}
            onPress={() => {}}
            disabled={true}
          >
            <View style={styles.buttonContent}>
              <Ionicons name="add-circle" size={24} color={COLORS.white + '80'} />
              <Text style={[styles.primaryButtonText, styles.disabledButtonText]}>Create Family</Text>
            </View>
            <Text style={[styles.buttonDescription, styles.primaryButtonDescription, styles.disabledButtonText]}>
              Start a new family group and invite members
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.secondaryButton, styles.disabledButton]}
            onPress={() => {}}
            disabled={true}
          >
            <View style={styles.buttonContent}>
              <Ionicons name="people-circle" size={24} color={COLORS.primary + '80'} />
              <Text style={[styles.secondaryButtonText, styles.disabledButtonText]}>Join Family</Text>
            </View>
            <Text style={[styles.buttonDescription, styles.secondaryButtonDescription, styles.disabledButtonText]}>
              Join an existing family using family code
            </Text>
          </TouchableOpacity>
        </View>

        {/* Info Card */}
        <View style={styles.infoCard}>
          <Ionicons name="information-circle" size={20} color={COLORS.primary} />
          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>How it works</Text>
            <Text style={styles.infoText}>
              • Create a family group to start tracking{'\n'}
              • Share your 6-digit family code with members{'\n'}
              • Members can join using the code and admin phone number{'\n'}
              • Track everyone's location in real-time on the map
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background.secondary,
  },
  headerContainer: {
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
  },
  headerSpacer: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingVertical: 24,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
  },
  title: {
    fontSize: FONT_SIZES['2xl'],
    fontFamily: FONTS.gilroy.bold,
    color: COLORS.text.primary,
    marginTop: 24,
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: FONT_SIZES.md,
    fontFamily: FONTS.gilroy.regular,
    color: COLORS.text.secondary,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 20,
  },
  actionsContainer: {
    gap: 16,
    marginBottom: 32,
  },
  primaryButton: {
    backgroundColor: COLORS.background.appColor,
    borderRadius: 16,
    padding: 20,
    borderWidth: 2,
    borderColor: COLORS.background.appColor,
  },
  secondaryButton: {
    backgroundColor: COLORS.background.primary,
    borderRadius: 16,
    padding: 20,
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 8,
  },
  primaryButtonText: {
    fontSize: FONT_SIZES.lg,
    fontFamily: FONTS.gilroy.bold,
    color: COLORS.white,
  },
  secondaryButtonText: {
    fontSize: FONT_SIZES.lg,
    fontFamily: FONTS.gilroy.bold,
    color: COLORS.primary,
  },
  buttonDescription: {
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.gilroy.regular,
    textAlign: 'center',
  },
  primaryButtonDescription: {
    color: COLORS.white + 'CC',
  },
  secondaryButtonDescription: {
    color: COLORS.text.secondary,
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.background.appColor + '10',
    borderRadius: 12,
    padding: 16,
  },
  infoContent: {
    flex: 1,
    marginLeft: 12,
  },
  infoTitle: {
    fontSize: FONT_SIZES.md,
    fontFamily: FONTS.gilroy.semiBold,
    color: COLORS.text.primary,
    marginBottom: 8,
  },
  infoText: {
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.gilroy.regular,
    color: COLORS.text.secondary,
    lineHeight: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: FONT_SIZES.md,
    fontFamily: FONTS.gilroy.regular,
    color: COLORS.text.secondary,
  },
  disabledButton: {
    opacity: 0.6,
  },
  disabledButtonText: {
    opacity: 0.7,
  },
  alertBanner: {
    backgroundColor: COLORS.success,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 24,
    gap: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  alertText: {
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.gilroy.semiBold,
    color: COLORS.white,
    flex: 1,
    textAlign: 'center',
  },
});

export default FamilyLaunchScreen;

