import React, { createContext, useContext, useState, useCallback } from 'react';
import { useConnectivity } from '../hooks/useConnectivity';

interface NoInternetContextType {
  showNoInternetSheet: boolean;
  setShowNoInternetSheet: (show: boolean) => void;
  handleRetryConnection: () => void;
  handleDismissNoInternet: () => void;
}

const NoInternetContext = createContext<NoInternetContextType | undefined>(undefined);

export const NoInternetProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [showNoInternetSheet, setShowNoInternetSheet] = useState(false);
  const { isConnected, isInternetReachable } = useConnectivity();
  const timeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  // Show bottom sheet when internet is not available
  // Only show if we're CERTAIN there's no internet (not just null/unknown)
  React.useEffect(() => {
    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Only show sheet if device is definitely not connected
    // Trust isConnected more than isInternetReachable (which can be unreliable)
    // Only show if both indicate no internet, and hide immediately when connected
    if (!isConnected) {
      // Add a small delay to avoid flickering during network transitions
      timeoutRef.current = setTimeout(() => {
        // Double-check that we're still not connected before showing
        setShowNoInternetSheet(true);
      }, 1500);
    } else {
      // Hide immediately when connection is restored (even if isInternetReachable is null/unknown)
      setShowNoInternetSheet(false);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [isConnected, isInternetReachable]);

  const handleRetryConnection = useCallback(() => {
    // Check connectivity again - hide if connected, even if isInternetReachable is null
    if (isConnected) {
      setShowNoInternetSheet(false);
    }
  }, [isConnected]);

  const handleDismissNoInternet = useCallback(() => {
    setShowNoInternetSheet(false);
  }, []);

  return (
    <NoInternetContext.Provider
      value={{
        showNoInternetSheet,
        setShowNoInternetSheet,
        handleRetryConnection,
        handleDismissNoInternet,
      }}
    >
      {children}
    </NoInternetContext.Provider>
  );
};

export const useNoInternet = () => {
  const context = useContext(NoInternetContext);
  if (context === undefined) {
    throw new Error('useNoInternet must be used within a NoInternetProvider');
  }
  return context;
};
