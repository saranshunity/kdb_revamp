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

  // Show bottom sheet when internet is not available
  React.useEffect(() => {
    if (!isConnected || isInternetReachable === false) {
      setShowNoInternetSheet(true);
    } else if (isConnected && isInternetReachable === true) {
      setShowNoInternetSheet(false);
    }
  }, [isConnected, isInternetReachable]);

  const handleRetryConnection = useCallback(() => {
    // Check connectivity again
    if (isConnected && isInternetReachable === true) {
      setShowNoInternetSheet(false);
    }
  }, [isConnected, isInternetReachable]);

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
