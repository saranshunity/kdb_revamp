import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Dimensions,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { H2, H3, BodyText, ButtonTextPrimary } from './Text';
import { COLORS } from '../constants/colors';
import { FONTS, FONT_SIZES } from '../constants/fonts';
import Ionicons from "react-native-vector-icons/Ionicons";
import PermissionService from '../services/PermissionService';

interface PermissionBottomSheetProps {
  visible: boolean;
  onClose: () => void;
  onPermissionsGranted: () => void;
  isOnboarding?: boolean;
}

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const PermissionBottomSheet: React.FC<PermissionBottomSheetProps> = ({
  visible,
  onClose,
  onPermissionsGranted,
  isOnboarding = false,
}) => {
  const insets = useSafeAreaInsets();
  const [permissions, setPermissions] = useState({
    location: 'checking' as 'granted' | 'denied' | 'blocked' | 'unavailable' | 'checking',
    notifications: 'checking' as 'granted' | 'denied' | 'blocked' | 'unavailable' | 'checking',
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (visible) {
      checkPermissions();
    }
  }, [visible]);

  const checkPermissions = async () => {
    setIsLoading(true);
    try {
      const results = await PermissionService.checkAllCriticalPermissions();
      setPermissions({
        location: results.location.status as any,
        notifications: results.notifications.status as any,
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
        location: result.status as any,
      }));
    } catch (error) {
      console.error('Error requesting location permission:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const requestNotificationPermission = async () => {
    try {
      setIsLoading(true);
      const result = await PermissionService.requestNotificationPermission();
      setPermissions(prev => ({
        ...prev,
        notifications: result.status as any,
      }));
    } catch (error) {
      console.error('Error requesting notification permission:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const requestAllPermissions = async () => {
    await Promise.all([
      requestLocationPermission(),
      requestNotificationPermission(),
    ]);
  };

  const allPermissionsGranted = permissions.location === 'granted' && permissions.notifications === 'granted';

  const renderPermissionItem = (
    title: string,
    description: string,
    icon: string,
    permissionKey: keyof typeof permissions,
    onRequest: () => void
  ) => {
    const isGranted = permissions[permissionKey] === 'granted';
    const isBlocked = permissions[permissionKey] === 'blocked';

    return (
      <View key={permissionKey} style={styles.permissionItem}>
        <View style={styles.permissionItemLeft}>
          <View style={styles.permissionIconContainer}>
            <Ionicons name={icon} size={24} color={COLORS.appColor} />
          </View>
          <View style={styles.permissionItemContent}>
            <H3 style={styles.permissionItemTitle} color={COLORS.text.primary} weight='bold' size='md'>
              {title}
            </H3>
            <BodyText style={styles.permissionItemDescription} color={COLORS.text.secondary} size='sm'>
              {description}
            </BodyText>
          </View>
        </View>
        
        <View style={styles.permissionItemRight}>
          {isGranted ? (
            <Ionicons name="checkmark-circle" size={24} color={COLORS.success} />
          ) : (
            <TouchableOpacity
              style={styles.grantButton}
              onPress={onRequest}
              disabled={isLoading || isBlocked}
            >
              <BodyText style={styles.grantButtonText} color={COLORS.appColor} size='sm' weight='semiBold'>
                {isBlocked ? 'Settings' : 'Grant'}
              </BodyText>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <StatusBar barStyle="dark-content" backgroundColor="rgba(0, 0, 0, 0.5)" />
      <View style={styles.overlay}>
        <TouchableOpacity style={styles.overlayTouchable} activeOpacity={1} onPress={onClose} />
        <View style={[styles.container, { paddingBottom: insets.bottom }]}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.dragHandle} />
            <H2 style={styles.title} color={COLORS.text.primary} weight='bold' size='xl'>
              {isOnboarding ? 'Enable Permissions' : 'Permissions Required'}
            </H2>
            <BodyText style={styles.subtitle} color={COLORS.text.secondary} size='md'>
              {isOnboarding 
                ? 'Grant permissions to access all app features and get the best experience.'
                : 'This app needs permissions to provide you with the best experience.'
              }
            </BodyText>
          </View>

          {/* Permission Items */}
          <View style={styles.permissionsList}>
            {renderPermissionItem(
              'Location Access',
              'Find nearby temples and get directions',
              'location-outline',
              'location',
              requestLocationPermission
            )}
            
            {renderPermissionItem(
              'Notifications',
              'Get event reminders and updates',
              'notifications-outline',
              'notifications',
              requestNotificationPermission
            )}
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            {!isOnboarding && (
              <TouchableOpacity
                style={styles.skipButton}
                onPress={onClose}
                disabled={isLoading}
              >
                <BodyText style={styles.skipButtonText} color={COLORS.text.secondary} size='md' weight='medium'>
                  Skip for Now
                </BodyText>
              </TouchableOpacity>
            )}
            
            <TouchableOpacity
              style={[
                styles.primaryButton,
                allPermissionsGranted && styles.primaryButtonSuccess
              ]}
              onPress={allPermissionsGranted ? onPermissionsGranted : requestAllPermissions}
              disabled={isLoading}
            >
              <Ionicons 
                name={allPermissionsGranted ? "checkmark-circle" : "shield-checkmark"} 
                size={20} 
                color={COLORS.white} 
              />
              <ButtonTextPrimary size='md' style={styles.primaryButtonText}>
                {allPermissionsGranted ? 'Continue' : 'Grant All Permissions'}
              </ButtonTextPrimary>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  overlayTouchable: {
    flex: 1,
  },
  container: {
    backgroundColor: COLORS.background.primary,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: SCREEN_HEIGHT * 0.8,
    paddingHorizontal: 20,
  },
  header: {
    paddingTop: 12,
    paddingBottom: 20,
    alignItems: 'center',
  },
  dragHandle: {
    width: 40,
    height: 4,
    backgroundColor: COLORS.border.medium,
    borderRadius: 2,
    marginBottom: 16,
  },
  title: {
    fontFamily: FONTS.gilroy.bold,
    fontSize: FONT_SIZES.xl,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: FONTS.gilroy.regular,
    fontSize: FONT_SIZES.md,
    textAlign: 'center',
    lineHeight: 22,
  },
  permissionsList: {
    marginBottom: 24,
  },
  permissionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: COLORS.background.tertiary,
    borderRadius: 12,
    marginBottom: 12,
  },
  permissionItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  permissionIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.background.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  permissionItemContent: {
    flex: 1,
  },
  permissionItemTitle: {
    fontFamily: FONTS.gilroy.bold,
    fontSize: FONT_SIZES.md,
    marginBottom: 4,
  },
  permissionItemDescription: {
    fontFamily: FONTS.gilroy.regular,
    fontSize: FONT_SIZES.sm,
    lineHeight: 18,
  },
  permissionItemRight: {
    marginLeft: 12,
  },
  grantButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: COLORS.background.primary,
    borderWidth: 1,
    borderColor: COLORS.appColor,
    borderRadius: 6,
  },
  grantButtonText: {
    fontFamily: FONTS.gilroy.semiBold,
    fontSize: FONT_SIZES.sm,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    paddingBottom: 20,
  },
  skipButton: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  skipButtonText: {
    fontFamily: FONTS.gilroy.medium,
    fontSize: FONT_SIZES.md,
  },
  primaryButton: {
    flex: 2,
    backgroundColor: COLORS.appColor,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  primaryButtonSuccess: {
    backgroundColor: COLORS.success,
  },
  primaryButtonText: {
    color: COLORS.white,
  },
});

export default PermissionBottomSheet;
