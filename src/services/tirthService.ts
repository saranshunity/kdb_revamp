import AsyncStorage from '@react-native-async-storage/async-storage';
import firestore from '@react-native-firebase/firestore';
import { Tirth, TirthSearchParams } from '../types/tirth';

const TIRTHS_STORAGE_KEY = 'tirths_data';
const LAST_SYNC_KEY = 'tirths_last_sync';
const FIRST_LAUNCH_KEY = 'tirths_first_launch';
const SYNC_INTERVAL = 24 * 60 * 60 * 1000; // 24 hours

class TirthService {
  private static instance: TirthService;
  private isOnline: boolean = true;

  static getInstance(): TirthService {
    if (!TirthService.instance) {
      TirthService.instance = new TirthService();
    }
    return TirthService.instance;
  }

  // Check if this is the first launch
  async isFirstLaunch(): Promise<boolean> {
    try {
      const firstLaunch = await AsyncStorage.getItem(FIRST_LAUNCH_KEY);
      return firstLaunch === null;
    } catch (error) {
      console.error('Error checking first launch:', error);
      return true;
    }
  }

  // Mark first launch as completed
  async markFirstLaunchComplete(): Promise<void> {
    try {
      await AsyncStorage.setItem(FIRST_LAUNCH_KEY, 'false');
    } catch (error) {
      console.error('Error marking first launch complete:', error);
    }
  }

  // Check if data needs sync
  async needsSync(): Promise<boolean> {
    try {
      const isFirst = await this.isFirstLaunch();
      if (isFirst) return true; // Always sync on first launch
      
      const lastSync = await AsyncStorage.getItem(LAST_SYNC_KEY);
      if (!lastSync) return true;
      
      const lastSyncTime = parseInt(lastSync);
      const now = Date.now();
      return (now - lastSyncTime) > SYNC_INTERVAL;
    } catch (error) {
      console.error('Error checking sync status:', error);
      return true;
    }
  }

  // Sync data from Firebase to local storage
  async syncFromFirebase(): Promise<void> {
    try {
      const isFirstLaunch = await this.isFirstLaunch();
      console.log(isFirstLaunch ? 'First launch: Downloading all tirths...' : 'Syncing tirths data from Firebase...');
      
      const snapshot = await firestore()
        .collection('tirths')
        .where('isActive', '==', true)
        .get();

      const tirths: Tirth[] = [];
      snapshot.forEach(doc => {
        const data = doc.data();
        tirths.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
          lastSyncedAt: new Date(),
        } as Tirth);
      });

      // Store in local storage
      await AsyncStorage.setItem(TIRTHS_STORAGE_KEY, JSON.stringify(tirths));
      await AsyncStorage.setItem(LAST_SYNC_KEY, Date.now().toString());
      
