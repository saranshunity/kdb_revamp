import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import DeviceInfo from 'react-native-device-info';
import { AppMetadata } from '../types/metadata';

const METADATA_CACHE_KEY = 'app_metadata_cache';
const METADATA_CACHE_EXPIRY = 5 * 60 * 1000; // 5 minutes in milliseconds - reduced for more frequent updates

// Firebase Storage URL for metadata.json (public access)
const METADATA_STORAGE_URL = 'https://firebasestorage.googleapis.com/v0/b/kdbrevampnew.firebasestorage.app/o/metadata.json?alt=media';

interface CachedMetadata {
  data: AppMetadata;
  timestamp: number;
}

class MetadataService {
  private metadata: AppMetadata | null = null;
  private lastFetchTime: number = 0;

  /**
   * Fetch metadata from Firebase Storage with caching
   * @param forceRefresh - Force fetch from server, ignoring cache
   */
  async fetchMetadata(forceRefresh: boolean = false): Promise<AppMetadata | null> {
    try {
      // Check cache first (unless forcing refresh)
      if (!forceRefresh) {
        const cachedData = await this.getCachedMetadata();
        if (cachedData && !this.isCacheExpired(cachedData.timestamp)) {
          console.log('📦 Using cached metadata (expires in:', Math.round((METADATA_CACHE_EXPIRY - (Date.now() - cachedData.timestamp)) / 1000 / 60), 'minutes)');
          this.metadata = cachedData.data;
          this.lastFetchTime = cachedData.timestamp;
          return cachedData.data;
        }
      }

      // Fetch from Firebase Storage
      const response = await fetch(METADATA_STORAGE_URL);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch metadata: ${response.statusText}`);
      }

      const metadataData = await response.json() as AppMetadata;
      
      // Cache the metadata
      await this.cacheMetadata(metadataData);
      
      this.metadata = metadataData;
      this.lastFetchTime = Date.now();
      
      console.log('Metadata fetched successfully from Storage');
      return metadataData;
    } catch (error) {
      console.error('Error fetching metadata:', error);
      // Return cached data if available
      const cachedData = await this.getCachedMetadata();
      if (cachedData) {
        return cachedData.data;
      }
      // Return default metadata as fallback
      return this.getDefaultMetadata();
    }
  }

  /**
   * Check if update is required
   */
  async checkForUpdate(): Promise<boolean> {
    const metadata = await this.fetchMetadata();
    if (!metadata) return false;

    const currentVersion = DeviceInfo.getVersion();
    const minimumVersion = metadata.version;

    return this.compareVersions(currentVersion, minimumVersion) < 0;
  }

  /**
   * Get current metadata (from memory or cache)
   */
  getMetadata(): AppMetadata | null {
    return this.metadata;
  }

  /**
   * Check if app is in maintenance mode
   */
  async isMaintenanceMode(): Promise<boolean> {
    const metadata = await this.fetchMetadata();
    return metadata?.maintenanceMode || false;
  }

  /**
   * Get active announcements
   */
  async getActiveAnnouncements(): Promise<AppMetadata['announcements']> {
    const metadata = await this.fetchMetadata();
    if (!metadata) return [];

    const now = new Date().toISOString();
    return metadata.announcements.filter(
      announcement => 
        announcement.startDate <= now && 
        announcement.endDate >= now
    );
  }

  /**
   * Get feature status
   */
  async isFeatureEnabled(feature: keyof AppMetadata['features']): Promise<boolean> {
    const metadata = await this.fetchMetadata();
    return metadata?.features[feature]?.enabled || false;
  }

  /**
   * Clear metadata cache
   */
  async clearCache(): Promise<void> {
    try {
      await AsyncStorage.removeItem(METADATA_CACHE_KEY);
      this.metadata = null;
      this.lastFetchTime = 0;
    } catch (error) {
      console.error('Error clearing metadata cache:', error);
    }
  }

  /**
   * Get cached metadata
   */
  private async getCachedMetadata(): Promise<CachedMetadata | null> {
    try {
      const cachedData = await AsyncStorage.getItem(METADATA_CACHE_KEY);
      if (cachedData) {
        return JSON.parse(cachedData);
      }
    } catch (error) {
      console.error('Error reading cached metadata:', error);
    }
    return null;
  }

  /**
   * Cache metadata
   */
  private async cacheMetadata(metadata: AppMetadata): Promise<void> {
    try {
      const cacheData: CachedMetadata = {
        data: metadata,
        timestamp: Date.now(),
      };
      await AsyncStorage.setItem(METADATA_CACHE_KEY, JSON.stringify(cacheData));
    } catch (error) {
      console.error('Error caching metadata:', error);
    }
  }

  /**
   * Check if cache is expired
   */
  private isCacheExpired(timestamp: number): boolean {
    return Date.now() - timestamp > METADATA_CACHE_EXPIRY;
  }

  /**
   * Compare two version strings
   * Returns: -1 if v1 < v2, 0 if equal, 1 if v1 > v2
   */
  compareVersions(v1: string, v2: string): number {
    const v1Parts = v1.split('.').map(Number);
    const v2Parts = v2.split('.').map(Number);

    const maxLength = Math.max(v1Parts.length, v2Parts.length);

    for (let i = 0; i < maxLength; i++) {
      const v1Part = v1Parts[i] || 0;
      const v2Part = v2Parts[i] || 0;

      if (v1Part < v2Part) return -1;
      if (v1Part > v2Part) return 1;
    }

    return 0;
  }

  /**
   * Get default metadata as fallback
   */
  private getDefaultMetadata(): AppMetadata {
    return {
      version: DeviceInfo.getVersion(),
      updateRequired: false,
      updateMessage: 'Please update to the latest version for the best experience.',
      updateTitle: 'Update Available',
      maintenanceMode: false,
      features: {
        tirthMitra: {
          enabled: true,
          version: '1.0.0',
        },
        stalls: {
          enabled: true,
          version: '1.0.0',
        },
        events: {
          enabled: true,
          version: '1.0.0',
        },
        locateMembers: {
          enabled: true,
          version: '1.0.0',
        },
        applyStallsShops: {
          enabled: true,
          version: '1.0.0',
        },
        adminPanel: {
          enabled: true,
          version: '1.0.0',
        },
      },
      announcements: [],
      lastUpdated: new Date().toISOString(),
      liveStreamingLink: 'https://internationalgitamahotsav.in/igm-2025/#live-streaming',
    };
  }
}

export default new MetadataService();
