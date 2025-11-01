import React, { useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../contexts/AuthContext';
import FCMService from '../services/FCMService';

const AuthNavigationListener: React.FC = () => {
  const navigation = useNavigation();
  const { isAuthenticated, isLoading, user } = useAuth();

  useEffect(() => {
    // Only handle navigation when auth state is determined and not loading
    if (!isLoading) {
      if (isAuthenticated) {
        // User is logged in, navigate to main app
        // Use replace to prevent going back to auth screens
        navigation.reset({
          index: 0,
          routes: [{ name: 'Main' }],
        });
        // Register FCM token for this user
        if (user?.id) {
          FCMService.registerToken(user.id).catch(() => {});
        }
      } else {
        // User is not logged in, navigate to Auth (Login)
        // Only navigate if we're not already in auth flow
        const currentRoute = navigation.getState()?.routes[navigation.getState()?.index || 0];
        if (currentRoute?.name !== 'Auth') {
          navigation.reset({
            index: 0,
            routes: [{ name: 'Auth' }],
          });
        }
      }
    }
  }, [isAuthenticated, isLoading, navigation]);

  // This component doesn't render anything
  return null;
};

export default AuthNavigationListener;