      // Mark first launch as complete
      if (isFirstLaunch) {
        await this.markFirstLaunchComplete();
        console.log(`✅ First launch complete: Downloaded ${tirths.length} tirths to device memory`);
      } else {
        console.log(`✅ Synced ${tirths.length} tirths to local storage`);
      }
    } catch (error) {
      console.error('Error syncing from Firebase:', error);
      throw error;
    }
  }

  // Get all tirths from local storage
  async getLocalTirths(): Promise<Tirth[]> {
    try {
      const data = await AsyncStorage.getItem(TIRTHS_STORAGE_KEY);
      if (!data) return [];
      
      const tirths = JSON.parse(data);
      return tirths.map((tirth: any) => ({
        ...tirth,
        createdAt: new Date(tirth.createdAt),
        updatedAt: new Date(tirth.updatedAt),
        lastSyncedAt: tirth.lastSyncedAt ? new Date(tirth.lastSyncedAt) : undefined,
      }));
    } catch (error) {
      console.error('Error getting local tirths:', error);
      return [];
    }
  }

  // Get tirths with automatic sync
  async getTirths(): Promise<Tirth[]> {
    try {
      const isFirstLaunch = await this.isFirstLaunch();
      
      // On first launch, always try to download from Firebase
      if (isFirstLaunch && this.isOnline) {
        try {
          console.log('🔄 First time opening 48 Kos tab - downloading all 182 tirths...');
          await this.syncFromFirebase();
          console.log('✅ All tirths downloaded successfully to device memory');
        } catch (error) {
          console.error('❌ Failed to download tirths on first launch:', error);
          throw new Error('Failed to download tirths data. Please check your internet connection and try again.');
        }
      } else if (!isFirstLaunch) {
        // For subsequent launches, check if we need periodic sync
        const needsSync = await this.needsSync();
        
        if (needsSync && this.isOnline) {
          try {
            console.log('🔄 Periodic sync - checking for updates...');
            await this.syncFromFirebase();
          } catch (error) {
            console.warn('⚠️ Sync failed, using local data:', error);
          }
        } else {
          console.log('📱 Using local data (offline mode)');
        }
      }

      // Return local data
      const localTirths = await this.getLocalTirths();
      console.log(`📊 Loaded ${localTirths.length} tirths from local storage`);
      return localTirths;
    } catch (error) {
      console.error('Error getting tirths:', error);
      throw error;
    }
  }

  // Search tirths
  async searchTirths(params: TirthSearchParams): Promise<Tirth[]> {
    try {
      const tirths = await this.getTirths();
      let filtered = tirths;

      // Apply text search
      if (params.query) {
        const query = params.query.toLowerCase();
        filtered = filtered.filter(tirth => 
          tirth.name.toLowerCase().includes(query) ||
          tirth.description.toLowerCase().includes(query) ||
          tirth.location.city.toLowerCase().includes(query) ||
          tirth.location.state.toLowerCase().includes(query) ||
          tirth.tags.some(tag => tag.toLowerCase().includes(query))
        );
      }

      // Apply filters
      if (params.filters.category) {
        filtered = filtered.filter(tirth => tirth.category === params.filters.category);
      }
      if (params.filters.city) {
        filtered = filtered.filter(tirth => 
          tirth.location.city.toLowerCase().includes(params.filters.city!.toLowerCase())
        );
      }
      if (params.filters.state) {
        filtered = filtered.filter(tirth => 
          tirth.location.state.toLowerCase().includes(params.filters.state!.toLowerCase())
        );
      }
      if (params.filters.tags && params.filters.tags.length > 0) {
        filtered = filtered.filter(tirth => 
          params.filters.tags!.some(tag => tirth.tags.includes(tag))
        );
      }

      // Apply sorting
      filtered.sort((a, b) => {
        let comparison = 0;
        switch (params.sortBy) {
          case 'name':
            comparison = a.name.localeCompare(b.name);
            break;
          case 'distance':
            // For now, just sort by name (distance calculation would need user location)
            comparison = a.name.localeCompare(b.name);
            break;
          case 'relevance':
            // For now, just sort by name
            comparison = a.name.localeCompare(b.name);
            break;
        }
        return params.sortOrder === 'desc' ? -comparison : comparison;
      });

      return filtered;
    } catch (error) {
      console.error('Error searching tirths:', error);
      return [];
    }
  }

  // Get tirth by ID
  async getTirthById(id: string): Promise<Tirth | null> {
    try {
      const tirths = await this.getTirths();
      return tirths.find(tirth => tirth.id === id) || null;
    } catch (error) {
      console.error('Error getting tirth by ID:', error);
      return null;
    }
  }

  // Get categories
  async getCategories(): Promise<string[]> {
    try {
      const tirths = await this.getTirths();
      const categories = [...new Set(tirths.map(tirth => tirth.category))];
      return categories.sort();
    } catch (error) {
      console.error('Error getting categories:', error);
      return [];
    }
  }

  // Get cities
  async getCities(): Promise<string[]> {
    try {
      const tirths = await this.getTirths();
      const cities = [...new Set(tirths.map(tirth => tirth.location.city))];
      return cities.sort();
    } catch (error) {
      console.error('Error getting cities:', error);
      return [];
    }
  }

  // Get states
  async getStates(): Promise<string[]> {
    try {
      const tirths = await this.getTirths();
      const states = [...new Set(tirths.map(tirth => tirth.location.state))];
      return states.sort();
    } catch (error) {
      console.error('Error getting states:', error);
      return [];
    }
  }

  // Get all tags
  async getTags(): Promise<string[]> {
    try {
      const tirths = await this.getTirths();
      const tags = [...new Set(tirths.flatMap(tirth => tirth.tags))];
      return tags.sort();
    } catch (error) {
      console.error('Error getting tags:', error);
      return [];
    }
  }

  // Force sync
  async forceSync(): Promise<void> {
    try {
      await this.syncFromFirebase();
    } catch (error) {
      console.error('Error in force sync:', error);
      throw error;
    }
  }

  // Clear local data (for testing)
  async clearLocalData(): Promise<void> {
    try {
      await AsyncStorage.removeItem(TIRTHS_STORAGE_KEY);
      await AsyncStorage.removeItem(LAST_SYNC_KEY);
      await AsyncStorage.removeItem(FIRST_LAUNCH_KEY);
      console.log('✅ Local tirths data cleared');
    } catch (error) {
      console.error('Error clearing local data:', error);
    }
  }

  // Reset first launch flag (for testing)
  async resetFirstLaunch(): Promise<void> {
    try {
      await AsyncStorage.removeItem(FIRST_LAUNCH_KEY);
      console.log('✅ First launch flag reset');
    } catch (error) {
      console.error('Error resetting first launch flag:', error);
    }
  }

  // Set online status
  setOnlineStatus(isOnline: boolean): void {
    this.isOnline = isOnline;
  }
}

export default TirthService;
