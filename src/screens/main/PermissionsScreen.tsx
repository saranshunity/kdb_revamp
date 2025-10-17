import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  StatusBar,
  TouchableOpacity,
  Alert,
  Linking,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { H2, H3, BodyText, ButtonTextPrimary } from '../../components/Text';
import { COLORS } from '../../constants/colors';
import { FONTS, FONT_SIZES } from '../../constants/fonts';
import Ionicons from "react-native-vector-icons/Ionicons";
import PermissionService from '../../services/PermissionService';
import PermissionDebugger from '../../components/PermissionDebugger';

type PermissionsScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Permissions'>;

interface PermissionsScreenProps {
  navigation: PermissionsScreenNavigationProp;
}

interface PermissionState {
  location: 'granted' | 'denied' | 'blocked' | 'unavailable' | 'checking';
  notifications: 'granted' | 'denied' | 'blocked' | 'unavailable' | 'checking';
}

const PermissionsScreen: React.FC<PermissionsScreenProps> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const [permissions, setPermissions] = useState<PermissionState>({
    location: 'checking',
    notifications: 'checking',
  });
  const [isLoading, setIsLoading] = useState(false);

  // Get permission constants from service
  const { LOCATION, NOTIFICATIONS } = PermissionService.getPermissionConstants();

  useEffect(() => {
    // Debug permission availability
    PermissionService.debugPermissions();
    checkAllPermissions();
  }, []);

  const checkAllPermissions = async () => {
    setIsLoading(true);
    try {
      const results = await PermissionService.checkAllCriticalPermissions();
      
      setPermissions({
        location: results.location.status as PermissionState['location'],
        notifications: results.notifications.status as PermissionState['notifications'],
      });
    } catch (error) {
      console.error('Error checking permissions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const requestLocationPermission = async () => {
    try {
      setIsLoading(true);
      const result = await PermissionService.requestLocationPermission();
      
      setPermissions(prev => ({
        ...prev,
        location: result.status as PermissionState['location'],
      }));

      if (result.status === 'denied' || result.status === 'blocked') {
        PermissionService.showPermissionDeniedAlert('Location');
      }
    } catch (error) {
      console.error('Error requesting location permission:', error);
      Alert.alert('Error', 'Failed to request location permission');
    } finally {
      setIsLoading(false);
    }
  };

  const requestNotificationPermission = async () => {
    try {
      setIsLoading(true);
      console.log('Requesting notification permission...');
      
      const result = await PermissionService.requestNotificationPermission();
      console.log('Notification permission result:', result);
      
      setPermissions(prev => ({
        ...prev,
        notifications: result.status as PermissionState['notifications'],
      }));

      if (result.status === 'denied' || result.status === 'blocked') {
        PermissionService.showPermissionDeniedAlert('Notifications');
      } else if (result.status === 'unavailable') {
        Alert.alert(
          'Notification Permission Unavailable',
          'Notification permission is not available on this device or Android version. Notifications may still work depending on your device settings.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      Alert.alert(
        'Permission Error', 
        'Failed to request notification permission. This might be due to device limitations or Android version compatibility.'
      );
    } finally {
      setIsLoading(false);
    }
  };


  const getPermissionStatus = (status: PermissionState[keyof PermissionState]) => {
    if (status === 'checking') {
      return { color: COLORS.text.tertiary, text: 'Checking...', icon: 'time' };
    }
    
    return PermissionService.getPermissionStatusInfo(status as any);
  };

  const renderPermissionCard = (
    title: string,
    description: string,
    icon: string,
    permissionKey: keyof PermissionState,
    onRequest: () => void,
    benefits: string[]
  ) => {
    const status = getPermissionStatus(permissions[permissionKey]);
    const isGranted = permissions[permissionKey] === 'granted';
    const isBlocked = permissions[permissionKey] === 'blocked';

    return (
      <View key={permissionKey} style={styles.permissionCard}>
        <View style={styles.permissionHeader}>
          <View style={styles.permissionIconContainer}>
            <Ionicons name={icon} size={32} color={COLORS.primary} />
          </View>
          <View style={styles.permissionTitleContainer}>
            <H3 style={styles.permissionTitle} color={COLORS.text.primary} weight='bold' size='lg'>
              {title}
            </H3>
            <View style={styles.statusContainer}>
              <Ionicons name={status.icon} size={16} color={status.color} />
              <BodyText style={[styles.statusText, { color: status.color }]} size='sm' weight='medium'>
                {status.text}
              </BodyText>
            </View>
          </View>
        </View>

        <BodyText style={styles.permissionDescription} color={COLORS.text.primary} size='md'>
          {description}
        </BodyText>

        <View style={styles.benefitsContainer}>
          <BodyText style={styles.benefitsTitle} color={COLORS.text.secondary} size='sm' weight='semiBold'>
            Benefits:
          </BodyText>
          {benefits.map((benefit, index) => (
            <View key={index} style={styles.benefitItem}>
              <Ionicons name="checkmark" size={14} color={COLORS.success} />
              <BodyText style={styles.benefitText} color={COLORS.text.primary} size='sm'>
                {benefit}
              </BodyText>
            </View>
          ))}
        </View>

        {!isGranted && (
          <TouchableOpacity
            style={[
              styles.permissionButton,
              isBlocked && styles.permissionButtonBlocked,
            ]}
            onPress={isBlocked ? PermissionService.openAppSettings : onRequest}
            disabled={isLoading}
          >
            <Ionicons 
              name={isBlocked ? "settings-outline" : "add-circle-outline"} 
              size={20} 
              color={isBlocked ? COLORS.text.primary : COLORS.white} 
            />
            <BodyText 
              style={[
                styles.permissionButtonText,
                isBlocked && styles.permissionButtonTextBlocked,
              ]} 
              color={isBlocked ? COLORS.text.primary : COLORS.white} 
              size='md' 
              weight='semiBold'
            >
              {isBlocked ? 'Open Settings' : 'Grant Permission'}
            </BodyText>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  const allPermissionsGranted = permissions.location === 'granted' && permissions.notifications === 'granted';

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle='dark-content' backgroundColor={COLORS.background.primary} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back-outline" size={24} color={COLORS.text.primary} />
        </TouchableOpacity>
        <H2 style={styles.headerTitle} color={COLORS.text.primary} weight='bold' size='xl'>
          Permissions
        </H2>
        <View style={styles.headerRight} />
      </View>

      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Introduction */}
        <View style={styles.introSection}>
          <View style={styles.introIconContainer}>
            <Ionicons name="shield-checkmark" size={48} color={COLORS.primary} />
          </View>
          <H2 style={styles.introTitle} color={COLORS.text.primary} weight='bold' size='xl'>
            App Permissions
          </H2>
          <BodyText style={styles.introDescription} color={COLORS.text.primary} size='md'>
            To provide you with the best experience and access to all features, this app requires certain permissions. Your privacy is important to us, and we only request permissions that are necessary for the app's functionality.
          </BodyText>
        </View>

        {/* Permission Cards */}
        <View style={styles.permissionsContainer}>
          {renderPermissionCard(
            'Location Access',
            'Allow the app to access your location to provide location-based services, find nearby places, and help you navigate to important sites.',
            'location-outline',
            'location',
            requestLocationPermission,
            [
              'Find nearby temples and religious sites',
              'Get directions to pilgrimage locations',
              'Locate family members during events',
              'Discover local events and activities',
              'Emergency location sharing'
            ]
          )}

          {renderPermissionCard(
            'Notifications',
            'Enable notifications to receive important updates about events, reminders, and special announcements related to your pilgrimage journey.',
            'notifications-outline',
            'notifications',
            requestNotificationPermission,
            [
              'Event reminders and updates',
              'Important announcements',
              'Safety alerts and notifications',
              'Daily spiritual quotes and messages',
              'Emergency notifications'
            ]
          )}
        </View>

        {/* Summary */}
        <View style={styles.summarySection}>
          <H3 style={styles.summaryTitle} color={COLORS.text.primary} weight='bold' size='lg'>
            Why These Permissions?
          </H3>
          <BodyText style={styles.summaryText} color={COLORS.text.primary} size='md'>
            These permissions are essential for the core features of the KDB app. Without them, you may not be able to:
          </BodyText>
          <View style={styles.summaryList}>
            <View style={styles.summaryItem}>
              <Ionicons name="location" size={16} color={COLORS.error} />
              <BodyText style={styles.summaryItemText} color={COLORS.text.primary} size='sm'>
                Access location-based features and navigation
              </BodyText>
            </View>
            <View style={styles.summaryItem}>
              <Ionicons name="notifications" size={16} color={COLORS.error} />
              <BodyText style={styles.summaryItemText} color={COLORS.text.primary} size='sm'>
                Receive important updates and reminders
              </BodyText>
            </View>
            <View style={styles.summaryItem}>
              <Ionicons name="people" size={16} color={COLORS.error} />
              <BodyText style={styles.summaryItemText} color={COLORS.text.primary} size='sm'>
                Use family location and safety features
              </BodyText>
            </View>
          </View>
        </View>

        {/* Debug Section - Remove in production */}
        <PermissionDebugger />

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.refreshButton}
            onPress={checkAllPermissions}
            disabled={isLoading}
          >
            <Ionicons name="refresh" size={20} color={COLORS.primary} />
            <BodyText style={styles.refreshButtonText} color={COLORS.primary} size='md' weight='semiBold'>
              Refresh Status
            </BodyText>
          </TouchableOpacity>

          {allPermissionsGranted && (
            <TouchableOpacity
              style={styles.continueButton}
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="checkmark-circle" size={20} color={COLORS.white} />
              <ButtonTextPrimary size='md' style={styles.continueButtonText}>
                Continue
              </ButtonTextPrimary>
            </TouchableOpacity>
          )}
        </View>
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
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border.light,
  },
  backButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
  },
  headerTitle: {
    fontFamily: FONTS.gilroy.bold,
    fontSize: FONT_SIZES.xl,
  },
  headerRight: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 32,
  },
  introSection: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 32,
    backgroundColor: COLORS.background.tertiary,
  },
  introIconContainer: {
    marginBottom: 16,
  },
  introTitle: {
    fontFamily: FONTS.gilroy.bold,
    fontSize: FONT_SIZES.xl,
    marginBottom: 12,
    textAlign: 'center',
  },
  introDescription: {
    fontFamily: FONTS.gilroy.regular,
    fontSize: FONT_SIZES.md,
    lineHeight: 24,
    textAlign: 'center',
  },
  permissionsContainer: {
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  permissionCard: {
    backgroundColor: COLORS.background.primary,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: COLORS.text.primary,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: COLORS.border.light,
  },
  permissionHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  permissionIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.background.tertiary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  permissionTitleContainer: {
    flex: 1,
  },
  permissionTitle: {
    fontFamily: FONTS.gilroy.bold,
    fontSize: FONT_SIZES.lg,
    marginBottom: 8,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusText: {
    fontFamily: FONTS.gilroy.medium,
    fontSize: FONT_SIZES.sm,
    marginLeft: 6,
  },
  permissionDescription: {
    fontFamily: FONTS.gilroy.regular,
    fontSize: FONT_SIZES.md,
    lineHeight: 22,
    marginBottom: 16,
  },
  benefitsContainer: {
    marginBottom: 20,
  },
  benefitsTitle: {
    fontFamily: FONTS.gilroy.semiBold,
    fontSize: FONT_SIZES.sm,
    marginBottom: 8,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  benefitText: {
    fontFamily: FONTS.gilroy.regular,
    fontSize: FONT_SIZES.sm,
    marginLeft: 8,
    flex: 1,
    lineHeight: 20,
  },
  permissionButton: {
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    gap: 8,
  },
  permissionButtonBlocked: {
    backgroundColor: COLORS.background.tertiary,
    borderWidth: 1,
    borderColor: COLORS.border.light,
  },
  permissionButtonText: {
    fontFamily: FONTS.gilroy.semiBold,
    fontSize: FONT_SIZES.md,
  },
  permissionButtonTextBlocked: {
    color: COLORS.text.primary,
  },
  summarySection: {
    paddingHorizontal: 20,
    paddingVertical: 24,
    backgroundColor: COLORS.background.tertiary,
    marginTop: 20,
  },
  summaryTitle: {
    fontFamily: FONTS.gilroy.bold,
    fontSize: FONT_SIZES.lg,
    marginBottom: 12,
  },
  summaryText: {
    fontFamily: FONTS.gilroy.regular,
    fontSize: FONT_SIZES.md,
    lineHeight: 22,
    marginBottom: 16,
  },
  summaryList: {
    marginTop: 8,
  },
  summaryItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  summaryItemText: {
    fontFamily: FONTS.gilroy.regular,
    fontSize: FONT_SIZES.sm,
    marginLeft: 8,
    flex: 1,
    lineHeight: 20,
  },
  actionButtons: {
    paddingHorizontal: 20,
    paddingTop: 24,
    gap: 12,
  },
  refreshButton: {
    backgroundColor: COLORS.background.primary,
    borderWidth: 1,
    borderColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  refreshButtonText: {
    fontFamily: FONTS.gilroy.semiBold,
    fontSize: FONT_SIZES.md,
  },
  continueButton: {
    backgroundColor: COLORS.success,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  continueButtonText: {
    color: COLORS.white,
  },
});

export default PermissionsScreen;
