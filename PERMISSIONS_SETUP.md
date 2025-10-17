# Permissions System Setup

This document outlines the comprehensive permissions system implemented for the KDB app, which is crucial for upcoming features that depend on location and notification permissions.

## Overview

The permissions system is designed to be robust, user-friendly, and essential for core app functionality. It handles:

- **Location Permissions**: Required for finding nearby temples, navigation, family location features, and emergency services
- **Notification Permissions**: Required for event reminders, important announcements, and safety alerts

## Architecture

### 1. PermissionService (`src/services/PermissionService.ts`)

Central service for managing all permission-related operations:

```typescript
// Check permission status
const result = await PermissionService.checkLocationPermission();

// Request permission
const result = await PermissionService.requestLocationPermission();

// Check all critical permissions
const results = await PermissionService.checkAllCriticalPermissions();

// Show permission denied alert
PermissionService.showPermissionDeniedAlert('Location');
```

**Key Features:**
- Cross-platform permission handling (iOS/Android)
- Centralized permission constants
- Error handling and fallbacks
- Settings redirection for blocked permissions

### 2. usePermissions Hook (`src/hooks/usePermissions.ts`)

React hook for managing permission state in components:

```typescript
const {
  location,
  notifications,
  isLoading,
  allGranted,
  checkPermissions,
  requestLocation,
  requestNotifications,
  requestAll
} = usePermissions();
```

**Benefits:**
- Automatic permission checking on mount
- Reactive state updates
- Simplified permission requesting
- Loading state management

### 3. PermissionGuard Component (`src/components/PermissionGuard.tsx`)

Higher-order component for protecting screens that require permissions:

```typescript
<PermissionGuard requiredPermissions={['location', 'notifications']}>
  <YourProtectedComponent />
</PermissionGuard>
```

**Features:**
- Automatic redirection to permissions screen
- Custom fallback components
- Loading states
- Missing permission indicators

### 4. PermissionsScreen (`src/screens/main/PermissionsScreen.tsx`)

Dedicated screen for managing app permissions:

**Features:**
- Visual permission status indicators
- Detailed benefit explanations
- One-tap permission requesting
- Settings redirection for blocked permissions
- Comprehensive user education

## Implementation Details

### Platform-Specific Permissions

**iOS:**
- Location: `PERMISSIONS.IOS.LOCATION_WHEN_IN_USE`
- Notifications: `PERMISSIONS.IOS.NOTIFICATIONS`

**Android:**
- Location: `PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION`
- Notifications: `PERMISSIONS.ANDROID.POST_NOTIFICATIONS`

### Permission States

- `granted`: Permission is granted and ready to use
- `denied`: Permission was denied but can be requested again
- `blocked`: Permission was permanently denied (requires settings)
- `unavailable`: Permission is not available on this device
- `checking`: Permission status is being checked

### Error Handling

The system includes comprehensive error handling:

1. **Network/API errors**: Graceful fallbacks with user feedback
2. **Permission denied**: Clear explanations and settings redirection
3. **Device limitations**: Appropriate messaging for unavailable permissions
4. **Loading states**: Visual feedback during permission operations

## Usage Examples

### Basic Permission Checking

```typescript
import usePermissions from '../hooks/usePermissions';

const MyComponent = () => {
  const { location, notifications, allGranted } = usePermissions();
  
  if (!allGranted) {
    return <PermissionRequiredMessage />;
  }
  
  return <YourContent />;
};
```

### Requesting Permissions

```typescript
import PermissionService from '../services/PermissionService';

const requestLocation = async () => {
  const result = await PermissionService.requestLocationPermission();
  if (result.status === 'granted') {
    // Proceed with location-based features
  }
};
```

### Protecting Screens

```typescript
import PermissionGuard from '../components/PermissionGuard';

const LocationBasedScreen = () => (
  <PermissionGuard requiredPermissions={['location']}>
    <MapView />
    <LocationFeatures />
  </PermissionGuard>
);
```

## Navigation Integration

The permissions screen is accessible through:

1. **Menu Screen**: Direct access via "Permissions" option
2. **Automatic Redirection**: When required permissions are missing
3. **Programmatic Navigation**: `navigation.navigate('Permissions')`

## User Experience

### Permission Request Flow

1. **Initial Check**: App checks permissions on startup
2. **User Education**: Clear explanation of why permissions are needed
3. **One-Tap Granting**: Simple permission request process
4. **Settings Fallback**: Easy access to device settings if needed
5. **Status Feedback**: Clear visual indicators of permission status

### Visual Design

- **Status Icons**: Color-coded permission status indicators
- **Benefit Lists**: Clear explanations of what each permission enables
- **Action Buttons**: Prominent permission request buttons
- **Loading States**: Smooth transitions during permission operations

## Future Features Dependencies

This permissions system is essential for upcoming features:

### Location-Based Features
- Temple finder and navigation
- Family member location sharing
- Emergency location services
- Local event discovery
- Pilgrimage route guidance

### Notification Features
- Event reminders and updates
- Safety alerts and notifications
- Daily spiritual content
- Emergency notifications
- Push notifications for important announcements

## Best Practices

### For Developers

1. **Always check permissions** before using location or notification features
2. **Use the PermissionGuard** for screens that require permissions
3. **Handle permission states gracefully** with appropriate fallbacks
4. **Educate users** about why permissions are needed
5. **Provide alternatives** when permissions are denied

### For Users

1. **Grant permissions when prompted** for the best experience
2. **Enable notifications** to stay updated on important information
3. **Allow location access** for navigation and safety features
4. **Check app settings** if permissions seem to be missing

## Troubleshooting

### Common Issues

1. **Permissions not working**: Check device settings and app permissions
2. **Location not accurate**: Ensure location services are enabled
3. **Notifications not received**: Verify notification permissions and settings
4. **App crashes on permission request**: Check for proper error handling

### Debug Information

The system provides comprehensive logging for debugging:

```typescript
// Enable debug logging
console.log('Permission status:', await PermissionService.checkAllCriticalPermissions());
```

## Security and Privacy

- **Minimal permissions**: Only request permissions that are absolutely necessary
- **Clear explanations**: Users understand why each permission is needed
- **Data protection**: Location data is handled securely and not stored unnecessarily
- **User control**: Users can revoke permissions at any time through device settings

## Conclusion

This robust permissions system ensures that the KDB app can provide all its intended features while maintaining user trust and privacy. The system is designed to be user-friendly, developer-friendly, and future-proof for upcoming features that depend on location and notification access.
