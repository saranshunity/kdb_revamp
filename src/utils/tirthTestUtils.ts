import TirthService from '../services/tirthService';

/**
 * Test utilities for Tirths functionality
 * Use these functions to test the first launch behavior
 */

export const TirthTestUtils = {
  // Reset the app to simulate first launch
  async resetToFirstLaunch(): Promise<void> {
    const tirthService = TirthService.getInstance();
    await tirthService.resetFirstLaunch();
    console.log('🔄 App reset to first launch state');
  },

  // Clear all local data
  async clearAllData(): Promise<void> {
    const tirthService = TirthService.getInstance();
    await tirthService.clearLocalData();
    console.log('🗑️ All local tirths data cleared');
  },

  // Check current sync status
  async getSyncStatus(): Promise<{
    isFirstLaunch: boolean;
    hasLocalData: boolean;
    lastSyncTime: string | null;
  }> {
    const tirthService = TirthService.getInstance();
    const isFirstLaunch = await tirthService.isFirstLaunch();
    const localTirths = await tirthService.getLocalTirths();
    
    return {
      isFirstLaunch,
      hasLocalData: localTirths.length > 0,
      lastSyncTime: null, // You can add this to the service if needed
    };
  },

  // Simulate offline mode
  setOfflineMode(): void {
    const tirthService = TirthService.getInstance();
    tirthService.setOnlineStatus(false);
    console.log('📱 App set to offline mode');
  },

  // Simulate online mode
  setOnlineMode(): void {
    const tirthService = TirthService.getInstance();
    tirthService.setOnlineStatus(true);
    console.log('🌐 App set to online mode');
  },
};

// Export for easy access in development
export default TirthTestUtils;
