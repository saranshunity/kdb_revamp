import { createNavigationContainerRef } from '@react-navigation/native';
import type { RootStackParamList } from './AppNavigator';

export const navigationRef = createNavigationContainerRef<RootStackParamList>();

let pendingNavigation: (() => void) | null = null;

export function navigateWhenReady<T extends keyof RootStackParamList>(
  name: T,
  params?: RootStackParamList[T],
) {
  const action = () => navigationRef.navigate(name as never, params as never);
  if (navigationRef.isReady()) {
    action();
  } else {
    pendingNavigation = action;
  }
}

export function flushNavigationQueue() {
  if (pendingNavigation && navigationRef.isReady()) {
    pendingNavigation();
    pendingNavigation = null;
  }
}

