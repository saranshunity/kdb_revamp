import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { H3, BodyText } from './Text';
import { COLORS } from '../constants/colors';
import { FONTS, FONT_SIZES } from '../constants/fonts';
import usePermissions from '../hooks/usePermissions';
import Ionicons from "react-native-vector-icons/Ionicons";

interface PermissionGuardProps {
  children: React.ReactNode;
  requiredPermissions?: ('location' | 'notifications')[];
  fallbackComponent?: React.ReactNode;
  redirectToPermissions?: boolean;
}

type PermissionGuardNavigationProp = NativeStackNavigationProp<RootStackParamList>;

const PermissionGuard: React.FC<PermissionGuardProps> = ({
  children,
  requiredPermissions = ['location', 'notifications'],
  fallbackComponent,
  redirectToPermissions = true,
}) => {
  const navigation = useNavigation<PermissionGuardNavigationProp>();
  const { location, notifications, allGranted, isLoading } = usePermissions();

  useEffect(() => {
    if (!isLoading && !allGranted && redirectToPermissions) {
      // Check if any required permissions are missing
      const hasLocationPermission = !requiredPermissions.includes('location') || location === 'granted';
      const hasNotificationPermission = !requiredPermissions.includes('notifications') || notifications === 'granted';
      
      if (!hasLocationPermission || !hasNotificationPermission) {
        navigation.navigate('Permissions');
      }
    }
  }, [isLoading, allGranted, location, notifications, requiredPermissions, redirectToPermissions, navigation]);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Ionicons name="hourglass-outline" size={48} color={COLORS.primary} />
        <H3 style={styles.loadingText} color={COLORS.text.primary} weight='bold' size='lg'>
          Checking Permissions...
        </H3>
        <BodyText style={styles.loadingSubtext} color={COLORS.text.secondary} size='md'>
          Please wait while we verify your permissions
        </BodyText>
      </View>
    );
  }

  // Check if all required permissions are granted
  const hasLocationPermission = !requiredPermissions.includes('location') || location === 'granted';
  const hasNotificationPermission = !requiredPermissions.includes('notifications') || notifications === 'granted';
  const hasAllRequiredPermissions = hasLocationPermission && hasNotificationPermission;

  if (!hasAllRequiredPermissions) {
    if (fallbackComponent) {
      return <>{fallbackComponent}</>;
    }

    return (
      <View style={styles.permissionRequiredContainer}>
        <Ionicons name="shield-outline" size={64} color={COLORS.warning} />
        <H3 style={styles.permissionRequiredTitle} color={COLORS.text.primary} weight='bold' size='xl'>
          Permissions Required
        </H3>
        <BodyText style={styles.permissionRequiredText} color={COLORS.text.primary} size='md'>
          This feature requires certain permissions to function properly. Please grant the necessary permissions to continue.
        </BodyText>
        
        <View style={styles.missingPermissionsContainer}>
          {requiredPermissions.includes('location') && location !== 'granted' && (
            <View style={styles.missingPermissionItem}>
              <Ionicons name="location-outline" size={20} color={COLORS.error} />
              <BodyText style={styles.missingPermissionText} color={COLORS.text.primary} size='sm'>
                Location permission is required
              </BodyText>
            </View>
          )}
          
          {requiredPermissions.includes('notifications') && notifications !== 'granted' && (
            <View style={styles.missingPermissionItem}>
              <Ionicons name="notifications-outline" size={20} color={COLORS.error} />
              <BodyText style={styles.missingPermissionText} color={COLORS.text.primary} size='sm'>
                Notification permission is required
              </BodyText>
            </View>
          )}
        </View>
      </View>
    );
  }

  return <>{children}</>;
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background.primary,
    paddingHorizontal: 32,
  },
  loadingText: {
    fontFamily: FONTS.gilroy.bold,
    fontSize: FONT_SIZES.lg,
    marginTop: 16,
    marginBottom: 8,
  },
  loadingSubtext: {
    fontFamily: FONTS.gilroy.regular,
    fontSize: FONT_SIZES.md,
    textAlign: 'center',
    lineHeight: 22,
  },
  permissionRequiredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background.primary,
    paddingHorizontal: 32,
  },
  permissionRequiredTitle: {
    fontFamily: FONTS.gilroy.bold,
    fontSize: FONT_SIZES.xl,
    marginTop: 16,
    marginBottom: 12,
    textAlign: 'center',
  },
  permissionRequiredText: {
    fontFamily: FONTS.gilroy.regular,
    fontSize: FONT_SIZES.md,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  missingPermissionsContainer: {
    width: '100%',
    alignItems: 'flex-start',
  },
  missingPermissionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: COLORS.background.tertiary,
    borderRadius: 8,
    width: '100%',
  },
  missingPermissionText: {
    fontFamily: FONTS.gilroy.medium,
    fontSize: FONT_SIZES.sm,
    marginLeft: 12,
  },
});

export default PermissionGuard;
