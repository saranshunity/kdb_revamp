import { Platform, Alert, Linking } from 'react-native';
import { check, request, PERMISSIONS, RESULTS, Permission } from 'react-native-permissions';

export type PermissionStatus = 'granted' | 'denied' | 'blocked' | 'unavailable';

export interface PermissionResult {
  status: PermissionStatus;
  canAskAgain: boolean;
}

class PermissionService {
  // Permission constants for different platforms
  private static readonly LOCATION_PERMISSION: Permission = Platform.select({
    ios: PERMISSIONS.IOS.LOCATION_WHEN_IN_USE,
    android: PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
  }) as Permission;

  private static readonly NOTIFICATION_PERMISSION: Permission = Platform.select({
    ios: PERMISSIONS.IOS.NOTIFICATIONS,
    android: PERMISSIONS.ANDROID.POST_NOTIFICATIONS || PERMISSIONS.ANDROID.ACCESS_NOTIFICATION_POLICY,
  }) as Permission;

  private static readonly CAMERA_PERMISSION: Permission = Platform.select({
    ios: PERMISSIONS.IOS.CAMERA,
    android: PERMISSIONS.ANDROID.CAMERA,
  }) as Permission;

  private static readonly STORAGE_PERMISSION: Permission = Platform.select({
    ios: PERMISSIONS.IOS.PHOTO_LIBRARY,
    android: PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE,
  }) as Permission;

  /**
   * Check the current status of a permission
   */
  static async checkPermission(permission: Permission): Promise<PermissionResult> {
    try {
      if (!permission) {
        console.warn('Permission is null or undefined');
        return {
          status: 'unavailable',
          canAskAgain: false,
        };
      }

      const result = await check(permission);
      
      return {
        status: result as PermissionStatus,
        canAskAgain: result === RESULTS.DENIED,
      };
    } catch (error) {
      console.error('Error checking permission:', error);
      return {
        status: 'unavailable',
        canAskAgain: false,
      };
    }
  }

  /**
   * Request a permission from the user
   */
  static async requestPermission(permission: Permission): Promise<PermissionResult> {
    try {
      if (!permission) {
        console.warn('Permission is null or undefined');
        return {
          status: 'unavailable',
          canAskAgain: false,
        };
      }

      const result = await request(permission);
      
      return {
        status: result as PermissionStatus,
        canAskAgain: result === RESULTS.DENIED,
      };
    } catch (error) {
      console.error('Error requesting permission:', error);
      return {
        status: 'unavailable',
        canAskAgain: false,
      };
    }
  }

  /**
   * Check location permission
   */
  static async checkLocationPermission(): Promise<PermissionResult> {
    return this.checkPermission(this.LOCATION_PERMISSION);
  }

  /**
   * Request location permission
   */
  static async requestLocationPermission(): Promise<PermissionResult> {
    return this.requestPermission(this.LOCATION_PERMISSION);
  }

  /**
   * Check notification permission
   */
  static async checkNotificationPermission(): Promise<PermissionResult> {
    // For Android API < 33, notifications are granted by default
    if (Platform.OS === 'android') {
      const androidVersion = Platform.Version;
      if (typeof androidVersion === 'number' && androidVersion < 33) {
        return {
          status: 'granted',
          canAskAgain: false,
        };
      }
    }

    // Check if notification permission is available
    if (!this.NOTIFICATION_PERMISSION) {
      console.warn('Notification permission not available on this platform/version');
      return {
        status: 'unavailable',
        canAskAgain: false,
      };
    }

    return this.checkPermission(this.NOTIFICATION_PERMISSION);
  }

  /**
   * Request notification permission
   */
  static async requestNotificationPermission(): Promise<PermissionResult> {
    // For Android API < 33, notifications are granted by default
    if (Platform.OS === 'android') {
      const androidVersion = Platform.Version;
      if (typeof androidVersion === 'number' && androidVersion < 33) {
        return {
          status: 'granted',
          canAskAgain: false,
        };
      }
    }

    // Check if notification permission is available
    if (!this.NOTIFICATION_PERMISSION) {
      console.warn('Notification permission not available on this platform/version');
      return {
        status: 'unavailable',
        canAskAgain: false,
      };
    }

    return this.requestPermission(this.NOTIFICATION_PERMISSION);
  }

