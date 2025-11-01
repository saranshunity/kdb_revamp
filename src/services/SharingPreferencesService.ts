import firestore from '@react-native-firebase/firestore';

export interface SharingPreferences {
  shareWithFamilies: string[]; // Array of familyIds
  defaultVisibility: 'all' | 'selected' | 'none';
  sharingSchedule?: {
    enabled: boolean;
    startTime: string; // "09:00"
    endTime: string; // "22:00"
  };
  locationUpdateInterval?: number; // seconds
}

class SharingPreferencesService {
  private getPreferencesRef(userId: string) {
    return firestore().collection('users').doc(userId).collection('sharingPreferences').doc('settings');
  }

  // Update sharing preferences
  async updatePreferences(userId: string, preferences: Partial<SharingPreferences>): Promise<void> {
    try {
      await this.getPreferencesRef(userId).set(
        {
          ...preferences,
          updatedAt: firestore.FieldValue.serverTimestamp(),
        },
        { merge: true }
      );

      console.log('Sharing preferences updated for user:', userId);
    } catch (error) {
      console.error('Error updating sharing preferences:', error);
      throw error;
    }
  }

  // Get preferences
  async getPreferences(userId: string): Promise<SharingPreferences> {
    try {
      const doc = await this.getPreferencesRef(userId).get();

      if (doc.exists) {
        const data = doc.data();
        return {
          shareWithFamilies: data?.shareWithFamilies || [],
          defaultVisibility: data?.defaultVisibility || 'all',
          sharingSchedule: data?.sharingSchedule,
          locationUpdateInterval: data?.locationUpdateInterval,
        };
      }

      // Return default preferences
      return {
        shareWithFamilies: [],
        defaultVisibility: 'all',
      };
    } catch (error) {
      console.error('Error getting sharing preferences:', error);
      throw error;
    }
  }

  // Check if user is sharing with family
  async isSharingWithFamily(userId: string, familyId: string): Promise<boolean> {
    try {
      const preferences = await this.getPreferences(userId);
      return preferences.shareWithFamilies.includes(familyId);
    } catch (error) {
      console.error('Error checking sharing status:', error);
      return false;
    }
  }

  // Add family to sharing list
  async addSharingFamily(userId: string, familyId: string): Promise<void> {
    try {
      const preferences = await this.getPreferences(userId);
      const updatedFamilies = [...new Set([...preferences.shareWithFamilies, familyId])];

      await this.updatePreferences(userId, {
        shareWithFamilies: updatedFamilies,
      });
    } catch (error) {
      console.error('Error adding sharing family:', error);
      throw error;
    }
  }

  // Remove family from sharing list
  async removeSharingFamily(userId: string, familyId: string): Promise<void> {
    try {
      const preferences = await this.getPreferences(userId);
      const updatedFamilies = preferences.shareWithFamilies.filter((id) => id !== familyId);

      await this.updatePreferences(userId, {
        shareWithFamilies: updatedFamilies,
      });
    } catch (error) {
      console.error('Error removing sharing family:', error);
      throw error;
    }
  }

  // Pause/resume sharing
  async setSharingEnabled(userId: string, enabled: boolean): Promise<void> {
    try {
      await this.updatePreferences(userId, {
        defaultVisibility: enabled ? 'all' : 'none',
      });

      // Also update location document
      await firestore()
        .collection('users')
        .doc(userId)
        .collection('location')
        .doc('current')
        .update({
          isActive: enabled,
          updatedAt: firestore.FieldValue.serverTimestamp(),
        });
    } catch (error) {
      console.error('Error setting sharing enabled:', error);
      throw error;
    }
  }

  // Check if sharing is currently enabled (considering schedule)
  async isSharingCurrentlyEnabled(userId: string): Promise<boolean> {
    try {
      const preferences = await this.getPreferences(userId);

      if (preferences.defaultVisibility === 'none') {
        return false;
      }

      // Check schedule if enabled
      if (preferences.sharingSchedule?.enabled) {
        const now = new Date();
        const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
        const startTime = preferences.sharingSchedule.startTime;
        const endTime = preferences.sharingSchedule.endTime;

        // Simple time comparison (can be improved)
        if (currentTime < startTime || currentTime > endTime) {
          return false;
        }
      }

      return true;
    } catch (error) {
      console.error('Error checking sharing enabled:', error);
      return false;
    }
  }

  // Set sharing schedule
  async setSharingSchedule(
    userId: string,
    schedule: { enabled: boolean; startTime: string; endTime: string }
  ): Promise<void> {
    try {
      await this.updatePreferences(userId, {
        sharingSchedule: schedule,
      });
    } catch (error) {
      console.error('Error setting sharing schedule:', error);
      throw error;
    }
  }

  // Set location update interval preference
  async setLocationUpdateInterval(userId: string, intervalSeconds: number): Promise<void> {
    try {
      await this.updatePreferences(userId, {
        locationUpdateInterval: intervalSeconds,
      });
    } catch (error) {
      console.error('Error setting location update interval:', error);
      throw error;
    }
  }
}

export default new SharingPreferencesService();

