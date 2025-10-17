import { useState, useEffect, useCallback } from 'react';
import PermissionService, { PermissionStatus } from '../services/PermissionService';

interface UsePermissionsReturn {
  location: PermissionStatus;
  notifications: PermissionStatus;
  isLoading: boolean;
  allGranted: boolean;
  checkPermissions: () => Promise<void>;
  requestLocation: () => Promise<boolean>;
  requestNotifications: () => Promise<boolean>;
  requestAll: () => Promise<boolean>;
}

export const usePermissions = (): UsePermissionsReturn => {
  const [location, setLocation] = useState<PermissionStatus>('unavailable');
  const [notifications, setNotifications] = useState<PermissionStatus>('unavailable');
  const [isLoading, setIsLoading] = useState(false);

  const checkPermissions = useCallback(async () => {
    setIsLoading(true);
    try {
      const results = await PermissionService.checkAllCriticalPermissions();
      setLocation(results.location.status);
      setNotifications(results.notifications.status);
    } catch (error) {
      console.error('Error checking permissions:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const requestLocation = useCallback(async (): Promise<boolean> => {
    setIsLoading(true);
    try {
      const result = await PermissionService.requestLocationPermission();
      setLocation(result.status);
      
      if (result.status === 'denied' || result.status === 'blocked') {
        PermissionService.showPermissionDeniedAlert('Location');
        return false;
      }
      
      return result.status === 'granted';
    } catch (error) {
      console.error('Error requesting location permission:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const requestNotifications = useCallback(async (): Promise<boolean> => {
    setIsLoading(true);
    try {
      const result = await PermissionService.requestNotificationPermission();
      setNotifications(result.status);
      
      if (result.status === 'denied' || result.status === 'blocked') {
        PermissionService.showPermissionDeniedAlert('Notifications');
        return false;
      }
      
      return result.status === 'granted';
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const requestAll = useCallback(async (): Promise<boolean> => {
    setIsLoading(true);
    try {
      const [locationResult, notificationResult] = await Promise.all([
        requestLocation(),
        requestNotifications(),
      ]);
      
      return locationResult && notificationResult;
    } catch (error) {
      console.error('Error requesting all permissions:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [requestLocation, requestNotifications]);

  useEffect(() => {
    checkPermissions();
  }, [checkPermissions]);

  const allGranted = location === 'granted' && notifications === 'granted';

  return {
    location,
    notifications,
    isLoading,
    allGranted,
    checkPermissions,
    requestLocation,
    requestNotifications,
    requestAll,
  };
};

export default usePermissions;