  /**
   * Check camera permission
   */
  static async checkCameraPermission(): Promise<PermissionResult> {
    return this.checkPermission(this.CAMERA_PERMISSION);
  }

  /**
   * Request camera permission
   */
  static async requestCameraPermission(): Promise<PermissionResult> {
    return this.requestPermission(this.CAMERA_PERMISSION);
  }

  /**
   * Check storage permission
   */
  static async checkStoragePermission(): Promise<PermissionResult> {
    return this.checkPermission(this.STORAGE_PERMISSION);
  }

  /**
   * Request storage permission
   */
  static async requestStoragePermission(): Promise<PermissionResult> {
    return this.requestPermission(this.STORAGE_PERMISSION);
  }

  /**
   * Check all critical permissions
   */
  static async checkAllCriticalPermissions(): Promise<{
    location: PermissionResult;
    notifications: PermissionResult;
  }> {
    const [location, notifications] = await Promise.all([
      this.checkLocationPermission(),
      this.checkNotificationPermission(),
    ]);

    return { location, notifications };
  }

  /**
   * Check if all critical permissions are granted
   */
  static async areAllCriticalPermissionsGranted(): Promise<boolean> {
    const permissions = await this.checkAllCriticalPermissions();
    return permissions.location.status === 'granted' && permissions.notifications.status === 'granted';
  }

  /**
   * Show permission denied alert with option to open settings
   */
  static showPermissionDeniedAlert(
    permissionType: string,
    onOpenSettings?: () => void
  ): void {
    Alert.alert(
      `${permissionType} Permission Required`,
      `This app needs ${permissionType.toLowerCase()} permission to provide you with the best experience. Please enable it in your device settings.`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Open Settings',
          onPress: onOpenSettings || this.openAppSettings,
        },
      ]
    );
  }

  /**
   * Open device settings
   */
  static openAppSettings(): void {
    Linking.openSettings();
  }

  /**
   * Get permission status display info
   */
  static getPermissionStatusInfo(status: PermissionStatus): {
    color: string;
    text: string;
    icon: string;
  } {
    switch (status) {
      case 'granted':
        return { color: '#28a745', text: 'Granted', icon: 'checkmark-circle' };
      case 'denied':
        return { color: '#ffc107', text: 'Denied', icon: 'close-circle' };
      case 'blocked':
        return { color: '#dc3545', text: 'Blocked', icon: 'ban' };
      case 'unavailable':
        return { color: '#6c757d', text: 'Unavailable', icon: 'help-circle' };
      default:
        return { color: '#6c757d', text: 'Unknown', icon: 'help-circle' };
    }
  }

  /**
   * Request multiple permissions in sequence
   */
  static async requestMultiplePermissions(
    permissions: Permission[]
  ): Promise<Record<string, PermissionResult>> {
    const results: Record<string, PermissionResult> = {};
    
    for (const permission of permissions) {
      const result = await this.requestPermission(permission);
      results[permission] = result;
      
      // If permission is blocked, stop requesting others
      if (result.status === 'blocked') {
        break;
      }
    }
    
    return results;
  }

  /**
   * Get permission constants for external use
   */
  static getPermissionConstants() {
    return {
      LOCATION: this.LOCATION_PERMISSION,
      NOTIFICATIONS: this.NOTIFICATION_PERMISSION,
      CAMERA: this.CAMERA_PERMISSION,
      STORAGE: this.STORAGE_PERMISSION,
    };
  }

  /**
   * Debug method to check permission availability
   */
  static debugPermissions() {
    console.log('=== Permission Debug Info ===');
    console.log('Platform:', Platform.OS);
    console.log('Platform Version:', Platform.Version);
    console.log('Location Permission:', this.LOCATION_PERMISSION);
    console.log('Notification Permission:', this.NOTIFICATION_PERMISSION);
    console.log('Camera Permission:', this.CAMERA_PERMISSION);
    console.log('Storage Permission:', this.STORAGE_PERMISSION);
    console.log('=============================');
  }
}

export default PermissionService;
