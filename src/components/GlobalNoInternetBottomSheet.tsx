import React from 'react';
import { useNoInternet } from '../contexts/NoInternetContext';
import NoInternetBottomSheet from '../components/NoInternetBottomSheet';

const GlobalNoInternetBottomSheet: React.FC = () => {
  const { showNoInternetSheet, handleRetryConnection, handleDismissNoInternet } = useNoInternet();

  return (
    <NoInternetBottomSheet
      visible={showNoInternetSheet}
      onRetry={handleRetryConnection}
      onDismiss={handleDismissNoInternet}
    />
  );
};

export default GlobalNoInternetBottomSheet;
