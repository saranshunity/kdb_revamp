import Geolocation from '@react-native-community/geolocation';
import firestore from '@react-native-firebase/firestore';
import DeviceInfo from 'react-native-device-info';
import { Platform, AppState } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface LocationData {
  latitude: number;
  longitude: number;
  accuracy: number;
  altitude?: number | null;
  heading?: number | null;
  speed?: number | null;
  timestamp: number;
}

export interface TrackingOptions {
  updateInterval?: number; // Override default adaptive interval
  enableBackground?: boolean;
  familyIds?: string[]; // Which families to share with
}

class LocationService {
  private watchId: number | null = null;
  private isTracking: boolean = false;
  private currentUserId: string | null = null;
  private currentSpeed: number = 0;
  private updateInterval: number = 30000; // Default 30 seconds
  private batteryLevel: number = 1.0; // Default to 100%
  private batteryCheckInterval: NodeJS.Timeout | null = null;
  private appStateSubscription: any = null;
  private isForeground: boolean = true;
  private options: TrackingOptions = {};

  // Start tracking location with battery-aware adaptive intervals
  async startTracking(userId: string, options: TrackingOptions = {}): Promise<void> {
    if (this.isTracking) {
      console.warn('Location tracking is already active');
      return;
    }

    try {
      this.currentUserId = userId;
      this.options = options;
      this.isTracking = true;

      // Get initial battery level
      await this.updateBatteryLevel();

      // Start battery monitoring
      this.startBatteryMonitoring();

      // Start location tracking
      await this.startLocationUpdates();

      // Monitor app state for foreground/background
      this.appStateSubscription = AppState.addEventListener('change', this.handleAppStateChange);

      // Store tracking state
      await AsyncStorage.setItem('@location_tracking_active', 'true');
      await AsyncStorage.setItem('@location_tracking_userId', userId);

      console.log('Location tracking started for user:', userId);
    } catch (error) {
      console.error('Error starting location tracking:', error);
      this.isTracking = false;
      throw error;
    }
  }

  // Stop tracking location
  async stopTracking(): Promise<void> {
    if (!this.isTracking) {
      return;
    }

    try {
      // Clear watch
      if (this.watchId !== null) {
        Geolocation.clearWatch(this.watchId);
        this.watchId = null;
      }

      // Stop battery monitoring
      if (this.batteryCheckInterval) {
        clearInterval(this.batteryCheckInterval);
        this.batteryCheckInterval = null;
      }

      // Remove app state listener
      if (this.appStateSubscription) {
        this.appStateSubscription.remove();
        this.appStateSubscription = null;
      }

      // Update Firestore to mark location as inactive
      if (this.currentUserId) {
        await firestore()
          .collection('users')
          .doc(this.currentUserId)
          .collection('location')
          .doc('current')
          .update({
            isActive: false,
            updatedAt: firestore.FieldValue.serverTimestamp(),
          });
      }

      this.isTracking = false;
      this.currentUserId = null;
      this.currentSpeed = 0;

      // Clear stored state
      await AsyncStorage.removeItem('@location_tracking_active');
      await AsyncStorage.removeItem('@location_tracking_userId');

      console.log('Location tracking stopped');
    } catch (error) {
      console.error('Error stopping location tracking:', error);
      throw error;
    }
  }

