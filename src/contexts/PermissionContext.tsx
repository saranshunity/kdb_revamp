import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import PermissionService from '../services/PermissionService';

interface PermissionState {
  location: 'granted' | 'denied' | 'blocked' | 'unavailable' | 'checking';
  notifications: 'granted' | 'denied' | 'blocked' | 'unavailable' | 'checking';
  storage: 'granted' | 'denied' | 'blocked' | 'unavailable' | 'checking';
}

interface PermissionContextType {
  permissions: PermissionState;
  isLoading: boolean;
  allGranted: boolean;
  checkPermissions: () => Promise<void>;
  requestLocation: () => Promise<boolean>;
  requestNotifications: () => Promise<boolean>;
  requestStorage: () => Promise<boolean>;
  requestAll: () => Promise<boolean>;
  hasShownPermissionPrompt: boolean;
  setHasShownPermissionPrompt: (shown: boolean) => void;
}

const PermissionContext = createContext<PermissionContextType | undefined>(undefined);

interface PermissionProviderProps {
  children: ReactNode;
}

export const PermissionProvider: React.FC<PermissionProviderProps> = ({ children }) => {
  const [permissions, setPermissions] = useState<PermissionState>({
    location: 'checking',
    notifications: 'checking',
    storage: 'checking',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [hasShownPermissionPrompt, setHasShownPermissionPrompt] = useState(false);

  const checkPermissions = async () => {
    setIsLoading(true);
    try {
      const [criticalResults, storageResult] = await Promise.all([
        PermissionService.checkAllCriticalPermissions(),
        PermissionService.checkStoragePermission(),
      ]);
      setPermissions({
        location: criticalResults.location.status as PermissionState['location'],
        notifications: criticalResults.notifications.status as PermissionState['notifications'],
        storage: storageResult.status as PermissionState['storage'],
      });
    } catch (error) {
      console.error('Error checking permissions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const requestLocation = async (): Promise<boolean> => {
    setIsLoading(true);
    try {
      const result = await PermissionService.requestLocationPermission();
      setPermissions(prev => ({
        ...prev,
        location: result.status as PermissionState['location'],
      }));
      return result.status === 'granted';
    } catch (error) {
      console.error('Error requesting location permission:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const requestNotifications = async (): Promise<boolean> => {
    setIsLoading(true);
    try {
      const result = await PermissionService.requestNotificationPermission();
      setPermissions(prev => ({
        ...prev,
        notifications: result.status as PermissionState['notifications'],
      }));
      return result.status === 'granted';
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const requestStorage = async (): Promise<boolean> => {
    setIsLoading(true);
    try {
      const result = await PermissionService.requestStoragePermission();
      setPermissions(prev => ({
        ...prev,
        storage: result.status as PermissionState['storage'],
      }));
      return result.status === 'granted';
    } catch (error) {
      console.error('Error requesting storage permission:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const requestAll = async (): Promise<boolean> => {
    setIsLoading(true);
    try {
      const [locationResult, notificationResult, storageResult] = await Promise.all([
        requestLocation(),
        requestNotifications(),
        requestStorage(),
      ]);
      return locationResult && notificationResult && storageResult;
    } catch (error) {
      console.error('Error requesting all permissions:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkPermissions();
  }, []);

  const allGranted = permissions.location === 'granted' && permissions.notifications === 'granted' && permissions.storage === 'granted';

  const value: PermissionContextType = {
    permissions,
    isLoading,
    allGranted,
    checkPermissions,
    requestLocation,
    requestNotifications,
    requestStorage,
    requestAll,
    hasShownPermissionPrompt,
    setHasShownPermissionPrompt,
  };

  return (
    <PermissionContext.Provider value={value}>
      {children}
    </PermissionContext.Provider>
  );
};

export const usePermissionContext = (): PermissionContextType => {
  const context = useContext(PermissionContext);
  if (context === undefined) {
    throw new Error('usePermissionContext must be used within a PermissionProvider');
  }
  return context;
};

export default PermissionContext;
