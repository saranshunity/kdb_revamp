import { useState, useEffect } from 'react';
import NetInfo from '@react-native-community/netinfo';

interface ConnectivityState {
  isConnected: boolean;
  isInternetReachable: boolean | null;
  connectionType: string | null;
}

export const useConnectivity = () => {
  const [connectivity, setConnectivity] = useState<ConnectivityState>({
    isConnected: true,
    isInternetReachable: true,
    connectionType: null,
  });

  useEffect(() => {
    // Get initial state
    NetInfo.fetch().then(state => {
      setConnectivity({
        isConnected: state.isConnected ?? false,
        isInternetReachable: state.isInternetReachable,
        connectionType: state.type,
      });
    });

    // Subscribe to connectivity changes
    const unsubscribe = NetInfo.addEventListener(state => {
      setConnectivity({
        isConnected: state.isConnected ?? false,
        isInternetReachable: state.isInternetReachable,
        connectionType: state.type,
      });
    });

    return () => unsubscribe();
  }, []);

  return connectivity;
};

export default useConnectivity;