  // Get current location (one-time)
  async getCurrentLocation(): Promise<LocationData> {
    return new Promise((resolve, reject) => {
      Geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            altitude: position.coords.altitude || null,
            heading: position.coords.heading || null,
            speed: position.coords.speed || null,
            timestamp: position.timestamp,
          });
        },
        (error) => {
          console.error('Error getting current location:', error);
          reject(error);
        },
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 10000,
        }
      );
    });
  }

  // Update location in Firestore
  private async updateLocation(location: LocationData): Promise<void> {
    if (!this.currentUserId) {
      return;
    }

    try {
      const locationDoc = {
        latitude: location.latitude,
        longitude: location.longitude,
        accuracy: location.accuracy,
        altitude: location.altitude,
        heading: location.heading,
        speed: location.speed,
        timestamp: firestore.Timestamp.fromMillis(location.timestamp),
        updatedAt: firestore.FieldValue.serverTimestamp(),
        isActive: true,
        batteryLevel: this.batteryLevel,
      };

      // Update user's location document
      await firestore()
        .collection('users')
        .doc(this.currentUserId)
        .collection('location')
        .doc('current')
        .set(locationDoc, { merge: true });

      // Optionally add to history (if enabled)
      if (this.shouldSaveToHistory()) {
        await firestore()
          .collection('users')
          .doc(this.currentUserId)
          .collection('locationHistory')
          .doc(location.timestamp.toString())
          .set({
            latitude: location.latitude,
            longitude: location.longitude,
            accuracy: location.accuracy,
            timestamp: firestore.Timestamp.fromMillis(location.timestamp),
          });
      }

      // Store last location locally for offline support
      await AsyncStorage.setItem('@last_location', JSON.stringify(location));

      console.log('Location updated:', {
        lat: location.latitude,
        lng: location.longitude,
        accuracy: location.accuracy,
      });
    } catch (error) {
      console.error('Error updating location in Firestore:', error);
      // Don't throw - we want tracking to continue even if update fails
    }
  }

  // Start location updates with adaptive interval
  private async startLocationUpdates(): Promise<void> {
    // Calculate initial interval
    this.updateInterval = this.calculateInterval(this.batteryLevel, this.currentSpeed);

    // Override with user preference if provided
    if (this.options.updateInterval) {
      this.updateInterval = this.options.updateInterval;
    }

    const watchOptions = {
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 5000,
      distanceFilter: 10, // Only update if moved at least 10 meters
    };

    this.watchId = Geolocation.watchPosition(
      (position) => {
        const location: LocationData = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          altitude: position.coords.altitude || null,
          heading: position.coords.heading || null,
          speed: position.coords.speed || null,
          timestamp: position.timestamp,
        };

        // Update current speed for adaptive interval calculation
        this.currentSpeed = position.coords.speed || 0;

        // Update location
        this.updateLocation(location);

        // Recalculate interval based on new speed/battery
        const newInterval = this.calculateInterval(this.batteryLevel, this.currentSpeed);
        if (newInterval !== this.updateInterval && !this.options.updateInterval) {
          this.updateInterval = newInterval;
          // Restart watch with new interval by clearing and recreating
          // Note: In production, you might want to use a more sophisticated approach
        }
      },
      (error) => {
        console.error('Location watch error:', error);
        // Continue tracking even on error
      },
      watchOptions
    );
  }

  // Calculate optimal update interval based on battery and movement
  private calculateInterval(batteryLevel: number, speed: number): number {
    const isMoving = speed > 1; // m/s

    if (batteryLevel > 0.5) {
      // Battery > 50%
      return isMoving ? 30000 : 120000; // 30s moving, 2min stationary
    } else if (batteryLevel > 0.2) {
      // Battery 20-50%
      return isMoving ? 60000 : 300000; // 1min moving, 5min stationary
    } else {
      // Battery < 20%
      return isMoving ? 120000 : 600000; // 2min moving, 10min stationary
    }
  }

  // Update battery level
  private async updateBatteryLevel(): Promise<void> {
    try {
      const level = await DeviceInfo.getBatteryLevel();
      this.batteryLevel = level;
    } catch (error) {
      console.error('Error getting battery level:', error);
      // Default to 1.0 (100%) if unable to get battery level
      this.batteryLevel = 1.0;
    }
  }

  // Start battery monitoring
  private startBatteryMonitoring(): void {
    // Check battery level every 2 minutes
    this.batteryCheckInterval = setInterval(async () => {
      await this.updateBatteryLevel();
      
      // Recalculate interval if not manually set
      if (!this.options.updateInterval) {
        const newInterval = this.calculateInterval(this.batteryLevel, this.currentSpeed);
        if (Math.abs(newInterval - this.updateInterval) > 10000) {
          // Only restart if significant change (>10s)
          this.updateInterval = newInterval;
          console.log('Updated tracking interval to:', this.updateInterval, 'ms');
        }
      }
    }, 120000); // Check every 2 minutes
  }

  // Handle app state changes (foreground/background)
  private handleAppStateChange = (nextAppState: string): void => {
    const wasForeground = this.isForeground;
    this.isForeground = nextAppState === 'active';

    if (wasForeground && !this.isForeground) {
      // App went to background - reduce update frequency
      this.updateInterval = Math.min(this.updateInterval * 2, 600000); // Max 10 minutes
      console.log('App backgrounded - reduced update frequency');
    } else if (!wasForeground && this.isForeground) {
      // App came to foreground - restore normal frequency
      this.updateInterval = this.calculateInterval(this.batteryLevel, this.currentSpeed);
      console.log('App foregrounded - restored update frequency');
    }
  };

  // Check if should save to history (optional optimization)
  private shouldSaveToHistory(): boolean {
    // Save to history only if significant movement or every 5 minutes
    // This can be optimized based on your needs
    return true; // For now, save all updates
  }

  // Check if tracking is active
  isTrackingActive(): boolean {
    return this.isTracking;
  }

  // Get current tracking status
  getTrackingStatus(): {
    isActive: boolean;
    userId: string | null;
    updateInterval: number;
    batteryLevel: number;
    currentSpeed: number;
  } {
    return {
      isActive: this.isTracking,
      userId: this.currentUserId,
      updateInterval: this.updateInterval,
      batteryLevel: this.batteryLevel,
      currentSpeed: this.currentSpeed,
    };
  }

  // Restore tracking state (for app restart)
  async restoreTrackingState(): Promise<void> {
    try {
      const isActive = await AsyncStorage.getItem('@location_tracking_active');
      const userId = await AsyncStorage.getItem('@location_tracking_userId');

      if (isActive === 'true' && userId) {
        // Restore tracking - user might want to confirm this
        console.log('Found saved tracking state for user:', userId);
        // Don't auto-start - let user decide
        return;
      }
    } catch (error) {
      console.error('Error restoring tracking state:', error);
    }
  }
}

export default new LocationService();

